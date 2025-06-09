import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Video, Calendar, CreditCard, Shield, UserCheck, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function AgeVerificationModal({ 
  isOpen, 
  onClose, 
  onComplete 
}: AgeVerificationModalProps) {
  const [step, setStep] = useState<"age" | "kyc" | "complete">("age");
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    aadhaarNumber: "",
    consent: false
  });
  const { toast } = useToast();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  const ageVerificationMutation = useMutation({
    mutationFn: async (data: { dateOfBirth: string; aadhaarNumber: string }) => {
      const response = await apiRequest("POST", "/api/verification/age", data);
      return response.json();
    },
    onSuccess: () => {
      setStep("kyc");
      toast({
        title: "Age Verified",
        description: "Age verification successful. Proceeding to KYC.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Age verification failed. Please check your details.",
        variant: "destructive",
      });
    },
  });

  const kycCompletionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/verification/complete", {});
      return response.json();
    },
    onSuccess: () => {
      setStep("complete");
      toast({
        title: "Verification Complete",
        description: "KYC verification completed successfully!",
      });
      setTimeout(() => {
        onComplete();
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "KYC Failed",
        description: error.message || "KYC verification failed.",
        variant: "destructive",
      });
    },
  });

  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateOfBirth || !formData.aadhaarNumber || !formData.consent) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields and accept the terms.",
        variant: "destructive",
      });
      return;
    }

    if (formData.aadhaarNumber.length !== 12) {
      toast({
        title: "Invalid Aadhaar",
        description: "Aadhaar number must be exactly 12 digits.",
        variant: "destructive",
      });
      return;
    }

    ageVerificationMutation.mutate({
      dateOfBirth: formData.dateOfBirth,
      aadhaarNumber: formData.aadhaarNumber
    });
  };

  const handleKycComplete = () => {
    kycCompletionMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Age Verification Required</span>
          </DialogTitle>
        </DialogHeader>

        {step === "age" && (
          <form onSubmit={handleAgeSubmit} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Legal Requirement</p>
                  <p className="text-yellow-700">
                    As per Sikkim Excise Act, customers must be 21+ years old
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={formData.aadhaarNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setFormData({ ...formData, aadhaarNumber: value });
                  }}
                  maxLength={12}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })}
                />
                <Label htmlFor="consent" className="text-sm">
                  I confirm I am 21+ years old and agree to the Terms & Conditions
                </Label>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={ageVerificationMutation.isPending}
              >
                {ageVerificationMutation.isPending ? "Verifying..." : "Verify Age"}
              </Button>
            </div>
          </form>
        )}

        {step === "kyc" && (
          <div className="space-y-4">
            <div className="text-center">
              <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video KYC Verification</h3>
              <p className="text-gray-600 mb-4">
                Final step: Complete video verification as per RBI guidelines.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to start video verification</p>
              <p className="text-xs text-gray-500 mt-1">
                Have your Aadhaar card ready for verification
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">What you'll need:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Clear lighting for face visibility</li>
                  <li>Original Aadhaar card</li>
                  <li>Stable internet connection</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleKycComplete} 
              className="w-full"
              disabled={kycCompletionMutation.isPending}
            >
              {kycCompletionMutation.isPending ? "Processing..." : "Complete KYC Verification"}
            </Button>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Complete!</h3>
            <p className="text-gray-600">
              You can now access our premium alcohol collection and place orders.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
