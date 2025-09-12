import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, User } from 'lucide-react';
import { navigationItems } from '../data/mock';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className={`text-2xl font-bold tracking-wider transition-colors duration-300 ${
              isScrolled ? 'text-black' : 'text-white'
            }`}
          >
            GCG EYEWEAR
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-60 ${
                  location.pathname === item.href
                    ? isScrolled ? 'text-black border-b-2 border-black' : 'text-white border-b-2 border-white'
                    : isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-6">
            <Search 
              className={`w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-110 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`} 
            />
            <User 
              className={`w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-110 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`} 
            />
            <div className="relative">
              <ShoppingBag 
                className={`w-5 h-5 cursor-pointer transition-all duration-300 hover:scale-110 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`} 
              />
              <span className={`absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium ${
                isScrolled ? 'bg-black' : 'bg-white text-black'
              }`}>
                0
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t">
            <nav className="px-6 py-8 space-y-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors duration-200 ${
                    location.pathname === item.href ? 'text-black border-l-4 border-black pl-4' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;