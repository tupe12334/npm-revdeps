/**
 * API client for ecosyste.ms
 */

import type { EcosystemResponse, Dependency } from './types.js'

const ECOSYSTEM_API_BASE = 'https://packages.ecosyste.ms/api/v1'

/**
 * Fetch reverse dependencies for a given npm package
 */
export async function fetchReverseDependencies(
  packageName: string
): Promise<Dependency[]> {
  const url = `${ECOSYSTEM_API_BASE}/registries/npmjs.org/packages/${encodeURIComponent(packageName)}/dependent-packages`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "${packageName}" not found on npm`)
    }
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as EcosystemResponse

  // Transform the response into our Dependency type
  return (
    data.dependent_packages?.map(pkg => ({
      name: pkg.name,
      version: pkg.latest_version || 'unknown',
      downloads: pkg.downloads,
      repository: pkg.repository_url,
      homepage: pkg.homepage_url,
    })) || []
  )
}
