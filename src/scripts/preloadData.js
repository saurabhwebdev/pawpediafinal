import { firebaseService } from '../services/firebase';
import { geminiService } from '../services/geminiAI';
import { dogApi } from '../services/dogApi';

const TOTAL_FACTS = 50; // Number of facts to generate
const TOTAL_BLOG_POSTS = 20; // Number of blog posts to generate

async function generateAndCacheFacts() {
  console.log('Generating and caching dog facts...');
  const facts = await geminiService.generateDogFacts(TOTAL_FACTS);
  
  if (facts) {
    await firebaseService.setCachedDogFacts(facts);
    
    // Generate and cache details for each fact
    for (const fact of facts) {
      const factId = encodeURIComponent(fact);
      const details = await geminiService.generateDogFactDetails(fact);
      if (details) {
        await firebaseService.setCachedFactDetails(factId, details);
      }
    }
  }
}

async function generateAndCacheBlogPosts() {
  console.log('Generating and caching blog posts...');
  const topics = [
    'Dog Training Tips',
    'Dog Health and Wellness',
    'Dog Behavior Understanding',
    'Dog Nutrition Guide',
    'Dog Grooming Tips',
    'Dog Exercise and Activities',
    'Dog Mental Stimulation',
    'Dog Socialization',
    'Dog First Aid',
    'Dog Travel Tips'
  ];

  const posts = [];
  for (const topic of topics) {
    const post = await geminiService.generateBlogPost(topic);
    if (post) {
      // Get a random dog image for the blog post
      const image = await dogApi.getRandomImage();
      post.image = image;
      post.timestamp = Date.now();
      posts.push(post);
    }
  }

  if (posts.length > 0) {
    await firebaseService.setCachedData('blog', 'posts', posts);
  }
}

export async function preloadAllData() {
  try {
    await generateAndCacheFacts();
    await generateAndCacheBlogPosts();
    console.log('Data preloading completed successfully!');
  } catch (error) {
    console.error('Error preloading data:', error);
  }
} 