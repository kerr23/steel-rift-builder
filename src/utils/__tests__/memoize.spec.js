// src/utils/__tests__/memoize.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { memoize, memoizeWithMaxSize } from '../memoize'

describe('memoize utility', () => {
  let mockFn
  let memoizedFn

  beforeEach(() => {
    mockFn = vi.fn((a, b) => a + b)
    memoizedFn = memoize(mockFn)
  })

  it('returns the correct result', () => {
    expect(memoizedFn(1, 2)).toBe(3)
    expect(memoizedFn(2, 3)).toBe(5)
  })

  it('caches results for the same inputs', () => {
    memoizedFn(1, 2)
    memoizedFn(1, 2)
    memoizedFn(1, 2)

    // Function should only be called once
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('calls the original function for different inputs', () => {
    memoizedFn(1, 2)
    memoizedFn(2, 3)
    memoizedFn(3, 4)

    // Function should be called three times
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('works with custom key function', () => {
    const customKeyFn = vi.fn((a, b) => `${a}-${b}`)
    const customMemoized = memoize(mockFn, customKeyFn)

    customMemoized(1, 2)
    customMemoized(1, 2)

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(customKeyFn).toHaveBeenCalledTimes(2)
    expect(customKeyFn).toHaveBeenCalledWith(1, 2)
  })
})

describe('memoizeWithMaxSize utility', () => {
  let mockFn
  let memoizedFn

  beforeEach(() => {
    mockFn = vi.fn((a, b) => a + b)
    memoizedFn = memoizeWithMaxSize(mockFn, 2) // Max cache size of 2
  })

  it('limits cache size by evicting oldest items', () => {
    // First call: (1, 2) -> cached
    memoizedFn(1, 2)
    expect(mockFn).toHaveBeenCalledTimes(1)

    // Second call: (3, 4) -> cached
    memoizedFn(3, 4)
    expect(mockFn).toHaveBeenCalledTimes(2)

    // Third call: (5, 6) -> cached, should evict (1, 2)
    memoizedFn(5, 6)
    expect(mockFn).toHaveBeenCalledTimes(3)

    // This should hit the cache
    memoizedFn(3, 4)
    expect(mockFn).toHaveBeenCalledTimes(3)

    // This should be a cache miss ((1, 2) was evicted)
    memoizedFn(1, 2)
    expect(mockFn).toHaveBeenCalledTimes(4)
  })
})
