import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, Scale, FileText, Calendar, TrendingUp, CheckCircle, Eye } from "lucide-react";
import MealDetailsDialog from "@/components/nutrition/MealDetailsDialog";

const NutritionSection = () => {
  const [showMealDialog, setShowMealDialog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const nutritionServices = [
    {
      title: "Medidas",
      description: "Acompanhamento de medidas corporais e progresso",
      icon: Scale,
      status: "Disponível"
    },
    {
      title: "Plano Alimentar",
      description: "Dieta personalizada baseada em seus objetivos",
      icon: FileText,
      status: "Disponível"
    },
    {
      title: "Acompanhamento",
      description: "Consultas regulares para ajustar sua dieta",
      icon: Calendar,
      status: "Mensal"
    }
  ];

  const todayMeals = [
    { meal: "Café da Manhã", type: "cafe_da_manha", time: "07:00", calories: 350, completed: true },
    { meal: "Lanche da Manhã", type: "lanche_da_manha", time: "10:00", calories: 150, completed: false },
    { meal: "Almoço", type: "almoco", time: "12:30", calories: 450, completed: false },
    { meal: "Lanche da Tarde", type: "lanche_da_tarde", time: "15:30", calories: 200, completed: false },
    { meal: "Jantar", type: "jantar", time: "19:00", calories: 400, completed: false },
  ];

  const handleMealClick = (mealType: string) => {
    setSelectedMealType(mealType);
    setShowMealDialog(true);
  };

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const completedCalories = todayMeals.filter(meal => meal.completed)
    .reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Apple className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Nutrição</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Alimentação equilibrada para uma vida mais saudável
        </p>
      </div>

      {/* Resumo nutricional do dia */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Hoje</h2>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{completedCalories}/{totalCalories}</p>
            <p className="text-sm text-muted-foreground">Calorias</p>
          </div>
        </div>
        
        <div className="w-full bg-secondary rounded-full h-3 mb-4">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300" 
            style={{ width: `${(completedCalories / totalCalories) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">65g</p>
            <p className="text-sm text-muted-foreground">Proteínas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">180g</p>
            <p className="text-sm text-muted-foreground">Carboidratos</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">45g</p>
            <p className="text-sm text-muted-foreground">Gorduras</p>
          </div>
        </div>
      </Card>

      {/* Refeições do dia */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Refeições de Hoje</h2>
        <div className="space-y-3">
          {todayMeals.map((meal, index) => (
            <Card key={index} className={`p-4 transition-all duration-300 ${meal.completed ? 'bg-accent/50' : 'hover:shadow-md'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${meal.completed ? 'bg-primary' : 'bg-secondary'}`}>
                    <CheckCircle className={`h-4 w-4 ${meal.completed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{meal.meal}</p>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-semibold text-foreground">{meal.calories} kcal</p>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleMealClick(meal.type)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant={meal.completed ? "secondary" : "outline"} 
                      size="sm"
                    >
                      {meal.completed ? "✓" : "Marcar"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Serviços nutricionais */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Serviços Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {nutritionServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium text-primary bg-primary-light px-2 py-1 rounded-full">
                      {service.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Saiba Mais
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progresso nutricional */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Progresso Nutricional</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Dias Seguidos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">70kg</p>
            <p className="text-sm text-muted-foreground">Peso Atual</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">-0kg</p>
            <p className="text-sm text-muted-foreground">Progresso</p>
          </div>
        </div>
      </Card>

      {/* Meal Details Dialog */}
      <MealDetailsDialog
        isOpen={showMealDialog}
        onClose={() => setShowMealDialog(false)}
        mealType={selectedMealType}
      />
    </div>
  );
};

export default NutritionSection;