// supabase/functions/mercado_pago_webhook/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "payment") {
      const resp = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
        }
      );
      const payment = await resp.json();

      if (payment.status === "approved") {
        const userId = payment.metadata.user_id;
        const plano = payment.metadata.plano;
        const paymentId = payment.id.toString();
        const status = payment.status;
        const valorPago = payment.transaction_amount;

        // Buscar assinatura atual
        const { data: assinatura } = await supabase
          .from("assinaturas")
          .select("data_expiracao, assinatura_ativa")
          .eq("id_usuario", userId)
          .single();

        let novaDataExpiracao;

        if (
          assinatura &&
          assinatura.assinatura_ativa &&
          new Date(assinatura.data_expiracao) > new Date()
        ) {
          // soma +30 dias ao vencimento existente
          novaDataExpiracao = new Date(
            new Date(assinatura.data_expiracao).getTime() +
              30 * 24 * 60 * 60 * 1000
          ).toISOString();
        } else {
          // inicia nova assinatura de 30 dias
          novaDataExpiracao = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();
        }

        // Atualizar assinatura
        const { error } = await supabase
          .from("assinaturas")
          .update({
            assinatura_ativa: true,
            plano: plano,
            data_inicio: new Date().toISOString(),
            data_expiracao: novaDataExpiracao,
            mercado_payment_id: paymentId,
            mercado_pago_status: status,
            valor_pago: valorPago,
            atualizado_em: new Date().toISOString(),
          })
          .eq("id_usuario", userId);

        if (error) {
          console.error("Erro ao atualizar assinatura:", error);
          return new Response("Erro Supabase", { status: 500 });
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Erro webhook:", err);
    return new Response("erro", { status: 500 });
  }
});
