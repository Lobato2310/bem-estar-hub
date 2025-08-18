import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, Clock, Info } from "lucide-react";

interface NutritionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NutritionPlanDialog = ({ open, onOpenChange }: NutritionPlanDialogProps) => {
  const nutritionPlan = {
    dailyCalories: 1800,
    goal: "Redução de peso de forma saudável",
    explanation: "Baseado em sua idade, peso, altura e nível de atividade física, este plano alimentar foi desenvolvido para criar um déficit calórico moderado de 300-500 calorias por dia, permitindo uma perda de peso sustentável de 0,5 a 1kg por semana.",
    macroDistribution: {
      protein: { grams: 135, percentage: 30, calories: 540 },
      carbs: { grams: 180, percentage: 40, calories: 720 },
      fats: { grams: 60, percentage: 30, calories: 540 }
    },
    mealPlan: [
      { meal: "Café da Manhã", calories: 350, time: "07:00-08:00", description: "Rico em proteínas e fibras para saciedade" },
      { meal: "Lanche da Manhã", calories: 150, time: "10:00-10:30", description: "Frutas ou oleaginosas" },
      { meal: "Almoço", calories: 500, time: "12:00-13:00", description: "Prato balanceado com todos os macronutrientes" },
      { meal: "Lanche da Tarde", calories: 200, time: "15:30-16:00", description: "Opções nutritivas e práticas" },
      { meal: "Jantar", calories: 400, time: "19:00-20:00", description: "Refeição leve, rica em proteínas" },
      { meal: "Ceia (opcional)", calories: 200, time: "21:30-22:00", description: "Apenas se necessário" }
    ],
    observations: [
      "Beba pelo menos 2 litros de água por dia",
      "Pratique atividade física regular conforme orientação",
      "Faça as refeições em horários regulares",
      "Mastigue bem os alimentos",
      "Evite beliscar entre as refeições"
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Seu Plano Alimentar Personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Meta e Objetivo */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="h-6 w-6 text-primary mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Seu Objetivo</h3>
                <p className="text-foreground">{nutritionPlan.goal}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{nutritionPlan.dailyCalories}</span>
                  <span className="text-muted-foreground">calorias por dia</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Explicação Científica */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-primary mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Por que essas calorias?</h3>
                <p className="text-muted-foreground leading-relaxed">{nutritionPlan.explanation}</p>
              </div>
            </div>
          </Card>

          {/* Distribuição de Macronutrientes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Macronutrientes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{nutritionPlan.macroDistribution.protein.grams}g</p>
                <p className="text-sm text-muted-foreground">Proteínas ({nutritionPlan.macroDistribution.protein.percentage}%)</p>
                <p className="text-xs text-muted-foreground">{nutritionPlan.macroDistribution.protein.calories} kcal</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{nutritionPlan.macroDistribution.carbs.grams}g</p>
                <p className="text-sm text-muted-foreground">Carboidratos ({nutritionPlan.macroDistribution.carbs.percentage}%)</p>
                <p className="text-xs text-muted-foreground">{nutritionPlan.macroDistribution.carbs.calories} kcal</p>
              </div>
              <div className="text-center p-4 bg-accent/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{nutritionPlan.macroDistribution.fats.grams}g</p>
                <p className="text-sm text-muted-foreground">Gorduras ({nutritionPlan.macroDistribution.fats.percentage}%)</p>
                <p className="text-xs text-muted-foreground">{nutritionPlan.macroDistribution.fats.calories} kcal</p>
              </div>
            </div>
          </Card>

          {/* Plano de Refeições */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição das Refeições</h3>
            <div className="space-y-3">
              {nutritionPlan.mealPlan.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{meal.meal}</p>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{meal.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">{meal.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Observações Importantes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Orientações Importantes</h3>
            <div className="space-y-2">
              {nutritionPlan.observations.map((observation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <p className="text-muted-foreground">{observation}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Entendi
            </Button>
            <Button variant="outline" className="flex-1">
              Salvar como PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};