import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Truck, Package, Home } from "lucide-react";

interface OrderTrackerProps {
  orderNumber: string;
  status: string;
}

export default function OrderTracker({ orderNumber, status }: OrderTrackerProps) {
  const steps = [
    {
      id: "pending",
      title: "Order Placed",
      description: "KYC verified • Payment processed",
      icon: Package,
      completed: true
    },
    {
      id: "confirmed",
      title: "Order Confirmed",
      description: "Age & location re-verified",
      icon: CheckCircle,
      completed: true
    },
    {
      id: "preparing",
      title: "Preparing Order",
      description: "Temperature control activated • Compliance check passed",
      icon: Clock,
      completed: status !== "pending"
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      description: "Agent verified • GPS tracking active",
      icon: Truck,
      completed: ["out_for_delivery", "delivered"].includes(status),
      active: status === "out_for_delivery"
    },
    {
      id: "delivered",
      title: "Delivered",
      description: "ID verification at doorstep",
      icon: Home,
      completed: status === "delivered"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Order Progress</CardTitle>
          <Badge variant="outline">
            ETA: 30-45 minutes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center relative z-10
                    ${step.completed 
                      ? 'bg-green-500 text-white' 
                      : step.active 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`
                      font-semibold 
                      ${step.completed 
                        ? 'text-gray-900' 
                        : step.active 
                          ? 'text-blue-600' 
                          : 'text-gray-500'
                      }
                    `}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                    
                    {step.active && (
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          In Progress
                        </Badge>
                      </div>
                    )}
                    
                    {step.completed && !step.active && (
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500">
                    {step.completed && (
                      <span>
                        {index === 0 && "2:30 PM"}
                        {index === 1 && "2:32 PM"}
                        {index === 2 && "2:45 PM"}
                        {index === 3 && status === "out_for_delivery" && "3:15 PM"}
                        {index === 3 && status === "delivered" && "3:15 PM"}
                        {index === 4 && status === "delivered" && "4:02 PM"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Compliance Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Compliance Notice:</strong> All steps are monitored and logged as per Sikkim Excise Act requirements. 
            Biometric re-verification will be required at delivery.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
