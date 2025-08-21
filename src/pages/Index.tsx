import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          
          // Se é cliente, verificar se completou anamnese
          if (profile.user_type === "client") {
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
              navigate("/anamnesis");
              return;
            }
          } else {
            setAnamnesisComplete(true); // Profissionais não precisam de anamnese
          }
        }
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user, navigate]);

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

  if (loading || !userProfile || anamnesisComplete === null) {
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
