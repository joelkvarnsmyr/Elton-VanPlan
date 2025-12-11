#!/usr/bin/env tsx
/**
 * Icon Generation Test Script
 *
 * Tests the Imagen 3.0 icon generation with a real vehicle image.
 * Usage: npm run test:icon
 */

// Load environment variables FIRST before any other imports
import { config } from 'dotenv';
config();

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateVehicleIcon } from '../services/geminiService.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT_IMAGE_PATH = path.join(PROJECT_ROOT, 'assets', 'democarimage.png');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'test-output');

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(path.join(OUTPUT_DIR, '.gitkeep'), '');
    }
}

/**
 * Read and convert image to base64
 */
function readImageAsBase64(imagePath: string): string {
    console.log(`📖 Reading image: ${imagePath}`);

    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image not found: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');

    const sizeKB = (base64.length * 3) / 4 / 1024;
    console.log(`✓ Image loaded: ${sizeKB.toFixed(2)} KB`);

    return base64;
}

/**
 * Save generated icon to file
 */
function saveGeneratedIcon(base64Data: string, filename: string): string {
    const outputPath = path.join(OUTPUT_DIR, filename);
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(outputPath, imageBuffer);

    const sizeKB = imageBuffer.length / 1024;
    console.log(`✓ Saved: ${outputPath} (${sizeKB.toFixed(2)} KB)`);

    return outputPath;
}

/**
 * Create comparison HTML
 */
function createComparisonHTML(inputPath: string, outputPath: string): string {
    const htmlPath = path.join(OUTPUT_DIR, 'comparison.html');
    const inputBase64 = fs.readFileSync(inputPath).toString('base64');
    const outputBase64 = fs.readFileSync(outputPath).toString('base64');

    const html = `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Icon Generation Comparison</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            padding: 40px 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
            padding: 40px;
        }
        h1 {
            text-align: center;
            margin-bottom: 40px;
            color: #333;
        }
        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .image-box {
            text-align: center;
        }
        .image-box h2 {
            font-size: 18px;
            margin-bottom: 20px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
        }
        .image-container {
            background: #fafafa;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        .original img {
            max-height: 400px;
            object-fit: contain;
        }
        .generated img {
            max-height: 400px;
            object-fit: contain;
        }
        .info {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            margin-top: 40px;
            border-radius: 8px;
        }
        .info h3 {
            margin-bottom: 10px;
            color: #0369a1;
        }
        .info p {
            color: #075985;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            color: #999;
            font-size: 14px;
        }
        @media (max-width: 768px) {
            .comparison {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Icon Generation: Before & After</h1>

        <div class="comparison">
            <div class="image-box original">
                <h2>📷 Original Photo</h2>
                <div class="image-container">
                    <img src="data:image/png;base64,${inputBase64}" alt="Original vehicle photo" />
                </div>
            </div>

            <div class="image-box generated">
                <h2>✨ Generated Icon (Imagen 3.0)</h2>
                <div class="image-container">
                    <img src="data:image/png;base64,${outputBase64}" alt="Generated flat design icon" />
                </div>
            </div>
        </div>

        <div class="info">
            <h3>ℹ️ About This Generation</h3>
            <p><strong>Model:</strong> Imagen 3.0 (imagen-3.0-generate-001)</p>
            <p><strong>Style:</strong> Flat design, minimalist, side profile</p>
            <p><strong>Technique:</strong> Style transfer from reference image</p>
            <p><strong>Format:</strong> PNG (raster image)</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString('sv-SE')}</p>
        </div>

        <div class="footer">
            Generated by Elton VanPlan Icon Test Script
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, html);
    console.log(`✓ Comparison HTML: ${htmlPath}`);

    return htmlPath;
}

/**
 * Open file in default application (cross-platform)
 */
async function openFile(filePath: string) {
    const { default: open } = await import('open');
    await open(filePath);
}

/**
 * Main test function
 */
async function main() {
    console.log('🚀 Starting Icon Generation Test...\n');

    // Check for API key
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: VITE_GEMINI_API_KEY environment variable is not set');
        console.error('   Set it with: export VITE_GEMINI_API_KEY=your-api-key');
        process.exit(1);
    }

    try {
        // Ensure output directory exists
        ensureOutputDir();

        // Read input image
        const imageBase64 = readImageAsBase64(INPUT_IMAGE_PATH);

        // Generate icon
        console.log('\n🎨 Calling Imagen 3.0 API...');
        console.log('   (This may take 10-30 seconds)');

        const startTime = Date.now();
        const generatedIconBase64 = await generateVehicleIcon({ imageBase64 }, 2);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        if (!generatedIconBase64) {
            console.error('\n❌ Icon generation failed - API returned null');
            console.error('   Check the error logs above for details');
            process.exit(1);
        }

        console.log(`✓ Generation completed in ${duration}s\n`);

        // Save generated icon
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
        const outputFilename = `icon-${timestamp}.png`;
        const outputPath = saveGeneratedIcon(generatedIconBase64, outputFilename);

        // Create comparison HTML
        console.log('\n📊 Creating comparison view...');
        const htmlPath = createComparisonHTML(INPUT_IMAGE_PATH, outputPath);

        // Success summary
        console.log('\n✅ Test completed successfully!\n');
        console.log('📁 Output files:');
        console.log(`   - Icon: ${outputPath}`);
        console.log(`   - HTML: ${htmlPath}`);

        // Open comparison in browser
        console.log('\n🌐 Opening comparison in browser...');
        await openFile(htmlPath);

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
