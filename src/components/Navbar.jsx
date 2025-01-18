import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, PlayIcon } from '@heroicons/react/24/outline'
import DarkModeToggle from './DarkModeToggle'
import Slideshow from './Slideshow'
import { dogApi } from '../services/dogApi'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Breeds', href: '/breeds' },
  { name: 'Sub-Breeds', href: '/sub-breeds' },
  { name: 'Random Dog', href: '/random' },
  { name: 'Blog', href: '/blog' },
  { name: 'Shop', href: '/shop' },
  { name: 'Dog Facts', href: '/facts' }
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const startSlideshow = async () => {
    setLoading(true)
    try {
      const newImages = await dogApi.getMultipleRandomImages(10)
      setImages(newImages)
      setIsOpen(true)
    } catch (error) {
      console.error('Error fetching images:', error)
    }
    setLoading(false)
  }

  return (
    <Disclosure as="nav" className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' : 'bg-white dark:bg-gray-900'
    }`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center"
              >
                <Link to="/" className="flex items-center space-x-3">
                  <img src="/pawprint.svg" alt="PawPedia Logo" className="h-8 w-8 dark:invert" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">PawPedia</span>
                </Link>
              </motion.div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                        isActive
                          ? 'border-indigo-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <button
                  onClick={startSlideshow}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <PlayIcon className="h-6 w-6" />
                </button>
                <DarkModeToggle />
              </div>

              <div className="flex items-center sm:hidden">
                <button
                  onClick={startSlideshow}
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <PlayIcon className="h-6 w-6" />
                </button>
                <DarkModeToggle />
                <Disclosure.Button className="ml-4 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1 pb-3 pt-2"
            >
              {navigation.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href));

                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={`block py-2 pl-3 pr-4 text-base font-medium ${
                      isActive
                        ? 'bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 dark:bg-gray-800 dark:text-indigo-400'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </motion.div>
          </Disclosure.Panel>

          {isOpen && (
            <Slideshow
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              images={images}
            />
          )}
        </>
      )}
    </Disclosure>
  )
} 