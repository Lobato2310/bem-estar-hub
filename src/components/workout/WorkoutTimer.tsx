import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer } from "lucide-react";
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

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
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar estado inicial do Preferences
  useEffect(() => {
    const loadState = async () => {
      const { value: startTime } = await Preferences.get({ key: 'workout_start_time' });
      const { value: pausedTime } = await Preferences.get({ key: 'workout_paused_time' });
      const { value: isPausedState } = await Preferences.get({ key: 'workout_is_paused' });
      
      if (startTime) {
        startTimeRef.current = parseInt(startTime);
        pausedTimeRef.current = pausedTime ? parseInt(pausedTime) : 0;
        setIsPaused(isPausedState === 'true');
        
        // Calcular tempo decorrido
        if (isPausedState !== 'true') {
          const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000) - pausedTimeRef.current;
          setSeconds(elapsed);
          onTimeUpdate(elapsed);
        } else {
          setSeconds(pausedTimeRef.current);
          onTimeUpdate(pausedTimeRef.current);
        }
      }
    };
    
    loadState();
  }, []);

  // Listener para quando o app volta do background
  useEffect(() => {
    const listener = App.addListener('appStateChange', async ({ isActive: appIsActive }) => {
      if (appIsActive && isActive && !isPaused && startTimeRef.current) {
        // App voltou para foreground, recalcular tempo
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) - pausedTimeRef.current;
        setSeconds(elapsed);
        onTimeUpdate(elapsed);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [isActive, isPaused, onTimeUpdate]);

  // Timer principal
  useEffect(() => {
    if (isActive && !isPaused) {
      // Se não temos startTime, criar um agora
      if (!startTimeRef.current) {
        const now = Date.now();
        startTimeRef.current = now;
        Preferences.set({ key: 'workout_start_time', value: now.toString() });
        Preferences.set({ key: 'workout_paused_time', value: '0' });
      }

      // Atualizar a cada segundo
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000) - pausedTimeRef.current;
          setSeconds(elapsed);
          onTimeUpdate(elapsed);
        }
      }, 1000);
    } else if (!isActive) {
      // Timer foi parado completamente
      if (intervalRef.current) clearInterval(intervalRef.current);
      startTimeRef.current = null;
      pausedTimeRef.current = 0;
      setSeconds(0);
      Preferences.remove({ key: 'workout_start_time' });
      Preferences.remove({ key: 'workout_paused_time' });
      Preferences.remove({ key: 'workout_is_paused' });
    } else if (isPaused) {
      // Timer foi pausado
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
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

  const handlePause = async () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      // Pausando - salvar tempo atual
      pausedTimeRef.current = seconds;
      await Preferences.set({ key: 'workout_paused_time', value: seconds.toString() });
      await Preferences.set({ key: 'workout_is_paused', value: 'true' });
    } else {
      // Despausando - ajustar o startTime para compensar o tempo pausado
      if (startTimeRef.current) {
        const pauseDuration = seconds - pausedTimeRef.current;
        startTimeRef.current = Date.now() - (seconds * 1000);
        await Preferences.set({ key: 'workout_start_time', value: startTimeRef.current.toString() });
        await Preferences.set({ key: 'workout_is_paused', value: 'false' });
      }
    }
    
    onPause();
  };

  const handleStop = async () => {
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    await Preferences.remove({ key: 'workout_start_time' });
    await Preferences.remove({ key: 'workout_paused_time' });
    await Preferences.remove({ key: 'workout_is_paused' });
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