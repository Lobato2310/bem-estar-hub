import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Camera, MessageSquare, User, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CheckinHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Use the actual database schema from client_checkins table
type Checkin = {
  id: string;
  checkin_date: string;
  client_id: string;
  mood: number | null;
  stress_level: number | null;
  sleep_quality: number | null;
  energy: number | null;
  notes: string | null;
  created_at: string;
}

const CheckinHistoryDialog = ({ open, onOpenChange }: CheckinHistoryDialogProps) => {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchCheckins();
    }
  }, [open, user]);

  const fetchCheckins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select('*')
        .eq('client_id', user?.id)
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
      toast.error('Erro ao carregar histórico de check-ins');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('exercise-videos').getPublicUrl(path);
    return data.publicUrl;
  };

  const getMoodText = (mood: number | null) => {
    if (!mood) return 'Não informado';
    if (mood >= 8) return 'Excelente';
    if (mood >= 6) return 'Bom';
    if (mood >= 4) return 'Regular';
    if (mood >= 2) return 'Ruim';
    return 'Muito ruim';
  };

  const getEnergyText = (energy: number | null) => {
    if (!energy) return 'Não informado';
    if (energy >= 8) return 'Muita energia';
    if (energy >= 6) return 'Boa energia';
    if (energy >= 4) return 'Energia moderada';
    if (energy >= 2) return 'Pouca energia';
    return 'Muito cansado';
  };

  if (selectedCheckin) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Check-in de {new Date(selectedCheckin.checkin_date).toLocaleDateString('pt-BR')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Check-in Psicológico
                </span>
              </div>
              <Button variant="outline" onClick={() => setSelectedCheckin(null)}>
                Voltar ao Histórico
              </Button>
            </div>

            {/* Estado Psicológico */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Estado Psicológico</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.mood ? `${selectedCheckin.mood}/10` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Humor</p>
                  <p className="text-xs text-muted-foreground">{getMoodText(selectedCheckin.mood)}</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.stress_level ? `${selectedCheckin.stress_level}/10` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Estresse</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.sleep_quality ? `${selectedCheckin.sleep_quality}/10` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Sono</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.energy ? `${selectedCheckin.energy}/10` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Energia</p>
                  <p className="text-xs text-muted-foreground">{getEnergyText(selectedCheckin.energy)}</p>
                </div>
              </div>
            </Card>

            {/* Data do Check-in */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Data do Check-in</h3>
              <p className="text-muted-foreground">
                {new Date(selectedCheckin.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedCheckin.created_at).toLocaleTimeString('pt-BR')}
              </p>
            </Card>

            {/* Observações do cliente */}
            {selectedCheckin.notes && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Suas Observações
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedCheckin.notes}
                </p>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Check-ins
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : checkins.length > 0 ? (
            checkins.map((checkin) => (
              <Card 
                key={checkin.id} 
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {new Date(checkin.checkin_date).toLocaleDateString('pt-BR')}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check-in Psicológico
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {checkin.mood && <span>Humor: {checkin.mood}/10</span>}
                      {checkin.energy && <span>Energia: {checkin.energy}/10</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {checkin.notes && (
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum check-in realizado ainda
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckinHistoryDialog;