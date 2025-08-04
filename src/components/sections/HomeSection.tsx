import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Dumbbell, Apple, Calculator, ShoppingCart, Brain, TrendingUp, Target, Users } from "lucide-react";

interface HomeSectionProps {
  onNavigate: (section: string) => void;
}

const HomeSection = ({ onNavigate }: HomeSectionProps) => {
  const quickActions = [
    { id: "personal", label: "Treinar Hoje", icon: Dumbbell, color: "bg-primary" },
    { id: "nutrition", label: "Minha Dieta", icon: Apple, color: "bg-accent" },
    { id: "calories", label: "Contar Calorias", icon: Calculator, color: "bg-primary-light" },
    { id: "market", label: "Fazer Pedido", icon: ShoppingCart, color: "bg-secondary" },
  ];

  const stats = [
    { label: "Treinos Concluídos", value: "0", icon: Target },
    { label: "Calorias Hoje", value: "0", icon: TrendingUp },
    { label: "Profissionais", value: "3", icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header de boas-vindas */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
            alt="MyFitLife Logo" 
            className="h-16 w-auto"
          />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Sua jornada para uma vida mais saudável começa aqui. Conecte-se com profissionais especializados e alcance seus objetivos.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent rounded-lg">
                  <Icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ações rápidas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground text-center">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                variant="outline"
                className="h-24 flex-col space-y-2 border-2 hover:scale-105 transition-all duration-300"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Seções dos profissionais */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground text-center">Nossos Profissionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                onClick={() => onNavigate("personal")}>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Personal Trainer</h3>
              <p className="text-muted-foreground">Treinos personalizados de musculação e corrida</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                onClick={() => onNavigate("nutrition")}>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Apple className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Nutricionista</h3>
              <p className="text-muted-foreground">Bioimpedância e dietas personalizadas</p>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" 
                onClick={() => onNavigate("psychology")}>
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Psicólogo</h3>
              <p className="text-muted-foreground">Acompanhamento e motivação para seus objetivos</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;