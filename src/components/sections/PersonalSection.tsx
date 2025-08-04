import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Clock, Target, PlayCircle, Calendar, Trophy } from "lucide-react";

const PersonalSection = () => {
  const workoutTypes = [
    { 
      title: "Musculação", 
      description: "Treinos focados em força e hipertrofia",
      duration: "45-60 min",
      icon: Dumbbell 
    },
    { 
      title: "Corrida/Cardio", 
      description: "Planilhas estilo MFIT para resistência",
      duration: "30-45 min",
      icon: PlayCircle 
    },
  ];

  const todayWorkout = {
    title: "Treino de Peito e Tríceps",
    exercises: ["Supino reto", "Supino inclinado", "Crucifixo", "Tríceps testa"],
    duration: "50 min",
    completed: false
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Dumbbell className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Personal Trainer</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Treinos personalizados para alcançar seus objetivos
        </p>
      </div>

      {/* Treino de hoje */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary-light/20 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Treino de Hoje</span>
          </h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{todayWorkout.duration}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">{todayWorkout.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {todayWorkout.exercises.map((exercise, index) => (
              <div key={index} className="p-2 bg-background rounded-lg border">
                <span className="text-sm text-foreground">{exercise}</span>
              </div>
            ))}
          </div>
          <Button className="w-full md:w-auto">
            <PlayCircle className="h-4 w-4 mr-2" />
            Iniciar Treino
          </Button>
        </div>
      </Card>

      {/* Tipos de treino */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Tipos de Treino</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workoutTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{type.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{type.duration}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{type.description}</p>
                  <Button variant="outline" className="w-full">
                    Ver Treinos
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Progresso */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Seu Progresso</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Treinos Concluídos</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0h</p>
            <p className="text-sm text-muted-foreground">Tempo Total</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">0kg</p>
            <p className="text-sm text-muted-foreground">Peso Levantado</p>
          </div>
        </div>
      </Card>

      {/* Call to action */}
      <Card className="p-6 bg-accent border-accent">
        <div className="text-center space-y-4">
          <Target className="h-12 w-12 text-accent-foreground mx-auto" />
          <h3 className="text-xl font-semibold text-accent-foreground">Pronto para começar?</h3>
          <p className="text-accent-foreground/80">
            Configure seu perfil e objetivos para receber treinos personalizados
          </p>
          <Button>Configurar Perfil</Button>
        </div>
      </Card>
    </div>
  );
};

export default PersonalSection;