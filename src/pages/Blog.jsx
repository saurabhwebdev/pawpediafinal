import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allPosts = await firebaseService.getAllPosts();
        console.log('Fetched posts:', allPosts);
        
        if (allPosts.length > 0) {
          // Sort posts by timestamp
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

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dog Care Blog - PawPedia</title>
        <meta name="description" content="Expert advice and guides for dog owners." />
      </Helmet>

      <div className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
              >
                <Link to={`/blog/${post.id.replace('post-', '')}`}>
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {post.summary}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 