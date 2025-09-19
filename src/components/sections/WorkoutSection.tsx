import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Clock, Calendar, TrendingUp, Target, Play } from "lucide-react";
import WorkoutTimer from "@/components/workout/WorkoutTimer";
import WorkoutFeedbackDialog from "@/components/workout/WorkoutFeedbackDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises: any;
  training_day?: string;
  status: string;
  created_at: string;
}

interface WorkoutStats {
  total_workouts: number;
  total_time_minutes: number;
}

const WorkoutSection = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({ total_workouts: 0, total_time_minutes: 0 });
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkoutTime, setCurrentWorkoutTime] = useState(0);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWorkoutData();
    }
  }, [user]);

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
        .order('created_at', { ascending: false });

      if (!plansError && plans) {
        setWorkoutPlans(plans);
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

  const handleStartWorkout = () => {
    setIsWorkoutActive(true);
    setCurrentWorkoutTime(0);
    toast.success('Treino iniciado! Boa sorte!');
  };

  const handlePauseWorkout = () => {
    toast.info('Treino pausado');
  };

  const handleStopWorkout = () => {
    setIsWorkoutActive(false);
    setShowFeedbackDialog(true);
  };

  const handleTimeUpdate = (seconds: number) => {
    setCurrentWorkoutTime(seconds);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackDialog(false);
    setCurrentWorkoutTime(0);
    // Recarregar estatísticas após o feedback
    loadWorkoutData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      {/* Timer de Treino */}
      <WorkoutTimer
        isActive={isWorkoutActive}
        onStart={handleStartWorkout}
        onPause={handlePauseWorkout}
        onStop={handleStopWorkout}
        onTimeUpdate={handleTimeUpdate}
      />

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

      {/* Planos de Treino */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Seus Planos de Treino
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
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleStartWorkout}
                      disabled={isWorkoutActive}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {isWorkoutActive ? 'Em Andamento' : 'Iniciar'}
                    </Button>
                  </div>
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

      {/* Dialog de Feedback */}
      <WorkoutFeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={handleFeedbackClose}
        workoutDuration={currentWorkoutTime}
      />
    </div>
  );
};

export default WorkoutSection;