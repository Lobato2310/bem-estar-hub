import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Dumbbell, AlertCircle } from "lucide-react";

interface ExerciseLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  exerciseData?: {
    sets: number;
    reps: number;
    weight?: number;
    rest_time?: number;
  };
  onSubmit: (data: {
    sets: number;
    reps: number;
    weight: number;
    effortPerception: number;
    jointDiscomfort: string;
    notes: string;
  }) => void;
}

const ExerciseLogDialog = ({ isOpen, onClose, exerciseName, exerciseData, onSubmit }: ExerciseLogDialogProps) => {
  const [sets, setSets] = useState(exerciseData?.sets?.toString() || "");
  const [reps, setReps] = useState(exerciseData?.reps?.toString() || "");
  const [weight, setWeight] = useState(exerciseData?.weight?.toString() || "");
  const [effortPerception, setEffortPerception] = useState([5]);
  const [jointDiscomfort, setJointDiscomfort] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!sets || !reps || !weight) return;

    onSubmit({
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: parseFloat(weight),
      effortPerception: effortPerception[0],
      jointDiscomfort,
      notes
    });

    // Reset form
    setSets("");
    setReps("");
    setWeight("");
    setEffortPerception([5]);
    setJointDiscomfort("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span>{exerciseName}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sets">Séries</Label>
              <Input
                id="sets"
                type="number"
                placeholder="4"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                placeholder="10"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="20"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <div>
            <Label>Percepção de Esforço: {effortPerception[0]}/10</Label>
            <Slider
              value={effortPerception}
              onValueChange={setEffortPerception}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Muito Fácil</span>
              <span>Muito Difícil</span>
            </div>
          </div>

          <div>
            <Label htmlFor="joint-discomfort" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Desconforto em Articulações
            </Label>
            <Input
              id="joint-discomfort"
              placeholder="Ex: Joelho esquerdo, Ombro direito..."
              value={jointDiscomfort}
              onChange={(e) => setJointDiscomfort(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="exercise-notes">Observações</Label>
            <Textarea
              id="exercise-notes"
              placeholder="Como foi o exercício? Alguma dificuldade?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!sets || !reps || !weight}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseLogDialog;