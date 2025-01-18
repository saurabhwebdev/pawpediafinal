import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'
import { firebaseService } from '../services/firebase'
import RandomDogGrid from '../components/RandomDogGrid'

export default function Home() {
  const [randomImage, setRandomImage] = useState('')
  const [featuredBreeds, setFeaturedBreeds] = useState([])
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch random hero image
        const image = await dogApi.getRandomImage()
        setRandomImage(image)

        // Fetch all breeds for featured section
        const breeds = await dogApi.getAllBreeds()
        const breedKeys = Object.keys(breeds)
        const randomBreeds = []
        for (let i = 0; i < 3; i++) {
          const randomIndex = Math.floor(Math.random() * breedKeys.length)
          const breed = breedKeys[randomIndex]
          const breedImage = await dogApi.getBreedRandomImage(breed)
          randomBreeds.push({ name: breed, image: breedImage })
          breedKeys.splice(randomIndex, 1)
        }
        setFeaturedBreeds(randomBreeds)

        // Fetch featured blog posts
        const posts = await firebaseService.getCachedData('blog', 'posts')
        if (posts) {
          // Get the 3 most recent posts
          const recentPosts = posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3)
          setFeaturedPosts(recentPosts)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <Helmet>
        <title>PawPedia - Your Ultimate Guide to Dogs</title>
        <meta
          name="description"
          content="Discover everything about different dog breeds, their characteristics, and beautiful photos. Your comprehensive guide to the world of dogs."
        />
      </Helmet>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Decorative paw prints */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-10 left-10 transform -rotate-12"
          >
            <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-40 right-20 transform rotate-45"
          >
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </motion.div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-20 lg:py-32 gap-12">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center lg:text-left"
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                <span className="block text-indigo-600 dark:text-indigo-400">Welcome to</span>
                PawPedia
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Your comprehensive guide to understanding and caring for dogs.
                Explore breeds, read expert advice, and discover everything about your furry friends.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/breeds"
                    className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200"
                  >
                    Explore Breeds
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/blog"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg hover:bg-gray-50 ring-1 ring-inset ring-indigo-600/20 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Read Our Blog
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <img
                  src={randomImage}
                  alt="Happy dog"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-4 left-4 right-4 text-white text-center"
                >
                  <p className="text-lg font-medium">
                    Every dog has a story. Discover them all.
                  </p>
                </motion.div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -top-6 -right-6 bg-yellow-400 rounded-full p-4 shadow-lg"
              >
                <span className="text-2xl">🐾</span>
              </motion.div>
              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute -bottom-4 -left-4 bg-indigo-600 rounded-full p-3 shadow-lg"
              >
                <span className="text-xl text-white">🦴</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Breeds Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 py-24 sm:py-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5 dark:opacity-5">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-200 dark:bg-yellow-900 rounded-full blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10 mb-6">
              Featured Collections
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Discover Amazing Breeds
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Each breed has its own unique personality, characteristics, and charm.
              Meet some of our favorite furry friends!
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {featuredBreeds.map((breed, index) => (
              <motion.div
                key={breed.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col items-start"
              >
                <div className="relative w-full overflow-hidden rounded-3xl">
                  <div className="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-900">
                    <img
                      src={breed.image}
                      alt={breed.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-gray-900/0" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold text-white">
                      <Link to={`/breeds/${breed.name}`} className="hover:underline">
                        {breed.name.charAt(0).toUpperCase() + breed.name.slice(1)}
                      </Link>
                    </h3>
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="absolute -top-4 -right-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg transform -rotate-12"
                >
                  <span role="img" aria-label="paw" className="text-lg">
                    🐾
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/breeds"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200"
              >
                Explore All Breeds
                <span aria-hidden="true" className="text-white">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Featured Blog Posts Section */}
      <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5 dark:opacity-5">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-20 right-20 w-72 h-72 bg-indigo-300 dark:bg-indigo-800 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 ring-1 ring-inset ring-purple-700/10 mb-6">
              Latest Articles
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Expert Dog Care Insights
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Discover professional tips, training guides, and heartwarming stories about our furry companions.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden"
              >
                <div className="relative w-full overflow-hidden">
                  <div className="aspect-[16/9]">
                    <img
                      src={post.image}
                      alt={post.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-x-4 text-xs mb-4">
                      <time dateTime={new Date(post.timestamp).toISOString()} className="text-gray-500 dark:text-gray-400">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </time>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      <Link to={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300 line-clamp-3">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="absolute -top-4 -right-4 bg-white dark:bg-gray-700 rounded-full p-3 shadow-lg"
                >
                  <span role="img" aria-label="article" className="text-lg">
                    📖
                  </span>
                </motion.div>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200"
              >
                Read More Articles
                <span aria-hidden="true" className="text-white">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Random Dogs Grid Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 py-24 sm:py-32">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5 dark:opacity-5">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-40 left-0 w-64 h-64 bg-yellow-200 dark:bg-yellow-900 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, -50, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute bottom-40 right-0 w-64 h-64 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center rounded-full px-4 py-1 text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 ring-1 ring-inset ring-yellow-700/10 mb-6">
              Photo Gallery
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Pawsome Gallery
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              A delightful collection of adorable dogs from around the world. 
              Each refresh brings new furry friends to brighten your day!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <RandomDogGrid count={9} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/random"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-200"
              >
                Explore More Photos
                <span aria-hidden="true" className="text-white">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
} 