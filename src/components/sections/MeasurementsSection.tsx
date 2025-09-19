import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ProfessionalMeasurementsSection from "@/components/professional/ProfessionalMeasurementsSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, TrendingUp, Calendar, History } from "lucide-react";
import CheckinCalendar from "@/components/measurements/CheckinCalendar";
import MeasurementsCheckinHistoryDialog from "@/components/measurements/MeasurementsCheckinHistoryDialog";

const MeasurementsSection = () => {
  const [measurements, setMeasurements] = useState([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    if (userProfile?.user_type === 'client') {
      fetchMeasurements();
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('client_measurements')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  // Se for profissional, usar o componente específico
  if (userProfile?.user_type === 'professional') {
    return <ProfessionalMeasurementsSection />;
  }

  const latestMeasurement = measurements[0] || {};

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Scale className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Medidas</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Acompanhe seu progresso através das medidas corporais
        </p>
      </div>

      {/* Medidas atuais */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Medidas Atuais</span>
          </h2>
          {latestMeasurement.created_at && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date(latestMeasurement.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">
              {latestMeasurement.weight ? `${latestMeasurement.weight}kg` : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Peso</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">
              {latestMeasurement.body_fat ? `${latestMeasurement.body_fat}%` : '--'}
            </p>
            <p className="text-sm text-muted-foreground">% Gordura</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">
              {latestMeasurement.chest ? `${latestMeasurement.chest}cm` : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Peito</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">
              {latestMeasurement.waist ? `${latestMeasurement.waist}cm` : '--'}
            </p>
            <p className="text-sm text-muted-foreground">Cintura</p>
          </div>
        </div>
      </Card>

      {/* Detalhes das medidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Medidas Detalhadas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Altura:</span>
              <span className="font-medium">{latestMeasurement.height ? `${latestMeasurement.height}cm` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quadril:</span>
              <span className="font-medium">{latestMeasurement.hip ? `${latestMeasurement.hip}cm` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Braço:</span>
              <span className="font-medium">{latestMeasurement.arms ? `${latestMeasurement.arms}cm` : '--'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coxa:</span>
              <span className="font-medium">{latestMeasurement.thigh ? `${latestMeasurement.thigh}cm` : '--'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Evolução</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de registros:</span>
              <span className="font-medium">{measurements.length}</span>
            </div>
            {measurements.length >= 2 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mudança de peso:</span>
                  <span className="font-medium text-primary">
                    {((measurements[0].weight || 0) - (measurements[1].weight || 0)).toFixed(1)}kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Período:</span>
                  <span className="font-medium">
                    {Math.ceil(
                      (new Date(measurements[0].created_at).getTime() - new Date(measurements[1].created_at).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} dias
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Calendário de Check-ins */}
      <CheckinCalendar userProfile={userProfile} />

      {/* Histórico de medidas e check-ins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Histórico de Medidas</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Ver Histórico Completo
            </Button>
          </div>
          {measurements.length > 0 ? (
            <div className="space-y-3">
              {measurements.slice(0, 3).map((measurement, index) => (
                <div key={measurement.id} className="p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(measurement.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Peso: {measurement.weight}kg | % Gordura: {measurement.body_fat || '--'}%
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Atual
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma medida registrada ainda. Seu nutricionista adicionará suas medidas durante as consultas.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Check-ins com Fotos</h3>
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <Calendar className="h-8 w-8 text-primary mx-auto" />
              <p className="font-medium">Acompanhamento Visual</p>
              <p className="text-sm text-muted-foreground">
                Registre seu progresso com fotos e medidas nos check-ins quinzenais
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              Ver Histórico de Check-ins
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <MeasurementsCheckinHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
    </div>
  );
};

export default MeasurementsSection;