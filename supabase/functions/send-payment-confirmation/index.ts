import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  userEmail: string;
  userName: string;
  plano: string;
  valorPago: number;
  dataExpiracao: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, plano, valorPago, dataExpiracao }: PaymentConfirmationRequest = await req.json();

    console.log("Enviando email de confirmação para:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "MyFitLife <noreply@myfitlife.app>",
      to: [userEmail],
      subject: "✅ Pagamento Confirmado - Bem-vindo ao MyFitLife Premium!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #22c55e; margin: 0;">🎉 Pagamento Confirmado!</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
            <p style="color: #666; line-height: 1.6;">
              Seu pagamento foi processado com sucesso e sua assinatura MyFitLife Premium já está ativa!
            </p>
          </div>

          <div style="background-color: #fff; border: 2px solid #22c55e; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #22c55e; margin-top: 0;">📋 Detalhes da Assinatura</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>Plano:</strong> ${plano.charAt(0).toUpperCase() + plano.slice(1)}</li>
              <li><strong>Valor Pago:</strong> R$ ${valorPago.toFixed(2)}</li>
              <li><strong>Válido até:</strong> ${new Date(dataExpiracao).toLocaleDateString('pt-BR')}</li>
            </ul>
          </div>

          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin-top: 0;">🚀 O que você pode fazer agora:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Acesse todas as funcionalidades premium do MyFitLife</li>
              <li>Receba planos personalizados de treino e nutrição</li>
              <li>Acompanhe seu progresso com relatórios detalhados</li>
              <li>Tenha suporte completo de profissionais qualificados</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://myfitlife.app" 
               style="background-color: #22c55e; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; 
                      display: inline-block;">
              Acessar MyFitLife
            </a>
          </div>

          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; text-align: center;">
              Se você tiver alguma dúvida, entre em contato conosco através do suporte.
            </p>
            <p style="color: #999; font-size: 12px; text-align: center;">
              MyFitLife - Sua jornada fitness começa aqui!
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email de confirmação enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de confirmação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);