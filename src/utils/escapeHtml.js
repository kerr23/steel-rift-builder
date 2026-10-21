// HTML escaping for roster data interpolated into print HTML.
// Roster data is untrusted: users type names and import arbitrary JSON files.
// Text-content contexts only: `"` is left intact (inch marks in ranges/speeds),
// so escaped values must never be interpolated into attribute values.

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }

/**
 * Escapes HTML text-content characters in a value
 * @param {*} value - Value to escape
 * @returns {String} Escaped string
 */
export function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (char) => HTML_ESCAPES[char])
}

/**
 * Escapes a support asset detail line, preserving the attribute-less
 * <strong>/<u> tags the print parsers depend on
 * @param {String} value - Detail line
 * @returns {String} Escaped detail line
 */
export function escapeDetailHtml(value) {
  return escapeHtml(value).replace(/&lt;(\/?)(strong|u)&gt;/g, '<$1$2>')
}

/**
 * Returns a deep copy of roster data with every string HTML-escaped.
 * Strings inside `details` arrays keep their <strong>/<u> tags.
 * @param {*} value - Roster data
 * @param {Boolean} [inDetails=false] - Whether value is inside a `details` array
 * @returns {*} Escaped copy
 */
export function escapeRosterData(value, inDetails = false) {
  if (typeof value === 'string') return inDetails ? escapeDetailHtml(value) : escapeHtml(value)
  if (Array.isArray(value)) return value.map((item) => escapeRosterData(item, inDetails))
  if (value && typeof value === 'object') {
    const result = {}
    for (const [key, item] of Object.entries(value)) {
      if (key === '__proto__') continue
      result[key] = escapeRosterData(item, inDetails || key === 'details')
    }
    return result
  }
  return value
}
