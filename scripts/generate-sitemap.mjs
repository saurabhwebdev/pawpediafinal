import fs from 'fs/promises';
import path from 'path';
import { dogApi } from '../src/services/dogApi.js';
import { firebaseService } from '../src/services/firebase.js';

const SITE_URL = 'https://pawpedia.com';

async function generateSitemap() {
  try {
    // Get all breeds
    const breeds = await dogApi.getAllBreeds();
    const breedUrls = [];
    
    // Generate URLs for breeds and sub-breeds
    for (const [breed, subBreeds] of Object.entries(breeds)) {
      breedUrls.push({
        loc: `${SITE_URL}/breeds/${breed}`,
        changefreq: 'weekly',
        priority: 0.7
      });

      // Add sub-breed URLs if they exist
      if (subBreeds && subBreeds.length > 0) {
        for (const subBreed of subBreeds) {
          breedUrls.push({
            loc: `${SITE_URL}/breeds/${breed}/${subBreed}`,
            changefreq: 'weekly',
            priority: 0.6
          });
        }
      }
    }

    // Get all blog posts (with error handling)
    let blogUrls = [];
    try {
      const postsData = await firebaseService.getCachedData('blog', 'posts');
      if (postsData?.content?.posts && Array.isArray(postsData.content.posts)) {
        blogUrls = postsData.content.posts.map(post => ({
          loc: `${SITE_URL}/blog/${post.id.replace('post-', '')}`,
          changefreq: 'monthly',
          priority: 0.6,
          lastmod: post.timestamp ? new Date(post.timestamp).toISOString().split('T')[0] : undefined
        }));
      }
    } catch (error) {
      console.warn('Warning: Could not fetch blog posts for sitemap:', error.message);
    }

    // Get all dog facts (with error handling)
    let factUrls = [];
    try {
      const factsData = await firebaseService.getCachedData('facts', 'dog_facts');
      if (factsData?.content && Array.isArray(factsData.content)) {
        factUrls = factsData.content.map((fact, index) => ({
          loc: `${SITE_URL}/facts/fact-${index + 1}`,
          changefreq: 'monthly',
          priority: 0.5
        }));
      }
    } catch (error) {
      console.warn('Warning: Could not fetch dog facts for sitemap:', error.message);
    }

    // Static routes
    const staticUrls = [
      { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 1.0 },
      { loc: `${SITE_URL}/breeds`, changefreq: 'weekly', priority: 0.8 },
      { loc: `${SITE_URL}/random`, changefreq: 'daily', priority: 0.7 },
      { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: 0.8 },
      { loc: `${SITE_URL}/facts`, changefreq: 'weekly', priority: 0.7 },
      { loc: `${SITE_URL}/privacy`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${SITE_URL}/terms`, changefreq: 'monthly', priority: 0.5 },
      { loc: `${SITE_URL}/security`, changefreq: 'monthly', priority: 0.5 }
    ];

    // Combine all URLs
    const allUrls = [...staticUrls, ...breedUrls, ...blogUrls, ...factUrls];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>${url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    // Create public directory if it doesn't exist
    try {
      await fs.access('public');
    } catch {
      await fs.mkdir('public');
    }

    // Write sitemap to file
    await fs.writeFile('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 