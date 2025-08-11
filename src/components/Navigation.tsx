import { useState } from "react";
import { 
  Dumbbell, 
  Apple, 
  Calculator, 
  Brain,
  Heart,
  LogOut,
  Scale
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { signOut } = useAuth();
  
  const tabs = [
    { id: "home", label: "Início", icon: Heart },
    { id: "personal", label: "Personal", icon: Dumbbell },
    { id: "nutrition", label: "Nutrição", icon: Apple },
    { id: "measurements", label: "Medidas", icon: Scale },
    { id: "calories", label: "Calorias", icon: Calculator },
    { id: "psychology", label: "Psicologia", icon: Brain },
  ];

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
              alt="MyFitLife Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="ml-4 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden flex overflow-x-auto pb-2 space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex flex-col items-center space-y-1 p-2 rounded-lg min-w-0 flex-shrink-0 transition-all duration-300
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;