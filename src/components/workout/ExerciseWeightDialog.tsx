import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell } from "lucide-react";

interface ExerciseWeightDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  onSubmit: (data: {
    exerciseName: string;
    sets: number;
    weight: number;
    reps: number;
    notes: string;
  }) => void;
}

const ExerciseWeightDialog = ({ isOpen, onClose, exerciseName, onSubmit }: ExerciseWeightDialogProps) => {
  const [sets, setSets] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!sets || !weight || !reps) return;

    onSubmit({
      exerciseName,
      sets: parseInt(sets),
      weight: parseFloat(weight),
      reps: parseInt(reps),
      notes
    });

    // Reset form
    setSets("");
    setWeight("");
    setReps("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5" />
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
              disabled={!sets || !weight || !reps}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseWeightDialog;