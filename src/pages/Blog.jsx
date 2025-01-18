import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Lazy load the blog post card component
const BlogPostCard = lazy(() => import('../components/BlogPostCard'));

// Loading skeleton component for blog posts
const BlogPostSkeleton = () => (
  <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-300 dark:bg-gray-600" />
    <div className="p-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2" />
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
    </div>
  </div>
);

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allPosts = await firebaseService.getAllPosts();
        console.log('Fetched posts:', allPosts);
        
        if (allPosts.length > 0) {
          const sortedPosts = allPosts.sort((a, b) => b.timestamp - a.timestamp);
          setPosts(sortedPosts);
        } else {
          setError('No blog posts found. Please run generate-blogs script first.');
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Error loading posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.summary.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions = new Set();
    
    posts.forEach(post => {
      // Add matching titles
      if (post.title.toLowerCase().includes(query)) {
        suggestions.add(post.title);
      }
      
      // Add matching words from content
      const words = post.title.split(' ');
      words.forEach(word => {
        if (word.toLowerCase().includes(query) && word.length > 3) {
          suggestions.add(word);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  }, [posts, searchQuery]);

  // Get paginated posts
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * postsPerPage;
    return filteredPosts.slice(0, startIndex + postsPerPage);
  }, [filteredPosts, page]);

  // Check if there are more posts to load
  const hasMore = paginatedPosts.length < filteredPosts.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    const sentinel = document.querySelector('#sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <>
      <Helmet>
        <title>Dog Care Blog - PawPedia</title>
        <meta name="description" content="Expert advice and guides for dog owners." />
      </Helmet>

      <div className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Search Section */}
          <div className="mb-12">
            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search blog posts..."
                />
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                  <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {searchSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 dark:text-white hover:bg-indigo-600 hover:text-white"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {loading && !paginatedPosts.length ? (
              // Initial loading state
              Array.from({ length: 4 }).map((_, index) => (
                <BlogPostSkeleton key={index} />
              ))
            ) : paginatedPosts.length > 0 ? (
              <>
                {paginatedPosts.map((post, index) => (
                  <Suspense
                    key={post.id}
                    fallback={<BlogPostSkeleton />}
                  >
                    <BlogPostCard
                      post={post}
                      index={index}
                    />
                  </Suspense>
                ))}
                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div
                    id="sentinel"
                    className="col-span-2 flex justify-center py-8"
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {error || 'No matching posts found.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 