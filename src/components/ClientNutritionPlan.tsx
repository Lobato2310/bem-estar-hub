import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Utensils, Target, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  daily_calories: number;
  meals: Meal[];
  status: string;
  created_at: string;
  updated_at: string;
  professional_id: string;
}

export const ClientNutritionPlan = () => {
  const { user } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [professionalName, setProfessionalName] = useState<string>("");

  const loadNutritionPlan = async () => {
    if (!user) return;

    try {
      const { data: planData, error: planError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (planError && planError.code !== 'PGRST116') throw planError;

      if (planData) {
        // Convert meals from JSON to typed array
        const meals = Array.isArray(planData.meals) ? (planData.meals as unknown as Meal[]) : [];
        const typedPlan: NutritionPlan = {
          ...planData,
          meals
        };
        setNutritionPlan(typedPlan);

        // Carregar nome do profissional
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', planData.professional_id)
          .single();

        if (profileError) {
          console.error('Erro ao carregar perfil do profissional:', profileError);
        } else {
          setProfessionalName(profileData.display_name || 'Profissional');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano nutricional:', error);
      toast.error('Erro ao carregar plano nutricional');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNutritionPlan();

    // Setup realtime subscription para planos nutricionais
    if (user) {
      const channel = supabase
        .channel('nutrition_plans_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'nutrition_plans',
            filter: `client_id=eq.${user.id}`,
          },
          () => {
            toast.success('Seu plano nutricional foi atualizado!');
            loadNutritionPlan();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando plano nutricional...</p>
        </div>
      </div>
    );
  }

  if (!nutritionPlan) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Utensils className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <CardTitle>Nenhum Plano Nutricional</CardTitle>
          <CardDescription>
            Você ainda não possui um plano nutricional ativo. Entre em contato com seu profissional para criar um plano personalizado.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Plano */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="h-5 w-5" />
                <span>{nutritionPlan.name}</span>
              </CardTitle>
              <CardDescription>{nutritionPlan.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{professionalName}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Meta Diária</p>
                <p className="text-2xl font-bold text-primary">{nutritionPlan.daily_calories} kcal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(nutritionPlan.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Última Atualização</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(nutritionPlan.updated_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Suas Refeições</h3>
        {nutritionPlan.meals && nutritionPlan.meals.length > 0 ? (
          <div className="grid gap-4">
            {nutritionPlan.meals.map((meal: Meal) => (
              <Card key={meal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{meal.name}</CardTitle>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{meal.time}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Alimentos:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {meal.foods.map((food: FoodItem) => (
                        <div key={food.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                          <span className="font-medium">{food.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {food.quantity} {food.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {meal.observations && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Observações:</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                          {meal.observations}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma refeição encontrada neste plano.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};