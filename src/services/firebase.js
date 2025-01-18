import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFk2hHAdaEeDxFAuH8nadhMRUfxfYnnjQ",
  authDomain: "dogsite-73c6f.firebaseapp.com",
  projectId: "dogsite-73c6f",
  storageBucket: "dogsite-73c6f.firebasestorage.app",
  messagingSenderId: "210221942693",
  appId: "1:210221942693:web:f8d06a1b3a40823e2f8a4c",
  measurementId: "G-0CS4GMLRDS"
};

/*
Required Firestore Rules (paste in Firebase Console):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
*/

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
const initializeAnalytics = async () => {
  try {
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      return getAnalytics(app);
    }
  } catch (error) {
    console.log('Analytics not supported in this environment');
  }
  return null;
};

// Initialize analytics if in browser environment
if (typeof window !== 'undefined') {
  initializeAnalytics();
}

// Initialize Firestore
export const db = getFirestore(app);

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Helper function to handle Firestore errors
const handleFirestoreError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  // Check if error is due to permissions
  if (error.code === 'permission-denied') {
    console.error('Please ensure Firestore rules are properly configured. See comment at top of file.');
  }
  return null;
};

export const firebaseService = {
  async getCachedData(collection_name, doc_id) {
    try {
      const docRef = doc(db, collection_name, doc_id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Return the entire document data
        return docSnap.data();
      }
      return null;
    } catch (error) {
      return handleFirestoreError(error, 'getting cached data');
    }
  },

  async setCachedData(collection_name, doc_id, data) {
    try {
      const docRef = doc(db, collection_name, doc_id);
      // Save data exactly as provided
      await setDoc(docRef, data);
      return true;
    } catch (error) {
      return handleFirestoreError(error, 'setting cached data');
    }
  },

  async getCachedBreedInfo(breed, subBreed = null) {
    const collection_name = 'breeds';
    const doc_id = subBreed ? `${breed}_${subBreed}` : breed;
    return this.getCachedData(collection_name, doc_id);
  },

  async setCachedBreedInfo(breed, info, subBreed = null) {
    const collection_name = 'breeds';
    const doc_id = subBreed ? `${breed}_${subBreed}` : breed;
    return this.setCachedData(collection_name, doc_id, info);
  },

  async getCachedDogFacts() {
    return this.getCachedData('facts', 'dog_facts');
  },

  async setCachedDogFacts(facts) {
    return this.setCachedData('facts', 'dog_facts', facts);
  },

  async getCachedFactDetails(factId) {
    return this.getCachedData('fact_details', factId);
  },

  async setCachedFactDetails(factId, details) {
    return this.setCachedData('fact_details', factId, details);
  },

  async getAllPosts() {
    try {
      const postsRef = collection(db, 'blog_details');
      const querySnapshot = await getDocs(postsRef);
      
      const posts = [];
      querySnapshot.forEach((doc) => {
        // Each document has a content property containing the post data
        const postData = doc.data()?.content;
        if (postData) {
          posts.push(postData);
        }
      });
      
      return posts;
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  },

  async getShopProducts(category = 'all') {
    try {
      const productsRef = collection(db, 'shop_products');
      let q = productsRef;
      
      if (category !== 'all') {
        q = query(productsRef, where('category', '==', category));
      }
      
      const snapshot = await getDocs(q);
      const products = [];
      
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      return products.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting shop products:', error);
      return [];
    }
  },

  async addShopProduct(product) {
    try {
      const productRef = doc(db, 'shop_products', product.id);
      await setDoc(productRef, {
        ...product,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error adding product:', error);
      return false;
    }
  }
}; 