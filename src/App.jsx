import React, { useState, useEffect, useCallback, useMemo } from "react";
import { catalog } from "./utils/catalog";
import { parseVoiceCommand } from "./utils/nlpParser";
import { speakText } from "./utils/speechUtils";
import { findBestCatalogMatch } from "./utils/fuzzyMatch";
import {
  getFrequentlyBoughtTogether,
  getSeasonalPicks,
  getQuickRestocks
} from "./utils/recommendationsEngine";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";

import VoiceController from "./components/VoiceController";
import ShoppingList from "./components/ShoppingList";
import SmartSuggestions from "./components/SmartSuggestions";
import ProductCatalogView from "./components/ProductCatalogView";
import CommandConsole from "./components/CommandConsole";
import ToastContainer from "./components/ToastContainer";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  // 1. All React State Declarations
  const [shoppingList, setShoppingList] = useState(() => {
    try {
      const saved = localStorage.getItem("shopping_list");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse shopping list from localStorage:", e);
      return [];
    }
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("assistant_lang") || "en-US";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  
  // Real-time voice states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommandText, setLastCommandText] = useState("");

  // Substitute State: { originalName, substituteItem, parsedQty }
  const [substituteModal, setSubstituteModal] = useState(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem("shopping_list", JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem("assistant_lang", language);
  }, [language]);

  // Toast Helpers
  const addToast = useCallback((message, type = "success") => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2. Instantiate Speech Recognition Hook Early (to avoid reference order bugs)
  const handleSpeechResultWrapper = (text) => {
    handleSpeechResult(text);
  };

  const {
    isListening,
    interimTranscript,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    supported: speechSupported
  } = useSpeechRecognition({
    onResult: handleSpeechResultWrapper,
    lang: language
  });

  // Text-To-Speech wrapper that mutes speech recognition while speaking
  const speakFeedback = useCallback((text) => {
    stopListening();
    setIsSpeaking(true);
    speakText(
      text,
      language,
      () => {
        setIsSpeaking(true);
      },
      () => {
        setIsSpeaking(false);
      }
    );
  }, [language, stopListening]);

  // Add Item Logic
  const addItemToList = useCallback((itemName, qty = 1, isOrganic = false) => {
    if (!itemName) return { error: "Empty product name" };

    let parsedQty = qty;
    if (parsedQty <= 0) {
      parsedQty = 1;
    }
    if (parsedQty > 99) {
      parsedQty = 99;
      addToast("Quantity capped at maximum of 99.", "warning");
    }

    // Fuzzy matching against the catalog
    const matchedItem = findBestCatalogMatch(itemName, catalog);

    if (matchedItem) {
      // Check stock status
      if (!matchedItem.inStock) {
        if (matchedItem.substitute) {
          const subItem = catalog.find((c) => c.name === matchedItem.substitute || c.id === matchedItem.substitute);
          if (subItem) {
            setSubstituteModal({
              originalName: matchedItem.name,
              substituteItem: subItem,
              parsedQty
            });

            const ttsMessage =
              language === "hi-IN"
                ? `${matchedItem.name} आउट ऑफ़ स्टॉक है। क्या आप ${subItem.name} लेना चाहेंगे?`
                : language === "es-ES"
                ? `${matchedItem.name} está agotado. ¿Desea sustituirlo por ${subItem.name}?`
                : `${matchedItem.name} is out of stock. Would you like to substitute with ${subItem.name}?`;

            speakFeedback(ttsMessage);
            return { error: `"${matchedItem.name}" is out of stock. Substitute suggested.` };
          }
        }

        const errorMsg = `"${matchedItem.name}" is currently out of stock.`;
        addToast(errorMsg, "error");
        speakFeedback(
          language === "hi-IN"
            ? `${matchedItem.name} स्टॉक में नहीं है।`
            : language === "es-ES"
            ? `${matchedItem.name} no está disponible.`
            : errorMsg
        );
        return { error: errorMsg };
      }

      // Add to list (if present, add qty)
      setShoppingList((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === matchedItem.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = Math.min(99, updated[existingIndex].quantity + parsedQty);
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          return updated;
        } else {
          return [...prev, { ...matchedItem, quantity: parsedQty, checked: false }];
        }
      });

      const confirmMsg =
        language === "hi-IN"
          ? `${parsedQty} ${matchedItem.name} जोड़ा गया।`
          : language === "es-ES"
          ? `Agregado ${parsedQty} ${matchedItem.name}.`
          : `Added ${parsedQty} ${matchedItem.name}.`;

      addToast(confirmMsg, "success");
      speakFeedback(confirmMsg);
      setLastCommandText(confirmMsg);
      return { success: true, item: matchedItem.name, qty: parsedQty };
    } else {
      // Fallback: Add custom item if not matched in catalog
      let category = "Pantry";
      const fruitsVegetables = ["apple", "banana", "orange", "potato", "onion", "tomato", "mango", "strawberry", "blueberry", "watermelon", "grape", "lemon", "peach", "pear", "सेब", "केला", "आलू", "टमाटर", "प्याज", "आम", "manzana", "plátano", "patata", "cebolla"];
      const dairyEggs = ["milk", "cheese", "yogurt", "butter", "egg", "eggs", "cream", "दूध", "मक्खन", "दही", "अंडा", "अंडे", "leche", "queso", "huevo", "huevos"];
      const breadBakery = ["bread", "toast", "bun", "croissant", "roti", "पाव", "रोटी", "pan"];
      const snackSweets = ["chips", "cookie", "cookies", "chocolate", "candy", "ice cream", "चिप्स", "चॉकलेट", "बिस्कुट", "icecream", "papas", "galletas", "dulces"];
      const drinkBeverages = ["water", "juice", "soda", "coke", "tea", "coffee", "lemonade", "पानी", "चाय", "कॉफी", "शरबत", "cold drink", "agua", "refresco", "café", "jugo"];

      const nameLower = itemName.toLowerCase();
      if (fruitsVegetables.some((kw) => nameLower.includes(kw))) category = "Produce";
      else if (dairyEggs.some((kw) => nameLower.includes(kw))) category = "Dairy";
      else if (breadBakery.some((kw) => nameLower.includes(kw))) category = "Bakery";
      else if (snackSweets.some((kw) => nameLower.includes(kw))) category = "Snacks";
      else if (drinkBeverages.some((kw) => nameLower.includes(kw))) category = "Beverages";

      const formattedName = itemName.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const newItem = {
        id: `custom-${Date.now()}`,
        name: formattedName,
        category,
        price: 1.99, 
        brand: "Generic",
        isOrganic,
        inStock: true,
        substitute: null,
        season: "all",
        quantity: parsedQty,
        checked: false
      };

      setShoppingList((prev) => [...prev, newItem]);

      const confirmMsg =
        language === "hi-IN"
          ? `कस्टम आइटम ${newItem.name} जोड़ा गया।`
          : language === "es-ES"
          ? `Se agregó el artículo ${newItem.name} a la lista.`
          : `Added custom item ${newItem.name} to the list.`;

      addToast(confirmMsg, "success");
      speakFeedback(confirmMsg);
      setLastCommandText(confirmMsg);
      return { success: true, item: newItem.name, qty: parsedQty };
    }
  }, [language, addToast, speakFeedback]);

  // Remove Item Logic
  const removeItemFromList = useCallback((itemName) => {
    const normalized = itemName.toLowerCase().trim();
    const match = shoppingList.find(
      (i) => i.name.toLowerCase().includes(normalized) || normalized.includes(i.name.toLowerCase())
    );

    if (match) {
      setShoppingList((prev) => prev.filter((i) => i.id !== match.id));
      const confirmMsg =
        language === "hi-IN"
          ? `${match.name} हटा दिया गया है।`
          : language === "es-ES"
          ? `Se eliminó ${match.name} de la lista.`
          : `Removed ${match.name} from the list.`;

      addToast(confirmMsg, "success");
      speakFeedback(confirmMsg);
      setLastCommandText(confirmMsg);
      return { success: true, item: match.name };
    }

    const errorMsg = `Could not find "${itemName}" in your list.`;
    addToast(errorMsg, "warning");
    speakFeedback(
      language === "hi-IN"
        ? `आपकी सूची में ${itemName} नहीं मिला।`
        : language === "es-ES"
        ? `No se encontró ${itemName} en la lista.`
        : errorMsg
    );
    return { error: errorMsg };
  }, [language, shoppingList, addToast, speakFeedback]);

  // Toggle Checkbox
  const handleToggleCheck = useCallback((id) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }, []);

  // Delete item manually
  const handleDeleteItem = useCallback((id) => {
    setShoppingList((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        addToast(`Removed ${item.name}`, "success");
        speakFeedback(`Removed ${item.name}`);
        setLastCommandText(`Removed ${item.name}`);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, [addToast, speakFeedback]);

  // Update quantity manually
  const handleUpdateQuantity = useCallback((id, delta) => {
    setShoppingList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, Math.min(99, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, []);

  // Clear List
  const handleClearList = useCallback(() => {
    setShoppingList([]);
    const confirmMsg = "Shopping list cleared.";
    addToast(confirmMsg, "success");
    speakFeedback(confirmMsg);
    setLastCommandText(confirmMsg);
  }, [addToast, speakFeedback]);

  // Accept Substitute
  const handleAcceptSubstitute = useCallback(() => {
    if (substituteModal) {
      const { substituteItem, parsedQty } = substituteModal;
      setShoppingList((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === substituteItem.id);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: Math.min(99, updated[existingIndex].quantity + parsedQty)
          };
          return updated;
        } else {
          return [...prev, { ...substituteItem, quantity: parsedQty, checked: false }];
        }
      });

      const confirmMsg =
        language === "hi-IN"
          ? `ठीक है, ${substituteItem.name} जोड़ दिया गया है।`
          : language === "es-ES"
          ? `De acuerdo, se agregó ${substituteItem.name}.`
          : `Added substitute ${substituteItem.name}.`;

      addToast(confirmMsg, "success");
      speakFeedback(confirmMsg);
      setLastCommandText(`Accepted substitute: ${substituteItem.name}`);
      setSubstituteModal(null);
    }
  }, [substituteModal, language, addToast, speakFeedback]);

  // Decline Substitute
  const handleDeclineSubstitute = useCallback(() => {
    if (substituteModal) {
      const cancelMsg =
        language === "hi-IN"
          ? "बदलाव रद्द किया गया।"
          : language === "es-ES"
          ? "Cancelado."
          : "Substitution cancelled.";

      addToast(cancelMsg, "warning");
      speakFeedback(cancelMsg);
      setLastCommandText("Declined substitute");
      setSubstituteModal(null);
    }
  }, [substituteModal, language, addToast, speakFeedback]);

  // Handle incoming voice command results
  const handleSpeechResult = useCallback((text) => {
    if (!text || text.trim() === "") return;

    setIsProcessing(true);
    const timeStr = new Date().toLocaleTimeString();

    // 1. Check if substitute modal is open - intercept accept/decline triggers
    if (substituteModal) {
      const cleanText = text.trim().toLowerCase();
      const yesTriggers = ["yes", "yeah", "yep", "ok", "sure", "accept", "agree", "sí", "si", "sí por favor", "हां", "हाँ", "जोड़ें", "डालो"];
      const noTriggers = ["no", "nope", "decline", "cancel", "don't", "no thanks", "no gracias", "cancelar", "नहीं", "हटाओ", "रहने दो"];

      if (yesTriggers.some((kw) => cleanText.includes(kw))) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            time: timeStr,
            raw: text,
            action: "SUBSTITUTE_ACCEPT",
            item: substituteModal.substituteItem.name,
            quantity: substituteModal.parsedQty
          }
        ]);
        handleAcceptSubstitute();
        setIsProcessing(false);
        return;
      }

      if (noTriggers.some((kw) => cleanText.includes(kw))) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            time: timeStr,
            raw: text,
            action: "SUBSTITUTE_DECLINE",
            item: substituteModal.originalName,
            quantity: 0
          }
        ]);
        handleDeclineSubstitute();
        setIsProcessing(false);
        return;
      }
    }

    // 2. Normal Command Parsing
    const parsed = parseVoiceCommand(text, language);

    const pushLog = (logItem) => {
      setConsoleLogs((prev) => [...prev.slice(-29), logItem]);
    };

    if (parsed.action === "CLEAR_ALL") {
      pushLog({ time: timeStr, raw: text, action: "CLEAR_LIST", item: "", quantity: 0 });
      handleClearList();
    } 
    
    else if (parsed.action === "ADD") {
      if (!parsed.item) {
        pushLog({ time: timeStr, raw: text, action: "ADD", error: "No item detected" });
        speakFeedback(
          language === "hi-IN"
            ? "कृपया वस्तु का नाम बताएं।"
            : language === "es-ES"
            ? "Por favor diga el nombre del artículo."
            : "Please specify an item to add."
        );
      } else {
        const res = addItemToList(parsed.item, parsed.quantity, parsed.isOrganic);
        pushLog({
          time: timeStr,
          raw: text,
          action: "ADD",
          item: parsed.item,
          quantity: parsed.quantity,
          isOrganic: parsed.isOrganic,
          error: res?.error || null
        });
      }
    } 
    
    else if (parsed.action === "REMOVE") {
      if (!parsed.item) {
        pushLog({ time: timeStr, raw: text, action: "REMOVE", error: "No item detected" });
        speakFeedback(
          language === "hi-IN"
            ? "कृपया हटाने वाली वस्तु का नाम बताएं।"
            : "Please specify an item to remove."
        );
      } else {
        const res = removeItemFromList(parsed.item);
        pushLog({
          time: timeStr,
          raw: text,
          action: "REMOVE",
          item: parsed.item,
          quantity: parsed.quantity,
          error: res?.error || null
        });
      }
    } 
    
    else if (parsed.action === "SEARCH" || parsed.action === "FILTER") {
      if (!parsed.item && !parsed.maxPrice) {
        setSearchQuery("");
        setMaxPriceFilter(null);
        pushLog({ time: timeStr, raw: text, action: "CLEAR_SEARCH", item: "", quantity: 0 });
        speakFeedback(language === "hi-IN" ? "खोज परिणाम हटा दिए गए हैं।" : "Clearing search filters.");
        setLastCommandText("Search cleared");
      } else {
        setSearchQuery(parsed.item);
        setMaxPriceFilter(parsed.maxPrice);
        pushLog({
          time: timeStr,
          raw: text,
          action: "SEARCH",
          item: parsed.item || "All",
          quantity: 0,
          maxPrice: parsed.maxPrice
        });

        const speakMsg =
          language === "hi-IN"
            ? `सूची में खोज की जा रही है`
            : `Searching for ${parsed.item || "items"}${parsed.maxPrice ? ` under ${parsed.maxPrice} dollars` : ""}.`;
        speakFeedback(speakMsg);
        setLastCommandText(`Searched: "${parsed.item || "All Items"}"`);
      }
    } 
    
    else {
      pushLog({ time: timeStr, raw: text, action: "UNKNOWN", error: "Command not recognized" });
      speakFeedback(
        language === "hi-IN"
          ? "मुझे समझ नहीं आया, कृपया फिर से कहें।"
          : language === "es-ES"
          ? "No entendí, por favor repita."
          : "Command not recognized. Try saying 'add milk' or 'find cookies'."
      );
    }

    setIsProcessing(false);
  }, [language, substituteModal, addItemToList, removeItemFromList, handleClearList, handleAcceptSubstitute, handleDeclineSubstitute, speakFeedback]);

  // Calculate search items in real-time
  const memoizedSearchResults = useMemo(() => {
    let results = catalog;
    if (searchQuery) {
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (maxPriceFilter !== null) {
      results = results.filter((item) => item.price <= maxPriceFilter);
    }
    return results;
  }, [searchQuery, maxPriceFilter]);

  // Memoize recommendations
  const memoizedSeasonalItems = useMemo(() => getSeasonalPicks(catalog), []);
  const memoizedRestockItems = useMemo(() => getQuickRestocks(shoppingList, catalog), [shoppingList]);
  const memoizedFreqBoughtItems = useMemo(() => getFrequentlyBoughtTogether(shoppingList, catalog), [shoppingList]);

  // Calculate systemStatus string in real-time
  const systemStatus = useMemo(() => {
    if (isListening) return "Listening";
    if (isProcessing) return "Processing";
    if (isSpeaking) return "Speaking";
    return "Ready";
  }, [isListening, isProcessing, isSpeaking]);

  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="app-logo-group">
            <h1 className="app-logo" aria-label="VoiceCart Application">
              <span>🎙️</span> VoiceCart
            </h1>
            <span className="app-subtitle">Manage your shopping list hands-free</span>
          </div>
        </header>

        {speechError && (
          <div
            className="card-panel"
            style={{
              padding: "0.85rem 1rem",
              borderColor: "var(--color-danger)",
              background: "rgba(239,74,74,0.08)",
              color: "var(--color-danger)",
              textAlign: "center",
              borderRadius: "8px",
              fontSize: "0.85rem"
            }}
            role="alert"
          >
            {speechError}
          </div>
        )}

        {/* Dashboard Main Grid */}
        <main className="dashboard-grid">
          {/* Left Side: Shopping list */}
          <ShoppingList
            items={shoppingList}
            onToggleCheck={handleToggleCheck}
            onDelete={handleDeleteItem}
            onUpdateQuantity={handleUpdateQuantity}
            onClearList={handleClearList}
            onManualAdd={handleSpeechResult}
          />

          {/* Right Side: Controls, Recommendations, Search, Console Logs */}
          <div className="sidebar-container">
            <VoiceController
              isListening={isListening}
              interimTranscript={interimTranscript}
              transcript={transcript}
              startListening={startListening}
              stopListening={stopListening}
              language={language}
              setLanguage={setLanguage}
              speechSupported={speechSupported}
              systemStatus={systemStatus}
              lastCommandText={lastCommandText}
            />

            {isProcessing && (
              <div style={{ display: "flex", gap: "8px", flexDirection: "column", padding: "1rem" }} className="card-panel">
                <div className="skeleton-row" />
              </div>
            )}

            <CommandConsole logs={consoleLogs} />

            <ProductCatalogView
              searchResults={memoizedSearchResults}
              searchQuery={searchQuery}
              maxPriceFilter={maxPriceFilter}
              onAddItem={addItemToList}
            />

            <SmartSuggestions
              seasonalItems={memoizedSeasonalItems}
              restockItems={memoizedRestockItems}
              freqBoughtItems={memoizedFreqBoughtItems}
              onAddItem={addItemToList}
              substituteModal={substituteModal}
              onAcceptSubstitute={handleAcceptSubstitute}
              onDeclineSubstitute={handleDeclineSubstitute}
            />
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ErrorBoundary>
  );
}

export default App;
