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

interface Checkin {
  id: string;
  checkin_date: string;
  checkin_type: string;
  belly_circumference: number;
  hip_circumference: number;
  left_thigh: number;
  right_thigh: number;
  next_goal: string;
  observations: string;
  front_photo_url: string;
  side_photo_url: string;
  back_photo_url: string;
  status: string;
  nutritionist_feedback: string;
  feedback_date: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Realizado';
      case 'reviewed':
        return 'Avaliado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Indefinido';
    }
  };

  const getGoalText = (goal: string) => {
    switch (goal) {
      case 'mass_gain':
        return 'Ganho de massa';
      case 'fat_loss':
        return 'Diminuição da gordura';
      case 'maintenance':
        return 'Manutenção do corpo';
      default:
        return goal;
    }
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
                <Badge className={getStatusColor(selectedCheckin.status)}>
                  {getStatusText(selectedCheckin.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedCheckin.checkin_type === 'biweekly' ? 'Check-in Quinzenal' : 'Check-in Mensal'}
                </span>
              </div>
              <Button variant="outline" onClick={() => setSelectedCheckin(null)}>
                Voltar ao Histórico
              </Button>
            </div>

            {/* Fotos */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Fotos de Avaliação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Frente', url: getPhotoUrl(selectedCheckin.front_photo_url) },
                  { label: 'Lado', url: getPhotoUrl(selectedCheckin.side_photo_url) },
                  { label: 'Costas', url: getPhotoUrl(selectedCheckin.back_photo_url) }
                ].map((photo, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium">{photo.label}</h4>
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={`Foto ${photo.label}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg border flex items-center justify-center">
                        <span className="text-muted-foreground">Sem foto</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Medidas */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Medidas Corporais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.belly_circumference ? `${selectedCheckin.belly_circumference}cm` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Barriga</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.hip_circumference ? `${selectedCheckin.hip_circumference}cm` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Quadril</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.left_thigh ? `${selectedCheckin.left_thigh}cm` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Coxa Esq.</p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCheckin.right_thigh ? `${selectedCheckin.right_thigh}cm` : '--'}
                  </p>
                  <p className="text-sm text-muted-foreground">Coxa Dir.</p>
                </div>
              </div>
            </Card>

            {/* Objetivo e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Objetivo</h3>
                <p className="text-muted-foreground">
                  {selectedCheckin.next_goal ? getGoalText(selectedCheckin.next_goal) : 'Não informado'}
                </p>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Data do Check-in</h3>
                <p className="text-muted-foreground">
                  {new Date(selectedCheckin.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedCheckin.created_at).toLocaleTimeString('pt-BR')}
                </p>
              </Card>
            </div>

            {/* Observações do cliente */}
            {selectedCheckin.observations && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Suas Observações
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedCheckin.observations}
                </p>
              </Card>
            )}

            {/* Feedback do nutricionista */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback do Nutricionista
              </h3>
              {selectedCheckin.nutritionist_feedback ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedCheckin.nutritionist_feedback}
                  </p>
                  {selectedCheckin.feedback_date && (
                    <p className="text-xs text-muted-foreground">
                      Avaliado em: {new Date(selectedCheckin.feedback_date).toLocaleDateString('pt-BR')} às {new Date(selectedCheckin.feedback_date).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 bg-muted/50 rounded-lg">
                  <div className="text-center space-y-2">
                    <Star className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">
                      {selectedCheckin.status === 'pending' 
                        ? 'Aguardando feedback do nutricionista...' 
                        : 'Nenhum feedback disponível'}
                    </p>
                  </div>
                </div>
              )}
            </Card>
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
                      <Badge className={getStatusColor(checkin.status)}>
                        {getStatusText(checkin.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {checkin.checkin_type === 'biweekly' ? 'Check-in Quinzenal' : 'Check-in Mensal'}
                    </p>
                    {checkin.next_goal && (
                      <p className="text-sm text-muted-foreground">
                        Objetivo: {getGoalText(checkin.next_goal)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {checkin.nutritionist_feedback && (
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