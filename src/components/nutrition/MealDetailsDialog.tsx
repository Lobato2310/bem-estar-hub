import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Apple, Info } from "lucide-react";

// Use the actual database schema from nutrition_plans table
type NutritionPlan = {
  id: string;
  client_id: string;
  professional_id: string;
  name: string;
  description: string | null;
  daily_calories: number | null;
  meals: any; // JsonB type
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface MealData {
  id: string;
  name: string;
  type: string;
  time: string;
  calories: number;
  completed: boolean;
  foods: FoodItem[];
}

interface MealDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  mealData?: MealData | null;
}

const MealDetailsDialog = ({ isOpen, onClose, mealType, mealData }: MealDetailsDialogProps) => {
  const { user } = useAuth();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchNutritionPlans();
    }
  }, [isOpen, user, mealType]);

  const fetchNutritionPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('client_id', user.id)
      .eq('status', 'active');

    if (!error && data) {
      setNutritionPlans(data);
    }
    setLoading(false);
  };

  const getMealTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      'cafe_da_manha': 'Café da Manhã',
      'lanche_da_manha': 'Lanche da Manhã',
      'almoco': 'Almoço',
      'lanche_da_tarde': 'Lanche da Tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };
    return titles[type] || type;
  };

  // Filter meals from the active nutrition plan that match the selected meal
  const getMealDetailsFromPlan = () => {
    if (mealData && mealData.foods.length > 0) {
      // Use real meal data if available
      return {
        name: mealData.name,
        time: mealData.time,
        foods: mealData.foods,
        calories: mealData.calories
      };
    }

    // Look for meal in nutrition plans
    for (const plan of nutritionPlans) {
      if (plan.meals && Array.isArray(plan.meals)) {
        const meal = plan.meals.find((m: any) => m.type === mealType || m.name === getMealTitle(mealType));
        if (meal) {
        return {
          name: meal.name,
          time: meal.time,
          foods: meal.foods || [],
          calories: meal.calories || (plan.daily_calories ? Math.round(plan.daily_calories / plan.meals.length) : 0)
        };
        }
      }
    }

    return null;
  };

  const currentMeal = getMealDetailsFromPlan();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Apple className="h-5 w-5 text-primary" />
            <span>{currentMeal?.name || getMealTitle(mealType)}</span>
            {currentMeal?.time && (
              <Badge variant="outline" className="ml-2">
                {currentMeal.time}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {currentMeal ? (
          <Tabs defaultValue="alimentos" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alimentos">Alimentos</TabsTrigger>
              <TabsTrigger value="info">Informações</TabsTrigger>
            </TabsList>

            <TabsContent value="alimentos" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Lista de Alimentos</h3>
                    <Badge variant="secondary">
                      {currentMeal.calories} kcal
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {currentMeal.foods.map((food: FoodItem, index: number) => (
                      <div key={food.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {food.quantity} {food.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {currentMeal.foods.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum alimento especificado para esta refeição</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações da Refeição</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Horário</p>
                      <p className="text-lg">{currentMeal.time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Calorias Estimadas</p>
                      <p className="text-lg">{currentMeal.calories} kcal</p>
                    </div>
                  </div>
                  
                  {nutritionPlans.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Plano Nutricional</p>
                      <p className="text-sm">{nutritionPlans[0].name}</p>
                      {nutritionPlans[0].description && (
                        <p className="text-sm text-muted-foreground mt-1">{nutritionPlans[0].description}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Apple className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Refeição não encontrada</h3>
            <p className="text-muted-foreground">
              Esta refeição ainda não foi configurada em seu plano nutricional.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealDetailsDialog;