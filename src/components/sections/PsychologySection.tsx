import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Calendar, MessageSquare, TrendingUp, Target, Heart, Award } from "lucide-react";
import { DailyCheckinDialog } from "@/components/psychology/DailyCheckinDialog";
import { GoalsAchievementsDialog } from "@/components/psychology/GoalsAchievementsDialog";
import PsychologyCheckinHistoryDialog from "@/components/psychology/PsychologyCheckinHistoryDialog";
import { WeeklyHistoryDialog } from "@/components/psychology/WeeklyHistoryDialog";
import { ClientSessionReportsDialog } from "@/components/psychology/ClientSessionReportsDialog";
import { EditNextSessionDialog } from "@/components/psychology/EditNextSessionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
const PsychologySection = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [showGoalsAchievementsDialog, setShowGoalsAchievementsDialog] = useState(false);
  const [showPsychologyHistoryDialog, setShowPsychologyHistoryDialog] = useState(false);
  const [showWeeklyHistoryDialog, setShowWeeklyHistoryDialog] = useState(false);
  const [showSessionReportsDialog, setShowSessionReportsDialog] = useState(false);
  const [showEditNextSessionDialog, setShowEditNextSessionDialog] = useState(false);
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
    day: "SEG",
    mood: 4,
    energy: 3,
    sleep: 7
  }, {
    day: "TER",
    mood: 5,
    energy: 4,
    sleep: 8
  }, {
    day: "QUA",
    mood: 3,
    energy: 3,
    sleep: 6
  }, {
    day: "QUI",
    mood: 4,
    energy: 5,
    sleep: 7
  }, {
    day: "SEX",
    mood: 5,
    energy: 4,
    sleep: 8
  }, {
    day: "SAB",
    mood: 4,
    energy: 3,
    sleep: 9
  }, {
    day: "DOM",
    mood: 4,
    energy: 4,
    sleep: 8
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

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [user]);
  return <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          <Brain className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Acompanhamento Psicológico</h1>
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
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
              {session.status === 'Agendada' && <Button variant="outline" className="w-full" onClick={() => setShowEditNextSessionDialog(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Editar Próxima Sessão
                </Button>}
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

      {/* Humor - Energia - Sono */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Humor – Energia – Sono</h2>
          <p className="text-lg font-semibold text-primary">Esta Semana</p>
        </div>
        
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-2 md:gap-4 mb-6">
          {moodData.map((day, index) => <div key={index} className="text-center">
              <p className="text-sm font-bold text-foreground">{day.day}</p>
            </div>)}
        </div>

        {/* HUMOR */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">HUMOR

        </h3>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {moodData.map((day, index) => <div key={index} className="flex justify-center">
                <div className="w-8 bg-secondary rounded-sm relative" style={{
              height: '40px'
            }}>
                  <div className="bg-yellow-400 rounded-sm absolute bottom-0 w-full transition-all duration-300" style={{
                height: `${day.mood / 5 * 100}%`,
                minHeight: day.mood > 0 ? '4px' : '0px'
              }} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {day.mood}
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        {/* ENERGIA */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">ENERGIA

        </h3>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {moodData.map((day, index) => <div key={index} className="flex justify-center">
                <div className="w-8 bg-secondary rounded-sm relative" style={{
              height: '40px'
            }}>
                  <div className="bg-green-500 rounded-sm absolute bottom-0 w-full transition-all duration-300" style={{
                height: `${day.energy / 5 * 100}%`,
                minHeight: day.energy > 0 ? '4px' : '0px'
              }} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {day.energy}
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        {/* SONO */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-3 text-center">SONO

        </h3>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {moodData.map((day, index) => <div key={index} className="flex justify-center">
                <div className="w-8 bg-secondary rounded-sm relative" style={{
              height: '40px'
            }}>
                  <div className="bg-blue-500 rounded-sm absolute bottom-0 w-full transition-all duration-300" style={{
                height: `${day.sleep / 12 * 100}%`,
                minHeight: day.sleep > 0 ? '4px' : '0px'
              }} />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                    {day.sleep}h
                  </div>
                </div>
              </div>)}
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => setShowCheckinDialog(true)}>
          REGISTRAR
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
      
      <GoalsAchievementsDialog open={showGoalsAchievementsDialog} onOpenChange={setShowGoalsAchievementsDialog} clientId="current-user" // Para cliente atual
    clientName="Você" isProfessional={true} // Permitir que cliente também adicione metas/conquistas
    />
      
      <PsychologyCheckinHistoryDialog open={showPsychologyHistoryDialog} onOpenChange={setShowPsychologyHistoryDialog} />
      
      <WeeklyHistoryDialog open={showWeeklyHistoryDialog} onOpenChange={setShowWeeklyHistoryDialog} clientId="current-user" clientName="Você" />
      
      <ClientSessionReportsDialog open={showSessionReportsDialog} onOpenChange={setShowSessionReportsDialog} />
      
      <EditNextSessionDialog open={showEditNextSessionDialog} onOpenChange={setShowEditNextSessionDialog} clientName="Você" currentDate="2024-01-25" currentTime="15:00" />
    </div>;
};
export default PsychologySection;