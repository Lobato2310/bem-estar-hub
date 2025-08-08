import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";

interface WorkoutFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    intensityLevel: number;
    difficultyLevel: number;
    notes: string;
  }) => void;
}

const WorkoutFeedbackDialog = ({ isOpen, onClose, onSubmit }: WorkoutFeedbackDialogProps) => {
  const [intensityLevel, setIntensityLevel] = useState([5]);
  const [difficultyLevel, setDifficultyLevel] = useState([5]);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit({
      intensityLevel: intensityLevel[0],
      difficultyLevel: difficultyLevel[0],
      notes
    });
    
    // Reset form
    setIntensityLevel([5]);
    setDifficultyLevel([5]);
    setNotes("");
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Finalizar Treino
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutFeedbackDialog;