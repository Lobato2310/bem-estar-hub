import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { ExternalLink, CreditCard, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubscriptionSection = () => {
  const { subscription, loading, isSubscribed, refreshSubscription, openExternalCheckout } = useSubscription();
  const { toast } = useToast();

  const handleCheckout = () => {
    openExternalCheckout();
    toast({
      title: "Redirecionamento",
      description: "Você será redirecionado para o site de pagamento do MyFitLife.",
    });
  };

  const handleRefresh = () => {
    refreshSubscription();
    toast({
      title: "Atualizando",
      description: "Verificando status da sua assinatura...",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando informações da assinatura...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Minha Conta</h1>
      </div>

      {/* Status de Acesso Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Status de Acesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <span className="text-2xl">🟢</span>
            <span className="font-medium">Acesso liberado</span>
          </div>
        </CardContent>
      </Card>

      {/* Vinculação de conta Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Vinculação de conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-foreground">
              Conectado com seu perfil MyFitLife.
            </p>
            <p className="text-sm text-muted-foreground">
              (Para gerenciar seu acesso, visite o site oficial.)
            </p>
          </div>

          <div className="pt-2">
            <h3 className="font-medium mb-3">🔗 Acesse nosso site</h3>
            <Button 
              onClick={() => window.open('https://myfitlife.social.br', '_blank')}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visitar MyFitLife
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSection;