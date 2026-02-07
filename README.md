# readme-forge

[![npm version](https://img.shields.io/npm/v/readme-forge.svg)](https://www.npmjs.com/package/readme-forge)
[![npm downloads](https://img.shields.io/npm/dm/readme-forge.svg)](https://www.npmjs.com/package/readme-forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 🔨 AI-powered README generator that analyzes your codebase and creates beautiful documentation — no API keys required!

## Why readme-forge?

Writing a good README is time-consuming. **readme-forge** analyzes your project structure and generates comprehensive documentation in seconds:

- 🔍 **Smart Analysis** — Detects project type and extracts metadata automatically
- 📝 **Beautiful Output** — Generates well-structured markdown with badges, ToC, and proper formatting  
- 🌐 **Multi-Language** — Supports Node.js, Python, Go, and Rust projects
- 🔒 **Offline First** — Works without API keys or internet (uses heuristics, not AI APIs)
- ⚡ **Zero Config** — Just run `npx readme-forge` and you're done

## Installation

```bash
# Run directly (no install needed)
npx readme-forge

# Or install globally
npm install -g readme-forge
```

## Usage

```bash
# Generate README for current directory
readme-forge

# Generate for specific directory  
readme-forge ./my-project

# Force overwrite existing README
readme-forge --force

# Output to custom file
readme-forge --output DOCS.md
```

### What Gets Generated

- **Title & Description** — Extracted from package.json, Cargo.toml, etc.
- **Badges** — npm/PyPI/crates.io version, downloads, license, GitHub stars
- **Features List** — Detected from project structure (tests, CI, docs, etc.)
- **Installation** — Language-appropriate instructions (npm, pip, cargo, go)
- **Usage Examples** — Code snippets for your language
- **API Documentation** — Available commands and CLI options
- **Contributing Guidelines** — Standard contribution workflow
- **License** — Auto-detected from project metadata

## Supported Projects

| Type | Detection Files |
|------|-----------------|
| **Node.js** | `package.json` |
| **Python** | `pyproject.toml`, `setup.py`, `requirements.txt` |
| **Go** | `go.mod` |
| **Rust** | `Cargo.toml` |

## CLI Options

```
readme-forge [directory] [options]

Options:
  -h, --help       Show help message
  -v, --version    Show version number
  -f, --force      Overwrite existing README.md
  -o, --output     Output file path (default: README.md)
```

## Examples

### Node.js Project

```bash
$ cd my-express-app
$ readme-forge

🔨 readme-forge - Analyzing your project...

✅ Detected: node project
📦 Name: my-express-app
📝 Description: A REST API server

✨ Generated: README.md
   87 lines, 2.1KB
```

### Rust Project

```bash
$ cd my-cli-tool  
$ readme-forge --force

🔨 readme-forge - Analyzing your project...

✅ Detected: rust project
📦 Name: my-cli-tool

✨ Generated: README.md
   92 lines, 2.4KB
```

## Philosophy

- **Zero dependencies** — Pure Node.js, nothing to break
- **Offline first** — Your code never leaves your machine
- **Sensible defaults** — Works great out of the box
- **Customizable output** — Edit the generated README as needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Simplereally](https://github.com/Simplereally)
