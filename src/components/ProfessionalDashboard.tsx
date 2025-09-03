import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Heart,
  Target,
  Activity,
  Utensils,
  Brain,
  Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import DietManagement from "@/components/professional/DietManagement";
import ClientSelector from "@/components/professional/ClientSelector";
import ClientPlanManagement from "@/components/professional/ClientPlanManagement";
import ClientAnamnesis from "@/components/professional/ClientAnamnesis";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ClientStats {
  totalClients: number;
}

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const ADMIN_PASSWORD = "MyFitLifeAdmProf";

  // Verificar se já está autenticado no localStorage
  useEffect(() => {
    const isAlreadyAuthenticated = localStorage.getItem('professional_authenticated') === 'true';
    if (isAlreadyAuthenticated) {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = async () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('professional_authenticated', 'true');
      toast.success("Acesso liberado - Bem-vindo ao painel administrativo profissional");
      await loadDashboardData();
    } else {
      toast.error("Senha incorreta - Verifique a senha e tente novamente");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('professional_authenticated');
    setIsAuthenticated(false);
    setPassword("");
    toast.success("Logout realizado com sucesso");
  };

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Carregar clientes (perfis com user_type = 'client')
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'client');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Calcular estatísticas básicas
      const totalClients = clientsData?.length || 0;

      setStats({
        totalClients
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  // Tela de autenticação
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-light/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Área Profissional</CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Acesso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-center flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Profissional</h1>
          <p className="text-lg text-muted-foreground">
            Gerencie seus clientes e acompanhe o progresso
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('clients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              clique para gerenciar clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Ações frequentes para gerenciar seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => setActiveTab('plans')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Gerenciar Planos de Treino
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('nutrition')}
                >
                  <Utensils className="h-4 w-4 mr-2" />
                  Gerenciar Planos Nutricionais
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab('clients')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Gerenciar Clientes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas atividades dos seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma atividade recente
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Selecionar Cliente</CardTitle>
                <CardDescription>
                  Escolha um cliente para gerenciar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientSelector 
                  onClientSelect={(client) => setSelectedClient(client)}
                  selectedClientId={selectedClient?.user_id}
                />
              </CardContent>
            </Card>
            
            {selectedClient && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <strong>Nome:</strong> {selectedClient.display_name || "Nome não informado"}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedClient.email}
                      </div>
                      <div>
                        <strong>Cliente desde:</strong> {new Date(selectedClient.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-4">
                  <Button 
                    className="w-full"
                    onClick={() => setActiveTab('client-plans')}
                  >
                    Gerenciar Planos
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab('client-anamnesis')}
                  >
                    Ver Anamnese
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Treino</CardTitle>
              <CardDescription>
                Gerencie os planos de treino baseados na frequência semanal dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Os planos de treino agora são organizados por dias da semana (A, B, C, etc.)
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrar Dietas</CardTitle>
              <CardDescription>
                Gerencie os planos nutricionais dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full md:w-auto"
                onClick={() => setActiveTab("diet-management")}
              >
                <Utensils className="h-4 w-4 mr-2" />
                Administrar Dieta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet-management" className="space-y-6">
          <DietManagement />
        </TabsContent>

        <TabsContent value="client-plans" className="space-y-6">
          {selectedClient ? (
            <ClientPlanManagement client={selectedClient} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Selecione um cliente na aba "Clientes" para gerenciar seus planos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="client-anamnesis" className="space-y-6">
          {selectedClient ? (
            <ClientAnamnesis client={selectedClient} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Selecione um cliente na aba "Clientes" para ver sua anamnese
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Análises</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;