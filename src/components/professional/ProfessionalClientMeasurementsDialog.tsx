import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, Calendar, ArrowLeft, Image } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { translateGoal } from "@/lib/goalTranslations";

interface ProfessionalClientMeasurementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

interface MeasurementsCheckin {
  id: string;
  checkin_date: string;
  front_photo_url?: string;
  side_photo_url?: string;
  back_photo_url?: string;
  belly_circumference?: number;
  hip_circumference?: number;
  left_thigh?: number;
  right_thigh?: number;
  next_goal?: string;
  observations?: string;
}

export const ProfessionalClientMeasurementsDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName 
}: ProfessionalClientMeasurementsDialogProps) => {
  const [checkins, setCheckins] = useState<MeasurementsCheckin[]>([]);
  const [selectedCheckin, setSelectedCheckin] = useState<MeasurementsCheckin | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (open && clientId) {
      loadMeasurementsCheckins();
    }
  }, [open, clientId]);

  useEffect(() => {
    if (selectedCheckin) {
      loadPhotos();
    }
  }, [selectedCheckin]);

  const loadMeasurementsCheckins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select(`
          id, checkin_date, front_photo_url, side_photo_url, back_photo_url,
          belly_circumference, hip_circumference, left_thigh, right_thigh,
          next_goal, observations
        `)
        .eq('client_id', clientId)
        .not('checkin_type', 'is', null)
        .order('checkin_date', { ascending: false });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao carregar check-ins de medidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = async (path: string) => {
    if (!path) return null;
    try {
      const { data } = await supabase.storage
        .from('progress_photos')
        .createSignedUrl(path, 3600);
      return data?.signedUrl || null;
    } catch (error) {
      console.error('Erro ao obter URL da foto:', error);
      return null;
    }
  };

  const loadPhotos = async () => {
    if (!selectedCheckin) return;
    
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
    
    setPhotoUrls(urls);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedCheckin && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedCheckin(null)}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Scale className="h-5 w-5 text-primary" />
            {selectedCheckin 
              ? `Check-in de ${clientName} - ${format(new Date(selectedCheckin.checkin_date), "dd/MM/yyyy")}`
              : `Check-ins de Medidas - ${clientName}`
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando check-ins...</p>
            </div>
          ) : selectedCheckin ? (
            // Visualização detalhada do check-in
            <div className="space-y-6">
              {/* Fotos de Progresso */}
              {(photoUrls.front || photoUrls.side || photoUrls.back) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                    <Image className="h-5 w-5 text-green-500" />
                    <span>Fotos de Progresso</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {photoUrls.front && (
                      <div className="text-center">
                        <img 
                          src={photoUrls.front} 
                          alt="Foto frontal" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <p className="text-sm text-muted-foreground mt-2">Frontal</p>
                      </div>
                    )}
                    {photoUrls.side && (
                      <div className="text-center">
                        <img 
                          src={photoUrls.side} 
                          alt="Foto lateral" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <p className="text-sm text-muted-foreground mt-2">Lateral</p>
                      </div>
                    )}
                    {photoUrls.back && (
                      <div className="text-center">
                        <img 
                          src={photoUrls.back} 
                          alt="Foto traseira" 
                          className="w-full h-64 object-cover rounded-lg border"
                        />
                        <p className="text-sm text-muted-foreground mt-2">Traseira</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Medidas Corporais */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <span>Medidas Corporais</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedCheckin.belly_circumference && (
                    <div className="text-center space-y-1">
                      <p className="text-lg font-semibold text-primary">
                        {selectedCheckin.belly_circumference}cm
                      </p>
                      <p className="text-sm text-muted-foreground">Barriga</p>
                    </div>
                  )}
                  {selectedCheckin.hip_circumference && (
                    <div className="text-center space-y-1">
                      <p className="text-lg font-semibold text-primary">
                        {selectedCheckin.hip_circumference}cm
                      </p>
                      <p className="text-sm text-muted-foreground">Quadril</p>
                    </div>
                  )}
                  {selectedCheckin.left_thigh && (
                    <div className="text-center space-y-1">
                      <p className="text-lg font-semibold text-primary">
                        {selectedCheckin.left_thigh}cm
                      </p>
                      <p className="text-sm text-muted-foreground">Coxa Esq.</p>
                    </div>
                  )}
                  {selectedCheckin.right_thigh && (
                    <div className="text-center space-y-1">
                      <p className="text-lg font-semibold text-primary">
                        {selectedCheckin.right_thigh}cm
                      </p>
                      <p className="text-sm text-muted-foreground">Coxa Dir.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Próximo Objetivo */}
              {selectedCheckin.next_goal && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Próximo Objetivo</h3>
                  <p className="text-foreground">{translateGoal(selectedCheckin.next_goal)}</p>
                </Card>
              )}

              {/* Observações */}
              {selectedCheckin.observations && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Observações</h3>
                  <p className="text-foreground">{selectedCheckin.observations}</p>
                </Card>
              )}
            </div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum check-in de medidas encontrado para este cliente.</p>
            </div>
          ) : (
            // Lista de check-ins
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <Card 
                  key={checkin.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCheckin(checkin)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Scale className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(checkin.checkin_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(checkin.front_photo_url || checkin.side_photo_url || checkin.back_photo_url) && "Com fotos • "}
                          {[
                            checkin.belly_circumference && "Barriga",
                            checkin.hip_circumference && "Quadril", 
                            checkin.left_thigh && "Coxa Esq.",
                            checkin.right_thigh && "Coxa Dir."
                          ].filter(Boolean).join(" • ") || "Medidas registradas"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
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