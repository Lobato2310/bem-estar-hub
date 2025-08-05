import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import HomeSection from "@/components/sections/HomeSection";
import PersonalSection from "@/components/sections/PersonalSection";
import NutritionSection from "@/components/sections/NutritionSection";
import CaloriesSection from "@/components/sections/CaloriesSection";
import MarketSection from "@/components/sections/MarketSection";
import PsychologySection from "@/components/sections/PsychologySection";
import ProfessionalDashboard from "@/components/ProfessionalDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [userProfile, setUserProfile] = useState<any>(null);
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
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(data);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const renderSection = () => {
    // Se o usuário for profissional, mostrar dashboard profissional na home
    if (activeTab === "home" && userProfile?.user_type === "professional") {
      return <ProfessionalDashboard />;
    }

    switch (activeTab) {
      case "home":
        return <HomeSection onNavigate={setActiveTab} />;
      case "personal":
        return <PersonalSection />;
      case "nutrition":
        return <NutritionSection />;
      case "calories":
        return <CaloriesSection />;
      case "market":
        return <MarketSection />;
      case "psychology":
        return <PsychologySection />;
      default:
        return <HomeSection onNavigate={setActiveTab} />;
    }
  };

  if (loading) {
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
      <main className="pb-4">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
