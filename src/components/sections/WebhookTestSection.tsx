import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const WebhookTestSection = () => {
  const [loading, setLoading] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const testWebhook = async () => {
    setLoading(true);
    try {
      // Simular um webhook do Mercado Pago
      const testPayload = {
        type: "payment",
        action: "payment.updated",
        data: {
          id: "test_payment_123"
        },
        id: "test_payment_123"
      };

      const response = await fetch('https://qmathgcutdcdjxtlrhsh.supabase.co/functions/v1/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      const result = await response.json();
      
      toast({
        title: response.ok ? "Webhook testado com sucesso" : "Erro no webhook",
        description: result.message || result.error || "Teste executado",
        variant: response.ok ? "default" : "destructive"
      });

      // Buscar logs após o teste
      await fetchWebhookLogs();
      
    } catch (error) {
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "Erro ao testar webhook",
        description: "Erro de conexão",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erro ao buscar logs:", error);
        return;
      }

      setWebhookLogs(data || []);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  const simulatePayment = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simular pagamento aprovado diretamente na base de dados
      const { error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          email: user.email || "",
          assinatura_ativa: true,
          plano: "mensal",
          data_inicio: new Date().toISOString().split('T')[0],
          data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          mercado_pago_payment_id: "test_payment_manual",
          mercado_pago_status: "approved",
          valor_pago: 229.90,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (error) {
        throw error;
      }

      toast({
        title: "Pagamento simulado com sucesso",
        description: "Assinatura ativada manualmente para teste",
      });

    } catch (error) {
      console.error("Erro ao simular pagamento:", error);
      toast({
        title: "Erro ao simular pagamento",
        description: "Erro ao ativar assinatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Webhook - Mercado Pago</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testWebhook} 
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testando..." : "Testar Webhook"}
            </Button>
            
            <Button 
              onClick={simulatePayment} 
              disabled={loading}
              variant="default"
            >
              {loading ? "Simulando..." : "Simular Pagamento Aprovado"}
            </Button>
            
            <Button 
              onClick={fetchWebhookLogs} 
              disabled={loading}
              variant="secondary"
            >
              Buscar Logs
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>URL do Webhook:</strong> https://qmathgcutdcdjxtlrhsh.supabase.co/functions/v1/webhook</p>
            <p><strong>Usuário logado:</strong> {user?.email}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
          </div>
        </CardContent>
      </Card>

      {webhookLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs do Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {webhookLogs.map((log, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{log.method} - {new Date(log.created_at).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded text-xs ${log.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {log.processed ? 'Processado' : 'Pendente'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    <strong>URL:</strong> {log.url}
                  </div>
                  
                  {log.body && (
                    <div className="bg-muted p-2 rounded text-xs">
                      <strong>Body:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(log.body, null, 2)}</pre>
                    </div>
                  )}
                  
                  {log.error_message && (
                    <div className="bg-destructive/10 text-destructive p-2 rounded text-xs mt-2">
                      <strong>Erro:</strong> {log.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};