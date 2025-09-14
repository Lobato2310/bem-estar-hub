import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SessionData {
  id: string;
  session_date: string;
  session_notes: string | null;
  mood_before: number | null;
  mood_after: number | null;
}

interface ClientSessionReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientSessionReportsDialog = ({ 
  open, 
  onOpenChange
}: ClientSessionReportsDialogProps) => {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadRecentSessions();
    }
  }, [open, user]);

  const loadRecentSessions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('psychology_sessions')
        .select('*')
        .eq('client_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentSessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios das Sessões
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Suas Sessões
            </h3>
            
            {loading ? (
              <p>Carregando sessões...</p>
            ) : recentSessions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma sessão encontrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium">
                          {format(new Date(session.session_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {session.session_notes ? "Relatório disponível" : "Sessão agendada"}
                        </p>
                      </div>
                      {session.mood_before && session.mood_after && (
                        <div className="text-sm">
                          <p>Humor: {session.mood_before} → {session.mood_after}</p>
                        </div>
                      )}
                    </div>

                    {session.session_notes && (
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm font-medium mb-2">Relatório da Sessão:</p>
                        <p className="text-sm">{session.session_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};