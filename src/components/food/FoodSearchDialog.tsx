import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFoodAdd: (food: Food, quantity: number) => void;
}

export const FoodSearchDialog = ({ open, onOpenChange, onFoodAdd }: FoodSearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(false);

  // Buscar alimentos nas tabelas TACO e Open Foods
  const searchFoods = async (term: string) => {
    if (!term || term.length < 2) {
      setFoods([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Buscando alimentos para termo:', term);
      
      // Buscar na tabela TACO
      const { data: tacoFoods, error: tacoError } = await supabase
        .from('taco_foods')
        .select('*')
        .ilike('alimento', `%${term}%`)
        .limit(10);

      console.log('TACO Foods encontrados:', tacoFoods, 'Erro:', tacoError);

      // Buscar na tabela Open Foods
      const { data: openFoods, error: openError } = await supabase
        .from('open_foods')
        .select('*')
        .ilike('product_name', `%${term}%`)
        .limit(10);

      console.log('Open Foods encontrados:', openFoods, 'Erro:', openError);

      if (tacoError) {
        console.error('Erro TACO:', tacoError);
        throw tacoError;
      }
      if (openError) {
        console.error('Erro Open Foods:', openError);
        throw openError;
      }

      // Converter para formato unificado
      const tacoFormatted: Food[] = (tacoFoods || []).map(food => ({
        id: food.id,
        name: food.alimento,
        calories: Number(food.energia_kcal) || 0,
        protein: Number(food.proteina_g) || 0,
        carbs: Number(food.carboidrato_g) || 0,
        fat: Number(food.lipideos_g) || 0,
        fiber: Number(food.fibra_g) || 0,
        defaultPortion: Number(food.porcao_g) || 100,
        source: 'taco'
      }));

      const openFormatted: Food[] = (openFoods || []).map(food => ({
        id: food.id,
        name: food.product_name,
        calories: Number(food.energy_kcal_100g) || 0,
        protein: Number(food.proteins_100g) || 0,
        carbs: Number(food.carbohydrates_100g) || 0,
        fat: Number(food.fat_100g) || 0,
        fiber: Number(food.fiber_100g) || 0,
        defaultPortion: Number(food.porcao_g) || 100,
        source: 'open'
      }));

      setFoods([...tacoFormatted, ...openFormatted]);
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      toast.error('Erro ao buscar alimentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFoods(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Calcular valores nutricionais baseado na quantidade
  const calculateNutrition = (food: Food, qty: number) => {
    const ratio = qty / food.defaultPortion;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : 0
    };
  };

  const handleAddFood = () => {
    if (selectedFood) {
      onFoodAdd(selectedFood, quantity);
      setSelectedFood(null);
      setQuantity(100);
      setSearchTerm("");
      setFoods([]);
      onOpenChange(false);
      toast.success('Alimento adicionado com sucesso!');
    }
  };

  const calculatedNutrition = selectedFood ? calculateNutrition(selectedFood, quantity) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Alimento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campo de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Digite o nome do alimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de alimentos encontrados */}
          {loading && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Buscando alimentos...</p>
            </div>
          )}

          {!loading && foods.length > 0 && !selectedFood && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h3 className="font-medium">Alimentos encontrados:</h3>
              {foods.map((food) => (
                <Card
                  key={food.id}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{food.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={food.source === 'taco' ? 'default' : 'secondary'}>
                          {food.source === 'taco' ? 'TACO' : 'Open Foods'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {food.calories} kcal/{food.defaultPortion}g
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Configuração de quantidade quando alimento selecionado */}
          {selectedFood && (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{selectedFood.name}</h3>
                    <Badge variant={selectedFood.source === 'taco' ? 'default' : 'secondary'}>
                      {selectedFood.source === 'taco' ? 'TACO' : 'Open Foods'}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFood(null)}
                  >
                    Voltar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Quantidade (g):</label>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min="1"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Porção padrão: {selectedFood.defaultPortion}g
                    </p>
                  </div>

                  {calculatedNutrition && (
                    <div className="bg-accent/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4" />
                        <span className="font-medium">Valores para {quantity}g:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Calorias:</span>
                          <span className="font-medium ml-2">{calculatedNutrition.calories} kcal</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proteínas:</span>
                          <span className="font-medium ml-2">{calculatedNutrition.protein}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Carboidratos:</span>
                          <span className="font-medium ml-2">{calculatedNutrition.carbs}g</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gorduras:</span>
                          <span className="font-medium ml-2">{calculatedNutrition.fat}g</span>
                        </div>
                        {calculatedNutrition.fiber > 0 && (
                          <div>
                            <span className="text-muted-foreground">Fibras:</span>
                            <span className="font-medium ml-2">{calculatedNutrition.fiber}g</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddFood} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Alimento
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {!loading && searchTerm.length >= 2 && foods.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum alimento encontrado para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};