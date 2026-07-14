import React from "react";

const SmartSuggestions = ({
  seasonalItems,
  restockItems,
  freqBoughtItems,
  recentlyPurchasedItems,
  onAddItem,
  substituteModal,
  onAcceptSubstitute,
  onDeclineSubstitute
}) => {
  return (
    <div className="suggestions-section card-panel" style={{ padding: "1.25rem" }}>
      <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
        <span>✨</span> Smart Suggestions
      </h3>

      {/* Frequently Bought Together */}
      {freqBoughtItems && freqBoughtItems.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div className="category-header" style={{ fontSize: "0.7rem", padding: 0, background: "none", color: "var(--color-accent-indigo)" }}>
            👥 Frequently Bought Together
          </div>
          <div className="suggestion-grid" style={{ marginTop: "0.25rem" }}>
            {freqBoughtItems.map((item) => (
              <div
                key={item.id}
                className="suggestion-card"
                onClick={() => onAddItem(item.name, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onAddItem(item.name, 1); }}
                aria-label={`Add ${item.name} for $${item.price.toFixed(2)}`}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                <div className="sugg-info">
                  <div className="sugg-name" style={{ fontSize: "0.8rem" }}>{item.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Matches current items</div>
                </div>
                <div className="sugg-price-row">
                  <span className="sugg-price" style={{ fontSize: "0.8rem" }}>${item.price.toFixed(2)}</span>
                  <span className="sugg-btn-add" style={{ fontSize: "0.75rem" }}>+ Add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Picks */}
      {seasonalItems && seasonalItems.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div className="category-header" style={{ fontSize: "0.7rem", padding: 0, background: "none", color: "var(--color-success)" }}>
            🌞 Seasonal Specials
          </div>
          <div className="suggestion-grid" style={{ marginTop: "0.25rem" }}>
            {seasonalItems.map((item) => (
              <div
                key={item.id}
                className="suggestion-card"
                onClick={() => onAddItem(item.name, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onAddItem(item.name, 1); }}
                aria-label={`Add ${item.name} for $${item.price.toFixed(2)}`}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                <div className="sugg-info">
                  <div className="sugg-name" style={{ fontSize: "0.8rem" }}>{item.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Fresh this season</div>
                </div>
                <div className="sugg-price-row">
                  <span className="sugg-price" style={{ fontSize: "0.8rem" }}>${item.price.toFixed(2)}</span>
                  <span className="sugg-btn-add" style={{ fontSize: "0.75rem" }}>+ Add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Restock */}
      {restockItems && restockItems.length > 0 && (
        <div>
          <div className="category-header" style={{ fontSize: "0.7rem", padding: 0, background: "none", color: "var(--color-warning)" }}>
            🔄 Suggested Restocks
          </div>
          <div className="suggestion-grid" style={{ marginTop: "0.25rem" }}>
            {restockItems.map((item) => (
              <div
                key={item.id}
                className="suggestion-card"
                onClick={() => onAddItem(item.name, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onAddItem(item.name, 1); }}
                aria-label={`Add ${item.name} for $${item.price.toFixed(2)}`}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                <div className="sugg-info">
                  <div className="sugg-name" style={{ fontSize: "0.8rem" }}>{item.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Common staple</div>
                </div>
                <div className="sugg-price-row">
                  <span className="sugg-price" style={{ fontSize: "0.8rem" }}>${item.price.toFixed(2)}</span>
                  <span className="sugg-btn-add" style={{ fontSize: "0.75rem" }}>+ Add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Purchased */}
      {recentlyPurchasedItems && recentlyPurchasedItems.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="category-header" style={{ fontSize: "0.7rem", padding: 0, background: "none", color: "var(--color-text-secondary)" }}>
            🕒 Recently Purchased
          </div>
          <div className="suggestion-grid" style={{ marginTop: "0.25rem" }}>
            {recentlyPurchasedItems.map((item) => (
              <div
                key={item.id}
                className="suggestion-card"
                onClick={() => onAddItem(item.name, 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") onAddItem(item.name, 1); }}
                aria-label={`Add ${item.name} for $${item.price.toFixed(2)}`}
                style={{ padding: "0.5rem 0.75rem" }}
              >
                <div className="sugg-info">
                  <div className="sugg-name" style={{ fontSize: "0.8rem" }}>{item.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Buy again</div>
                </div>
                <div className="sugg-price-row">
                  <span className="sugg-price" style={{ fontSize: "0.8rem" }}>${item.price.toFixed(2)}</span>
                  <span className="sugg-btn-add" style={{ fontSize: "0.75rem" }}>+ Add</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Substitute Modal Popup */}
      {substituteModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <h3 id="modal-title" className="modal-title">⚠️ Item Out of Stock</h3>
            <p className="modal-body">
              <strong>"{substituteModal.originalName}"</strong> is currently unavailable. 
              Would you like to substitute with this alternative?
            </p>
            
            <div className="substitute-compare-card">
              <div className="comp-item">
                <div className="comp-label">Requested</div>
                <div className="comp-name" style={{ textDecoration: "line-through", opacity: 0.6 }}>
                  {substituteModal.originalName}
                </div>
              </div>
              <div style={{ fontSize: "1.25rem", color: "var(--color-text-muted)" }} aria-hidden="true">➔</div>
              <div className="comp-item">
                <div className="comp-label">Substitute</div>
                <div className="comp-name" style={{ color: "var(--color-primary)" }}>
                  {substituteModal.substituteItem.name}
                </div>
                <div className="comp-price">
                  ${substituteModal.substituteItem.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal btn-modal-primary" 
                onClick={onAcceptSubstitute}
                aria-label={`Accept substitute item ${substituteModal.substituteItem.name}`}
              >
                Accept
              </button>
              <button 
                className="btn-modal btn-modal-secondary" 
                onClick={onDeclineSubstitute}
                aria-label="Decline substitute suggestion"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(SmartSuggestions);
