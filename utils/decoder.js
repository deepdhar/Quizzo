/**
 * Robust utility to decode URL-encoded and HTML entities returned by OpenTDB API.
 */
export const decodeText = str => {
  if (!str) {
    return '';
  }
  try {
    // First try standard URL decode
    let decoded = decodeURIComponent(str);

    // Handle common HTML entities that might remain or be returned in other encodings
    const entities = {
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&rsquo;': "'",
      '&lsquo;': "'",
      '&rdquo;': '"',
      '&ldquo;': '"',
      '&hellip;': '...',
      '&eacute;': 'é',
      '&aacute;': 'á',
      '&iacute;': 'í',
      '&oacute;': 'ó',
      '&uacute;': 'ú',
      '&ntilde;': 'ñ',
      '&deg;': '°',
      '&micro;': 'µ',
      '&plusmn;': '±',
      '&sup2;': '²',
      '&sup3;': '³',
    };

    decoded = decoded.replace(/&[a-zA-Z0-9#]+;/g, match => {
      if (entities[match]) {
        return entities[match];
      }
      // Handle numeric hex entities &#x...;
      if (match.startsWith('&#x')) {
        const hex = match.substring(3, match.length - 1);
        return String.fromCharCode(parseInt(hex, 16));
      }
      // Handle numeric decimal entities &#...;
      if (match.startsWith('&#')) {
        const dec = match.substring(2, match.length - 1);
        return String.fromCharCode(parseInt(dec, 10));
      }
      return match;
    });

    return decoded;
  } catch (e) {
    return str;
  }
};
