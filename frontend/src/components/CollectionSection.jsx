import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useCollections } from '../hooks/useCollections';

const CollectionSection = () => {
  const { collections, loading, error } = useCollections();

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
              Collections
            </h2>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 lg:h-[500px] bg-gray-200 mb-6"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-red-600">Error loading collections: {error}</div>
        </div>
      </section>
    );
  }

  // Fallback to default collections if API returns empty
  const defaultCollections = [
    {
      id: 1,
      name: "New Arrivals",
      slug: "new-arrivals",
      description: "The latest in luxury eyewear",
      image: "https://images.unsplash.com/photo-1589642380614-4a8c2147b857?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85"
    },
    {
      id: 2,
      name: "Sunglasses",
      slug: "sunglasses",
      description: "Premium sun protection",
      image: "https://images.unsplash.com/photo-1639762485055-1565f145bf2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBzdW5nbGFzc2VzfGVufDB8fHx8MTc1NzY1ODcyM3ww&ixlib=rb-4.1.0&q=85"
    },
    {
      id: 3,
      name: "Eyeglasses",
      slug: "eyeglasses",
      description: "Sophisticated vision clarity",
      image: "https://images.unsplash.com/photo-1591843336300-89d113fcacd8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMGV5ZWdsYXNzZXN8ZW58MHx8fHwxNzU3NjU4NzI4fDA&ixlib=rb-4.1.0&q=85"
    }
  ];

  const displayCollections = collections.length > 0 ? collections : defaultCollections;
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
          {displayCollections.map((collection, index) => (
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