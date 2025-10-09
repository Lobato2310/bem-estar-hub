import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, ExternalLink, Shield, FileText, Info, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";

export const SettingsDialog = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </DialogTitle>
          <DialogDescription>
            Gerencie suas preferências e acesse informações importantes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tema */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Escuro
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Informações Legais */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Informações Legais</h3>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openExternalLink('https://myfitlife.social.br/privacidade')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Política de Privacidade
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openExternalLink('https://myfitlife.social.br/termos')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Termos de Uso
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => openExternalLink('https://myfitlife.social.br/exclusao-conta')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exclusão de Conta
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>

          <Separator />

          {/* Informações do App */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4" />
                Sobre o MyFitLife
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Versão</span>
                <Badge variant="secondary">1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Classificação</span>
                <Badge variant="outline">12+ anos</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">⚠️ Importante para menores de idade:</p>
                <p>
                  Se você tem menos de 18 anos, certifique-se de ter autorização 
                  dos seus pais ou responsáveis antes de usar este aplicativo.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">💳 Pagamentos</CardTitle>
              <CardDescription className="text-xs">
                Este app não processa pagamentos internamente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => openExternalLink('https://myfitlife.lovable.app/checkout')}
              >
                Acessar Área de Pagamento
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};