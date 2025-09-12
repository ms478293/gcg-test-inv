import React from 'react';
import { ChevronRight } from 'lucide-react';
import { heroContent } from '../data/mock';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={heroContent.videoUrl} type="video/mp4" />
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
        <div className="space-y-8">
          {/* Brand Name */}
          <h1 className="text-6xl lg:text-8xl font-light tracking-[0.3em] mb-6">
            {heroContent.title}
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl lg:text-3xl font-light tracking-wider mb-8 opacity-90">
            {heroContent.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl font-light leading-relaxed max-w-3xl mx-auto opacity-85 mb-12">
            {heroContent.description}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button className="group inline-flex items-center px-12 py-4 bg-transparent border-2 border-white text-white font-medium tracking-wider text-sm hover:bg-white hover:text-black transition-all duration-500 transform hover:scale-105">
              <span>{heroContent.cta}</span>
              <ChevronRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-light tracking-wider opacity-70">SCROLL</span>
            <div className="w-px h-12 bg-white/40 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;