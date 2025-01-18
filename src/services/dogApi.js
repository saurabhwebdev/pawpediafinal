import axios from 'axios';

const BASE_URL = 'https://dog.ceo/api';

export const dogApi = {
  // Breed List Endpoints
  getAllBreeds: async () => {
    const response = await axios.get(`${BASE_URL}/breeds/list/all`);
    return response.data.message;
  },

  // Random Images Endpoints
  getRandomImage: async () => {
    const response = await axios.get(`${BASE_URL}/breeds/image/random`);
    return response.data.message;
  },

  getMultipleRandomImages: async (count = 1) => {
    const response = await axios.get(`${BASE_URL}/breeds/image/random/${count}`);
    return response.data.message;
  },

  // Breed Images Endpoints
  getBreedImages: async (breed) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/images`);
    return response.data.message;
  },

  getBreedRandomImage: async (breed) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/images/random`);
    return response.data.message;
  },

  getMultipleBreedRandomImages: async (breed, count = 1) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/images/random/${count}`);
    return response.data.message;
  },

  // Sub-Breed Endpoints
  getSubBreeds: async (breed) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/list`);
    return response.data.message;
  },

  getSubBreedImages: async (breed, subBreed) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/${subBreed}/images`);
    return response.data.message;
  },

  getSubBreedRandomImage: async (breed, subBreed) => {
    const response = await axios.get(`${BASE_URL}/breed/${breed}/${subBreed}/images/random`);
    return response.data.message;
  },

  // Helper Functions
  searchBreeds: async (query) => {
    const breeds = await dogApi.getAllBreeds();
    const searchResults = [];
    
    for (const [breed, subBreeds] of Object.entries(breeds)) {
      if (breed.toLowerCase().includes(query.toLowerCase())) {
        const image = await dogApi.getBreedRandomImage(breed);
        searchResults.push({
          type: 'breed',
          name: breed,
          subBreeds,
          image
        });
      }
      
      for (const subBreed of subBreeds) {
        if (subBreed.toLowerCase().includes(query.toLowerCase())) {
          const image = await dogApi.getSubBreedRandomImage(breed, subBreed);
          searchResults.push({
            type: 'sub-breed',
            name: subBreed,
            parentBreed: breed,
            image
          });
        }
      }
    }
    
    return searchResults;
  }
}; 