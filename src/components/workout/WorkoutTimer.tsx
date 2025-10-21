import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer } from "lucide-react";

interface WorkoutTimerProps {
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onTimeUpdate: (seconds: number) => void;
}

const WorkoutTimer = ({ isActive, onStart, onPause, onStop, onTimeUpdate }: WorkoutTimerProps) => {
  const [seconds, setSeconds] = useState(() => {
    const saved = localStorage.getItem('workout_timer_seconds');
    return saved ? parseInt(saved) : 0;
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          const newSeconds = seconds + 1;
          onTimeUpdate(newSeconds);
          localStorage.setItem('workout_timer_seconds', newSeconds.toString());
          return newSeconds;
        });
      }, 1000);
    } else if (!isActive) {
      setSeconds(0);
      localStorage.removeItem('workout_timer_seconds');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    onPause();
  };

  const handleStop = () => {
    setIsPaused(false);
    onStop();
  };

  return (
    <Card className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Timer className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">Tempo de Treino</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{formatTime(seconds)}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          {!isActive ? (
            <Button onClick={onStart} className="flex items-center space-x-2 flex-1 sm:flex-initial">
              <Play className="h-4 w-4" />
              <span>Iniciar</span>
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handlePause}
                className="flex items-center space-x-2 flex-1 sm:flex-initial"
              >
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">{isPaused ? 'Continuar' : 'Pausar'}</span>
                <span className="sm:hidden">{isPaused ? 'Continuar' : 'Pausar'}</span>
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleStop}
                className="flex items-center space-x-2 flex-1 sm:flex-initial"
              >
                <Square className="h-4 w-4" />
                <span>Finalizar</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WorkoutTimer;