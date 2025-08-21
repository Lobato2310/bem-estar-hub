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
        <h1 className="text-2xl font-bold">Minha Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e acesse recursos premium
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            Status da Assinatura
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? "ATIVA" : "INATIVA"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription && (
            <div className="grid grid-cols-1 gap-4">
              {subscription.plano && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Plano Atual</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {subscription.plano}
                    </p>
                  </div>
                </div>
              )}

              {subscription.data_expiracao && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Data de Expiração</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {subscription.valor_pago && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Último Pagamento</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {subscription.valor_pago.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isSubscribed && (
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                    Assinatura Necessária
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Você precisa de uma assinatura ativa para acessar todos os recursos premium
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button 
          onClick={handleCheckout}
          className="w-full h-12 text-lg font-medium"
          variant={isSubscribed ? "outline" : "default"}
        >
          <ExternalLink className="mr-2 h-5 w-5" />
          {isSubscribed ? "Gerenciar Assinatura" : "Regularizar Assinatura"}
        </Button>

        <Button 
          onClick={handleRefresh}
          variant="ghost" 
          className="w-full h-10"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Status
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium">Como funciona?</h3>
            <p className="text-sm text-muted-foreground">
              Clique em "Regularizar Assinatura" para ser redirecionado ao site de pagamento. 
              Após a confirmação do pagamento, seu acesso premium será ativado automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSection;