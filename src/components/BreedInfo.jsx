import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function BreedInfo({ breed, subBreeds, images }) {
  // Common traits and characteristics for dog breeds
  const breedTraits = {
    temperament: getBreedTemperament(breed),
    size: getBreedSize(breed),
    activity: getBreedActivity(breed),
    grooming: getBreedGrooming(breed),
    purpose: getBreedPurpose(breed),
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      <div className="relative h-72">
        <motion.img
          src={images[0]}
          alt={breed}
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
          {breed.charAt(0).toUpperCase() + breed.slice(1)}
        </h1>
      </div>

      <div className="p-6">
        {/* Breed Overview */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-300">
            {getBreedDescription(breed)}
          </p>
        </section>

        {/* Breed Traits */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Characteristics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(breedTraits).map(([trait, value]) => (
              <div key={trait} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700/50">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize mb-2">
                  {trait}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sub-breeds Section */}
        {subBreeds.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sub-breeds</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subBreeds.map((subBreed) => (
                <Link
                  key={subBreed}
                  to={`/breeds/${breed}/${subBreed}`}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {subBreed}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Image Gallery */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.slice(1, 7).map((image, index) => (
              <motion.div
                key={image}
                className="relative aspect-square rounded-lg overflow-hidden shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={image}
                  alt={`${breed} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Helper functions to provide breed-specific information
function getBreedTemperament(breed) {
  const temperaments = {
    husky: "Friendly, energetic, and independent",
    labrador: "Friendly, outgoing, and high-spirited",
    poodle: "Intelligent, active, and proud",
    bulldog: "Calm, courageous, and friendly",
    // Add more breeds as needed
  }
  return temperaments[breed.toLowerCase()] || "Information not available"
}

function getBreedSize(breed) {
  const sizes = {
    husky: "Medium to large, 20-23.5 inches tall",
    labrador: "Large, 21.5-24.5 inches tall",
    poodle: "Varies by variety (Standard, Miniature, Toy)",
    bulldog: "Medium, 14-15 inches tall",
    // Add more breeds as needed
  }
  return sizes[breed.toLowerCase()] || "Information not available"
}

function getBreedActivity(breed) {
  const activities = {
    husky: "High energy, requires lots of exercise",
    labrador: "Very active, needs regular exercise",
    poodle: "Active and agile",
    bulldog: "Moderate energy level",
    // Add more breeds as needed
  }
  return activities[breed.toLowerCase()] || "Information not available"
}

function getBreedGrooming(breed) {
  const grooming = {
    husky: "Regular brushing needed, heavy shedding",
    labrador: "Easy to groom, regular brushing",
    poodle: "High maintenance, requires regular grooming",
    bulldog: "Easy to groom, regular cleaning of facial wrinkles",
    // Add more breeds as needed
  }
  return grooming[breed.toLowerCase()] || "Information not available"
}

function getBreedPurpose(breed) {
  const purposes = {
    husky: "Originally bred for sledding",
    labrador: "Originally bred for retrieving",
    poodle: "Originally bred as a water retriever",
    bulldog: "Originally bred for bull-baiting",
    // Add more breeds as needed
  }
  return purposes[breed.toLowerCase()] || "Information not available"
}

function getBreedDescription(breed) {
  const descriptions = {
    husky: "The Siberian Husky is a beautiful breed known for its thick coat, distinctive markings, and blue or multi-colored eyes. Originally bred for sledding in northeast Asia, they are now popular family dogs known for their friendly and energetic nature.",
    labrador: "The Labrador Retriever is one of the most popular dog breeds in the world. Known for their friendly nature, intelligence, and versatility, they excel as family companions, service dogs, and working dogs.",
    poodle: "The Poodle is an elegant and intelligent breed that comes in three sizes: Standard, Miniature, and Toy. Despite their sophisticated appearance, they were originally bred as water retrievers and are excellent swimmers.",
    bulldog: "The Bulldog is a medium-sized breed known for its wrinkled face, pushed-in nose, and sturdy build. Despite their tough appearance, modern Bulldogs are gentle, friendly, and make excellent family companions.",
    // Add more breeds as needed
  }
  return descriptions[breed.toLowerCase()] || `The ${breed.charAt(0).toUpperCase() + breed.slice(1)} is a unique dog breed with its own special characteristics and traits. Explore our gallery to learn more about this wonderful breed.`
} 