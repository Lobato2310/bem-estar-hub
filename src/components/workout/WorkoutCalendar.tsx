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
  training_day?: string;
  plan_group_id?: string;
}

type WorkoutSchedule = {
  id: string;
  client_id: string;
  professional_id: string;
  workout_plan_id: string;
  scheduled_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  workout_plans?: WorkoutPlan;
}

interface WorkoutCalendarProps {
  workoutType: "musculacao" | "cardio";
  viewMode?: "client" | "professional";
  clientId?: string;
}

const WorkoutCalendar = ({ workoutType, viewMode = "client", clientId }: WorkoutCalendarProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<WorkoutSchedule[]>([]);
  const [availablePlans, setAvailablePlans] = useState<WorkoutPlan[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [workoutDates, setWorkoutDates] = useState<Date[]>([]);

  const targetClientId = clientId || user?.id;

  useEffect(() => {
    if (user && targetClientId) {
      fetchScheduledWorkouts();
      fetchWorkoutDates();
      if (viewMode === "professional") {
        fetchAvailablePlans();
      }
    }
  }, [user, selectedDate, targetClientId, viewMode]);

  const fetchScheduledWorkouts = async () => {
    if (!targetClientId || !selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Fetch schedules and their associated workout plans separately to avoid join issues
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('workout_schedules')
      .select('*')
      .eq('client_id', targetClientId)
      .eq('scheduled_date', dateStr)
      .order('created_at', { ascending: true });

    if (scheduleError) {
      console.error('Error fetching scheduled workouts:', scheduleError);
      return;
    }

    // Fetch the associated workout plans
    const schedulesWithPlans = await Promise.all(
      (scheduleData || []).map(async (schedule) => {
        const { data: planData } = await supabase
          .from('workout_plans')
          .select('*')
          .eq('id', schedule.workout_plan_id)
          .single();
        
        return {
          ...schedule,
          workout_plans: planData
        };
      })
    );

    setScheduledWorkouts(schedulesWithPlans);
  };

  const fetchAvailablePlans = async () => {
    if (!targetClientId) return;
    
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('client_id', targetClientId)
      .eq('status', 'active')
      .order('training_day', { ascending: true });

    if (error) {
      console.error('Error fetching available plans:', error);
      return;
    }

    setAvailablePlans(data || []);
  };

  const fetchWorkoutDates = async () => {
    if (!targetClientId) return;

    const { data, error } = await supabase
      .from('workout_schedules')
      .select('scheduled_date')
      .eq('client_id', targetClientId);

    if (error) {
      console.error('Error fetching workout dates:', error);
      return;
    }

    const dates = data?.map(item => new Date(item.scheduled_date + 'T00:00:00')) || [];
    setWorkoutDates(dates);
  };

  const handleScheduleWorkout = async () => {
    if (!user || !selectedDate || !selectedPlanId || !targetClientId) {
      toast({
        title: "Erro",
        description: "Selecione um plano de treino",
        variant: "destructive"
      });
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const { error } = await supabase
      .from('workout_schedules')
      .insert({
        client_id: targetClientId,
        professional_id: user.id,
        workout_plan_id: selectedPlanId,
        scheduled_date: dateStr
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível agendar o treino",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Treino agendado com sucesso!"
    });

    setSelectedPlanId("");
    setShowScheduleDialog(false);
    fetchScheduledWorkouts();
    fetchWorkoutDates();
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    const { error } = await supabase
      .from('workout_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o agendamento",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Agendamento removido com sucesso!"
    });

    fetchScheduledWorkouts();
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
          <Button onClick={() => setShowScheduleDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agendar Treino
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

            {scheduledWorkouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum treino agendado para esta data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledWorkouts.map((schedule) => (
                  <Card key={schedule.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h5 className="font-medium">
                          {schedule.workout_plans?.name}
                          {schedule.workout_plans?.training_day && (
                            <Badge variant="secondary" className="ml-2">
                              Treino {schedule.workout_plans.training_day}
                            </Badge>
                          )}
                        </h5>
                        {schedule.workout_plans?.description && (
                          <p className="text-sm text-muted-foreground">
                            {schedule.workout_plans.description}
                          </p>
                        )}
                        {schedule.workout_plans?.exercises && Array.isArray(schedule.workout_plans.exercises) && (
                          <div className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {schedule.workout_plans.exercises.length} exercícios
                          </div>
                        )}
                      </div>
                      {viewMode === "professional" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSchedule(schedule.id)}
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

      {/* Schedule Workout Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data Selecionada</Label>
              <Input
                value={selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : ""}
                disabled
              />
            </div>

            <div>
              <Label>Selecionar Plano de Treino</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um plano de treino" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} {plan.training_day && `(Treino ${plan.training_day})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleScheduleWorkout} className="flex-1">
                Agendar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutCalendar;