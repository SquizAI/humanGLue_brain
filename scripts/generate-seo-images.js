const fs = require('fs');
const path = require('path');

// Create a simple HTML canvas approach using sharp if available
const sharp = require('sharp');

async function generateSEOImages() {
  const logoPath = path.join(__dirname, '../public/HumnaGlue_logo_white_blue.png');
  
  // OG Image dimensions: 1200x630
  const ogImageSVG = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="accentGradient1" cx="30%" cy="30%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0" />
        </radialGradient>
        <radialGradient id="accentGradient2" cx="70%" cy="70%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGradient)"/>
      <rect width="1200" height="630" fill="url(#accentGradient1)"/>
      <rect width="1200" height="630" fill="url(#accentGradient2)"/>
      
      <!-- Grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <!-- Content -->
      <text x="600" y="280" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">
        AI-Powered Organizational
      </text>
      <text x="600" y="360" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Transformation
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="440" font-family="Arial, sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">
        Strengthen the human connections that drive performance
      </text>
      
      <!-- Bottom accent line -->
      <rect x="400" y="520" width="400" height="4" fill="url(#accentGradient1)" rx="2"/>
    </svg>
  `;

  // Twitter Image dimensions: 1200x600
  const twitterImageSVG = `
    <svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
        <radialGradient id="accentGradient1" cx="30%" cy="30%">
          <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0" />
        </radialGradient>
        <radialGradient id="accentGradient2" cx="70%" cy="70%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="600" fill="url(#bgGradient)"/>
      <rect width="1200" height="600" fill="url(#accentGradient1)"/>
      <rect width="1200" height="600" fill="url(#accentGradient2)"/>
      
      <!-- Grid pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="600" fill="url(#grid)"/>
      
      <!-- Content -->
      <text x="600" y="260" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#ffffff" text-anchor="middle">
        AI-Powered Organizational
      </text>
      <text x="600" y="340" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Transformation
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="420" font-family="Arial, sans-serif" font-size="26" fill="#94a3b8" text-anchor="middle">
        Strengthen the human connections that drive performance
      </text>
      
      <!-- Bottom accent line -->
      <rect x="400" y="500" width="400" height="4" fill="url(#accentGradient1)" rx="2"/>
    </svg>
  `;

  try {
    // Check if sharp is available
    const sharpModule = require('sharp');
    
    // Generate OG Image
    await sharpModule(Buffer.from(ogImageSVG))
      .png()
      .toFile(path.join(__dirname, '../public/og-image.png'));
    
    console.log('✓ Generated og-image.png');
    
    // Generate Twitter Image
    await sharpModule(Buffer.from(twitterImageSVG))
      .png()
      .toFile(path.join(__dirname, '../public/twitter-image.png'));
    
    console.log('✓ Generated twitter-image.png');
    
    // Now composite the logo on top
    const logo = await sharpModule(logoPath).resize(300, null, { fit: 'contain' }).toBuffer();
    
    // Composite logo onto OG image
    await sharpModule(path.join(__dirname, '../public/og-image.png'))
      .composite([{
        input: logo,
        top: 80,
        left: 450
      }])
      .toFile(path.join(__dirname, '../public/og-image-temp.png'));
    
    fs.renameSync(
      path.join(__dirname, '../public/og-image-temp.png'),
      path.join(__dirname, '../public/og-image.png')
    );
    
    console.log('✓ Added logo to og-image.png');
    
    // Composite logo onto Twitter image
    await sharpModule(path.join(__dirname, '../public/twitter-image.png'))
      .composite([{
        input: logo,
        top: 70,
        left: 450
      }])
      .toFile(path.join(__dirname, '../public/twitter-image-temp.png'));
    
    fs.renameSync(
      path.join(__dirname, '../public/twitter-image-temp.png'),
      path.join(__dirname, '../public/twitter-image.png')
    );
    
    console.log('✓ Added logo to twitter-image.png');
    console.log('\n✓ SEO images generated successfully!');
    
  } catch (error) {
    console.error('Error generating images:', error.message);
    console.log('\nPlease install sharp: npm install sharp');
    process.exit(1);
  }
}

generateSEOImages();
