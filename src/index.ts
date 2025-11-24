/**
 * Main entry point for npm-revdeps package
 */

export { fetchReverseDependencies } from './api.js'
export {
  filterDependencies,
  formatAsJson,
  formatForTerminal,
} from './formatter.js'
export type {
  Dependency,
  EcosystemResponse,
  FilterOptions,
  CliOptions,
} from './types.js'

/**
 * Get reverse dependencies for a package with optional filtering
 */
export async function getReverseDependencies(
  packageName: string,
  options?: {
    minDownloads?: number
    maxResults?: number
    sort?: 'downloads' | 'name'
  }
) {
  const { fetchReverseDependencies } = await import('./api.js')
  const { filterDependencies } = await import('./formatter.js')

  const dependencies = await fetchReverseDependencies(packageName)
  return filterDependencies(dependencies, options)
}
