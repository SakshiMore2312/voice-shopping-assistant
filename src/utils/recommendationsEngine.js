/**
 * Modular recommendations engine for VoiceCart.
 * Computes seasonal suggestions, association rules, restock alerts, and recently purchased items.
 */

// Association Rules (Product A -> Product B)
const ASSOCIATION_RULES = {
  "milk-regular": ["bread-white", "bread-wheat", "cookies-chocolate"],
  "milk-almond": ["bread-wheat", "cookies-chocolate"],
  "milk-organic": ["bread-wheat", "coffee-beans"],
  "bread-white": ["cheese-cheddar", "eggs-regular"],
  "bread-wheat": ["cheese-cheddar", "eggs-organic"],
  "spaghetti": ["tomato-sauce"],
  "tomato-sauce": ["spaghetti", "cheese-cheddar"],
  "coffee-beans": ["milk-organic", "milk-almond"],
  "eggs-regular": ["bread-white", "cheese-cheddar"],
  "eggs-organic": ["bread-wheat", "cheese-cheddar"]
};

/**
 * Returns associated items based on the current items in the shopping list.
 * @param {Array} currentList - Current shopping list items.
 * @param {Array} catalog - Complete product catalog.
 * @returns {Array} - Array of recommended items from the catalog.
 */
export const getFrequentlyBoughtTogether = (currentList, catalog) => {
  if (!currentList || currentList.length === 0) {
    // If empty list, suggest general staples
    return catalog.filter(item => ["milk-organic", "bread-wheat", "eggs-organic"].includes(item.id));
  }

  const listIds = currentList.map(item => item.id);
  const recommendedIds = new Set();

  currentList.forEach(listItem => {
    const associates = ASSOCIATION_RULES[listItem.id];
    if (associates) {
      associates.forEach(id => {
        if (!listIds.includes(id)) {
          recommendedIds.add(id);
        }
      });
    }
  });

  return catalog.filter(item => recommendedIds.has(item.id) && item.inStock).slice(0, 3);
};

/**
 * Returns items that are in season based on the current month.
 */
export const getSeasonalPicks = (catalog) => {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec
  let currentSeason = "all";

  if (month >= 2 && month <= 4) currentSeason = "Spring";
  else if (month >= 5 && month <= 7) currentSeason = "Summer";
  else if (month >= 8 && month <= 10) currentSeason = "Autumn";
  else currentSeason = "Winter";

  // Filter items matching the season
  const seasonal = catalog.filter(item => item.season === currentSeason && item.inStock);
  if (seasonal.length > 0) return seasonal.slice(0, 3);

  // Fallback to "all" season items that are fresh (like bananas/strawberries)
  return catalog.filter(item => item.category === "Produce" && item.inStock).slice(0, 2);
};

/**
 * Returns mock quick restocks: items that are in stock, not currently on the list,
 * but represent common high-frequency items (like yogurt, toothpaste, soda).
 */
export const getQuickRestocks = (currentList, catalog) => {
  if (!currentList) return [];
  const listIds = currentList.map(item => item.id);
  const restockStaples = ["yogurt-greek", "toothpaste-regular", "soda", "bottled-water", "chips-potato"];

  return catalog
    .filter(item => restockStaples.includes(item.id) && !listIds.includes(item.id) && item.inStock)
    .slice(0, 2);
};

/**
 * Returns recently purchased/removed items from local storage that are in stock and not on the list.
 */
export const getRecentlyPurchased = (currentList, catalog) => {
  try {
    const saved = localStorage.getItem("recently_purchased");
    if (!saved) return [];
    const ids = JSON.parse(saved);
    const listIds = (currentList || []).map(item => item.id);
    
    return catalog
      .filter(item => ids.includes(item.id) && !listIds.includes(item.id) && item.inStock)
      .slice(0, 3);
  } catch (e) {
    console.error("Failed to parse recently purchased items:", e);
    return [];
  }
};
