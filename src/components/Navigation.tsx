import { useState, useEffect } from "react";
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
import { ClientUpdatesDialog } from "@/components/ClientUpdatesDialog";
import { supabase } from "@/integrations/supabase/client";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { signOut, user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Carregar perfil do usuário para verificar se é cliente
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadUserProfile();
  }, [user]);
  
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
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
              alt="MyFitLife Logo" 
              className="h-6 md:h-8 w-auto"
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
            
            {/* Mostrar atualizações apenas para clientes */}
            {userProfile?.user_type === 'client' && (
              <div className="ml-4">
                <ClientUpdatesDialog />
              </div>
            )}
            
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
        <div className="md:hidden">
          <div className="flex overflow-x-auto pb-3 space-x-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    flex flex-col items-center space-y-1 px-3 py-2 rounded-lg min-w-0 flex-shrink-0 transition-all duration-300 min-h-[60px] min-w-[60px]
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Mobile updates and logout for clients */}
          <div className="flex items-center justify-between mt-2 px-2">
            {userProfile?.user_type === 'client' && <ClientUpdatesDialog />}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground ml-auto"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-xs">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;