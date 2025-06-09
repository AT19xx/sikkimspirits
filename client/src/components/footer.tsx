import { Link } from "wouter";
import { Shield, Mail, Phone, MapPin, Clock, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">SikkimSpirits</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm leading-relaxed">
              Premium alcohol delivery service compliant with Sikkim Excise Act and Indian regulations. 
              Your trusted partner for legal, safe, and temperature-controlled spirits delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal & Compliance</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/excise-compliance" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Sikkim Excise Act
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/age-verification" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Age Verification
                </Link>
              </li>
              <li>
                <Link href="/legal/responsible-drinking" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Responsible Drinking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact & Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">+91-3592-123456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">support@sikkimspirits.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Gangtok, Sikkim, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Service: 10 AM - 10 PM</span>
              </div>
            </div>

            {/* Compliance Badges */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-300">Excise License: SK/EXC/2024/001</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-green-300">GST Registration: 32XXXXX1234X1ZV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="border-t border-gray-700 pt-8">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200">
                <h5 className="font-semibold mb-2 text-sm">Important Legal Notice</h5>
                <p className="text-xs leading-relaxed">
                  This service is available only to customers above 21 years of age with valid ID proof. 
                  All deliveries are subject to Sikkim Excise Act (2009) and applicable GST regulations. 
                  We reserve the right to refuse service in dry zones or restricted areas. 
                  Customers are responsible for compliance with local laws. Drink responsibly.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {currentYear} SikkimSpirits. All rights reserved. Licensed under Sikkim Excise Department.
            </p>
            <div className="flex items-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs">21+ Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs">100% Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Blockchain Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Emergency Contact: +91-100 | Excise Department Helpline: +91-3592-202020
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
