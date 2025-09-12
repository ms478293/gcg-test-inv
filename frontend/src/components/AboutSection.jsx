import React from 'react';
import { aboutContent } from '../data/mock';

const AboutSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
                  {aboutContent.title}
                </h2>
                <div className="w-24 h-px bg-black mb-8"></div>
              </div>
              
              <h3 className="text-2xl font-light text-gray-800 mb-6">
                {aboutContent.subtitle}
              </h3>
              
              <p className="text-lg text-gray-600 font-light leading-relaxed">
                {aboutContent.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                {aboutContent.stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-4xl lg:text-5xl font-light text-black mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600 font-medium tracking-wider uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1648861709330-fe5b3610029c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85"
                alt="Italian Craftsmanship"
                className="w-full h-96 lg:h-[600px] object-cover"
              />
              
              {/* Overlay Text */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-sm p-6">
                  <p className="text-black font-light text-lg">
                    "Every frame tells a story of precision, passion, and uncompromising quality."
                  </p>
                  <p className="text-gray-700 text-sm mt-2 font-medium">
                    — Master Craftsman, Milan Atelier
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;