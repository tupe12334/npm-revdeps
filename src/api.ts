/**
 * API client for multiple reverse dependency providers
 */

import type { ApiOptions, Dependency } from './types.js'

/**
 * Fetch reverse dependencies from ecosyste.ms
 */
async function fetchFromEcosystems(packageName: string): Promise<Dependency[]> {
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

/**
 * Fetch reverse dependencies from libraries.io
 */
async function fetchFromLibrariesIo(
  packageName: string,
  apiKey?: string
): Promise<Dependency[]> {
  if (!apiKey) {
    throw new Error(
      'Libraries.io API key is required. Get one from https://libraries.io/account'
    )
  }

  const url = `https://libraries.io/api/npm/${encodeURIComponent(packageName)}/dependents?api_key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "${packageName}" not found on npm`)
    }
    if (response.status === 401) {
      throw new Error('Invalid Libraries.io API key')
    }
    if (response.status === 429) {
      throw new Error('Libraries.io API rate limit exceeded (60 req/min)')
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
    version: String(pkg.latest_stable_release_number || 'unknown'),
    downloads: pkg.downloads ? Number(pkg.downloads) : undefined,
    repository: pkg.repository_url ? String(pkg.repository_url) : undefined,
    homepage: pkg.homepage ? String(pkg.homepage) : undefined,
  }))
}

/**
 * Fetch reverse dependencies for a given npm package
 * Supports multiple API providers with automatic fallback
 */
export async function fetchReverseDependencies(
  packageName: string,
  options?: ApiOptions
): Promise<Dependency[]> {
  const provider = options?.provider ?? 'ecosystems'
  const librariesioApiKey = options?.librariesioApiKey
  const enableFallback = options?.enableFallback ?? true

  // Try primary provider
  try {
    if (provider === 'librariesio') {
      return await fetchFromLibrariesIo(packageName, librariesioApiKey)
    }
    return await fetchFromEcosystems(packageName)
  } catch (error: unknown) {
    // If fallback is disabled, rethrow the error
    if (!enableFallback) {
      throw error
    }

    // Try fallback provider
    try {
      if (provider === 'ecosystems' && librariesioApiKey) {
        return await fetchFromLibrariesIo(packageName, librariesioApiKey)
      } else if (provider === 'librariesio') {
        return await fetchFromEcosystems(packageName)
      }
    } catch (fallbackError: unknown) {
      // If fallback also fails, throw the original error
      throw error
    }

    // If no fallback was available, throw the original error
    throw error
  }
}
