import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Camera, MessageSquare, Scale, Ruler, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { translateGoal } from "@/lib/goalTranslations";

interface MeasurementsCheckinHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Check-ins de medidas - usando apenas os campos de medidas físicas
type MeasurementsCheckin = {
  id: string;
  checkin_date: string;
  client_id: string;
  checkin_type: string | null;
  belly_circumference: number | null;
  hip_circumference: number | null;
  left_thigh: number | null;
  right_thigh: number | null;
  next_goal: string | null;
  observations: string | null;
  front_photo_url: string | null;
  side_photo_url: string | null;
  back_photo_url: string | null;
  status: string | null;
  created_at: string;
}

const MeasurementsCheckinHistoryDialog = ({ open, onOpenChange }: MeasurementsCheckinHistoryDialogProps) => {
  const [checkins, setCheckins] = useState<MeasurementsCheckin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<MeasurementsCheckin | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<{[key: string]: string}>({});
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchMeasurementsCheckins();
    }
  }, [open, user]);

  const fetchMeasurementsCheckins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select(`
          id, checkin_date, client_id, checkin_type, belly_circumference, 
          hip_circumference, left_thigh, right_thigh, next_goal, observations,
          front_photo_url, side_photo_url, back_photo_url, status, created_at
        `)
        .eq('client_id', user?.id)
        .not('checkin_type', 'is', null) // Apenas check-ins que têm dados de medidas
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao buscar check-ins de medidas:', error);
      toast.error('Erro ao carregar histórico de medidas');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = async (path: string | null) => {
    if (!path) return null;
    
    console.log('Tentando gerar URL para foto:', path);
    
    try {
      const { data, error } = await supabase.storage
        .from('checkin-photos')
        .createSignedUrl(path, 3600); // URL válida por 1 hora
      
      if (error) {
        console.error('Erro ao gerar URL da foto:', error);
        return null;
      }
      
      console.log('URL gerada com sucesso:', data.signedUrl);
      return data.signedUrl;
    } catch (error) {
      console.error('Erro ao acessar foto:', error);
      return null;
    }
  };

  const getCheckinTypeText = (type: string | null) => {
    if (type === 'biweekly') return 'Quinzenal';
    if (type === 'monthly') return 'Mensal';
    return 'Check-in';
  };

  useEffect(() => {
    if (selectedCheckin) {
      loadPhotos();
    }
  }, [selectedCheckin]);

  const loadPhotos = async () => {
    if (!selectedCheckin) return;
    
    console.log('Carregando fotos para check-in:', selectedCheckin.id);
    console.log('URLs das fotos:', {
      front: selectedCheckin.front_photo_url,
      side: selectedCheckin.side_photo_url,
      back: selectedCheckin.back_photo_url
    });
    
    const urls: {[key: string]: string} = {};
    
    if (selectedCheckin.front_photo_url) {
      const url = await getPhotoUrl(selectedCheckin.front_photo_url);
      if (url) urls.front = url;
    }
    
    if (selectedCheckin.side_photo_url) {
      const url = await getPhotoUrl(selectedCheckin.side_photo_url);
      if (url) urls.side = url;
    }
    
    if (selectedCheckin.back_photo_url) {
      const url = await getPhotoUrl(selectedCheckin.back_photo_url);
      if (url) urls.back = url;
    }
    
    console.log('URLs finais geradas:', urls);
    setPhotoUrls(urls);
  };

  if (selectedCheckin) {
    const frontPhotoUrl = photoUrls.front;
    const sidePhotoUrl = photoUrls.side;
    const backPhotoUrl = photoUrls.back;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              Check-in de Medidas - {new Date(selectedCheckin.checkin_date).toLocaleDateString('pt-BR')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header com status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {getCheckinTypeText(selectedCheckin.checkin_type)}
                </Badge>
                {selectedCheckin.status && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {selectedCheckin.status === 'completed' ? 'Completo' : selectedCheckin.status}
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={() => setSelectedCheckin(null)}>
                Voltar ao Histórico
              </Button>
            </div>

            {/* Fotos de Progresso */}
            {(frontPhotoUrl || sidePhotoUrl || backPhotoUrl) && (
              <Card className="p-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Fotos de Progresso
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {frontPhotoUrl && (
                     <div className="space-y-2">
                       <p className="text-sm font-medium text-center">Frente</p>
                       <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                         <img 
                           src={frontPhotoUrl} 
                           alt="Foto frontal" 
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             console.error('Erro ao carregar foto frontal:', e);
                             e.currentTarget.style.display = 'none';
                           }}
                         />
                       </div>
                     </div>
                   )}
                   {sidePhotoUrl && (
                     <div className="space-y-2">
                       <p className="text-sm font-medium text-center">Perfil</p>
                       <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                         <img 
                           src={sidePhotoUrl} 
                           alt="Foto de perfil" 
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             console.error('Erro ao carregar foto de perfil:', e);
                             e.currentTarget.style.display = 'none';
                           }}
                         />
                       </div>
                     </div>
                   )}
                   {backPhotoUrl && (
                     <div className="space-y-2">
                       <p className="text-sm font-medium text-center">Costas</p>
                       <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer">
                         <img 
                           src={backPhotoUrl} 
                           alt="Foto das costas" 
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             console.error('Erro ao carregar foto das costas:', e);
                             e.currentTarget.style.display = 'none';
                           }}
                         />
                       </div>
                     </div>
                   )}
                 </div>
              </Card>
            )}

            {/* Medidas Corporais */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-green-500" />
                Medidas Corporais
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedCheckin.belly_circumference && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCheckin.belly_circumference} cm
                    </div>
                    <p className="text-sm text-muted-foreground">Circunf. Barriga</p>
                  </div>
                )}
                {selectedCheckin.hip_circumference && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCheckin.hip_circumference} cm
                    </div>
                    <p className="text-sm text-muted-foreground">Circunf. Quadril</p>
                  </div>
                )}
                {selectedCheckin.left_thigh && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCheckin.left_thigh} cm
                    </div>
                    <p className="text-sm text-muted-foreground">Coxa Esquerda</p>
                  </div>
                )}
                {selectedCheckin.right_thigh && (
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-indigo-600">
                      {selectedCheckin.right_thigh} cm
                    </div>
                    <p className="text-sm text-muted-foreground">Coxa Direita</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Meta para o próximo check-in */}
            {selectedCheckin.next_goal && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  Meta para o Próximo Check-in
                </h3>
                <p className="text-muted-foreground">
                  {translateGoal(selectedCheckin.next_goal)}
                </p>
              </Card>
            )}

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
            {selectedCheckin.observations && (
              <Card className="p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                  {selectedCheckin.observations}
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
            <Scale className="h-5 w-5 text-blue-500" />
            Histórico de Check-ins de Medidas
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
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-blue-100 hover:border-blue-200"
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">
                        {new Date(checkin.checkin_date).toLocaleDateString('pt-BR')}
                      </h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {getCheckinTypeText(checkin.checkin_type)}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {checkin.belly_circumference && (
                        <span>Barriga: {checkin.belly_circumference}cm</span>
                      )}
                      {checkin.hip_circumference && (
                        <span>Quadril: {checkin.hip_circumference}cm</span>
                      )}
                      {(checkin.front_photo_url || checkin.side_photo_url || checkin.back_photo_url) && (
                        <span className="flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          Com fotos
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {checkin.observations && (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    )}
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum check-in de medidas realizado ainda
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeasurementsCheckinHistoryDialog;