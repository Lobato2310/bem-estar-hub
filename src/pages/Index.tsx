import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState(() => {
    // Verificar se há uma tab específica na URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'home';
  });
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();

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
        }
      }
    };

    fetchUserProfile();
  }, [user]);

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
        return <HomeSection onNavigate={setActiveTab} userProfile={userProfile} />;
    }
  };

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