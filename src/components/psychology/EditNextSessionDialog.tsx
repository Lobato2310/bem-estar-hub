import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface EditNextSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  currentDate?: string;
  currentTime?: string;
}

export function EditNextSessionDialog({
  open,
  onOpenChange,
  clientName,
  currentDate = "",
  currentTime = ""
}: EditNextSessionDialogProps) {
  const [date, setDate] = useState(currentDate);
  const [time, setTime] = useState(currentTime);

  const handleSave = () => {
    if (!date || !time) {
      toast.error("Por favor, preencha data e horário da sessão");
      return;
    }

    // Here you would normally save to database
    toast.success(`Próxima sessão de ${clientName} agendada para ${date} às ${time}`);
    onOpenChange(false);
    
    // Reset form
    setDate("");
    setTime("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Editar Próxima Sessão - {clientName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data da Sessão
            </Label>
            <Input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário da Sessão
            </Label>
            <Input
              id="session-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}