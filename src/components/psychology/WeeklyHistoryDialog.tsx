import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
}

interface DayData {
  day: string;
  mood: number | null;
  energy: number | null;
  sleep: number | null;
}

const DAYS_OF_WEEK = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

export const WeeklyHistoryDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName 
}: WeeklyHistoryDialogProps) => {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (open && (user || clientId)) {
      loadWeeklyData();
    }
  }, [open, user, clientId]);

  const loadWeeklyData = async () => {
    setLoading(true);
    try {
      const targetUserId = clientId || user?.id;
      
      // Buscar dados da semana atual
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Segunda-feira
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo

      const { data, error } = await supabase
        .from('client_checkins')
        .select('checkin_date, mood, energy, sleep_hours')
        .eq('client_id', targetUserId)
        .gte('checkin_date', startOfWeek.toISOString().split('T')[0])
        .lte('checkin_date', endOfWeek.toISOString().split('T')[0])
        .order('checkin_date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar dados semanais:', error);
        return;
      }

      // Criar array com todos os dias da semana
      const weeklyData: DayData[] = DAYS_OF_WEEK.map((day, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        const dateStr = dayDate.toISOString().split('T')[0];
        
        const dayData = data?.find(d => d.checkin_date === dateStr);
        
        return {
          day,
          mood: dayData?.mood || null,
          energy: dayData?.energy || null,
          sleep: dayData?.sleep_hours || null
        };
      });

      setWeekData(weeklyData);
    } catch (error) {
      console.error('Erro ao carregar histórico semanal:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBars = (data: (number | null)[], maxValue: number = 5) => {
    return (
      <div className="flex items-end gap-2 justify-center">
        {data.map((value, index) => (
          <div
            key={index}
            className="w-8 bg-secondary rounded-t-sm relative"
            style={{ height: '40px' }}
          >
            {value !== null && (
              <div
                className="bg-primary rounded-t-sm absolute bottom-0 w-full transition-all duration-300"
                style={{ 
                  height: `${(value / maxValue) * 100}%`,
                  minHeight: value > 0 ? '4px' : '0px'
                }}
              />
            )}
            {value !== null && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                {value}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico Semanal {clientName ? `- ${clientName}` : ''}
          </DialogTitle>
        </DialogHeader>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dias da Semana */}
              <div className="flex justify-center gap-2">
                {DAYS_OF_WEEK.map((day, index) => (
                  <div key={day} className="w-8 text-center">
                    <span className="text-sm font-medium text-foreground">{day}</span>
                  </div>
                ))}
              </div>

              {/* Humor */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-foreground">Humor</h3>
                {renderBars(weekData.map(d => d.mood), 5)}
              </div>

              {/* Energia */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-foreground">Energia</h3>
                {renderBars(weekData.map(d => d.energy), 5)}
              </div>

              {/* Sono */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-foreground">Sono</h3>
                {renderBars(weekData.map(d => d.sleep), 12)}
              </div>

              {/* Legenda */}
              <div className="text-center text-xs text-muted-foreground border-t pt-4">
                <p>Humor e Energia: 1 (muito baixo) a 5 (muito alto)</p>
                <p>Sono: horas de sono</p>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};