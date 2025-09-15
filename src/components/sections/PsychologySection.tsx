import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, MessageSquare, TrendingUp, Target, Heart, Award } from "lucide-react";
import { DailyCheckinDialog } from "@/components/psychology/DailyCheckinDialog";
import { GoalsAchievementsDialog } from "@/components/psychology/GoalsAchievementsDialog";
import PsychologyCheckinHistoryDialog from "@/components/psychology/PsychologyCheckinHistoryDialog";
import { WeeklyHistoryDialog } from "@/components/psychology/WeeklyHistoryDialog";
import { ClientSessionReportsDialog } from "@/components/psychology/ClientSessionReportsDialog";
import { supabase } from "@/integrations/supabase/client";
const PsychologySection = () => {
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [showGoalsAchievementsDialog, setShowGoalsAchievementsDialog] = useState(false);
  const [showPsychologyHistoryDialog, setShowPsychologyHistoryDialog] = useState(false);
  const [showWeeklyHistoryDialog, setShowWeeklyHistoryDialog] = useState(false);
  const [showSessionReportsDialog, setShowSessionReportsDialog] = useState(false);
  const [dailyMotivation, setDailyMotivation] = useState<string>("");
  const sessions = [{
    date: "Próxima Sessão",
    time: "Quinta, 15:00",
    type: "Acompanhamento Semanal",
    status: "Agendada"
  }, {
    date: "Última Sessão",
    time: "Quinta passada",
    type: "Definição de Metas",
    status: "Concluída"
  }];
  const weeklyGoals = [{
    goal: "Fazer exercícios 4x na semana",
    progress: 75,
    completed: 3,
    total: 4
  }, {
    goal: "Seguir dieta conforme orientação",
    progress: 90,
    completed: 6,
    total: 7
  }, {
    goal: "Meditar 10 min por dia",
    progress: 60,
    completed: 4,
    total: 7
  }];
  const moodData = [{
    day: "Seg",
    mood: 4,
    energy: 3
  }, {
    day: "Ter",
    mood: 5,
    energy: 4
  }, {
    day: "Qua",
    mood: 3,
    energy: 3
  }, {
    day: "Qui",
    mood: 4,
    energy: 5
  }, {
    day: "Sex",
    mood: 5,
    energy: 4
  }, {
    day: "Sab",
    mood: 4,
    energy: 3
  }, {
    day: "Dom",
    mood: 4,
    energy: 4
  }];

  // Fetch daily motivational phrase
  useEffect(() => {
    const fetchDailyMotivation = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('motivational_phrases').select('frase').order('criado_em', {
          ascending: false
        });
        if (error) {
          console.error('Error fetching motivational phrases:', error);
          setDailyMotivation("O sucesso é a soma de pequenos esforços repetidos dia após dia.");
          return;
        }
        if (data && data.length > 0) {
          // Get today's date and create a hash based on date + period (AM/PM)
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format

          // Two periods: before 12:00 (period 0) and after 12:00 (period 1)
          const period = now.getHours() >= 12 ? 1 : 0;
          const seedString = `${todayStr}-${period}`;

          // Create a simple hash based on the date and period
          let hash = 0;
          for (let i = 0; i < seedString.length; i++) {
            const char = seedString.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
          }
          const phraseIndex = Math.abs(hash) % data.length;
          setDailyMotivation(data[phraseIndex].frase || "O sucesso é a soma de pequenos esforços repetidos dia após dia.");
        } else {
          setDailyMotivation("O sucesso é a soma de pequenos esforços repetidos dia após dia.");
        }
      } catch (error) {
        console.error('Error in fetchDailyMotivation:', error);
        setDailyMotivation("O sucesso é a soma de pequenos esforços repetidos dia após dia.");
      }
    };
    fetchDailyMotivation();

    // Set up an interval to check every minute if it's 12:00 PM and update if needed
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 12 && now.getMinutes() === 0) {
        fetchDailyMotivation();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
  return <div className="max-w-6xl mx-auto p-6 space-y-8">
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
            "{dailyMotivation}"
          </p>
        </div>
      </Card>

      {/* Sessões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session, index) => <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{session.date}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.status === 'Agendada' ? 'bg-primary-light text-primary' : 'bg-accent text-accent-foreground'}`}>
                  {session.status}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session.time}</span>
                </div>
                
              </div>
              {session.status === 'Concluída' && <Button variant="outline" className="w-full" onClick={() => setShowSessionReportsDialog(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver Relatórios das Sessões
                </Button>}
            </div>
          </Card>)}
      </div>

      {/* Metas da semana */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Metas desta Quinzena</span>
        </h2>
        <div className="space-y-4">
          {weeklyGoals.map((goal, index) => <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-foreground">{goal.goal}</p>
                <span className="text-sm text-muted-foreground">
                  {goal.completed}/{goal.total}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div className="bg-primary h-3 rounded-full transition-all duration-300" style={{
              width: `${goal.progress}%`
            }}></div>
              </div>
            </div>)}
        </div>
      </Card>

      {/* Humor e Energia */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Humor e Energia - Esta Semana</span>
        </h2>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {moodData.map((day, index) => <div key={index} className="text-center space-y-2">
              <p className="text-xs md:text-sm font-medium text-foreground">{day.day}</p>
              <div className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Humor</p>
                  <div className="w-full bg-secondary rounded-full h-3 md:h-4">
                    <div className="bg-yellow-400 h-3 md:h-4 rounded-full transition-all duration-300" style={{
                  width: `${day.mood / 5 * 100}%`
                }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Energia</p>
                  <div className="w-full bg-secondary rounded-full h-3 md:h-4">
                    <div className="bg-primary h-3 md:h-4 rounded-full transition-all duration-300" style={{
                  width: `${day.energy / 5 * 100}%`
                }}></div>
                  </div>
                </div>
              </div>
            </div>)}
        </div>
          <Button variant="outline" className="w-full mt-4" onClick={() => setShowWeeklyHistoryDialog(true)}>
            Ver Histórico
          </Button>
      </Card>

      {/* Recursos de bem-estar */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => setShowGoalsAchievementsDialog(true)}>
          <div className="text-center space-y-4">
            <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300 w-fit mx-auto">
              <Award className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Conquistas e Metas</h3>
            <p className="text-muted-foreground">Acompanhe seu progresso, conquistas e metas</p>
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

      {/* Dialogs */}
      <DailyCheckinDialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog} />
      
      <GoalsAchievementsDialog 
        open={showGoalsAchievementsDialog} 
        onOpenChange={setShowGoalsAchievementsDialog}
        clientId="current-user" // Para cliente atual
        clientName="Você"
        isProfessional={true} // Permitir que cliente também adicione metas/conquistas
      />
      
      <PsychologyCheckinHistoryDialog open={showPsychologyHistoryDialog} onOpenChange={setShowPsychologyHistoryDialog} />
      
      <WeeklyHistoryDialog 
        open={showWeeklyHistoryDialog} 
        onOpenChange={setShowWeeklyHistoryDialog}
        clientId="current-user"
        clientName="Você"
      />
      
      <ClientSessionReportsDialog 
        open={showSessionReportsDialog} 
        onOpenChange={setShowSessionReportsDialog}
      />
    </div>;
};
export default PsychologySection;