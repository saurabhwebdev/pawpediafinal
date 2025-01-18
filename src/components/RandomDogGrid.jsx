import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'

export default function RandomDogGrid({ count = 6 }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRandomDogs = async () => {
    setLoading(true)
    try {
      const newImages = await Promise.all(
        Array(count).fill().map(() => dogApi.getRandomImage())
      )
      setImages(newImages)
    } catch (error) {
      console.error('Error fetching random dogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRandomDogs()
  }, [count])

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={imageUrl}
                  alt={`Random dog ${index + 1}`}
                  className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover shadow-lg"
                />
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={fetchRandomDogs}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Load New Dogs
            </button>
          </div>
        </>
      )}
    </div>
  )
} 