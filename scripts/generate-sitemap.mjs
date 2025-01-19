import fs from 'fs/promises';
import { firebaseService } from '../src/services/firebase.js';
import { dogApi } from '../src/services/dogApi.js';

async function generateSitemap() {
  try {
    console.log('Generating sitemap...');

    // Base URLs
    const baseUrls = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'breeds', priority: '0.8', changefreq: 'weekly' },
      { url: 'random', priority: '0.7', changefreq: 'daily' },
      { url: 'blog', priority: '0.8', changefreq: 'weekly' },
      { url: 'facts', priority: '0.7', changefreq: 'weekly' },
      { url: 'shop', priority: '0.8', changefreq: 'daily' },
      { url: 'privacy', priority: '0.5', changefreq: 'monthly' },
      { url: 'terms', priority: '0.5', changefreq: 'monthly' },
      { url: 'security', priority: '0.5', changefreq: 'monthly' }
    ];

    // Get breed data
    const breeds = await dogApi.getAllBreeds();
    const breedUrls = [];

    // Process breeds and sub-breeds
    for (const [breed, subBreeds] of Object.entries(breeds)) {
      breedUrls.push({
        url: `breeds/${breed}`,
        priority: '0.7',
        changefreq: 'weekly'
      });

      if (subBreeds.length > 0) {
        subBreeds.forEach(subBreed => {
          breedUrls.push({
            url: `breeds/${breed}/${subBreed}`,
            priority: '0.6',
            changefreq: 'weekly'
          });
        });
      }
    }

    // Get blog posts
    const blogPosts = await firebaseService.getCachedData('blog', 'posts');
    const blogUrls = blogPosts?.content?.posts?.map(post => ({
      url: `blog/${post.slug}`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: new Date(post.timestamp).toISOString().split('T')[0]
    })) || [];

    // Get facts
    const facts = await firebaseService.getCachedData('facts', 'facts');
    const factUrls = facts?.content?.facts?.map((fact, index) => ({
      url: `facts/fact-${index + 1}`,
      priority: '0.5',
      changefreq: 'monthly'
    })) || [];

    // Get shop categories
    const shopCategories = [
      'food', 'toys', 'accessories', 'grooming', 'health'
    ];
    const shopUrls = shopCategories.map(category => ({
      url: `shop?category=${category}`,
      priority: '0.7',
      changefreq: 'daily'
    }));

    // Combine all URLs
    const allUrls = [
      ...baseUrls,
      ...breedUrls,
      ...blogUrls,
      ...factUrls,
      ...shopUrls
    ];

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, priority, changefreq, lastmod }) => `  <url>
    <loc>https://pawpedia.com/${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    // Write sitemap file
    await fs.writeFile('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');

  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

generateSitemap().catch(console.error); 