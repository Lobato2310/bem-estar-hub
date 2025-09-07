import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Activity, Calendar, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientEvolutionGraphsProps {
  clientId: string;
  clientName: string;
}

type PhysicalData = {
  date: string;
  weight: number | null;
  bodyFat: number | null;
  muscMass: number | null;
};

type DisciplineData = {
  period: string;
  completedWorkouts: number;
  totalWorkouts: number;
  percentage: number;
};

const ClientEvolutionGraphs = ({ clientId, clientName }: ClientEvolutionGraphsProps) => {
  const [physicalData, setPhysicalData] = useState<PhysicalData[]>([]);
  const [disciplineData, setDisciplineData] = useState<DisciplineData[]>([]);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      loadEvolutionData();
    }
  }, [clientId, timeRange]);

  const loadEvolutionData = async () => {
    setLoading(true);
    try {
      // Buscar dados de medidas corporais
      const { data: measurements, error: measurementError } = await supabase
        .from('client_measurements')
        .select('measured_at, weight, body_fat, muscle_mass')
        .eq('client_id', clientId)
        .order('measured_at', { ascending: true });

      if (measurementError) throw measurementError;

      // Buscar dados de check-ins para medidas adicionais
      const { data: checkins, error: checkinError } = await supabase
        .from('client_checkins')
        .select('checkin_date, created_at')
        .eq('client_id', clientId)
        .not('belly_circumference', 'is', null)
        .order('checkin_date', { ascending: true });

      if (checkinError) throw checkinError;

      // Processar dados físicos
      const processedPhysical: PhysicalData[] = measurements?.map(m => ({
        date: new Date(m.measured_at).toLocaleDateString('pt-BR'),
        weight: m.weight,
        bodyFat: m.body_fat,
        muscMass: m.muscle_mass
      })) || [];

      setPhysicalData(processedPhysical);

      // Buscar dados de disciplina - workout stats
      const { data: workoutStats, error: workoutError } = await supabase
        .from('workout_stats')
        .select('total_workouts, updated_at')
        .eq('user_id', clientId);

      if (workoutError) throw workoutError;

      // Simular dados de disciplina (aqui você implementaria a lógica real baseada nos treinos concluídos)
      const generateDisciplineData = () => {
        const periods = timeRange === 'weekly' ? 8 : 6; // 8 semanas ou 6 meses
        const data: DisciplineData[] = [];
        
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          if (timeRange === 'weekly') {
            date.setDate(date.getDate() - (i * 7));
          } else {
            date.setMonth(date.getMonth() - i);
          }
          
          // Simular dados baseados em workout stats
          const totalWorkouts = timeRange === 'weekly' ? 3 : 12; // 3 por semana ou 12 por mês
          const completed = Math.floor(Math.random() * totalWorkouts * 0.8) + Math.floor(totalWorkouts * 0.2);
          
          data.push({
            period: timeRange === 'weekly' 
              ? `Sem ${periods - i}` 
              : date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            completedWorkouts: completed,
            totalWorkouts,
            percentage: Math.round((completed / totalWorkouts) * 100)
          });
        }
        
        return data;
      };

      setDisciplineData(generateDisciplineData());

    } catch (error) {
      console.error('Erro ao carregar dados de evolução:', error);
      toast.error('Erro ao carregar dados de evolução');
    } finally {
      setLoading(false);
    }
  };

  const getWeightTrend = () => {
    if (physicalData.length < 2) return null;
    const first = physicalData[0]?.weight;
    const last = physicalData[physicalData.length - 1]?.weight;
    if (!first || !last) return null;
    
    const diff = last - first;
    return {
      value: Math.abs(diff),
      type: diff > 0 ? 'gain' : 'loss',
      icon: diff > 0 ? TrendingUp : TrendingDown,
      color: diff > 0 ? 'text-orange-600' : 'text-green-600'
    };
  };

  const getDisciplineLevel = () => {
    if (disciplineData.length === 0) return { level: 'Baixo', color: 'bg-red-100 text-red-700', percentage: 0 };
    
    const avgPercentage = disciplineData.reduce((acc, d) => acc + d.percentage, 0) / disciplineData.length;
    
    if (avgPercentage >= 80) return { level: 'Alto', color: 'bg-green-100 text-green-700', percentage: avgPercentage };
    if (avgPercentage >= 50) return { level: 'Médio', color: 'bg-yellow-100 text-yellow-700', percentage: avgPercentage };
    return { level: 'Baixo', color: 'bg-red-100 text-red-700', percentage: avgPercentage };
  };

  const weightTrend = getWeightTrend();
  const disciplineLevel = getDisciplineLevel();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Evolução do Cliente</h2>
          <p className="text-muted-foreground">{clientName}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('weekly')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Semanal
          </Button>
          <Button
            variant={timeRange === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('monthly')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Mensal
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Evolução de Peso</p>
              {weightTrend ? (
                <div className="flex items-center gap-2">
                  <weightTrend.icon className={`h-4 w-4 ${weightTrend.color}`} />
                  <span className="font-medium">
                    {weightTrend.type === 'loss' ? '-' : '+'}{weightTrend.value.toFixed(1)} kg
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Sem dados</span>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nível de Disciplina</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={disciplineLevel.color}>
                  {disciplineLevel.level}
                </Badge>
                <span className="font-medium">{disciplineLevel.percentage.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Medição</p>
              <span className="font-medium">
                {physicalData.length > 0 ? physicalData[physicalData.length - 1].date : 'Sem dados'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Evolução Física */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Evolução Física
          </h3>
          
          {physicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={physicalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Peso (kg)"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="bodyFat" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Gordura (%)"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado de medições encontrado</p>
              </div>
            </div>
          )}
        </Card>

        {/* Gráfico de Disciplina */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Índice de Disciplina
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={disciplineData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => [
                  `${value}% (${disciplineData.find(d => d.percentage === value)?.completedWorkouts}/${disciplineData.find(d => d.percentage === value)?.totalWorkouts})`,
                  'Taxa de Conclusão'
                ]}
              />
              <Bar 
                dataKey="percentage" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Disciplina (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default ClientEvolutionGraphs;