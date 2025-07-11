const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function generateEnhancedOGImage() {
  const logoPath = path.join(__dirname, '../public/HumanGlue_nobackground.png');
  const publicDir = path.join(__dirname, '../public');

  try {
    // Read the original logo
    const logoBuffer = await fs.readFile(logoPath);
    
    // Create SVG with text overlay
    const svgText = `
      <svg width="1200" height="630">
        <style>
          .title { fill: white; font-size: 72px; font-weight: bold; font-family: Arial, sans-serif; }
          .subtitle { fill: #93c5fd; font-size: 36px; font-family: Arial, sans-serif; }
          .tagline { fill: #e5e7eb; font-size: 28px; font-family: Arial, sans-serif; }
        </style>
        <text x="600" y="380" text-anchor="middle" class="title">Human Glue</text>
        <text x="600" y="440" text-anchor="middle" class="subtitle">AI-Powered Organizational Transformation</text>
        <text x="600" y="500" text-anchor="middle" class="tagline">Strengthen the connections that drive performance</text>
      </svg>
    `;

    // Create enhanced og-image.png with gradient background
    console.log('Creating enhanced og-image.png...');
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 17, g: 24, b: 39, alpha: 1 } // Tailwind gray-900
      }
    })
    .composite([
      // Add gradient overlay
      {
        input: Buffer.from(`
          <svg width="1200" height="630">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.2" />
              </linearGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#grad)" />
          </svg>
        `),
        top: 0,
        left: 0
      },
      // Add logo
      {
        input: await sharp(logoBuffer)
          .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        top: 50,
        left: 460
      },
      // Add text overlay
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image-enhanced.png'));

    // Replace the original og-image.png with the enhanced version
    await fs.rename(
      path.join(publicDir, 'og-image-enhanced.png'),
      path.join(publicDir, 'og-image.png')
    );

    // Also update twitter-image.png
    await fs.copyFile(
      path.join(publicDir, 'og-image.png'),
      path.join(publicDir, 'twitter-image.png')
    );

    console.log('✅ Enhanced SEO images generated successfully!');
  } catch (error) {
    console.error('Error generating enhanced images:', error);
    process.exit(1);
  }
}

generateEnhancedOGImage(); 