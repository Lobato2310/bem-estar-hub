import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WorkoutFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workoutDuration?: number;
  onSubmit?: (feedback: {
    intensityLevel: number;
    difficultyLevel: number;
    notes: string;
  }) => void;
}

const WorkoutFeedbackDialog = ({ isOpen, onClose, workoutDuration, onSubmit }: WorkoutFeedbackDialogProps) => {
  const { user } = useAuth();
  const [intensityLevel, setIntensityLevel] = useState([5]);
  const [difficultyLevel, setDifficultyLevel] = useState([5]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Salvar feedback no banco de dados
      await supabase.from('client_checkins').insert({
        client_id: user.id,
        checkin_date: new Date().toISOString().split('T')[0],
        checkin_type: 'workout_feedback',
        energy: intensityLevel[0],
        mood: difficultyLevel[0],
        notes: notes || null,
        status: 'completed'
      });

      // Incrementar estatísticas de treino se houver duração
      if (workoutDuration) {
        await supabase.rpc('increment_workout_stats', {
          workout_duration_minutes: Math.round(workoutDuration / 60)
        });
      }

      toast.success('Feedback registrado com sucesso!');
      
      // Callback opcional para compatibilidade
      if (onSubmit) {
        onSubmit({
          intensityLevel: intensityLevel[0],
          difficultyLevel: difficultyLevel[0],
          notes
        });
      }
      
      onClose();
      
      // Reset form
      setIntensityLevel([5]);
      setDifficultyLevel([5]);
      setNotes("");
      
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      toast.error('Erro ao registrar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 2) return "Muito Leve";
    if (value <= 4) return "Leve";
    if (value <= 6) return "Moderado";
    if (value <= 8) return "Intenso";
    return "Muito Intenso";
  };

  const getDifficultyLabel = (value: number) => {
    if (value <= 2) return "Muito Fácil";
    if (value <= 4) return "Fácil";
    if (value <= 6) return "Moderado";
    if (value <= 8) return "Difícil";
    return "Muito Difícil";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Como foi seu treino?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <Label>Nível de Intensidade: {getIntensityLabel(intensityLevel[0])}</Label>
              <Slider
                value={intensityLevel}
                onValueChange={setIntensityLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muito Leve</span>
                <span>Muito Intenso</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-4">
              <Label>Nível de Dificuldade: {getDifficultyLabel(difficultyLevel[0])}</Label>
              <Slider
                value={difficultyLevel}
                onValueChange={setDifficultyLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muito Fácil</span>
                <span>Muito Difícil</span>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como se sentiu durante o treino? Alguma observação?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Finalizar Treino"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutFeedbackDialog;