import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  id: string;
  assinatura_ativa: boolean;
  plano: string | null;
  data_inicio: string | null;
  data_expiracao: string | null;
  valor_pago: number | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsSubscribed(false);
      setLoading(false);
      return;
    }

    try {
      // Verificar se o usuário é profissional
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      console.log("Profile fetched:", profile);

      // Profissionais não precisam de assinatura
      if (profile?.user_type === 'professional') {
        console.log("User is professional, setting isSubscribed to true");
        setIsSubscribed(true);
        setLoading(false);
        return;
      }

      console.log("User is client, checking subscription...");

      const { data, error } = await supabase
        .from("assinaturas")
        .select("*")
        .eq("id_usuario", user.id)
        .maybeSingle();

      console.log("Subscription data:", data);
      console.log("Subscription error:", error);

      if (error) {
        console.error("Erro ao buscar assinatura:", error);
        setIsSubscribed(false);
        return;
      }

      if (data) {
        setSubscription(data as SubscriptionData);
        // Verificar apenas se a assinatura está ativa
        const isActive = data.assinatura_ativa === true;
        console.log("Subscription active:", isActive);
        setIsSubscribed(isActive);
      } else {
        // Não deveria acontecer mais com o trigger automático
        setSubscription({
          id: "",
          assinatura_ativa: false,
          plano: null,
          data_inicio: null,
          data_expiracao: null,
          valor_pago: null
        });
        console.log("No subscription found, setting isSubscribed to false");
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    setLoading(true);
    fetchSubscription();
  };

  const openExternalCheckout = () => {
    const checkoutUrl = `https://myfitlifewebsite.lovable.app/?user_id=${user?.id}&email=${user?.email}`;
    window.open(checkoutUrl, "_blank");
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Setup real-time subscription para mudanças na assinatura
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel("subscription_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assinaturas",
          filter: `id_usuario=eq.${user.id}`,
        },
        () => {
          refreshSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    subscription,
    loading,
    isSubscribed,
    refreshSubscription,
    openExternalCheckout
  };
};