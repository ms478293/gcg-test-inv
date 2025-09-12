import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold tracking-wider mb-4">
                GCG EYEWEAR
              </h3>
              <p className="text-gray-300 font-light leading-relaxed">
                Luxury Italian eyewear crafted with passion and precision since 1985. 
                Discover the perfect fusion of heritage and innovation.
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a href="#" className="p-2 border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 border border-gray-600 hover:border-white hover:bg-white hover:text-black transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-medium tracking-wider mb-6 uppercase">Shop</h4>
            <ul className="space-y-4">
              {[
                'New Arrivals',
                'Sunglasses',
                'Eyeglasses',
                'Collections',
                'Limited Edition',
                'Gift Cards'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white font-light transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-medium tracking-wider mb-6 uppercase">Customer Service</h4>
            <ul className="space-y-4">
              {[
                'Contact Us',
                'Size Guide',
                'Shipping Info',
                'Returns',
                'Care Instructions',
                'FAQ'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-300 hover:text-white font-light transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-medium tracking-wider mb-6 uppercase">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 text-gray-400" />
                <div className="text-gray-300 font-light">
                  Via della Moda, 123<br />
                  20121 Milano, Italy
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href="tel:+393901234567" className="text-gray-300 hover:text-white font-light transition-colors duration-200">
                  +39 390 123 4567
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href="mailto:info@gcgeyewear.com" className="text-gray-300 hover:text-white font-light transition-colors duration-200">
                  info@gcgeyewear.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 py-12">
          <div className="text-center mb-8">
            <h4 className="text-2xl font-light tracking-wider mb-4">Stay Updated</h4>
            <p className="text-gray-300 font-light mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive access to new collections, 
              limited editions, and insider stories from our Milan atelier.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
            />
            <button className="px-8 py-3 bg-white text-black font-medium tracking-wider hover:bg-gray-200 transition-colors duration-200">
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-gray-400 text-sm font-light">
            © 2025 GCG Eyewear. All rights reserved.
          </div>
          
          <div className="flex space-x-8 text-sm">
            <a href="#" className="text-gray-400 hover:text-white font-light transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white font-light transition-colors duration-200">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white font-light transition-colors duration-200">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;