import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Package, Clock, Search, Plus, Minus, Truck } from "lucide-react";
import { useState } from "react";

const MarketSection = () => {
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const categories = [
    { name: "Proteínas", icon: "🥩", color: "bg-red-100" },
    { name: "Vegetais", icon: "🥬", color: "bg-green-100" },
    { name: "Frutas", icon: "🍎", color: "bg-yellow-100" },
    { name: "Grãos", icon: "🌾", color: "bg-orange-100" },
    { name: "Laticínios", icon: "🥛", color: "bg-blue-100" },
    { name: "Suplementos", icon: "💊", color: "bg-purple-100" },
  ];

  const recommendedProducts = [
    { id: "1", name: "Peito de Frango", price: 8.99, unit: "kg", category: "Proteínas", inDiet: true },
    { id: "2", name: "Brócolis Orgânico", price: 4.50, unit: "kg", category: "Vegetais", inDiet: true },
    { id: "3", name: "Batata Doce", price: 3.20, unit: "kg", category: "Vegetais", inDiet: true },
    { id: "4", name: "Aveia em Flocos", price: 6.80, unit: "kg", category: "Grãos", inDiet: true },
    { id: "5", name: "Ovo Caipira", price: 12.00, unit: "dúzia", category: "Proteínas", inDiet: true },
    { id: "6", name: "Whey Protein", price: 89.90, unit: "unidade", category: "Suplementos", inDiet: false },
  ];

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = recommendedProducts.find(p => p.id === productId);
    return total + (product ? product.price * quantity : 0);
  }, 0);

  const cartItemsCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <ShoppingCart className="h-10 w-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Mercado Saudável</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Produtos recomendados pela sua nutricionista, entregues em casa
        </p>
      </div>

      {/* Status do carrinho */}
      {cartItemsCount > 0 && (
        <Card className="p-4 bg-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                {cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} no carrinho
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
              <Button>
                <Truck className="h-4 w-4 mr-2" />
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Busca */}
      <Card className="p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Categorias */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Categorias</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="text-center space-y-2">
                <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-xl">{category.icon}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{category.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Produtos recomendados */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Recomendados para sua Dieta</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedProducts.map((product) => (
            <Card key={product.id} className="p-4 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    {product.inDiet && (
                      <span className="inline-block mt-1 px-2 py-1 bg-primary-light text-primary text-xs rounded-full">
                        Na sua dieta
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">R$ {product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">por {product.unit}</p>
                  </div>
                </div>

                {cart[product.id] ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium text-foreground w-8 text-center">
                        {cart[product.id]}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(product.id)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="font-semibold text-primary">
                      R$ {(product.price * cart[product.id]).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={() => addToCart(product.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <Card className="p-6 bg-accent">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <Clock className="h-8 w-8 text-accent-foreground mx-auto" />
            <h3 className="font-semibold text-accent-foreground">Entrega Rápida</h3>
            <p className="text-sm text-accent-foreground/80">Em até 2 horas</p>
          </div>
          <div className="space-y-2">
            <Truck className="h-8 w-8 text-accent-foreground mx-auto" />
            <h3 className="font-semibold text-accent-foreground">Frete Grátis</h3>
            <p className="text-sm text-accent-foreground/80">Pedidos acima de R$ 50</p>
          </div>
          <div className="space-y-2">
            <Package className="h-8 w-8 text-accent-foreground mx-auto" />
            <h3 className="font-semibold text-accent-foreground">Produtos Frescos</h3>
            <p className="text-sm text-accent-foreground/80">Qualidade garantida</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MarketSection;