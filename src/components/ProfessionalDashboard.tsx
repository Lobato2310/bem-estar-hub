import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MessageSquare, BarChart3, Settings, Plus } from "lucide-react";

const ProfessionalDashboard = () => {
  const stats = [
    { label: "Clientes Ativos", value: "12", icon: Users, color: "text-primary" },
    { label: "Sessões Hoje", value: "5", icon: Calendar, color: "text-accent" },
    { label: "Mensagens", value: "8", icon: MessageSquare, color: "text-secondary" },
    { label: "Taxa de Sucesso", value: "94%", icon: BarChart3, color: "text-primary-light" },
  ];

  const quickActions = [
    { label: "Novo Cliente", icon: Plus, action: "add-client" },
    { label: "Agendar Sessão", icon: Calendar, action: "schedule" },
    { label: "Ver Mensagens", icon: MessageSquare, action: "messages" },
    { label: "Relatórios", icon: BarChart3, action: "reports" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header do Profissional */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Profissional</h1>
        <p className="text-lg text-muted-foreground">
          Gerencie seus clientes e acompanhe seu progresso
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Ações Rápidas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:scale-105 transition-all duration-300"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Clientes Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((client) => (
              <div key={client} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">C{client}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Cliente {client}</p>
                    <p className="text-sm text-muted-foreground">Última sessão: há 2 dias</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver Perfil
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agenda do Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agenda de Hoje</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: "09:00", client: "João Silva", type: "Treino Personalizado" },
              { time: "11:00", client: "Maria Santos", type: "Avaliação Física" },
              { time: "15:00", client: "Pedro Costa", type: "Consulta Nutricional" },
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-l-4 border-primary bg-accent/5 rounded-r-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Iniciar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDashboard;