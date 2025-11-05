import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, X, Plus, Minus } from "lucide-react";

interface RestTimerProps {
  restTime: number; // em segundos
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer = ({ restTime, onComplete, onSkip }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(restTime);
  const [totalRestTime, setTotalRestTime] = useState(restTime);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasPlayedSoundRef = useRef(false);

  // Função para tocar o som de alerta usando Web Audio API
  const playAlertSound = () => {
    if (hasPlayedSoundRef.current) return;
    hasPlayedSoundRef.current = true;

    try {
      // Criar contexto de áudio se não existir
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      
      // Criar oscilador para gerar o som
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Configurar som (frequência mais alta e agradável)
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      
      // Configurar volume com fade out
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
      
      // Tocar o som
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);

      // Repetir o som 3 vezes
      setTimeout(() => {
        const osc2 = context.createOscillator();
        const gain2 = context.createGain();
        osc2.connect(gain2);
        gain2.connect(context.destination);
        osc2.type = 'sine';
        osc2.frequency.value = 800;
        gain2.gain.setValueAtTime(0.3, context.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        osc2.start(context.currentTime);
        osc2.stop(context.currentTime + 0.5);
      }, 200);

      setTimeout(() => {
        const osc3 = context.createOscillator();
        const gain3 = context.createGain();
        osc3.connect(gain3);
        gain3.connect(context.destination);
        osc3.type = 'sine';
        osc3.frequency.value = 800;
        gain3.gain.setValueAtTime(0.3, context.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
        osc3.start(context.currentTime);
        osc3.stop(context.currentTime + 0.5);
      }, 400);
    } catch (error) {
      console.error("Erro ao tocar som:", error);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      playAlertSound();
      setTimeout(() => {
        onComplete();
      }, 600); // Dar tempo para o som tocar
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTime = () => {
    setTimeLeft(prev => prev + 10);
    setTotalRestTime(prev => prev + 10);
  };

  const handleReduceTime = () => {
    setTimeLeft(prev => Math.max(5, prev - 10));
    setTotalRestTime(prev => Math.max(5, prev - 10));
  };

  const percentage = ((totalRestTime - timeLeft) / totalRestTime) * 100;

  return (
    <Card className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm text-muted-foreground">Tempo de Descanso</p>
            <p className="text-2xl font-bold text-foreground">{formatTime(timeLeft)}</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Pular
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-3">
        <div 
          className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Time Adjustment Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReduceTime}
          disabled={timeLeft <= 5}
          className="flex items-center gap-1"
        >
          <Minus className="h-3 w-3" />
          <span className="text-xs">10s</span>
        </Button>
        <span className="text-xs text-muted-foreground">Ajustar tempo</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddTime}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          <span className="text-xs">10s</span>
        </Button>
      </div>
    </Card>
  );
};

export default RestTimer;
