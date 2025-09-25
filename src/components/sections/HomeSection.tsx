import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Dumbbell, Apple, Calculator, Brain, TrendingUp, Target, Users } from "lucide-react";

interface HomeSectionProps {
  onNavigate: (section: string) => void;
  userProfile?: any;
}

const HomeSection = ({ onNavigate, userProfile }: HomeSectionProps) => {
  const quickActions = [
    { id: "personal", label: "Treinar Hoje", icon: Dumbbell, color: "bg-primary" },
    { id: "nutrition", label: "Minha Dieta", icon: Apple, color: "bg-accent" },
    { id: "calories", label: "Contar Calorias", icon: Calculator, color: "bg-primary-light" },
  ];

  const stats = [
    { label: "Treinos Concluídos", value: "0", icon: Target },
    { label: "Calorias Hoje", value: "0", icon: TrendingUp },
    { label: "Profissionais", value: "3", icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header de boas-vindas */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="flex justify-center mb-3 md:mb-4">
          <img 
            src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
            alt="MyFitLife Logo" 
            className="h-12 md:h-16 w-auto"
          />
        </div>
        {userProfile?.display_name && (
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Olá, {userProfile.display_name}!
          </h1>
        )}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
          Sua jornada para uma vida mais saudável começa aqui. Conecte-se com profissionais especializados e alcance seus objetivos.
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 md:p-6 bg-card border border-border hover:shadow-lg transition-all duration-300">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="p-2 md:p-3 bg-accent rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-accent-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ações rápidas */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">Acesso Rápido</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                variant="outline"
                className="h-20 md:h-24 flex-col space-y-1 md:space-y-2 border-2 hover:scale-105 transition-all duration-300 min-h-[80px]"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                </div>
                <span className="font-medium text-sm md:text-base text-center leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Seções dos profissionais */}
      <div className="space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center">Nossos Profissionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer min-h-[120px]" 
                onClick={() => onNavigate("personal")}>
            <div className="text-center space-y-3 md:space-y-4">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center">
                <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
              </div>
               <h3 className="text-lg md:text-xl font-semibold text-foreground">Personal Trainer</h3>
               <p className="text-sm md:text-base text-muted-foreground">Orientação profissional em treinos personalizados</p>
            </div>
          </Card>

          <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer min-h-[120px]" 
                onClick={() => onNavigate("nutrition")}>
            <div className="text-center space-y-3 md:space-y-4">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center">
                <Apple className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
              </div>
               <h3 className="text-lg md:text-xl font-semibold text-foreground">Nutricionista</h3>
               <p className="text-sm md:text-base text-muted-foreground">Suporte nutricional e orientação alimentar personalizada</p>
            </div>
          </Card>

          <Card className="p-4 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer min-h-[120px]" 
                onClick={() => onNavigate("psychology")}>
            <div className="text-center space-y-3 md:space-y-4">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
              </div>
               <h3 className="text-lg md:text-xl font-semibold text-foreground">Psicólogo</h3>
               <p className="text-sm md:text-base text-muted-foreground">Suporte psicológico e educação em saúde mental</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Disclaimer de responsabilidade */}
      <Card className="p-4 md:p-6 bg-muted/30 border-muted">
        <div className="text-center space-y-2">
          <h3 className="text-sm md:text-base font-medium text-muted-foreground">Importante</h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            O MyFitLife oferece planos de treino, nutrição e acompanhamento psicológico com profissionais. 
            As recomendações oferecidas pelo app não substituem avaliação médica ou acompanhamento clínico. 
            Em caso de condições médicas, procure um profissional de saúde licenciado.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default HomeSection;