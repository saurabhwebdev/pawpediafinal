import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { dogApi } from '../services/dogApi'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchBreeds = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const searchResults = await dogApi.searchBreeds(query)
        setResults(searchResults)
        setShowResults(true)
      } catch (error) {
        console.error('Error searching breeds:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchBreeds, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for dog breeds..."
          className="w-full rounded-lg border-0 py-4 pl-12 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {showResults && (query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 max-h-96 overflow-auto"
          >
            {loading ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <Link
                    key={result.type === 'breed' ? result.name : `${result.parentBreed}-${result.name}`}
                    to={result.type === 'breed' ? `/breeds/${result.name}` : `/breeds/${result.parentBreed}/${result.name}`}
                    className="block px-4 py-3 hover:bg-gray-50"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={result.image}
                        alt={result.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {result.type === 'breed'
                            ? result.name.charAt(0).toUpperCase() + result.name.slice(1)
                            : `${result.name.charAt(0).toUpperCase() + result.name.slice(1)} ${result.parentBreed.charAt(0).toUpperCase() + result.parentBreed.slice(1)}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.type === 'breed'
                            ? `${result.subBreeds.length} sub-breeds`
                            : 'Sub-breed'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 