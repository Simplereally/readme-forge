/**
 * README Generator
 * Creates beautiful markdown documentation
 */

const path = require('path');

/**
 * Generate badges based on project analysis
 */
function generateBadges(analysis) {
  const badges = [];
  
  // NPM badges for Node.js projects
  if (analysis.type === 'node' && analysis.name && !analysis.name.startsWith('.')) {
    badges.push(`[![npm version](https://img.shields.io/npm/v/${analysis.name}.svg)](https://www.npmjs.com/package/${analysis.name})`);
    badges.push(`[![npm downloads](https://img.shields.io/npm/dm/${analysis.name}.svg)](https://www.npmjs.com/package/${analysis.name})`);
  }
  
  // Crates.io badges for Rust
  if (analysis.type === 'rust' && analysis.name) {
    badges.push(`[![Crates.io](https://img.shields.io/crates/v/${analysis.name}.svg)](https://crates.io/crates/${analysis.name})`);
    badges.push(`[![Crates.io](https://img.shields.io/crates/d/${analysis.name}.svg)](https://crates.io/crates/${analysis.name})`);
  }
  
  // PyPI badges for Python
  if (analysis.type === 'python' && analysis.name) {
    badges.push(`[![PyPI version](https://img.shields.io/pypi/v/${analysis.name}.svg)](https://pypi.org/project/${analysis.name}/)`);
    badges.push(`[![PyPI downloads](https://img.shields.io/pypi/dm/${analysis.name}.svg)](https://pypi.org/project/${analysis.name}/)`);
  }
  
  // License badge
  if (analysis.license) {
    const licenseSlug = analysis.license.toLowerCase().replace(/\s+/g, '_');
    badges.push(`[![License: ${analysis.license}](https://img.shields.io/badge/License-${encodeURIComponent(analysis.license)}-blue.svg)](LICENSE)`);
  }
  
  // GitHub badges if repo detected
  if (analysis.repository && analysis.repository.includes('github.com')) {
    const repoMatch = analysis.repository.match(/github\.com[\/:]([^\/]+\/[^\/\.]+)/);
    if (repoMatch) {
      const repo = repoMatch[1];
      badges.push(`[![GitHub stars](https://img.shields.io/github/stars/${repo}.svg?style=social)](https://github.com/${repo})`);
    }
  }
  
  return badges;
}

/**
 * Generate installation section
 */
function generateInstallation(analysis) {
  const lines = [];
  
  switch (analysis.type) {
    case 'node':
      lines.push('```bash');
      lines.push(`# Using npm`);
      lines.push(`npm install ${analysis.name}`);
      lines.push('');
      lines.push('# Using yarn');
      lines.push(`yarn add ${analysis.name}`);
      lines.push('');
      lines.push('# Using pnpm');
      lines.push(`pnpm add ${analysis.name}`);
      
      // Check if it's a CLI tool
      if (analysis.scripts && Object.keys(analysis.scripts).some(k => k.includes('bin')) || analysis.runCommand?.includes('npx')) {
        lines.push('');
        lines.push('# Or run directly with npx');
        lines.push(`npx ${analysis.name}`);
      }
      lines.push('```');
      break;
      
    case 'python':
      lines.push('```bash');
      lines.push('# Using pip');
      lines.push(`pip install ${analysis.name}`);
      lines.push('');
      lines.push('# Using poetry');
      lines.push(`poetry add ${analysis.name}`);
      lines.push('```');
      break;
      
    case 'go':
      lines.push('```bash');
      lines.push(`go install ${analysis.repository || analysis.name}@latest`);
      lines.push('```');
      break;
      
    case 'rust':
      lines.push('```bash');
      lines.push('# Using cargo');
      lines.push(`cargo install ${analysis.name}`);
      lines.push('');
      lines.push('# Or add to Cargo.toml');
      lines.push('```');
      lines.push('');
      lines.push('```toml');
      lines.push('[dependencies]');
      lines.push(`${analysis.name} = "${analysis.version || '*'}"`);
      lines.push('```');
      break;
      
    default:
      lines.push('```bash');
      lines.push('# Clone the repository');
      lines.push(`git clone ${analysis.repository || `https://github.com/username/${analysis.name}`}`);
      lines.push(`cd ${analysis.name}`);
      if (analysis.installCommand) {
        lines.push('');
        lines.push('# Install dependencies');
        lines.push(analysis.installCommand);
      }
      lines.push('```');
  }
  
  return lines.join('\n');
}

/**
 * Generate usage section
 */
function generateUsage(analysis) {
  const lines = [];
  
  switch (analysis.type) {
    case 'node':
      if (analysis.runCommand?.includes('npx')) {
        lines.push('```bash');
        lines.push(analysis.runCommand);
        lines.push('```');
        lines.push('');
        lines.push('Or use programmatically:');
        lines.push('');
      }
      lines.push('```javascript');
      lines.push(`const ${toCamelCase(analysis.name)} = require('${analysis.name}');`);
      lines.push('');
      lines.push('// Example usage');
      lines.push(`// ${toCamelCase(analysis.name)}.doSomething();`);
      lines.push('```');
      break;
      
    case 'python':
      lines.push('```python');
      lines.push(`import ${analysis.name.replace(/-/g, '_')}`);
      lines.push('');
      lines.push('# Example usage');
      lines.push(`# ${analysis.name.replace(/-/g, '_')}.do_something()`);
      lines.push('```');
      break;
      
    case 'go':
      lines.push('```go');
      lines.push(`import "${analysis.repository || analysis.name}"`);
      lines.push('');
      lines.push('func main() {');
      lines.push('    // Example usage');
      lines.push('}');
      lines.push('```');
      break;
      
    case 'rust':
      lines.push('```rust');
      lines.push(`use ${analysis.name.replace(/-/g, '_')};`);
      lines.push('');
      lines.push('fn main() {');
      lines.push('    // Example usage');
      lines.push('}');
      lines.push('```');
      break;
      
    default:
      if (analysis.runCommand) {
        lines.push('```bash');
        lines.push(analysis.runCommand);
        lines.push('```');
      } else {
        lines.push('```bash');
        lines.push('# Add usage examples here');
        lines.push('```');
      }
  }
  
  return lines.join('\n');
}

/**
 * Generate API documentation section
 */
function generateApi(analysis) {
  const lines = [];
  
  lines.push('### Available Commands');
  lines.push('');
  
  if (analysis.type === 'node' && analysis.scripts && Object.keys(analysis.scripts).length > 0) {
    lines.push('| Command | Description |');
    lines.push('|---------|-------------|');
    
    for (const [name, script] of Object.entries(analysis.scripts)) {
      if (name !== 'test' && name !== 'build' && name !== 'start') continue;
      lines.push(`| \`npm run ${name}\` | ${describeScript(name, script)} |`);
    }
    lines.push('');
  }
  
  // CLI options if applicable
  if (analysis.runCommand?.includes('npx') || analysis.structure?.hasBin) {
    lines.push('### CLI Options');
    lines.push('');
    lines.push('```');
    lines.push(`${analysis.name} [options]`);
    lines.push('');
    lines.push('Options:');
    lines.push('  -h, --help     Show help message');
    lines.push('  -v, --version  Show version number');
    lines.push('```');
  }
  
  return lines.join('\n');
}

/**
 * Generate features section
 */
function generateFeatures(analysis) {
  const features = [...analysis.features];
  
  // Add generic features based on type
  if (features.length === 0) {
    switch (analysis.type) {
      case 'node':
        features.push('Easy to use API');
        features.push('Zero/minimal dependencies');
        features.push('Well documented');
        break;
      case 'python':
        features.push('Pythonic API design');
        features.push('Type hints support');
        features.push('Well documented');
        break;
      case 'go':
        features.push('Fast and efficient');
        features.push('Simple API');
        features.push('Well documented');
        break;
      case 'rust':
        features.push('Memory safe');
        features.push('High performance');
        features.push('Well documented');
        break;
      default:
        features.push('Easy to use');
        features.push('Well documented');
    }
  }
  
  return features.map(f => `- ${f}`).join('\n');
}

/**
 * Generate contributing section
 */
function generateContributing(analysis) {
  return `Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.`;
}

/**
 * Main generator function
 */
function generateReadme(analysis) {
  const sections = [];
  
  // Title
  const title = formatTitle(analysis.name);
  sections.push(`# ${title}`);
  sections.push('');
  
  // Badges
  const badges = generateBadges(analysis);
  if (badges.length > 0) {
    sections.push(badges.join(' '));
    sections.push('');
  }
  
  // Description
  if (analysis.description) {
    sections.push(`> ${analysis.description}`);
  } else {
    sections.push(`> A ${analysis.type || 'project'} project`);
  }
  sections.push('');
  
  // Table of Contents
  sections.push('## Table of Contents');
  sections.push('');
  sections.push('- [Features](#features)');
  sections.push('- [Installation](#installation)');
  sections.push('- [Usage](#usage)');
  sections.push('- [API](#api)');
  sections.push('- [Contributing](#contributing)');
  sections.push('- [License](#license)');
  sections.push('');
  
  // Features
  sections.push('## Features');
  sections.push('');
  sections.push(generateFeatures(analysis));
  sections.push('');
  
  // Installation
  sections.push('## Installation');
  sections.push('');
  sections.push(generateInstallation(analysis));
  sections.push('');
  
  // Usage
  sections.push('## Usage');
  sections.push('');
  sections.push(generateUsage(analysis));
  sections.push('');
  
  // API
  sections.push('## API');
  sections.push('');
  sections.push(generateApi(analysis));
  sections.push('');
  
  // Contributing
  sections.push('## Contributing');
  sections.push('');
  sections.push(generateContributing(analysis));
  sections.push('');
  
  // License
  sections.push('## License');
  sections.push('');
  if (analysis.license) {
    sections.push(`This project is licensed under the ${analysis.license} License - see the [LICENSE](LICENSE) file for details.`);
  } else {
    sections.push('This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.');
  }
  sections.push('');
  
  // Footer
  if (analysis.author) {
    sections.push('---');
    sections.push('');
    sections.push(`Made with ❤️ by ${analysis.author}`);
  }
  
  return sections.join('\n');
}

// Helper functions

function formatTitle(name) {
  if (!name) return 'Project';
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toCamelCase(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toLowerCase());
}

function describeScript(name, script) {
  const descriptions = {
    test: 'Run tests',
    build: 'Build the project',
    start: 'Start the application',
    dev: 'Run in development mode',
    lint: 'Run linter',
    format: 'Format code'
  };
  return descriptions[name] || script.substring(0, 50);
}

module.exports = { generateReadme, generateBadges, generateInstallation };
