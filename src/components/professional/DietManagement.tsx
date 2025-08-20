import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, Utensils, Users, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  observations: string;
}

interface DietPlan {
  clientId: string;
  clientName: string;
  meals: Meal[];
  dailyCalories: number;
  description: string;
}

const DietManagement = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [dietPlan, setDietPlan] = useState<DietPlan>({
    clientId: "",
    clientName: "",
    meals: [],
    dailyCalories: 2000,
    description: ""
  });
  const [isAddMealDialogOpen, setIsAddMealDialogOpen] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<Meal>({
    id: "",
    name: "",
    time: "",
    foods: [],
    observations: ""
  });
  const [currentFood, setCurrentFood] = useState<FoodItem>({
    id: "",
    name: "",
    quantity: "",
    unit: "g"
  });
  const [loading, setLoading] = useState(false);

  // Carregar clientes
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'client');

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Erro ao carregar lista de clientes');
      }
    };

    loadClients();
  }, [user]);

  // Carregar plano nutricional existente quando cliente é selecionado
  useEffect(() => {
    const loadExistingPlan = async () => {
      if (!selectedClient || !user) return;

      try {
        const { data, error } = await supabase
          .from('nutrition_plans')
          .select('*')
          .eq('client_id', selectedClient)
          .eq('professional_id', user.id)
          .eq('status', 'active')
          .single();

        if (data && !error) {
          const selectedClientData = clients.find(c => c.user_id === selectedClient);
          const meals = data.meals ? (Array.isArray(data.meals) ? data.meals as unknown as Meal[] : []) : [];
          setDietPlan({
            clientId: selectedClient,
            clientName: selectedClientData?.display_name || "",
            meals: meals,
            dailyCalories: data.daily_calories || 2000,
            description: data.description || ""
          });
        } else {
          // Resetar para novo plano
          const selectedClientData = clients.find(c => c.user_id === selectedClient);
          setDietPlan({
            clientId: selectedClient,
            clientName: selectedClientData?.display_name || "",
            meals: [],
            dailyCalories: 2000,
            description: ""
          });
        }
      } catch (error) {
        console.error('Erro ao carregar plano existente:', error);
      }
    };

    loadExistingPlan();
  }, [selectedClient, clients, user]);

  const addFoodToMeal = () => {
    if (!currentFood.name || !currentFood.quantity) {
      toast.error('Preencha nome e quantidade do alimento');
      return;
    }

    const newFood: FoodItem = {
      id: Date.now().toString(),
      ...currentFood
    };

    setCurrentMeal(prev => ({
      ...prev,
      foods: [...prev.foods, newFood]
    }));

    setCurrentFood({ id: "", name: "", quantity: "", unit: "g" });
  };

  const removeFoodFromMeal = (foodId: string) => {
    setCurrentMeal(prev => ({
      ...prev,
      foods: prev.foods.filter(food => food.id !== foodId)
    }));
  };

  const saveMeal = () => {
    if (!currentMeal.name || !currentMeal.time || currentMeal.foods.length === 0) {
      toast.error('Preencha todos os campos obrigatórios da refeição');
      return;
    }

    const mealToSave: Meal = {
      ...currentMeal,
      id: currentMeal.id || Date.now().toString()
    };

    if (currentMeal.id) {
      // Editar refeição existente
      setDietPlan(prev => ({
        ...prev,
        meals: prev.meals.map(meal => 
          meal.id === currentMeal.id ? mealToSave : meal
        )
      }));
    } else {
      // Adicionar nova refeição
      setDietPlan(prev => ({
        ...prev,
        meals: [...prev.meals, mealToSave]
      }));
    }

    setCurrentMeal({ id: "", name: "", time: "", foods: [], observations: "" });
    setIsAddMealDialogOpen(false);
    toast.success('Refeição salva com sucesso');
  };

  const editMeal = (meal: Meal) => {
    setCurrentMeal(meal);
    setIsAddMealDialogOpen(true);
  };

  const removeMeal = (mealId: string) => {
    setDietPlan(prev => ({
      ...prev,
      meals: prev.meals.filter(meal => meal.id !== mealId)
    }));
    toast.success('Refeição removida');
  };

  const saveDietPlan = async () => {
    if (!selectedClient || !user) {
      toast.error('Selecione um cliente');
      return;
    }

    if (dietPlan.meals.length === 0) {
      toast.error('Adicione pelo menos uma refeição');
      return;
    }

    setLoading(true);
    try {
      const planData = {
        name: `Plano Nutricional - ${dietPlan.clientName}`,
        description: dietPlan.description,
        client_id: selectedClient,
        professional_id: user.id,
        daily_calories: dietPlan.dailyCalories,
        meals: dietPlan.meals as any, // Cast para Json
        status: 'active'
      };

      // Verificar se já existe um plano ativo
      const { data: existingPlan } = await supabase
        .from('nutrition_plans')
        .select('id')
        .eq('client_id', selectedClient)
        .eq('professional_id', user.id)
        .eq('status', 'active')
        .single();

      if (existingPlan) {
        // Atualizar plano existente
        const { error } = await supabase
          .from('nutrition_plans')
          .update(planData)
          .eq('id', existingPlan.id);

        if (error) throw error;
        toast.success('Plano nutricional atualizado com sucesso');
      } else {
        // Criar novo plano
        const { error } = await supabase
          .from('nutrition_plans')
          .insert(planData);

        if (error) throw error;
        toast.success('Plano nutricional criado com sucesso');
      }
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano nutricional');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Utensils className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Administrar Dietas</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Crie e gerencie planos nutricionais personalizados para seus clientes
        </p>
      </div>

      {/* Seleção de Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Selecionar Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um cliente para criar/editar a dieta" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.user_id} value={client.user_id}>
                  {client.display_name || client.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Informações Gerais da Dieta */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição do Plano</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os objetivos e características do plano nutricional..."
                  value={dietPlan.description}
                  onChange={(e) => setDietPlan(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="calories">Calorias Diárias (kcal)</Label>
                <Input
                  id="calories"
                  type="number"
                  value={dietPlan.dailyCalories}
                  onChange={(e) => setDietPlan(prev => ({ ...prev, dailyCalories: parseInt(e.target.value) || 2000 }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Refeições */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Refeições</CardTitle>
                  <CardDescription>Gerencie as refeições do plano nutricional</CardDescription>
                </div>
                <Dialog open={isAddMealDialogOpen} onOpenChange={setIsAddMealDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setCurrentMeal({ id: "", name: "", time: "", foods: [], observations: "" })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Refeição
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {currentMeal.id ? 'Editar Refeição' : 'Nova Refeição'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="meal-name">Nome da Refeição *</Label>
                        <Input
                          id="meal-name"
                          placeholder="Ex: Café da manhã, Almoço, Jantar..."
                          value={currentMeal.name}
                          onChange={(e) => setCurrentMeal(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="meal-time">Horário *</Label>
                        <Input
                          id="meal-time"
                          type="time"
                          value={currentMeal.time}
                          onChange={(e) => setCurrentMeal(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>

                      {/* Adicionar Alimentos */}
                      <div className="space-y-3">
                        <Label>Alimentos *</Label>
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <Input
                              placeholder="Nome do alimento"
                              value={currentFood.name}
                              onChange={(e) => setCurrentFood(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                              placeholder="Quantidade"
                              value={currentFood.quantity}
                              onChange={(e) => setCurrentFood(prev => ({ ...prev, quantity: e.target.value }))}
                            />
                            <Select 
                              value={currentFood.unit} 
                              onValueChange={(value) => setCurrentFood(prev => ({ ...prev, unit: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">gramas (g)</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="unidade">unidade</SelectItem>
                                <SelectItem value="colher">colher</SelectItem>
                                <SelectItem value="xícara">xícara</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="button" onClick={addFoodToMeal}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Lista de alimentos adicionados */}
                          <div className="space-y-2">
                            {currentMeal.foods.map((food) => (
                              <div key={food.id} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span>{food.name} - {food.quantity} {food.unit}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFoodFromMeal(food.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="observations">Observações e Dicas</Label>
                        <Textarea
                          id="observations"
                          placeholder="Dicas de preparo, opções de substituição, observações nutricionais..."
                          value={currentMeal.observations}
                          onChange={(e) => setCurrentMeal(prev => ({ ...prev, observations: e.target.value }))}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddMealDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={saveMeal}>
                          Salvar Refeição
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {dietPlan.meals.length > 0 ? (
                <div className="space-y-4">
                  {dietPlan.meals.map((meal) => (
                    <div key={meal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{meal.name}</h3>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{meal.time}</span>
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => editMeal(meal)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => removeMeal(meal.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Alimentos:</p>
                          <div className="space-y-1">
                            {meal.foods.map((food, foodIndex) => (
                              <Badge key={`${meal.id}-food-${foodIndex}`} variant="secondary" className="mr-1 mb-1">
                                {food.name} - {food.quantity} {food.unit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {meal.observations && (
                          <div>
                            <p className="text-sm font-medium mb-2">Observações:</p>
                            <p className="text-sm text-muted-foreground">{meal.observations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma refeição adicionada. Clique em "Nova Refeição" para começar.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Salvar Plano */}
          <div className="flex justify-end">
            <Button onClick={saveDietPlan} disabled={loading} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Plano Nutricional'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DietManagement;