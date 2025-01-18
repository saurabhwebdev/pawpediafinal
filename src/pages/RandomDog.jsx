import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'

export default function RandomDog() {
  const [randomDog, setRandomDog] = useState('')
  const [loading, setLoading] = useState(true)
  const [facts, setFacts] = useState([])

  const fetchRandomDog = async () => {
    setLoading(true)
    try {
      const imageUrl = await dogApi.getRandomImage()
      setRandomDog(imageUrl)
      // In a real app, you would fetch these from Gemini AI and cache in Firebase
      setFacts(getRandomDogFacts())
    } catch (error) {
      console.error('Error fetching random dog:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomDog()
  }, [])

  return (
    <>
      <Helmet>
        <title>Random Dog - PawPedia</title>
        <meta
          name="description"
          content="Discover random dog photos and fascinating dog facts from our extensive collection. Each refresh brings you a new adorable dog picture and interesting information about dogs!"
        />
      </Helmet>

      <div className="bg-white dark:bg-gray-800 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Random Dog Gallery
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Explore our collection of dog photos and learn interesting facts about these amazing companions.
              Each refresh brings a new furry friend and fascinating information!
            </p>
            <div className="mt-10">
              <button
                onClick={fetchRandomDog}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Get Another Dog
              </button>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="relative">
                  <img
                    src={randomDog}
                    alt="Random dog"
                    className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-700 object-cover"
                  />
                </div>

                {/* Dog Facts Section */}
                <div className="mt-12">
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                    Did You Know?
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {facts.map((fact, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg"
                      >
                        <p className="text-gray-600 dark:text-gray-300">{fact}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Helper function to get random dog facts
// In a real app, this would come from Gemini AI and be cached in Firebase
function getRandomDogFacts() {
  const allFacts = [
    "Dogs' sense of smell is up to 100,000 times stronger than humans'.",
    "A dog's nose print is unique, much like a human's fingerprint.",
    "Dogs can understand over 150 words and can count up to five.",
    "Puppies are born blind, deaf, and toothless.",
    "Dogs dream like humans and experience similar sleep stages.",
    "A dog's whiskers help them navigate in the dark.",
    "Dogs can detect human emotions through facial expressions.",
    "The average dog is as intelligent as a two-year-old child.",
    "Dogs can learn new commands at any age.",
    "A dog's sense of time passes differently than humans.",
    "Dogs have three eyelids, including one for lubrication.",
    "A dog's body language can tell you a lot about their mood.",
    "Dogs can hear sounds four times farther away than humans.",
    "The Basenji is the only breed of dog that doesn't bark.",
    "Dogs have about 1,700 taste buds compared to humans' 9,000.",
    // Add more facts as needed
  ]
  
  // Return 4 random facts
  return allFacts.sort(() => 0.5 - Math.random()).slice(0, 4)
} 