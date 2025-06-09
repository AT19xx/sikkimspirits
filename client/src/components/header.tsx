import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Shield, 
  ShoppingCart, 
  Menu, 
  User, 
  MapPin, 
  LogOut,
  Settings,
  Package
} from "lucide-react";
import AgeVerificationModal from "./age-verification-modal";

export default function Header() {
  const [location] = useLocation();
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cartItemCount] = useState(2); // This would come from cart context/state
  const [userLocation] = useState("Gangtok, Sikkim");
  const [isAuthenticated] = useState(false); // This would come from auth context

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setShowAgeModal(false);
  };

  const navigationItems = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/products", label: "Products", active: location === "/products" },
    { href: "/tracking", label: "Track Order", active: location.startsWith("/tracking") },
    { href: "/admin", label: "Admin", active: location === "/admin", adminOnly: true },
  ];

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SikkimSpirits</span>
              </Link>
              <Badge className="bg-green-100 text-green-800 text-xs">
                Licensed & Compliant
              </Badge>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                (!item.adminOnly || isAuthenticated) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      item.active
                        ? "text-blue-600 border-b-2 border-blue-600 pb-4"
                        : "text-gray-700 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Location Display */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>{userLocation}</span>
                {isVerified && (
                  <Badge variant="outline" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setShowAgeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}

              {/* Mobile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navigationItems.map((item) => (
                    (!item.adminOnly || isAuthenticated) && (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  ))}
                  <DropdownMenuItem>
                    <MapPin className="h-4 w-4 mr-2" />
                    {userLocation}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Verification Status Bar */}
        {!isVerified && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-yellow-800">
                <Shield className="h-4 w-4" />
                <span>Complete age verification to access our premium collection</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAgeModal(true)}
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                Verify Now
              </Button>
            </div>
          </div>
        )}
      </header>

      <AgeVerificationModal
        isOpen={showAgeModal}
        onClose={() => setShowAgeModal(false)}
        onComplete={handleVerificationComplete}
      />
    </>
  );
}
