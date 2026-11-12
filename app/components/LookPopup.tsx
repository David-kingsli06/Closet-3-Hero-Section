"use client";

import React, { useEffect, useRef } from "react";
import { CATALOG, CatalogItem } from "../catalog";

interface LookPopupProps {
  isOpen: boolean;
  lookIndex: number;
  onClose: () => void;
  hotPin: number | null;
  onHotChange: (pinNum: number | null) => void;
  onPinClick: (pinNum: number) => void;
  footShift?: number;
}

export const LookPopup: React.FC<LookPopupProps> = ({
  isOpen,
  lookIndex,
  onClose,
  hotPin,
  onHotChange,
  onPinClick,
  footShift = 0,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const look = CATALOG.looks[lookIndex];

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const paddedLookIndex = String(lookIndex + 1).padStart(2, "0");

  return (
    <div
      role="region"
      aria-label="View look"
      aria-hidden={!isOpen}
      className="rw__popup fixed md:absolute inset-0 z-40 bg-white flex flex-col justify-between transition-opacity duration-450"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4 pt-8 md:pt-8 px-5 md:pl-14 md:pr-8 z-50 animate-[rw-fade_0.8s_var(--rw-ease)_0.35s_both]">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#66625c] tabular-nums font-medium">
            Look {paddedLookIndex}
          </span>
          <h3 className="text-[17px] md:text-[18px] font-normal leading-[1.1] text-[#151413] m-0 truncate">
            {look.name}
          </h3>
        </div>

        {/* Close Button */}
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Close look view"
          onClick={onClose}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[rgba(21,20,19,0.22)] bg-[rgba(255,255,255,0.55)] backdrop-blur-[8px] flex items-center justify-center cursor-pointer hover:rotate-90 hover:border-[#151413] transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 stroke-[#151413] fill-none stroke-[1.5]"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>

      {/* Popup Stage */}
      <div
        className="relative flex-1 flex items-end justify-center px-4 pb-10 md:pb-12 cursor-zoom-out select-none"
        onClick={(e) => {
          // If clicking background/beside model, close
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Model Container with Aspect 9:16 */}
        <div
          className="relative h-[min(72vh,780px)] aspect-[0.5625] flex items-end justify-center pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shadow */}
          <div
            className="absolute left-[58%] bottom-0 w-[150%] h-[9%] min-h-[14px] max-h-[46px] -translate-x-1/2 translate-y-1/2 blur-[2px] pointer-events-none rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)",
            }}
          />

          {/* Model Art Wrapper */}
          <div
            className="absolute inset-0 transition-transform duration-500"
            style={{
              transform: `translateY(${footShift * 100}%)`,
            }}
          >
            <img
              src={look.model640}
              srcSet={`${look.model640} 640w, ${look.model1080} 1080w`}
              sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px"
              alt={look.name}
              loading="eager"
              decoding="async"
              draggable="false"
              className="w-full h-full object-contain object-bottom pointer-events-none"
            />
          </div>

          {/* Pins on Model */}
          {look.pins.map((pin) => {
            const isHot = hotPin === pin.pinNumber;
            const delayMs = pin.pinNumber * 110 + 600;

            return (
              <div
                key={pin.pinNumber}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  animation: `rw-pin-in 0.9s var(--rw-ease-spring) ${delayMs}ms both`,
                }}
              >
                <button
                  type="button"
                  data-tip={pin.productName}
                  aria-label={`${pin.pinNumber}: ${pin.productName}`}
                  onClick={() => onPinClick(pin.pinNumber)}
                  onMouseEnter={() => onHotChange(pin.pinNumber)}
                  onMouseLeave={() => onHotChange(null)}
                  className={`group relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 cursor-pointer ${
                    isHot
                      ? "bg-[#0e0e0e] text-white scale-125 shadow-[0_0_0_6px_rgba(14,14,14,0.22),0_8px_20px_-6px_rgba(0,0,0,0.45)]"
                      : "bg-white text-[#151413] shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:scale-110"
                  }`}
                >
                  {/* Halo rings */}
                  <span className="absolute inset-[-5px] rounded-full border border-[rgba(255,255,255,0.8)] animate-[rw-ring_2.6s_cubic-bezier(.2,.6,.3,1)_infinite] pointer-events-none" />
                  <span className="absolute inset-[-5px] rounded-full border border-[rgba(255,255,255,0.55)] animate-[rw-ring_2.6s_cubic-bezier(.2,.6,.3,1)_1.3s_infinite] pointer-events-none" />

                  <span>{pin.pinNumber}</span>

                  {/* Tooltip */}
                  <span
                    className={`absolute left-[calc(100%-6px)] top-1/2 -translate-y-1/2 ml-3 py-[7px] px-3 rounded-full bg-[rgba(255,255,255,0.92)] backdrop-blur-[10px] text-[#151413] text-[11px] font-medium tracking-[0.04em] whitespace-nowrap shadow-[0_10px_26px_-12px_rgba(0,0,0,0.4)] pointer-events-none transition-all duration-300 ${
                      isHot
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0"
                    }`}
                  >
                    {pin.productName}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="text-center pb-4 z-50 pointer-events-none">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#66625c] animate-[rw-fade_1s_var(--rw-ease)_1.1s_both]">
          Tap a dot to shop the piece
        </span>
      </div>
    </div>
  );
};
