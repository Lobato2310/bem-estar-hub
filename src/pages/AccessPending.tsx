import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Lock } from "lucide-react";

const AccessPending = () => {
  const handleOpenWebsite = () => {
    window.open('https://myfitlife.social.br', '_blank');
  };

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
              Para começar a usar o aplicativo, você precisa solicitar permissão de acesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Acesse nosso site para pedir permissão de acesso ao aplicativo.
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
              Após a aprovação, você será automaticamente redirecionado para completar seu cadastro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessPending;
