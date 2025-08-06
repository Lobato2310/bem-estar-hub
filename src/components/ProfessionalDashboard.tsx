import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Dumbbell, Apple, ShoppingCart, Brain, Lock, Video, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ProfessionalDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClient, setSelectedClient] = useState("");
  const { toast } = useToast();

  const ADMIN_PASSWORD = "MyFitLifeSistemaAdm";

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Acesso liberado",
        description: "Bem-vindo ao painel administrativo profissional"
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Verifique a senha e tente novamente",
        variant: "destructive"
      });
    }
  };

  const clients = [
    { id: "1", name: "João Silva", lastSession: "há 2 dias" },
    { id: "2", name: "Maria Santos", lastSession: "há 1 dia" },
    { id: "3", name: "Pedro Costa", lastSession: "hoje" },
  ];

  const exercises = [
    { id: "1", name: "Supino Reto", muscle: "Peito", videoUrl: "" },
    { id: "2", name: "Agachamento", muscle: "Pernas", videoUrl: "" },
    { id: "3", name: "Rosca Direta", muscle: "Bíceps", videoUrl: "" },
  ];

  const foods = [
    { id: "1", name: "Frango Grelhado", price: "15.90", category: "Proteína" },
    { id: "2", name: "Batata Doce", price: "8.50", category: "Carboidrato" },
    { id: "3", name: "Whey Protein", price: "89.90", category: "Suplemento" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Lock className="h-6 w-6" />
              <span>Acesso Profissional</span>
            </CardTitle>
            <p className="text-muted-foreground">Digite a senha administrativa</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Senha Administrativa</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Digite a senha"
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Acessar Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo Profissional</h1>
        <p className="text-lg text-muted-foreground">
          Gerencie todos os aspectos dos clientes da plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <Dumbbell className="h-4 w-4" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center space-x-2">
            <Apple className="h-4 w-4" />
            <span>Nutrição</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Mercado</span>
          </TabsTrigger>
          <TabsTrigger value="psychology" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Psicologia</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Trainer Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Treinos dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClient && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Exercícios Disponíveis</h3>
                  <div className="grid gap-4">
                    {exercises.map((exercise) => (
                      <Card key={exercise.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{exercise.name}</h4>
                              <p className="text-sm text-muted-foreground">{exercise.muscle}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Video className="h-4 w-4 mr-2" />
                                    Vídeo
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Adicionar Vídeo - {exercise.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>URL do Vídeo</Label>
                                      <Input placeholder="https://youtube.com/watch?v=..." />
                                    </div>
                                    <Button>Salvar Vídeo</Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Dieta dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Café da Manhã</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Descreva o café da manhã..." />
                    <Button className="mt-2" size="sm">Salvar</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Almoço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Descreva o almoço..." />
                    <Button className="mt-2" size="sm">Salvar</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lanche</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Descreva o lanche..." />
                    <Button className="mt-2" size="sm">Salvar</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Jantar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Descreva o jantar..." />
                    <Button className="mt-2" size="sm">Salvar</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Mercado e Suplementos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-accent/5">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Informações de Entrega</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Horário:</strong> Segunda à Sexta, das 09:00 às 19:00<br />
                    <strong>Frete Grátis:</strong> Pedidos acima de R$ 150,00
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Produtos Disponíveis</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Produto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Produto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome do Produto</Label>
                        <Input placeholder="Ex: Whey Protein" />
                      </div>
                      <div>
                        <Label>Preço (R$)</Label>
                        <Input placeholder="89.90" type="number" step="0.01" />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="protein">Proteína</SelectItem>
                            <SelectItem value="carb">Carboidrato</SelectItem>
                            <SelectItem value="supplement">Suplemento</SelectItem>
                            <SelectItem value="fruit">Fruta</SelectItem>
                            <SelectItem value="vegetable">Vegetal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button>Adicionar Produto</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {foods.map((food) => (
                  <Card key={food.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{food.name}</h4>
                          <p className="text-sm text-muted-foreground">{food.category}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-primary">R$ {food.price}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Psychology Tab */}
        <TabsContent value="psychology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Psicologia dos Clientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Selecionar Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agenda do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Data e Hora</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div>
                      <Label>Tipo de Sessão</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de sessão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="therapy">Terapia Individual</SelectItem>
                          <SelectItem value="evaluation">Avaliação</SelectItem>
                          <SelectItem value="followup">Acompanhamento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>Agendar Sessão</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metas Quinzenais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nova Meta</Label>
                      <Textarea placeholder="Descreva a meta quinzenal..." />
                    </div>
                    <Button>Adicionar Meta</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Frases Motivacionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nova Frase</Label>
                      <Textarea placeholder="Digite uma frase motivacional..." />
                    </div>
                    <Button>Adicionar Frase</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Relatório do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Observações</Label>
                      <Textarea placeholder="Atualize o relatório do cliente..." />
                    </div>
                    <Button>Salvar Relatório</Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboard;