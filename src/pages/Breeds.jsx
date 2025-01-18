import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'

export default function Breeds() {
  const [breeds, setBreeds] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [randomImages, setRandomImages] = useState({})
  const [visibleBreeds, setVisibleBreeds] = useState(12)
  const [loadingMore, setLoadingMore] = useState(false)
  const observer = useRef()

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedsData = await dogApi.getAllBreeds()
        setBreeds(breedsData)
        await loadInitialImages(Object.keys(breedsData).slice(0, visibleBreeds))
      } catch (error) {
        console.error('Error fetching breeds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBreeds()
  }, [])

  const loadInitialImages = async (breedsList) => {
    const newImages = { ...randomImages }
    await Promise.all(
      breedsList.map(async (breed) => {
        if (!newImages[breed]) {  // Only fetch if we don't have the image yet
          try {
            const imageUrl = await dogApi.getBreedRandomImage(breed)
            newImages[breed] = imageUrl
          } catch (error) {
            console.error(`Error fetching image for ${breed}:`, error)
          }
        }
      })
    )
    setRandomImages(newImages)
  }

  const loadMoreImages = async () => {
    if (loadingMore) return

    setLoadingMore(true)
    const allBreeds = Object.keys(breeds)
    const nextBreeds = allBreeds.slice(visibleBreeds, visibleBreeds + 12)
    
    if (nextBreeds.length > 0) {
      await loadInitialImages(nextBreeds)
      setVisibleBreeds(prev => prev + 12)
    }
    
    setLoadingMore(false)
  }

  const lastBreedElementRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && Object.keys(breeds).length > visibleBreeds) {
        loadMoreImages()
      }
    }, {
      rootMargin: '100px' // Load more images before reaching the bottom
    })

    if (node) observer.current.observe(node)
  }, [loading, breeds, visibleBreeds])

  const filteredBreeds = Object.keys(breeds)
    .filter((breed) => breed.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, visibleBreeds)

  return (
    <>
      <Helmet>
        <title>Dog Breeds - PawPedia</title>
        <meta name="description" content="Explore our comprehensive list of dog breeds. Learn about different breeds, their characteristics, and view beautiful photos." />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Dog Breeds</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Explore our comprehensive collection of dog breeds and learn about their unique characteristics.
            </p>
          </div>

          <div className="mt-8 max-w-xl">
            <label htmlFor="search" className="sr-only">
              Search breeds
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="search"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Search breeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-500" />
            </div>
          ) : (
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {filteredBreeds.map((breed, index) => (
                <motion.article
                  key={breed}
                  ref={index === filteredBreeds.length - 1 ? lastBreedElementRef : null}
                  className="flex flex-col items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {randomImages[breed] && (
                    <div className="relative w-full">
                      <img
                        src={randomImages[breed]}
                        alt={breed}
                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="max-w-xl">
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <Link
                        to={`/breeds/${breed}`}
                        className="relative z-10 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {breed.charAt(0).toUpperCase() + breed.slice(1)}
                      </Link>
                    </div>
                    <div className="group relative">
                      <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        <Link to={`/breeds/${breed}`}>
                          <span className="absolute inset-0" />
                          Learn more about {breed.charAt(0).toUpperCase() + breed.slice(1)}s
                        </Link>
                      </h3>
                      <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {breeds[breed].length > 0
                          ? `Discover the sub-breeds: ${breeds[breed].join(', ')}`
                          : `Explore the characteristics and photos of ${breed}s.`}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
          
          {loadingMore && (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-500" />
            </div>
          )}
        </div>
      </div>
    </>
  )
} 