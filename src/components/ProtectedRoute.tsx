import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSubscription?: boolean;
  requireAnamnesis?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireSubscription = false, 
  requireAnamnesis = false 
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [anamnesisComplete, setAnamnesisComplete] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);

          // Se é cliente, verificar anamnese
          if (profile.user_type === "client") {
            const { data: anamnesis } = await supabase
              .from("client_anamnesis")
              .select("is_completed")
              .eq("client_id", user.id)
              .maybeSingle();
            
            setAnamnesisComplete(anamnesis?.is_completed || false);
          } else {
            setAnamnesisComplete(true); // Profissionais não precisam de anamnese
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserData();
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading || subscriptionLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
            alt="MyFitLife Logo" 
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticação
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Se não requer auth e não há usuário, renderizar children
  if (!requireAuth && !user) {
    return <>{children}</>;
  }

  // Se chegou aqui, há um usuário logado
  if (!userProfile) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar assinatura ativa (apenas para clientes)
  // Se não tem assinatura ativa, redirecionar para página de acesso pendente
  // Mas não redirecionar se já estiver na página de acesso pendente (evitar loop)
  if (userProfile.user_type === "client" && !isSubscribed && location.pathname !== "/access-pending") {
    return <Navigate to="/access-pending" replace />;
  }

  // Verificar anamnese (apenas para clientes com assinatura ativa)
  if (requireAnamnesis && userProfile.user_type === "client" && !anamnesisComplete) {
    return <Navigate to="/anamnesis" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;