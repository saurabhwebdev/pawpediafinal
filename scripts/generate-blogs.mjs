import { firebaseService } from '../src/services/firebase.js';
import { geminiService } from '../src/services/geminiAI.js';
import { dogApi } from '../src/services/dogApi.js';

const TOTAL_BLOG_POSTS = 200;

async function generateAndCacheBlogPosts() {
  console.log('Starting blog post generation...');
  
  const topics = [
    // Training & Behavior (40)
    'Essential Puppy Training Tips for New Dog Parents',
    'Understanding Your Dog\'s Body Language: A Complete Guide',
    'Advanced Dog Training: Beyond Basic Commands',
    'Positive Reinforcement Training Techniques',
    'Solving Common Behavioral Problems in Dogs',
    'Clicker Training: A Comprehensive Guide',
    'Teaching Your Dog Tricks: From Basic to Advanced',
    'Leash Training and Loose-Leash Walking Tips',
    'House Training Your Puppy: A Complete Guide',
    'Training Multiple Dogs: Tips and Challenges',
    'Crate Training: Benefits and Best Practices',
    'Dealing with Dog Aggression: Causes and Solutions',
    'Separation Anxiety in Dogs: Prevention and Treatment',
    'Teaching Your Dog to Come When Called',
    'Socialization Tips for Puppies and Adult Dogs',
    'Understanding and Managing Resource Guarding',
    'Teaching Your Dog to Stay: Step by Step Guide',
    'Dealing with Excessive Barking',
    'Training Your Dog for Off-Leash Reliability',
    'Understanding and Managing Prey Drive',
    'Teaching Bite Inhibition to Puppies',
    'Counter-Conditioning and Desensitization Techniques',
    'Training Your Dog to Walk Nicely on a Leash',
    'Teaching Your Dog to Leave It and Drop It',
    'Managing Door Darting Behavior',
    'Training Your Dog to Settle and Relax',
    'Teaching Your Dog to Greet People Politely',
    'Managing Jumping Up Behavior',
    'Training Your Dog for Car Travel',
    'Teaching Your Dog to Wait at Doors',
    'Understanding and Managing Fear in Dogs',
    'Training Your Dog to Accept Handling',
    'Teaching Your Dog to Focus and Pay Attention',
    'Managing Distractions During Training',
    'Training Your Dog for Recall in Emergency Situations',
    'Teaching Your Dog to Walk on Different Surfaces',
    'Training Your Dog to Accept Grooming',
    'Teaching Your Dog to Share and Take Turns',
    'Training Your Dog to Stay Calm Around Other Dogs',
    'Understanding and Managing Herding Behavior',

    // Health & Wellness (40)
    'Natural Remedies for Common Dog Health Issues',
    'Holistic Health Care for Your Dog',
    'Understanding and Managing Dog Allergies',
    'Dog Dental Care: Prevention and Maintenance',
    'First Aid Essentials for Dog Owners',
    'Common Health Issues in Senior Dogs',
    'Preventive Care: Keeping Your Dog Healthy',
    'Understanding Dog Vaccinations and Schedules',
    'Signs Your Dog Needs to See a Vet',
    'Alternative Therapies for Dogs: Acupuncture and More',
    'Managing Arthritis in Dogs: Natural Approaches',
    'Understanding and Treating Hot Spots',
    'Natural Flea and Tick Prevention',
    'Dealing with Dog Ear Infections',
    'Understanding Hip Dysplasia in Dogs',
    'Managing Diabetes in Dogs',
    'Cancer Prevention in Dogs',
    'Understanding and Managing Dog Obesity',
    'Dealing with Skin Problems in Dogs',
    'Natural Pain Management for Dogs',
    'Understanding and Managing Dog Seizures',
    'Caring for Dogs with Heart Disease',
    'Managing Digestive Issues in Dogs',
    'Understanding Dog Eye Problems',
    'Natural Immune System Boosters for Dogs',
    'Managing Joint Problems in Dogs',
    'Understanding and Treating Dog Allergies',
    'Dealing with Respiratory Issues in Dogs',
    'Managing Urinary Tract Problems',
    'Understanding Dog Dental Disease',
    'Natural Ways to Boost Dog Energy',
    'Managing Anxiety and Stress in Dogs',
    'Understanding Dog Blood Work Results',
    'Managing Chronic Pain in Dogs',
    'Understanding Dog Liver Problems',
    'Natural Ways to Improve Dog Coat Health',
    'Managing Kidney Disease in Dogs',
    'Understanding Dog Thyroid Problems',
    'Natural Ways to Improve Dog Digestion',
    'Managing Autoimmune Diseases in Dogs',

    // Nutrition & Diet (40 unique topics)
    'The Ultimate Guide to Raw Food Diet for Dogs',
    'Understanding Commercial Dog Food Types',
    'Homemade Dog Food: Recipes and Guidelines',
    'Grain-Free vs Regular Dog Food: Making the Choice',
    'Feeding Senior Dogs: Age-Specific Nutrition',
    'Healthy Dog Treats: Homemade Recipes',
    'Special Diets for Dogs with Health Issues',
    'Puppy Nutrition: From Weaning to Adult Food',
    'Superfoods for Dogs: Benefits and Uses',
    'Weight Management for Dogs',
    'Understanding Dog Food Allergies and Sensitivities',
    'Protein Sources in Dog Food: A Complete Guide',
    'Supplements for Dogs: What You Need to Know',
    'Fresh Food Diets for Dogs: Pros and Cons',
    'Feeding Dogs with Sensitive Stomachs',
    'Meal Planning for Multiple Dogs',
    'Understanding Dog Food Recalls',
    'Transitioning Between Dog Food Types',
    'Hydration and Water Intake for Dogs',
    'Seasonal Diet Adjustments for Dogs',
    'Feeding Working and Athletic Dogs',
    'Diet and Dental Health in Dogs',
    'Understanding Dog Food Preservatives',
    'Portion Control and Feeding Schedules',
    'Raw Food Safety and Handling',
    'Vegetarian and Vegan Diets for Dogs',
    'Feeding Dogs with Kidney Disease',
    'Diet and Skin Health in Dogs',
    'Understanding Carbohydrates in Dog Food',
    'Feeding Dogs with Liver Disease',
    'Diet and Heart Health in Dogs',
    'Understanding Fats in Dog Food',
    'Feeding Dogs with Cancer',
    'Diet and Joint Health in Dogs',
    'Understanding Fiber in Dog Food',
    'Feeding Dogs with Diabetes',
    'Diet and Brain Health in Dogs',
    'Understanding Minerals in Dog Food',
    'Feeding Dogs with Pancreatitis',
    'Diet and Immune System Health',

    // Lifestyle & Care (40 unique topics)
    'Creating the Perfect Dog Exercise Routine',
    'Dog-Friendly Home Modifications',
    'Seasonal Care Tips for Dogs',
    'Dog Photography Tips and Techniques',
    'Setting Up a Dog Washing Station',
    'Dog-Safe Cleaning Products and Methods',
    'Creating an Indoor Potty Area',
    'Dog-Friendly Apartment Living',
    'Managing Dogs in Multi-Pet Households',
    'Dog-Safe Landscaping Ideas',
    'Setting Up a Dog First Aid Kit',
    'Creating a Dog Memory Book',
    'Dog-Friendly Office Setup',
    'Managing Dog Hair in Your Home',
    'Creating a Dog Emergency Plan',
    'Dog-Safe Holiday Decorating',
    'Setting Up a Dog Grooming Station',
    'Dog-Friendly Car Modifications',
    'Managing Dogs During Home Renovations',
    'Creating a Dog Command Center',
    'Dog-Safe Plant Selection Guide',
    'Setting Up a Dog Training Area',
    'Dog-Friendly Furniture Selection',
    'Managing Dogs During Parties',
    'Creating a Dog Sleep Schedule',
    'Dog-Safe Storage Solutions',
    'Setting Up a Dog Exercise Area',
    'Dog-Friendly Yard Design',
    'Managing Dogs During Moving',
    'Creating a Dog Care Calendar',
    'Dog-Safe Paint and Flooring Options',
    'Setting Up a Dog Feeding Station',
    'Dog-Friendly Window Treatments',
    'Managing Dogs During Construction',
    'Creating a Dog Travel Kit',
    'Dog-Safe Pest Control Methods',
    'Setting Up a Dog Play Area',
    'Dog-Friendly Room Design',
    'Managing Dogs During Weather Emergencies',
    'Creating a Dog Care Budget',

    // Special Topics (40 unique topics)
    'Dogs in the Workplace: A Guide for Employers',
    'Starting a Dog-Related Business',
    'Dogs in Education: Classroom Pets',
    'Understanding Service Dog Training',
    'Dogs in Healthcare: Animal-Assisted Therapy',
    'Starting a Dog Rescue Organization',
    'Dogs in Law Enforcement',
    'Understanding Dog Show Competitions',
    'Dogs in Search and Rescue',
    'Starting a Dog Training Business',
    'Dogs in Film and Television',
    'Understanding Dog DNA Testing',
    'Dogs in Scientific Research',
    'Starting a Dog Walking Business',
    'Dogs in Agriculture: Herding Work',
    'Understanding Dog Insurance Options',
    'Dogs in Military Service',
    'Starting a Dog Grooming Business',
    'Dogs in Assisted Living Facilities',
    'Understanding Dog Breeding Ethics',
    'Dogs in Airport Security',
    'Starting a Dog Daycare',
    'Dogs in Conservation Work',
    'Understanding Dog Sport Competitions',
    'Dogs in Prison Rehabilitation Programs',
    'Starting a Pet Photography Business',
    'Dogs in Pest Control Work',
    'Understanding Dog Show Judging',
    'Dogs in Wildlife Detection',
    'Starting a Mobile Grooming Business',
    'Dogs in Avalanche Rescue',
    'Understanding Dog Genetics',
    'Dogs in Water Rescue',
    'Starting a Dog Food Business',
    'Dogs in Movie Training',
    'Understanding Dog Behavior Studies',
    'Dogs in Space Research History',
    'Starting a Dog Equipment Business',
    'Dogs in Archaeological Work',
    'Understanding Dog Evolution'
  ];

  try {
    const posts = [];

    // Generate all blog posts first
    for (let i = 0; i < TOTAL_BLOG_POSTS; i++) {
      const topic = topics[i % topics.length];
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
      // Save all posts with content wrapper (like facts)
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