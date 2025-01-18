import { useState, useEffect, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { firebaseService } from '../services/firebase'
import { dogApi } from '../services/dogApi'

export default function DogFacts() {
  const [facts, setFacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [factImages, setFactImages] = useState({})
  const navigate = useNavigate()

  // Fetch dog images for facts
  useEffect(() => {
    const fetchImages = async () => {
      const images = {};
      for (const fact of facts) {
        try {
          const image = await dogApi.getRandomImage();
          images[fact] = image;
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }
      setFactImages(images);
    };

    if (facts.length > 0) {
      fetchImages();
    }
  }, [facts]);

  useEffect(() => {
    const fetchFacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const cachedData = await firebaseService.getCachedData('facts', 'dog_facts');
        console.log('Firebase response:', cachedData);
        
        if (cachedData?.content && Array.isArray(cachedData.content)) {
          console.log('Found facts in Firebase:', cachedData.content.length);
          setFacts(cachedData.content);
        } else {
          console.error('Invalid data structure:', cachedData);
          setError('No facts found in database. Please run generate-facts script first.');
          setFacts([]);
        }
      } catch (error) {
        console.error('Error fetching facts from Firebase:', error);
        setError('Error loading facts. Please try again later.');
        setFacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacts();
  }, []);

  const handleFactClick = (fact) => {
    const encodedFact = encodeURIComponent(fact)
    navigate(`/facts/${encodedFact}`)
  }

  // Lazy loaded fact card component
  const FactCard = ({ fact, index, image }) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => handleFactClick(fact)}
      className="relative isolate flex flex-col gap-4 bg-white dark:bg-gray-700 px-8 py-12 shadow-2xl rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300"
    >
      {image && (
        <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
          <img
            src={image}
            alt="Dog related to fact"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-dog.jpg'; // Add a default image path
            }}
          />
        </div>
      )}
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
  );

  return (
    <>
      <Helmet>
        <title>Fascinating Dog Facts - PawPedia</title>
        <meta
          name="description"
          content="Discover fascinating facts about dogs. Learn about their behavior, abilities, and unique characteristics through our curated collection of interesting dog facts."
        />
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
            {error && (
              <div className="mt-6 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
            {loading ? (
              <div className="col-span-2 flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400" />
              </div>
            ) : facts.length > 0 ? (
              <Suspense fallback={<div>Loading facts...</div>}>
                {facts.map((fact, index) => (
                  <FactCard 
                    key={index}
                    fact={fact}
                    index={index}
                    image={factImages[fact]}
                  />
                ))}
              </Suspense>
            ) : (
              <div className="col-span-2 text-center text-gray-600 dark:text-gray-400">
                No facts available. Please run the generate-facts script to populate the database.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 