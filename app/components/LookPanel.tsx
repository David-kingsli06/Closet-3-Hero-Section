"use client";

import React, { useState, useEffect } from "react";
import { CATALOG, CatalogItem, Variant } from "../catalog";

interface LookPanelProps {
  lookIndex: number;
  hotPin: number | null;
  onHotChange: (pinNum: number | null) => void;
  onEngagement: () => void;
  onAddToBag: (items: { item: CatalogItem; variant: Variant }[]) => void;
  selectedSizes: Record<string, string>;
  onSelectSize: (productId: string, size: string) => void;
  touchedCards: Record<string, boolean>;
  onOpenMobileSheet: (item: CatalogItem) => void;
  activePickerId: string | null;
  setActivePickerId: (id: string | null) => void;
  bundleMessage: string | null;
  setBundleMessage: (msg: string | null) => void;
  isBundleLoading: boolean;
  setIsBundleLoading: (loading: boolean) => void;
  addedProductIds: Record<string, boolean>;
}

export const LookPanel: React.FC<LookPanelProps> = ({
  lookIndex,
  hotPin,
  onHotChange,
  onEngagement,
  onAddToBag,
  selectedSizes,
  onSelectSize,
  touchedCards,
  onOpenMobileSheet,
  activePickerId,
  setActivePickerId,
  bundleMessage,
  setBundleMessage,
  isBundleLoading,
  setIsBundleLoading,
  addedProductIds,
}) => {
  const look = CATALOG.looks[lookIndex];
  const products = look.products.map((pName) =>
    CATALOG.items.find((item) => item.name === pName)!
  );

  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const allComplete = products.every((p) => addedProductIds[p.id]);

  const handleAddSingle = (item: CatalogItem, pinNum: number) => {
    onEngagement();
    const isTouched = touchedCards[item.id];
    const chosenSize = selectedSizes[item.id];

    if (!isTouched || !chosenSize) {
      if (typeof window !== "undefined" && window.innerWidth < 750) {
        onOpenMobileSheet(item);
      } else {
        setActivePickerId(activePickerId === item.id ? null : item.id);
      }
      return;
    }

    const variant = item.variants.find((v) => v.o.includes(chosenSize) && v.a);
    if (!variant) {
      setBundleMessage(`Please choose an available size for ${item.name}.`);
      return;
    }

    setRowLoading((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      onAddToBag([{ item, variant }]);
      setRowLoading((prev) => ({ ...prev, [item.id]: false }));
      setActivePickerId(null);
    }, 300);
  };

  const handleBundleAdd = () => {
    onEngagement();
    if (allComplete || isBundleLoading) return;

    setBundleMessage(null);
    const missing: CatalogItem[] = [];
    const readyToAdd: { item: CatalogItem; variant: Variant }[] = [];

    products.forEach((p) => {
      const isTouched = touchedCards[p.id];
      const chosenSize = selectedSizes[p.id];
      if (!isTouched || !chosenSize) {
        missing.push(p);
      } else {
        const variant = p.variants.find((v) => v.o.includes(chosenSize) && v.a);
        if (variant) {
          readyToAdd.push({ item: p, variant });
        } else {
          missing.push(p);
        }
      }
    });

    if (missing.length > 0) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 750;
      if (isMobile) {
        onOpenMobileSheet(missing[0]);
      } else {
        setActivePickerId(missing[0].id);
      }

      const missingNames = missing.map((m) => m.name).join(", ");
      setBundleMessage(`Pick a size for: ${missingNames}`);

      const firstMissingEl = document.querySelector(`[data-rw-card="${missing[0].id}"]`);
      if (firstMissingEl) {
        firstMissingEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    setIsBundleLoading(true);
    setTimeout(() => {
      onAddToBag(readyToAdd);
      setIsBundleLoading(false);
      setBundleMessage(null);
    }, 450);
  };

  return (
    <aside
      className="rw-panel-root"
      onMouseLeave={() => onHotChange(null)}
    >
      <div className="rw-panel-inner">
        {/* Desktop Header */}
        <div className="rw-panel-header-desktop">
          <h2 className="rw-panel-title">In this look</h2>
          <span className="rw-panel-count">3 pieces</span>
        </div>

        {/* Mobile Header */}
        <div className="rw-panel-header-mobile">
          <h2 className="rw-panel-title">In this look</h2>
          <span className="rw-panel-count">3 pieces</span>
        </div>

        {/* Product Rows List */}
        <div className="rw-product-list">
          {products.map((item, idx) => {
            const pinNum = idx + 1;
            const isHot = hotPin === pinNum;
            const isAdded = !!addedProductIds[item.id];
            const isLoading = !!rowLoading[item.id];
            const isTouched = !!touchedCards[item.id];
            const chosenSize = selectedSizes[item.id];
            const hasNewTag = look.newProduct === item.name;
            const isPickerOpen = activePickerId === item.id;

            return (
              <div
                key={`${lookIndex}-${item.id}`}
                data-rw-card={item.id}
                data-touched={isTouched ? "1" : "0"}
                className={`rw-product-card ${isHot ? "is-hot" : ""}`}
                onMouseEnter={() => onHotChange(pinNum)}
                onMouseLeave={() => onHotChange(null)}
              >
                <div className="rw-card-grid">
                  {/* Thumbnail */}
                  <div className="rw-thumb-box">
                    {hasNewTag && (
                      <div className="rw-new-tag-box">
                        <div className="rw-new-tag-line" />
                        <span className="rw-new-tag-text">New</span>
                      </div>
                    )}

                    <span className={`rw-pin-badge ${isHot ? "badge-hot" : ""}`}>
                      {pinNum}
                    </span>

                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width="400"
                      className="rw-thumb-img"
                    />
                  </div>

                  {/* Info */}
                  <div className="rw-card-info">
                    <span className="rw-product-type">{item.type}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rw-product-name"
                    >
                      {item.name}
                    </a>
                    <div className="rw-product-price">${item.price.toFixed(2)}</div>

                    <button
                      type="button"
                      aria-expanded={isPickerOpen}
                      aria-controls={`picker-${item.id}`}
                      onClick={() => {
                        onEngagement();
                        if (typeof window !== "undefined" && window.innerWidth < 750) {
                          onOpenMobileSheet(item);
                        } else {
                          setActivePickerId(isPickerOpen ? null : item.id);
                        }
                      }}
                      className="rw-select-size-btn"
                    >
                      <span>
                        {isTouched && chosenSize ? `Size: ${chosenSize}` : "Select size"}
                      </span>
                    </button>
                  </div>

                  {/* Add Button */}
                  <div className="rw-card-action">
                    <button
                      type="button"
                      aria-label={`Add ${item.name} to styling bag`}
                      aria-expanded={isPickerOpen}
                      aria-controls={`picker-${item.id}`}
                      onClick={() => handleAddSingle(item, pinNum)}
                      className={`rw-add-single-btn ${isAdded ? "is-added" : ""}`}
                    >
                      {!isAdded && !isLoading && (
                        <svg viewBox="0 0 24 24" className="rw-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.3">
                          <path d="M12 4v16M4 12h16" />
                        </svg>
                      )}
                      {isAdded && (
                        <svg viewBox="0 0 24 24" className="rw-icon-svg" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4.5 12.5l5 5L19.5 7" />
                        </svg>
                      )}
                      {isLoading && <span className="rw-spinner-text">...</span>}
                    </button>
                  </div>
                </div>

                {/* Inline Desktop Picker */}
                {isPickerOpen && (
                  <div id={`picker-${item.id}`} className="rw-inline-picker">
                    <div className="rw-picker-header">
                      <span>Available sizes:</span>
                      <button
                        type="button"
                        onClick={() => setActivePickerId(null)}
                        className="rw-picker-close"
                      >
                        Close
                      </button>
                    </div>
                    <div className="rw-picker-sizes">
                      {item.variants.map((v) => {
                        const sizeVal = v.o[0];
                        const isAvailable = v.a;
                        const isSelected = isTouched && chosenSize === sizeVal;

                        return (
                          <button
                            key={v.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              onEngagement();
                              onSelectSize(item.id, sizeVal);
                            }}
                            className={`rw-size-chip ${isSelected ? "selected" : ""} ${
                              !isAvailable ? "disabled" : ""
                            }`}
                          >
                            {sizeVal}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bundle Footer */}
      <div className="rw-bundle-footer">
        {bundleMessage && (
          <div role="status" className="rw-bundle-msg">
            {bundleMessage}
          </div>
        )}

        <div className="rw-bundle-price-row">
          <div className="rw-bundle-info">
            <span className="rw-bundle-title">Complete the look</span>
            <span className="rw-bundle-note">Bundle all 3 and save 10%</span>
          </div>
          <div className="rw-bundle-prices">
            <span className="rw-bundle-old-price">$547.00</span>
            <span className="rw-bundle-curr-price">$492.30</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBundleAdd}
          disabled={allComplete || isBundleLoading}
          className={`rw-bundle-cta ${allComplete ? "is-complete" : ""}`}
        >
          <span className="rw-bundle-cta-label-desktop">
            {allComplete ? "Full look in your bag" : "Add full look to bag"}
          </span>
          <span className="rw-bundle-cta-label-mobile">
            {allComplete ? "Full look in your bag" : "Add full look — $492.30"}
          </span>
          {!allComplete && !isBundleLoading && (
            <svg viewBox="0 0 26 14" className="rw-bundle-arrow" stroke="#fff" fill="none" strokeWidth="1.4">
              <path d="M1 7h24M19 1l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
    </aside>
  );
};
