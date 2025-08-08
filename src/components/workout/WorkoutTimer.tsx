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
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds(seconds => {
          const newSeconds = seconds + 1;
          onTimeUpdate(newSeconds);
          return newSeconds;
        });
      }, 1000);
    } else if (!isActive) {
      setSeconds(0);
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
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Timer className="h-6 w-6 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Tempo de Treino</p>
            <p className="text-2xl font-bold text-foreground">{formatTime(seconds)}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!isActive ? (
            <Button onClick={onStart} className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Iniciar</span>
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handlePause}
                className="flex items-center space-x-2"
              >
                <Pause className="h-4 w-4" />
                <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleStop}
                className="flex items-center space-x-2"
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