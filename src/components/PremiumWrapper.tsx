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
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
            <Lock className="h-5 w-5" />
            Funcionalidade Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4 p-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mx-auto">
              <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                {feature}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {description || `Esta funcionalidade requer uma assinatura premium ativa.`}
              </p>
            </div>

            <Button 
              onClick={openExternalCheckout}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Ativar Premium
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Acesse todas as funcionalidades avançadas com uma assinatura premium
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default PremiumWrapper;