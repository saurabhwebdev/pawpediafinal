import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'
import BreedInfo from '../components/BreedInfo'

export default function BreedDetails() {
  const { breedId } = useParams()
  const [images, setImages] = useState([])
  const [subBreeds, setSubBreeds] = useState([])
  const [loading, setLoading] = useState(true)
  const capitalizedBreed = breedId.charAt(0).toUpperCase() + breedId.slice(1)

  useEffect(() => {
    const fetchBreedData = async () => {
      try {
        const [breedImages, breedsData] = await Promise.all([
          dogApi.getBreedImages(breedId),
          dogApi.getAllBreeds()
        ])
        setImages(breedImages.slice(0, 9))
        setSubBreeds(breedsData[breedId] || [])
      } catch (error) {
        console.error('Error fetching breed data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBreedData()
  }, [breedId])

  return (
    <>
      <Helmet>
        <title>{capitalizedBreed} Dogs - PawPedia</title>
        <meta
          name="description"
          content={`Learn all about ${capitalizedBreed} dogs. View photos and discover the characteristics, temperament, and care requirements of this wonderful breed.`}
        />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-500" />
          </div>
        ) : (
          <BreedInfo
            breed={breedId}
            subBreeds={subBreeds}
            images={images}
          />
        )}
      </div>
    </>
  )
} 