/**
 * Types for the npm-revdeps CLI
 */

export interface Dependency {
  name: string
  version: string
  downloads?: number
  repository?: string
  homepage?: string
}

export interface EcosystemResponse {
  dependent_packages: Array<{
    name: string
    platform: string
    latest_version?: string
    repository_url?: string
    homepage_url?: string
    downloads?: number
  }>
  total?: number
}

export interface FilterOptions {
  minDownloads?: number
  maxResults?: number
  sort?: 'downloads' | 'name'
}

export interface CliOptions {
  json?: boolean
  filter?: FilterOptions
  interactive?: boolean
}
