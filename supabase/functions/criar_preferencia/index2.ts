// supabase/functions/criar_preferencia/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import mercadopago from "mercadopago";

mercadopago.configurations.setAccessToken(Deno.env.get("MP_ACCESS_TOKEN")!);

const planos = {
  "Plano 1 - Completo + Fusion": 299.99,
  "Plano 2 - Completo MyFitLife": 229.99,
  "Plano 3 - Personal + Nutricionista": 194.99,
};

serve(async (req) => {
  try {
    const { plano } = await req.json();
    const valor = planos[plano];
    if (!valor) return new Response("Plano inválido", { status: 400 });

    const preference = {
      items: [
        {
          title: plano,
          quantity: 1,
          currency_id: "BRL",
          unit_price: valor,
        },
      ],
      metadata: { plano },
      back_urls: {
        success: "https://myfitlife.lovable.app/pagamento/sucesso",
        failure: "https://myfitlife.lovable.app/pagamento/falha",
        pending: "https://myfitlife.lovable.app/pagamento/pendente",
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return new Response(JSON.stringify({ checkoutUrl: response.body.init_point }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao criar preferência", { status: 500 });
  }
});
