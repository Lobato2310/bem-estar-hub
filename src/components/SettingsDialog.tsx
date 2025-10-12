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
import { Settings, ExternalLink, Shield, FileText, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

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

        </div>
      </DialogContent>
    </Dialog>
  );
};