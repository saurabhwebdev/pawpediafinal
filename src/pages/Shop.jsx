import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { StarIcon, ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';

const searchSuggestions = [
  'dog food', 'chew toys', 'dog bed', 'leash', 'collar',
  'dog treats', 'grooming kit', 'dog shampoo', 'training toys',
  'dog bowl', 'puppy food', 'dog brush'
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await firebaseService.getShopProducts(category);
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // Search suggestion animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % searchSuggestions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredProducts(products);
      return;
    }

    const searchResults = products.filter(product => 
      product.title.toLowerCase().includes(term.toLowerCase()) ||
      product.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(searchResults);
  };

  const bestSellers = filteredProducts
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  const newArrivals = filteredProducts
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4);

  const featuredProducts = filteredProducts
    .filter(product => product.rating >= 4.5)
    .slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Dog Products Shop - PawPedia</title>
        <meta name="description" content="Shop for the best dog products - food, toys, accessories and more." />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 min-h-screen pt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">PawPedia Shop</span>
              <span className="block text-indigo-600 dark:text-indigo-400 text-2xl sm:text-3xl mt-3">
                Everything your dog needs, all in one place
              </span>
            </h1>
          </div>

          {/* Search Section */}
          <div className="relative max-w-xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-3 pl-10 pr-4 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                placeholder={`Try searching for "${searchSuggestions[currentSuggestion]}"`}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Products */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">Top rated items</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured />
              ))}
            </div>
          </section>

          {/* Best Sellers Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Best Sellers</h2>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">Most popular choices</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* New Arrivals Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Arrivals</h2>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">Latest additions</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* All Products Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Products</h2>
              {filteredProducts.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredProducts.length} products
                </span>
              )}
            </div>

            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-20">
                <p className="text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400">
                  No products found matching your search.
                </p>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product, featured }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="h-48 w-full object-cover object-center group-hover:opacity-75"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < product.rating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            ({product.reviews})
          </span>
        </div>
        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
          ₹{product.price}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm ${
            product.inStock 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
          >
            Buy on Amazon
            <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
} 