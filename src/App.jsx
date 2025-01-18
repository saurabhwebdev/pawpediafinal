import { Routes, Route } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Breeds from './pages/Breeds'
import BreedDetails from './pages/BreedDetails'
import SubBreeds from './pages/SubBreeds'
import SubBreedDetails from './pages/SubBreedDetails'
import RandomDog from './pages/RandomDog'
import DogFacts from './pages/DogFacts'
import DogFactDetails from './pages/DogFactDetails'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Security from './pages/Security'
import Shop from './pages/Shop'

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Helmet>
            <title>PawPedia - Your Ultimate Guide to Dogs</title>
            <meta name="description" content="Discover everything about different dog breeds, their characteristics, and beautiful photos. Your comprehensive guide to the world of dogs." />
            <meta name="keywords" content="dogs, dog breeds, puppies, canine, pet information, dog photos, dog breeds directory, dog sub-breeds, dog facts, dog care, dog training, dog blog" />
            <link rel="canonical" href="https://www.pawpedia.xyz/" />
            <meta property="og:title" content="PawPedia - Your Ultimate Guide to Dogs" />
            <meta property="og:description" content="Discover everything about different dog breeds, their characteristics, and beautiful photos." />
            <meta property="og:url" content="https://www.pawpedia.xyz/" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="robots" content="index, follow" />
            <meta name="googlebot" content="index, follow" />
          </Helmet>

          <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/breeds" element={<Breeds />} />
                <Route path="/breeds/:breedId" element={<BreedDetails />} />
                <Route path="/sub-breeds" element={<SubBreeds />} />
                <Route path="/breeds/:breedId/:subBreedId" element={<SubBreedDetails />} />
                <Route path="/random" element={<RandomDog />} />
                <Route path="/facts" element={<DogFacts />} />
                <Route path="/facts/:factId" element={<DogFactDetails />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/security" element={<Security />} />
                <Route path="/shop" element={<Shop />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  )
}

export default App
