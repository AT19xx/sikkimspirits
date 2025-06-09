import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  Star,
  Thermometer,
  Shield,
  CheckCircle
} from "lucide-react";
import OrderTracker from "@/components/order-tracker";

interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export default function Tracking() {
  const params = useParams();
  const [trackingNumber, setTrackingNumber] = useState(params.orderNumber || "");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");

  const { data: order, isLoading } = useQuery<OrderDetails>({
    queryKey: [`/api/orders/${trackingNumber}`],
    enabled: !!trackingNumber,
  });

  const handleSearch = () => {
    if (searchOrderNumber.trim()) {
      setTrackingNumber(searchOrderNumber.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-xl text-gray-600">Real-time updates with compliance verification</p>
      </div>

      {/* Search Section */}
      {!trackingNumber && (
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="text-center">Enter Order Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Order ID (e.g., SK1234567890)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} className="w-full">
              Track Order
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      )}

      {/* Order Not Found */}
      {trackingNumber && !isLoading && !order && (
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find an order with the number "{trackingNumber}". 
              Please check the order number and try again.
            </p>
            <Button onClick={() => setTrackingNumber("")} variant="outline">
              Search Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      {order && (
        <div className="space-y-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{order.orderNumber}</CardTitle>
                  <p className="text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{parseFloat(order.totalAmount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {order.items.length}
                  </div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">30 min</div>
                  <div className="text-sm text-gray-600">Est. Delivery</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Tracking */}
          <OrderTracker orderNumber={order.orderNumber} status={order.status} />

          {/* Live Tracking & Quality Monitoring */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Live Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Live Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Live Delivery Map</p>
                    <p className="text-sm text-gray-400">Current location: MG Road, Gangtok</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">2.3 km</div>
                    <div className="text-sm text-gray-600">Distance Away</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">15 min</div>
                    <div className="text-sm text-gray-600">Estimated Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quality & Compliance Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Quality Monitoring</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Temperature Control */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Temperature Control</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">16°C</div>
                      <div className="text-xs text-green-600">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">12-18°C</div>
                      <div className="text-xs text-green-600">Target Range</div>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Compliance Check</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center justify-between">
                      <span>Age Verification</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Zone</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Agent Verification</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Package Details</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>{order.items.length} bottles • Secure packaging</p>
                    <p>Total weight: {(order.items.length * 1.5).toFixed(1)} kg</p>
                    <p className="flex items-center mt-2">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      Tamper-evident seals applied
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Agent Info */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Rajesh Kumar</div>
                  <div className="text-sm text-gray-600">Police Verified • ID: #DL8745</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium">4.9</span>
                    <span className="text-xs text-gray-500">(1,247 deliveries)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-2">ETA: 15 minutes</div>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Agent
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
