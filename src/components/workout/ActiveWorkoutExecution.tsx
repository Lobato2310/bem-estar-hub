import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Timer as TimerIcon,
  Info,
  Video
} from "lucide-react";
import WorkoutTimer from "./WorkoutTimer";
import ExerciseDetailsDialog from "./ExerciseDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Exercise {
  id?: string;
  name: string;
  description?: string;
  sets: number;
  reps: string | number;
  weight?: number;
  rest_time?: string | number;
  notes?: string;
  muscle_groups?: string[];
  category?: string;
  video_url?: string;
  instructions?: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  training_day?: string;
  exercises: Exercise[];
}

interface ActiveWorkoutExecutionProps {
  workoutPlan: WorkoutPlan;
  onComplete: () => void;
  onCancel: () => void;
}

const ActiveWorkoutExecution = ({ workoutPlan, onComplete, onCancel }: ActiveWorkoutExecutionProps) => {
  const { user } = useAuth();
  const [isTimerActive, setIsTimerActive] = useState(() => {
    const saved = localStorage.getItem('workout_timer_active');
    return saved === 'true';
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('workout_completed_exercises');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedExerciseForDetails, setSelectedExerciseForDetails] = useState<Exercise | null>(null);

  // Salvar estado ao mudar
  useEffect(() => {
    localStorage.setItem('workout_timer_active', isTimerActive.toString());
  }, [isTimerActive]);

  useEffect(() => {
    localStorage.setItem('workout_completed_exercises', JSON.stringify(Array.from(completedExercises)));
  }, [completedExercises]);

  const handleStartTimer = () => {
    setIsTimerActive(true);
  };

  const handlePauseTimer = () => {
    // Timer handles its own pause state
  };

  const handleStopTimer = () => {
    setIsTimerActive(false);
    // Limpar estado persistido
    localStorage.removeItem('workout_timer_active');
    localStorage.removeItem('workout_timer_seconds');
    localStorage.removeItem('workout_completed_exercises');
    localStorage.removeItem('active_workout_plan');
    // Save workout completion
    onComplete();
  };

  const handleTimeUpdate = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleExerciseToggle = (index: number) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
        toast.info("Exercício desmarcado");
      } else {
        newSet.add(index);
        toast.success("Exercício concluído!");
      }
      return newSet;
    });
  };

  const handleShowDetails = (exercise: Exercise) => {
    setSelectedExerciseForDetails(exercise);
    setShowDetailsDialog(true);
  };

  const progressPercentage = (completedExercises.size / workoutPlan.exercises.length) * 100;

  return (
    <div className="space-y-4 pb-6 px-2">
      {/* Header */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {workoutPlan.name}
              {workoutPlan.training_day && (
                <Badge variant="secondary" className="ml-2">
                  Treino {workoutPlan.training_day}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedExercises.size} de {workoutPlan.exercises.length} exercícios concluídos
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </Card>

      {/* Timer */}
      <WorkoutTimer
        isActive={isTimerActive}
        onStart={handleStartTimer}
        onPause={handlePauseTimer}
        onStop={handleStopTimer}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Exercises List */}
      <Card className="p-3 md:p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm md:text-base">
          <TimerIcon className="h-5 w-5 text-primary" />
          Exercícios do Treino
        </h4>
        
        <ScrollArea className="h-[50vh] md:h-[400px] pr-2 md:pr-4">
          <div className="space-y-3">
            {workoutPlan.exercises.map((exercise, index) => {
              const isCompleted = completedExercises.has(index);
              
              return (
                <Card 
                  key={index} 
                  className={`p-3 md:p-4 cursor-pointer transition-all ${
                    isCompleted ? 'bg-accent/50 border-primary' : 'hover:bg-accent/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1" onClick={() => handleExerciseToggle(index)}>
                      <h5 className="font-medium text-foreground">{exercise.name}</h5>
                      {exercise.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          <strong>{exercise.sets}x</strong> séries
                        </span>
                        <span className="text-muted-foreground">
                          <strong>{exercise.reps}</strong> reps
                        </span>
                        {exercise.weight && (
                          <span className="text-muted-foreground">
                            <strong>{exercise.weight}kg</strong>
                          </span>
                        )}
                        {exercise.rest_time && (
                          <span className="text-muted-foreground">
                            Descanso: <strong>{exercise.rest_time}s</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {exercise.video_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDetails(exercise);
                          }}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDetails(exercise);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Exercise Details Dialog */}
      <ExerciseDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false);
          setSelectedExerciseForDetails(null);
        }}
        exercise={selectedExerciseForDetails}
      />
    </div>
  );
};

export default ActiveWorkoutExecution;