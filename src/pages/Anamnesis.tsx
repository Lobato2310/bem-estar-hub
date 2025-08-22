import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AnamnesisData {
  full_name: string;
  gender: string;
  whatsapp: string;
  birth_date: string;
  height: string;
  weight: string;
  practices_physical_activity: boolean | null;
  physical_activity_time: string;
  training_frequency_per_week: string;
  training_duration_minutes: string;
  fitness_objective: string;
  physical_restrictions: string;
  has_postural_deviation: boolean | null;
  postural_deviation_description: string;
  has_cardiac_problems: boolean | null;
  has_high_blood_pressure: boolean | null;
  has_high_cholesterol: boolean | null;
  daily_meals_description: string;
  meal_times_description: string;
  preferred_foods: string;
  food_restrictions: string;
}

export default function Anamnesis() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AnamnesisData>({
    full_name: "",
    gender: "",
    whatsapp: "",
    birth_date: "",
    height: "",
    weight: "",
    practices_physical_activity: null,
    physical_activity_time: "",
    training_frequency_per_week: "",
    training_duration_minutes: "",
    fitness_objective: "",
    physical_restrictions: "",
    has_postural_deviation: null,
    postural_deviation_description: "",
    has_cardiac_problems: null,
    has_high_blood_pressure: null,
    has_high_cholesterol: null,
    daily_meals_description: "",
    meal_times_description: "",
    preferred_foods: "",
    food_restrictions: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Verificar se já existe anamnese completa
    checkExistingAnamnesis();
  }, [user, navigate]);

  const checkExistingAnamnesis = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("client_anamnesis")
      .select("*")
      .eq("client_id", user.id)
      .eq("is_completed", true)
      .single();

    if (data && !error) {
      // Se já tem anamnese completa, redireciona para home
      navigate("/");
    } else if (data && error?.code !== "PGRST116") {
      // Se há dados mas não está completa, preenche o formulário
      setFormData({
        full_name: data.full_name || "",
        gender: data.gender || "",
        whatsapp: data.whatsapp || "",
        birth_date: data.birth_date || "",
        height: data.height?.toString() || "",
        weight: data.weight?.toString() || "",
        practices_physical_activity: data.practices_physical_activity,
        physical_activity_time: data.physical_activity_time || "",
        training_frequency_per_week: data.training_frequency_per_week?.toString() || "",
        training_duration_minutes: data.training_duration_minutes?.toString() || "",
        fitness_objective: data.fitness_objective || "",
        physical_restrictions: data.physical_restrictions || "",
        has_postural_deviation: data.has_postural_deviation,
        postural_deviation_description: data.postural_deviation_description || "",
        has_cardiac_problems: data.has_cardiac_problems,
        has_high_blood_pressure: data.has_high_blood_pressure,
        has_high_cholesterol: data.has_high_cholesterol,
        daily_meals_description: data.daily_meals_description || "",
        meal_times_description: data.meal_times_description || "",
        preferred_foods: data.preferred_foods || "",
        food_restrictions: data.food_restrictions || "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Preparar dados para inserção
      const anamnesisData = {
        client_id: user.id,
        full_name: formData.full_name,
        gender: formData.gender,
        whatsapp: formData.whatsapp,
        birth_date: formData.birth_date || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        practices_physical_activity: formData.practices_physical_activity,
        physical_activity_time: formData.physical_activity_time,
        training_frequency_per_week: formData.training_frequency_per_week ? parseInt(formData.training_frequency_per_week) : null,
        training_duration_minutes: formData.training_duration_minutes ? parseInt(formData.training_duration_minutes) : null,
        fitness_objective: formData.fitness_objective,
        physical_restrictions: formData.physical_restrictions,
        has_postural_deviation: formData.has_postural_deviation,
        postural_deviation_description: formData.postural_deviation_description,
        has_cardiac_problems: formData.has_cardiac_problems,
        has_high_blood_pressure: formData.has_high_blood_pressure,
        has_high_cholesterol: formData.has_high_cholesterol,
        daily_meals_description: formData.daily_meals_description,
        meal_times_description: formData.meal_times_description,
        preferred_foods: formData.preferred_foods,
        food_restrictions: formData.food_restrictions,
        is_completed: true,
      };

      const { error } = await supabase
        .from("client_anamnesis")
        .upsert(anamnesisData, { 
          onConflict: "client_id",
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Anamnese salva com sucesso!",
        description: "Seu perfil foi completado e você será redirecionado.",
      });

      // Esperar um pouco mais e forçar reload da página para garantir que os dados sejam carregados
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      toast({
        title: "Erro ao salvar anamnese",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AnamnesisData, value: string | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return <div>Redirecionando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Anamnese e Perfil</CardTitle>
            <p className="text-muted-foreground">
              Complete seu perfil para que possamos criar o melhor plano para você
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <Label>Sexo</Label>
                  <RadioGroup 
                    value={formData.gender} 
                    onValueChange={(value) => handleInputChange("gender", value)}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="feminino" />
                      <Label htmlFor="feminino">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outros" id="outros" />
                      <Label htmlFor="outros">Outros</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange("birth_date", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="170"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="70.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Anamnese para Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Atividade Física</h3>
                
                <div>
                  <Label>Pratica alguma atividade física?</Label>
                  <RadioGroup 
                    value={formData.practices_physical_activity?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("practices_physical_activity", value === "true")}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="activity_yes" />
                      <Label htmlFor="activity_yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="activity_no" />
                      <Label htmlFor="activity_no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.practices_physical_activity === true && (
                  <div>
                    <Label htmlFor="physical_activity_time">Faz quanto tempo?</Label>
                    <Input
                      id="physical_activity_time"
                      value={formData.physical_activity_time}
                      onChange={(e) => handleInputChange("physical_activity_time", e.target.value)}
                      placeholder="Ex: 2 anos"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="training_frequency">Quantas vezes consegue treinar por semana?</Label>
                    <Input
                      id="training_frequency"
                      type="number"
                      value={formData.training_frequency_per_week}
                      onChange={(e) => handleInputChange("training_frequency_per_week", e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="training_duration">Quanto tempo por treino? (minutos)</Label>
                    <Input
                      id="training_duration"
                      type="number"
                      value={formData.training_duration_minutes}
                      onChange={(e) => handleInputChange("training_duration_minutes", e.target.value)}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fitness_objective">Objetivo</Label>
                  <Textarea
                    id="fitness_objective"
                    value={formData.fitness_objective}
                    onChange={(e) => handleInputChange("fitness_objective", e.target.value)}
                    placeholder="Descreva seus objetivos fitness..."
                  />
                </div>

                <div>
                  <Label htmlFor="physical_restrictions">Você tem alguma restrição física?</Label>
                  <Textarea
                    id="physical_restrictions"
                    value={formData.physical_restrictions}
                    onChange={(e) => handleInputChange("physical_restrictions", e.target.value)}
                    placeholder="Descreva suas restrições físicas ou digite 'Nenhuma'"
                  />
                </div>

                <div>
                  <Label>Apresenta algum desvio postural?</Label>
                  <RadioGroup 
                    value={formData.has_postural_deviation?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("has_postural_deviation", value === "true")}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="postural_yes" />
                      <Label htmlFor="postural_yes">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="postural_no" />
                      <Label htmlFor="postural_no">Não</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.has_postural_deviation === true && (
                  <div>
                    <Label htmlFor="postural_deviation_description">Se sim, qual?</Label>
                    <Input
                      id="postural_deviation_description"
                      value={formData.postural_deviation_description}
                      onChange={(e) => handleInputChange("postural_deviation_description", e.target.value)}
                      placeholder="Descreva o desvio postural"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Anamnese Médica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Anamnese Médica</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Possui problema cardíaco?</Label>
                    <RadioGroup 
                      value={formData.has_cardiac_problems?.toString() || ""} 
                      onValueChange={(value) => handleInputChange("has_cardiac_problems", value === "true")}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="cardiac_yes" />
                        <Label htmlFor="cardiac_yes">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="cardiac_no" />
                        <Label htmlFor="cardiac_no">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Possui pressão arterial elevada?</Label>
                    <RadioGroup 
                      value={formData.has_high_blood_pressure?.toString() || ""} 
                      onValueChange={(value) => handleInputChange("has_high_blood_pressure", value === "true")}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="pressure_yes" />
                        <Label htmlFor="pressure_yes">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="pressure_no" />
                        <Label htmlFor="pressure_no">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Colesterol acima do normal?</Label>
                    <RadioGroup 
                      value={formData.has_high_cholesterol?.toString() || ""} 
                      onValueChange={(value) => handleInputChange("has_high_cholesterol", value === "true")}
                      className="flex gap-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="cholesterol_yes" />
                        <Label htmlFor="cholesterol_yes">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="cholesterol_no" />
                        <Label htmlFor="cholesterol_no">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Anamnese Nutricional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Anamnese Nutricional</h3>
                
                <div>
                  <Label htmlFor="daily_meals">Descreva quais refeições faz ao dia</Label>
                  <Textarea
                    id="daily_meals"
                    value={formData.daily_meals_description}
                    onChange={(e) => handleInputChange("daily_meals_description", e.target.value)}
                    placeholder="Ex: Café da manhã, almoço, lanche da tarde, jantar..."
                  />
                </div>

                <div>
                  <Label htmlFor="meal_times">Qual o horário de cada refeição?</Label>
                  <Textarea
                    id="meal_times"
                    value={formData.meal_times_description}
                    onChange={(e) => handleInputChange("meal_times_description", e.target.value)}
                    placeholder="Ex: Café da manhã - 7h, Almoço - 12h..."
                  />
                </div>

                <div>
                  <Label htmlFor="preferred_foods">Quais são os alimentos preferidos?</Label>
                  <Textarea
                    id="preferred_foods"
                    value={formData.preferred_foods}
                    onChange={(e) => handleInputChange("preferred_foods", e.target.value)}
                    placeholder="Liste seus alimentos favoritos..."
                  />
                </div>

                <div>
                  <Label htmlFor="food_restrictions">Restrição alimentar</Label>
                  <Textarea
                    id="food_restrictions"
                    value={formData.food_restrictions}
                    onChange={(e) => handleInputChange("food_restrictions", e.target.value)}
                    placeholder="Descreva suas restrições alimentares ou digite 'Nenhuma'"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading} className="min-w-[150px]">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Finalizar Anamnese"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}