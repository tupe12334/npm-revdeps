/**
 * API client for ecosyste.ms
 */

import type { Dependency } from './types.js'

/**
 * Fetch reverse dependencies for a given npm package
 */
export async function fetchReverseDependencies(
  packageName: string
): Promise<Dependency[]> {
  const url = `https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/${encodeURIComponent(packageName)}/dependent_packages`

  const response = await fetch(url, {
    headers: {
      // ecosyste.ms API requires Accept header to return JSON instead of HTML
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "${packageName}" not found on npm`)
    }
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    )
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error(`Unexpected API response format`)
  }

  // Transform the API response into our Dependency type
  return data.map((pkg: Record<string, unknown>) => ({
    name: String(pkg.name),
    version: String(pkg.latest_release_number || 'unknown'),
    downloads: Number(pkg.downloads),
    repository: pkg.repository_url ? String(pkg.repository_url) : undefined,
    homepage: pkg.homepage ? String(pkg.homepage) : undefined,
  }))
}
