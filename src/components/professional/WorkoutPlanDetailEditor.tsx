import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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

interface WorkoutPlanDetailEditorProps {
  planId: string;
}

const WorkoutPlanDetailEditor = ({ planId }: WorkoutPlanDetailEditorProps) => {
  const [plan, setPlan] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [exerciseForm, setExerciseForm] = useState({
    exercise_id: "",
    sets: 3,
    reps: "8-12",
    weight: "",
    rest_time: "60-90s",
    notes: ""
  });

  const loadPlan = async () => {
    try {
      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (error) throw error;
      setPlan(data);
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
      toast.error("Erro ao carregar plano");
    }
  };

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
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async () => {
    if (!exerciseForm.exercise_id || !plan) {
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

      const currentExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
      const updatedExercises = [...currentExercises, exerciseData];

      const { error } = await supabase
        .from("workout_plans")
        .update({ exercises: updatedExercises })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Exercício adicionado com sucesso!");
      setExerciseForm({
        exercise_id: "",
        sets: 3,
        reps: "8-12",
        weight: "",
        rest_time: "60-90s",
        notes: ""
      });
      setShowAddDialog(false);
      loadPlan();
    } catch (error) {
      console.error("Erro ao adicionar exercício:", error);
      toast.error("Erro ao adicionar exercício");
    }
  };

  const removeExercise = async (exerciseIndex: number) => {
    if (!plan) return;

    try {
      const currentExercises = Array.isArray(plan.exercises) ? plan.exercises : [];
      const updatedExercises = currentExercises.filter((_, index) => index !== exerciseIndex);

      const { error } = await supabase
        .from("workout_plans")
        .update({ exercises: updatedExercises })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Exercício removido com sucesso!");
      loadPlan();
    } catch (error) {
      console.error("Erro ao remover exercício:", error);
      toast.error("Erro ao remover exercício");
    }
  };

  const updateExerciseSets = async (exerciseIndex: number, newSets: number) => {
    if (!plan) return;

    try {
      const currentExercises = Array.isArray(plan.exercises) ? [...plan.exercises] : [];
      if (currentExercises[exerciseIndex]) {
        currentExercises[exerciseIndex] = {
          ...currentExercises[exerciseIndex],
          sets: newSets
        };

        const { error } = await supabase
          .from("workout_plans")
          .update({ exercises: currentExercises })
          .eq("id", planId);

        if (error) throw error;

        toast.success("Séries atualizadas!");
        loadPlan();
      }
    } catch (error) {
      console.error("Erro ao atualizar séries:", error);
      toast.error("Erro ao atualizar séries");
    }
  };

  const moveExerciseUp = async (exerciseIndex: number) => {
    if (!plan || exerciseIndex === 0) return;

    try {
      const currentExercises = Array.isArray(plan.exercises) ? [...plan.exercises] : [];
      [currentExercises[exerciseIndex - 1], currentExercises[exerciseIndex]] = 
        [currentExercises[exerciseIndex], currentExercises[exerciseIndex - 1]];

      const { error } = await supabase
        .from("workout_plans")
        .update({ exercises: currentExercises })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Ordem alterada!");
      loadPlan();
    } catch (error) {
      console.error("Erro ao mover exercício:", error);
      toast.error("Erro ao reordenar exercício");
    }
  };

  const moveExerciseDown = async (exerciseIndex: number) => {
    if (!plan) return;
    
    const currentExercises = Array.isArray(plan.exercises) ? [...plan.exercises] : [];
    if (exerciseIndex === currentExercises.length - 1) return;

    try {
      [currentExercises[exerciseIndex], currentExercises[exerciseIndex + 1]] = 
        [currentExercises[exerciseIndex + 1], currentExercises[exerciseIndex]];

      const { error } = await supabase
        .from("workout_plans")
        .update({ exercises: currentExercises })
        .eq("id", planId);

      if (error) throw error;

      toast.success("Ordem alterada!");
      loadPlan();
    } catch (error) {
      console.error("Erro ao mover exercício:", error);
      toast.error("Erro ao reordenar exercício");
    }
  };

  useEffect(() => {
    loadPlan();
    loadExercises();
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!plan) {
    return <div>Plano não encontrado</div>;
  }

  const planExercises = Array.isArray(plan.exercises) ? plan.exercises : [];

  return (
    <div className="space-y-4 h-full overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Exercício
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Exercício ao Plano</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Exercício</Label>
                <Select
                  value={exerciseForm.exercise_id}
                  onValueChange={(value) => setExerciseForm(prev => ({ ...prev, exercise_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} - {exercise.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Séries</Label>
                  <Input
                    type="number"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div>
                  <Label>Repetições</Label>
                  <Input
                    value={exerciseForm.reps}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                    placeholder="Ex: 8-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Peso (opcional)</Label>
                  <Input
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Ex: 20kg"
                  />
                </div>
                <div>
                  <Label>Descanso</Label>
                  <Input
                    value={exerciseForm.rest_time}
                    onChange={(e) => setExerciseForm(prev => ({ ...prev, rest_time: e.target.value }))}
                    placeholder="Ex: 60-90s"
                  />
                </div>
              </div>

              <div>
                <Label>Observações (opcional)</Label>
                <Input
                  value={exerciseForm.notes}
                  onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Instruções especiais..."
                />
              </div>

              <Button onClick={addExercise} className="w-full">
                Adicionar Exercício
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {planExercises.length > 0 ? (
          planExercises.map((exercise: any, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{exercise.exercise_name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exercise.exercise_description}
                    </p>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Séries:</Label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseSets(index, parseInt(e.target.value) || 1)}
                          className="w-16 h-8"
                          min="1"
                        />
                      </div>
                      <Badge variant="outline">{exercise.reps} reps</Badge>
                      {exercise.weight && (
                        <Badge variant="outline">{exercise.weight}</Badge>
                      )}
                      <Badge variant="outline">Descanso: {exercise.rest_time}</Badge>
                    </div>
                    {exercise.notes && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Obs: {exercise.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveExerciseUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveExerciseDown(index)}
                      disabled={index === planExercises.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExercise(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum exercício adicionado ainda
          </p>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlanDetailEditor;