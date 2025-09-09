import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Subscription = {
  plano: string;
  data_inicio: string;
  data_expiracao: string;
  valor_pago: number;
  assinatura_ativa: boolean;
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription"); // endpoint do Supabase que retorna assinatura atual
      if (!res.ok) throw new Error("Erro ao buscar assinatura");
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Não foi possível buscar assinatura" });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => fetchSubscription();

  const openExternalCheckout = async (planoNome: string) => {
    try {
      const res = await fetch("/api/criar_preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano: planoNome }),
      });

      if (!res.ok) throw new Error("Erro ao criar preferência de pagamento");
      const { checkoutUrl } = await res.json();

      // Redireciona para o checkout do Mercado Pago
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Não foi possível iniciar o pagamento" });
    }
  };

  return { subscription, loading, isSubscribed: subscription?.assinatura_ativa ?? false, refreshSubscription, openExternalCheckout };
};
