"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CatalogItem } from "../catalog";

interface MobileSizeSheetProps {
  item: CatalogItem | null;
  onClose: () => void;
  onConfirm: (size: string) => void;
  currentSize?: string;
}

export const MobileSizeSheet: React.FC<MobileSizeSheetProps> = ({
  item,
  onClose,
  onConfirm,
  currentSize,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(currentSize || "");

  useEffect(() => {
    setMounted(true);
    if (currentSize) {
      setSelectedSize(currentSize);
    } else {
      setSelectedSize("");
    }
  }, [item, currentSize]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted || !item) return null;

  const handleSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleApply = () => {
    if (!selectedSize) return;
    onConfirm(selectedSize);
  };

  const sheetContent = (
    <div className="rw-sheet-host">
      {/* Scrim */}
      <div
        role="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-[2147483000] bg-[rgba(12,10,8,0.38)] transition-opacity duration-500 opacity-100"
      />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Select size for ${item.name}`}
        className="fixed bottom-0 left-0 right-0 w-full z-[2147483001] max-h-[min(82vh,640px)] bg-white rounded-t-[20px] shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.4)] flex flex-col p-5 pb-[calc(20px+env(safe-area-inset-bottom))] animate-[rw-sheet-up_0.65s_var(--rw-ease-sheet)] overflow-hidden"
      >
        {/* Grabber bar */}
        <div className="w-[34px] h-[4px] rounded-full bg-[rgba(21,20,19,0.16)] mx-auto mb-4" />

        {/* Heading */}
        <div className="grid grid-cols-[52px_1fr_44px] gap-[14px] items-center pb-4 border-b border-[#c8c8c8]">
          <img
            src={item.image}
            alt=""
            className="w-[52px] h-[52px] object-cover bg-[#f8f8f8]"
          />
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-[#151413]">{item.name}</span>
            <span className="text-[12px] text-[#66625c]">${item.price.toFixed(2)}</span>
          </div>
          <button
            type="button"
            aria-label="Close sheet"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-[22px] bg-transparent border-0 cursor-pointer active:rotate-90 active:scale-90 transition-transform"
          >
            ×
          </button>
        </div>

        {/* Options List */}
        <div className="py-4 overflow-y-auto flex-1 flex flex-col gap-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#66625c]">
            Select size:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {item.variants.map((v) => {
              const sizeVal = v.o[0];
              const isAvailable = v.a;
              const isSelected = selectedSize === sizeVal;

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleSelect(sizeVal)}
                  className={`py-3 px-2 text-[12px] font-medium border text-center transition-colors cursor-pointer ${
                    !isAvailable
                      ? "opacity-35 line-through cursor-not-allowed border-[#e0e0e0] text-[#999]"
                      : isSelected
                      ? "bg-[#151413] text-white border-[#151413]"
                      : "bg-white text-[#151413] border-[#c8c8c8] hover:border-[#151413]"
                  }`}
                >
                  {sizeVal}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          disabled={!selectedSize}
          onClick={handleApply}
          className="w-full min-h-[54px] bg-[#151413] text-white text-[13px] font-medium tracking-wide flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-0 mt-2"
        >
          Confirm Size
        </button>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
};
