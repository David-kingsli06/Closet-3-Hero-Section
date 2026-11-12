import React from "react";

interface SiteHeaderProps {
  cartCount: number;
  onOpenBag: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  cartCount,
  onOpenBag,
}) => {
  return (
    <header
      className="site-header"
      style={{
        height: "88px",
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        gap: "32px",
        borderBottom: "1px solid #e4e4e4",
        backgroundColor: "#ffffff",
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <a
        href="./"
        aria-label="Runway home"
        style={{
          marginRight: "auto",
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <img
          src="https://reel-ref-try-the-look.vercel.app/assets/nike-logo.svg"
          alt="Nike"
          width={68}
          height={24}
          style={{
            width: "68px",
            height: "24px",
            maxWidth: "68px",
            maxHeight: "24px",
            objectFit: "contain",
            display: "block",
          }}
        />
      </a>

      {/* Main navigation */}
      <nav
        aria-label="Main navigation"
        className="main-nav"
        style={{
          display: "flex",
          gap: "28px",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'Inter', Helvetica, Arial, sans-serif",
        }}
      >
        <a href="./" className="nav-link" style={{ padding: "12px 0", color: "#151413" }}>
          Home
        </a>
        <a
          href="https://nike-makknzjs.myshopify.com/pages/nike-orbit"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link desktop-only"
          style={{ padding: "12px 0", color: "#151413" }}
        >
          Nike Orbit
        </a>
        <a
          href="https://nike-makknzjs.myshopify.com/pages/scene-rail"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link desktop-only"
          style={{ padding: "12px 0", color: "#151413" }}
        >
          Hand Rail Pro
        </a>
        <a
          href="./"
          aria-current="page"
          className="nav-link"
          style={{ padding: "12px 0", color: "#151413", textDecoration: "underline", textUnderlineOffset: "4px" }}
        >
          Runway
        </a>
      </nav>

      {/* Bag button */}
      <button
        type="button"
        aria-label="Open styling bag"
        onClick={onOpenBag}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          background: "transparent",
          border: "none",
          minWidth: "44px",
          minHeight: "44px",
          cursor: "pointer",
        }}
      >
        <svg
          viewBox="0 0 24 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          style={{ width: "20px", height: "22px" }}
        >
          <path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2" />
        </svg>
        <span
          data-cart-count
          style={{
            fontSize: "10px",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 500,
            color: "#151413",
          }}
        >
          {cartCount}
        </span>
      </button>
    </header>
  );
};
