import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Plus, Trophy, Target, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  category: string;
}

interface GoalsAchievementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export const GoalsAchievementsDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName 
}: GoalsAchievementsDialogProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState("achievements");
  const [showAddAchievementForm, setShowAddAchievementForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
    category: string;
  }>({
    title: "",
    description: "",
    category: "Geral"
  });

  const [newGoal, setNewGoal] = useState<{
    title: string;
    description: string;
    targetDate: string;
    category: string;
  }>({
    title: "",
    description: "",
    targetDate: "",
    category: "Geral"
  });

  // Mock data - substituir por dados reais do Supabase
  useEffect(() => {
    setAchievements([
      {
        id: "1",
        title: "Primeira consulta completa",
        description: "Participou de toda a primeira sessão e demonstrou engajamento",
        date: new Date(2024, 7, 15),
        category: "Consulta"
      },
      {
        id: "2", 
        title: "Meta de exercícios atingida",
        description: "Completou 4 dias de exercícios na semana conforme planejado",
        date: new Date(2024, 7, 20),
        category: "Exercícios"
      }
    ]);

    setGoals([
      {
        id: "1",
        title: "Meditar 10 minutos diários",
        description: "Praticar meditação mindfulness todos os dias por pelo menos 10 minutos",
        targetDate: new Date(2024, 8, 30),
        status: "active",
        progress: 65,
        category: "Bem-estar"
      },
      {
        id: "2",
        title: "Exercitar-se 4x por semana",
        description: "Realizar atividade física pelo menos 4 dias na semana",
        targetDate: new Date(2024, 8, 15),
        status: "active",
        progress: 80,
        category: "Exercícios"
      }
    ]);
  }, [clientId]);

  const handleAddAchievement = () => {
    if (!newAchievement.title.trim()) {
      toast.error("Por favor, digite um título para a conquista");
      return;
    }

    const achievement: Achievement = {
      id: Date.now().toString(),
      title: newAchievement.title,
      description: newAchievement.description,
      date: new Date(),
      category: newAchievement.category
    };

    setAchievements(prev => [achievement, ...prev]);
    setNewAchievement({
      title: "",
      description: "",
      category: "Geral"
    });
    setShowAddAchievementForm(false);
    toast.success("Conquista adicionada com sucesso!");
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      toast.error("Por favor, digite um título para a meta");
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: new Date(newGoal.targetDate),
      status: "active",
      progress: 0,
      category: newGoal.category
    };

    setGoals(prev => [goal, ...prev]);
    setNewGoal({
      title: "",
      description: "",
      targetDate: "",
      category: "Geral"
    });
    setShowAddGoalForm(false);
    toast.success("Meta adicionada com sucesso!");
  };

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusLabels = {
    active: "Ativa",
    completed: "Concluída",
    paused: "Pausada"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas e Metas - {clientName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Metas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-4">
            {/* Header Conquistas */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {achievements.length} conquista(s) registrada(s)
                </p>
              </div>
              <Button 
                onClick={() => setShowAddAchievementForm(!showAddAchievementForm)} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Conquista
              </Button>
            </div>

            {/* Form para nova conquista */}
            {showAddAchievementForm && (
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="achievement-title">Título da Conquista</Label>
                    <Input
                      id="achievement-title"
                      placeholder="Ex: Completou exercícios da semana"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievement-description">Descrição</Label>
                    <Textarea
                      id="achievement-description"
                      placeholder="Detalhe a conquista..."
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="achievement-category">Categoria</Label>
                    <Input
                      id="achievement-category"
                      placeholder="Ex: Exercícios, Nutrição, Bem-estar..."
                      value={newAchievement.category}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddAchievement} className="flex-1">
                      Adicionar Conquista
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddAchievementForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Lista de Conquistas */}
            <div className="space-y-3">
              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma conquista registrada ainda.</p>
                </div>
              ) : (
                achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {achievement.category}
                          </Badge>
                        </div>
                        
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {achievement.description}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {format(achievement.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            {/* Header Metas */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  {goals.length} meta(s) definida(s)
                </p>
              </div>
              <Button 
                onClick={() => setShowAddGoalForm(!showAddGoalForm)} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Meta
              </Button>
            </div>

            {/* Form para nova meta */}
            {showAddGoalForm && (
              <Card className="p-4 border-primary/20 bg-primary/5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">Título da Meta</Label>
                    <Input
                      id="goal-title"
                      placeholder="Ex: Meditar 10 minutos por dia"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Descrição</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Detalhe a meta e como será medida..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-date">Data Alvo</Label>
                      <Input
                        id="goal-date"
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal-category">Categoria</Label>
                      <Input
                        id="goal-category"
                        placeholder="Ex: Exercícios, Nutrição..."
                        value={newGoal.category}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddGoal} className="flex-1">
                      Adicionar Meta
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddGoalForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Lista de Metas */}
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma meta definida ainda.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{goal.title}</h3>
                          <Badge className={getStatusColor(goal.status)}>
                            {statusLabels[goal.status]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {goal.category}
                          </Badge>
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="space-y-2 mb-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso: {goal.progress}%</span>
                            <span>Meta: {format(goal.targetDate, "dd/MM/yyyy")}</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};