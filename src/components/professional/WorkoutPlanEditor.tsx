import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
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
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    training_days: 3
  });
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan>({
    id: "",
    name: "",
    description: "",
    exercises: [],
    training_days: []
  });
  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: "",
    sets: 3,
    reps: "8-12",
    weight: "",
    rest_time: "60-90s",
    notes: ""
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
    if (!planForm.name || planForm.training_days < 1) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const trainingDays = generateTrainingDays(planForm.training_days);
      
      // Criar um plano para cada dia de treino
      for (const day of trainingDays) {
        const planData = {
          client_id: clientId,
          professional_id: professionalId,
          name: `${planForm.name} - Treino ${day}`,
          description: `${planForm.description} - Treino ${day}`,
          status: "active",
          exercises: []
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

  const addExerciseToPlan = async (planId: string) => {
    if (!exerciseForm.exercise_id) {
      toast.error("Selecione um exercício");
      return;
    }

    try {
      const selectedExercise = exercises.find(ex => ex.id === exerciseForm.exercise_id);
      if (!selectedExercise) return;

      const exerciseData = {
        exercise_id: exerciseForm.exercise_id,
        exercise_name: selectedExercise.name,
        exercise_description: selectedExercise.description,
        sets: exerciseForm.sets,
        reps: exerciseForm.reps,
        weight: exerciseForm.weight,
        rest_time: exerciseForm.rest_time,
        notes: exerciseForm.notes
      };

      // Buscar o plano atual
      const { data: planData, error: fetchError } = await supabase
        .from("workout_plans")
        .select("exercises")
        .eq("id", planId)
        .single();

      if (fetchError) throw fetchError;

      const currentExercises = Array.isArray(planData.exercises) ? planData.exercises : [];
      const updatedExercises = [...currentExercises, exerciseData];

      const { error: updateError } = await supabase
        .from("workout_plans")
        .update({ exercises: updatedExercises })
        .eq("id", planId);

      if (updateError) throw updateError;

      toast.success("Exercício adicionado ao plano!");
      setExerciseForm({
        exercise_id: "",
        sets: 3,
        reps: "8-12",
        weight: "",
        rest_time: "60-90s",
        notes: ""
      });
      setShowExerciseDialog(false);
    } catch (error) {
      console.error("Erro ao adicionar exercício:", error);
      toast.error("Erro ao adicionar exercício");
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Editor de Planos de Treino</h3>
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
              <div className="flex gap-2">
                <Badge variant="outline">
                  Serão criados: {generateTrainingDays(planForm.training_days).join(", ")}
                </Badge>
              </div>
              <Button onClick={createWorkoutPlan} className="w-full">
                Criar Planos
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkoutPlanEditor;