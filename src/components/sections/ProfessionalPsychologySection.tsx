import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Calendar, MessageSquare, TrendingUp, Target, Heart, Award, BookOpen, Users, Eye, BarChart3 } from "lucide-react";
import { ProfessionalClientCheckinDialog } from "@/components/psychology/ProfessionalClientCheckinDialog";
import { SessionManagementDialog } from "@/components/psychology/SessionManagementDialog";
import { GoalsAchievementsDialog } from "@/components/psychology/GoalsAchievementsDialog";
import { WeeklyHistoryDialog } from "@/components/psychology/WeeklyHistoryDialog";
import { EditNextSessionDialog } from "@/components/psychology/EditNextSessionDialog";

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

  const handleUnlock = () => {
    if (pwd === "psicologia123") {
      setUnlocked(true);
      setError("");
    } else {
      setError("Senha incorreta. Tente novamente.");
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

  const clients = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Ana Silva",
      lastSession: "2024-01-15",
      nextSession: "2024-01-22",
      status: "active",
      mood: 4.2,
      progress: 75
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Carlos Santos",
      lastSession: "2024-01-14",
      nextSession: "2024-01-21",
      status: "active",
      mood: 3.8,
      progress: 60
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Maria Oliveira",
      lastSession: "2024-01-10",
      nextSession: "2024-01-24",
      status: "pending",
      mood: 4.5,
      progress: 85
    }
  ];

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
    { label: "Clientes Ativos", value: "12", icon: Users },
    { label: "Sessões desta Semana", value: "8", icon: Calendar },
    { label: "Taxa de Engajamento", value: "92%", icon: TrendingUp },
    { label: "Satisfação Média", value: "4.3", icon: Heart }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Psicologia - Área Profissional</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Gerencie o acompanhamento psicológico dos seus clientes
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {psychologyStats.map((stat, index) => (
          <Card key={index} className="p-6 text-center">
            <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Lista de Clientes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Clientes em Acompanhamento</span>
        </h2>
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{client.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>Última sessão: {new Date(client.lastSession).toLocaleDateString('pt-BR')}</span>
                    <span>Próxima: {new Date(client.nextSession).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-pink-500" />
                      Humor: {client.mood}/5
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-primary" />
                      Progresso: {client.progress}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageSession(client)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Sessões
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewGoalsAchievements(client)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Metas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
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
      </Card>

      {/* Última Sessão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Última Sessão</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Ana Silva</p>
                  <p className="text-sm text-muted-foreground">Última: 15/01/2024, 14:00</p>
                  <p className="text-sm text-muted-foreground">Próxima: 22/01/2024, 15:00</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEditNextSessionDialog(true)}
                  >
                    Editar Próxima Sessão
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleManageSession({
                      id: "550e8400-e29b-41d4-a716-446655440001",
                      name: "Ana Silva"
                    })}
                  >
                    Ver Relatórios das Sessões
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Progresso Geral</span>
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Conclusão de Metas</span>
                <span>78%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Satisfação dos Clientes</span>
                <span>4.3/5</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '86%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recursos e Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Biblioteca de Exercícios</h3>
            <p className="text-muted-foreground">Técnicas de mindfulness e exercícios terapêuticos</p>
            <Button variant="outline" className="w-full">
              Acessar
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <Award className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Conquistas e Metas</h3>
            <p className="text-muted-foreground">Gerencie conquistas e defina metas para os clientes</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleViewGoalsAchievements({
                id: "550e8400-e29b-41d4-a716-446655440001",
                name: "Clientes Geral"
              })}
            >
              Ver Todas
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Relatórios</h3>
            <p className="text-muted-foreground">Gere relatórios de progresso e evolução</p>
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
        clientName="Ana Silva"
        currentDate="2024-01-22"
        currentTime="15:00"
      />
    </div>
  );
};

export default ProfessionalPsychologySection;