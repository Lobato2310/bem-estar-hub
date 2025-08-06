import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, MessageSquare, TrendingUp, Target, Heart, Award, BookOpen } from "lucide-react";

const PsychologySection = () => {
  const sessions = [
    {
      date: "Próxima Sessão",
      time: "Quinta, 15:00",
      type: "Acompanhamento Semanal",
      status: "Agendada"
    },
    {
      date: "Última Sessão",
      time: "Quinta passada",
      type: "Definição de Metas",
      status: "Concluída"
    }
  ];

  const weeklyGoals = [
    { goal: "Fazer exercícios 4x na semana", progress: 75, completed: 3, total: 4 },
    { goal: "Seguir dieta conforme orientação", progress: 90, completed: 6, total: 7 },
    { goal: "Meditar 10 min por dia", progress: 60, completed: 4, total: 7 },
  ];

  const motivationalQuotes = [
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Cada dia é uma nova oportunidade para ser melhor que ontem.",
    "Você é mais forte do que imagina e mais capaz do que acredita."
  ];

  const moodData = [
    { day: "Seg", mood: 4, energy: 3 },
    { day: "Ter", mood: 5, energy: 4 },
    { day: "Qua", mood: 3, energy: 3 },
    { day: "Qui", mood: 4, energy: 5 },
    { day: "Sex", mood: 5, energy: 4 },
    { day: "Sab", mood: 4, energy: 3 },
    { day: "Dom", mood: 4, energy: 4 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Acompanhamento Psicológico</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Suporte emocional e motivacional para sua jornada saudável
        </p>
      </div>

      {/* Frase motivacional do dia */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="text-center space-y-4">
          <Heart className="h-8 w-8 text-primary mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Motivação do Dia</h2>
          <p className="text-lg text-foreground italic">
            "{motivationalQuotes[0]}"
          </p>
        </div>
      </Card>

      {/* Sessões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{session.date}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'Agendada' 
                    ? 'bg-primary-light text-primary' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {session.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session.time}</span>
                </div>
                <p className="text-foreground">{session.type}</p>
              </div>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                {session.status === 'Agendada' ? 'Entrar na Sessão' : 'Ver Relatório'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Metas da semana */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Metas desta Semana</span>
        </h2>
        <div className="space-y-4">
          {weeklyGoals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-foreground">{goal.goal}</p>
                <span className="text-sm text-muted-foreground">
                  {goal.completed}/{goal.total}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Humor e Energia */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Humor e Energia - Esta Semana</span>
        </h2>
        <div className="grid grid-cols-7 gap-4">
          {moodData.map((day, index) => (
            <div key={index} className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">{day.day}</p>
              <div className="space-y-1">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Humor</p>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= day.mood ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Energia</p>
                  <div className="flex justify-center">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-3 mx-0.5 rounded-sm ${
                          level <= day.energy ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          Registrar Hoje
        </Button>
      </Card>

      {/* Recursos de bem-estar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Exercícios de Mindfulness</h3>
            <p className="text-muted-foreground">Técnicas de respiração e meditação</p>
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
            <h3 className="text-lg font-semibold text-foreground">Conquistas</h3>
            <p className="text-muted-foreground">Acompanhe seu progresso e celebre vitórias</p>
            <Button variant="outline" className="w-full">
              Ver Todas
            </Button>
          </div>
        </Card>
      </div>

      {/* Progresso geral */}
      <Card className="p-6 bg-accent">
        <h2 className="text-xl font-semibold text-accent-foreground mb-4 text-center">Seu Progresso Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-accent-foreground">0</p>
            <p className="text-sm text-accent-foreground/80">Sessões Concluídas</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-accent-foreground">75%</p>
            <p className="text-sm text-accent-foreground/80">Metas Atingidas</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-accent-foreground">4.2</p>
            <p className="text-sm text-accent-foreground/80">Humor Médio</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-accent-foreground">0</p>
            <p className="text-sm text-accent-foreground/80">Dias Consecutivos</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PsychologySection;