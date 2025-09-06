import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, User, Heart, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PsychologyCheckinHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Check-ins psicológicos - usando apenas os campos psicológicos
type PsychologyCheckin = {
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

const PsychologyCheckinHistoryDialog = ({ open, onOpenChange }: PsychologyCheckinHistoryDialogProps) => {
  const [checkins, setCheckins] = useState<PsychologyCheckin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<PsychologyCheckin | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchPsychologyCheckins();
    }
  }, [open, user]);

  const fetchPsychologyCheckins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select('id, checkin_date, client_id, mood, stress_level, sleep_quality, energy, notes, created_at')
        .eq('client_id', user?.id)
        .not('mood', 'is', null) // Apenas check-ins que têm dados psicológicos
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao buscar check-ins psicológicos:', error);
      toast.error('Erro ao carregar histórico de check-ins psicológicos');
    } finally {
      setLoading(false);
    }
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

  const getMoodColor = (mood: number | null) => {
    if (!mood) return 'text-muted-foreground';
    if (mood >= 8) return 'text-green-600';
    if (mood >= 6) return 'text-green-500';
    if (mood >= 4) return 'text-yellow-500';
    if (mood >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  if (selectedCheckin) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Check-in Psicológico - {new Date(selectedCheckin.checkin_date).toLocaleDateString('pt-BR')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com status */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                Relatório Psicológico
              </Badge>
              <Button variant="outline" onClick={() => setSelectedCheckin(null)}>
                Voltar ao Histórico
              </Button>
            </div>

            {/* Estado Psicológico */}
            <Card className="p-6 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Estado Emocional e Físico
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className={`text-3xl font-bold ${getMoodColor(selectedCheckin.mood)}`}>
                    {selectedCheckin.mood ? `${selectedCheckin.mood}/10` : '--'}
                  </div>
                  <p className="text-sm font-medium text-foreground">Humor</p>
                  <p className="text-xs text-muted-foreground">{getMoodText(selectedCheckin.mood)}</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCheckin.energy ? `${selectedCheckin.energy}/10` : '--'}
                  </div>
                  <p className="text-sm font-medium text-foreground">Energia</p>
                  <p className="text-xs text-muted-foreground">{getEnergyText(selectedCheckin.energy)}</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {selectedCheckin.stress_level ? `${selectedCheckin.stress_level}/10` : '--'}
                  </div>
                  <p className="text-sm font-medium text-foreground">Estresse</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-indigo-600">
                    {selectedCheckin.sleep_quality ? `${selectedCheckin.sleep_quality}/10` : '--'}
                  </div>
                  <p className="text-sm font-medium text-foreground">Qualidade do Sono</p>
                </div>
              </div>
            </Card>

            {/* Data do Check-in */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data do Check-in
              </h3>
              <p className="text-muted-foreground">
                {new Date(selectedCheckin.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedCheckin.created_at).toLocaleTimeString('pt-BR')}
              </p>
            </Card>

            {/* Observações do cliente */}
            {selectedCheckin.notes && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações Pessoais
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
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
            <Heart className="h-5 w-5 text-pink-500" />
            Histórico de Check-ins Psicológicos
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
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-pink-100 hover:border-pink-200"
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {new Date(checkin.checkin_date).toLocaleDateString('pt-BR')}
                      </h3>
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                        Psicológico
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {checkin.mood && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Humor: {checkin.mood}/10
                        </span>
                      )}
                      {checkin.energy && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Energia: {checkin.energy}/10
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {checkin.notes && (
                      <MessageSquare className="h-4 w-4 text-pink-600" />
                    )}
                    <Button variant="outline" size="sm" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum check-in psicológico realizado ainda
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PsychologyCheckinHistoryDialog;