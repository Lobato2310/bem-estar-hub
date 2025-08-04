import { useState } from "react";
import Navigation from "@/components/Navigation";
import HomeSection from "@/components/sections/HomeSection";
import PersonalSection from "@/components/sections/PersonalSection";
import NutritionSection from "@/components/sections/NutritionSection";
import CaloriesSection from "@/components/sections/CaloriesSection";
import MarketSection from "@/components/sections/MarketSection";
import PsychologySection from "@/components/sections/PsychologySection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderSection = () => {
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
