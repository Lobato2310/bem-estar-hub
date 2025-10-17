import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, User, Eye } from "lucide-react";

interface Client {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  created_at: string;
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  selectedClientId?: string;
}

const ClientSelector = ({ onClientSelect, selectedClientId }: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Buscar apenas IDs de usuários com assinatura ativa
      const { data: activeSubscriptions, error: subsError } = await supabase
        .from('assinaturas')
        .select('id_usuario')
        .eq('assinatura_ativa', true);

      if (subsError) throw subsError;

      const activeUserIds = activeSubscriptions?.map(sub => sub.id_usuario) || [];

      // Se não houver clientes ativos, retornar lista vazia
      if (activeUserIds.length === 0) {
        setClients([]);
        setLoading(false);
        return;
      }

      // Buscar perfis apenas dos clientes com assinatura ativa
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'client')
        .in('user_id', activeUserIds)
        .order('display_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Selecionar Cliente</h3>
        <Badge variant="secondary">{clients.length} clientes</Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client List */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Carregando clientes...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedClientId === client.user_id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onClientSelect(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {client.display_name || "Nome não informado"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                   <div className="flex items-center space-x-2">
                     {selectedClientId === client.user_id && (
                       <Badge variant="default">Selecionado</Badge>
                     )}
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={(e) => {
                         e.stopPropagation();
                         onClientSelect(client);
                       }}
                       title="Selecionar Cliente"
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientSelector;