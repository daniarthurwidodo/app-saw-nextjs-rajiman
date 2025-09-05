import { generateFromFile } from 'quick-erd';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema.sql');
const outputPath = path.join(__dirname, '..', 'docs', 'erd.svg');

async function generateERD() {
  try {
    console.log('🔧 Generating ERD diagram...');
    await generateFromFile(schemaPath, {
      outputFormat: 'svg',
      output: outputPath,
      graphvizPath: null, // Will use system's graphviz if installed
    });
    console.log('✅ ERD diagram generated successfully!');
    console.log(`📍 Output location: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating ERD:', error);
  }
}

generateERD();
