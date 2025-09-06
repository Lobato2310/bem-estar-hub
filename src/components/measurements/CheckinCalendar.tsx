import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CheckinDialog from "./CheckinDialog";

interface CheckinCalendarProps {
  userProfile?: any;
}

const CheckinCalendar = ({ userProfile }: CheckinCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [checkins, setCheckins] = useState<any[]>([]);
  const [isCheckinDialogOpen, setIsCheckinDialogOpen] = useState(false);
  const [selectedCheckinDate, setSelectedCheckinDate] = useState<Date>(new Date());
  const [selectedCheckinType, setSelectedCheckinType] = useState<'monthly' | 'biweekly'>('biweekly');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCheckins();
    }
  }, [user]);

  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('client_checkins')
        .select('*')
        .eq('client_id', user?.id)
        .order('checkin_date', { ascending: true });

      if (error) throw error;
      setCheckins(data || []);
    } catch (error) {
      console.error('Erro ao buscar check-ins:', error);
    }
  };

  // Gerar datas de check-in (1 e 15 de cada mês)
  const generateCheckinDates = () => {
    const dates = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Gerar próximos 6 meses
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
      
      // Dia 1
      const firstDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      if (firstDate >= currentDate || (firstDate.getMonth() === currentDate.getMonth() && firstDate.getFullYear() === currentDate.getFullYear())) {
        dates.push({
          date: firstDate,
          type: 'monthly' as const,
          isPast: firstDate < currentDate
        });
      }

      // Dia 15
      const fifteenthDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 15);
      if (fifteenthDate >= currentDate || (fifteenthDate.getMonth() === currentDate.getMonth() && fifteenthDate.getFullYear() === currentDate.getFullYear())) {
        dates.push({
          date: fifteenthDate,
          type: 'biweekly' as const,
          isPast: fifteenthDate < currentDate
        });
      }
    }

    return dates.filter(d => !d.isPast);
  };

  const checkinDates = generateCheckinDates();

  const getCheckinStatus = (date: Date) => {
    const checkin = checkins.find(c => {
      const checkinDate = new Date(c.checkin_date);
      return checkinDate.toDateString() === date.toDateString();
    });
    return checkin?.status || null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'reviewed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'Realizado';
      case 'reviewed':
        return 'Avaliado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Disponível';
    }
  };

  const canDoCheckin = (date: Date) => {
    // TEMPORÁRIO: Permitir check-in em qualquer data para testes
    return true;
    
    // Código original comentado para teste:
    // const today = new Date();
    // const diffTime = date.getTime() - today.getTime();
    // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // return diffDays >= -1 && diffDays <= 1; // Permite 1 dia antes ou depois
  };

  const handleCheckinClick = (date: Date, type: 'monthly' | 'biweekly') => {
    setSelectedCheckinDate(date);
    setSelectedCheckinType(type);
    setIsCheckinDialogOpen(true);
  };

  const handleCheckinComplete = () => {
    fetchCheckins();
    setIsCheckinDialogOpen(false);
  };

  // Se for profissional, mostrar apenas visualização
  if (userProfile?.user_type === 'professional') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Calendário de Check-ins dos Clientes</span>
        </h3>
        <p className="text-muted-foreground">
          Visualização dos check-ins dos clientes será implementada na área profissional.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <CalendarDays className="h-5 w-5" />
          <span>Calendário de Check-ins</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendário */}
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border pointer-events-auto"
            />
          </div>

          {/* Lista de Check-ins */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Próximos Check-ins</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {checkinDates.slice(0, 8).map((checkinDate, index) => {
                const status = getCheckinStatus(checkinDate.date);
                const canDo = canDoCheckin(checkinDate.date);
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                      <div>
                        <p className="font-medium text-sm">
                          {checkinDate.date.toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checkinDate.type === 'biweekly' ? 'Check-in Quinzenal' : 'Check-in Mensal'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {getStatusText(status)}
                      </Badge>
                      
                      {canDo && !status && (
                        <Button
                          size="sm"
                          onClick={() => handleCheckinClick(checkinDate.date, checkinDate.type)}
                        >
                          Fazer Check-in
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Informações sobre prazos */}
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-600 mt-1" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Prazos importantes:</p>
                  <p>• Check-ins devem ser feitos nos dias 1 e 15</p>
                  <p>• Você tem até 48h para receber feedback</p>
                  <p>• Pode fazer o check-in 1 dia antes ou depois</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      <CheckinDialog
        open={isCheckinDialogOpen}
        onOpenChange={setIsCheckinDialogOpen}
        checkinDate={selectedCheckinDate}
        checkinType={selectedCheckinType}
      />
    </>
  );
};

export default CheckinCalendar;