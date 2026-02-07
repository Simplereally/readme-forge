/**
 * Project Analyzer
 * Detects project type and extracts metadata
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse TOML files (basic parser for pyproject.toml and Cargo.toml)
 */
function parseToml(content) {
  const result = {};
  let currentSection = result;
  let currentSectionName = '';

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSectionName = sectionMatch[1];
      const parts = currentSectionName.split('.');
      currentSection = result;
      for (const part of parts) {
        if (!currentSection[part]) currentSection[part] = {};
        currentSection = currentSection[part];
      }
      continue;
    }

    // Key-value pair
    const kvMatch = trimmed.match(/^([^=]+)=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let value = kvMatch[2].trim();
      
      // Parse value
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      } else if (!isNaN(value)) {
        value = Number(value);
      }
      
      currentSection[key] = value;
    }
  }

  return result;
}

/**
 * Analyze a directory structure
 */
function analyzeStructure(dir) {
  const structure = {
    hasTests: false,
    hasDocs: false,
    hasExamples: false,
    hasSrc: false,
    hasLib: false,
    hasBin: false,
    hasConfig: false,
    hasCI: false,
    mainFiles: [],
    directories: []
  };

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.')) {
        // Check for CI
        if (entry.name === '.github' || entry.name === '.gitlab-ci.yml') {
          structure.hasCI = true;
        }
        continue;
      }

      if (entry.isDirectory()) {
        structure.directories.push(entry.name);
        
        const lower = entry.name.toLowerCase();
        if (lower === 'test' || lower === 'tests' || lower === '__tests__' || lower === 'spec') {
          structure.hasTests = true;
        } else if (lower === 'docs' || lower === 'documentation') {
          structure.hasDocs = true;
        } else if (lower === 'examples' || lower === 'example') {
          structure.hasExamples = true;
        } else if (lower === 'src' || lower === 'source') {
          structure.hasSrc = true;
        } else if (lower === 'lib') {
          structure.hasLib = true;
        } else if (lower === 'bin') {
          structure.hasBin = true;
        } else if (lower === 'config') {
          structure.hasConfig = true;
        }
      } else {
        // Track important files
        const lower = entry.name.toLowerCase();
        if (lower.endsWith('.md') || lower === 'makefile' || lower === 'dockerfile') {
          structure.mainFiles.push(entry.name);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return structure;
}

/**
 * Extract features from source code
 */
function extractFeatures(dir, projectType) {
  const features = [];
  
  // Check for common patterns
  const structure = analyzeStructure(dir);
  
  if (structure.hasTests) {
    features.push('Comprehensive test suite');
  }
  if (structure.hasDocs) {
    features.push('Detailed documentation');
  }
  if (structure.hasExamples) {
    features.push('Example code included');
  }
  if (structure.hasCI) {
    features.push('CI/CD integration');
  }
  if (structure.hasBin) {
    features.push('CLI support');
  }

  // Type-specific features
  if (projectType === 'node') {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.bin) features.push('Executable CLI tool');
      if (pkg.types || pkg.typings) features.push('TypeScript definitions');
      if (pkg.scripts?.test) features.push('Test scripts configured');
      if (pkg.scripts?.build) features.push('Build system configured');
    } catch (e) {}
  }

  return features;
}

/**
 * Detect scripts/commands available
 */
function detectScripts(dir, projectType) {
  const scripts = {};

  if (projectType === 'node') {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.scripts) {
        Object.assign(scripts, pkg.scripts);
      }
    } catch (e) {}
  }

  // Check for Makefile
  const makefilePath = path.join(dir, 'Makefile');
  if (fs.existsSync(makefilePath)) {
    try {
      const content = fs.readFileSync(makefilePath, 'utf8');
      const targets = content.match(/^([a-zA-Z_-]+):/gm);
      if (targets) {
        for (const target of targets) {
          const name = target.replace(':', '');
          if (!name.startsWith('.')) {
            scripts[`make ${name}`] = 'Makefile target';
          }
        }
      }
    } catch (e) {}
  }

  return scripts;
}

/**
 * Main analyzer function
 */
async function analyzeProject(dir) {
  const analysis = {
    dir,
    detected: false,
    type: 'unknown',
    name: path.basename(dir),
    description: '',
    version: '',
    author: '',
    license: '',
    repository: '',
    homepage: '',
    keywords: [],
    dependencies: [],
    devDependencies: [],
    scripts: {},
    features: [],
    structure: {},
    installCommand: '',
    runCommand: '',
    buildCommand: '',
    testCommand: ''
  };

  // Check for Node.js project
  const packageJsonPath = path.join(dir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      analysis.detected = true;
      analysis.type = 'node';
      analysis.name = pkg.name || analysis.name;
      analysis.description = pkg.description || '';
      analysis.version = pkg.version || '';
      analysis.author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '';
      analysis.license = pkg.license || '';
      analysis.repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url || '';
      analysis.homepage = pkg.homepage || '';
      analysis.keywords = pkg.keywords || [];
      analysis.dependencies = Object.keys(pkg.dependencies || {});
      analysis.devDependencies = Object.keys(pkg.devDependencies || {});
      analysis.scripts = pkg.scripts || {};
      
      // Commands
      analysis.installCommand = 'npm install';
      if (pkg.bin) {
        const binName = typeof pkg.bin === 'string' ? analysis.name : Object.keys(pkg.bin)[0];
        analysis.runCommand = `npx ${binName}`;
      } else if (pkg.main) {
        analysis.runCommand = `node ${pkg.main}`;
      }
      if (pkg.scripts?.build) analysis.buildCommand = 'npm run build';
      if (pkg.scripts?.test) analysis.testCommand = 'npm test';
    } catch (e) {
      // Invalid JSON
    }
  }

  // Check for Python project
  const pyprojectPath = path.join(dir, 'pyproject.toml');
  const setupPyPath = path.join(dir, 'setup.py');
  const requirementsPath = path.join(dir, 'requirements.txt');
  
  if (fs.existsSync(pyprojectPath)) {
    try {
      const content = fs.readFileSync(pyprojectPath, 'utf8');
      const toml = parseToml(content);
      
      analysis.detected = true;
      analysis.type = 'python';
      
      const project = toml.project || toml.tool?.poetry || {};
      analysis.name = project.name || analysis.name;
      analysis.description = project.description || '';
      analysis.version = project.version || '';
      analysis.license = project.license || '';
      analysis.keywords = project.keywords || [];
      
      if (project.authors) {
        analysis.author = Array.isArray(project.authors) ? project.authors[0] : project.authors;
      }
      
      analysis.installCommand = 'pip install .';
      analysis.runCommand = `python -m ${analysis.name.replace(/-/g, '_')}`;
      if (toml.tool?.pytest) analysis.testCommand = 'pytest';
    } catch (e) {}
  } else if (fs.existsSync(setupPyPath) || fs.existsSync(requirementsPath)) {
    analysis.detected = true;
    analysis.type = 'python';
    analysis.installCommand = fs.existsSync(setupPyPath) ? 'pip install .' : 'pip install -r requirements.txt';
  }

  // Check for Go project
  const goModPath = path.join(dir, 'go.mod');
  if (fs.existsSync(goModPath)) {
    try {
      const content = fs.readFileSync(goModPath, 'utf8');
      const moduleMatch = content.match(/module\s+(.+)/);
      
      analysis.detected = true;
      analysis.type = 'go';
      
      if (moduleMatch) {
        const modulePath = moduleMatch[1].trim();
        analysis.name = modulePath.split('/').pop();
        analysis.repository = modulePath.startsWith('github.com') ? `https://${modulePath}` : '';
      }
      
      analysis.installCommand = 'go install';
      analysis.runCommand = `go run .`;
      analysis.buildCommand = 'go build';
      analysis.testCommand = 'go test ./...';
    } catch (e) {}
  }

  // Check for Rust project
  const cargoPath = path.join(dir, 'Cargo.toml');
  if (fs.existsSync(cargoPath)) {
    try {
      const content = fs.readFileSync(cargoPath, 'utf8');
      const toml = parseToml(content);
      
      analysis.detected = true;
      analysis.type = 'rust';
      
      const pkg = toml.package || {};
      analysis.name = pkg.name || analysis.name;
      analysis.description = pkg.description || '';
      analysis.version = pkg.version || '';
      analysis.license = pkg.license || '';
      analysis.repository = pkg.repository || '';
      analysis.homepage = pkg.homepage || '';
      analysis.keywords = pkg.keywords || [];
      
      if (pkg.authors) {
        analysis.author = Array.isArray(pkg.authors) ? pkg.authors[0] : pkg.authors;
      }
      
      analysis.installCommand = 'cargo install --path .';
      analysis.runCommand = 'cargo run';
      analysis.buildCommand = 'cargo build --release';
      analysis.testCommand = 'cargo test';
    } catch (e) {}
  }

  // Analyze structure and features
  analysis.structure = analyzeStructure(dir);
  analysis.features = extractFeatures(dir, analysis.type);
  analysis.scripts = { ...analysis.scripts, ...detectScripts(dir, analysis.type) };

  return analysis;
}

module.exports = { analyzeProject, analyzeStructure, parseToml };
