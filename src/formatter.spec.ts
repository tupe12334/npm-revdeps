import { describe, it, expect } from 'vitest'
import {
  filterDependencies,
  formatAsJson,
  formatForTerminal,
} from './formatter.js'
import type { Dependency } from './types.js'

describe('filterDependencies', () => {
  const mockDependencies: Dependency[] = [
    { name: 'package-a', version: '1.0.0', downloads: 1000 },
    { name: 'package-b', version: '2.0.0', downloads: 500 },
    { name: 'package-c', version: '1.5.0', downloads: 2000 },
  ]

  it('should return all dependencies when no filters applied', () => {
    const result = filterDependencies(mockDependencies)
    expect(result).toHaveLength(3)
  })

  it('should filter by minimum downloads', () => {
    const result = filterDependencies(mockDependencies, { minDownloads: 1000 })
    expect(result).toHaveLength(2)
    expect(result.every(dep => (dep.downloads || 0) >= 1000)).toBe(true)
  })

  it('should limit results', () => {
    const result = filterDependencies(mockDependencies, { maxResults: 2 })
    expect(result).toHaveLength(2)
  })

  it('should sort by downloads descending', () => {
    const result = filterDependencies(mockDependencies, { sort: 'downloads' })
    expect(result[0].name).toBe('package-c')
    expect(result[1].name).toBe('package-a')
    expect(result[2].name).toBe('package-b')
  })

  it('should sort by name ascending', () => {
    const result = filterDependencies(mockDependencies, { sort: 'name' })
    expect(result[0].name).toBe('package-a')
    expect(result[1].name).toBe('package-b')
    expect(result[2].name).toBe('package-c')
  })
})

describe('formatAsJson', () => {
  it('should format dependencies as valid JSON', () => {
    const deps: Dependency[] = [
      { name: 'test-pkg', version: '1.0.0', downloads: 100 },
    ]
    const result = formatAsJson(deps)
    const parsed = JSON.parse(result)

    expect(parsed).toHaveProperty('total', 1)
    expect(parsed).toHaveProperty('packages')
    expect(parsed.packages).toHaveLength(1)
    expect(parsed.packages[0]).toMatchObject({
      name: 'test-pkg',
      version: '1.0.0',
      downloads: 100,
    })
  })

  it('should handle empty dependencies array', () => {
    const result = formatAsJson([])
    const parsed = JSON.parse(result)

    expect(parsed.total).toBe(0)
    expect(parsed.packages).toEqual([])
  })
})

describe('formatForTerminal', () => {
  it('should format dependencies with colorized output', () => {
    const deps: Dependency[] = [
      {
        name: 'test-package',
        version: '1.0.0',
        downloads: 1000,
        repository: 'https://github.com/test/test',
      },
    ]
    const result = formatForTerminal('express', deps)

    expect(result).toContain('Packages that depend on')
    expect(result).toContain('express')
    expect(result).toContain('test-package')
    expect(result).toContain('1.0.0')
    expect(result).toContain('1,000')
    expect(result).toContain('https://github.com/test/test')
  })

  it('should handle empty dependencies', () => {
    const result = formatForTerminal('express', [])

    expect(result).toContain('Packages that depend on')
    expect(result).toContain('express')
    expect(result).toContain('No reverse dependencies found')
  })

  it('should format multiple dependencies', () => {
    const deps: Dependency[] = [
      { name: 'pkg1', version: '1.0.0', downloads: 5000 },
      { name: 'pkg2', version: '2.0.0', downloads: 3000 },
      { name: 'pkg3', version: '3.0.0', downloads: 1000 },
    ]
    const result = formatForTerminal('react', deps)

    expect(result).toContain('Found 3 dependent packages')
    expect(result).toContain('pkg1')
    expect(result).toContain('pkg2')
    expect(result).toContain('pkg3')
    expect(result).toContain('5,000')
  })

  it('should handle packages without downloads', () => {
    const deps: Dependency[] = [{ name: 'test-pkg', version: '1.0.0' }]
    const result = formatForTerminal('express', deps)

    expect(result).toContain('test-pkg')
    expect(result).toContain('1.0.0')
    expect(result).not.toContain('downloads')
  })

  it('should handle packages without repository', () => {
    const deps: Dependency[] = [
      { name: 'test-pkg', version: '1.0.0', downloads: 100 },
    ]
    const result = formatForTerminal('express', deps)

    expect(result).toContain('test-pkg')
    expect(result).not.toContain('📂')
  })
})
