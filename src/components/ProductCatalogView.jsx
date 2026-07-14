import React from "react";

const ProductCatalogView = ({ searchResults, searchQuery, maxPriceFilter, onAddItem }) => {
  return (
    <section className="search-section glass-panel" aria-label="Product Catalog and Search">
      <div className="section-title-bar">
        <h3 className="section-title">
          <span>🔍</span> {searchQuery ? "Voice Search Results" : "Store Catalog"}
        </h3>
        {maxPriceFilter && (
          <span 
            style={{ fontSize: "0.8rem", color: "var(--color-accent-cyan)", background: "rgba(0, 242, 254, 0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}
            aria-label={`Price limit filter set to ${maxPriceFilter} dollars`}
          >
            Price Limit: ${maxPriceFilter.toFixed(2)}
          </span>
        )}
      </div>

      <div className="search-indicator-bar" aria-live="polite">
        {searchQuery ? (
          <span>Showing results for "{searchQuery}"</span>
        ) : (
          <span>Browse popular items or search by voice (e.g. "Find organic apples")</span>
        )}
      </div>

      <div className="search-results" role="list">
        {searchResults.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
            No items found matching the search criteria.
          </div>
        ) : (
          searchResults.map((item) => (
            <div 
              key={item.id} 
              className="search-result-item" 
              style={{ opacity: item.inStock ? 1 : 0.6 }}
              role="listitem"
            >
              <div>
                <div className="res-name">
                  {item.name} 
                  {item.isOrganic && <span className="item-meta">Organic</span>}
                  {item.season && item.season !== "all" && (
                    <span className="item-meta" style={{ backgroundColor: "rgba(0,245,160,0.1)", color: "var(--color-success)" }}>
                      {item.season}
                    </span>
                  )}
                </div>
                <div className="res-meta">
                  {item.brand} | {item.category}
                  {!item.inStock && (
                    <span style={{ color: "var(--color-danger)", marginLeft: "0.5rem", fontWeight: "bold" }}>
                      (Out of Stock)
                    </span>
                  )}
                </div>
              </div>
              <div className="res-right">
                <div className="res-price" aria-label={`Price is ${item.price.toFixed(2)} dollars`}>
                  ${item.price.toFixed(2)}
                </div>
                <button
                  className="btn-add-search"
                  onClick={() => onAddItem(item.name, 1)}
                  style={{
                    backgroundColor: item.inStock ? "var(--color-primary)" : "var(--color-warning)",
                    color: item.inStock ? "#fff" : "#000"
                  }}
                  aria-label={item.inStock ? `Add ${item.name} to list` : `Suggest substitute for ${item.name}`}
                >
                  {item.inStock ? "Add" : "Substitute"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default React.memo(ProductCatalogView);
