import { firebaseService } from '../src/services/firebase.js';
import { geminiService } from '../src/services/geminiAI.js';
import { dogApi } from '../src/services/dogApi.js';
import fs from 'fs/promises';

const TOTAL_BLOG_POSTS = 100; // Increased to accommodate more topics
const SUCCESS_DELAY = 60000; // 1 minute delay after success
const ERROR_DELAY = 5000;   // 5 seconds delay after error

// Add this function to convert titles to URL-friendly slugs
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();                  // Trim hyphens from start and end
}

// Function to load and parse product data
async function loadProductData() {
  try {
    const productData = await fs.readFile('product-summary.json', 'utf-8');
    return JSON.parse(productData);
  } catch (error) {
    console.error('Error loading product data:', error);
    return [];
  }
}

// Function to select relevant products for a topic
function selectRelevantProducts(products, topic) {
  const topicLower = topic.toLowerCase();
  let relevantProducts = [];
  
  // Define topic-related keywords with broader categories and synonyms
  const keywordMap = {
    'training': ['puzzle', 'treat', 'interactive', 'game', 'training', 'learn', 'teach', 'behavior', 'exercise', 'play', 'stimulation', 'mental', 'activity'],
    'toys': ['toy', 'ball', 'chew', 'play', 'game', 'fun', 'entertainment', 'interactive', 'puzzle', 'activity', 'stimulation', 'exercise'],
    'food': ['food', 'treat', 'feeder', 'nutrition', 'feeding', 'diet', 'eat', 'meal', 'snack', 'bowl', 'health', 'supplement'],
    'grooming': ['brush', 'shampoo', 'grooming', 'cleaning', 'bath', 'care', 'hygiene', 'maintenance', 'fur', 'coat', 'nail', 'dental'],
    'health': ['health', 'care', 'medical', 'wellness', 'supplement', 'safety', 'protection', 'hygiene', 'treatment', 'prevention'],
    'accessories': ['collar', 'leash', 'harness', 'bed', 'crate', 'carrier', 'bowl', 'tag', 'gear', 'equipment', 'supplies', 'essential']
  };

  // Score each product's relevance to the topic
  const scoredProducts = products.map(product => {
    let score = 0;
    const productText = (product.title + ' ' + (product.category || '')).toLowerCase();

    // Check direct category matches
    Object.entries(keywordMap).forEach(([category, keywords]) => {
      // Direct category match gives high score
      if (topicLower.includes(category)) {
        score += 5;
      }

      // Check for keyword matches in topic
      keywords.forEach(keyword => {
        if (topicLower.includes(keyword)) {
          score += 3;
        }
        // Check for keyword matches in product title/category
        if (productText.includes(keyword)) {
          score += 2;
        }
      });
    });

    // Additional scoring for breed-specific topics
    if (topicLower.includes('breed') || topicLower.includes('puppy')) {
      score += 2; // Boost score for general dog products
    }

    // Boost score for high-rated products
    const rating = parseFloat(product.rating) || 0;
    const reviews = parseInt(product.reviews) || 0;
    score += (rating * 0.5) + (Math.min(reviews, 100) / 20);

    return { ...product, relevanceScore: score };
  });

  // Sort by relevance score and select top products
  relevantProducts = scoredProducts
    .filter(p => p.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  // If no products found with scores, select random products as fallback
  if (relevantProducts.length === 0) {
    console.log('No highly relevant products found, selecting diverse recommendations...');
    const categories = Object.keys(keywordMap);
    const shuffledProducts = [...products].sort(() => Math.random() - 0.5);
    
    // Try to get one product from each major category
    categories.forEach(category => {
      if (relevantProducts.length >= 5) return;
      
      const productFromCategory = shuffledProducts.find(p => 
        !relevantProducts.includes(p) && 
        (p.category === category || p.title.toLowerCase().includes(category))
      );
      
      if (productFromCategory) {
        relevantProducts.push(productFromCategory);
      }
    });

    // If still need more products, add random ones
    while (relevantProducts.length < 3) {
      const randomProduct = shuffledProducts.find(p => !relevantProducts.includes(p));
      if (randomProduct) {
        relevantProducts.push(randomProduct);
      } else {
        break;
      }
    }
  }

  // Log the matching process
  console.log(`Topic: "${topic}"`);
  console.log(`Found ${relevantProducts.length} relevant products:`);
  relevantProducts.forEach((p, i) => {
    const score = p.relevanceScore ? `(score: ${p.relevanceScore.toFixed(2)})` : '(fallback)';
    console.log(`${i + 1}. ${p.title} ${score}`);
  });

  return relevantProducts;
}

// Function to delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateAndCacheBlogPosts() {
  console.log('Starting blog post generation...');
  
  // Load product data
  console.log('Loading product data...');
  const products = await loadProductData();
  console.log(`Loaded ${products.length} products`);
  
  const topics = [
    // Dog Breeds and Characteristics
    'Top 10 Most Popular Dog Breeds in 2025',
    'Rare and Exotic Dog Breeds: What You Need to Know',
    'Understanding Mixed Breed Dogs: Benefits and Challenges',
    'Hypoallergenic Dog Breeds for Allergy Sufferers',
    'Small Dog Breeds Perfect for Apartment Living',
    'Large Dog Breeds Suited for Families with Children',
    'Intelligent Dog Breeds: Top Picks for Training Enthusiasts',
    'Low-Maintenance Dog Breeds for Busy Owners',
    'Guard Dog Breeds: Protecting Your Home and Family',
    'Dog Breeds with Long Lifespans: Companions for the Long Haul',

    // Dog Training and Behavior
    'How to Train Your Puppy: A Beginner\'s Guide',
    'Understanding Canine Body Language: What Your Dog Is Telling You',
    'The Benefits of Positive Reinforcement in Dog Training',
    'Common Dog Behavior Problems and How to Fix Them',
    'Crate Training: Making It a Positive Experience',
    'Socializing Your Dog: Tips for a Well-Adjusted Pet',
    'Leash Training: Teaching Your Dog to Walk Politely',
    'House Training a Puppy: Effective Methods and Tips',
    'Dealing with Separation Anxiety in Dogs',
    'Clicker Training for Dogs: How It Works and Its Benefits',

    // Dog Health and Wellness
    'Common Health Issues in Dogs and How to Prevent Them',
    'The Importance of Regular Vet Check-Ups',
    'Vaccination Schedule for Puppies and Adult Dogs',
    'Recognizing and Treating Allergies in Dogs',
    'Dental Care for Dogs: Keeping Those Canines Clean',
    'Nutrition Tips for a Healthy Dog Diet',
    'The Rise of Pet Obesity: Causes and Solutions',
    'Mental Stimulation: Keeping Your Dog\'s Mind Sharp',
    'The Benefits of Regular Exercise for Dogs',
    'Alternative Therapies for Dogs: Acupuncture, Massage, and More',

    // Dog Nutrition and Diet
    'Raw Food Diets for Dogs: Pros and Cons',
    'Grain-Free Dog Foods: Are They Really Better?',
    'Homemade Dog Food Recipes: Healthy and Affordable',
    'Understanding Dog Food Labels: What to Look For',
    'Supplements for Dogs: What You Should Know',
    'Human Foods That Are Safe (and Unsafe) for Dogs',
    'The Impact of Diet on Dog Behavior',
    'Feeding Senior Dogs: Adjusting Diet for Aging Pets',
    'Dealing with Picky Eaters: Encouraging Your Dog to Eat',
    'The Role of Probiotics in Canine Health',

    // Dog Grooming and Care
    'DIY Dog Grooming: Tips and Tools for Home Grooming',
    'Choosing the Right Groomer for Your Dog',
    'Seasonal Grooming Tips: Keeping Your Dog Comfortable Year-Round',
    'Dealing with Shedding: How to Manage Dog Hair',
    'Bathing Your Dog: How Often and Best Practices',
    'Nail Trimming: Keeping Your Dog\'s Paws Healthy',
    'Ear Cleaning: Preventing Infections and Maintaining Health',
    'Dental Hygiene: Brushing Your Dog\'s Teeth',
    'Skin Care for Dogs: Preventing and Treating Issues',
    'Grooming Tools Every Dog Owner Should Have',

    // Dog Safety and Regulations
    'Understanding Dog Leash Laws in Your Area',
    'Traveling with Your Dog: Safety Tips and Regulations',
    'Pet Insurance: Is It Worth the Investment?',
    'Microchipping Your Dog: Benefits and Considerations',
    'Recognizing and Reporting Animal Cruelty',
    'Preparing for Natural Disasters: Keeping Your Dog Safe',
    'Dog Park Etiquette: Ensuring a Positive Experience',
    'Understanding Breed-Specific Legislation',
    'Pet Theft Prevention: Protecting Your Dog',
    'Licensing and Registration: What Dog Owners Need to Know',

    // Dog Products and Accessories
    'Top Dog Toys of 2025: Keeping Your Pet Entertained',
    'Essential Dog Products Every Owner Needs',
    'Choosing the Right Dog Bed: A Buyer\'s Guide',
    'Dog Harnesses vs Collars: Which is Better?',
    'Best Dog Food Brands: A Comprehensive Review',
    'Tech Gadgets for Dogs: What\'s Worth Buying',
    'Dog Training Tools: What Really Works',
    'Eco-Friendly Dog Products: Sustainable Choices',
    'Dog Fashion Trends: Practical and Stylish Choices',
    'Smart Home Devices for Dog Owners'
  ];

  try {
    const posts = [];
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 3;

    for (let i = 0; i < Math.min(TOTAL_BLOG_POSTS, topics.length); i++) {
      const topic = topics[i];
      console.log(`\nGenerating blog post ${i + 1}/${Math.min(TOTAL_BLOG_POSTS, topics.length)}: ${topic}`);
      
      try {
        // Select relevant products for this topic
        const relevantProducts = selectRelevantProducts(products, topic);
        console.log(`Selected ${relevantProducts.length} relevant products for topic`);

        // Generate blog post with product recommendations
        const blogContent = await geminiService.generateBlogPost(topic, relevantProducts);
        if (!blogContent) {
          console.warn('No content generated for this topic, skipping...');
          consecutiveFailures++;
          await delay(ERROR_DELAY);
          continue;
        }
      
        const image = await dogApi.getRandomImage();
        const slug = createSlug(topic);
      
      const post = {
          id: slug,
        ...blogContent,
        image: image,
          timestamp: Date.now(),
          slug: slug
        };
        
        posts.push(post);
        console.log(`Generated blog post: ${post.title}`);

        // Save individual post
        await firebaseService.setCachedData('blog_details', post.id, {
          content: post,
          timestamp: Date.now()
        });

        console.log(`\nSuccessfully saved post to Firebase. Waiting for 1 minute before next generation...`);
        
        // Reset consecutive failures counter on success
        consecutiveFailures = 0;

        // Add a longer delay after successful generation and save
        await delay(SUCCESS_DELAY);

      } catch (error) {
        console.error(`Error generating post for topic "${topic}":`, error.message);
        consecutiveFailures++;
        
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.error(`\nStopping after ${maxConsecutiveFailures} consecutive failures.`);
          break;
        }
        
        // Add a shorter delay after an error
        console.log(`Waiting ${ERROR_DELAY/1000} seconds before retrying...`);
        await delay(ERROR_DELAY);
        continue;
      }
    }
    
    if (posts.length > 0) {
      // Save all posts
      await firebaseService.setCachedData('blog', 'posts', {
        content: {
          posts: posts,
          timestamp: Date.now()
        }
      });
      console.log(`\nSuccessfully generated and cached ${posts.length} blog posts!`);
    } else {
      console.error('\nNo posts were generated successfully.');
    }
  } catch (error) {
    console.error('\nError in blog post generation process:', error);
    throw error;
  }
}

generateAndCacheBlogPosts().catch(console.error); 