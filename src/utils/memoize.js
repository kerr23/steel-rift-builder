// src/utils/memoize.js
/**
 * Creates a memoized version of a function
 * @template T, R
 * @param {function(...T): R} fn - The function to memoize
 * @param {function(...T): string} [keyFn] - Optional key generation function
 * @returns {function(...T): R} - Memoized function
 */
export function memoize(fn, keyFn) {
  const cache = new Map()

  return function memoized(...args) {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * Creates a memoized version of a function with a maximum cache size
 * @template T, R
 * @param {function(...T): R} fn - The function to memoize
 * @param {number} maxSize - Maximum size of cache
 * @param {function(...T): string} [keyFn] - Optional key generation function
 * @returns {function(...T): R} - Memoized function with bounded cache
 */
export function memoizeWithMaxSize(fn, maxSize = 100, keyFn) {
  const cache = new Map()
  const keys = []

  return function memoizedWithMaxSize(...args) {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    // Enforce cache size limit
    if (keys.length >= maxSize) {
      const oldestKey = keys.shift()
      cache.delete(oldestKey)
    }

    const result = fn(...args)
    cache.set(key, result)
    keys.push(key)
    return result
  }
}
