"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { SiteHeader } from "./components/SiteHeader";
import { RunwaySection } from "./components/RunwaySection";
import { StylingBagDialog, BagEntry } from "./components/StylingBagDialog";
import { BagStatusToast } from "./components/BagStatusToast";
import { CatalogItem, Variant } from "./catalog";

const BAG_STORAGE_KEY = "runway-styling-bag-v3";

export default function RunwayPage() {
  const [bag, setBag] = useState<BagEntry[]>([]);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({});
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load bag from localStorage with full validation (Spec 71)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BAG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate: safe integer quantities, 1-20, max 50 entries
          const validEntries: BagEntry[] = [];
          for (let i = 0; i < Math.min(parsed.length, 50); i++) {
            const entry = parsed[i];
            if (
              entry &&
              typeof entry.id === "string" &&
              Number.isSafeInteger(entry.variantId) &&
              typeof entry.productName === "string" &&
              Number.isSafeInteger(entry.quantity) &&
              entry.quantity >= 1 &&
              entry.quantity <= 20
            ) {
              validEntries.push(entry);
            }
          }
          setBag(validEntries);
        }
      }
    } catch {
      // LocalStorage access fail or corrupt JSON
    }
  }, []);

  // Save bag to localStorage whenever changed
  const saveBag = useCallback((newBag: BagEntry[]) => {
    setBag(newBag);
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(newBag));
    } catch {
      // Quota exceeded or private browsing
    }
  }, []);

  // Show Toast for 2.5s
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Add items to styling bag
  const handleAddToBag = useCallback(
    (items: { item: CatalogItem; variant: Variant }[]) => {
      const updatedBag = [...bag];

      items.forEach(({ item, variant }) => {
        const sizeStr = variant.o[0] || "Standard";
        const existingIdx = updatedBag.findIndex(
          (b) => b.id === item.id && b.variantId === variant.id
        );

        if (existingIdx >= 0) {
          const currentQty = updatedBag[existingIdx].quantity;
          updatedBag[existingIdx] = {
            ...updatedBag[existingIdx],
            quantity: Math.min(20, currentQty + 1),
          };
        } else {
          if (updatedBag.length < 50) {
            updatedBag.push({
              id: item.id,
              variantId: variant.id,
              productName: item.name,
              size: sizeStr,
              price: item.price,
              quantity: 1,
              image: item.image,
              url: item.url,
            });
          }
        }
      });

      saveBag(updatedBag);

      // Update added indicator states
      setAddedProductIds((prev) => {
        const next = { ...prev };
        items.forEach(({ item }) => {
          next[item.id] = true;
        });
        return next;
      });

      // Show toast
      if (items.length === 1) {
        showToast("Piece saved to your styling bag");
      } else {
        showToast("Look saved to your styling bag");
      }
    },
    [bag, saveBag, showToast]
  );

  const handleRemoveFromBag = (index: number) => {
    const next = [...bag];
    next.splice(index, 1);
    saveBag(next);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1 || quantity > 20) return;
    const next = [...bag];
    next[index] = { ...next[index], quantity };
    saveBag(next);
  };

  const totalCartCount = bag.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Site Header */}
      <SiteHeader
        cartCount={totalCartCount}
        onOpenBag={() => setIsBagOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <RunwaySection
          onAddToBag={handleAddToBag}
          onAnnounce={() => {}}
          addedProductIds={addedProductIds}
        />
      </main>

      {/* Styling Bag Dialog */}
      <StylingBagDialog
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        bag={bag}
        onRemoveItem={handleRemoveFromBag}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* Bag Status Toast */}
      <BagStatusToast message={toastMessage} />
    </div>
  );
}
