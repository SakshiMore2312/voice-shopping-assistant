// Advanced Multilingual NLP Command Parser for Shopping Assistant

const numberMap = {
  // English
  "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
  "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  // Hindi
  "ek": 1, "do": 2, "teen": 3, "chaar": 4, "paanch": 5, "chah": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
  // Spanish
  "uno": 1, "una": 1, "un": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5,
  "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10
};

export const parseVoiceCommand = (rawText, lang = "en-US") => {
  if (!rawText) {
    return { action: "UNKNOWN", item: "", quantity: 1, maxPrice: null, isOrganic: false };
  }

  // Normalize: lowercase, trim, strip punctuation
  let text = rawText
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  let action = "UNKNOWN";
  let item = "";
  let quantity = 1;
  let maxPrice = null;
  let isOrganic = false;

  // Language keywords mapping
  const keywords = {
    "en-US": {
      add: ["add", "buy", "need", "get", "purchase", "want", "put"],
      remove: ["remove", "delete", "clear item", "get rid of", "take off", "subtract"],
      search: ["find", "search", "show", "look for", "where is", "filter"],
      clearAll: ["clear my list", "empty my list", "clear shopping list", "delete all items", "clear list", "empty list"],
      organic: ["organic"],
      under: ["under", "less than", "below", "cheaper than"]
    },
    "hi-IN": {
      add: ["जोड़ें", "जोड़ो", "डालें", "डालो", "चाहिए", "खरीदना है", "लाओ", "jodein", "jodo", "dalein", "dalo", "chahiye", "le aao"],
      remove: ["हटाएं", "हटाओ", "निकालें", "निकालो", "मिटाओ", "hataein", "hatao", "nikaalein", "nikalo"],
      search: ["दिखाएं", "दिखाओ", "खोजें", "खोजो", "ढूंढें", "ढूंढो", "dikhaein", "dikhao", "khojein", "dhoondein"],
      clearAll: ["सूची साफ करें", "सब कुछ हटाओ", "पूरी सूची हटाओ", "clear list", "list clear"],
      organic: ["ऑर्गेनिक", "जैविक", "organic"],
      under: ["के नीचे", "से कम", "se kam", "under", "sasta"]
    },
    "es-ES": {
      add: ["añadir", "agrega", "agregar", "poner", "necesito", "comprar", "pon", "quiero"],
      remove: ["quitar", "eliminar", "borrar", "saca", "saque", "elimina"],
      search: ["buscar", "busca", "encontrar", "encuentra", "mostrar", "muestra", "filtrar"],
      clearAll: ["limpiar lista", "vaciar lista", "borrar todo", "limpiar la lista"],
      organic: ["orgánico", "orgánica", "organico", "organica"],
      under: ["menos de", "bajo", "por menos de", "inferior a", "más barato que"]
    }
  };

  const currentKeywords = keywords[lang] || keywords["en-US"];

  // 1. Check for "Clear All" commands
  const isClearAll = currentKeywords.clearAll.some(keyword => text.includes(keyword));
  if (isClearAll) {
    return { action: "CLEAR_ALL", item: "", quantity: 0, maxPrice: null, isOrganic: false };
  }

  // 2. Normalize common filler conversational intros
  const fillerPhrases = [
    "i think i need to", "i think i need", "could you please", "can you please",
    "please can you", "could you", "can you", "please add", "please remove",
    "please search for", "please search", "please find", "let us buy", "lets buy",
    "i want to buy", "i want to add", "i want to search for", "quiero comprar",
    "necesito comprar", "por favor agrega", "por favor añade", "कृपया जोड़ें", "कृपया खोजें"
  ];

  let cleanedText = text;
  fillerPhrases.forEach(phrase => {
    cleanedText = cleanedText.replace(phrase, "").trim();
  });

  // 3. Detect Action Type
  const hasRemove = currentKeywords.remove.some(keyword => cleanedText.includes(keyword));
  const hasSearch = currentKeywords.search.some(keyword => cleanedText.includes(keyword));
  const hasAdd = currentKeywords.add.some(keyword => cleanedText.includes(keyword));

  if (hasRemove) {
    action = "REMOVE";
  } else if (hasSearch) {
    action = "SEARCH";
  } else if (hasAdd || lang === "hi-IN") {
    action = "ADD"; // Default to ADD for Hindi or general nouns
  }

  // 4. Strip out action verbs
  const verbsToStrip = [...currentKeywords.add, ...currentKeywords.remove, ...currentKeywords.search];
  verbsToStrip.forEach(verb => {
    const escaped = verb.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '');
    if (lang === "hi-IN") {
      cleanedText = cleanedText.replace(verb, '');
    }
  });

  // 5. Clean connecting stop words
  const stopWords = [
    "to my list", "from my list", "my list", "the list", "please", "some", "of",
    "dollars", "dollar", "rupees", "rupee", "cents", "to", "from", "for", "in",
    "a la lista", "de la lista", "mi lista", "por favor", "de", "dólares", "dólar",
    "को", "से", "में", "मेरी", "सूची", "रुपये", "रुपया", "की", "का"
  ];
  stopWords.forEach(word => {
    const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '');
    if (lang === "hi-IN") {
      cleanedText = cleanedText.replace(word, '');
    }
  });

  // 6. Detect Organic Flag
  currentKeywords.organic.forEach(orgKeyword => {
    if (cleanedText.includes(orgKeyword)) {
      isOrganic = true;
      cleanedText = cleanedText.replace(orgKeyword, "");
    }
  });

  // 7. Detect Price Filter ("under 5 dollars", "below 10 rupees")
  currentKeywords.under.forEach(underKeyword => {
    if (cleanedText.includes(underKeyword)) {
      action = "FILTER";
      const parts = cleanedText.split(underKeyword);
      cleanedText = parts[0]; // Item info is usually before the 'under' keyword
      const pricePart = parts[1];
      if (pricePart) {
        const numMatch = pricePart.match(/\d+(\.\d+)?/);
        if (numMatch) {
          maxPrice = parseFloat(numMatch[0]);
        } else {
          // Check for written word number
          const words = pricePart.trim().split(/\s+/);
          for (let w of words) {
            if (numberMap[w]) {
              maxPrice = numberMap[w];
              break;
            }
          }
        }
      }
    }
  });

  // 8. Extract Quantity & Name Tokens
  const tokens = cleanedText.trim().split(/\s+/);
  let nameTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    // Is it a direct digit?
    if (/^\d+$/.test(token)) {
      quantity = parseInt(token, 10);
      continue;
    }

    // Is it a word number?
    if (numberMap[token]) {
      quantity = numberMap[token];
      continue;
    }

    // Is it a packaging unit word?
    const units = [
      "bottle", "bottles", "pack", "packs", "bag", "bags", "kg", "kilo", "kilos",
      "gram", "grams", "liter", "liters", "box", "boxes", "packet", "packets",
      "cup", "cups", "can", "cans", "piece", "pieces", "carton", "cartons",
      "पैकेट", "बोतल", "किलो", "लीटर", "paquetes", "botellas", "cajas", "botes"
    ];
    if (units.includes(token)) {
      continue;
    }

    nameTokens.push(token);
  }

  item = nameTokens.join(" ").trim();

  // Safeguard: If we couldn't parse an item, fallback to using raw words
  if (!item && text) {
    item = text.replace(/^(add|remove|find|search|delete|clear|buy|need|quiero|quitar|जोड़ें|हटाएं)\s+/gi, "").trim();
  }

  // Sanitize trailing/leading space, double spaces
  item = item.replace(/\s+/g, " ").trim();

  // If action remains UNKNOWN but we have a text item, default to ADD
  if (action === "UNKNOWN" && item) {
    action = "ADD";
  }

  return {
    action,
    item,
    quantity: isNaN(quantity) || quantity <= 0 ? 1 : quantity,
    maxPrice,
    isOrganic
  };
};
