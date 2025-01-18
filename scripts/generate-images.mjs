import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const INPUT_SVG = 'public/pawprint.svg';
const OUTPUT_DIR = 'public';

// Define all the images we need to generate
const IMAGES_TO_GENERATE = [
  // Standard favicons
  { name: 'favicon-16x16.png', width: 16, height: 16 },
  { name: 'favicon-32x32.png', width: 32, height: 32 },
  { name: 'favicon-48x48.png', width: 48, height: 48 },
  { name: 'favicon-64x64.png', width: 64, height: 64 },
  { name: 'favicon-96x96.png', width: 96, height: 96 },
  { name: 'favicon-128x128.png', width: 128, height: 128 },
  { name: 'favicon-256x256.png', width: 256, height: 256 },
  
  // Apple Touch Icons
  { name: 'apple-touch-icon-57x57.png', width: 57, height: 57 },
  { name: 'apple-touch-icon-60x60.png', width: 60, height: 60 },
  { name: 'apple-touch-icon-72x72.png', width: 72, height: 72 },
  { name: 'apple-touch-icon-76x76.png', width: 76, height: 76 },
  { name: 'apple-touch-icon-114x114.png', width: 114, height: 114 },
  { name: 'apple-touch-icon-120x120.png', width: 120, height: 120 },
  { name: 'apple-touch-icon-144x144.png', width: 144, height: 144 },
  { name: 'apple-touch-icon-152x152.png', width: 152, height: 152 },
  { name: 'apple-touch-icon-167x167.png', width: 167, height: 167 },
  { name: 'apple-touch-icon-180x180.png', width: 180, height: 180 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 }, // Default
  
  // Android/Chrome Icons
  { name: 'android-chrome-36x36.png', width: 36, height: 36 },
  { name: 'android-chrome-48x48.png', width: 48, height: 48 },
  { name: 'android-chrome-72x72.png', width: 72, height: 72 },
  { name: 'android-chrome-96x96.png', width: 96, height: 96 },
  { name: 'android-chrome-144x144.png', width: 144, height: 144 },
  { name: 'android-chrome-192x192.png', width: 192, height: 192 },
  { name: 'android-chrome-256x256.png', width: 256, height: 256 },
  { name: 'android-chrome-384x384.png', width: 384, height: 384 },
  { name: 'android-chrome-512x512.png', width: 512, height: 512 },
  
  // Microsoft Windows Tiles
  { name: 'mstile-70x70.png', width: 70, height: 70 },
  { name: 'mstile-144x144.png', width: 144, height: 144 },
  { name: 'mstile-150x150.png', width: 150, height: 150 },
  { name: 'mstile-310x150.png', width: 310, height: 150 },
  { name: 'mstile-310x310.png', width: 310, height: 310 },
  
  // PWA Icons
  { name: 'maskable-icon-48x48.png', width: 48, height: 48, maskable: true },
  { name: 'maskable-icon-72x72.png', width: 72, height: 72, maskable: true },
  { name: 'maskable-icon-96x96.png', width: 96, height: 96, maskable: true },
  { name: 'maskable-icon-128x128.png', width: 128, height: 128, maskable: true },
  { name: 'maskable-icon-192x192.png', width: 192, height: 192, maskable: true },
  { name: 'maskable-icon-384x384.png', width: 384, height: 384, maskable: true },
  { name: 'maskable-icon-512x512.png', width: 512, height: 512, maskable: true },
  
  // Social Media Images
  { name: 'og-image.png', width: 1200, height: 630, social: true },
  { name: 'twitter-card.png', width: 1200, height: 600, social: true },
  { name: 'twitter-card-large.png', width: 1500, height: 500, social: true },
  
  // Other Social Media Sizes
  { name: 'facebook-profile.png', width: 170, height: 170, social: true },
  { name: 'facebook-cover.png', width: 820, height: 312, social: true },
  { name: 'linkedin-cover.png', width: 1584, height: 396, social: true },
  { name: 'youtube-profile.png', width: 800, height: 800, social: true },
  { name: 'instagram-profile.png', width: 320, height: 320, social: true }
];

async function generateImages() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(INPUT_SVG);

    // Generate each image
    for (const image of IMAGES_TO_GENERATE) {
      console.log(`Generating ${image.name}...`);
      
      let pipeline = sharp(svgBuffer);
      
      if (image.maskable) {
        // Add padding for maskable icons (safe area)
        const safePadding = Math.floor(image.width * 0.1); // 10% padding
        pipeline = pipeline
          .resize(image.width - (safePadding * 2), image.height - (safePadding * 2))
          .extend({
            top: safePadding,
            bottom: safePadding,
            left: safePadding,
            right: safePadding,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          });
      } else if (image.social) {
        // For social media images, add padding and background
        const paddedWidth = Math.floor(image.width * 0.6); // SVG takes 60% of width
        pipeline = pipeline
          .resize(paddedWidth, null, { fit: 'contain' })
          .extend({
            top: 0,
            bottom: 0,
            left: Math.floor((image.width - paddedWidth) / 2),
            right: Math.floor((image.width - paddedWidth) / 2),
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          });
      } else {
        // Standard resize for other images
        pipeline = pipeline.resize(image.width, image.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        });
      }

      await pipeline
        .png()
        .toFile(path.join(OUTPUT_DIR, image.name));
    }

    // For favicon.ico, we'll just use the 32x32 PNG since most modern browsers
    // will use the PNG favicons directly. The .ico is kept for legacy support.
    console.log('Generating favicon.ico...');
    await fs.copyFile(
      path.join(OUTPUT_DIR, 'favicon-32x32.png'),
      path.join(OUTPUT_DIR, 'favicon.ico')
    );

    // Generate Safari pinned tab SVG (monochrome)
    console.log('Generating safari-pinned-tab.svg...');
    const svgString = svgBuffer.toString('utf-8');
    const monochromeString = svgString.replace(/fill="[^"]*"/g, 'fill="black"');
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'safari-pinned-tab.svg'),
      monochromeString
    );

    console.log('All images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages(); 