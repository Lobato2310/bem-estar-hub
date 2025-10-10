import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown, ExternalLink } from "lucide-react";

interface PremiumWrapperProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
}

const PremiumWrapper = ({ children, feature, description }: PremiumWrapperProps) => {
  const { isSubscribed, loading, openExternalCheckout } = useSubscription();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Verificando assinatura...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Funcionalidade Bloqueada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4 p-6 bg-muted/50 rounded-lg">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {feature}
              </h3>
              <p className="text-sm text-muted-foreground">
                {description || `Esta funcionalidade está disponível para usuários com acesso completo.`}
              </p>
            </div>

            <Button 
              onClick={openExternalCheckout}
              variant="outline"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Acessar site
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Visite nosso site para mais informações
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default PremiumWrapper;