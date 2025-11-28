/**
 * Generate custom images for Solutions page using:
 * - Gemini 2.0 Flash (imagen-3.0-generate-002) - Native image generation
 * - OpenAI GPT Image 1 (gpt-image-1)
 */

const fs = require('fs');
const path = require('path');

// API Keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!GEMINI_API_KEY || !OPENAI_API_KEY) {
  console.error('❌ Missing API keys. Please set GEMINI_API_KEY and OPENAI_API_KEY environment variables.');
  console.error('   Example: GEMINI_API_KEY=xxx OPENAI_API_KEY=xxx node scripts/generate-solution-images.js');
  process.exit(1);
}

// Image prompts based on Solutions page content - highly specific to each section
const imagePrompts = [
  {
    name: 'ai-assessment',
    prompt: `A futuristic AI-powered organizational analytics dashboard visualization. Show a large holographic display with:
- Dynamic heat maps showing organizational health metrics
- Glowing network nodes representing leadership effectiveness, cultural cohesion, employee experience, and innovation
- Sentiment analysis wave patterns flowing across the visualization
- Predictive trend lines and forecasting graphs
- Real-time data streams in purple and blue gradients
Dark environment with a modern office silhouette in the background. The display should look like advanced AI technology analyzing human organizational patterns. Cinematic lighting with purple and blue accent glows. Photorealistic, high-end tech aesthetic. No text or labels.`,
  },
  {
    name: 'strategic-workshops',
    prompt: `A high-tech strategic workshop session in a modern executive boardroom. Show:
- A diverse group of 8-12 business professionals collaborating around a sleek conference table
- A massive 85-inch curved display screen on the wall showing organizational data visualizations, heat maps, and AI-generated insights
- Tablets and laptops on the table displaying synchronized data dashboards
- An expert facilitator gesturing toward the digital screen showing a transformation roadmap
- Multiple smaller screens showing real-time analytics and metrics
- Clean, minimalist modern design with NO sticky notes, NO whiteboards, NO paper
- Glass walls, ambient LED lighting strips in purple and blue
Professional, tech-forward atmosphere. Natural daylight mixing with modern LED accent lighting. Shot from a cinematic angle emphasizing the technology. Photorealistic, premium corporate tech environment. No text readable.`,
  },
  {
    name: 'toolbox',
    prompt: `A sophisticated 3D visualization of an organizational transformation toolkit. Show a floating holographic interface displaying 5 distinct interconnected modules:
1. Building/structure icon for Organizational Structure & Alignment
2. Target/compass icon for Leadership Development
3. Heart icon for Employee Experience & Engagement
4. Network/connection icon for Culture & Values Integration
5. Gear/settings icon for Change Management & Transformation
Each module should glow and have small tool icons orbiting around it. The 5 modules are connected by flowing energy lines showing integration. Purple to blue gradient color scheme. Dark background with depth. Modern, sleek, professional SaaS product visualization. Like a premium software interface floating in space. No text or labels.`,
  },
];

// Ensure output directory exists
const outputDir = path.join(__dirname, '../public/solutions');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Generate image using Imagen 3 via Gemini API
 */
async function generateWithGemini(prompt, filename) {
  console.log(`\n🟣 Generating with Imagen 3 (Gemini): ${filename}...`);

  // Use Imagen 3 model for native image generation
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict';

  const requestBody = {
    instances: [
      {
        prompt: prompt
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "16:9",
      personGeneration: "allow_adult"
    }
  };

  try {
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If Imagen 3 fails, fall back to gemini-2.0-flash-exp with image generation
      console.log('Imagen 3 not available, trying Gemini 2.0 Flash...');
      return await generateWithGeminiFlash(prompt, filename);
    }

    const data = await response.json();

    // Debug: log the response structure
    console.log('Imagen 3 response:', JSON.stringify(data, null, 2).substring(0, 500));

    // Extract base64 image data from Imagen response
    const predictions = data.predictions;
    if (!predictions || predictions.length === 0) {
      throw new Error('No predictions in response: ' + JSON.stringify(data));
    }

    const imageData = predictions[0].bytesBase64Encoded;
    if (!imageData) {
      throw new Error('No image data in prediction: ' + JSON.stringify(predictions[0]));
    }

    const imageBuffer = Buffer.from(imageData, 'base64');

    // Save image
    const filepath = path.join(outputDir, `${filename}-gemini.png`);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`✅ Saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Imagen 3 generation failed for ${filename}:`, error.message);
    // Try fallback
    return await generateWithGeminiFlash(prompt, filename);
  }
}

/**
 * Fallback: Generate image using Gemini 2.0 Flash experimental
 */
async function generateWithGeminiFlash(prompt, filename) {
  console.log(`\n🟣 Fallback: Generating with Gemini 2.0 Flash: ${filename}...`);

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  const requestBody = {
    contents: [{
      parts: [
        { text: `Generate a high-quality image: ${prompt}` }
      ]
    }],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"]
    }
  };

  try {
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini Flash API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Debug: log the response structure
    console.log('Gemini Flash response:', JSON.stringify(data, null, 2).substring(0, 500));

    // Extract base64 image data
    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new Error('No candidates in response: ' + JSON.stringify(data));
    }

    const parts = candidate.content?.parts || [];
    const imagePart = parts.find(p => p.inlineData);

    if (!imagePart) {
      throw new Error('No image data in response parts: ' + JSON.stringify(parts));
    }

    const imageData = imagePart.inlineData.data;
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Save image
    const filepath = path.join(outputDir, `${filename}-gemini.png`);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`✅ Saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Gemini Flash generation failed for ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Generate image using OpenAI GPT Image 1
 */
async function generateWithOpenAI(prompt, filename) {
  console.log(`\n🔵 Generating with OpenAI GPT Image 1: ${filename}...`);

  const url = 'https://api.openai.com/v1/images/generations';

  const requestBody = {
    model: 'gpt-image-1',
    prompt: prompt,
    size: '1536x1024', // landscape 16:9-ish
    quality: 'high',
    n: 1,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // GPT Image 1 can return either URL or base64 data
    let imageBuffer;
    if (data.data[0].b64_json) {
      // Base64 encoded image
      imageBuffer = Buffer.from(data.data[0].b64_json, 'base64');
    } else if (data.data[0].url) {
      // Download image from URL
      const imageResponse = await fetch(data.data[0].url);
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      throw new Error('No image data in response');
    }

    // Save image
    const filepath = path.join(outputDir, `${filename}-openai.png`);
    fs.writeFileSync(filepath, imageBuffer);

    console.log(`✅ Saved: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error(`❌ OpenAI generation failed for ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 Starting image generation for Solutions page...\n');
  console.log('📊 Generating 3 images with 2 models = 6 total images\n');

  const results = {
    gemini: [],
    openai: [],
    errors: [],
  };

  for (const { name, prompt } of imagePrompts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Prompt: ${name}`);
    console.log(`${'='.repeat(60)}`);

    // Generate with Gemini
    try {
      const geminiPath = await generateWithGemini(prompt, name);
      results.gemini.push({ name, path: geminiPath });
    } catch (error) {
      results.errors.push({ model: 'Gemini', name, error: error.message });
    }

    // Generate with OpenAI
    try {
      const openaiPath = await generateWithOpenAI(prompt, name);
      results.openai.push({ name, path: openaiPath });
    } catch (error) {
      results.errors.push({ model: 'OpenAI', name, error: error.message });
    }
  }

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 GENERATION SUMMARY');
  console.log('='.repeat(60));

  console.log(`\n✅ Imagen 3 (Gemini): ${results.gemini.length}/${imagePrompts.length} images generated`);
  results.gemini.forEach(({ name, path }) => {
    console.log(`   - ${name}: ${path}`);
  });

  console.log(`\n✅ OpenAI GPT Image 1: ${results.openai.length}/${imagePrompts.length} images generated`);
  results.openai.forEach(({ name, path }) => {
    console.log(`   - ${name}: ${path}`);
  });

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(({ model, name, error }) => {
      console.log(`   - ${model} (${name}): ${error}`);
    });
  }

  console.log('\n🎉 Image generation complete!');
  console.log(`\n📂 All images saved to: ${outputDir}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review the generated images in public/solutions/');
  console.log('   2. Compare quality between Gemini and OpenAI versions');
  console.log('   3. Choose the best images for each section');
  console.log('   4. Update app/solutions/page.tsx with the selected images\n');
}

main().catch(console.error);
