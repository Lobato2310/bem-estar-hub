import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MERCADO-PAGO-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook iniciado");

    // Criar cliente Supabase com service role para bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    logStep("Body recebido", body);

    // Verificar se é uma notificação de pagamento
    if (body.type === "payment") {
      const paymentId = body.data.id;
      const userId = body.external_reference; // Deve vir do site externo
      const userEmail = body.payer?.email;

      logStep("Processando pagamento", { paymentId, userId, userEmail });

      // Determinar status baseado no status do Mercado Pago
      const mpStatus = body.status || body.data?.status;
      const assinaturaAtiva = mpStatus === "approved";
      
      // Calcular datas baseado no plano (assumindo mensal por padrão)
      const dataInicio = new Date().toISOString().split('T')[0];
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      const dataExpiracaoStr = dataExpiracao.toISOString().split('T')[0];

      // Tentar encontrar usuário pelo external_reference ou email
      let targetUserId = userId;
      if (!targetUserId && userEmail) {
        const { data: profiles } = await supabaseClient
          .from("profiles")
          .select("user_id")
          .eq("email", userEmail)
          .maybeSingle();
        
        if (profiles) {
          targetUserId = profiles.user_id;
        }
      }

      if (!targetUserId) {
        throw new Error("Não foi possível identificar o usuário");
      }

      // Atualizar ou criar registro de assinatura
      const subscriptionData = {
        user_id: targetUserId,
        email: userEmail || "",
        assinatura_ativa: assinaturaAtiva,
        plano: "mensal",
        data_inicio: assinaturaAtiva ? dataInicio : null,
        data_expiracao: assinaturaAtiva ? dataExpiracaoStr : null,
        mercado_pago_payment_id: paymentId,
        mercado_pago_status: mpStatus,
        valor_pago: body.transaction_amount || 0,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from("user_subscriptions")
        .upsert(subscriptionData, { onConflict: "user_id" });

      if (error) {
        logStep("Erro ao atualizar assinatura", error);
        throw error;
      }

      logStep("Assinatura atualizada com sucesso", { 
        targetUserId, 
        assinaturaAtiva, 
        paymentId 
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Webhook processado com sucesso" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Se não for um webhook de pagamento, retornar sucesso sem processar
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Webhook recebido mas não processado" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO no webhook", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});