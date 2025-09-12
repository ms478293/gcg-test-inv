import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { useFeaturedProducts } from '../hooks/useProducts';

const FeaturedProducts = () => {
  const { products: featuredProducts, loading, error } = useFeaturedProducts(4);

  const formatPrice = (price) => {
    return `€${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
              Featured Pieces
            </h2>
            <div className="w-24 h-px bg-black mx-auto mb-8"></div>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="h-72 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="text-red-600">Error loading featured products: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-5xl lg:text-6xl font-light tracking-wider text-black mb-6">
            Featured Pieces
          </h2>
          <div className="w-24 h-px bg-black mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Discover our signature pieces, meticulously crafted to embody the perfect fusion of style and sophistication.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div 
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                      <Heart className="w-4 h-4 text-gray-700" />
                    </button>
                    <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200">
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {product.isLimitedEdition && (
                    <span className="px-3 py-1 bg-black text-white text-xs font-medium tracking-wider">
                      LIMITED EDITION
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-medium tracking-wider">
                      SALE
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
                    {product.collection}
                  </span>
                </div>
                
                <h3 className="text-xl font-medium text-black mb-2 group-hover:text-gray-700 transition-colors duration-200">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 font-light leading-relaxed">
                  {product.shortDescription}
                </p>

                {/* Material & Details */}
                <div className="mb-4 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Frame:</span> {product.frameColor}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Lens:</span> {product.lensColor}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-black">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button className="w-full mt-6 py-3 bg-black text-white text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors duration-200 transform hover:scale-[1.02]">
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center px-12 py-4 border-2 border-black text-black font-medium tracking-wider text-sm hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105">
            <span>VIEW ALL PRODUCTS</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;