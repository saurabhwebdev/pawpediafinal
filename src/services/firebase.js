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

const db = getFirestore(app);

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
        const data = docSnap.data();
        // Check if cache is expired
        if (data.timestamp && Date.now() - data.timestamp < CACHE_EXPIRATION) {
          return data.content;
        }
      }
      return null;
    } catch (error) {
      return handleFirestoreError(error, 'getting cached data');
    }
  },

  async setCachedData(collection_name, doc_id, content) {
    try {
      const docRef = doc(db, collection_name, doc_id);
      await setDoc(docRef, {
        content,
        timestamp: Date.now()
      });
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
  }
}; 