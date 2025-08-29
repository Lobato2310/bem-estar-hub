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
    logStep("Webhook iniciado", { 
      method: req.method, 
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });

    // Criar cliente Supabase com service role para bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let body;
    try {
      body = await req.json();
      logStep("Body recebido", body);
    } catch (error) {
      logStep("Erro ao parsear JSON", error);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verificar diferentes tipos de notificação do Mercado Pago
    logStep("Analisando tipo de notificação", { type: body.type, action: body.action });
    
    // Aceitar diferentes tipos de notificação (payment, application, etc.)
    if (body.type === "payment" || body.action === "payment.created" || body.action === "payment.updated") {
      const paymentId = body.data?.id || body.id;
      
      logStep("Dados iniciais do webhook", { 
        paymentId, 
        bodyType: body.type,
        bodyAction: body.action,
        bodyData: body.data,
        fullBody: body 
      });

      // Se temos um payment ID, buscar detalhes do pagamento no Mercado Pago
      if (!paymentId) {
        logStep("Payment ID não encontrado no webhook");
        throw new Error("Payment ID não encontrado no webhook");
      }

      // Buscar detalhes do pagamento usando a API do Mercado Pago
      const accessToken = Deno.env.get("TOKEN_MP");
      if (!accessToken) {
        throw new Error("TOKEN_MP não configurado");
      }

      logStep("Buscando detalhes do pagamento no MP", { paymentId });
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        logStep("Erro ao buscar pagamento no MP", { status: paymentResponse.status, error: errorText });
        throw new Error(`Erro ao buscar pagamento: ${paymentResponse.status} - ${errorText}`);
      }

      const paymentData = await paymentResponse.json();
      logStep("Dados do pagamento obtidos", paymentData);

      const userId = paymentData.external_reference;
      const userEmail = paymentData.payer?.email;
      const mpStatus = paymentData.status;
      const assinaturaAtiva = mpStatus === "approved";

      logStep("Processando pagamento", { paymentId, userId, userEmail, mpStatus, assinaturaAtiva });
      
      logStep("Status do pagamento", { mpStatus, assinaturaAtiva });
      
      // Calcular datas baseado no plano (assumindo mensal por padrão)
      const dataInicio = new Date().toISOString().split('T')[0];
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
      const dataExpiracaoStr = dataExpiracao.toISOString().split('T')[0];

      // Tentar encontrar usuário pelo external_reference ou email
      let targetUserId = userId;
      if (!targetUserId && userEmail) {
        logStep("Buscando usuário pelo email", { userEmail });
        const { data: profiles, error: profileError } = await supabaseClient
          .from("profiles")
          .select("user_id")
          .eq("email", userEmail)
          .maybeSingle();
        
        if (profileError) {
          logStep("Erro ao buscar perfil", profileError);
        }
        
        if (profiles) {
          targetUserId = profiles.user_id;
          logStep("Usuário encontrado pelo email", { targetUserId });
        } else {
          logStep("Usuário não encontrado pelo email");
        }
      }

      // Se ainda não temos userId, tentar buscar na tabela user_subscriptions pelo email
      if (!targetUserId && userEmail) {
        logStep("Tentando buscar usuário na tabela user_subscriptions", { userEmail });
        const { data: subscription, error: subError } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("email", userEmail)
          .maybeSingle();
        
        if (subError) {
          logStep("Erro ao buscar na user_subscriptions", subError);
        }
        
        if (subscription) {
          targetUserId = subscription.user_id;
          logStep("Usuário encontrado na user_subscriptions", { targetUserId });
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
        valor_pago: paymentData.transaction_amount || 0,
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
    logStep("Webhook recebido mas não é de pagamento", { type: body.type, action: body.action });
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Webhook recebido mas não processado",
      type: body.type,
      action: body.action
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