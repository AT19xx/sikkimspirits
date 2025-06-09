import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Info } from "lucide-react";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export default function ProductCard({ product, onAddToCart, isAddingToCart }: ProductCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'whiskey': return 'bg-amber-100 text-amber-800';
      case 'wine': return 'bg-purple-100 text-purple-800';
      case 'beer': return 'bg-yellow-100 text-yellow-800';
      case 'vodka': return 'bg-blue-100 text-blue-800';
      case 'rum': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600' };
    return { text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus(product.stock);

  // Use a default image if no imageUrl is provided
  const imageUrl = product.imageUrl || `https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback to a default image if the URL fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300';
          }}
        />
        <div className="absolute top-2 left-2">
          <Badge className={getCategoryColor(product.category)}>
            {product.category}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-white bg-opacity-90 rounded px-2 py-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs font-medium">4.5</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
          <span className={`text-xs font-medium ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>

        <p className="text-xs text-gray-600 mb-2">
          {product.brand} • {product.volume}ml • {product.alcoholContent}% ABV
        </p>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price Breakdown */}
        <div className="border-t pt-3 mb-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Base Price:</span>
              <span>₹{parseFloat(product.basePrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Excise Duty:</span>
              <span>₹{parseFloat(product.exciseTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>GST (18%):</span>
              <span>₹{parseFloat(product.gst).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <div className="flex items-center space-x-1">
              <span className="text-lg font-bold text-gray-900">
                ₹{parseFloat(product.totalPrice).toFixed(2)}
              </span>
              <Info className="h-3 w-3 text-gray-400" />
            </div>
          </div>
        </div>

        <Button 
          onClick={onAddToCart}
          disabled={product.stock === 0 || isAddingToCart}
          className="w-full"
          size="sm"
        >
          {isAddingToCart ? (
            "Adding..."
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
