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
import type { FilterOptions } from './types.js'

const program = new Command()

program
  .name('npm-revdeps')
  .description(
    'Find all packages that depend on a given npm package using ecosyste.ms'
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
  .action(async (packageName?: string, options?) => {
    try {
      // If no package name provided, prompt for it (interactive mode)
      if (!packageName) {
        console.error('Error: package name is required')
        console.log('Usage: npm-revdeps <package-name>')
        process.exit(1)
      }

      const spinner = options.json
        ? null
        : ora('Fetching reverse dependencies...').start()

      // Fetch dependencies
      const dependencies = await fetchReverseDependencies(packageName)

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
