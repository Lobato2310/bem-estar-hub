import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Calculator, Plus, Utensils, Clock, Target } from "lucide-react";
import { useState, useEffect } from "react";

import { AddMealDialog } from "@/components/food/AddMealDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  defaultPortion: number;
  source: 'taco' | 'open';
}

interface MealFood {
  food: Food;
  quantity: number;
  calculatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

interface SavedMeal {
  id: string;
  mealType: string;
  foods: MealFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  date: string;
}

const CaloriesSection = () => {
  const { user } = useAuth();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [todayMeals, setTodayMeals] = useState<SavedMeal[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);


  // Carregar refeições do dia atual
  const loadTodayMeals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Carregando refeições para user:', user.id);
      const today = new Date().toISOString().split('T')[0];
      const { data: foodLogs, error } = await supabase
        .from('client_food_logs')
        .select('*')
        .eq('client_id', user.id)
        .gte('eaten_at', `${today}T00:00:00`)
        .lt('eaten_at', `${today}T23:59:59`)
        .order('eaten_at', { ascending: true });

      if (error) {
        console.error('Erro na query client_food_logs:', error);
        throw error;
      }
      
      console.log('Food logs encontrados:', foodLogs);

      const meals: SavedMeal[] = (foodLogs || []).map(log => {
        const foods = Array.isArray(log.foods) ? log.foods as any[] : [];
        const parsedFoods: MealFood[] = foods.map(f => ({
          food: f.food || f,
          quantity: f.quantity || 0,
          calculatedNutrition: f.calculatedNutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          }
        }));

        return {
          id: log.id,
          mealType: log.meal_name,
          foods: parsedFoods,
          totalNutrition: {
            calories: Number(log.total_calories) || 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          },
          date: log.eaten_at
        };
      });

      setTodayMeals(meals);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      toast.error('Erro ao carregar refeições do dia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayMeals();
  }, [user]);

  const handleAddMeal = async (meal: {
    mealType: string;
    foods: MealFood[];
    totalNutrition: any;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('client_food_logs')
        .insert({
          client_id: user.id,
          meal_name: meal.mealType,
          foods: meal.foods as any,
          total_calories: meal.totalNutrition.calories,
          eaten_at: new Date().toISOString()
        });

      if (error) throw error;

      // Recarregar refeições
      loadTodayMeals();
      toast.success('Refeição salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error('Erro ao salvar refeição');
    }
  };


  const consumedToday = todayMeals.reduce((sum, meal) => sum + meal.totalNutrition.calories, 0);
  const remaining = dailyGoal - consumedToday;

  // Calcular totais nutricionais do dia
  const dailyNutrition = todayMeals.reduce((total, meal) => {
    const mealNutrition = meal.foods.reduce((mealTotal, mealFood) => ({
      protein: mealTotal.protein + mealFood.calculatedNutrition.protein,
      carbs: mealTotal.carbs + mealFood.calculatedNutrition.carbs,
      fat: mealTotal.fat + mealFood.calculatedNutrition.fat,
      fiber: mealTotal.fiber + mealFood.calculatedNutrition.fiber
    }), { protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return {
      protein: total.protein + mealNutrition.protein,
      carbs: total.carbs + mealNutrition.carbs,
      fat: total.fat + mealNutrition.fat,
      fiber: total.fiber + mealNutrition.fiber
    };
  }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Calculator className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Contador de Calorias</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Acompanhe sua ingestão diária de calorias e nutrientes
        </p>
      </div>

      {/* Observação importante */}
      <Card className="p-4 bg-accent/50 border-warning">
        <p className="text-sm text-foreground">
          <strong>Importante:</strong> Aqui você deve adicionar todas as suas refeições, mesmo que não esteja no seu cronograma de dieta, para analisarmos os deslizes em refeições livres, e buscar ajustes.
        </p>
      </Card>

      {/* Meta diária */}
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center space-y-2">
            <Target className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
            <p className="text-xl md:text-2xl font-bold text-foreground">{dailyGoal}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Meta Diária</p>
          </div>
          <div className="text-center space-y-2">
            <Utensils className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
            <p className="text-xl md:text-2xl font-bold text-foreground">{consumedToday}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Consumidas</p>
          </div>
          <div className="text-center space-y-2">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto" />
            <p className={`text-xl md:text-2xl font-bold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {remaining >= 0 ? 'Restantes' : 'Excesso'}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progresso Diário</span>
            <span>{Math.round((consumedToday / dailyGoal) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((consumedToday / dailyGoal) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>


      {/* Refeições de hoje */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-lg md:text-2xl font-semibold text-foreground">Refeições de Hoje</h2>
        
        {todayMeals.map((meal, index) => (
          <Card key={index} className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-base md:text-lg font-semibold text-foreground">{meal.mealType}</h3>
              <p className="text-base md:text-lg font-bold text-primary">{meal.totalNutrition.calories} kcal</p>
            </div>
            
            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-border last:border-b-0 gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm md:text-base text-foreground truncate">{food.food.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{food.quantity}g</p>
                  </div>
                  <p className="font-medium text-sm md:text-base text-foreground">{food.calculatedNutrition.calories} kcal</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {todayMeals.length === 0 && !loading && (
          <Card className="p-4 md:p-6 text-center">
            <div className="space-y-4">
              <Utensils className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">Nenhuma refeição registrada</h3>
                <p className="text-sm md:text-base text-muted-foreground">Comece adicionando um alimento acima ou criando uma refeição completa</p>
              </div>
            </div>
          </Card>
        )}

        {/* Adicionar refeição */}
        <Card 
          className="p-4 md:p-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => setShowAddMeal(true)}
        >
          <div className="text-center space-y-4">
            <Plus className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">Adicionar Refeição</h3>
              <p className="text-sm md:text-base text-muted-foreground">Clique para registrar uma nova refeição</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo nutricional */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Resumo Nutricional</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="text-center space-y-2">
            <p className="text-lg md:text-2xl font-bold text-primary">{Math.round(dailyNutrition.protein)}g</p>
            <p className="text-xs md:text-sm text-muted-foreground">Proteínas</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.protein / 150) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg md:text-2xl font-bold text-primary">{Math.round(dailyNutrition.carbs)}g</p>
            <p className="text-xs md:text-sm text-muted-foreground">Carboidratos</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.carbs / 250) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg md:text-2xl font-bold text-primary">{Math.round(dailyNutrition.fat)}g</p>
            <p className="text-xs md:text-sm text-muted-foreground">Gorduras</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.fat / 80) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg md:text-2xl font-bold text-primary">{Math.round(dailyNutrition.fiber)}g</p>
            <p className="text-xs md:text-sm text-muted-foreground">Fibras</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.fiber / 25) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Diálogos */}
      <AddMealDialog
        open={showAddMeal}
        onOpenChange={setShowAddMeal}
        onMealAdd={handleAddMeal}
      />
    </div>
  );
};

export default CaloriesSection;