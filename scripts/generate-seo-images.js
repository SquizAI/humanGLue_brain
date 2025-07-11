const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateSEOImages() {
  const logoPath = path.join(__dirname, '../public/HumanGlue_nobackground.png');
  const publicDir = path.join(__dirname, '../public');

  try {
    // Read the original logo
    const logoBuffer = await fs.readFile(logoPath);
    
    // Create og-image.png (1200x630) with background
    console.log('Creating og-image.png...');
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 30, g: 41, b: 59, alpha: 1 } // Tailwind gray-800
      }
    })
    .composite([
      {
        input: await sharp(logoBuffer)
          .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        top: 115,
        left: 400
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

    // Create twitter-image.png (same as og-image for consistency)
    console.log('Creating twitter-image.png...');
    await fs.copyFile(
      path.join(publicDir, 'og-image.png'),
      path.join(publicDir, 'twitter-image.png')
    );

    // Create apple-touch-icon.png (180x180)
    console.log('Creating apple-touch-icon.png...');
    await sharp(logoBuffer)
      .resize(180, 180, { 
        fit: 'contain', 
        background: { r: 30, g: 41, b: 59, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));

    // Create favicon-32x32.png
    console.log('Creating favicon-32x32.png...');
    await sharp(logoBuffer)
      .resize(32, 32, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));

    // Create favicon-16x16.png
    console.log('Creating favicon-16x16.png...');
    await sharp(logoBuffer)
      .resize(16, 16, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));

    // Create logo.png (copy of original)
    console.log('Creating logo.png...');
    await fs.copyFile(logoPath, path.join(publicDir, 'logo.png'));

    // Create android-chrome-192x192.png (for PWA)
    console.log('Creating android-chrome-192x192.png...');
    await sharp(logoBuffer)
      .resize(192, 192, { 
        fit: 'contain',
        background: { r: 30, g: 41, b: 59, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

    // Create android-chrome-512x512.png (for PWA)
    console.log('Creating android-chrome-512x512.png...');
    await sharp(logoBuffer)
      .resize(512, 512, { 
        fit: 'contain',
        background: { r: 30, g: 41, b: 59, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

    console.log('✅ All SEO images generated successfully!');
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateSEOImages(); 