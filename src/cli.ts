#!/usr/bin/env node

/**
 * CLI entry point for npm-revdeps
 */

import { Command } from 'commander'
import ora from 'ora'
import { fetchReverseDependencies } from './api.js'
import {
  filterDependencies,
  formatAsJson,
  formatForTerminal,
} from './formatter.js'
import type { ApiOptions, FilterOptions } from './types.js'

const program = new Command()

program
  .name('npm-revdeps')
  .description(
    'Find all packages that depend on a given npm package using multiple API providers'
  )
  .version('0.0.0')
  .argument('[package]', 'npm package name to query')
  .option('-j, --json', 'output as JSON')
  .option(
    '-m, --min-downloads <number>',
    'filter by minimum downloads',
    parseInt
  )
  .option('-l, --limit <number>', 'limit number of results', parseInt)
  .option('-s, --sort <type>', 'sort results by: downloads, name', 'downloads')
  .option(
    '-p, --provider <type>',
    'API provider: ecosystems, librariesio',
    'ecosystems'
  )
  .option(
    '-k, --api-key <key>',
    'Libraries.io API key (required for librariesio provider)'
  )
  .option(
    '--no-fallback',
    'disable automatic fallback to alternative API provider'
  )
  .action(async (packageName?: string, options?) => {
    try {
      // If no package name provided, prompt for it (interactive mode)
      if (!packageName) {
        console.error('Error: package name is required')
        console.log('Usage: npm-revdeps <package-name>')
        process.exit(1)
      }

      // Validate provider
      if (
        options.provider !== 'ecosystems' &&
        options.provider !== 'librariesio'
      ) {
        console.error(
          `Error: Invalid provider "${options.provider}". Must be "ecosystems" or "librariesio"`
        )
        process.exit(1)
      }

      // Check for API key when using librariesio
      const apiKey =
        options.apiKey || process.env.LIBRARIESIO_API_KEY || undefined

      if (options.provider === 'librariesio' && !apiKey && !options.fallback) {
        console.error(
          'Error: Libraries.io API key required. Provide via --api-key or LIBRARIESIO_API_KEY env variable'
        )
        console.log('Get your free API key from: https://libraries.io/account')
        process.exit(1)
      }

      const spinner = options.json
        ? null
        : ora('Fetching reverse dependencies...').start()

      // Prepare API options
      const apiOptions: ApiOptions = {
        provider: options.provider,
        librariesioApiKey: apiKey,
        enableFallback: options.fallback !== false,
      }

      // Fetch dependencies
      const dependencies = await fetchReverseDependencies(
        packageName,
        apiOptions
      )

      if (spinner) {
        spinner.succeed(`Found ${dependencies.length} dependent packages`)
      }

      // Apply filters
      const filterOptions: FilterOptions = {
        minDownloads: options.minDownloads,
        maxResults: options.limit,
        sort: options.sort,
      }

      const filtered = filterDependencies(dependencies, filterOptions)

      // Output results
      if (options.json) {
        console.log(formatAsJson(filtered))
      } else {
        console.log(formatForTerminal(packageName, filtered))
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`)
      } else {
        console.error('An unexpected error occurred')
      }
      process.exit(1)
    }
  })

program.parse()
