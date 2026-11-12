"use client";

import React, { useRef, useEffect } from "react";
import { CATALOG, CatalogItem } from "../catalog";

export type BagEntry = {
  id: string;
  variantId: number;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
  url: string;
};

interface StylingBagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bag: BagEntry[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export const StylingBagDialog: React.FC<StylingBagDialogProps> = ({
  isOpen,
  onClose,
  bag,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const subtotal = bag.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleExportShortlist = () => {
    if (bag.length === 0) return;

    let content = `RUNWAY — STYLING SHORTLIST\n\nReference prices; no order or payment has been placed.\n\n`;
    bag.forEach((item) => {
      content += `${item.productName} · Size ${item.size} · Quantity ${item.quantity}\n${item.url}\n\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "runway-outfit-shortlist.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <dialog
      id="bag-dialog"
      ref={dialogRef}
      onClose={onClose}
      style={{
        margin: "auto",
        border: "1px solid #d9d9d9",
        background: "#fff",
        color: "#151413",
        padding: "24px",
        width: "min(560px, calc(100vw - 32px))",
        maxHeight: "85dvh",
        overflowY: "auto",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Heading */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <h2 style={{ fontSize: "25px", fontWeight: 400, margin: 0, color: "#151413" }}>
            Your styling bag
          </h2>
          <button
            type="button"
            aria-label="Close styling bag"
            onClick={onClose}
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              lineHeight: 1,
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: "#151413",
            }}
          >
            ×
          </button>
        </div>

        {/* Note */}
        <p style={{ fontSize: "12px", color: "#666", lineHeight: 1.5, margin: 0 }}>
          A local outfit shortlist. No payment or order is collected here. Open a piece on the original demo to continue.
        </p>

        {/* Bag Content */}
        {bag.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", fontSize: "13px", color: "#66625c" }}>
            Your styling bag is empty. Choose a size beside a piece to save it.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {bag.map((item, idx) => (
              <div
                key={`${item.variantId}-${idx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  gap: "18px",
                  padding: "18px 0",
                  borderBottom: "1px solid #ddd",
                  alignItems: "center",
                }}
              >
                <img
                  src={item.image}
                  alt={item.productName}
                  style={{ width: "60px", height: "80px", objectFit: "contain", background: "#f9f9f9" }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "14px", fontWeight: 400, marginBottom: "8px", color: "#151413" }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#66625c", marginBottom: "4px" }}>
                    Size {item.size} · Quantity {item.quantity} · ${item.price.toFixed(2)}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "12px", textDecoration: "underline", textUnderlineOffset: "3px", color: "#151413" }}
                  >
                    View original piece ↗
                  </a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    style={{
                      fontSize: "11px",
                      color: "#66625c",
                      textDecoration: "underline",
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    aria-label={`Remove ${item.productName}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div style={{ textAlign: "right", fontSize: "15px", padding: "12px 0", fontWeight: 400, color: "#151413" }}>
              Reference subtotal ${subtotal.toFixed(2)}
            </div>

            {/* Export Shortlist */}
            <button
              type="button"
              onClick={handleExportShortlist}
              disabled={bag.length === 0}
              style={{
                width: "100%",
                background: "#151413",
                color: "#fff",
                padding: "16px 20px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.02em",
                cursor: "pointer",
                border: 0,
                marginTop: "8px",
              }}
            >
              Download outfit shortlist
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
};
