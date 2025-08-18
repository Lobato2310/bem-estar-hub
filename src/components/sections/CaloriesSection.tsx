import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Plus, Search, Utensils, Clock, Target, Edit, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { AddMealDialog } from "@/components/food/AddMealDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  defaultPortion: number;
  source: 'taco' | 'open';
}

interface MealFood {
  food: Food;
  quantity: number;
  calculatedNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

interface SavedMeal {
  id: string;
  mealType: string;
  foods: MealFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  date: string;
}

const CaloriesSection = () => {
  const { user } = useAuth();
  const [searchFood, setSearchFood] = useState("");
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [todayMeals, setTodayMeals] = useState<SavedMeal[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodQuantity, setFoodQuantity] = useState("");

  // Função para buscar alimentos no banco de dados
  const searchFoods = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Busca em múltiplas tabelas de alimentos
      const searchQueries = [];
      
      // Busca na tabela TACO (se existir)
      searchQueries.push(
        supabase
          .from('tabela_taco') // Ajuste o nome da tabela conforme sua estrutura
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(10)
      );

      // Busca na tabela Open Food Facts (se existir)
      searchQueries.push(
        supabase
          .from('tabela_open') // Ajuste o nome da tabela conforme sua estrutura
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(10)
      );

      const results = await Promise.allSettled(searchQueries);
      const allFoods: Food[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.data) {
          const foods = result.value.data.map((food: any) => ({
            id: food.id,
            alimento: food.alimento,
            calorias: food.calorias,
            proteina: food.proteina,
            carboidratos: food.carboidratos,
            gorduras: food.gorduras,
            fibras: food.fibras,
            defaultPortion: food.porcao,
            source: index === 0 ? 'taco' : 'open'
          }));
          allFoods.push(...foods);
        }
      });

      // Remove duplicatas baseado no nome
      const uniqueFoods = allFoods.filter((food, index, self) => 
        index === self.findIndex(f => f.name.toLowerCase() === food.name.toLowerCase())
      );

      setSearchResults(uniqueFoods);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      toast.error('Erro ao buscar alimentos');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce para a busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchFood);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchFood, searchFoods]);

  // Carregar refeições do dia atual
  const loadTodayMeals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Carregando refeições para user:', user.id);
      const today = new Date().toISOString().split('T')[0];
      const { data: foodLogs, error } = await supabase
        .from('client_food_logs')
        .select('*')
        .eq('client_id', user.id)
        .gte('eaten_at', `${today}T00:00:00`)
        .lt('eaten_at', `${today}T23:59:59`)
        .order('eaten_at', { ascending: true });

      if (error) {
        console.error('Erro na query client_food_logs:', error);
        throw error;
      }
      
      console.log('Food logs encontrados:', foodLogs);

      const meals: SavedMeal[] = (foodLogs || []).map(log => {
        const foods = Array.isArray(log.foods) ? log.foods as any[] : [];
        const parsedFoods: MealFood[] = foods.map(f => ({
          food: f.food || f,
          quantity: f.quantity || 0,
          calculatedNutrition: f.calculatedNutrition || {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          }
        }));

        return {
          id: log.id,
          mealType: log.meal_name,
          foods: parsedFoods,
          totalNutrition: {
            calories: Number(log.total_calories) || 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0
          },
          date: log.eaten_at
        };
      });

      setTodayMeals(meals);
    } catch (error) {
      console.error('Erro ao carregar refeições:', error);
      toast.error('Erro ao carregar refeições do dia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayMeals();
  }, [user]);

  const handleAddMeal = async (meal: {
    mealType: string;
    foods: MealFood[];
    totalNutrition: any;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('client_food_logs')
        .insert({
          client_id: user.id,
          meal_name: meal.mealType,
          foods: meal.foods as any,
          total_calories: meal.totalNutrition.calories,
          eaten_at: new Date().toISOString()
        });

      if (error) throw error;

      // Recarregar refeições
      loadTodayMeals();
      toast.success('Refeição salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      toast.error('Erro ao salvar refeição');
    }
  };

  // Adicionar alimento individual à refeição rápida
  const handleQuickAddFood = async () => {
    if (!selectedFood || !foodQuantity || !user) return;

    const quantity = parseFloat(foodQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Quantidade inválida');
      return;
    }

    // Calcular nutrição baseada na quantidade
    const calculatedNutrition = {
      calories: Math.round((selectedFood.calories * quantity) / 100),
      protein: Math.round((selectedFood.protein * quantity) / 100 * 10) / 10,
      carbs: Math.round((selectedFood.carbs * quantity) / 100 * 10) / 10,
      fat: Math.round((selectedFood.fat * quantity) / 100 * 10) / 10,
      fiber: Math.round(((selectedFood.fiber || 0) * quantity) / 100 * 10) / 10
    };

    const mealFood: MealFood = {
      food: selectedFood,
      quantity,
      calculatedNutrition
    };

    try {
      const { error } = await supabase
        .from('client_food_logs')
        .insert({
          client_id: user.id,
          meal_name: 'Lanche Rápido',
          foods: [mealFood] as any,
          total_calories: calculatedNutrition.calories,
          eaten_at: new Date().toISOString()
        });

      if (error) throw error;

      // Limpar seleção e recarregar
      setSelectedFood(null);
      setFoodQuantity("");
      setSearchFood("");
      setSearchResults([]);
      loadTodayMeals();
      toast.success('Alimento adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar alimento:', error);
      toast.error('Erro ao adicionar alimento');
    }
  };

  const consumedToday = todayMeals.reduce((sum, meal) => sum + meal.totalNutrition.calories, 0);
  const remaining = dailyGoal - consumedToday;

  // Calcular totais nutricionais do dia
  const dailyNutrition = todayMeals.reduce((total, meal) => {
    const mealNutrition = meal.foods.reduce((mealTotal, mealFood) => ({
      protein: mealTotal.protein + mealFood.calculatedNutrition.protein,
      carbs: mealTotal.carbs + mealFood.calculatedNutrition.carbs,
      fat: mealTotal.fat + mealFood.calculatedNutrition.fat,
      fiber: mealTotal.fiber + mealFood.calculatedNutrition.fiber
    }), { protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return {
      protein: total.protein + mealNutrition.protein,
      carbs: total.carbs + mealNutrition.carbs,
      fat: total.fat + mealNutrition.fat,
      fiber: total.fiber + mealNutrition.fiber
    };
  }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Calculator className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Contador de Calorias</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Acompanhe sua ingestão diária de calorias e nutrientes
        </p>
      </div>

      {/* Observação importante */}
      <Card className="p-4 bg-accent/50 border-warning">
        <p className="text-sm text-foreground">
          <strong>Importante:</strong> Aqui você deve adicionar todas as suas refeições, mesmo que não esteja no seu cronograma de dieta, para analisarmos os deslizes em refeições livres, e buscar ajustes.
        </p>
      </Card>

      {/* Meta diária */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <Target className="h-8 w-8 text-primary mx-auto" />
            <p className="text-2xl font-bold text-foreground">{dailyGoal}</p>
            <p className="text-sm text-muted-foreground">Meta Diária</p>
          </div>
          <div className="text-center space-y-2">
            <Utensils className="h-8 w-8 text-primary mx-auto" />
            <p className="text-2xl font-bold text-foreground">{consumedToday}</p>
            <p className="text-sm text-muted-foreground">Consumidas</p>
          </div>
          <div className="text-center space-y-2">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {remaining >= 0 ? 'Restantes' : 'Excesso'}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progresso Diário</span>
            <span>{Math.round((consumedToday / dailyGoal) * 100)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((consumedToday / dailyGoal) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Buscar e adicionar alimentos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Buscar e Adicionar Alimento</h2>
        
        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite o nome do alimento (ex: arroz, frango, maçã)..."
              value={searchFood}
              onChange={(e) => setSearchFood(e.target.value)}
              className="pl-10"
            />
            {searchFood && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  setSearchFood("");
                  setSearchResults([]);
                  setSelectedFood(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Loading de busca */}
          {searchLoading && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Buscando alimentos...</p>
            </div>
          )}

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              {searchResults.map((food) => (
                <div
                  key={food.id}
                  className={`p-3 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedFood?.id === food.id ? 'bg-primary/10 border-primary/20' : ''
                  }`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{food.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {food.calories} kcal por 100g | Proteína: {food.protein}g | Carbs: {food.carbs}g | Gordura: {food.fat}g
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      food.source === 'taco' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {food.source === 'taco' ? 'TACO' : 'Open Food'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Alimento selecionado e quantidade */}
          {selectedFood && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedFood.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFood.calories} kcal | P: {selectedFood.protein}g | C: {selectedFood.carbs}g | G: {selectedFood.fat}g (por 100g)
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Quantidade em gramas"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>
                  <Button onClick={handleQuickAddFood} disabled={!foodQuantity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {/* Preview dos valores calculados */}
                {foodQuantity && !isNaN(parseFloat(foodQuantity)) && parseFloat(foodQuantity) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>Para {foodQuantity}g: ~{Math.round((selectedFood.calories * parseFloat(foodQuantity)) / 100)} kcal</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Estado vazio */}
          {searchFood.length >= 2 && searchResults.length === 0 && !searchLoading && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum alimento encontrado para "{searchFood}"</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tente usar termos mais simples como "arroz", "frango" ou "maçã"
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Button onClick={() => setShowAddMeal(true)} className="w-full" variant="outline">
            <Utensils className="h-4 w-4 mr-2" />
            Criar Refeição Completa
          </Button>
        </div>
      </Card>

      {/* Refeições de hoje */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Refeições de Hoje</h2>
        
        {todayMeals.map((meal, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{meal.mealType}</h3>
              <p className="text-lg font-bold text-primary">{meal.totalNutrition.calories} kcal</p>
            </div>
            
            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div>
                    <p className="text-foreground">{food.food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.quantity}g</p>
                  </div>
                  <p className="font-medium text-foreground">{food.calculatedNutrition.calories} kcal</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {todayMeals.length === 0 && !loading && (
          <Card className="p-6 text-center">
            <div className="space-y-4">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Nenhuma refeição registrada</h3>
                <p className="text-muted-foreground">Comece adicionando um alimento acima ou criando uma refeição completa</p>
              </div>
            </div>
          </Card>
        )}

        {/* Adicionar refeição */}
        <Card 
          className="p-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => setShowAddMeal(true)}
        >
          <div className="text-center space-y-4">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Adicionar Refeição</h3>
              <p className="text-muted-foreground">Clique para registrar uma nova refeição</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo nutricional */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Resumo Nutricional</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">{Math.round(dailyNutrition.protein)}g</p>
            <p className="text-sm text-muted-foreground">Proteínas</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.protein / 150) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">{Math.round(dailyNutrition.carbs)}g</p>
            <p className="text-sm text-muted-foreground">Carboidratos</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.carbs / 250) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">{Math.round(dailyNutrition.fat)}g</p>
            <p className="text-sm text-muted-foreground">Gorduras</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.fat / 80) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">{Math.round(dailyNutrition.fiber)}g</p>
            <p className="text-sm text-muted-foreground">Fibras</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((dailyNutrition.fiber / 25) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Diálogos */}
      <AddMealDialog
        open={showAddMeal}
        onOpenChange={setShowAddMeal}
        onMealAdd={handleAddMeal}
      />
    </div>
  );
};

export default CaloriesSection;