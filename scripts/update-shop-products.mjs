import { firebaseService } from '../src/services/firebase.js';
import { amazonApi } from '../src/services/amazonApi.js';
import dotenv from 'dotenv';

dotenv.config();

const CATEGORIES = {
  food: 'B08VB2QGN3',  // Popular dog food in India
  toys: 'B08YRJF8D9',  // Popular dog toy
  accessories: 'B09B125XPN',
  grooming: 'B08HHML7VG',
  health: 'B07WRBG9BV'
};

async function updateShopProducts() {
  try {
    console.log('Starting shop products update...');

    for (const [category, asin] of Object.entries(CATEGORIES)) {
      console.log(`Fetching ${category} products...`);
      
      const products = await amazonApi.getRelatedProducts(asin);
      
      // Save to Firebase
      await firebaseService.setCachedData('shop', category, {
        content: products,
        timestamp: Date.now()
      });
      
      console.log(`Saved ${products.length} ${category} products`);
    }

    console.log('Shop products update completed!');
  } catch (error) {
    console.error('Error updating shop products:', error);
    process.exit(1);
  }
}

updateShopProducts(); 