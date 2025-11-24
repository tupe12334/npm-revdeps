import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchReverseDependencies } from './api.js'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('fetchReverseDependencies', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('should fetch and transform dependencies successfully', async () => {
    const mockResponse = {
      dependent_packages: [
        {
          name: 'test-package',
          platform: 'npm',
          latest_version: '1.0.0',
          downloads: 1000,
          repository_url: 'https://github.com/test/test',
          homepage_url: 'https://test.com',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
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
  })

  it('should handle package not found error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(fetchReverseDependencies('nonexistent-pkg')).rejects.toThrow(
      'Package "nonexistent-pkg" not found on npm'
    )
  })

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    await expect(fetchReverseDependencies('express')).rejects.toThrow(
      'API request failed: 500 Internal Server Error'
    )
  })

  it('should handle missing dependent_packages in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    const result = await fetchReverseDependencies('express')
    expect(result).toEqual([])
  })

  it('should handle packages without version', async () => {
    const mockResponse = {
      dependent_packages: [
        {
          name: 'test-package',
          platform: 'npm',
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    })

    const result = await fetchReverseDependencies('express')

    expect(result).toHaveLength(1)
    expect(result[0].version).toBe('unknown')
  })
})
