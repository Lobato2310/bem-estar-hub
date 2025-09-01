import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Utensils, Brain, Plus, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import WorkoutPlanEditor from "./WorkoutPlanEditor";
import WorkoutPlanDetailEditor from "./WorkoutPlanDetailEditor";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ClientPlanManagementProps {
  client: Client;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  status: string;
  exercises: any;
  created_at: string;
  training_day?: string;
  plan_group_id?: string;
  days_per_week?: number;
}

interface NutritionPlan {
  id: string;
  name: string;
  description: string;
  status: string;
  daily_calories: number;
  meals: any;
  created_at: string;
}

interface PsychologyGoal {
  id: string;
  goal_title: string;
  goal_description: string;
  status: string;
  progress: number;
  target_date: string;
  created_at: string;
}

const ClientPlanManagement = ({ client }: ClientPlanManagementProps) => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [psychologyGoals, setPsychologyGoals] = useState<PsychologyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating new plans
  const [showWorkoutDialog, setShowWorkoutDialog] = useState(false);
  const [showNutritionDialog, setShowNutritionDialog] = useState(false);
  const [showPsychologyDialog, setShowPsychologyDialog] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({ name: "", description: "" });
  const [nutritionForm, setNutritionForm] = useState({ name: "", description: "", daily_calories: "" });
  const [psychologyForm, setPsychologyForm] = useState({ 
    goal_title: "", 
    goal_description: "", 
    target_date: "" 
  });

  const loadClientPlans = async () => {
    if (!user || !client) return;
    
    setLoading(true);
    try {
      // Carregar planos de treino
      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', client.user_id)
        .eq('professional_id', user.id)
        .order('plan_group_id', { ascending: true })
        .order('training_day', { ascending: true });

      if (workoutError) throw workoutError;
      setWorkoutPlans(workoutData || []);

      // Carregar planos nutricionais
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', client.user_id)  
        .eq('professional_id', user.id);

      if (nutritionError) throw nutritionError;
      setNutritionPlans(nutritionData || []);

      // Carregar metas de psicologia
      const { data: psychologyData, error: psychologyError } = await supabase
        .from('psychology_goals')
        .select('*')
        .eq('client_id', client.user_id)
        .eq('professional_id', user.id);

      if (psychologyError) throw psychologyError;
      setPsychologyGoals(psychologyData || []);

    } catch (error) {
      console.error('Erro ao carregar planos do cliente:', error);
      toast.error('Erro ao carregar planos do cliente');
    } finally {
      setLoading(false);
    }
  };

  const createWorkoutPlan = async () => {
    if (!user || !client || !workoutForm.name) return;

    try {
      // First ensure professional-client relationship exists
      await supabase
        .from('professional_client_relationships')
        .upsert({
          professional_id: user.id,
          client_id: client.user_id,
          is_active: true
        }, {
          onConflict: 'professional_id,client_id'
        });

      const { error } = await supabase
        .from('workout_plans')
        .insert({
          client_id: client.user_id,
          professional_id: user.id,
          name: workoutForm.name,
          description: workoutForm.description,
          status: 'active',
          exercises: []
        });

      if (error) throw error;

      toast.success('Plano de treino criado com sucesso!');
      setWorkoutForm({ name: "", description: "" });
      setShowWorkoutDialog(false);
      loadClientPlans();
    } catch (error) {
      console.error('Erro ao criar plano de treino:', error);
      toast.error('Erro ao criar plano de treino');
    }
  };

  const createNutritionPlan = async () => {
    if (!user || !client || !nutritionForm.name) return;

    try {
      // First ensure professional-client relationship exists
      await supabase
        .from('professional_client_relationships')
        .upsert({
          professional_id: user.id,
          client_id: client.user_id,
          is_active: true
        }, {
          onConflict: 'professional_id,client_id'
        });

      const { error } = await supabase
        .from('nutrition_plans')
        .insert({
          client_id: client.user_id,
          professional_id: user.id,
          name: nutritionForm.name,
          description: nutritionForm.description,
          daily_calories: parseInt(nutritionForm.daily_calories) || null,
          status: 'active',
          meals: []
        });

      if (error) throw error;

      toast.success('Plano nutricional criado com sucesso!');
      setNutritionForm({ name: "", description: "", daily_calories: "" });
      setShowNutritionDialog(false);
      loadClientPlans();
    } catch (error) {
      console.error('Erro ao criar plano nutricional:', error);
      toast.error('Erro ao criar plano nutricional');
    }
  };

  const createPsychologyGoal = async () => {
    if (!user || !client || !psychologyForm.goal_title) return;

    try {
      // First ensure professional-client relationship exists
      await supabase
        .from('professional_client_relationships')
        .upsert({
          professional_id: user.id,
          client_id: client.user_id,
          is_active: true
        }, {
          onConflict: 'professional_id,client_id'
        });

      const { error } = await supabase
        .from('psychology_goals')
        .insert({
          client_id: client.user_id,
          professional_id: user.id,
          goal_title: psychologyForm.goal_title,
          goal_description: psychologyForm.goal_description,
          target_date: psychologyForm.target_date || null,
          status: 'active',
          progress: 0
        });

      if (error) throw error;

      toast.success('Meta psicológica criada com sucesso!');
      setPsychologyForm({ goal_title: "", goal_description: "", target_date: "" });
      setShowPsychologyDialog(false);
      loadClientPlans();
    } catch (error) {
      console.error('Erro ao criar meta psicológica:', error);
      toast.error('Erro ao criar meta psicológica');
    }
  };

  useEffect(() => {
    loadClientPlans();
  }, [client, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Planos de {client.display_name}</h2>
        <Badge variant="secondary">{client.email}</Badge>
      </div>

      <Tabs defaultValue="workout" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workout">Treinos</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          <TabsTrigger value="psychology">Psicologia</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-4">
          <WorkoutPlanEditor 
            clientId={client.user_id}
            professionalId={user?.id || ""}
            onPlanCreated={loadClientPlans}
          />

          <div className="grid gap-4">
            {workoutPlans.length > 0 ? (
              (() => {
                // Agrupar planos por plan_group_id
                const groupedPlans = workoutPlans.reduce((groups, plan) => {
                  const groupId = plan.plan_group_id || 'individual';
                  if (!groups[groupId]) {
                    groups[groupId] = [];
                  }
                  groups[groupId].push(plan);
                  return groups;
                }, {} as Record<string, WorkoutPlan[]>);

                return Object.entries(groupedPlans).map(([groupId, plans]) => {
                  const isGrouped = groupId !== 'individual';
                  const groupName = isGrouped ? plans[0]?.name.split(' - Treino ')[0] : '';
                  
                  if (isGrouped) {
                    // Mostrar como grupo de treinos A, B, C, etc.
                    return (
                      <Card key={groupId} className="border-2">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {groupName}
                              </CardTitle>
                              <CardDescription>
                                {plans[0]?.days_per_week} dias por semana - Treinos: {plans.map(p => p.training_day).join(', ')}
                              </CardDescription>
                            </div>
                            <Badge variant="default">
                              Plano Completo
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plans.map((plan) => (
                              <div key={plan.id} className="border rounded-lg p-3 bg-muted/50">
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <h5 className="font-medium">Treino {plan.training_day}</h5>
                                    <p className="text-sm text-muted-foreground">
                                      Exercícios: {Array.isArray(plan.exercises) ? plan.exercises.length : 0}
                                    </p>
                                  </div>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl">
                                      <DialogHeader>
                                        <DialogTitle>Editar {plan.name}</DialogTitle>
                                      </DialogHeader>
                                      <WorkoutPlanDetailEditor planId={plan.id} />
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">
                            Criado em: {new Date(plans[0]?.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    // Mostrar planos individuais (sem agrupamento)
                    return plans.map((plan) => (
                      <Card key={plan.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                {plan.name}
                              </CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                                {plan.status}
                              </Badge>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Editar {plan.name}</DialogTitle>
                                  </DialogHeader>
                                  <WorkoutPlanDetailEditor planId={plan.id} />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Exercícios: {Array.isArray(plan.exercises) ? plan.exercises.length : 0}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Criado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  }
                });
              })()
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum plano de treino criado ainda
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Planos Nutricionais</h3>
            <Dialog open={showNutritionDialog} onOpenChange={setShowNutritionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Plano Nutricional</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nutrition-name">Nome do Plano</Label>
                    <Input
                      id="nutrition-name"
                      value={nutritionForm.name}
                      onChange={(e) => setNutritionForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Dieta para Definição"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nutrition-calories">Calorias Diárias</Label>
                    <Input
                      id="nutrition-calories"
                      type="number"
                      value={nutritionForm.daily_calories}
                      onChange={(e) => setNutritionForm(prev => ({ ...prev, daily_calories: e.target.value }))}
                      placeholder="Ex: 2000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nutrition-description">Descrição</Label>
                    <Textarea
                      id="nutrition-description"
                      value={nutritionForm.description}
                      onChange={(e) => setNutritionForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o objetivo da dieta..."
                    />
                  </div>
                  <Button onClick={createNutritionPlan} className="w-full">
                    Criar Plano
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {nutritionPlans.length > 0 ? (
              nutritionPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Utensils className="h-5 w-5" />
                          {plan.name}
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {plan.daily_calories ? `${plan.daily_calories} kcal/dia` : 'Calorias não definidas'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum plano nutricional criado ainda
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="psychology" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Metas Psicológicas</h3>
            <Dialog open={showPsychologyDialog} onOpenChange={setShowPsychologyDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Meta Psicológica</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="psychology-title">Título da Meta</Label>
                    <Input
                      id="psychology-title"
                      value={psychologyForm.goal_title}
                      onChange={(e) => setPsychologyForm(prev => ({ ...prev, goal_title: e.target.value }))}
                      placeholder="Ex: Reduzir ansiedade pré-treino"
                    />
                  </div>
                  <div>
                    <Label htmlFor="psychology-date">Data Alvo</Label>
                    <Input
                      id="psychology-date"
                      type="date"
                      value={psychologyForm.target_date}
                      onChange={(e) => setPsychologyForm(prev => ({ ...prev, target_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="psychology-description">Descrição</Label>
                    <Textarea
                      id="psychology-description"
                      value={psychologyForm.goal_description}
                      onChange={(e) => setPsychologyForm(prev => ({ ...prev, goal_description: e.target.value }))}
                      placeholder="Descreva a meta e como alcançá-la..."
                    />
                  </div>
                  <Button onClick={createPsychologyGoal} className="w-full">
                    Criar Meta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {psychologyGoals.length > 0 ? (
              psychologyGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          {goal.goal_title}
                        </CardTitle>
                        <CardDescription>{goal.goal_description}</CardDescription>
                      </div>
                      <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Progresso: {goal.progress}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {goal.target_date ? `Meta: ${new Date(goal.target_date).toLocaleDateString('pt-BR')}` : 'Sem data alvo'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma meta psicológica criada ainda
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientPlanManagement;