import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, Scale, FileText, Calendar, TrendingUp, CheckCircle, Eye, Clock, Utensils } from "lucide-react";
import MealDetailsDialog from "@/components/nutrition/MealDetailsDialog";
import { NutritionPlanDialog } from "@/components/nutrition/NutritionPlanDialog";
import { MealHistoryDialog } from "@/components/nutrition/MealHistoryDialog";
import { ClientNutritionPlan } from "@/components/ClientNutritionPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  observations: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  calories?: number;
}

interface DayMeal {
  id: string;
  name: string;
  type: string;
  time: string;
  calories: number;
  completed: boolean;
  foods: FoodItem[];
}

const NutritionSection = () => {
  const { user } = useAuth();
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<DayMeal | null>(null);
  const [showNutritionPlan, setShowNutritionPlan] = useState(false);
  const [showMealHistory, setShowMealHistory] = useState(false);
  const [todayMeals, setTodayMeals] = useState<DayMeal[]>([]);
  const [completedMeals, setCompletedMeals] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const nutritionServices = [
    {
      title: "Medidas",
      description: "Acompanhamento de medidas corporais e progresso",
      icon: Scale,
      status: "Disponível"
    },
    {
      title: "Plano Alimentar", 
      description: "Dieta personalizada baseada em seus objetivos",
      icon: FileText,
      status: "Disponível"
    },
    {
      title: "Acompanhamento",
      description: "Consultas regulares para ajustar sua dieta",
      icon: Calendar,
      status: "Mensal"
    }
  ];

  // Carregar refeições do plano nutricional ativo
  useEffect(() => {
    const loadTodayMeals = async () => {
      if (!user) return;

      try {
        const { data: planData, error: planError } = await supabase
          .from('nutrition_plans')
          .select('meals, daily_calories')
          .eq('client_id', user.id)
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (planError && planError.code !== 'PGRST116') throw planError;

        if (planData && planData.meals) {
          const meals = Array.isArray(planData.meals) ? (planData.meals as unknown as Meal[]) : [];
          
          // Calcular calorias estimadas por refeição
          const totalCalories = planData.daily_calories || 2000;
          const caloriesPerMeal = Math.round(totalCalories / Math.max(meals.length, 1));
          
          const transformedMeals: DayMeal[] = meals.map((meal) => ({
            id: meal.id,
            name: meal.name,
            type: meal.name.toLowerCase().replace(/\s/g, '_'),
            time: meal.time,
            calories: meal.calories || caloriesPerMeal,
            completed: completedMeals.has(meal.id),
            foods: meal.foods || []
          }));

          setTodayMeals(transformedMeals);
        } else {
          // Plano padrão caso não tenha plano ativo
          setTodayMeals([
            { id: "1", name: "Café da Manhã", type: "cafe_da_manha", time: "07:00", calories: 350, completed: false, foods: [] },
            { id: "2", name: "Lanche da Manhã", type: "lanche_da_manha", time: "10:00", calories: 150, completed: false, foods: [] },
            { id: "3", name: "Almoço", type: "almoco", time: "12:30", calories: 450, completed: false, foods: [] },
            { id: "4", name: "Lanche da Tarde", type: "lanche_da_tarde", time: "15:30", calories: 200, completed: false, foods: [] },
            { id: "5", name: "Jantar", type: "jantar", time: "19:00", calories: 400, completed: false, foods: [] },
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar refeições:', error);
        toast.error('Erro ao carregar refeições do plano');
      } finally {
        setLoading(false);
      }
    };

    loadTodayMeals();

    // Setup realtime subscription para planos nutricionais
    if (user) {
      const channel = supabase
        .channel('nutrition_plans_updates_meals')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'nutrition_plans',
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            toast.success('Suas refeições foram atualizadas!');
            loadTodayMeals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, completedMeals]);

  const handleMealClick = (meal: DayMeal) => {
    setSelectedMeal(meal);
    setSelectedMealType(meal.type);
    setShowMealDialog(true);
  };

  const handleMarkMeal = (mealId: string) => {
    setCompletedMeals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
        toast.success('Refeição desmarcada');
      } else {
        newSet.add(mealId);
        toast.success('Refeição marcada como consumida');
      }
      return newSet;
    });
  };

  const handleServiceClick = (serviceTitle: string) => {
    switch (serviceTitle) {
      case "Medidas":
        // Navegar para aba de medidas
        const event = new CustomEvent('navigate-to-tab', { detail: 'measurements' });
        window.dispatchEvent(event);
        break;
      case "Plano Alimentar":
        setShowNutritionPlan(true);
        break;
      case "Acompanhamento":
        setShowMealHistory(true);
        break;
    }
  };

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const completedCalories = todayMeals.filter(meal => completedMeals.has(meal.id))
    .reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Apple className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Nutrição</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Alimentação equilibrada para uma vida mais saudável
        </p>
      </div>

      {/* Plano Nutricional do Profissional */}
      <ClientNutritionPlan />

      {/* Resumo nutricional do dia */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Hoje</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedCalories}/{totalCalories}</p>
            <p className="text-sm text-muted-foreground">Calorias</p>
          </div>
        </div>
        
        <div className="w-full bg-secondary rounded-full h-3 mb-4">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300" 
            style={{ width: `${(completedCalories / totalCalories) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">65g</p>
            <p className="text-sm text-muted-foreground">Proteínas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">180g</p>
            <p className="text-sm text-muted-foreground">Carboidratos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">45g</p>
            <p className="text-sm text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </Card>

      {/* Refeições de Hoje - baseadas no plano nutricional ativo */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span>Refeições de Hoje</span>
        </h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando suas refeições...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeals.length > 0 ? (
              todayMeals.map((meal) => {
                const isCompleted = completedMeals.has(meal.id);
                return (
                  <Card key={meal.id} className={`p-4 transition-all duration-300 ${isCompleted ? 'bg-accent/50 border-primary/30' : 'hover:shadow-md'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${isCompleted ? 'bg-primary' : 'bg-secondary'}`}>
                          <CheckCircle className={`h-4 w-4 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{meal.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{meal.time}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-foreground">{meal.calories} kcal</p>
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleMealClick(meal)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant={isCompleted ? "secondary" : "outline"} 
                            size="sm"
                            onClick={() => handleMarkMeal(meal.id)}
                          >
                            {isCompleted ? "✓" : "Marcar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <Utensils className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Nenhuma Refeição Encontrada</h3>
                    <p className="text-muted-foreground">
                      Você ainda não possui um plano nutricional ativo. Entre em contato com seu profissional para criar um plano personalizado.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Serviços nutricionais */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Serviços Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nutritionServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handleServiceClick(service.title)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-primary bg-primary-light px-2 py-1 rounded-full">
                      {service.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    {service.title === "Medidas" ? "Ir para Medidas" :
                     service.title === "Plano Alimentar" ? "Ver Plano" : 
                     "Ver Histórico"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progresso nutricional */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Progresso Nutricional</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Dias Seguidos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">70kg</p>
            <p className="text-sm text-muted-foreground">Peso Atual</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">-0kg</p>
            <p className="text-sm text-muted-foreground">Progresso</p>
          </div>
        </div>
      </Card>

      {/* Dialogs */}
      <MealDetailsDialog
        isOpen={showMealDialog}
        onClose={() => {
          setShowMealDialog(false);
          setSelectedMeal(null);
        }}
        mealType={selectedMealType}
        mealData={selectedMeal}
      />
      
      <NutritionPlanDialog
        open={showNutritionPlan}
        onOpenChange={setShowNutritionPlan}
      />
      
      <MealHistoryDialog
        open={showMealHistory}
        onOpenChange={setShowMealHistory}
      />
    </div>
  );
};

export default NutritionSection;