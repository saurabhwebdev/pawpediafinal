import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { geminiService } from '../services/geminiAI'
import { firebaseService } from '../services/firebase'

export default function DogFacts() {
  const [facts, setFacts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        // Try to get facts from cache first
        let cachedFacts = await firebaseService.getCachedDogFacts()
        
        if (!cachedFacts) {
          // If not in cache, generate new facts
          cachedFacts = await geminiService.generateDogFacts()
          // Cache the facts
          if (cachedFacts) {
            await firebaseService.setCachedDogFacts(cachedFacts)
          }
        }

        setFacts(cachedFacts || [])
      } catch (error) {
        console.error('Error fetching dog facts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacts()
  }, [])

  const handleFactClick = (fact) => {
    // Encode the fact for use in URL
    const encodedFact = encodeURIComponent(fact)
    navigate(`/facts/${encodedFact}`)
  }

  return (
    <>
      <Helmet>
        <title>Fascinating Dog Facts - PawPedia</title>
        <meta
          name="description"
          content="Discover fascinating facts about dogs. Learn about their behavior, abilities, and unique characteristics through our curated collection of interesting dog facts."
        />
        <meta name="keywords" content="dog facts, canine facts, interesting dog information, dog trivia, dog knowledge, dog science" />
      </Helmet>

      <div className="bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Fascinating Dog Facts
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Explore our collection of interesting and scientifically accurate facts about dogs.
              Click on any fact to learn more!
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
            {loading ? (
              <div className="col-span-2 flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400" />
              </div>
            ) : (
              facts.map((fact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleFactClick(fact)}
                  className="relative isolate flex flex-col gap-8 bg-white dark:bg-gray-700 px-8 py-12 shadow-2xl rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-base leading-7 text-gray-700 dark:text-gray-300">
                    <p>{fact}</p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                    <span>Read more</span>
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
} 