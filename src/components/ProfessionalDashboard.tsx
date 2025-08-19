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

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  user_type: string;
}

interface ClientStats {
  totalClients: number;
  activeWorkouts: number;
  activePlans: number;
  recentCheckins: number;
}

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeWorkouts: 0,
    activePlans: 0,
    recentCheckins: 0
  });
  const [loading, setLoading] = useState(true);

  const ADMIN_PASSWORD = "MyFitLifeSistemaAdm";

  const handlePasswordSubmit = async () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast.success("Acesso liberado - Bem-vindo ao painel administrativo profissional");
      await loadDashboardData();
    } else {
      toast.error("Senha incorreta - Verifique a senha e tente novamente");
    }
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
      
      // Carregar planos de treino ativos
      const { data: workoutPlans, error: workoutError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('professional_id', user.id)
        .eq('status', 'active');

      if (workoutError) console.error('Erro ao carregar planos de treino:', workoutError);

      // Carregar planos nutricionais ativos
      const { data: nutritionPlans, error: nutritionError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('professional_id', user.id)
        .eq('status', 'active');

      if (nutritionError) console.error('Erro ao carregar planos nutricionais:', nutritionError);

      // Carregar check-ins recentes (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentCheckins, error: checkinsError } = await supabase
        .from('client_checkins')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (checkinsError) console.error('Erro ao carregar check-ins:', checkinsError);

      setStats({
        totalClients,
        activeWorkouts: workoutPlans?.length || 0,
        activePlans: nutritionPlans?.length || 0,
        recentCheckins: recentCheckins?.length || 0
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
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Profissional</h1>
        <p className="text-lg text-muted-foreground">
          Gerencie seus clientes e acompanhe o progresso
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              clientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos de Treino</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Nutricionais</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">
              planos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Recentes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentCheckins}</div>
            <p className="text-xs text-muted-foreground">
              últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
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
                <Button className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  Criar Plano de Treino
                </Button>
                <Button variant="outline" className="w-full">
                  <Utensils className="h-4 w-4 mr-2" />
                  Criar Plano Nutricional
                </Button>
                <Button variant="outline" className="w-full">
                  <Brain className="h-4 w-4 mr-2" />
                  Agendar Sessão
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
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                Gerencie todos os seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{client.display_name || 'Nome não informado'}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <Badge variant="secondary">{client.user_type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum cliente encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Planos de Treino</CardTitle>
                <CardDescription>
                  Gerencie os planos de treino dos seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  {stats.activeWorkouts} planos de treino ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planos Nutricionais</CardTitle>
                <CardDescription>
                  Gerencie os planos nutricionais dos seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  {stats.activePlans} planos nutricionais ativos
                </p>
              </CardContent>
            </Card>
          </div>
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