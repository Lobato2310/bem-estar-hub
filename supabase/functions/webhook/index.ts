import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MERCADO-PAGO-WEBHOOK] ${step}${detailsStr}`);
};

// Função para verificar assinatura do webhook
const verifyWebhookSignature = async (payload: string, signature: string, secret: string): Promise<boolean> => {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const payloadBytes = encoder.encode(payload);
    
    return await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);
  } catch (error) {
    logStep("Erro ao verificar assinatura", error);
    return false;
  }
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

    // Log do webhook para debug
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const rawBody = await req.text();
    let body;
    
    try {
      body = JSON.parse(rawBody);
      logStep("Body recebido", body);
      
    } catch (error) {
      logStep("Erro ao parsear JSON", error);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Verificar assinatura do webhook usando secret do Supabase
    const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
    const signature = req.headers.get("x-signature");
    
    if (signature && webhookSecret) {
      const isValidSignature = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValidSignature) {
        logStep("Assinatura inválida do webhook");
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      logStep("Assinatura do webhook verificada com sucesso");
    } else {
      logStep("Webhook sem assinatura ou secret não configurado", { hasSignature: !!signature, hasSecret: !!webhookSecret });
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
      logStep("Verificando TOKEN_MP", { hasToken: !!accessToken });

      if (!accessToken) {
        throw new Error("TOKEN_MP não configurado");
      }

      logStep("Buscando detalhes do pagamento no MP", { paymentId, tokenLength: accessToken.length });
      
      let paymentData;
      try {
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

        paymentData = await paymentResponse.json();
        logStep("Dados do pagamento obtidos", paymentData);
      } catch (fetchError) {
        logStep("Erro de rede/fetch ao acessar MP", fetchError);
        // Erro crítico - não simular dados, relançar o erro
        logStep("ERRO CRÍTICO: Não foi possível buscar dados do pagamento", fetchError);
        throw fetchError;
      }

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
          logStep("Erro ao buscar perfil pelo email", profileError);
        }
        
        if (profiles) {
          targetUserId = profiles.user_id;
          logStep("Usuário encontrado no profiles", { targetUserId });
        } else {
          logStep("Usuário não encontrado no profiles, tentando user_subscriptions");
          // Se não encontrou por email, tentar buscar na tabela user_subscriptions
          const { data: subscription, error: subError } = await supabaseClient
            .from("user_subscriptions")
            .select("user_id")
            .eq("email", userEmail)
            .maybeSingle();
          
          if (subError) {
            logStep("Erro ao buscar na user_subscriptions pelo email", subError);
          }
          
          if (subscription) {
            targetUserId = subscription.user_id;
            logStep("Usuário encontrado na user_subscriptions", { targetUserId });
          }
        }
      }

      if (!targetUserId) {
        throw new Error(`Não foi possível identificar o usuário. External reference: ${userId}, Email: ${userEmail}`);
      }

      // Atualizar registro de assinatura na tabela correta
      const subscriptionData = {
        id_usuario: targetUserId,
        email: userEmail || "",
        assinatura_ativa: assinaturaAtiva,
        plano: "mensal",
        data_inicio: assinaturaAtiva ? dataInicio : null,
        data_expiracao: assinaturaAtiva ? dataExpiracaoStr : null,
        mercado_payment_id: paymentId,
        mercado_pago_status: mpStatus,
        valor_pago: paymentData.transaction_amount || 0,
        atualizado_em: new Date().toISOString()
      };

      // Primeiro, verificar se já existe registro na tabela assinaturas
      const { data: existingSubscription } = await supabaseClient
        .from("assinaturas")
        .select("id")
        .eq("id_usuario", targetUserId)
        .maybeSingle();

      let subscriptionResult;
      if (existingSubscription) {
        // Atualizar registro existente
        subscriptionResult = await supabaseClient
          .from("assinaturas")
          .update({
            email: userEmail || "",
            assinatura_ativa: assinaturaAtiva,
            plano: "mensal",
            data_inicio: assinaturaAtiva ? dataInicio : null,
            data_expiracao: assinaturaAtiva ? dataExpiracaoStr : null,
            mercado_payment_id: paymentId,
            mercado_pago_status: mpStatus,
            valor_pago: paymentData.transaction_amount || 0,
            atualizado_em: new Date().toISOString()
          })
          .eq("id_usuario", targetUserId);
      } else {
        // Inserir novo registro
        subscriptionResult = await supabaseClient
          .from("assinaturas")
          .insert(subscriptionData);
      }

      if (subscriptionResult.error) {
        logStep("Erro ao atualizar/inserir assinatura", subscriptionResult.error);
        throw subscriptionResult.error;
      }

      logStep("Assinatura atualizada/inserida com sucesso", { 
        targetUserId, 
        assinaturaAtiva, 
        paymentId,
        existingRecord: !!existingSubscription
      });

      // Enviar email de confirmação APENAS se o pagamento foi aprovado
      if (assinaturaAtiva && mpStatus === "approved") {
        try {
          // Buscar nome do usuário para personalizar o email
          const { data: userProfile } = await supabaseClient
            .from("profiles")
            .select("display_name")
            .eq("user_id", targetUserId)
            .single();

          const userName = userProfile?.display_name || "Cliente";

          logStep("Enviando email de confirmação", { userEmail, userName });

          // Chamar edge function para enviar email
          const emailResponse = await supabaseClient.functions.invoke('send-payment-confirmation', {
            body: {
              userEmail,
              userName,
              plano: "mensal",
              valorPago: paymentData.transaction_amount || 0,
              dataExpiracao: dataExpiracaoStr
            }
          });

          if (emailResponse.error) {
            logStep("Erro ao enviar email de confirmação", emailResponse.error);
          } else {
            logStep("Email de confirmação enviado com sucesso");
          }
        } catch (emailError) {
          logStep("Erro ao processar envio de email", emailError);
          // Não falhar o webhook por erro de email
        }
      }

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