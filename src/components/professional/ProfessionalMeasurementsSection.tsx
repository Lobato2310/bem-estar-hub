import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, TrendingUp, Calendar, History, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ClientSelector from "@/components/professional/ClientSelector";
import { ProfessionalClientMeasurementsDialog } from "@/components/professional/ProfessionalClientMeasurementsDialog";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
}

const ProfessionalMeasurementsSection = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientMeasurements, setClientMeasurements] = useState([]);
  const [isClientCheckinDialogOpen, setIsClientCheckinDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      fetchClientMeasurements();
    }
  }, [selectedClient]);

  const fetchClientMeasurements = async () => {
    if (!selectedClient) return;
    
    try {
      const { data, error } = await supabase
        .from('client_measurements')
        .select('*')
        .eq('client_id', selectedClient.user_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClientMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching client measurements:', error);
    }
  };

  const latestMeasurement = clientMeasurements[0] || {};

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Scale className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Medidas dos Clientes</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Acompanhe o progresso dos seus clientes através das medidas corporais
        </p>
      </div>

      {/* Seleção de Cliente */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Selecionar Cliente</h2>
        </div>
        <ClientSelector 
          onClientSelect={setSelectedClient}
          selectedClientId={selectedClient?.id}
        />
      </Card>

      {selectedClient ? (
        <>
          {/* Medidas atuais do cliente selecionado */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Medidas Atuais - {selectedClient.display_name}</span>
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
                  <span className="font-medium">{clientMeasurements.length}</span>
                </div>
                {clientMeasurements.length >= 2 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mudança de peso:</span>
                      <span className="font-medium text-primary">
                        {((clientMeasurements[0].weight || 0) - (clientMeasurements[1].weight || 0)).toFixed(1)}kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Período:</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(clientMeasurements[0].created_at).getTime() - new Date(clientMeasurements[1].created_at).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} dias
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Check-ins do Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Check-ins de Medidas</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsClientCheckinDialogOpen(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver Check-ins
                </Button>
              </div>
              <div className="text-center space-y-2">
                <Calendar className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium">Histórico de Check-ins</p>
                <p className="text-sm text-muted-foreground">
                  Veja o histórico completo de check-ins do cliente com fotos e medidas
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Histórico de Medidas</h3>
              {clientMeasurements.length > 0 ? (
                <div className="space-y-3">
                  {clientMeasurements.slice(0, 3).map((measurement, index) => (
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
                    Nenhuma medida registrada ainda para este cliente.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Dialogs */}
          <ProfessionalClientMeasurementsDialog
            open={isClientCheckinDialogOpen}
            onOpenChange={setIsClientCheckinDialogOpen}
            clientId={selectedClient.user_id}
            clientName={selectedClient.display_name}
          />
        </>
      ) : (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Selecione um Cliente</h3>
              <p className="text-muted-foreground">
                Escolha um cliente para visualizar suas medidas e check-ins
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalMeasurementsSection;