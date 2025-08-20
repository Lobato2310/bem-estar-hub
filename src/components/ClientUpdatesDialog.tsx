import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, Clock, Utensils, Activity, Brain } from "lucide-react";
import { useClientUpdates } from "@/hooks/useClientUpdates";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const getUpdateIcon = (type: string) => {
  switch (type) {
    case 'nutrition_plan':
      return <Utensils className="h-4 w-4" />;
    case 'workout_plan':
      return <Activity className="h-4 w-4" />;
    case 'psychology_goal':
      return <Brain className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getUpdateTypeLabel = (type: string) => {
  switch (type) {
    case 'nutrition_plan':
      return 'Plano Nutricional';
    case 'workout_plan':
      return 'Plano de Treino';
    case 'psychology_goal':
      return 'Metas Psicológicas';
    default:
      return 'Atualização Geral';
  }
};

export const ClientUpdatesDialog = () => {
  const { updates, unviewedCount, loading, markAsViewed, markAllAsViewed } = useClientUpdates();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsViewed = (updateId: string) => {
    markAsViewed([updateId]);
  };

  const handleMarkAllAsViewed = () => {
    markAllAsViewed();
  };

  const unviewedUpdates = updates.filter(update => !update.is_viewed);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Atualizações
          {unviewedCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unviewedCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Atualizações do Profissional</span>
          </DialogTitle>
          <DialogDescription>
            Veja as últimas atualizações dos seus planos e metas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {unviewedCount > 0 && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">
                {unviewedCount} atualização{unviewedCount > 1 ? 'ões' : ''} não visualizada{unviewedCount > 1 ? 's' : ''}
              </span>
              <Button size="sm" variant="outline" onClick={handleMarkAllAsViewed}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            </div>
          )}

          <ScrollArea className="h-[400px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : updates.length > 0 ? (
              <div className="space-y-3">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      !update.is_viewed 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-background border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between space-x-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-full ${
                          !update.is_viewed ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          {getUpdateIcon(update.update_type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {getUpdateTypeLabel(update.update_type)}
                            </Badge>
                            {!update.is_viewed && (
                              <Badge variant="destructive" className="text-xs">
                                Nova
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{update.update_message}</p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDistanceToNow(new Date(update.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!update.is_viewed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsViewed(update.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma atualização encontrada
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};