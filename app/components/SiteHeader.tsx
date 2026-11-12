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
    <header className="site-header">
      {/* Brand */}
      <a
        href="./"
        aria-label="Runway home"
        className="brand-link"
      >
        <img
          src="https://reel-ref-try-the-look.vercel.app/assets/nike-logo.svg"
          alt="Nike"
          className="brand-logo"
        />
      </a>

      {/* Main navigation */}
      <nav
        aria-label="Main navigation"
        className="main-nav"
      >
        <a href="./" className="nav-link">
          Home
        </a>
        <a
          href="https://nike-makknzjs.myshopify.com/pages/nike-orbit"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link desktop-only"
        >
          Nike Orbit
        </a>
        <a
          href="https://nike-makknzjs.myshopify.com/pages/scene-rail"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-link desktop-only"
        >
          Hand Rail Pro
        </a>
        <a
          href="./"
          aria-current="page"
          className="nav-link"
        >
          Runway
        </a>
      </nav>

      {/* Bag button */}
      <button
        type="button"
        aria-label="Open styling bag"
        onClick={onOpenBag}
        className="bag-btn"
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
        <span data-cart-count className="cart-count">
          {cartCount}
        </span>
      </button>
    </header>
  );
};
