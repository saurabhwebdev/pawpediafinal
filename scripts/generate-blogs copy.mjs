import { firebaseService } from '../src/services/firebase.js';
import { geminiService } from '../src/services/geminiAI.js';
import { dogApi } from '../src/services/dogApi.js';

const TOTAL_BLOG_POSTS = 50;

async function generateAndCacheBlogPosts() {
  console.log('Starting blog post generation...');
  
  const topics = [
    'Top 10 Most Popular Dog Breeds in 2025',
    'How to Train Your Puppy: A Beginner\'s Guide',
    'Understanding Canine Body Language: What Your Dog Is Telling You',
    'The Benefits of Positive Reinforcement in Dog Training',
    'Best Dog Training Collars: Reviews and Recommendations',
    'Puppy Socialization: Tips and Techniques',
    'Service Dog Training: Steps to Certify Your Dog',
    'Crate Training for Puppies: Dos and Don\'ts',
    'Dog Obedience Training: Essential Commands Every Dog Should Know',
    'Managing Aggression in Dogs: Causes and Solutions',
    'Clicker Training for Dogs: How It Works and Its Benefits',
    'Therapy Dog Training: How to Get Started',
    'Agility Training for Dogs: Building an Obstacle Course at Home',
    'Puppy Leash Training: Teaching Your Dog to Walk Politely',
    'House Training a Puppy: Effective Methods and Tips',
    'Dog Behavior Training: Addressing Common Issues',
    'Reactive Dog Training: Helping Your Dog Stay Calm',
    'Protection Dog Training: What You Need to Know',
    'Dog Trainer Certification: How to Become a Professional Dog Trainer',
    'Separation Anxiety in Dogs: Signs and Solutions',
    'E-Collar Training: Safe and Effective Use',
    'Pitbull Training: Tips for This Specific Breed',
    'Obedience Classes for Dogs: What to Expect',
    'Emotional Support Dog Training: Certification Process',
    'Off-Leash Dog Training: Achieving Reliability',
    'Best Dog Training Books: Top Picks for Owners and Trainers',
    'Puppy Training Classes: Finding the Right Fit',
    'Dog Agility Courses: Training and Competitions',
    'Therapy Dog Certification: Steps and Requirements',
    'Advanced Obedience Training: Taking Skills to the Next Level',
    'Dog Training for Anxiety: Techniques to Calm Your Pet',
    'Positive Reinforcement Dog Training: Building a Strong Bond',
    'Dog Training Videos: Best Online Resources',
    'Online Dog Training: Pros and Cons',
    'Dog Scent Training: Engaging Your Dog\'s Nose',
    'Dog Training Apps: Top Picks for Owners',
    'Dog Training for Aggression: Professional Approaches',
    'Dog Training Tips: Common Mistakes to Avoid',
    'Belgian Malinois Training: Specialized Techniques',
    'House Training a Puppy: Overcoming Challenges',
    'Dog Behavior Modification: When to Seek Professional Help',
    'Puppy Training Games: Making Learning Fun',
    'Dog Training Tools: Must-Have Equipment',
    'Dog Training Courses: What to Look For',
    'Dog Temperament Testing: Understanding Your Pet',
    'Dog Reactivity Training: Strategies for Success',
    'Puppy Crate Training Tips: Creating a Safe Space',
    'Dog Training Games: Interactive Ways to Teach Commands',
    'Behavior Modification for Dogs: Techniques and Success Stories',
    'Group Dog Training: Benefits and What to Expect'
  ];

  try {
    const posts = [];

    // Generate all blog posts first
    for (let i = 0; i < TOTAL_BLOG_POSTS; i++) {
      const topic = topics[i];
      console.log(`Generating blog post ${i + 1}/${TOTAL_BLOG_POSTS}: ${topic}`);
      
      try {
        const blogContent = await geminiService.generateBlogPost(topic);
        if (!blogContent) continue;
      
        const image = await dogApi.getRandomImage();
      
        const post = {
          id: `post-${i + 1}`,
          ...blogContent,
          image: image,
          timestamp: Date.now()
        };
        
        posts.push(post);
        console.log(`Generated blog post: ${post.title}`);

        // Save individual post details with content wrapper
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
      // Save all posts with content wrapper
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