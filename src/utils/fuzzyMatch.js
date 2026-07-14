/**
 * Utility for string matching, typo tolerance, and plural normalization.
 */

// Helper to compute Levenshtein Distance between two strings
export const getLevenshteinDistance = (a, b) => {
  const tmp = [];
  let i, j, val;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 1; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      val = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + val // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

// Normalize common plural/singular changes and strip whitespace/punctuation
export const normalizeText = (text) => {
  if (!text) return "";
  let clean = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .trim();

  // Normalize simple English plurals
  if (clean.endsWith("ies")) {
    clean = clean.slice(0, -3) + "y";
  } else if (clean.endsWith("es") && !clean.endsWith("cheese")) {
    clean = clean.slice(0, -2);
  } else if (clean.endsWith("s") && !clean.endsWith("soda") && !clean.endsWith("glass") && !clean.endsWith("chips") && !clean.endsWith("beans")) {
    clean = clean.slice(0, -1);
  }

  // Normalize simple Spanish plurals
  if (clean.endsWith("es") && clean.length > 4) {
    clean = clean.slice(0, -2);
  } else if (clean.endsWith("s") && !clean.endsWith("leche") && !clean.endsWith("patatas")) {
    clean = clean.slice(0, -1);
  }

  return clean;
};

/**
 * Find the best product match in the catalog with typo tolerance.
 * @param {string} query - The search query spoken by user.
 * @param {Array} catalogItems - The items catalog.
 * @returns {Object|null} - The matched product or null.
 */
export const findBestCatalogMatch = (query, catalogItems) => {
  if (!query) return null;
  const target = normalizeText(query);
  
  let bestMatch = null;
  let highestScore = 0; // Higher is better (range 0 to 1)

  for (const item of catalogItems) {
    const itemName = normalizeText(item.name);
    const itemBrand = normalizeText(item.brand);
    
    // 1. Direct sub-string matches (extremely high priority)
    if (itemName === target || target.includes(itemName) || itemName.includes(target)) {
      return item; // Instant match
    }

    // Check with brand
    const fullBrandName = `${itemBrand} ${itemName}`;
    if (target.includes(fullBrandName) || fullBrandName.includes(target)) {
      return item;
    }

    // 2. Levenshtein Distance for typo tolerance
    const maxLen = Math.max(target.length, itemName.length);
    if (maxLen === 0) continue;

    const dist = getLevenshteinDistance(target, itemName);
    const similarity = 1 - dist / maxLen;

    // Accept as match if similarity exceeds threshold (e.g. 75%)
    if (similarity > 0.75 && similarity > highestScore) {
      highestScore = similarity;
      bestMatch = item;
    }
  }

  return bestMatch;
};
