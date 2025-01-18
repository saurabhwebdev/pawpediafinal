import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dogApi } from '../services/dogApi'
import {
  PlayIcon,
  PauseIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function Slideshow({ isOpen, onClose }) {
  const [images, setImages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeout = useRef(null)
  const loadMoreThreshold = 5

  // Fetch initial images
  useEffect(() => {
    if (isOpen) {
      const initializeSlideshow = async () => {
        setIsLoading(true)
        try {
          const initialImages = await dogApi.getMultipleRandomImages(10)
          if (initialImages && initialImages.length > 0) {
            setImages(initialImages)
            setCurrentIndex(0)
          }
        } catch (error) {
          console.error('Error loading initial images:', error)
        } finally {
          setIsLoading(false)
        }
      }
      initializeSlideshow()
    }
    return () => {
      setImages([])
      setCurrentIndex(0)
    }
  }, [isOpen])

  // Auto-advance slides when playing
  useEffect(() => {
    if (!isPlaying || images.length === 0) return

    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [isPlaying, currentIndex, images.length])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen || images.length === 0) return
      
      switch (e.key) {
        case 'ArrowLeft':
          previousSlide()
          break
        case 'ArrowRight':
          nextSlide()
          break
        case ' ':
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'Escape':
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, images.length])

  // Mouse movement controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current)
      }
    }
  }, [isOpen])

  // Load more images when approaching the end
  useEffect(() => {
    if (!isLoading && images.length > 0 && currentIndex >= images.length - loadMoreThreshold) {
      loadMoreImages()
    }
  }, [currentIndex, images.length, isLoading])

  const loadMoreImages = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const newImages = await dogApi.getMultipleRandomImages(10)
      if (newImages && newImages.length > 0) {
        setImages(prev => [...prev, ...newImages])
      }
    } catch (error) {
      console.error('Error loading more images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex(prev => (prev + 1) % images.length)
  }, [images.length])

  const previousSlide = useCallback(() => {
    if (images.length === 0) return
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Main image display */}
      <div className="relative h-full w-full">
        {isLoading && images.length === 0 ? (
          // Initial loading state
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              {images[currentIndex] && (
                <motion.img
                  key={images[currentIndex]}
                  src={images[currentIndex]}
                  alt={`Slide ${currentIndex + 1}`}
                  className="absolute inset-0 h-full w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </AnimatePresence>

            {/* Loading indicator for subsequent loads */}
            {isLoading && (
              <div className="absolute bottom-4 right-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            )}

            {/* Controls overlay */}
            {images.length > 0 && (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-between p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Previous button */}
                  <button
                    onClick={previousSlide}
                    className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                  >
                    <ArrowLeftIcon className="h-8 w-8" />
                  </button>

                  {/* Next button */}
                  <button
                    onClick={nextSlide}
                    className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                  >
                    <ArrowRightIcon className="h-8 w-8" />
                  </button>
                </motion.div>

                {/* Top controls */}
                <motion.div
                  className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Play/Pause button */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </button>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="rounded-full bg-black/50 p-2 text-white hover:bg-black/75"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </motion.div>

                {/* Image counter */}
                <motion.div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showControls ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentIndex + 1} / {images.length}
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
} 