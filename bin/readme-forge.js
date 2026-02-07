#!/usr/bin/env node

/**
 * readme-forge CLI
 * AI-powered README generator
 */

const fs = require('fs');
const path = require('path');
const { analyzeProject } = require('../src/analyzer');
const { generateReadme } = require('../src/generator');

const VERSION = '1.0.0';

// CLI argument parsing
const args = process.argv.slice(2);
const flags = {
  help: args.includes('--help') || args.includes('-h'),
  version: args.includes('--version') || args.includes('-v'),
  force: args.includes('--force') || args.includes('-f'),
  output: null,
  dir: process.cwd()
};

// Parse --output flag
const outputIdx = args.findIndex(a => a === '--output' || a === '-o');
if (outputIdx !== -1 && args[outputIdx + 1]) {
  flags.output = args[outputIdx + 1];
}

// Parse directory argument (first non-flag argument)
const dirArg = args.find(a => !a.startsWith('-') && a !== flags.output);
if (dirArg) {
  flags.dir = path.resolve(dirArg);
}

// Help text
const helpText = `
readme-forge v${VERSION}
AI-powered README generator

Usage:
  readme-forge [directory] [options]
  npx readme-forge [directory] [options]

Options:
  -h, --help       Show this help message
  -v, --version    Show version number
  -f, --force      Overwrite existing README.md
  -o, --output     Output file path (default: README.md)

Examples:
  readme-forge                  Generate README for current directory
  readme-forge ./my-project     Generate README for specific directory
  readme-forge -o DOCS.md       Output to custom file
  readme-forge --force          Overwrite existing README

Supported Projects:
  • Node.js (package.json)
  • Python (pyproject.toml, setup.py, requirements.txt)
  • Go (go.mod)
  • Rust (Cargo.toml)

More info: https://github.com/Simplereally/readme-forge
`;

// Handle flags
if (flags.help) {
  console.log(helpText);
  process.exit(0);
}

if (flags.version) {
  console.log(`readme-forge v${VERSION}`);
  process.exit(0);
}

// Main execution
async function main() {
  console.log('\n🔨 readme-forge - Analyzing your project...\n');

  // Check directory exists
  if (!fs.existsSync(flags.dir)) {
    console.error(`❌ Error: Directory not found: ${flags.dir}`);
    process.exit(1);
  }

  // Check for existing README
  const outputPath = flags.output || path.join(flags.dir, 'README.md');
  if (fs.existsSync(outputPath) && !flags.force) {
    console.error(`❌ Error: ${path.basename(outputPath)} already exists.`);
    console.error('   Use --force to overwrite, or --output to specify a different file.\n');
    process.exit(1);
  }

  try {
    // Analyze project
    const analysis = await analyzeProject(flags.dir);
    
    if (!analysis.detected) {
      console.log('⚠️  Could not detect project type.');
      console.log('   Creating a basic README template...\n');
    } else {
      console.log(`✅ Detected: ${analysis.type} project`);
      console.log(`📦 Name: ${analysis.name || 'Unknown'}`);
      if (analysis.description) {
        console.log(`📝 Description: ${analysis.description}`);
      }
      console.log('');
    }

    // Generate README
    const readme = generateReadme(analysis);

    // Write output
    fs.writeFileSync(outputPath, readme);
    console.log(`✨ Generated: ${outputPath}`);
    console.log(`   ${readme.split('\n').length} lines, ${readme.length} bytes\n`);
    
    // Tips
    console.log('💡 Tips:');
    console.log('   • Review and customize the generated README');
    console.log('   • Add screenshots or GIFs for visual appeal');
    console.log('   • Keep your README up to date!\n');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
