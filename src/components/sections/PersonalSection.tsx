import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dumbbell, Clock, Target, PlayCircle, Calendar, Trophy, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import WorkoutTimer from "@/components/workout/WorkoutTimer";
import WorkoutFeedbackDialog from "@/components/workout/WorkoutFeedbackDialog";
import ClientGoalsDialog from "@/components/profile/ClientGoalsDialog";
import ExerciseWeightDialog from "@/components/workout/ExerciseWeightDialog";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";

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

  const todayWorkout = {
    title: "Treino de Peito e Tríceps",
    exercises: ["Supino reto", "Supino inclinado", "Crucifixo", "Tríceps testa"],
    duration: "50 min",
    completed: false
  };

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Dumbbell className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Personal Trainer</h1>
        </div>
        <p className="text-lg text-muted-foreground">
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
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Treino de Hoje</span>
          </h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{todayWorkout.duration}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">{todayWorkout.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {todayWorkout.exercises.map((exercise, index) => (
              <div key={index} className="p-2 bg-background rounded-lg border group cursor-pointer hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{exercise}</span>
                  {isWorkoutActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExerciseWeight(exercise)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isWorkoutActive && (
            <Button className="w-full md:w-auto" onClick={handleStartWorkout}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Iniciar Treino
            </Button>
          )}
        </div>
      </Card>

      {/* Tipos de treino */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Tipos de Treino</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workoutTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{type.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{type.duration}</span>
                      </div>
                    </div>
                  </div>
                   <p className="text-muted-foreground">{type.description}</p>
                   <Button 
                     variant="outline" 
                     className="w-full"
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
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Seu Progresso</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Treinos Concluídos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0h</p>
            <p className="text-sm text-muted-foreground">Tempo Total</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0kg</p>
            <p className="text-sm text-muted-foreground">Peso Levantado</p>
          </div>
        </div>
      </Card>

      {/* Call to action */}
      <Card className="p-6 bg-accent border-accent">
        <div className="text-center space-y-4">
          <Target className="h-12 w-12 text-accent-foreground mx-auto" />
          <h3 className="text-xl font-semibold text-accent-foreground">Pronto para começar?</h3>
          <p className="text-accent-foreground/80">
            Configure seu perfil e objetivos para receber treinos personalizados
          </p>
          <Button onClick={() => setShowGoalsDialog(true)}>Configurar Perfil</Button>
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
          <WorkoutCalendar workoutType={selectedWorkoutType} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalSection;