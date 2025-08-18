import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Utensils, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface MealLog {
  id: string;
  meal_name: string;
  foods: any[];
  total_calories: number;
  eaten_at: string;
  created_at: string;
}

interface MealHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MealHistoryDialog = ({ open, onOpenChange }: MealHistoryDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { user } = useAuth();

  const loadMealHistory = async (date: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = startOfDay(date);
      const endDate = endOfDay(date);

      console.log('Carregando histórico de refeições para:', format(date, 'dd/MM/yyyy'));

      const { data, error } = await supabase
        .from('client_food_logs')
        .select('*')
        .eq('client_id', user.id)
        .gte('eaten_at', startDate.toISOString())
        .lte('eaten_at', endDate.toISOString())
        .order('eaten_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        toast.error('Erro ao carregar histórico de refeições');
        return;
      }

      console.log('Histórico carregado:', data?.length, 'refeições');
      setMealHistory((data || []).map(item => ({
        ...item,
        foods: Array.isArray(item.foods) ? item.foods : []
      })));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de refeições');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadMealHistory(selectedDate);
    }
  }, [selectedDate, open, user]);

  const totalCalories = mealHistory.reduce((sum, meal) => sum + (meal.total_calories || 0), 0);

  const getMealTypeColor = (mealName: string) => {
    const lowerName = mealName.toLowerCase();
    if (lowerName.includes('café') || lowerName.includes('manhã')) return 'bg-orange-100 text-orange-800';
    if (lowerName.includes('almoço')) return 'bg-green-100 text-green-800';
    if (lowerName.includes('jantar')) return 'bg-blue-100 text-blue-800';
    if (lowerName.includes('lanche')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Gerar últimos 30 dias para seleção rápida
  const quickDateOptions = [
    { label: 'Hoje', date: new Date() },
    { label: 'Ontem', date: subDays(new Date(), 1) },
    { label: 'Há 2 dias', date: subDays(new Date(), 2) },
    { label: 'Há 3 dias', date: subDays(new Date(), 3) },
    { label: 'Há 1 semana', date: subDays(new Date(), 7) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Histórico de Refeições
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seletor de Data */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Selecionar Data</h3>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setDatePickerOpen(false);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Opções de Data Rápida */}
            <div className="flex gap-2 flex-wrap">
              {quickDateOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(option.date)}
                  className={selectedDate.toDateString() === option.date.toDateString() ? 'bg-primary text-primary-foreground' : ''}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </Card>

          {/* Resumo do Dia */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {mealHistory.length} refeição(ões) registrada(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{totalCalories}</p>
                <p className="text-sm text-muted-foreground">kcal total</p>
              </div>
            </div>
          </Card>

          {/* Lista de Refeições */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Refeições do Dia</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : mealHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma refeição registrada neste dia.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mealHistory.map((meal) => (
                  <Card key={meal.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getMealTypeColor(meal.meal_name)}>
                            {meal.meal_name}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(meal.eaten_at), 'HH:mm')}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {Array.isArray(meal.foods) && meal.foods.length > 0 ? (
                            meal.foods.map((food, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                <span className="font-medium">{food.food?.name || 'Alimento'}</span>
                                {food.quantity && (
                                  <span> - {food.quantity}g ({food.calculatedNutrition?.calories || 0} kcal)</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">Detalhes não disponíveis</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {meal.total_calories || 0} kcal
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reg. às {format(new Date(meal.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};