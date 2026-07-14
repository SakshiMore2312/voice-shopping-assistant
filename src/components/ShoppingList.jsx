import React, { useState } from "react";

const categoryIcons = {
  "Produce": "🥦",
  "Dairy": "🥛",
  "Bakery": "🍞",
  "Pantry": "🥫",
  "Snacks": "🍪",
  "Beverages": "🥤",
  "Meat & Seafood": "🥩"
};

const ShoppingList = ({
  items,
  onToggleCheck,
  onDelete,
  onUpdateQuantity,
  onClearList,
  onManualAdd
}) => {
  const [manualText, setManualText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (manualText.trim()) {
      onManualAdd(manualText);
      setManualText("");
    }
  };

  // Group items by category
  const categories = {};
  items.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="list-section card-panel" aria-label="Shopping List Manager">
      <div className="section-title-bar">
        <h2 className="section-title">
          <span>🛒</span> My Shopping List ({items.length})
        </h2>
        {items.length > 0 && (
          <button 
            className="btn-clear-all" 
            onClick={onClearList}
            aria-label="Clear all items from shopping list"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-list-state" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-secondary)" }}>
          <div style={{ fontSize: "2.5rem", opacity: 0.2 }} aria-hidden="true">📦</div>
          <h3 style={{ fontSize: "1rem", marginTop: "0.5rem", fontWeight: "600", color: "var(--color-text-primary)" }}>
            Your list is currently empty
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
            Use the mic and say: <strong style={{ color: "var(--color-primary)" }}>"Add 2 boxes of cookies"</strong>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {Object.keys(categories).map((catName) => (
            <div key={catName} className="category-group">
              <div className="category-header" id={`cat-header-${catName}`}>
                <span aria-hidden="true" style={{ marginRight: "0.25rem" }}>
                  {categoryIcons[catName] || "📦"}
                </span>{" "}
                {catName}
              </div>
              <div className="shopping-items-list" role="list" aria-labelledby={`cat-header-${catName}`}>
                {categories[catName].map((item) => (
                  <div key={item.id} className="shopping-item-card" role="listitem">
                    <div className="item-left">
                      <button
                        className={`checkbox-custom ${item.checked ? "checked" : ""}`}
                        onClick={() => onToggleCheck(item.id)}
                        aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
                        aria-checked={item.checked}
                        role="checkbox"
                      />
                      <span className={`item-text ${item.checked ? "checked" : ""}`}>
                        {item.name}
                        {item.isOrganic && <span className="item-meta">Organic</span>}
                      </span>
                    </div>
                    <div className="item-right">
                      <div className="quantity-controls" aria-label={`Quantity adjustment for ${item.name}`}>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.name} by 1`}
                        >
                          -
                        </button>
                        <span className="qty-val" aria-live="polite" aria-label={`Current quantity ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Increase quantity of ${item.name} by 1`}
                        >
                          +
                        </button>
                      </div>
                      <span className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        className="btn-delete-item"
                        onClick={() => onDelete(item.id)}
                        title={`Remove ${item.name} from list`}
                        aria-label={`Remove ${item.name} from list`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="list-summary-card">
            <span className="summary-title">Total Estimated Cost</span>
            <span className="summary-total" aria-live="polite" aria-label={`Total cost is ${totalCost.toFixed(2)} dollars`}>
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Manual Input Fallback */}
      <form onSubmit={handleSubmit} className="text-input-bar" aria-label="Manual command input form">
        <input
          type="text"
          className="manual-input"
          placeholder="Or type a command, e.g. 'add 3 bananas'..."
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          aria-label="Manual text command input"
        />
        <button type="submit" className="btn-send-command" aria-label="Execute typed command">
          Execute
        </button>
      </form>
    </section>
  );
};

export default React.memo(ShoppingList);
