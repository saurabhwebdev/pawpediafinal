import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { geminiService } from '../services/geminiAI';
import { firebaseService } from '../services/firebase';

export default function DogFactDetails() {
  const { factId } = useParams();
  const [fact, setFact] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFactDetails = async () => {
      try {
        // Try to get from cache first
        let cachedDetails = await firebaseService.getCachedFactDetails(factId);
        
        if (!cachedDetails) {
          // If not in cache, generate new details
          const decodedFact = decodeURIComponent(factId);
          cachedDetails = await geminiService.generateDogFactDetails(decodedFact);
          
          // Cache the details if generated successfully
          if (cachedDetails) {
            await firebaseService.setCachedFactDetails(factId, cachedDetails);
          }
        }

        setFact(decodeURIComponent(factId));
        setDetails(cachedDetails);
      } catch (error) {
        console.error('Error fetching fact details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFactDetails();
  }, [factId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fact Not Found</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Sorry, we couldn't find the details for this fact.</p>
          <Link
            to="/facts"
            className="mt-8 inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Back to Facts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{details.title} - PawPedia Dog Facts</title>
        <meta name="description" content={details.explanation.substring(0, 155) + '...'} />
        <meta property="og:title" content={details.title} />
        <meta property="og:description" content={details.explanation.substring(0, 155) + '...'} />
        <meta name="twitter:title" content={details.title} />
        <meta name="twitter:description" content={details.explanation.substring(0, 155) + '...'} />
      </Helmet>

      <article className="min-h-screen bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/facts"
              className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 mb-8"
            >
              ← Back to Facts
            </Link>

            <header className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                {details.title}
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 italic">
                {fact}
              </p>
            </header>

            <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Detailed Explanation
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {details.explanation}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Additional Information
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                  {details.additionalInfo.map((info, index) => (
                    <li key={index}>{info}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Sources
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                  {details.sources.map((source, index) => (
                    <li key={index}>{source}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Related Facts
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                  {details.relatedFacts.map((fact, index) => (
                    <li key={index}>{fact}</li>
                  ))}
                </ul>
              </section>
            </div>
          </motion.div>
        </div>
      </article>
    </>
  );
} 