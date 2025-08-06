import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Dumbbell, Apple, ShoppingCart, Brain, Lock, Video, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ProfessionalDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [selectedClient, setSelectedClient] = useState("");
  const [clients, setClients] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [marketProducts, setMarketProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const ADMIN_PASSWORD = "MyFitLifeSistemaAdm";

  const handlePasswordSubmit = () => {
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
      fetchMarketProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedClient) {
      fetchWorkoutPlans();
      fetchNutritionPlans();
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

  const fetchMarketProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('market_products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMarketProducts(data || []);
    } catch (error) {
      console.error('Error fetching market products:', error);
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

  const saveNutritionPlan = async (mealType, mealTime, description, observations = '') => {
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

  const saveMarketProduct = async (name, price, category, description = '') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('market_products')
        .insert({
          name,
          price: parseFloat(price),
          category,
          description
        });
      
      if (error) throw error;
      
      await fetchMarketProducts();
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!"
      });
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMarketProduct = async (productId) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('market_products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      await fetchMarketProducts();
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover produto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <Dumbbell className="h-4 w-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center space-x-2">
            <Apple className="h-4 w-4" />
            <span>Nutrição</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Mercado</span>
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
                            <Input name="exerciseName" placeholder="Ex: Agachamento livre" required />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['breakfast', 'lunch', 'snack', 'dinner'].map((mealType) => {
                    const mealNames = {
                      breakfast: 'Café da Manhã',
                      lunch: 'Almoço', 
                      snack: 'Lanche',
                      dinner: 'Jantar'
                    };
                    
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
                            const description = formData.get('description') as string;
                            const observations = formData.get('observations') as string;
                            saveNutritionPlan(mealType, mealTime, description, observations);
                          }} className="space-y-3">
                            <div>
                              <Label>Horário</Label>
                              <Input 
                                name="mealTime" 
                                type="time" 
                                defaultValue={existingPlan?.meal_time || ''}
                              />
                            </div>
                            <div>
                              <Label>Descrição da Refeição</Label>
                              <Textarea 
                                name="description"
                                placeholder={`Descreva o ${mealNames[mealType].toLowerCase()}...`}
                                defaultValue={existingPlan?.meal_description || ''}
                              />
                            </div>
                            <div>
                              <Label>Observações Nutricionais</Label>
                              <Textarea 
                                name="observations"
                                placeholder="Dicas nutricionais para o dia a dia..."
                                defaultValue={existingPlan?.observations || ''}
                              />
                            </div>
                            <Button type="submit" size="sm" disabled={isLoading}>
                              {isLoading ? "Salvando..." : "Salvar"}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Mercado e Suplementos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-accent/5">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Informações de Entrega</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Horário:</strong> Segunda à Sexta, das 09:00 às 19:00<br />
                    <strong>Frete Grátis:</strong> Pedidos acima de R$ 150,00
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Produtos Disponíveis</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Produto</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const formData = new FormData(form);
                          const name = formData.get('name') as string;
                          const price = formData.get('price') as string;
                          const category = formData.get('category') as string;
                          saveMarketProduct(name, price, category);
                          form.reset();
                        }} className="space-y-4">
                          <div>
                            <Label>Nome do Produto</Label>
                            <Input name="name" placeholder="Ex: Whey Protein" required />
                          </div>
                          <div>
                            <Label>Preço (R$)</Label>
                            <Input name="price" placeholder="89.90" type="number" step="0.01" required />
                          </div>
                          <div>
                            <Label>Categoria</Label>
                            <Select name="category" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Proteína">Proteína</SelectItem>
                                <SelectItem value="Carboidrato">Carboidrato</SelectItem>
                                <SelectItem value="Suplemento">Suplemento</SelectItem>
                                <SelectItem value="Fruta">Fruta</SelectItem>
                                <SelectItem value="Vegetal">Vegetal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adicionando..." : "Adicionar Produto"}
                          </Button>
                        </form>
                      </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {marketProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-primary">R$ {product.price.toFixed(2)}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteMarketProduct(product.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {marketProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto cadastrado
                  </p>
                )}
              </div>
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
                            <Select name="sessionType" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo de sessão" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="therapy">Terapia Individual</SelectItem>
                                <SelectItem value="evaluation">Avaliação</SelectItem>
                                <SelectItem value="followup">Acompanhamento</SelectItem>
                              </SelectContent>
                            </Select>
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
                    <div>
                      <Label>Nova Meta</Label>
                      <Textarea placeholder="Descreva a meta quinzenal..." />
                    </div>
                    <Button>Adicionar Meta</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frases Motivacionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nova Frase</Label>
                      <Textarea placeholder="Digite uma frase motivacional..." />
                    </div>
                    <Button>Adicionar Frase</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relatório do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Observações</Label>
                      <Textarea placeholder="Atualize o relatório do cliente..." />
                    </div>
                    <Button>Salvar Relatório</Button>
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