import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchReverseDependencies } from './api.js'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch as typeof fetch

describe('fetchReverseDependencies', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should fetch and transform dependencies successfully', async () => {
    const mockData = [
      {
        name: 'test-package',
        latest_release_number: '1.0.0',
        downloads: 1000,
        repository_url: 'https://github.com/test/test',
        homepage: 'https://test.com',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
      headers: {
        get: () => 'application/json',
      },
    })

    const result = await fetchReverseDependencies('express')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      name: 'test-package',
      version: '1.0.0',
      downloads: 1000,
      repository: 'https://github.com/test/test',
      homepage: 'https://test.com',
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/express/dependent_packages',
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
  })

  it('should handle 404 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(fetchReverseDependencies('nonexistent-pkg')).rejects.toThrow(
      'Package "nonexistent-pkg" not found on npm'
    )
  })

  it('should handle other HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchReverseDependencies('test-pkg')).rejects.toThrow(
      'API request failed: 500 Internal Server Error'
    )
  })

  it('should handle empty array response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })

    const result = await fetchReverseDependencies('express')
    expect(result).toEqual([])
  })

  it('should handle packages without version', async () => {
    const mockData = [
      {
        name: 'test-package',
        latest_release_number: null,
        downloads: 100,
        repository_url: null,
        homepage: null,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    })

    const result = await fetchReverseDependencies('express')

    expect(result).toHaveLength(1)
    expect(result[0].version).toBe('unknown')
    expect(result[0].repository).toBeUndefined()
    expect(result[0].homepage).toBeUndefined()
  })

  it('should handle non-array response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ error: 'Something went wrong' }),
    })

    await expect(fetchReverseDependencies('test-pkg')).rejects.toThrow(
      'Unexpected API response format'
    )
  })

  it('should encode package names with special characters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    })

    await fetchReverseDependencies('@scope/package')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/%40scope%2Fpackage/dependent_packages',
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(fetchReverseDependencies('express')).rejects.toThrow(
      'Network error'
    )
  })
})
