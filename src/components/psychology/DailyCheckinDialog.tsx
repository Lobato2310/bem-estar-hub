import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Zap, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DailyCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DailyCheckinDialog = ({ open, onOpenChange }: DailyCheckinDialogProps) => {
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (mood === 0 || energy === 0) {
      toast.error("Por favor, avalie seu humor e energia");
      return;
    }

    setSubmitting(true);
    try {
      // Aqui você salvaria no banco de dados
      // await supabase.from('daily_checkins').insert({...})
      
      toast.success("Check-in diário registrado com sucesso!");
      onOpenChange(false);
      
      // Reset form
      setMood(0);
      setEnergy(0);
      setNotes("");
    } catch (error) {
      console.error('Erro ao salvar check-in:', error);
      toast.error("Erro ao registrar check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const moodLabels = ["😟 Muito baixo", "😕 Baixo", "😐 Neutro", "😊 Bom", "😄 Excelente"];
  const energyLabels = ["🔋 Muito baixa", "🔋 Baixa", "🔋 Moderada", "🔋 Alta", "🔋 Muito alta"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Check-in Diário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data */}
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">
              {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-sm text-muted-foreground">Como você está se sentindo hoje?</p>
          </div>

          {/* Humor */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <Label className="text-sm font-medium">Como está seu humor hoje?</Label>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setMood(level)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      mood === level 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <span className="text-sm">{moodLabels[level - 1]}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Energia */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <Label className="text-sm font-medium">Como está sua energia hoje?</Label>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergy(level)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      energy === level 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <span className="text-sm">{energyLabels[level - 1]}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Observações */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <Label className="text-sm font-medium">Observações (opcional)</Label>
              </div>
              <Textarea
                placeholder="Como foi seu dia? Algo importante aconteceu?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </Card>

          {/* Botões */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || mood === 0 || energy === 0}
              className="flex-1"
            >
              {submitting ? "Salvando..." : "Salvar Check-in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};