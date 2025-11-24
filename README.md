# npm-revdeps

> CLI tool to find all packages that depend on a given npm package using ecosyste.ms

[![CI/CD](https://github.com/tupe12334/npm-revdeps/actions/workflows/ci.yml/badge.svg)](https://github.com/tupe12334/npm-revdeps/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/npm-revdeps.svg)](https://www.npmjs.com/package/npm-revdeps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔍 Find all packages that depend on any npm package
- 🎨 Colorized terminal output for better readability
- 📊 JSON output support for scripting and automation
- 🔢 Filter by minimum downloads
- 📈 Sort by downloads or name
- 🎯 Limit number of results
- ⚡ Fast and efficient using ecosyste.ms API

## Installation

```bash
# Install globally
npm install -g npm-revdeps

# Or use with npx (no installation required)
npx npm-revdeps <package-name>
```

## Usage

### Basic Usage

```bash
# Find packages that depend on express
npm-revdeps express

# Find packages that depend on react
npm-revdeps react
```

### Advanced Options

```bash
# Output as JSON
npm-revdeps express --json

# Filter by minimum downloads (e.g., 1000+ downloads)
npm-revdeps express --min-downloads 1000

# Limit results to top 10
npm-revdeps express --limit 10

# Sort by name instead of downloads
npm-revdeps express --sort name

# Combine options
npm-revdeps express --min-downloads 5000 --limit 20 --sort downloads
```

### Command Line Options

```
Usage: npm-revdeps [options] [package]

Arguments:
  package                        npm package name to query

Options:
  -V, --version                  output the version number
  -j, --json                     output as JSON
  -m, --min-downloads <number>   filter by minimum downloads
  -l, --limit <number>           limit number of results
  -s, --sort <type>              sort results by: downloads, name (default: "downloads")
  -h, --help                     display help for command
```

## Programmatic Usage

You can also use `npm-revdeps` as a library in your Node.js projects:

```typescript
import { getReverseDependencies } from 'npm-revdeps'

// Get all reverse dependencies
const deps = await getReverseDependencies('express')

// With filtering options
const filteredDeps = await getReverseDependencies('express', {
  minDownloads: 1000,
  maxResults: 50,
  sort: 'downloads',
})

console.log(filteredDeps)
```

## Output Format

### Terminal Output

```
📦 Packages that depend on express:
────────────────────────────────────────────────────────────

Found 1000 dependent packages:

  1. body-parser@1.20.2 (10,000,000 downloads)
     📂 https://github.com/expressjs/body-parser
  2. compression@1.7.4 (5,000,000 downloads)
     📂 https://github.com/expressjs/compression
  ...

────────────────────────────────────────────────────────────
Total: 1000 packages
```

### JSON Output

```json
{
  "total": 1000,
  "packages": [
    {
      "name": "body-parser",
      "version": "1.20.2",
      "downloads": 10000000,
      "repository": "https://github.com/expressjs/body-parser",
      "homepage": "https://github.com/expressjs/body-parser"
    }
  ]
}
```

## API

The package uses the [ecosyste.ms](https://ecosyste.ms) API to fetch reverse dependency data.

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and contribution guidelines.

### Quick Start

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Format code
pnpm format
```

## License

MIT © [Your Name](LICENSE)

## Credits

Data provided by [ecosyste.ms](https://ecosyste.ms)
