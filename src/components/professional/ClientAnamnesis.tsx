import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Calendar, 
  Weight, 
  Ruler, 
  Activity, 
  Heart, 
  AlertCircle, 
  Utensils,
  Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ClientAnamnesisProps {
  client: Client;
}

interface AnamnesisData {
  full_name?: string;
  birth_date?: string;
  gender?: string;
  whatsapp?: string;
  weight?: number;
  height?: number;
  fitness_objective?: string;
  practices_physical_activity?: boolean;
  training_frequency_per_week?: number;
  training_duration_minutes?: number;
  physical_activity_time?: string;
  physical_restrictions?: string;
  has_cardiac_problems?: boolean;
  has_high_blood_pressure?: boolean;
  has_high_cholesterol?: boolean;
  has_postural_deviation?: boolean;
  postural_deviation_description?: string;
  daily_meals_description?: string;
  meal_times_description?: string;
  preferred_foods?: string;
  food_restrictions?: string;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

const ClientAnamnesis = ({ client }: ClientAnamnesisProps) => {
  const [anamnesisData, setAnamnesisData] = useState<AnamnesisData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClientAnamnesis = async () => {
    if (!client) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_anamnesis')
        .select('*')
        .eq('client_id', client.user_id)
        .maybeSingle();

      if (error) throw error;
      setAnamnesisData(data);

    } catch (error) {
      console.error('Erro ao carregar anamnese do cliente:', error);
      toast.error('Erro ao carregar anamnese do cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientAnamnesis();
  }, [client]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!anamnesisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Anamnese não encontrada
          </CardTitle>
          <CardDescription>
            Este cliente ainda não preencheu a anamnese
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Solicite ao cliente que acesse o sistema e complete o formulário de anamnese para ter acesso às informações detalhadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anamnese de {client.display_name}</h2>
        <div className="flex gap-2">
          <Badge variant={anamnesisData.is_completed ? "default" : "secondary"}>
            {anamnesisData.is_completed ? "Completa" : "Incompleta"}
          </Badge>
          <Badge variant="outline">
            {anamnesisData.updated_at ? `Atualizada em ${new Date(anamnesisData.updated_at).toLocaleDateString('pt-BR')}` : 'Sem data'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="text-foreground">{anamnesisData.full_name || "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{client.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {anamnesisData.birth_date ? 
                    `${new Date(anamnesisData.birth_date).toLocaleDateString('pt-BR')} (${calculateAge(anamnesisData.birth_date)} anos)` 
                    : "Não informado"
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <p className="text-foreground">{anamnesisData.gender || "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                <p className="text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {anamnesisData.whatsapp || "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Físicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5" />
              Dados Físicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Peso</label>
                <p className="text-foreground">{anamnesisData.weight ? `${anamnesisData.weight} kg` : "Não informado"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Altura</label>
                <p className="text-foreground flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  {anamnesisData.height ? `${anamnesisData.height} cm` : "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">IMC</label>
                <p className="text-foreground">
                  {anamnesisData.weight && anamnesisData.height ? 
                    calculateBMI(anamnesisData.weight, anamnesisData.height) : "Não calculável"
                  }
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Objetivo Fitness</label>
              <p className="text-foreground">{anamnesisData.fitness_objective || "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Física */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Física
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pratica Atividade Física</label>
                <p className="text-foreground">
                  {anamnesisData.practices_physical_activity === true ? "Sim" : 
                   anamnesisData.practices_physical_activity === false ? "Não" : "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Frequência Semanal</label>
                <p className="text-foreground">
                  {anamnesisData.training_frequency_per_week ? 
                    `${anamnesisData.training_frequency_per_week} vezes por semana` : "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duração por Sessão</label>
                <p className="text-foreground">
                  {anamnesisData.training_duration_minutes ? 
                    `${anamnesisData.training_duration_minutes} minutos` : "Não informado"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Horário Preferido</label>
                <p className="text-foreground">{anamnesisData.physical_activity_time || "Não informado"}</p>
              </div>
            </div>
            
            {anamnesisData.physical_restrictions && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Restrições Físicas</label>
                  <p className="text-foreground">{anamnesisData.physical_restrictions}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Histórico Médico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Histórico Médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Problemas Cardíacos</label>
                <Badge variant={anamnesisData.has_cardiac_problems ? "destructive" : "secondary"}>
                  {anamnesisData.has_cardiac_problems === true ? "Sim" : 
                   anamnesisData.has_cardiac_problems === false ? "Não" : "N/I"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Pressão Alta</label>
                <Badge variant={anamnesisData.has_high_blood_pressure ? "destructive" : "secondary"}>
                  {anamnesisData.has_high_blood_pressure === true ? "Sim" : 
                   anamnesisData.has_high_blood_pressure === false ? "Não" : "N/I"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Colesterol Alto</label>
                <Badge variant={anamnesisData.has_high_cholesterol ? "destructive" : "secondary"}>
                  {anamnesisData.has_high_cholesterol === true ? "Sim" : 
                   anamnesisData.has_high_cholesterol === false ? "Não" : "N/I"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground">Desvio Postural</label>
                <Badge variant={anamnesisData.has_postural_deviation ? "destructive" : "secondary"}>
                  {anamnesisData.has_postural_deviation === true ? "Sim" : 
                   anamnesisData.has_postural_deviation === false ? "Não" : "N/I"}
                </Badge>
              </div>
            </div>
            
            {anamnesisData.postural_deviation_description && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição do Desvio Postural</label>
                  <p className="text-foreground">{anamnesisData.postural_deviation_description}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Histórico Nutricional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Histórico Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Refeições Diárias</label>
              <p className="text-foreground">{anamnesisData.daily_meals_description || "Não informado"}</p>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Horários das Refeições</label>
              <p className="text-foreground">{anamnesisData.meal_times_description || "Não informado"}</p>
            </div>

            {anamnesisData.preferred_foods && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Alimentos Preferidos</label>
                  <p className="text-foreground">{anamnesisData.preferred_foods}</p>
                </div>
              </>
            )}

            {anamnesisData.food_restrictions && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Restrições Alimentares</label>
                  <p className="text-foreground">{anamnesisData.food_restrictions}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientAnamnesis;