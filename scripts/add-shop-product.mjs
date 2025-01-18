import { firebaseService } from '../src/services/firebase.js';
import readline from 'readline';
import { v4 as uuidv4 } from 'uuid';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function addProduct() {
  try {
    console.log('\n=== Add New Shop Product ===\n');

    const product = {
      id: uuidv4(),
      title: await question('Product Title: '),
      price: await question('Price (in ₹): '),
      description: await question('Product Description: '),
      image: await question('Image URL: '),
      affiliateLink: await question('Amazon Affiliate Link (from SiteStripe): '),
      category: await question('Category (food/toys/accessories/grooming/health): '),
      rating: await question('Rating (1-5): '),
      reviews: await question('Number of Reviews: '),
      inStock: (await question('In Stock? (y/n): ')).toLowerCase() === 'y'
    };

    await firebaseService.addShopProduct(product);
    console.log('\nProduct added successfully!');

    const addAnother = await question('\nAdd another product? (y/n): ');
    if (addAnother.toLowerCase() === 'y') {
      await addProduct();
    } else {
      rl.close();
    }
  } catch (error) {
    console.error('Error adding product:', error);
    rl.close();
  }
}

addProduct(); 