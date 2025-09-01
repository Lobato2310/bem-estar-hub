import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  category: string;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise_name: string;
  exercise_description: string;
  sets: number;
  reps: string;
  weight: string;
  rest_time: string;
  notes: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  training_days: string[];
}

interface WorkoutPlanEditorProps {
  clientId: string;
  professionalId: string;
  onPlanCreated: () => void;
}

const WorkoutPlanEditor = ({ clientId, professionalId, onPlanCreated }: WorkoutPlanEditorProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    training_days: 3
  });

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("name");

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Erro ao carregar exercícios:", error);
      toast.error("Erro ao carregar exercícios");
    }
  };

  const generateTrainingDays = (numDays: number) => {
    const days = ["A", "B", "C", "D", "E"];
    return days.slice(0, numDays);
  };

  const createWorkoutPlan = async () => {
    if (!planForm.name || planForm.training_days < 2) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const trainingDays = generateTrainingDays(planForm.training_days);
      const planGroupId = crypto.randomUUID();
      
      // Criar um plano para cada dia de treino
      for (let i = 0; i < trainingDays.length; i++) {
        const day = trainingDays[i];
        const planData = {
          client_id: clientId,
          professional_id: professionalId,
          name: `${planForm.name} - Treino ${day}`,
          description: `${planForm.description} - Dia ${i + 1} da semana (Treino ${day})`,
          status: "active",
          exercises: [],
          training_day: day,
          plan_group_id: planGroupId,
          days_per_week: planForm.training_days
        };

        const { error } = await supabase
          .from("workout_plans")
          .insert(planData);

        if (error) throw error;
      }

      toast.success(`Planos de treino criados com sucesso! (${trainingDays.join(", ")})`);
      setPlanForm({ name: "", description: "", training_days: 3 });
      setShowPlanDialog(false);
      onPlanCreated();
    } catch (error) {
      console.error("Erro ao criar planos:", error);
      toast.error("Erro ao criar planos de treino");
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editor de Planos de Treino
          </h3>
          <p className="text-sm text-muted-foreground">
            Crie planos organizados por dias da semana (A, B, C, D, E)
          </p>
        </div>
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Planos
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Planos de Treino</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome Base dos Planos</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Hipertrofia Iniciante"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Será criado um plano para cada dia: "{planForm.name} - Treino A", "{planForm.name} - Treino B", etc.
                </p>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={planForm.description}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo dos treinos..."
                />
              </div>
              <div>
                <Label>Quantos dias por semana o cliente treina?</Label>
                <Select
                  value={planForm.training_days.toString()}
                  onValueChange={(value) => setPlanForm(prev => ({ ...prev, training_days: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 dias (A, B)</SelectItem>
                    <SelectItem value="3">3 dias (A, B, C)</SelectItem>
                    <SelectItem value="4">4 dias (A, B, C, D)</SelectItem>
                    <SelectItem value="5">5 dias (A, B, C, D, E)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Planos que serão criados:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {generateTrainingDays(planForm.training_days).map((day) => (
                    <Badge key={day} variant="outline">
                      Treino {day}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cada treino corresponde a um dia da semana e terá exercícios específicos.
                </p>
              </div>
              <Button onClick={createWorkoutPlan} className="w-full">
                Criar {generateTrainingDays(planForm.training_days).length} Planos
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
            <h4 className="font-medium">Sistema de Treinos Organizados</h4>
            <p className="text-sm text-muted-foreground">
              Configure quantos dias o cliente treina por semana e o sistema criará automaticamente 
              os planos separados por letra (A, B, C, D, E).
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Badge variant="secondary">3 dias = A, B, C</Badge>
              <Badge variant="secondary">5 dias = A, B, C, D, E</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutPlanEditor;