import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Calendar, MessageSquare, TrendingUp, Target, Heart, Award, BookOpen, Users, Eye, BarChart3 } from "lucide-react";
import { ProfessionalClientCheckinDialog } from "@/components/psychology/ProfessionalClientCheckinDialog";
import { SessionManagementDialog } from "@/components/psychology/SessionManagementDialog";
import { GoalsAchievementsDialog } from "@/components/psychology/GoalsAchievementsDialog";
import { WeeklyHistoryDialog } from "@/components/psychology/WeeklyHistoryDialog";
import { EditNextSessionDialog } from "@/components/psychology/EditNextSessionDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ProfessionalPsychologySection = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showGoalsAchievementsDialog, setShowGoalsAchievementsDialog] = useState(false);
  const [showWeeklyHistoryDialog, setShowWeeklyHistoryDialog] = useState(false);
  const [showEditNextSessionDialog, setShowEditNextSessionDialog] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  const handleUnlock = () => {
    if (pwd === "psicologia123") {
      setUnlocked(true);
      setError("");
      loadRealClients();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
  };

  const loadRealClients = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Buscar todos os clientes do tipo 'client'
      const { data: allClients, error: clientsError } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .eq('user_type', 'client');

      if (clientsError) throw clientsError;

      // Buscar dados adicionais de cada cliente (últimas sessões, check-ins, etc.)
      const clientsWithData = await Promise.all(
        (allClients || []).map(async (profile: any) => {
          const clientId = profile.user_id;

          // Buscar última sessão
          const { data: lastSession } = await supabase
            .from('psychology_sessions')
            .select('session_date')
            .eq('client_id', clientId)
            .order('session_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Buscar último check-in para humor
          const { data: lastCheckin } = await supabase
            .from('client_checkins')
            .select('mood')
            .eq('client_id', clientId)
            .not('mood', 'is', null)
            .order('checkin_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: clientId,
            name: profile.display_name || profile.email?.split('@')[0] || 'Cliente',
            email: profile.email,
            lastSession: lastSession?.session_date || null,
            nextSession: null, // Pode ser implementado posteriormente
            status: 'active',
            mood: lastCheckin?.mood || 0,
            progress: 0 // Pode ser calculado baseado em metas
          };
        })
      );

      setClients(clientsWithData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <Card className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <Brain className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Acesso à Psicologia</h1>
            <p className="text-sm text-muted-foreground">Digite a senha para acessar o módulo de psicologia</p>
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha da Psicologia"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button className="w-full" onClick={handleUnlock}>Entrar</Button>
        </Card>
      </div>
    );
  }

  const handleViewCheckins = (client: any) => {
    setSelectedClient(client);
    setShowCheckinDialog(true);
  };

  const handleManageSession = (client: any) => {
    setSelectedClient(client);
    setShowSessionDialog(true);
  };

  const handleViewGoalsAchievements = (client: any) => {
    setSelectedClient(client);
    setShowGoalsAchievementsDialog(true);
  };

  const handleViewWeeklyHistory = (client: any) => {
    setSelectedClient(client);
    setShowWeeklyHistoryDialog(true);
  };

  const psychologyStats = [
    { label: "Clientes Ativos", value: clients.length.toString(), icon: Users },
    { label: "Sessões desta Semana", value: "0", icon: Calendar },
    { label: "Taxa de Engajamento", value: "0%", icon: TrendingUp },
    { label: "Satisfação Média", value: "0", icon: Heart }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Brain className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Psicologia - Área Profissional</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Gerencie o acompanhamento psicológico dos seus clientes
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {psychologyStats.map((stat, index) => (
          <Card key={index} className="p-4 md:p-6 text-center">
            <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-2 md:mb-3" />
            <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Lista de Clientes */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Users className="h-4 w-4 md:h-5 md:w-5" />
          <span>Clientes em Acompanhamento</span>
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="p-3 md:p-4 bg-accent/50 rounded-lg">
                <div className="space-y-3 md:space-y-2">
                  {/* Client Info - Stack on mobile, side by side on desktop */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="font-medium text-base">{client.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                        client.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="break-all">Email: {client.email}</div>
                      {client.lastSession && (
                        <div>Última sessão: {new Date(client.lastSession).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {client.mood > 0 && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-pink-500" />
                          Humor: {client.mood}/5
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-primary" />
                        Progresso: {client.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto justify-start"
                      onClick={() => handleManageSession(client)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Sessões
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto justify-start"
                      onClick={() => handleViewGoalsAchievements(client)}
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Metas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full sm:w-auto justify-start"
                      onClick={() => handleViewWeeklyHistory(client)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Última Sessão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            <span>Última Sessão</span>
          </h3>
          <div className="space-y-3">
            {clients.length > 0 && clients[0].lastSession ? (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{clients[0].name}</p>
                    <p className="text-sm text-muted-foreground">
                      Última: {new Date(clients[0].lastSession).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setShowEditNextSessionDialog(true)}
                    >
                      Editar Próxima Sessão
                    </Button>
                    <Button 
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleManageSession(clients[0])}
                    >
                      Ver Relatórios das Sessões
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Nenhuma sessão registrada ainda.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            <span>Progresso Geral</span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Conclusão de Metas</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Satisfação dos Clientes</span>
                <span>0/5</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recursos e Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="p-2 md:p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">Biblioteca de Exercícios</h3>
            <p className="text-sm md:text-base text-muted-foreground">Técnicas de mindfulness e exercícios terapêuticos</p>
            <Button variant="outline" className="w-full">
              Acessar
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="p-2 md:p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <Award className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">Conquistas e Metas</h3>
            <p className="text-sm md:text-base text-muted-foreground">Gerencie conquistas e defina metas para os clientes</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleViewGoalsAchievements({
                id: "geral",
                name: "Clientes Geral"
              })}
            >
              Ver Todas
            </Button>
          </div>
        </Card>

        <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="p-2 md:p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">Relatórios</h3>
            <p className="text-sm md:text-base text-muted-foreground">Gere relatórios de progresso e evolução</p>
            <Button variant="outline" className="w-full">
              Ver Relatórios
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      {selectedClient && (
        <>
          <ProfessionalClientCheckinDialog
            open={showCheckinDialog}
            onOpenChange={setShowCheckinDialog}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
          />
          <SessionManagementDialog
            open={showSessionDialog}
            onOpenChange={setShowSessionDialog}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
          />
          <GoalsAchievementsDialog
            open={showGoalsAchievementsDialog}
            onOpenChange={setShowGoalsAchievementsDialog}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
            isProfessional={true}
          />
          <WeeklyHistoryDialog
            open={showWeeklyHistoryDialog}
            onOpenChange={setShowWeeklyHistoryDialog}
            clientId={selectedClient.id}
            clientName={selectedClient.name}
          />
        </>
      )}
      
      <EditNextSessionDialog
        open={showEditNextSessionDialog}
        onOpenChange={setShowEditNextSessionDialog}
        clientName={clients.length > 0 ? clients[0].name : "Cliente"}
        currentDate="2024-01-22"
        currentTime="15:00"
      />
    </div>
  );
};

export default ProfessionalPsychologySection;