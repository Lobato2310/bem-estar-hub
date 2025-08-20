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
        console.log("Index: Buscando perfil para usuário:", user.id);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log("Index: Resultado da busca de perfil:", { profile, profileError: profileError?.message });
        
        if (profile) {
          setUserProfile(profile);
          
          // Se é cliente, verificar se completou anamnese
          if (profile.user_type === "client") {
            console.log("Index: Usuário é cliente, verificando anamnese...");
            const { data: anamnesis, error: anamnesisError } = await supabase
              .from("client_anamnesis")
              .select("is_completed")
              .eq("client_id", user.id)
              .eq("is_completed", true)
              .single();
            
            console.log("Index: Resultado da busca de anamnese:", { anamnesis, anamnesisError: anamnesisError?.message });
            
            setAnamnesisComplete(!!anamnesis);
            
            // Se não completou anamnese, redirecionar
            if (!anamnesis) {
              console.log("Index: Anamnese não encontrada, redirecionando para /anamnesis");
              navigate("/anamnesis");
              return;
            }
          } else {
            console.log("Index: Usuário é profissional, não precisa de anamnese");
            setAnamnesisComplete(true); // Profissionais não precisam de anamnese
          }
        } else {
          console.log("Index: Perfil não encontrado");
          setAnamnesisComplete(false);
        }
      }
    };

    if (user) {
      console.log("Index: Iniciando fetchUserProfile");
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
      <main className="pb-4">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
