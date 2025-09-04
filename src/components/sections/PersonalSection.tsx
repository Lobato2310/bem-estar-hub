import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Clock, Target, PlayCircle, Calendar, Trophy, Plus, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import WorkoutTimer from "@/components/workout/WorkoutTimer";
import WorkoutFeedbackDialog from "@/components/workout/WorkoutFeedbackDialog";
import ClientGoalsDialog from "@/components/profile/ClientGoalsDialog";
import ExerciseWeightDialog from "@/components/workout/ExerciseWeightDialog";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";
import ExerciseManagement from "@/components/professional/ExerciseManagement";
import ClientSelector from "@/components/professional/ClientSelector";

const PersonalSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentWorkoutSession, setCurrentWorkoutSession] = useState<string | null>(null);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [showWorkoutCalendar, setShowWorkoutCalendar] = useState(false);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<"musculacao" | "cardio">("musculacao");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(data);
      }
    };

    const fetchTodayWorkout = async () => {
      if (user) {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const { data: scheduleData, error } = await supabase
          .from('workout_schedules')
          .select('*')
          .eq('client_id', user.id)
          .eq('scheduled_date', today)
          .maybeSingle();

        if (error) {
          console.error('Error fetching today workout:', error);
          return;
        }

        if (scheduleData?.workout_plan_id) {
          // Fetch the workout plan separately
          const { data: planData, error: planError } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('id', scheduleData.workout_plan_id)
            .single();

          if (planError) {
            console.error('Error fetching workout plan:', planError);
            return;
          }

          if (planData) {
            setTodayWorkout({
              title: planData.name,
              duration: "45-60 min",
              exercises: Array.isArray(planData.exercises) 
                ? planData.exercises.map((ex: any) => ex.exercise_name).filter(Boolean)
                : []
            });
          }
        }
      }
    };

    fetchUserProfile();
    fetchTodayWorkout();
  }, [user]);
  const workoutTypes = [
    { 
      title: "Musculação", 
      description: "Treinos focados em força e hipertrofia",
      duration: "45-60 min",
      icon: Dumbbell 
    },
    { 
      title: "Corrida/Cardio", 
      description: "Planilhas estilo MFIT para resistência",
      duration: "30-45 min",
      icon: PlayCircle 
    },
  ];

  const [todayWorkout, setTodayWorkout] = useState<any>(null);

  const handleStartWorkout = async () => {
    if (!user) return;

    try {
      // For now, use local state since workout_sessions table doesn't exist
      const sessionId = Date.now().toString();
      setCurrentWorkoutSession(sessionId);
      setIsWorkoutActive(true);
      toast({
        title: "Treino iniciado!",
        description: "Bom treino! Lembre-se de registrar os pesos dos exercícios."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o treino",
        variant: "destructive"
      });
    }
  };

  const handlePauseWorkout = () => {
    // Timer já gerencia o pause internamente
  };

  const handleStopWorkout = () => {
    setShowFeedbackDialog(true);
  };

  const handleWorkoutFeedback = async (feedback: {
    intensityLevel: number;
    difficultyLevel: number;
    notes: string;
  }) => {
    if (!currentWorkoutSession) return;

    try {
      // For now, just store locally since workout_sessions table doesn't exist
      localStorage.setItem(`workout_${currentWorkoutSession}`, JSON.stringify({
        endTime: new Date().toISOString(),
        duration: Math.round(workoutDuration / 60),
        ...feedback
      }));

      setIsWorkoutActive(false);
      setCurrentWorkoutSession(null);
      setWorkoutDuration(0);
      setShowFeedbackDialog(false);
      
      toast({
        title: "Treino finalizado!",
        description: "Parabéns! Seu treino foi registrado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o treino",
        variant: "destructive"
      });
    }
  };

  const handleExerciseWeight = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setShowExerciseDialog(true);
  };

  const handleSaveExerciseLog = async (data: {
    exerciseName: string;
    sets: number;
    weight: number;
    reps: number;
    notes: string;
  }) => {
    if (!currentWorkoutSession) {
      toast({
        title: "Erro",
        description: "Inicie um treino primeiro para registrar os exercícios",
        variant: "destructive"
      });
      return;
    }

    try {
      // For now, store in local storage since exercise_logs table doesn't exist
      const exerciseKey = `exercise_${currentWorkoutSession}_${Date.now()}`;
      localStorage.setItem(exerciseKey, JSON.stringify(data));

      toast({
        title: "Exercício registrado!",
        description: `${data.exerciseName}: ${data.sets}x${data.reps} com ${data.weight}kg`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o exercício",
        variant: "destructive"
      });
    }
  };

  // Se for profissional, mostrar interface diferente
  if (userProfile?.user_type === "professional") {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Dumbbell className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Painel Profissional</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gerencie exercícios e clientes
          </p>
        </div>

        <Tabs defaultValue="exercises" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercises" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Exercícios</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="workouts" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Treinos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="mt-6">
            <ExerciseManagement />
          </TabsContent>

          <TabsContent value="clients" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientSelector 
                onClientSelect={setSelectedClient}
                selectedClientId={selectedClient?.user_id}
              />
              {selectedClient && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Perfil do Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <strong>Nome:</strong> {selectedClient.display_name || "Nome não informado"}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedClient.email}
                    </div>
                    <div>
                      <strong>Cliente desde:</strong> {new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="mt-6">
            {selectedClient ? (
              <WorkoutCalendar 
                workoutType="musculacao" 
                viewMode="professional" 
                clientId={selectedClient.user_id}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Selecione um cliente na aba "Clientes" para gerenciar seus treinos
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Dumbbell className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Personal Trainer</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground px-4">
          Treinos personalizados para alcançar seus objetivos
        </p>
      </div>

      {/* Timer de treino */}
      <WorkoutTimer
        isActive={isWorkoutActive}
        onStart={handleStartWorkout}
        onPause={handlePauseWorkout}
        onStop={handleStopWorkout}
        onTimeUpdate={setWorkoutDuration}
      />

      {/* Treino de hoje */}
      {todayWorkout ? (
        <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center space-x-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span>Treino de Hoje</span>
            </h2>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
              <Clock className="h-3 w-3 md:h-4 md:w-4" />
              <span>{todayWorkout.duration}</span>
            </div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-medium text-foreground">{todayWorkout.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {todayWorkout.exercises?.map((exercise, index) => (
                <div key={index} className="p-3 bg-background rounded-lg border group cursor-pointer hover:bg-accent transition-colors min-h-[50px]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm md:text-base text-foreground flex-1">{exercise}</span>
                    {isWorkoutActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExerciseWeight(exercise)}
                        className="opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity p-2 h-8 w-8 ml-2 flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )) || []}
            </div>
            {!isWorkoutActive && (
              <Button className="w-full" onClick={handleStartWorkout}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Iniciar Treino
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-4 md:p-6 bg-gradient-to-r from-muted/50 to-muted/20">
          <div className="text-center space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium text-foreground">Nenhum treino programado</h3>
            <p className="text-muted-foreground">Seu personal trainer ainda não criou um plano de treino para hoje.</p>
            <Button variant="outline" onClick={() => setShowGoalsDialog(true)}>
              Configurar Perfil
            </Button>
          </div>
        </Card>
      )}

      {/* Tipos de treino */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Tipos de Treino</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {workoutTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card key={index} className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 md:p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold text-foreground">{type.title}</h3>
                      <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 md:h-4 md:w-4" />
                        <span>{type.duration}</span>
                      </div>
                    </div>
                  </div>
                   <p className="text-sm md:text-base text-muted-foreground">{type.description}</p>
                   <Button 
                     variant="outline" 
                     className="w-full min-h-[44px]"
                     onClick={() => {
                       setSelectedWorkoutType(type.title === "Musculação" ? "musculacao" : "cardio");
                       setShowWorkoutCalendar(true);
                     }}
                   >
                     Ver Calendário
                   </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progresso */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Trophy className="h-4 w-4 md:h-5 md:w-5" />
          <span>Seu Progresso</span>
        </h2>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-xl md:text-2xl font-bold text-primary">0</p>
            <p className="text-xs md:text-sm text-muted-foreground">Treinos Concluídos</p>
          </div>
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-xl md:text-2xl font-bold text-primary">0h</p>
            <p className="text-xs md:text-sm text-muted-foreground">Tempo Total</p>
          </div>
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-xl md:text-2xl font-bold text-primary">0kg</p>
            <p className="text-xs md:text-sm text-muted-foreground">Peso Levantado</p>
          </div>
        </div>
      </Card>

      {/* Call to action */}
      <Card className="p-4 md:p-6 bg-accent border-accent">
        <div className="text-center space-y-3 md:space-y-4">
          <Target className="h-10 w-10 md:h-12 md:w-12 text-accent-foreground mx-auto" />
          <h3 className="text-lg md:text-xl font-semibold text-accent-foreground">Pronto para começar?</h3>
          <p className="text-sm md:text-base text-accent-foreground/80 px-4">
            Configure seu perfil e objetivos para receber treinos personalizados
          </p>
          <Button onClick={() => setShowGoalsDialog(true)} className="min-h-[44px]">Configurar Perfil</Button>
        </div>
      </Card>

      {/* Dialogs */}
      <WorkoutFeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        onSubmit={handleWorkoutFeedback}
      />

      <ClientGoalsDialog
        isOpen={showGoalsDialog}
        onClose={() => setShowGoalsDialog(false)}
      />

      <ExerciseWeightDialog
        isOpen={showExerciseDialog}
        onClose={() => setShowExerciseDialog(false)}
        exerciseName={selectedExercise}
        onSubmit={handleSaveExerciseLog}
      />

      {/* Workout Calendar Dialog */}
      <Dialog open={showWorkoutCalendar} onOpenChange={setShowWorkoutCalendar}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Calendário de Treinos - {selectedWorkoutType === "musculacao" ? "Musculação" : "Corrida/Cardio"}
            </DialogTitle>
          </DialogHeader>
          <WorkoutCalendar workoutType={selectedWorkoutType} clientId={user?.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalSection;