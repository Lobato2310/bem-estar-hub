import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Apple, Info } from "lucide-react";

interface NutritionPlan {
  id: string;
  meal_type: string;
  meal_description: string;
  meal_time: string;
  observations: string;
  created_at: string;
}

interface MealDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
}

const MealDetailsDialog = ({ isOpen, onClose, mealType }: MealDetailsDialogProps) => {
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
      .eq('meal_type', mealType)
      .order('meal_time');

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

  const groupedPlans = nutritionPlans.reduce((acc, plan) => {
    const key = plan.meal_time || 'sem_horario';
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {} as { [key: string]: NutritionPlan[] });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Apple className="h-5 w-5 text-primary" />
            <span>{getMealTitle(mealType)}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="alimentos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alimentos">Alimentos</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="alimentos" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : Object.keys(groupedPlans).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum plano alimentar encontrado para esta refeição</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPlans).map(([time, plans]) => (
                  <div key={time} className="space-y-2">
                    {time !== 'sem_horario' && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{time}</Badge>
                      </div>
                    )}
                    <div className="space-y-3">
                      {plans.map((plan) => (
                        <Card key={plan.id} className="p-4">
                          <div className="space-y-2">
                            <div className="whitespace-pre-wrap text-foreground">
                              {plan.meal_description}
                            </div>
                            {plan.meal_time && time === 'sem_horario' && (
                              <Badge variant="secondary" className="text-xs">
                                {plan.meal_time}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="observacoes" className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <div className="space-y-4">
                {nutritionPlans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma observação disponível para esta refeição</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nutritionPlans
                      .filter(plan => plan.observations)
                      .map((plan) => (
                        <Card key={plan.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Info className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">Dicas do Nutricionista</span>
                              {plan.meal_time && (
                                <Badge variant="outline" className="text-xs">
                                  {plan.meal_time}
                                </Badge>
                              )}
                            </div>
                            <div className="whitespace-pre-wrap text-muted-foreground pl-6">
                              {plan.observations}
                            </div>
                          </div>
                        </Card>
                      ))}
                    {nutritionPlans.filter(plan => plan.observations).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma observação específica para esta refeição</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MealDetailsDialog;