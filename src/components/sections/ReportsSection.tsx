import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import ClientSelector from "@/components/professional/ClientSelector";
import ClientEvolutionGraphs from "@/components/professional/ClientEvolutionGraphs";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

const ReportsSection = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);

  const handleClientSelect = (client: Client) => {
    console.log('Client selected in ReportsSection:', client);
    setSelectedClient(client);
    setShowEvolution(false);
  };

  const handleViewEvolution = () => {
    if (selectedClient) {
      console.log('Viewing evolution for client:', selectedClient);
      setShowEvolution(true);
    }
  };

  if (showEvolution && selectedClient) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios de Evolução</h1>
            <p className="text-muted-foreground">Análise detalhada do progresso do cliente</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowEvolution(false)}
          >
            Voltar à seleção
          </Button>
        </div>
        
        <ClientEvolutionGraphs 
          clientId={selectedClient.user_id}
          clientName={selectedClient.display_name || "Cliente"}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Relatórios e Análises</h1>
        <p className="text-lg text-muted-foreground">
          Acompanhe a evolução e progresso dos seus clientes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Cliente
            </CardTitle>
            <CardDescription>
              Escolha um cliente para visualizar seus relatórios de evolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSelector 
              onClientSelect={handleClientSelect}
              selectedClientId={selectedClient?.user_id}
            />
          </CardContent>
        </Card>

        {/* Opções de Relatório */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatórios Disponíveis
            </CardTitle>
            <CardDescription>
              Tipos de análise e acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <>
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium text-foreground mb-2">Cliente Selecionado</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient.display_name || "Nome não informado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedClient.email}
                  </p>
                </div>
                
                <Button 
                  onClick={handleViewEvolution} 
                  className="w-full gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Ver Evolução Completa
                </Button>
                
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Incluído no relatório:</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Gráfico de evolução física (peso, gordura corporal)</li>
                    <li>• Índice de disciplina (treinos concluídos)</li>
                    <li>• Tendências e análise de progresso</li>
                    <li>• Resumo de estatísticas principais</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Selecione um cliente para ver os relatórios disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre os Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Evolução Física
              </h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe as mudanças no peso corporal e percentual de gordura do cliente ao longo do tempo.
                Os dados são coletados através dos check-ins e medições registradas.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                Índice de Disciplina
              </h4>
              <p className="text-sm text-muted-foreground">
                Visualize a consistência do cliente com base na conclusão dos treinos programados.
                O índice é calculado automaticamente e classificado por cores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsSection;