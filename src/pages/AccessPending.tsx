import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const AccessPending = () => {
  const navigate = useNavigate();
  const { isSubscribed, loading } = useSubscription();

  // Se a assinatura estiver ativa, redirecionar para a página principal
  useEffect(() => {
    if (!loading && isSubscribed) {
      navigate("/");
    }
  }, [isSubscribed, loading, navigate]);

  const handleOpenWebsite = () => {
    window.open('https://myfitlife.social.br', '_blank');
  };

  if (loading) {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Acesso Pendente</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Para começar a usar o aplicativo, você precisa ativar sua assinatura.
            </p>
            <p className="text-sm text-muted-foreground">
              Acesse nosso site para contratar o plano e ter acesso completo ao aplicativo.
            </p>
          </div>
          
          <Button 
            onClick={handleOpenWebsite}
            className="w-full h-12 text-lg"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Acessar Site
          </Button>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Após a ativação da assinatura, você terá acesso imediato ao aplicativo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessPending;
