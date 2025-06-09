import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AgeVerificationModal from "@/components/age-verification-modal";
import LocationVerification from "@/components/location-verification";
import { Shield, MapPin, UserCheck, Truck, Clock, Award } from "lucide-react";

export default function Home() {
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showLocationVerification, setShowLocationVerification] = useState(false);

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setShowAgeModal(false);
    setShowLocationVerification(true);
  };

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link focus-visible-enhanced"
        aria-label="Skip to main content"
      >
        Skip to main content
      </a>

      {/* Hero Section with Cultural Elements */}
      <section 
        className="relative bg-gradient-to-br from-primary via-tibetan-blue to-accent text-white sikkim-pattern-bg"
        role="banner"
        aria-labelledby="hero-heading"
      >
        <div 
          className="absolute inset-0 bg-black/50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1569529465841-dfecdab7503b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        {/* Prayer Flag Gradient Accent */}
        <div className="prayer-flag-gradient absolute top-0 left-0 right-0 animate-prayer-flag" aria-hidden="true"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" id="main-content">
          <div className="max-w-3xl animate-cultural-entrance">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-monastery-gold animate-compliance-pulse" aria-hidden="true" />
              <span className="compliance-badge bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                <span className="sr-only">Certified:</span>
                Sikkim Excise Licensed
              </span>
            </div>
            
            <h1 
              id="hero-heading"
              className="text-responsive-xl font-bold leading-tight mb-8 lepcha-accent high-contrast-text"
            >
              Premium Alcohol Delivery in{" "}
              <span className="text-monastery-gold tibetan-heading">Sikkim</span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
              Fully compliant with Sikkim Excise Act. Age-verified delivery with advanced geofencing technology. 
              Your premium spirits delivered safely, legally, and with cultural respect.
            </p>
            
            {/* Cultural Compliance Badges */}
            <div 
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 lepcha-pattern border border-white/20"
              role="region"
              aria-labelledby="compliance-features"
            >
              <h2 id="compliance-features" className="sr-only">Compliance Features</h2>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center group">
                  <Shield 
                    className="h-5 w-5 text-prayer-green mr-3 group-hover:scale-110 transition-transform" 
                    aria-hidden="true" 
                  />
                  <span className="font-medium">Excise Compliant</span>
                </div>
                <div className="flex items-center group">
                  <MapPin 
                    className="h-5 w-5 text-prayer-blue mr-3 group-hover:scale-110 transition-transform" 
                    aria-hidden="true" 
                  />
                  <span className="font-medium">Geo-Verified</span>
                </div>
                <div className="flex items-center group">
                  <UserCheck 
                    className="h-5 w-5 text-monastery-gold mr-3 group-hover:scale-110 transition-transform" 
                    aria-hidden="true" 
                  />
                  <span className="font-medium">KYC Verified</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all focus-visible-enhanced animate-lotus-bloom"
              onClick={() => setShowAgeModal(true)}
              aria-describedby="age-verification-description"
            >
              Start Age Verification
            </Button>
            <div id="age-verification-description" className="sr-only">
              Begin the secure age verification process using Aadhaar authentication
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section with Cultural Elements */}
      <section className="py-20 bg-gradient-to-b from-prayer-white to-secondary/20 lepcha-pattern" role="region" aria-labelledby="compliance-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-cultural-entrance">
            <div className="inline-block mb-4">
              <div className="prayer-flag-gradient w-24 h-1 mx-auto mb-4"></div>
            </div>
            <h2 id="compliance-heading" className="text-3xl md:text-4xl font-bold text-foreground mb-6 lepcha-accent tibetan-heading">
              Legal Compliance First
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We strictly adhere to the Sikkim Excise Act and ensure every delivery meets regulatory requirements 
              while honoring our cultural heritage and traditions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="text-center group hover:shadow-xl transition-all duration-300 thangka-border animate-lotus-bloom focus-visible-enhanced" tabIndex="0">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-prayer-red rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform animate-mandala-spin">
                  <Shield className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-foreground font-bold lepcha-accent">
                  Sikkim Excise Act Compliant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Full compliance with Section 12 of the Sikkim Excise Act, including daily purchase limits, 
                  age verification, and proper documentation requirements.
                </p>
                <div className="mt-4 inline-flex items-center text-sm text-prayer-green font-medium">
                  <span className="compliance-success px-3 py-1 rounded-full">
                    ✓ Certified Compliant
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-xl transition-all duration-300 thangka-border animate-lotus-bloom focus-visible-enhanced" tabIndex="0">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-tibetan-blue to-prayer-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-foreground font-bold lepcha-accent">
                  Sacred Zone Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Advanced geofencing technology respects sacred spaces, preventing delivery within 500m of 
                  monasteries, schools, temples, and culturally sensitive areas.
                </p>
                <div className="mt-4 inline-flex items-center text-sm text-tibetan-blue font-medium">
                  <span className="compliance-success px-3 py-1 rounded-full">
                    ✓ Sacred Spaces Protected
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center group hover:shadow-xl transition-all duration-300 thangka-border animate-lotus-bloom focus-visible-enhanced" tabIndex="0">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-monastery-gold to-prayer-yellow rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <UserCheck className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-foreground font-bold lepcha-accent">
                  Secure Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Multi-layer verification through Aadhaar validation, video KYC, biometric authentication, 
                  and real-time age confirmation for complete security.
                </p>
                <div className="mt-4 inline-flex items-center text-sm text-monastery-gold font-medium">
                  <span className="compliance-success px-3 py-1 rounded-full">
                    ✓ Identity Secured
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Cultural Trust Elements */}
          <div className="mt-16 text-center">
            <div className="prayer-flag-gradient w-32 h-1 mx-auto mb-6"></div>
            <p className="text-sm text-muted-foreground italic">
              "བདེན་པ་དང་གུས་པས་ལག་ལེན་བྱེད།" - Operating with truth and respect
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose SikkimSpirits?</h2>
            <p className="text-xl text-gray-600">Experience the best in legal alcohol delivery</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Temperature-controlled delivery in 30-45 minutes</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">100% Legal</h3>
                <p className="text-gray-600">Fully compliant with all local and state regulations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                <p className="text-gray-600">Track your order with live GPS and compliance checkpoints</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">Curated selection of authentic premium spirits</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <UserCheck className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Agents</h3>
                <p className="text-gray-600">Police-verified delivery agents with biometric authentication</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Geofencing</h3>
                <p className="text-gray-600">Automatic compliance with dry zone restrictions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Complete your verification and start shopping from our premium collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={() => setShowAgeModal(true)}
            >
              Complete Verification
            </Button>
            <Button
              size="lg"
              variant="secondary"
              asChild
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AgeVerificationModal
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onComplete={handleVerificationComplete}
      />

      {showLocationVerification && (
        <LocationVerification
          onComplete={() => setShowLocationVerification(false)}
        />
      )}
    </>
  );
}
