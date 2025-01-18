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

async function saveProductsToFirebase(products) {
  let successCount = 0;
  
  for (const product of products) {
    try {
      await firebaseService.addShopProduct(product);
      successCount++;
      console.log(`Saved product: ${product.title}`);
    } catch (error) {
      console.error(`Failed to save product: ${product.title}`, error);
    }
  }

  console.log(`Successfully saved ${successCount} out of ${products.length} products to Firebase`);
}

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