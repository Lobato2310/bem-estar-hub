import { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Apple, 
  Calculator, 
  Brain,
  Heart,
  LogOut,
  Scale,
  CreditCard,
  TestTube2,
  Menu,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ClientUpdatesDialog } from "@/components/ClientUpdatesDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  const servicesTabs = [
    { id: "home", label: "Início", icon: Heart },
    { id: "personal", label: "Personal", icon: Dumbbell },
    { id: "nutrition", label: "Nutrição", icon: Apple },
    { id: "measurements", label: "Medidas", icon: Scale },
    { id: "calories", label: "Calorias", icon: Calculator },
    { id: "psychology", label: "Psicologia", icon: Brain },
  ];

  const rightTabs = [
    { id: "subscription", label: "Assinatura", icon: CreditCard },
    { id: "webhook-test", label: "Teste Webhook", icon: TestTube2 },
  ];

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-14 md:h-16">
          {/* Logo and Services Dropdown */}
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/34fcfefb-cf55-4161-a65f-3135e5cf6fb0.png" 
              alt="MyFitLife Logo" 
              className="h-6 md:h-8 w-auto"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Menu className="h-4 w-4" />
                  Serviços
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {servicesTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`cursor-pointer ${
                        activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Right side buttons */}
          <div className="flex items-center space-x-2">
            {rightTabs.map((tab) => {
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
            
            {/* Atualizações apenas para clientes */}
            {userProfile?.user_type === 'client' && (
              <ClientUpdatesDialog />
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-14">
            {/* Services Dropdown Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Menu className="h-4 w-4" />
                  Serviços
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {servicesTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`cursor-pointer ${
                        activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Right side mobile */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTabChange("subscription")}
                className={`
                  p-2 rounded-lg transition-all duration-300
                  ${activeTab === "subscription"
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                `}
              >
                <CreditCard className="h-5 w-5" />
              </button>
              
              {userProfile?.user_type === 'client' && (
                <ClientUpdatesDialog />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;