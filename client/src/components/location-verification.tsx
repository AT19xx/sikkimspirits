import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LocationVerificationProps {
  onComplete: () => void;
}

export default function LocationVerification({ onComplete }: LocationVerificationProps) {
  const [locationStatus, setLocationStatus] = useState<"pending" | "requesting" | "success" | "error">("pending");
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const { toast } = useToast();

  const locationVerificationMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number; address: string }) => {
      const response = await apiRequest("POST", "/api/verification/location", data);
      return response.json();
    },
    onSuccess: () => {
      setLocationStatus("success");
      toast({
        title: "Location Verified",
        description: "Your location has been verified for delivery eligibility.",
      });
      setTimeout(() => {
        onComplete();
      }, 2000);
    },
    onError: (error: any) => {
      setLocationStatus("error");
      toast({
        title: "Location Verification Failed",
        description: error.message || "Unable to verify your location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const requestLocation = () => {
    setLocationStatus("requesting");
    
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter your address manually.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Mock address generation (in production, use reverse geocoding)
        const address = "MG Marg, Gangtok, Sikkim - 737101";
        
        const data = { latitude, longitude, address };
        setLocationData(data);
        
        locationVerificationMutation.mutate(data);
      },
      (error) => {
        setLocationStatus("error");
        let errorMessage = "Unable to access your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Location Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {locationStatus === "pending" && (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enable Location Services</h3>
                <p className="text-gray-600 mb-4">
                  We need your location to verify delivery eligibility and ensure compliance with local regulations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">School Zone Detection</p>
                    <p className="text-sm text-red-700">Automatic blocking within 500m of educational institutions</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Religious Site Protection</p>
                    <p className="text-sm text-red-700">Respecting cultural sensitivities and local laws</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Delivery Zone Verification</p>
                    <p className="text-sm text-green-700">Confirming service availability in your area</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={requestLocation} 
                className="w-full"
                size="lg"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location & Continue
              </Button>

              <p className="text-center text-sm text-gray-500">
                Your location data is encrypted and used only for compliance verification
              </p>
            </>
          )}

          {locationStatus === "requesting" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Your Location</h3>
              <p className="text-gray-600">Please allow location access when prompted by your browser.</p>
            </div>
          )}

          {locationStatus === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Verified!</h3>
              <p className="text-gray-600 mb-4">
                Your location has been verified and you're in a valid delivery zone.
              </p>
              {locationData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium text-green-900">Verified Address:</p>
                  <p className="text-sm text-green-700">{locationData.address}</p>
                </div>
              )}
            </div>
          )}

          {locationStatus === "error" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Verification Failed</h3>
              <p className="text-gray-600 mb-4">
                We couldn't verify your location. This could be due to restricted area or permission issues.
              </p>
              <div className="flex space-x-2">
                <Button onClick={requestLocation} variant="outline" className="flex-1">
                  Try Again
                </Button>
                <Button onClick={onComplete} variant="secondary" className="flex-1">
                  Skip for Now
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
