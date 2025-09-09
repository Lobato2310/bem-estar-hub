import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Zap, Moon, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface ProfessionalClientCheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

interface CheckinData {
  id: string;
  checkin_date: string;
  mood: number;
  energy: number;
  sleep_hours: number;
  notes: string | null;
}

export const ProfessionalClientCheckinDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName 
}: ProfessionalClientCheckinDialogProps) => {
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      loadCheckins();
    }
  }, [open, clientId]);

  const loadCheckins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select('id, checkin_date, mood, energy, sleep_hours, notes')
        .eq('client_id', clientId)
        .not('mood', 'is', null)
        .order('checkin_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao carregar check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodText = (mood: number) => {
    const labels = ["Muito baixo", "Baixo", "Neutro", "Bom", "Excelente"];
    return labels[mood - 1] || "N/A";
  };

  const getEnergyText = (energy: number) => {
    const labels = ["Muito baixa", "Baixa", "Moderada", "Alta", "Muito alta"];
    return labels[energy - 1] || "N/A";
  };

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "text-red-500";
    if (mood === 3) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Check-ins de {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando check-ins...</p>
            </div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum check-in encontrado para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <Card key={checkin.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(checkin.checkin_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Humor</p>
                        <p className={`font-medium ${getMoodColor(checkin.mood)}`}>
                          {getMoodText(checkin.mood)} ({checkin.mood}/5)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Energia</p>
                        <p className="font-medium">
                          {getEnergyText(checkin.energy)} ({checkin.energy}/5)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Sono</p>
                        <p className="font-medium">
                          {checkin.sleep_hours}h
                        </p>
                      </div>
                    </div>
                  </div>

                  {checkin.notes && (
                    <div className="mt-3 p-3 bg-accent rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Observações</p>
                          <p className="text-sm">{checkin.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};