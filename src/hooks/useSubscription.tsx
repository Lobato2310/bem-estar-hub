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

      // Profissionais não precisam de assinatura
      if (profile?.user_type === 'professional') {
        setIsSubscribed(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar assinatura:", error);
        setIsSubscribed(false);
        return;
      }

      if (data) {
        setSubscription(data);
        // Verificar se a assinatura está ativa e não expirou
        const isActive = data.assinatura_ativa && 
          (!data.data_expiracao || new Date(data.data_expiracao) > new Date());
        setIsSubscribed(isActive);
      } else {
        // Criar registro vazio se não existir (apenas para clientes)
        const { error: insertError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            email: user.email || "",
            assinatura_ativa: false
          });

        if (insertError) {
          console.error("Erro ao criar registro de assinatura:", insertError);
        }
        
        setSubscription({
          id: "",
          assinatura_ativa: false,
          plano: null,
          data_inicio: null,
          data_expiracao: null,
          valor_pago: null
        });
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
    const checkoutUrl = `https://myfitlife-hub.lovable.app/?user_id=${user?.id}&email=${user?.email}`;
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
          table: "user_subscriptions",
          filter: `user_id=eq.${user.id}`,
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