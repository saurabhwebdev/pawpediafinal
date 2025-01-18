import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { dogApi } from '../services/dogApi'
import BreedInfo from '../components/BreedInfo'

export default function SubBreedDetails() {
  const { breedId, subBreedId } = useParams()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [breedInfo, setBreedInfo] = useState(null)

  useEffect(() => {
    const fetchSubBreedData = async () => {
      try {
        const imagesData = await dogApi.getSubBreedImages(breedId, subBreedId)
        setImages(imagesData.slice(0, 12))
        
        // In a real app, you would fetch this from your Firebase cache
        // For now, we'll use a placeholder until you provide Firebase config
        setBreedInfo({
          name: `${subBreedId} ${breedId}`,
          description: getSubBreedDescription(breedId, subBreedId),
          characteristics: getSubBreedCharacteristics(breedId, subBreedId),
          temperament: getSubBreedTemperament(breedId, subBreedId),
          care: getSubBreedCare(breedId, subBreedId)
        })
      } catch (error) {
        console.error('Error fetching sub-breed data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubBreedData()
  }, [breedId, subBreedId])

  const capitalizedBreed = breedId.charAt(0).toUpperCase() + breedId.slice(1)
  const capitalizedSubBreed = subBreedId.charAt(0).toUpperCase() + subBreedId.slice(1)

  return (
    <>
      <Helmet>
        <title>{`${capitalizedSubBreed} ${capitalizedBreed} - PawPedia`}</title>
        <meta
          name="description"
          content={`Discover the ${capitalizedSubBreed} variety of ${capitalizedBreed} dogs. Learn about their unique characteristics, temperament, and care requirements.`}
        />
      </Helmet>

      <div className="bg-white dark:bg-gray-800">
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                  {capitalizedSubBreed} {capitalizedBreed}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  {breedInfo.description}
                </p>
              </div>

              {/* Characteristics Section */}
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                  <div className="flex flex-col">
                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                      Physical Characteristics
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                      <ul className="mt-4 space-y-2 list-disc list-inside">
                        {breedInfo.characteristics.map((trait, index) => (
                          <li key={index}>{trait}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                      Temperament
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                      <ul className="mt-4 space-y-2 list-disc list-inside">
                        {breedInfo.temperament.map((trait, index) => (
                          <li key={index}>{trait}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                      Care Requirements
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                      <ul className="mt-4 space-y-2 list-disc list-inside">
                        {breedInfo.care.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Image Gallery */}
              <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
                      alt={`${capitalizedSubBreed} ${capitalizedBreed} ${index + 1}`}
                      className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-700 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Helper functions to get sub-breed information
// In a real app, this would come from Firebase/Gemini AI
function getSubBreedDescription(breed, subBreed) {
  const descriptions = {
    german: {
      shepherd: "The German Shepherd is a versatile working dog, originally developed for herding. Known for their strength, intelligence, and loyalty, they excel in various roles from family companions to service dogs.",
    },
    english: {
      setter: "The English Setter is an elegant and athletic gundog, known for their distinctive speckled coat and gentle nature. They combine grace with endurance and make excellent family companions.",
      bulldog: "The English Bulldog is a muscular, heavy dog with a wrinkled face and a distinctive pushed-in nose. They're known for their calm, friendly demeanor and make excellent family pets.",
    },
    // Add more breeds and sub-breeds
  }
  return descriptions[breed]?.[subBreed] || `The ${capitalizeFirst(subBreed)} ${capitalizeFirst(breed)} is a distinctive variety of the ${capitalizeFirst(breed)} breed, known for its unique characteristics and temperament.`
}

function getSubBreedCharacteristics(breed, subBreed) {
  const characteristics = {
    german: {
      shepherd: [
        "Strong, muscular build",
        "Double coat with medium-length outer layer",
        "Erect ears and intelligent expression",
        "Height: 22-26 inches",
        "Weight: 50-90 pounds",
      ],
    },
    english: {
      setter: [
        "Elegant, medium-sized build",
        "Long, silky coat with distinctive speckling",
        "Gentle expression with long ears",
        "Height: 24-27 inches",
        "Weight: 45-80 pounds",
      ],
    },
    // Add more breeds and sub-breeds
  }
  return characteristics[breed]?.[subBreed] || [
    "Distinctive appearance",
    "Breed-specific coat type and coloring",
    "Unique physical features",
    "Size varies by gender",
    "Well-proportioned build",
  ]
}

function getSubBreedTemperament(breed, subBreed) {
  const temperaments = {
    german: {
      shepherd: [
        "Highly intelligent and trainable",
        "Loyal and protective",
        "Good with families",
        "Alert and watchful",
        "Confident and courageous",
      ],
    },
    english: {
      setter: [
        "Gentle and affectionate",
        "Good with children",
        "Patient and calm",
        "Sociable with other dogs",
        "Eager to please",
      ],
    },
    // Add more breeds and sub-breeds
  }
  return temperaments[breed]?.[subBreed] || [
    "Friendly and sociable",
    "Good with proper training",
    "Adaptable to family life",
    "Breed-specific traits",
    "Individual personality variations",
  ]
}

function getSubBreedCare(breed, subBreed) {
  const care = {
    german: {
      shepherd: [
        "Regular exercise needed",
        "Consistent training required",
        "Regular grooming for double coat",
        "Hip health monitoring",
        "Mental stimulation important",
      ],
    },
    english: {
      setter: [
        "Regular exercise and playtime",
        "Coat requires frequent brushing",
        "Moderate grooming needs",
        "Regular vet check-ups",
        "Social interaction important",
      ],
    },
    // Add more breeds and sub-breeds
  }
  return care[breed]?.[subBreed] || [
    "Regular exercise routine",
    "Proper grooming maintenance",
    "Balanced diet",
    "Regular veterinary care",
    "Training and socialization",
  ]
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
} 