import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  goal_type: string;
  target_value: number | null;
  current_value: number | null;
  target_date: string | null;
  description: string | null;
  is_active: boolean;
}

interface ClientGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const goalTypes = [
  { value: "weight_loss", label: "Perda de Peso" },
  { value: "muscle_gain", label: "Ganho de Massa" },
  { value: "endurance", label: "Resistência" },
  { value: "strength", label: "Força" },
  { value: "flexibility", label: "Flexibilidade" },
  { value: "other", label: "Outro" }
];

const ClientGoalsDialog = ({ isOpen, onClose }: ClientGoalsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: "",
    target_value: "",
    current_value: "",
    target_date: "",
    description: ""
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchGoals();
    }
  }, [isOpen, user]);

  const fetchGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus objetivos",
        variant: "destructive"
      });
      return;
    }

    setGoals(data || []);
  };

  const handleAddGoal = async () => {
    if (!user || !newGoal.goal_type) return;

    const { error } = await supabase
      .from('client_goals')
      .insert({
        client_id: user.id,
        goal_type: newGoal.goal_type,
        target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
        current_value: newGoal.current_value ? parseFloat(newGoal.current_value) : null,
        target_date: newGoal.target_date || null,
        description: newGoal.description || null
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o objetivo",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Objetivo adicionado com sucesso!"
    });

    setNewGoal({
      goal_type: "",
      target_value: "",
      current_value: "",
      target_date: "",
      description: ""
    });
    setShowAddForm(false);
    fetchGoals();
  };

  const handleRemoveGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('client_goals')
      .update({ is_active: false })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o objetivo",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Objetivo removido com sucesso!"
    });

    fetchGoals();
  };

  const getGoalTypeLabel = (type: string) => {
    const goalType = goalTypes.find(g => g.value === type);
    return goalType?.label || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Meus Objetivos</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Lista de objetivos existentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Objetivos Atuais</h3>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar</span>
              </Button>
            </div>

            {goals.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum objetivo definido ainda.</p>
                <p className="text-sm">Adicione seus objetivos para um treino mais direcionado!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {getGoalTypeLabel(goal.goal_type)}
                          </Badge>
                          {goal.target_date && (
                            <span className="text-sm text-muted-foreground">
                              Até: {new Date(goal.target_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                        {(goal.current_value !== null || goal.target_value !== null) && (
                          <div className="text-sm">
                            {goal.current_value !== null && (
                              <span>Atual: {goal.current_value} </span>
                            )}
                            {goal.target_value !== null && (
                              <span>Meta: {goal.target_value}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Formulário para adicionar novo objetivo */}
          {showAddForm && (
            <Card className="p-4">
              <h4 className="font-medium mb-4">Adicionar Novo Objetivo</h4>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Objetivo</Label>
                  <Select 
                    value={newGoal.goal_type} 
                    onValueChange={(value) => setNewGoal(prev => ({ ...prev, goal_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Atual</Label>
                    <Input
                      type="number"
                      placeholder="ex: 80"
                      value={newGoal.current_value}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, current_value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Meta</Label>
                    <Input
                      type="number"
                      placeholder="ex: 75"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Data Objetivo</Label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva seu objetivo..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddGoal} className="flex-1">
                    Adicionar Objetivo
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientGoalsDialog;