import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { firebaseService } from '../src/services/firebase.js';
import dotenv from 'dotenv';
import os from 'os';
import path from 'path';

dotenv.config();

const AMAZON_CATEGORIES = {
  food: 'dog food',
  toys: 'dog toys',
  accessories: 'dog accessories',
  grooming: 'dog grooming supplies',
  health: 'dog health supplies'
};

async function fetchProductsFromAmazon(category, searchTerm) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: [
        '--start-maximized', 
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    const PRODUCTS_LIMIT = 50;

    try {
      const pageUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchTerm)}&ref=nb_sb_noss`;
      console.log(`\nFetching products...`);
      await page.goto(pageUrl, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      console.log('\nBrowser is open. Please:');
      console.log('1. Log in to your Amazon account if needed');
      console.log('2. Enable SiteStripe if not already enabled');
      console.log('3. Press Enter when ready to continue...');
      await new Promise(resolve => process.stdin.once('data', resolve));

      await page.waitForSelector('.s-main-slot', { timeout: 60000 });
      await page.waitForTimeout(3000);
      
      console.log('Scrolling page...');
      await autoScroll(page);
      await page.waitForTimeout(2000);

      console.log('Extracting product data...');
      const products = await page.evaluate(() => {
        const productSelectors = [
          '.s-result-item[data-asin]:not([data-asin=""])',
          '[data-component-type="s-search-result"]',
          '.sg-col-4-of-12',
          '.s-asin'
        ];
        
        let items = [];
        for (const selector of productSelectors) {
          items = Array.from(document.querySelectorAll(selector));
          if (items.length > 0) break;
        }

        // Limit to first 50 items
        items = items.slice(0, 50);

        return items.map((item, index) => {
          try {
            const titleEl = item.querySelector('h2 a, h2 span, .a-link-normal.a-text-normal');
            const priceEl = item.querySelector('.a-price .a-offscreen, .a-price-whole');
            const ratingEl = item.querySelector('[class*="star"], [class*="Star"]');
            const reviewsEl = item.querySelector('[aria-label*="stars"], [aria-label*="Stars"], .a-size-base.s-underline-text');
            const imageEl = item.querySelector('img.s-image, .s-product-image-container img');
            const linkEl = item.querySelector('a.a-link-normal[href*="/dp/"], a.a-link-normal[href*="/gp/"]');
            const asin = item.getAttribute('data-asin') || linkEl?.href?.match(/\/([A-Z0-9]{10})(\/|$)/)?.[1];

            if (!titleEl || !priceEl || !imageEl || !linkEl) return null;

            return {
              asin,
              title: titleEl.textContent.trim(),
              price: priceEl.textContent.replace(/[^0-9]/g, ''),
              rating: ratingEl?.getAttribute('aria-label')?.match(/\d+(\.\d+)?/)?.[0] || '4',
              reviews: reviewsEl?.textContent?.match(/\d+/)?.[0] || '0',
              image: imageEl.src,
              affiliateLink: linkEl.href,
              description: titleEl.textContent.trim()
            };
          } catch (error) {
            return null;
          }
        }).filter(item => item && item.title && item.price && item.image);
      });

      const finalProducts = products.map(product => ({
        ...product,
        id: uuidv4(),
        category,
        inStock: true,
        timestamp: Date.now()
      }));

      console.log(`\nTotal products collected: ${finalProducts.length}`);
      console.log('\nProducts found:');
      finalProducts.forEach((p, i) => console.log(`${i + 1}. ${p.title}`));
      
      console.log('\nPlease use SiteStripe to generate affiliate links for these products.');
      console.log('Press Enter when done...');
      await new Promise(resolve => process.stdin.once('data', resolve));

      return finalProducts;

    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  } catch (error) {
    console.error('\nError:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to scroll page
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function saveProductsToFile(products, filename) {
  await fs.writeFile(filename, JSON.stringify(products, null, 2));
  console.log(`Saved ${products.length} products to ${filename}`);
}

function validateProduct(product) {
  const required = ['id', 'title', 'price', 'image', 'category', 'description'];
  const missing = required.filter(field => !product[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  // Validate data types
  if (typeof product.price !== 'string' || !/^\d+$/.test(product.price)) {
    throw new Error('Price must be a string of digits');
  }
  
  if (!['food', 'toys', 'accessories', 'grooming', 'health'].includes(product.category)) {
    throw new Error('Invalid category');
  }
  
  return true;
}

async function saveProductsToFirebase(products) {
  let successCount = 0;
  const errors = [];
  
  console.log(`\nSaving ${products.length} products to Firebase...`);
  
  // First, save each product individually
  for (const product of products) {
    try {
      // Save individual product
      await firebaseService.setCachedData('shop_products', product.id, {
        content: product,
        timestamp: Date.now()
      });
      
      successCount++;
      console.log(`✓ Saved product: ${product.title}`);
    } catch (error) {
      errors.push({ product: product.title, error: error.message });
      console.error(`✗ Failed to save product: ${product.title}`);
      console.error(`  Error: ${error.message}`);
    }
  }

  // Then save the full product list
  try {
    await firebaseService.setCachedData('shop', 'products', {
      content: {
        products: products,
        timestamp: Date.now()
      }
    });
    console.log('✓ Saved complete product list');
  } catch (error) {
    console.error('✗ Failed to save complete product list:', error.message);
  }

  // Summary
  console.log('\n=== Save Summary ===');
  console.log(`Successfully saved: ${successCount}/${products.length} products`);
  
  if (errors.length > 0) {
    console.log('\nFailed products:');
    errors.forEach(({ product, error }) => {
      console.log(`- ${product}: ${error}`);
    });
  }

  return successCount;
}

// Add this new function to create a summary
async function createProductSummary(products, filename = 'product-summary.json') {
  const summary = products.map(product => ({
    title: product.title,
    price: `₹${product.price}`,
    category: product.category,
    rating: `${product.rating}/5`,
    reviews: product.reviews,
    link: product.affiliateLink
  }));

  // Create a formatted string for console output
  const consoleOutput = summary.map((item, index) => `
Product ${index + 1}:
  Title: ${item.title}
  Price: ${item.price}
  Category: ${item.category}
  Rating: ${item.rating} (${item.reviews} reviews)
  Link: ${item.link}
`).join('\n');

  // Save formatted JSON
  const jsonContent = JSON.stringify(summary, null, 2);
  await fs.writeFile(filename, jsonContent);

  // Print to console
  console.log('\n=== Product Summary ===');
  console.log(consoleOutput);
  console.log(`Summary saved to ${filename}`);
}

// Modify the main function to include summary creation
async function main() {
  try {
    const allProducts = [];
    const categoryArg = process.argv.find((arg, index) => 
      process.argv[index - 1] === '--category'
    );

    if (categoryArg) {
      // Fetch single category
      const searchTerm = AMAZON_CATEGORIES[categoryArg] || categoryArg;
      console.log(`Fetching products for search term: ${searchTerm}`);
      const products = await fetchProductsFromAmazon(categoryArg, searchTerm);
      allProducts.push(...products);
    } else {
      // Fetch all categories
      for (const [category, searchTerm] of Object.entries(AMAZON_CATEGORIES)) {
        console.log(`Fetching ${category} products...`);
        const products = await fetchProductsFromAmazon(category, searchTerm);
        allProducts.push(...products);
        
        // Wait between categories to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Save to JSON file
    await saveProductsToFile(allProducts, 'products.json');

    // Save to Firebase
    await saveProductsToFirebase(allProducts);

    // Create and save summary
    await createProductSummary(allProducts);

  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Add command line arguments support
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
Usage: npm run fetch-products [options]

Options:
  --category <name>   Fetch products for specific category (food, toys, accessories, grooming, health)
                     or use custom search term
  --limit <number>    Limit number of products per category
  --save-only        Only save existing products.json to Firebase
  --help             Show this help message

Examples:
  npm run fetch-products                    # Fetch all categories
  npm run fetch-products -- --category food # Fetch only dog food
  npm run fetch-products -- --category "dog chew toys" # Custom search
  `);
  process.exit(0);
}

if (args.includes('--save-only')) {
  const products = JSON.parse(await fs.readFile('products.json', 'utf-8'));
  await saveProductsToFirebase(products);
} else {
  main();
} 