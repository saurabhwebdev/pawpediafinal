import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import { ClockIcon, TagIcon } from '@heroicons/react/24/outline';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const cachedPosts = await firebaseService.getCachedData('blog', 'posts');
        if (cachedPosts) {
          const sortedPosts = cachedPosts.sort((a, b) => b.timestamp - a.timestamp);
          setFeaturedPost(sortedPosts[0]);
          setPosts(sortedPosts.slice(1));
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  return (
    <>
      <Helmet>
        <title>Dog Care Blog - PawPedia</title>
        <meta
          name="description"
          content="Expert advice, tips, and comprehensive guides for dog owners. Learn about dog care, training, health, and more."
        />
      </Helmet>

      {/* Featured Post */}
      {featuredPost && (
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featuredPost.image}
              alt={featuredPost.imageAlt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/25" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-4">
                Dog Care Blog
              </h1>
              <p className="text-lg leading-8 text-gray-300 mb-12">
                Expert advice and comprehensive guides to help you provide the best care for your furry friend.
              </p>
              <div className="flex items-center justify-center gap-x-4 text-sm text-gray-300 mb-6">
                <time dateTime={new Date(featuredPost.timestamp).toISOString()}>
                  {new Date(featuredPost.timestamp).toLocaleDateString()}
                </time>
                <div className="flex items-center gap-x-2">
                  <ClockIcon className="h-4 w-4" />
                  {featuredPost.readingTime}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
                <Link to={`/blog/${featuredPost.slug}`} className="hover:underline">
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                {featuredPost.summary}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {featuredPost.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="inline-flex items-center gap-x-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20"
                  >
                    <TagIcon className="h-4 w-4" />
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Blog Content */}
      <div className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          {/* Tags Filter */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Filter by Topic
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Posts
              </button>
              {Array.from(new Set(posts.flatMap(post => post.tags))).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`inline-flex items-center gap-x-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <TagIcon className="h-4 w-4" />
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-x-4 text-sm text-white/90 mb-4">
                        <time dateTime={new Date(post.timestamp).toISOString()}>
                          {new Date(post.timestamp).toLocaleDateString()}
                        </time>
                        <div className="flex items-center gap-x-2">
                          <ClockIcon className="h-4 w-4" />
                          {post.readingTime}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-gray-200 transition-colors">
                        <Link to={`/blog/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                        {post.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTag(tag);
                            }}
                            className="inline-flex items-center gap-x-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
                          >
                            <TagIcon className="h-3 w-3" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 