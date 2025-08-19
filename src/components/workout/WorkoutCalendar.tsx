import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Use the actual database schema from workout_plans table
type WorkoutPlan = {
  id: string;
  client_id: string;
  professional_id: string;
  name: string;
  description: string | null;
  exercises: any; // JsonB type
  status: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkoutCalendarProps {
  workoutType: "musculacao" | "cardio";
  viewMode?: "client" | "professional";
}

const WorkoutCalendar = ({ workoutType, viewMode = "client" }: WorkoutCalendarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: "",
    description: "",
    exercises: ""
  });
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);
  const [exercises, setExercises] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    if (user) {
      fetchWorkoutPlans();
      fetchWorkoutDates();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      fetchExercises();
    }
  }, [user]);

  const fetchWorkoutPlans = async () => {
    if (!user || !selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('client_id', user.id)
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching workout plans:', error);
      return;
    }

    setWorkoutPlans(data || []);
  };

  const fetchWorkoutDates = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_plans')
      .select('created_at')
      .eq('client_id', user.id);

    if (error) {
      console.error('Error fetching workout dates:', error);
      return;
    }

    const dates = data?.map(item => new Date(item.created_at)) || [];
    setWorkoutDates(dates);
  };

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('id,name')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching exercises:', error);
      return;
    }
    setExercises(data || []);
  };

  const handleAddWorkout = async () => {
    if (!user || !selectedDate || !newWorkout.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('workout_plans')
      .insert({
        client_id: user.id,
        professional_id: user.id, // For now, clients can add their own workouts
        name: newWorkout.name,
        description: newWorkout.description,
        exercises: { exercises: newWorkout.exercises },
        created_at: selectedDate.toISOString()
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o treino",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Treino adicionado com sucesso!"
    });

    setNewWorkout({ name: "", description: "", exercises: "" });
    setShowAddDialog(false);
    fetchWorkoutPlans();
    fetchWorkoutDates();
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', workoutId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o treino",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Treino removido com sucesso!"
    });

    fetchWorkoutPlans();
    fetchWorkoutDates();
  };

  const isWorkoutDate = (date: Date) => {
    return workoutDates.some(workoutDate => 
      format(workoutDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isToday = (date: Date) => {
    return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  };

  const isPastDate = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Calendário de Treinos - {workoutType === "musculacao" ? "Musculação" : "Cardio"}</span>
        </h3>
        {viewMode === "professional" && (
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Treino
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            modifiers={{
              workout: isWorkoutDate,
              today: isToday,
              past: isPastDate
            }}
            modifiersStyles={{
              workout: { 
                backgroundColor: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              },
              today: {
                backgroundColor: 'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))'
              }
            }}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
              </h4>
              {selectedDate && (
                <Badge variant={isPastDate(selectedDate) ? "secondary" : "default"}>
                  {isPastDate(selectedDate) ? "Concluído" : "Futuro"}
                </Badge>
              )}
            </div>

            {workoutPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum treino agendado para esta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutPlans.map((workout) => (
                  <Card key={workout.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h5 className="font-medium">{workout.name}</h5>
                        {workout.description && (
                          <p className="text-sm text-muted-foreground">
                            {workout.description}
                          </p>
                        )}
                        {workout.exercises && (
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {typeof workout.exercises === 'string' ? workout.exercises : JSON.stringify(workout.exercises)}
                          </p>
                        )}
                      </div>
                      {viewMode === "professional" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Workout Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Selecionar da Biblioteca</Label>
              <Select onValueChange={(val) => {
                const ex = exercises.find(e => e.id === val);
                setNewWorkout(prev => ({
                  ...prev,
                  name: ex?.name || ""
                }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um exercício" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nome do Treino</Label>
              <Input
                placeholder="ex: Treino de Peito"
                value={newWorkout.name}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                placeholder="ex: Foco em peito e tríceps"
                value={newWorkout.description}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Exercícios</Label>
              <Input
                placeholder="ex: Supino 3x12, Voador 3x15"
                value={newWorkout.exercises}
                onChange={(e) => setNewWorkout(prev => ({ ...prev, exercises: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddWorkout} className="flex-1">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutCalendar;