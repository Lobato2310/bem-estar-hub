import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, FileText, Save, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SessionManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

interface SessionData {
  id: string;
  session_date: string;
  session_notes: string | null;
  mood_before: number | null;
  mood_after: number | null;
}

export const SessionManagementDialog = ({ 
  open, 
  onOpenChange, 
  clientId, 
  clientName 
}: SessionManagementDialogProps) => {
  const { user } = useAuth();
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [newReportDate, setNewReportDate] = useState("");
  const [newReportNotes, setNewReportNotes] = useState("");

  useEffect(() => {
    if (open && clientId) {
      loadRecentSessions();
    }
  }, [open, clientId]);

  const loadRecentSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('psychology_sessions')
        .select('*')
        .eq('client_id', clientId)
        .order('session_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentSessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!nextSessionDate || !user) {
      toast.error("Por favor, selecione uma data para a próxima sessão");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('psychology_sessions')
        .insert({
          client_id: clientId,
          professional_id: user.id,
          session_date: nextSessionDate,
          session_notes: null
        });

      if (error) throw error;
      
      toast.success("Sessão agendada com sucesso!");
      setNextSessionDate("");
      loadRecentSessions();
    } catch (error) {
      console.error('Erro ao agendar sessão:', error);
      toast.error("Erro ao agendar sessão");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotes = async (sessionId: string) => {
    if (!sessionNotes.trim()) {
      toast.error("Por favor, adicione suas observações da sessão");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('psychology_sessions')
        .update({ session_notes: sessionNotes })
        .eq('id', sessionId);

      if (error) throw error;
      
      toast.success("Relatório salvo com sucesso!");
      setSessionNotes("");
      loadRecentSessions();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast.error("Erro ao salvar relatório");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNewReport = async () => {
    if (!newReportDate || !newReportNotes.trim() || !user) {
      toast.error("Por favor, preencha a data e as observações do relatório");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('psychology_sessions')
        .insert({
          client_id: clientId,
          professional_id: user.id,
          session_date: newReportDate,
          session_notes: newReportNotes
        });

      if (error) throw error;
      
      toast.success("Relatório adicionado com sucesso!");
      setNewReportDate("");
      setNewReportNotes("");
      setShowNewReportForm(false);
      loadRecentSessions();
    } catch (error) {
      console.error('Erro ao adicionar relatório:', error);
      toast.error("Erro ao adicionar relatório");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Gerenciar Sessões - {clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agendar próxima sessão */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agendar Próxima Sessão
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="session-date">Data da Sessão</Label>
                <Input
                  id="session-date"
                  type="date"
                  value={nextSessionDate}
                  onChange={(e) => setNextSessionDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <Button 
                onClick={handleScheduleSession}
                disabled={submitting || !nextSessionDate}
                className="self-end"
              >
                Agendar
              </Button>
            </div>
          </Card>

          {/* Adicionar relatório da última sessão */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório da Última Sessão
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowNewReportForm(!showNewReportForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Relatório
              </Button>
            </div>

            {/* Form para relatório da última sessão */}
            {showNewReportForm && (
              <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-3">Relatório da Última Sessão</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="last-session-date">Data da Sessão</Label>
                    <Input
                      id="last-session-date"
                      type="date"
                      value={newReportDate}
                      onChange={(e) => setNewReportDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-session-notes">Observações da Sessão</Label>
                    <Textarea
                      id="last-session-notes"
                      placeholder="Adicione suas observações sobre esta sessão..."
                      value={newReportNotes}
                      onChange={(e) => setNewReportNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddNewReport}
                      disabled={submitting || !newReportDate || !newReportNotes.trim()}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Relatório
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowNewReportForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* Sessões recentes */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Sessões
              </h3>
            </div>

            {/* Form para novo relatório */}
            {showNewReportForm && user && (
              <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-3">Adicionar Novo Relatório</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-report-date">Data da Sessão</Label>
                    <Input
                      id="new-report-date"
                      type="date"
                      value={newReportDate}
                      onChange={(e) => setNewReportDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-report-notes">Observações da Sessão</Label>
                    <Textarea
                      id="new-report-notes"
                      placeholder="Adicione suas observações sobre esta sessão..."
                      value={newReportNotes}
                      onChange={(e) => setNewReportNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddNewReport}
                      disabled={submitting || !newReportDate || !newReportNotes.trim()}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Relatório
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowNewReportForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {loading ? (
              <p>Carregando sessões...</p>
            ) : recentSessions.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma sessão encontrada para este cliente.</p>
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
                          Status: {session.session_notes ? "Relatório concluído" : "Aguardando relatório"}
                        </p>
                      </div>
                      {session.mood_before && session.mood_after && (
                        <div className="text-sm">
                          <p>Humor: {session.mood_before} → {session.mood_after}</p>
                        </div>
                      )}
                    </div>

                    {session.session_notes ? (
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm font-medium mb-2">Relatório da Sessão:</p>
                        <p className="text-sm">{session.session_notes}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Adicione suas observações sobre esta sessão..."
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button 
                          onClick={() => handleSaveNotes(session.id)}
                          disabled={submitting || !sessionNotes.trim()}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Relatório
                        </Button>
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