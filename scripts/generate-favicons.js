import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const sizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
  'mstile-150x150.png': 150,
};

async function generateFavicons() {
  const inputSvg = await fs.readFile('public/favicon.svg');
  
  for (const [filename, size] of Object.entries(sizes)) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join('public', filename));
  }
  
  console.log('Favicons generated successfully!');
}

generateFavicons().catch(console.error);
