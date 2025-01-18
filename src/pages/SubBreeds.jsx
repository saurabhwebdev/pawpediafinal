import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'

export default function SubBreeds() {
  const [breeds, setBreeds] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [randomImages, setRandomImages] = useState({})
  const [visibleBreeds, setVisibleBreeds] = useState(8)
  const [loadingMore, setLoadingMore] = useState(false)
  const observer = useRef()

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedsData = await dogApi.getAllBreeds()
        // Filter only breeds with sub-breeds
        const breedsWithSubs = Object.entries(breedsData)
          .filter(([_, subBreeds]) => subBreeds.length > 0)
          .reduce((acc, [breed, subBreeds]) => {
            acc[breed] = subBreeds
            return acc
          }, {})
        setBreeds(breedsWithSubs)
        await loadInitialImages(Object.keys(breedsWithSubs).slice(0, visibleBreeds))
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
        if (!newImages[breed]) {
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
    const nextBreeds = allBreeds.slice(visibleBreeds, visibleBreeds + 8)
    
    if (nextBreeds.length > 0) {
      await loadInitialImages(nextBreeds)
      setVisibleBreeds(prev => prev + 8)
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
      rootMargin: '100px'
    })

    if (node) observer.current.observe(node)
  }, [loading, breeds, visibleBreeds])

  const filteredBreeds = Object.entries(breeds)
    .filter(([breed]) => breed.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, visibleBreeds)

  return (
    <>
      <Helmet>
        <title>Dog Sub-Breeds - PawPedia</title>
        <meta name="description" content="Explore our collection of dog sub-breeds. Discover the unique variations within each breed family." />
      </Helmet>

      <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Dog Sub-Breeds</h2>
            <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Discover the fascinating variations within each breed family. Explore sub-breeds and their unique characteristics.
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
                placeholder="Search breeds with sub-breeds..."
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
              {filteredBreeds.map(([breed, subBreeds], index) => (
                <motion.article
                  key={breed}
                  ref={index === filteredBreeds.length - 1 ? lastBreedElementRef : null}
                  className="flex flex-col items-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {randomImages[breed] && (
                    <div className="relative w-full overflow-hidden rounded-2xl">
                      <img
                        src={randomImages[breed]}
                        alt={breed}
                        className="aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800 object-cover sm:aspect-[2/1] lg:aspect-[3/2] transform transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-semibold text-white">
                          {breed.charAt(0).toUpperCase() + breed.slice(1)}
                        </h3>
                        <p className="mt-2 text-sm text-gray-200">
                          {subBreeds.length} sub-breed{subBreeds.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {subBreeds.map((subBreed) => (
                      <Link
                        key={`${breed}-${subBreed}`}
                        to={`/breeds/${breed}/${subBreed}`}
                        className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors duration-200"
                      >
                        {subBreed}
                      </Link>
                    ))}
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