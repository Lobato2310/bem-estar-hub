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
  created_at: string;
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
  const [profile, setProfile] = useState({
    training_days_per_week: "",
    training_duration_minutes: "",
    goal_type: "",
    current_weight: "",
    target_weight: "",
    target_date: "",
    description: "",
    limitations: ""
  });
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
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchGoals = async () => {
    if (!user) return;
    
    // For now, use local storage since client_goals table doesn't exist
    const storedGoals = localStorage.getItem(`goals_${user.id}`);
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    // For now, use local storage since client_goals table doesn't exist
    const storedProfile = localStorage.getItem(`profile_${user.id}`);
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  };

  const handleAddGoal = async () => {
    if (!user || !newGoal.goal_type) return;

    const newGoalObj: Goal = {
      id: Date.now().toString(),
      goal_type: newGoal.goal_type,
      target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
      current_value: newGoal.current_value ? parseFloat(newGoal.current_value) : null,
      target_date: newGoal.target_date || null,
      description: newGoal.description || null,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const updatedGoals = [newGoalObj, ...goals];
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));

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
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Save to local storage for now
    localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile));

    toast({ title: 'Sucesso', description: 'Configurações salvas com sucesso!' });
  };

  const handleRemoveGoal = async (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${user.id}`, JSON.stringify(updatedGoals));

    toast({
      title: "Sucesso",
      description: "Objetivo removido com sucesso!"
    });
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
          {/* Configuração do Perfil */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurar Perfil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Quantas vezes na semana consegue treinar:</Label>
                <Select 
                  value={profile.training_days_per_week} 
                  onValueChange={(value) => setProfile(prev => ({ ...prev, training_days_per_week: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dias por semana" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} {days === 1 ? 'dia' : 'dias'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Tempo de treino (minutos):</Label>
                <Input
                  type="number"
                  placeholder="ex: 60"
                  value={profile.training_duration_minutes}
                  onChange={(e) => setProfile(prev => ({ ...prev, training_duration_minutes: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Tipo do Objetivo:</Label>
              <Select 
                value={profile.goal_type} 
                onValueChange={(value) => setProfile(prev => ({ ...prev, goal_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o objetivo" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Peso Atual (kg):</Label>
                <Input
                  type="number"
                  placeholder="ex: 70"
                  value={profile.current_weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, current_weight: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Meta (kg):</Label>
                <Input
                  type="number"
                  placeholder="ex: 65"
                  value={profile.target_weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_weight: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Data Objetivo:</Label>
              <Input
                type="date"
                value={profile.target_date}
                onChange={(e) => setProfile(prev => ({ ...prev, target_date: e.target.value }))}
              />
            </div>

            <div>
              <Label>Descrição:</Label>
              <Textarea
                placeholder="Descreva seu objetivo..."
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>Limitações:</Label>
              <Textarea
                placeholder="Descreva aqui quaisquer limitações físicas. Exemplo: Lesão recente, condromalácia, etc."
                value={profile.limitations}
                onChange={(e) => setProfile(prev => ({ ...prev, limitations: e.target.value }))}
                rows={3}
              />
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              Salvar Configurações
            </Button>
          </div>

          {/* Lista de objetivos existentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Objetivos Adicionais</h3>
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