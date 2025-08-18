import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Award, Plus, Trophy, Target, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'consultation' | 'goal' | 'milestone';
  category: string;
}

interface AchievementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AchievementsDialog = ({ open, onOpenChange }: AchievementsDialogProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState<{
    title: string;
    description: string;
    type: Achievement['type'];
    category: string;
  }>({
    title: "",
    description: "",
    type: "consultation",
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
        type: "consultation",
        category: "Consulta"
      },
      {
        id: "2", 
        title: "Meta de exercícios atingida",
        description: "Completou 4 dias de exercícios na semana conforme planejado",
        date: new Date(2024, 7, 20),
        type: "goal",
        category: "Exercícios"
      },
      {
        id: "3",
        title: "Melhora no humor relatada",
        description: "Cliente relatou melhora significativa no humor durante a semana",
        date: new Date(2024, 7, 22),
        type: "milestone",
        category: "Bem-estar"
      }
    ]);
  }, []);

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
      type: newAchievement.type,
      category: newAchievement.category
    };

    setAchievements(prev => [achievement, ...prev]);
    setNewAchievement({
      title: "",
      description: "",
      type: "consultation",
      category: "Geral"
    });
    setShowAddForm(false);
    toast.success("Conquista adicionada com sucesso!");
  };

  const getAchievementIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'consultation':
        return <Calendar className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'milestone':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800';
      case 'goal':
        return 'bg-green-100 text-green-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const typeLabels = {
    consultation: "Consulta",
    goal: "Meta",
    milestone: "Marco"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Conquistas do Cliente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botão Adicionar */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {achievements.length} conquista(s) registrada(s)
              </p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Conquista
            </Button>
          </div>

          {/* Formulário para adicionar conquista */}
          {showAddForm && (
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Conquista</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Completou exercícios da semana"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Detalhe a conquista..."
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <select
                      id="type"
                      className="w-full p-2 border rounded-md"
                      value={newAchievement.type}
                      onChange={(e) => setNewAchievement(prev => ({ 
                        ...prev, 
                        type: e.target.value as Achievement['type'] 
                      }))}
                    >
                      <option value="consultation">Consulta</option>
                      <option value="goal">Meta</option>
                      <option value="milestone">Marco</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Exercícios, Nutrição..."
                      value={newAchievement.category}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddAchievement} className="flex-1">
                    Adicionar Conquista
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de Conquistas */}
          <div className="space-y-4">
            {achievements.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma conquista registrada ainda.</p>
                <p className="text-sm text-muted-foreground">Adicione conquistas para acompanhar o progresso do cliente.</p>
              </div>
            ) : (
              achievements.map((achievement) => (
                <Card key={achievement.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-primary/10 rounded-full">
                          {getAchievementIcon(achievement.type)}
                        </div>
                        <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        <Badge className={getAchievementColor(achievement.type)}>
                          {typeLabels[achievement.type]}
                        </Badge>
                      </div>
                      
                      {achievement.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {format(achievement.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};