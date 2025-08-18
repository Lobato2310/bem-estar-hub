import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Dumbbell, Apple, Brain, Lock, Video, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ProfessionalPsychologySection from "./sections/ProfessionalPsychologySection";


const ProfessionalDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [pendingCheckins, setPendingCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState("");
  const [isPsychUnlocked, setIsPsychUnlocked] = useState(false);
  const [psychPassword, setPsychPassword] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const exerciseNameRef = useRef<HTMLInputElement>(null);

  const ADMIN_PASSWORD = "MyFitLifeSistemaAdm";

  const handlePasswordSubmit = async () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Acesso liberado",
        description: "Bem-vindo ao painel administrativo profissional"
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Verifique a senha e tente novamente",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
// removed: fetchMarketProducts();
      fetchExercises();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedClient) {
      fetchWorkoutPlans();
      fetchNutritionPlans();
      fetchMeasurements();
      fetchPendingCheckins();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('user_type', 'client');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes",
        variant: "destructive"
      });
    }
  };

  const fetchWorkoutPlans = async () => {
    if (!selectedClient) return;
    
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('client_id', selectedClient);
      
      if (error) throw error;
      setWorkoutPlans(data || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    }
  };

  const fetchNutritionPlans = async () => {
    if (!selectedClient) return;
    
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('client_id', selectedClient);
      
      if (error) throw error;
      setNutritionPlans(data || []);
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
    }
  };

// removed: fetchMarketProducts function

  const fetchMeasurements = async () => {
    if (!selectedClient) return;
    try {
      const { data, error } = await supabase
        .from('client_measurements')
        .select('*')
        .eq('client_id', selectedClient)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  const fetchPendingCheckins = async () => {
    if (!selectedClient) return;
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select('*')
        .eq('client_id', selectedClient)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPendingCheckins(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar exercícios",
        variant: "destructive"
      });
    }
  };

  const saveWorkoutExercise = async (exerciseName, sets, videoFile = null) => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      let videoPath = null;
      
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('exercise-videos')
          .upload(filePath, videoFile);
        
        if (uploadError) throw uploadError;
        videoPath = filePath;
      }
      
      const { error } = await supabase
        .from('workout_plans')
        .insert({
          client_id: selectedClient,
          professional_id: user.id,
          exercise_name: exerciseName,
          sets: sets,
          video_file_path: videoPath
        });
      
      if (error) throw error;
      
      await fetchWorkoutPlans();
      toast({
        title: "Sucesso",
        description: "Exercício salvo com sucesso!"
      });
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar exercício",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNutritionPlan = async (mealType, mealTime, mealTimeEnd, description, observations = '') => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('nutrition_plans')
        .upsert({
          client_id: selectedClient,
          professional_id: user.id,
          meal_type: mealType,
          meal_time: mealTime,
          meal_time_end: mealTimeEnd,
          meal_description: description,
          observations: observations
        }, {
          onConflict: 'client_id,meal_type'
        });
      
      if (error) throw error;
      
      await fetchNutritionPlans();
      toast({
        title: "Sucesso",
        description: "Plano nutricional salvo com sucesso!"
      });
    } catch (error) {
      console.error('Error saving nutrition plan:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar plano nutricional",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

// removed: saveMarketProduct

// removed: deleteMarketProduct

  const savePsychologySession = async (sessionDate, sessionType, notes) => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('psychology_sessions')
        .insert({
          client_id: selectedClient,
          professional_id: user.id,
          session_date: sessionDate,
          session_type: sessionType,
          notes: notes
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Sessão agendada com sucesso!"
      });
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Erro",
        description: "Erro ao agendar sessão",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePsychologyGoal = async (goalText, goalPeriod) => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('psychology_goals')
        .insert({
          client_id: selectedClient,
          professional_id: user.id,
          goal_text: goalText,
          goal_period: goalPeriod
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Meta quinzenal adicionada com sucesso!"
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar meta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMotivationalPhrase = async (phrase) => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('motivational_phrases')
        .insert({
          client_id: selectedClient,
          professional_id: user.id,
          phrase: phrase
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Frase motivacional adicionada com sucesso!"
      });
    } catch (error) {
      console.error('Error saving phrase:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar frase motivacional",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveClientReport = async (reportText) => {
    if (!selectedClient || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_reports')
        .insert({
          client_id: selectedClient,
          professional_id: user.id,
          report_text: reportText
        });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Relatório do cliente salvo com sucesso!"
      });
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar relatório",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitCheckinFeedback = async (checkinId: string, feedback: string) => {
    if (!user || !selectedClient) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('client_checkins')
        .update({
          nutritionist_feedback: feedback,
          feedback_date: new Date().toISOString(),
          status: 'reviewed'
        })
        .eq('id', checkinId)
        .eq('client_id', selectedClient);
      if (error) throw error;
      toast({ title: 'Feedback enviado', description: 'O check-in foi analisado.' });
      await fetchPendingCheckins();
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      toast({ title: 'Erro', description: 'Não foi possível enviar o feedback', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveExercise = async (name, description, instructions, muscleGroup, equipment, difficultyLevel, videoFile = null) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let videoPath = null;
      let videoUrl = null;
      
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('exercise-videos')
          .upload(filePath, videoFile);
        
        if (uploadError) throw uploadError;
        videoPath = filePath;
        
        const { data: { publicUrl } } = supabase.storage
          .from('exercise-videos')
          .getPublicUrl(filePath);
        videoUrl = publicUrl;
      }
      
      const { error } = await (supabase as any)
        .from('exercises')
        .insert({
          name,
          description,
          instructions,
          muscle_group: muscleGroup,
          equipment,
          difficulty_level: difficultyLevel,
          video_file_path: videoPath,
          video_url: videoUrl,
          created_by: user.id
        });
      
      if (error) throw error;
      
      await fetchExercises();
      toast({
        title: "Sucesso",
        description: "Exercício adicionado à biblioteca!"
      });
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar exercício",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExercise = async (exerciseId) => {
    setIsLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('exercises')
        .delete()
        .eq('id', exerciseId);
      
      if (error) throw error;
      
      await fetchExercises();
      toast({
        title: "Sucesso",
        description: "Exercício removido da biblioteca!"
      });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover exercício",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Lock className="h-6 w-6" />
              <span>Acesso Profissional</span>
            </CardTitle>
            <p className="text-muted-foreground">Digite a senha administrativa</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Senha Administrativa</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Digite a senha"
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Acessar Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo Profissional</h1>
        <p className="text-lg text-muted-foreground">
          Gerencie todos os aspectos dos clientes da plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <Dumbbell className="h-4 w-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Exercícios</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center space-x-2">
            <Apple className="h-4 w-4" />
            <span>Nutrição</span>
          </TabsTrigger>
          <TabsTrigger value="measurements" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Medidas</span>
          </TabsTrigger>
          <TabsTrigger value="psychology" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Psicologia</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Trainer Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Treinos dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        {client.full_name || 'Cliente sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClient && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Treinos do Cliente</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Exercício
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Exercício</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const formData = new FormData(form);
                          const exerciseName = formData.get('exerciseName') as string;
                          const sets = formData.get('sets') as string;
                          const videoFileEntry = formData.get('video') as File;
                          const videoFile = videoFileEntry?.size > 0 ? videoFileEntry : null;
                          saveWorkoutExercise(exerciseName, sets, videoFile);
                          form.reset();
                        }} className="space-y-4">
                          <div>
                            <Label>Nome do Exercício</Label>
                            <Select value={selectedExerciseName} onValueChange={(v) => setSelectedExerciseName(v)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um exercício da biblioteca" />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map((ex) => (
                                  <SelectItem key={ex.id} value={ex.name}>{ex.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <input type="hidden" name="exerciseName" value={selectedExerciseName} />
                          </div>
                          <div>
                            <Label>Séries x Repetições</Label>
                            <Input name="sets" placeholder="Ex: 4x12" required />
                          </div>
                          <div>
                            <Label>Vídeo de Exemplo</Label>
                            <Input name="video" type="file" accept="video/*" />
                            <p className="text-sm text-muted-foreground mt-1">
                              Carregue um vídeo do próprio celular para demonstração
                            </p>
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Exercício"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="grid gap-4">
                    {workoutPlans.map((plan) => (
                      <Card key={plan.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{plan.exercise_name}</h4>
                              <p className="text-sm text-muted-foreground">{plan.sets}</p>
                            </div>
                            <div className="flex space-x-2">
                              {plan.video_file_path && (
                                <Button variant="outline" size="sm">
                                  <Video className="h-4 w-4 mr-2" />
                                  Ver Vídeo
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {workoutPlans.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum exercício cadastrado para este cliente
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercises Library Tab */}
        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biblioteca de Exercícios</CardTitle>
              <p className="text-muted-foreground">Cadastre exercícios com vídeos para usar nos planos dos clientes</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Exercícios Cadastrados</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Exercício
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Exercício na Biblioteca</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const formData = new FormData(form);
                      const name = formData.get('name') as string;
                      const description = formData.get('description') as string;
                      const instructions = formData.get('instructions') as string;
                      const muscleGroup = formData.get('muscleGroup') as string;
                      const equipment = formData.get('equipment') as string;
                      const difficultyLevel = formData.get('difficultyLevel') as string;
                      const videoFileEntry = formData.get('video') as File;
                      const videoFile = videoFileEntry?.size > 0 ? videoFileEntry : null;
                      saveExercise(name, description, instructions, muscleGroup, equipment, difficultyLevel, videoFile);
                      form.reset();
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome do Exercício</Label>
                          <Input name="name" placeholder="Ex: Supino Reto com Halter" required />
                        </div>
                        <div>
                          <Label>Grupo Muscular</Label>
                          <Select name="muscleGroup" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o grupo muscular" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Peito">Peito</SelectItem>
                              <SelectItem value="Costas">Costas</SelectItem>
                              <SelectItem value="Pernas">Pernas</SelectItem>
                              <SelectItem value="Ombros">Ombros</SelectItem>
                              <SelectItem value="Braços">Braços</SelectItem>
                              <SelectItem value="Core">Core</SelectItem>
                              <SelectItem value="Cardio">Cardio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Equipamento Necessário</Label>
                          <Input name="equipment" placeholder="Ex: Halteres, Barra, Peso Corporal" />
                        </div>
                        <div>
                          <Label>Nível de Dificuldade</Label>
                          <Select name="difficultyLevel">
                            <SelectTrigger>
                              <SelectValue placeholder="Nível de dificuldade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Iniciante">Iniciante</SelectItem>
                              <SelectItem value="Intermediário">Intermediário</SelectItem>
                              <SelectItem value="Avançado">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Descrição do Exercício</Label>
                        <Textarea 
                          name="description" 
                          placeholder="Breve descrição do exercício e seus benefícios..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Instruções de Execução</Label>
                        <Textarea 
                          name="instructions" 
                          placeholder="Passo a passo detalhado de como executar o exercício..."
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <Label>Vídeo Demonstrativo</Label>
                        <Input name="video" type="file" accept="video/*" />
                        <p className="text-sm text-muted-foreground mt-1">
                          Carregue um vídeo demonstrativo do exercício (MP4, MOV, AVI)
                        </p>
                      </div>
                      
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Cadastrando..." : "Cadastrar na Biblioteca"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {exercises.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{exercise.name}</h4>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {exercise.muscle_group}
                            </span>
                            {exercise.difficulty_level && (
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                                {exercise.difficulty_level}
                              </span>
                            )}
                          </div>
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                          )}
                          {exercise.equipment && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Equipamento:</strong> {exercise.equipment}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {exercise.video_file_path && (
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Ver Vídeo
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteExercise(exercise.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {exercise.instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Ver instruções de execução
                            </summary>
                            <p className="mt-2 text-muted-foreground whitespace-pre-wrap">
                              {exercise.instructions}
                            </p>
                          </details>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {exercises.length === 0 && (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum exercício cadastrado na biblioteca</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastre exercícios com vídeos para usar nos planos dos clientes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Dieta dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        {client.full_name || 'Cliente sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClient && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Refeições</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Refeição
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nova Refeição</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const formData = new FormData(form);
                          const mealTypeName = (formData.get('mealTypeName') as string)?.trim();
                          const mealTime = formData.get('mealTime') as string;
                          const mealTimeEnd = formData.get('mealTimeEnd') as string;
                          const description = formData.get('description') as string;
                          const observations = formData.get('observations') as string;
                          if (mealTypeName) {
                            saveNutritionPlan(mealTypeName, mealTime, mealTimeEnd, description, observations);
                            form.reset();
                          }
                        }} className="space-y-3">
                          <div>
                            <Label>Nome da Refeição</Label>
                            <Input name="mealTypeName" placeholder="Ex: Lanche da manhã" required />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Horário Início</Label>
                              <Input name="mealTime" type="time" />
                            </div>
                            <div>
                              <Label>Horário Final</Label>
                              <Input name="mealTimeEnd" type="time" />
                            </div>
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Textarea name="description" placeholder="Detalhe os alimentos e porções..." />
                          </div>
                          <div>
                            <Label>Observações</Label>
                            <Textarea name="observations" placeholder="Observações e dicas..." />
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Adicionar'}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['breakfast', 'lunch', 'snack', 'dinner'].map((mealType) => {
                      const mealNames = {
                        breakfast: 'Café da Manhã',
                        lunch: 'Almoço', 
                        snack: 'Lanche',
                        dinner: 'Jantar'
                      } as Record<string,string>;
                      const existingPlan = nutritionPlans.find(plan => plan.meal_type === mealType);
                      return (
                        <Card key={mealType}>
                          <CardHeader>
                            <CardTitle className="text-lg">{mealNames[mealType]}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const formData = new FormData(form);
                              const mealTime = formData.get('mealTime') as string;
                              const mealTimeEnd = formData.get('mealTimeEnd') as string;
                              const description = formData.get('description') as string;
                              const observations = formData.get('observations') as string;
                              saveNutritionPlan(mealType, mealTime, mealTimeEnd, description, observations);
                            }} className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Horário Início</Label>
                                  <Input name="mealTime" type="time" defaultValue={existingPlan?.meal_time || ''} />
                                </div>
                                <div>
                                  <Label>Horário Final</Label>
                                  <Input name="mealTimeEnd" type="time" defaultValue={existingPlan?.meal_time_end || ''} />
                                </div>
                              </div>
                              <div>
                                <Label>Descrição da Refeição</Label>
                                <Textarea name="description" placeholder={`Descreva o ${(mealNames[mealType] || mealType).toLowerCase()}...`} defaultValue={existingPlan?.meal_description || ''} />
                              </div>
                              <div>
                                <Label>Observações Nutricionais</Label>
                                <Textarea name="observations" placeholder="Dicas nutricionais para o dia a dia..." defaultValue={existingPlan?.observations || ''} />
                              </div>
                              <Button type="submit" size="sm" disabled={isLoading}>
                                {isLoading ? 'Salvando...' : 'Salvar'}
                              </Button>
                            </form>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Outras Refeições (customizadas) */}
                  {nutritionPlans.filter((p) => !['breakfast','lunch','snack','dinner'].includes(p.meal_type)).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold">Outras Refeições</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {nutritionPlans.filter((p) => !['breakfast','lunch','snack','dinner'].includes(p.meal_type)).map((plan) => (
                          <Card key={plan.id}>
                            <CardHeader>
                              <CardTitle className="text-lg">{plan.meal_type}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const formData = new FormData(form);
                                const mealTime = formData.get('mealTime') as string;
                                const mealTimeEnd = formData.get('mealTimeEnd') as string;
                                const description = formData.get('description') as string;
                                const observations = formData.get('observations') as string;
                                saveNutritionPlan(plan.meal_type, mealTime, mealTimeEnd, description, observations);
                              }} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Horário Início</Label>
                                    <Input name="mealTime" type="time" defaultValue={plan.meal_time || ''} />
                                  </div>
                                  <div>
                                    <Label>Horário Final</Label>
                                    <Input name="mealTimeEnd" type="time" defaultValue={plan.meal_time_end || ''} />
                                  </div>
                                </div>
                                <div>
                                  <Label>Descrição da Refeição</Label>
                                  <Textarea name="description" placeholder={`Descreva ${plan.meal_type.toLowerCase()}...`} defaultValue={plan.meal_description || ''} />
                                </div>
                                <div>
                                  <Label>Observações Nutricionais</Label>
                                  <Textarea name="observations" placeholder="Dicas nutricionais para o dia a dia..." defaultValue={plan.observations || ''} />
                                </div>
                                <Button type="submit" size="sm" disabled={isLoading}>
                                  {isLoading ? 'Salvando...' : 'Salvar'}
                                </Button>
                              </form>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        {/* Psychology Tab */}
        <TabsContent value="psychology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Psicologia dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.user_id} value={client.user_id}>
                        {client.full_name || 'Cliente sem nome'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agenda do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const sessionDate = formData.get('sessionDate') as string;
                        const sessionType = formData.get('sessionType') as string;
                        const notes = formData.get('notes') as string;
                        savePsychologySession(sessionDate, sessionType, notes);
                        form.reset();
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label>Data e Hora</Label>
                            <Input name="sessionDate" type="datetime-local" required />
                          </div>
                          <div>
                            <Label>Tipo de Sessão</Label>
                            <select name="sessionType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="">Selecione o tipo de sessão</option>
                              <option value="therapy">Terapia Individual</option>
                              <option value="evaluation">Avaliação</option>
                              <option value="followup">Acompanhamento</option>
                            </select>
                          </div>
                          <div>
                            <Label>Observações</Label>
                            <Textarea name="notes" placeholder="Notas da sessão..." />
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Agendando..." : "Agendar Sessão"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metas Quinzenais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const goalText = formData.get('goalText') as string;
                        const goalPeriod = formData.get('goalPeriod') as string;
                        savePsychologyGoal(goalText, goalPeriod);
                        form.reset();
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label>Nova Meta</Label>
                            <Textarea name="goalText" placeholder="Descreva a meta quinzenal..." required />
                          </div>
                          <div>
                            <Label>Período</Label>
                            <select name="goalPeriod" defaultValue="quinzenal" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="semanal">Semanal</option>
                              <option value="quinzenal">Quinzenal</option>
                              <option value="mensal">Mensal</option>
                            </select>
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Adicionar Meta"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frases Motivacionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const phrase = formData.get('phrase') as string;
                        saveMotivationalPhrase(phrase);
                        form.reset();
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label>Nova Frase</Label>
                            <Textarea name="phrase" placeholder="Digite uma frase motivacional..." required />
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Adicionar Frase"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relatório do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const reportText = formData.get('reportText') as string;
                        saveClientReport(reportText);
                        form.reset();
                      }}>
                        <div className="space-y-4">
                          <div>
                            <Label>Observações</Label>
                            <Textarea name="reportText" placeholder="Atualize o relatório do cliente..." required />
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Relatório"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;