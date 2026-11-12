"use client";

import React from "react";

interface BagStatusToastProps {
  message: string | null;
}

export const BagStatusToast: React.FC<BagStatusToastProps> = ({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#151413] text-white py-3 px-5 text-[12px] z-[2147483002] transition-opacity duration-250 pointer-events-none whitespace-nowrap shadow-lg ${
        message ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
};
