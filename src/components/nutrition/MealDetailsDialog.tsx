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

  // Filter plans for this specific meal type from the meals JSON
  const filteredPlans = nutritionPlans.filter(plan => {
    if (!plan.meals || typeof plan.meals !== 'object') return false;
    return Object.keys(plan.meals).some(mealKey => mealKey === mealType);
  });

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
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum plano alimentar encontrado para esta refeição</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPlans.map((plan) => (
                  <Card key={plan.id} className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.description && (
                        <div className="whitespace-pre-wrap text-foreground">
                          {plan.description}
                        </div>
                      )}
                      {plan.meals && plan.meals[mealType] && (
                        <div className="whitespace-pre-wrap text-muted-foreground">
                          {typeof plan.meals[mealType] === 'string' 
                            ? plan.meals[mealType] 
                            : JSON.stringify(plan.meals[mealType], null, 2)}
                        </div>
                      )}
                      {plan.daily_calories && (
                        <Badge variant="secondary" className="text-xs">
                          {plan.daily_calories} kcal/dia
                        </Badge>
                      )}
                    </div>
                  </Card>
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
                {filteredPlans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma observação disponível para esta refeição</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPlans
                      .filter(plan => plan.description)
                      .map((plan) => (
                        <Card key={plan.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Info className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground">Observações - {plan.name}</span>
                            </div>
                            <div className="whitespace-pre-wrap text-muted-foreground pl-6">
                              {plan.description}
                            </div>
                          </div>
                        </Card>
                      ))}
                    {filteredPlans.filter(plan => plan.description).length === 0 && (
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