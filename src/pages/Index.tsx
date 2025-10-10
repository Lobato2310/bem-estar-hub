import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import HomeSection from "@/components/sections/HomeSection";
import PersonalSection from "@/components/sections/PersonalSection";
import NutritionSection from "@/components/sections/NutritionSection";
import CaloriesSection from "@/components/sections/CaloriesSection";
import PsychologySection from "@/components/sections/PsychologySection";
import ProfessionalPsychologySection from "@/components/sections/ProfessionalPsychologySection";
import MeasurementsSection from "@/components/sections/MeasurementsSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import WorkoutSection from "@/components/sections/WorkoutSection";
import ProfessionalDashboard from "@/components/ProfessionalDashboard";


const Index = () => {
  const [activeTab, setActiveTab] = useState(() => {
    // Verificar se há uma tab específica na URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'home';
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [anamnesisComplete, setAnamnesisComplete] = useState<boolean | null>(null);
  const { user } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);

            // Se é cliente, verificar anamnese apenas se tiver assinatura ativa
            if (profile.user_type === "client" && !subscriptionLoading) {
              if (isSubscribed) {
                // Verificar anamnese apenas para clientes com assinatura
                const { data: anamnesis } = await supabase
                  .from("client_anamnesis")
                  .select("is_completed")
                  .eq("client_id", user.id)
                  .maybeSingle();
                
                const isAnamnesisComplete = anamnesis?.is_completed || false;
                setAnamnesisComplete(isAnamnesisComplete);

                // Se tem assinatura mas não completou anamnese, redirecionar
                if (!isAnamnesisComplete) {
                  navigate("/anamnesis");
                }
              } else {
                // Sem assinatura, não precisa de anamnese
                setAnamnesisComplete(true);
              }
            } else if (profile.user_type === "professional") {
              setAnamnesisComplete(true);
            }
        }
      }
    };

    if (!subscriptionLoading) {
      fetchUserData();
    }
  }, [user, isSubscribed, subscriptionLoading, navigate]);

  const renderSection = () => {
    // Se for cliente sem assinatura, só permite Calorias e Minha Conta
    if (userProfile?.user_type === "client" && !isSubscribed) {
      if (activeTab === "calories") {
        return <CaloriesSection />;
      }
      if (activeTab === "subscription") {
        return <SubscriptionSection />;
      }
      // Redirecionar para calorias se tentar acessar outra página
      setActiveTab("calories");
      return <CaloriesSection />;
    }

    // Se o usuário for profissional, mostrar dashboard profissional na home
    if (activeTab === "home" && userProfile?.user_type === "professional") {
      return <ProfessionalDashboard />;
    }

    switch (activeTab) {
      case "home":
        return <HomeSection onNavigate={setActiveTab} userProfile={userProfile} />;
      case "personal":
        return userProfile?.user_type === "client" ? <WorkoutSection /> : <PersonalSection />;
      case "nutrition":
        return <NutritionSection />;
      case "measurements":
        return <MeasurementsSection />;
      case "calories":
        return <CaloriesSection />;
      case "psychology":
        return userProfile?.user_type === "professional" ? <ProfessionalPsychologySection /> : <PsychologySection />;
      case "subscription":
        return <SubscriptionSection />;
      default:
        return <HomeSection onNavigate={setActiveTab} userProfile={userProfile} />;
    }
  };

  // Loading state enquanto verifica dados do usuário
  if (subscriptionLoading || !userProfile || (userProfile.user_type === "client" && anamnesisComplete === null)) {
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="safe-pb min-w-0">
        <div className="min-w-0 w-full">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default Index;