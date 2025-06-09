import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Star, Thermometer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/product-card";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  volume: number;
  alcoholContent: string;
  basePrice: string;
  exciseTax: string;
  gst: string;
  totalPrice: string;
  stock: number;
  imageUrl: string | null;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", selectedCategory !== "all" ? `?category=${selectedCategory}` : ""],
    enabled: true,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (product: Product) => {
      // In a real app, this would add to a backend cart
      const existingItem = cart.find(item => item.product.id === product.id);
      if (existingItem) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { product, quantity: 1 }]);
      }
      return product;
    },
    onSuccess: (product) => {
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: "all", name: "All Products" },
    { id: "whiskey", name: "Whiskey" },
    { id: "wine", name: "Wine" },
    { id: "beer", name: "Beer" },
    { id: "vodka", name: "Vodka" },
    { id: "rum", name: "Rum" },
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const cartTotal = cart.reduce((total, item) => 
    total + (parseFloat(item.product.totalPrice) * item.quantity), 0
  );

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="h-8 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Collection</h1>
          <p className="text-gray-600">Curated selection with transparent pricing and compliance</p>
        </div>
        
        {cartItemCount > 0 && (
          <Card className="mt-4 md:mt-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{cartItemCount} items</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{cartTotal.toFixed(2)}
                </div>
                <Button size="sm">
                  Checkout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Compliance Notice */}
      <Card className="mb-8 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Thermometer className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Temperature Controlled Delivery</h3>
              <p className="text-sm text-yellow-700">
                All products are delivered in temperature-controlled conditions to maintain quality. 
                Daily limit: 2L per customer as per Sikkim Excise Act Section 8(1).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => addToCartMutation.mutate(product)}
            isAddingToCart={addToCartMutation.isPending}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ShoppingCart className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {selectedCategory === "all" 
              ? "No products are currently available." 
              : `No products found in the ${selectedCategory} category.`}
          </p>
        </div>
      )}
    </div>
  );
}
