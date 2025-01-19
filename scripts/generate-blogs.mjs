import { firebaseService } from '../src/services/firebase.js';
import { geminiService } from '../src/services/geminiAI.js';
import { dogApi } from '../src/services/dogApi.js';

const TOTAL_BLOG_POSTS = 100; // Increased to accommodate more topics

// Add this function to convert titles to URL-friendly slugs
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();                  // Trim hyphens from start and end
}

async function generateAndCacheBlogPosts() {
  console.log('Starting blog post generation...');
  
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

    for (let i = 0; i < Math.min(TOTAL_BLOG_POSTS, topics.length); i++) {
      const topic = topics[i];
      console.log(`Generating blog post ${i + 1}/${Math.min(TOTAL_BLOG_POSTS, topics.length)}: ${topic}`);
      
      try {
        const blogContent = await geminiService.generateBlogPost(topic);
        if (!blogContent) continue;
      
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

        await firebaseService.setCachedData('blog_details', post.id, {
          content: post,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error(`Error generating post for topic ${topic}:`, error);
        continue;
      }
    }
    
    if (posts.length > 0) {
      await firebaseService.setCachedData('blog', 'posts', {
        content: {
          posts: posts,
          timestamp: Date.now()
        }
      });
      console.log(`Successfully generated and cached ${posts.length} blog posts!`);
    } else {
      console.error('No posts were generated successfully.');
    }
  } catch (error) {
    console.error('Error in blog post generation process:', error);
    throw error;
  }
}

generateAndCacheBlogPosts().catch(console.error); 