/**
 * Output formatters for CLI
 */

import chalk from 'chalk'
import type { Dependency, FilterOptions } from './types.js'

/**
 * Apply filters to dependency list
 */
export function filterDependencies(
  dependencies: Dependency[],
  options?: FilterOptions
): Dependency[] {
  let filtered = [...dependencies]

  if (options?.minDownloads !== undefined) {
    filtered = filtered.filter(
      dep => (dep.downloads || 0) >= (options.minDownloads || 0)
    )
  }

  if (options?.sort) {
    filtered.sort((a, b) => {
      if (options.sort === 'downloads') {
        return (b.downloads || 0) - (a.downloads || 0)
      }
      return a.name.localeCompare(b.name)
    })
  }

  if (options?.maxResults !== undefined) {
    filtered = filtered.slice(0, options.maxResults)
  }

  return filtered
}

/**
 * Format dependencies as JSON
 */
export function formatAsJson(dependencies: Dependency[]): string {
  return JSON.stringify(
    {
      total: dependencies.length,
      packages: dependencies,
    },
    null,
    2
  )
}

/**
 * Format dependencies for terminal output with colors
 */
export function formatForTerminal(
  packageName: string,
  dependencies: Dependency[]
): string {
  const lines: string[] = []

  lines.push('')
  lines.push(
    chalk.bold.blue(`📦 Packages that depend on ${chalk.yellow(packageName)}:`)
  )
  lines.push(chalk.gray('─'.repeat(60)))
  lines.push('')

  if (dependencies.length === 0) {
    lines.push(chalk.yellow('No reverse dependencies found.'))
    lines.push('')
    return lines.join('\n')
  }

  lines.push(
    chalk.bold(
      `Found ${chalk.green(dependencies.length.toString())} dependent packages:`
    )
  )
  lines.push('')

  dependencies.forEach((dep, index) => {
    const num = chalk.gray(`${(index + 1).toString().padStart(3)}. `)
    const name = chalk.cyan(dep.name)
    const version = chalk.gray(`@${dep.version}`)
    const downloads = dep.downloads
      ? chalk.green(` (${formatNumber(dep.downloads)} downloads)`)
      : ''

    lines.push(`${num}${name}${version}${downloads}`)

    if (dep.repository) {
      lines.push(chalk.gray(`     📂 ${dep.repository}`))
    }
  })

  lines.push('')
  lines.push(chalk.gray('─'.repeat(60)))
  lines.push(chalk.dim(`Total: ${dependencies.length} packages`))
  lines.push('')

  return lines.join('\n')
}

/**
 * Format number with thousand separators
 */
function formatNumber(num: number): string {
  return num.toLocaleString()
}
