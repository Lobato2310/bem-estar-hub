import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Calendar, TrendingUp, Target, Play } from "lucide-react";
import ActiveWorkoutExecution from "@/components/workout/ActiveWorkoutExecution";
import WorkoutFeedbackDialog from "@/components/workout/WorkoutFeedbackDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: {
    id?: string;
    name: string;
    description?: string;
    sets: number;
    reps: string | number;
    weight?: number;
    rest_time?: string | number;
    notes?: string;
    video_url?: string;
    instructions?: string;
    muscle_groups?: string[];
    category?: string;
  }[];
  training_day?: string;
  status: string;
  created_at: string;
}

interface WorkoutSchedule {
  id: string;
  workout_plan_id: string;
  scheduled_date: string;
  workout_plans?: WorkoutPlan;
}

interface WorkoutStats {
  total_workouts: number;
  total_time_minutes: number;
}

const WorkoutSection = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [scheduledToday, setScheduledToday] = useState<WorkoutSchedule[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({ total_workouts: 0, total_time_minutes: 0 });
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<WorkoutPlan | null>(() => {
    const saved = localStorage.getItem('active_workout_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentWorkoutTime, setCurrentWorkoutTime] = useState(0);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkoutData();
    }
  }, [user]);

  const enrichExercisesWithDetails = async (plans: any[]) => {
    // Buscar todos os exercícios da tabela exercises
    const { data: allExercises, error } = await supabase
      .from('exercises')
      .select('*');

    if (error || !allExercises) return plans;

    // Enriquecer cada plano com dados completos dos exercícios
    return plans.map(plan => {
      if (!Array.isArray(plan.exercises)) return plan;

      const enrichedExercises = plan.exercises.map((ex: any) => {
        // Os campos no banco têm prefixo "exercise_"
        const exerciseName = ex.exercise_name || ex.name;
        
        if (!exerciseName) return ex;

        // Buscar exercício correspondente pelo ID primeiro, depois pelo nome
        const fullExercise = allExercises.find(
          e => (ex.exercise_id && e.id === ex.exercise_id) || 
               (e.name && e.name.toLowerCase() === exerciseName.toLowerCase())
        );

        if (fullExercise) {
          // Retornar no formato esperado pelo componente (sem prefixo exercise_)
          return {
            id: fullExercise.id,
            name: fullExercise.name,
            description: ex.exercise_description || fullExercise.description,
            video_url: fullExercise.video_url,
            instructions: fullExercise.instructions,
            muscle_groups: fullExercise.muscle_groups,
            category: fullExercise.category,
            sets: parseInt(ex.sets) || 3,
            reps: ex.reps || '8-12',
            weight: ex.weight || undefined,
            rest_time: ex.rest_time || '60-90s',
            notes: ex.notes || ''
          };
        }

        // Se não encontrar na tabela exercises, retornar com formatação correta
        return {
          id: ex.exercise_id,
          name: exerciseName,
          description: ex.exercise_description,
          sets: parseInt(ex.sets) || 3,
          reps: ex.reps || '8-12',
          weight: ex.weight || undefined,
          rest_time: ex.rest_time || '60-90s',
          notes: ex.notes || ''
        };
      });

      return {
        ...plan,
        exercises: enrichedExercises
      };
    });
  };

  const loadWorkoutData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar planos de treino do cliente
      const { data: plans, error: plansError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('training_day', { ascending: true });

      if (!plansError && plans) {
        // Enriquecer com dados completos dos exercícios
        const enrichedPlans = await enrichExercisesWithDetails(plans);
        setWorkoutPlans(enrichedPlans);
      }

      // Carregar treinos programados para hoje
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: scheduled, error: scheduleError } = await supabase
        .from('workout_schedules')
        .select('*, workout_plans(*)')
        .eq('client_id', user.id)
        .eq('scheduled_date', today);

      if (!scheduleError && scheduled) {
        // Enriquecer workout_plans dentro de scheduled
        const enrichedScheduled = await Promise.all(
          scheduled.map(async (schedule) => {
            if (schedule.workout_plans) {
              const enriched = await enrichExercisesWithDetails([schedule.workout_plans]);
              return {
                ...schedule,
                workout_plans: enriched[0]
              };
            }
            return schedule;
          })
        );
        setScheduledToday(enrichedScheduled);
      }

      // Carregar estatísticas de treino
      const { data: stats, error: statsError } = await supabase
        .from('workout_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!statsError && stats) {
        setWorkoutStats(stats);
      }

    } catch (error) {
      console.error('Erro ao carregar dados de treino:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = (plan: WorkoutPlan) => {
    setActiveWorkoutPlan(plan);
    localStorage.setItem('active_workout_plan', JSON.stringify(plan));
    toast.success('Treino iniciado! Boa sorte!');
  };

  const handleCompleteWorkout = () => {
    // Não limpa o activeWorkoutPlan ainda, mantém para mostrar o feedback
    setShowFeedbackDialog(true);
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutPlan(null);
    localStorage.removeItem('active_workout_plan');
    localStorage.removeItem('workout_timer_active');
    localStorage.removeItem('workout_timer_seconds');
    localStorage.removeItem('workout_completed_exercises');
    toast.info('Treino cancelado');
  };

  const handleFeedbackClose = () => {
    setShowFeedbackDialog(false);
    setActiveWorkoutPlan(null);
    localStorage.removeItem('active_workout_plan');
    localStorage.removeItem('workout_timer_active');
    localStorage.removeItem('workout_timer_seconds');
    localStorage.removeItem('workout_completed_exercises');
    loadWorkoutData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se há treino ativo, mostrar tela de execução ou feedback
  if (activeWorkoutPlan) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {!showFeedbackDialog && (
          <ActiveWorkoutExecution
            workoutPlan={activeWorkoutPlan}
            onComplete={handleCompleteWorkout}
            onCancel={handleCancelWorkout}
          />
        )}
        
        <WorkoutFeedbackDialog
          isOpen={showFeedbackDialog}
          onClose={handleFeedbackClose}
          workoutDuration={currentWorkoutTime}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Dumbbell className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Treinos</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Seus planos de treino e acompanhamento de progresso
        </p>
      </div>

      {/* Treino Programado para Hoje */}
      {scheduledToday.length > 0 && (
        <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Treino Programado para Hoje - {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>
          
          <div className="grid gap-3">
            {scheduledToday.map((schedule) => (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {schedule.workout_plans?.name}
                      </h3>
                      {schedule.workout_plans?.training_day && (
                        <Badge variant="secondary">
                          Treino {schedule.workout_plans.training_day}
                        </Badge>
                      )}
                    </div>
                    {schedule.workout_plans?.description && (
                      <p className="text-sm text-muted-foreground">
                        {schedule.workout_plans.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      <strong>Exercícios:</strong> {Array.isArray(schedule.workout_plans?.exercises) 
                        ? schedule.workout_plans.exercises.length 
                        : 0}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => schedule.workout_plans && handleStartWorkout(schedule.workout_plans)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 text-center">
          <Target className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{workoutStats.total_workouts}</p>
          <p className="text-sm text-muted-foreground">Treinos Concluídos</p>
        </Card>
        
        <Card className="p-4 md:p-6 text-center">
          <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{Math.round(workoutStats.total_time_minutes / 60)}h</p>
          <p className="text-sm text-muted-foreground">Tempo Total</p>
        </Card>
        
        <Card className="p-4 md:p-6 text-center">
          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {workoutStats.total_workouts > 0 ? Math.round(workoutStats.total_time_minutes / workoutStats.total_workouts) : 0}min
          </p>
          <p className="text-sm text-muted-foreground">Média por Treino</p>
        </Card>
      </div>

      {/* Todos os Planos de Treino Disponíveis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Todos os Planos de Treino
        </h2>
        
        {workoutPlans.length > 0 ? (
          <div className="grid gap-4">
            {workoutPlans.map((plan) => (
              <Card key={plan.id} className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      {plan.training_day && (
                        <Badge variant="secondary">Treino {plan.training_day}</Badge>
                      )}
                      <Badge variant="default">{plan.status}</Badge>
                    </div>
                    
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      <strong>Exercícios:</strong> {Array.isArray(plan.exercises) ? plan.exercises.length : 0}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      Criado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleStartWorkout(plan)}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Treino
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum plano de treino disponível
            </h3>
            <p className="text-muted-foreground">
              Entre em contato com seu profissional para receber um plano personalizado
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkoutSection;