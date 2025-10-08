import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Target, Clock, Info, Download, Utensils } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import jsPDF from "jspdf";

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

interface NutritionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NutritionPlanDialog = ({ open, onOpenChange }: NutritionPlanDialogProps) => {
  const { user } = useAuth();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [professionalName, setProfessionalName] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadNutritionPlan = async () => {
      if (!user || !open) return;

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

          if (!profileError && profileData) {
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

    if (open) {
      loadNutritionPlan();
    }
  }, [user, open]);

  const handleExportPDF = async () => {
    if (!nutritionPlan) return;

    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Título
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Plano Alimentar Personalizado", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Nome do plano
      doc.setFontSize(16);
      doc.text(nutritionPlan.name, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Descrição
      if (nutritionPlan.description) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(nutritionPlan.description, pageWidth - 40);
        doc.text(descLines, pageWidth / 2, yPosition, { align: "center" });
        yPosition += descLines.length * 5 + 10;
      }

      // Profissional
      doc.setFontSize(10);
      doc.text(`Profissional: ${professionalName}`, 20, yPosition);
      yPosition += 7;

      // Meta de calorias
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Meta Diária: ${nutritionPlan.daily_calories} kcal`, 20, yPosition);
      yPosition += 15;

      // Refeições
      doc.setFontSize(16);
      doc.text("Refeições do Dia", 20, yPosition);
      yPosition += 10;

      nutritionPlan.meals.forEach((meal, index) => {
        // Verificar se precisa de nova página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Nome e horário da refeição
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${meal.name} - ${meal.time}`, 20, yPosition);
        yPosition += 7;

        // Alimentos
        if (meal.foods && meal.foods.length > 0) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          meal.foods.forEach((food) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(`• ${food.name} - ${food.quantity} ${food.unit}`, 30, yPosition);
            yPosition += 5;
          });
        } else {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text("Nenhum alimento específico cadastrado", 30, yPosition);
          yPosition += 5;
        }

        // Observações da refeição
        if (meal.observations) {
          doc.setFont("helvetica", "normal");
          doc.text(`Obs: ${meal.observations}`, 30, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      });

      // Observações gerais
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Orientações Importantes", 20, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const observations = [
        "• Beba pelo menos 2 litros de água por dia",
        "• Pratique atividade física regular conforme orientação",
        "• Faça as refeições em horários regulares",
        "• Mastigue bem os alimentos",
        "• Evite beliscar entre as refeições"
      ];

      observations.forEach((obs) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(obs, 20, yPosition);
        yPosition += 6;
      });

      // Salvar PDF
      doc.save(`Plano_Alimentar_${nutritionPlan.name.replace(/\s/g, '_')}.pdf`);
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando plano nutricional...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!nutritionPlan) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Plano Alimentar
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-12 space-y-4">
            <Utensils className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-foreground">Nenhum Plano Nutricional</h3>
              <p className="text-muted-foreground">
                Você ainda não possui um plano nutricional ativo. Entre em contato com seu profissional para criar um plano personalizado.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                <h3 className="text-lg font-semibold text-foreground">{nutritionPlan.name}</h3>
                <p className="text-foreground">{nutritionPlan.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{nutritionPlan.daily_calories}</span>
                  <span className="text-muted-foreground">calorias por dia</span>
                </div>
                <p className="text-sm text-muted-foreground">Profissional: {professionalName}</p>
              </div>
            </div>
          </Card>

          {/* Plano de Refeições */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Refeições do Dia
            </h3>
            <div className="space-y-4">
              {nutritionPlan.meals.map((meal, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{meal.name}</p>
                        <p className="text-sm text-muted-foreground">{meal.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alimentos */}
                  {meal.foods && meal.foods.length > 0 ? (
                    <div className="space-y-2 pl-7">
                      <p className="text-sm font-medium text-foreground">Alimentos:</p>
                      {meal.foods.map((food) => (
                        <div key={food.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          <span>{food.name} - {food.quantity} {food.unit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic pl-7">Nenhum alimento específico cadastrado</p>
                  )}

                  {/* Observações */}
                  {meal.observations && (
                    <div className="pl-7">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Obs:</span> {meal.observations}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Observações Importantes */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Orientações Importantes</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-muted-foreground">Beba pelo menos 2 litros de água por dia</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-muted-foreground">Pratique atividade física regular conforme orientação</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-muted-foreground">Faça as refeições em horários regulares</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-muted-foreground">Mastigue bem os alimentos</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-muted-foreground">Evite beliscar entre as refeições</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Fechar
            </Button>
            <Button 
              onClick={handleExportPDF} 
              className="flex-1"
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};