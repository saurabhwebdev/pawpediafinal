import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { firebaseService } from '../services/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeftIcon, ClockIcon, TagIcon } from '@heroicons/react/24/outline';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('No post ID provided');
          return;
        }

        const postData = await firebaseService.getCachedData('blog_details', id);
        console.log('Fetched post:', postData);

        if (postData?.content) {
          setPost(postData.content);
        } else {
          setError('Blog post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Error loading post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-32 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Post not found
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          The blog post you're looking for doesn't exist.
        </p>
        <div className="mt-10">
          <Link
            to="/blog"
            className="text-sm font-semibold leading-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - PawPedia Blog</title>
        <meta name="description" content={post.summary} />
      </Helmet>

      <article className="bg-white dark:bg-gray-800">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={post.image}
              alt={post.imageAlt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/25" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl text-center"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-x-2 text-sm font-medium text-white hover:text-gray-200 mb-8"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Blog
              </Link>
              <div className="flex items-center justify-center gap-x-4 text-sm leading-6 text-gray-300">
                <time dateTime={new Date(post.timestamp).toISOString()}>
                  {new Date(post.timestamp).toLocaleDateString()}
                </time>
                <div className="flex items-center gap-x-2">
                  <ClockIcon className="h-4 w-4" />
                  {post.readingTime}
                </div>
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                {post.title}
              </h1>
              <p className="mt-6 text-xl leading-8 text-gray-300">
                {post.summary}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-x-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    <TagIcon className="h-4 w-4" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg prose-indigo mx-auto dark:prose-invert"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mt-16 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-12 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mt-8">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mt-6 space-y-4 text-base leading-7 text-gray-600 dark:text-gray-300 list-disc pl-6">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mt-6 space-y-4 text-base leading-7 text-gray-600 dark:text-gray-300 list-decimal pl-6">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="pl-2 mb-2">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 dark:text-white">
                    {children}
                  </strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="mt-6 border-l-4 border-indigo-600 pl-4 italic text-gray-900 dark:text-white">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.content.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </motion.div>

          {/* Author Section */}
          {post.author && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-8"
            >
              <div className="flex items-center gap-x-4">
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {post.author.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </article>
    </>
  );
} 