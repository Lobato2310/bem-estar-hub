import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Plus, Search, Utensils, Clock, Target } from "lucide-react";
import { useState } from "react";

const CaloriesSection = () => {
  const [searchFood, setSearchFood] = useState("");

  const recentFoods = [
    { name: "Peito de Frango Grelhado", calories: 231, portion: "100g" },
    { name: "Arroz Integral", calories: 123, portion: "100g" },
    { name: "Brócolis Cozido", calories: 34, portion: "100g" },
    { name: "Batata Doce", calories: 86, portion: "100g" },
    { name: "Ovo Cozido", calories: 155, portion: "unidade" },
  ];

  const todayMeals = [
    {
      meal: "Café da Manhã",
      foods: [
        { name: "Aveia", calories: 150, quantity: "50g" },
        { name: "Banana", calories: 89, quantity: "1 unidade" }
      ],
      total: 239
    }
  ];

  const dailyGoal = 2000;
  const consumedToday = todayMeals.reduce((sum, meal) => sum + meal.total, 0);
  const remaining = dailyGoal - consumedToday;

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

      {/* Buscar alimentos */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Adicionar Alimento</h2>
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar alimento..."
              value={searchFood}
              onChange={(e) => setSearchFood(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Alimentos Recentes</h3>
          {recentFoods.map((food, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg hover:bg-accent/80 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-foreground">{food.name}</p>
                <p className="text-sm text-muted-foreground">{food.portion}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{food.calories} kcal</p>
                <Button variant="outline" size="sm">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Refeições de hoje */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Refeições de Hoje</h2>
        
        {todayMeals.map((meal, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{meal.meal}</h3>
              <p className="text-lg font-bold text-primary">{meal.total} kcal</p>
            </div>
            
            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div>
                    <p className="text-foreground">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{food.quantity}</p>
                  </div>
                  <p className="font-medium text-foreground">{food.calories} kcal</p>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Adicionar refeição */}
        <Card className="p-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">12g</p>
            <p className="text-sm text-muted-foreground">Proteínas</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">35g</p>
            <p className="text-sm text-muted-foreground">Carboidratos</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">8g</p>
            <p className="text-sm text-muted-foreground">Gorduras</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CaloriesSection;