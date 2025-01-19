import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function BlogPostCard({ post, index }) {
  // Extract introduction section from content
  const getIntroduction = (content) => {
    const sections = content.split('\n#');
    const introSection = sections.find(section => 
      section.toLowerCase().includes('introduction') || 
      section.toLowerCase().startsWith(' introduction')
    );
    
    if (introSection) {
      // Remove the introduction header and get the content
      const withoutHeader = introSection.replace(/^[#\s]*introduction[#\s]*$/im, '').trim();
      // Also remove any remaining ### markers
      const cleanContent = withoutHeader.replace(/^###\s*introduction\s*$/im, '').trim();
      const paragraphs = cleanContent.split('\n\n');
      const firstParagraph = paragraphs.find(p => p.trim().length > 0);
      
      if (firstParagraph) {
        return firstParagraph.slice(0, 150) + '...'; // Limit to 150 characters
      }
    }
    return post.summary; // Fallback to summary if no introduction found
  };

  const introduction = getIntroduction(post.content);

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
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {introduction}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.timestamp).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </motion.article>
  );
} 