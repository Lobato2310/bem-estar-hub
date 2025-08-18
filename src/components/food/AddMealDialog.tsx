import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Utensils, Plus, Trash2, Calculator } from "lucide-react";
import { FoodSearchDialog } from "./FoodSearchDialog";
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

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdd: (meal: {
    mealType: string;
    foods: MealFood[];
    totalNutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  }) => void;
}

const mealTypes = [
  "Café da Manhã",
  "Lanche da Manhã",
  "Almoço",
  "Lanche da Tarde",
  "Jantar",
  "Ceia",
  "Refeição Livre"
];

export const AddMealDialog = ({ open, onOpenChange, onMealAdd }: AddMealDialogProps) => {
  const [mealType, setMealType] = useState("");
  const [foods, setFoods] = useState<MealFood[]>([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);

  const calculateNutrition = (food: Food, quantity: number) => {
    const ratio = quantity / food.defaultPortion;
    return {
      calories: Math.round(food.calories * ratio),
      protein: Math.round(food.protein * ratio * 10) / 10,
      carbs: Math.round(food.carbs * ratio * 10) / 10,
      fat: Math.round(food.fat * ratio * 10) / 10,
      fiber: food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : 0
    };
  };

  const handleAddFood = (food: Food, quantity: number) => {
    const calculatedNutrition = calculateNutrition(food, quantity);
    const mealFood: MealFood = {
      food,
      quantity,
      calculatedNutrition
    };
    setFoods([...foods, mealFood]);
  };

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const updateFoodQuantity = (index: number, newQuantity: number) => {
    const updatedFoods = foods.map((mealFood, i) => {
      if (i === index) {
        return {
          ...mealFood,
          quantity: newQuantity,
          calculatedNutrition: calculateNutrition(mealFood.food, newQuantity)
        };
      }
      return mealFood;
    });
    setFoods(updatedFoods);
  };

  const getTotalNutrition = () => {
    return foods.reduce(
      (total, mealFood) => ({
        calories: total.calories + mealFood.calculatedNutrition.calories,
        protein: Math.round((total.protein + mealFood.calculatedNutrition.protein) * 10) / 10,
        carbs: Math.round((total.carbs + mealFood.calculatedNutrition.carbs) * 10) / 10,
        fat: Math.round((total.fat + mealFood.calculatedNutrition.fat) * 10) / 10,
        fiber: Math.round((total.fiber + mealFood.calculatedNutrition.fiber) * 10) / 10
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  const handleSaveMeal = () => {
    if (!mealType) {
      toast.error('Selecione o tipo de refeição');
      return;
    }
    if (foods.length === 0) {
      toast.error('Adicione pelo menos um alimento');
      return;
    }

    const totalNutrition = getTotalNutrition();
    onMealAdd({
      mealType,
      foods,
      totalNutrition
    });

    // Reset form
    setMealType("");
    setFoods([]);
    onOpenChange(false);
    toast.success('Refeição adicionada com sucesso!');
  };

  const totalNutrition = getTotalNutrition();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Adicionar Refeição
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tipo de refeição */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Refeição</label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de refeição" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão para adicionar alimentos */}
            <div>
              <Button 
                onClick={() => setShowFoodSearch(true)}
                variant="outline" 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Alimento
              </Button>
            </div>

            {/* Lista de alimentos adicionados */}
            {foods.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Alimentos da Refeição:</h3>
                {foods.map((mealFood, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{mealFood.food.name}</span>
                          <Badge variant={mealFood.food.source === 'taco' ? 'default' : 'secondary'}>
                            {mealFood.food.source === 'taco' ? 'TACO' : 'Open Foods'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Quantidade:</label>
                            <Input
                              type="number"
                              value={mealFood.quantity}
                              onChange={(e) => updateFoodQuantity(index, Number(e.target.value))}
                              className="w-20"
                              min="1"
                            />
                            <span className="text-sm text-muted-foreground">g</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Calorias:</span>
                            <p className="font-medium">{mealFood.calculatedNutrition.calories} kcal</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Proteínas:</span>
                            <p className="font-medium">{mealFood.calculatedNutrition.protein}g</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Carboidratos:</span>
                            <p className="font-medium">{mealFood.calculatedNutrition.carbs}g</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gorduras:</span>
                            <p className="font-medium">{mealFood.calculatedNutrition.fat}g</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFood(index)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Resumo nutricional total */}
                <Card className="p-4 bg-accent/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">Total da Refeição:</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-lg">{totalNutrition.calories}</p>
                      <p className="text-muted-foreground">kcal</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{totalNutrition.protein}g</p>
                      <p className="text-muted-foreground">Proteínas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{totalNutrition.carbs}g</p>
                      <p className="text-muted-foreground">Carboidratos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{totalNutrition.fat}g</p>
                      <p className="text-muted-foreground">Gorduras</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{totalNutrition.fiber}g</p>
                      <p className="text-muted-foreground">Fibras</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveMeal} className="flex-1">
                Salvar Refeição
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FoodSearchDialog
        open={showFoodSearch}
        onOpenChange={setShowFoodSearch}
        onFoodAdd={handleAddFood}
      />
    </>
  );
};