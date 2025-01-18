import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BlogPostCard({ post, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden"
    >
      <Link to={`/blog/${post.id.replace('post-', '')}`}>
        <div className="flex-shrink-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover"
            loading="lazy" // Native lazy loading for images
          />
        </div>
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
  );
} 