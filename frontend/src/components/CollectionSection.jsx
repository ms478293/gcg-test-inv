import React from 'react';
import { ArrowRight } from 'lucide-react';
import { collections } from '../data/mock';

const CollectionSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
            Collections
          </h2>
          <div className="w-24 h-px bg-black mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Explore our carefully curated collections, each telling a unique story of craftsmanship and design excellence.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <div 
              key={collection.id}
              className="group relative overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-700"
            >
              {/* Image Container */}
              <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-light text-white mb-3 tracking-wide">
                    {collection.name}
                  </h3>
                  <p className="text-white/90 font-light mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {collection.description}
                  </p>
                  
                  {/* Explore Button */}
                  <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300">
                    <span className="text-sm font-medium tracking-wider mr-3">EXPLORE</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Collection Info */}
              <div className="py-6 text-center">
                <h4 className="text-xl font-medium text-black mb-2 tracking-wide">
                  {collection.name}
                </h4>
                <p className="text-gray-600 font-light">
                  {collection.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;