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
import MeasurementsSection from "@/components/sections/MeasurementsSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import ProfessionalDashboard from "@/components/ProfessionalDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [anamnesisComplete, setAnamnesisComplete] = useState<boolean | null>(null);
  const { user, loading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !subscriptionLoading) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log("User profile in Index:", profile);
        console.log("Is subscribed:", isSubscribed);
        
        if (profile) {
          setUserProfile(profile);
          
          // Se é cliente, verificar assinatura primeiro
          if (profile.user_type === "client") {
            console.log("User is client, checking subscription status...");
            // Se não tem assinatura ativa, redirecionar para assinatura
            if (!isSubscribed) {
              console.log("Client not subscribed, redirecting to subscription");
              // Só muda para subscription se não estiver já nela (evita loop)
              if (activeTab !== "subscription") {
                setActiveTab("subscription");
              }
              return;
            }

            console.log("Client is subscribed, checking anamnesis...");
            // Se tem assinatura ativa, verificar anamnese
            const { data: anamnesis, error: anamnesisError } = await supabase
              .from("client_anamnesis")
              .select("is_completed")
              .eq("client_id", user.id)
              .maybeSingle();
            
            if (anamnesisError) {
              console.error("Erro ao verificar anamnese:", anamnesisError);
            }
            
            const isComplete = anamnesis && anamnesis.is_completed;
            setAnamnesisComplete(isComplete);
            
            // Se não completou anamnese, redirecionar
            if (!isComplete) {
              console.log("Anamnesis not complete, redirecting to anamnesis");
              navigate("/anamnesis");
              return;
            }
          } else {
            console.log("User is professional, no subscription check needed");
            setAnamnesisComplete(true); // Profissionais não precisam de anamnese
          }
        }
      }
    };

    if (user && !subscriptionLoading) {
      fetchUserProfile();
    }
  }, [user, navigate, isSubscribed, subscriptionLoading, activeTab]);

  const renderSection = () => {
    // Se o usuário for profissional, mostrar dashboard profissional na home
    if (activeTab === "home" && userProfile?.user_type === "professional") {
      return <ProfessionalDashboard />;
    }

    switch (activeTab) {
      case "home":
        return <HomeSection onNavigate={setActiveTab} userProfile={userProfile} />;
      case "personal":
        return <PersonalSection />;
      case "nutrition":
        return <NutritionSection />;
      case "measurements":
        return <MeasurementsSection />;
      case "calories":
        return <CaloriesSection />;
      case "psychology":
        return <PsychologySection />;
      case "subscription":
        return <SubscriptionSection />;
      default:
        return <HomeSection onNavigate={setActiveTab} />;
    }
  };

  if (loading || subscriptionLoading || !userProfile || anamnesisComplete === null) {
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
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-4 md:pb-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
