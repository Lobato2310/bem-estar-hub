import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Save } from "lucide-react";

interface Subscription {
  id: string;
  email: string;
  plano: string;
  assinatura_ativa: boolean;
  data_inicio: string | null;
  data_expiracao: string | null;
  valor_pago: number | null;
}

interface User {
  user_id: string;
  email: string;
  display_name: string | null;
}

const PLANS = [
  "plano Fusion",
  "plano App completo", 
  "plano App Basic"
];

export const AdminSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    plano: "",
    assinatura_ativa: false,
    data_inicio: "",
    data_expiracao: "",
    valor_pago: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar assinaturas
      const { data: subscriptionsData, error: subsError } = await supabase
        .from("assinaturas")
        .select("*")
        .order("email");

      if (subsError) throw subsError;

      // Buscar perfis de usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .eq("user_type", "client");

      if (profilesError) throw profilesError;

      setSubscriptions(subscriptionsData || []);
      setUsers(profilesData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de assinaturas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      plano: subscription.plano || "",
      assinatura_ativa: subscription.assinatura_ativa,
      data_inicio: subscription.data_inicio || "",
      data_expiracao: subscription.data_expiracao || "",
      valor_pago: subscription.valor_pago?.toString() || ""
    });
  };

  const handleSaveChanges = async () => {
    if (!selectedSubscription) return;

    try {
      const { error } = await supabase
        .from("assinaturas")
        .update({
          plano: editForm.plano,
          assinatura_ativa: editForm.assinatura_ativa,
          data_inicio: editForm.data_inicio || null,
          data_expiracao: editForm.data_expiracao || null,
          valor_pago: editForm.valor_pago ? parseFloat(editForm.valor_pago) : null
        })
        .eq("id", selectedSubscription.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Assinatura atualizada com sucesso",
      });

      // Recarregar dados
      await loadData();
      setSelectedSubscription(null);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar assinatura",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Gerenciamento de Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Busca */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Lista de assinaturas */}
            <div className="grid gap-4">
              {filteredSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium">{subscription.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Plano: <span className="font-medium">{subscription.plano}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={`font-medium ${subscription.assinatura_ativa ? 'text-green-600' : 'text-red-600'}`}>
                          {subscription.assinatura_ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </p>
                      {subscription.data_expiracao && (
                        <p className="text-sm text-muted-foreground">
                          Expira em: {new Date(subscription.data_expiracao).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleEditSubscription(subscription)}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de edição */}
      {selectedSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Editando Assinatura: {selectedSubscription.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Seleção de Plano */}
              <div>
                <Label className="text-sm font-medium">Plano</Label>
                <Select 
                  value={editForm.plano} 
                  onValueChange={(value) => setEditForm({...editForm, plano: value})}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status da Assinatura */}
              <div>
                <Label className="text-sm font-medium">Status da Assinatura</Label>
                <RadioGroup 
                  value={editForm.assinatura_ativa.toString()} 
                  onValueChange={(value) => setEditForm({...editForm, assinatura_ativa: value === 'true'})}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="ativa" />
                    <Label htmlFor="ativa">Ativa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="inativa" />
                    <Label htmlFor="inativa">Inativa</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio" className="text-sm font-medium">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={editForm.data_inicio}
                    onChange={(e) => setEditForm({...editForm, data_inicio: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="data_expiracao" className="text-sm font-medium">Data de Expiração</Label>
                  <Input
                    id="data_expiracao"
                    type="date"
                    value={editForm.data_expiracao}
                    onChange={(e) => setEditForm({...editForm, data_expiracao: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Valor Pago */}
              <div>
                <Label htmlFor="valor_pago" className="text-sm font-medium">Valor Pago (R$)</Label>
                <Input
                  id="valor_pago"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editForm.valor_pago}
                  onChange={(e) => setEditForm({...editForm, valor_pago: e.target.value})}
                  className="mt-1"
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={handleSaveChanges} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSubscription(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};