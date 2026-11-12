"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { CATALOG, CatalogItem, Variant } from "../catalog";
import { LookPanel } from "./LookPanel";
import { LookPopup } from "./LookPopup";
import { MobileSizeSheet } from "./MobileSizeSheet";

interface RunwaySectionProps {
  onAddToBag: (items: { item: CatalogItem; variant: Variant }[]) => void;
  onAnnounce: (msg: string) => void;
  addedProductIds: Record<string, boolean>;
}

export const RunwaySection: React.FC<RunwaySectionProps> = ({
  onAddToBag,
  onAnnounce,
  addedProductIds,
}) => {
  const [lookIndex, setLookIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isEngaged, setIsEngaged] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [hotPin, setHotPin] = useState<number | null>(null);

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [touchedCards, setTouchedCards] = useState<Record<string, boolean>>({});
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);
  const [bundleMessage, setBundleMessage] = useState<string | null>(null);
  const [isBundleLoading, setIsBundleLoading] = useState<boolean>(false);

  const [footShifts, setFootShifts] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cursorTextRef = useRef<HTMLSpanElement | null>(null);

  const bodiesRef = useRef<(HTMLDivElement | null)[]>([]);

  const physicsRef = useRef({
    cur: -1.15,
    target: 0,
    vel: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    startTarget: 0,
    pointerId: -1,
    dragSamples: [] as { x: number; time: number }[],
    hasDragged: false,
    dragSuppressClickUntil: 0,
    stageWidth: 1000,
    stageHeight: 800,
    isMobile: false,
    cursorX: 0,
    cursorY: 0,
    targetCursorX: 0,
    targetCursorY: 0,
    cursorMode: "drag" as "drag" | "view",
    cursorVisible: false,
  });

  const lookCount = 6;
  const totalBodies = 12;

  const handleEngagement = useCallback(() => {
    setIsEngaged(true);
    setIsPlaying(false);
  }, []);

  const moveTo = useCallback(
    (nextIdx: number) => {
      physicsRef.current.target = nextIdx;
      const normalized = ((Math.round(nextIdx) % lookCount) + lookCount) % lookCount;
      setLookIndex(normalized);
      onAnnounce(`Look ${normalized + 1}: ${CATALOG.looks[normalized].name}`);
    },
    [lookCount, onAnnounce]
  );

  const handleNext = useCallback(() => {
    moveTo(physicsRef.current.target + 1);
  }, [moveTo]);

  const handlePrev = useCallback(() => {
    moveTo(physicsRef.current.target - 1);
  }, [moveTo]);

  // Foot detection
  useEffect(() => {
    const scanFeet = async () => {
      const shifts = [...footShifts];
      for (let i = 0; i < CATALOG.looks.length; i++) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = CATALOG.looks[i].model640;
          await img.decode();

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          const w = 48;
          const h = Math.round(48 / 0.5625);
          canvas.width = w;
          canvas.height = h;

          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const data = imgData.data;

          let lastRow = h - 1;
          for (let y = h - 1; y >= 0; y--) {
            let rowHasAlpha = false;
            for (let x = 0; x < w; x++) {
              if (data[(y * w + x) * 4 + 3] > 40) {
                rowHasAlpha = true;
                break;
              }
            }
            if (rowHasAlpha) {
              lastRow = y;
              break;
            }
          }

          shifts[i] = Math.max(0, Math.min(0.4, (h - 1 - lastRow) / h));
        } catch {
          // Keep 0
        }
      }
      setFootShifts(shifts);
    };

    scanFeet();
  }, []);

  // Measurement
  useEffect(() => {
    const handleResize = () => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      physicsRef.current.stageWidth = rect.width || window.innerWidth;
      physicsRef.current.stageHeight = rect.height || window.innerHeight;
      physicsRef.current.isMobile = window.innerWidth < 750;

      if (sectionRef.current) {
        if (window.innerWidth >= 1100) {
          const frameH = Math.max(380, window.innerHeight - 88);
          sectionRef.current.style.setProperty("--rw-frame-h", `${frameH}px`);
        } else if (window.innerWidth < 750) {
          const frameH = Math.round(window.innerHeight * 1.09);
          sectionRef.current.style.setProperty("--rw-frame-h", `${frameH}px`);
        } else {
          sectionRef.current.style.removeProperty("--rw-frame-h");
        }
      }

      const H = physicsRef.current.stageHeight;
      if (stageRef.current) {
        if (!physicsRef.current.isMobile) {
          const modelH = Math.max(200, Math.round((H - 34 - 18) / 1.08));
          stageRef.current.style.setProperty("--rw-model-h", `${modelH}px`);
        } else {
          const modelH = Math.max(200, Math.round(H - 24 - 18));
          stageRef.current.style.setProperty("--rw-model-h", `${modelH}px`);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const K = 95;
    const C = 19.49;
    const fs = 1.08;

    const loop = (time: number) => {
      const dt = Math.min(0.034, (time - lastTime) / 1000 || 1 / 60);
      lastTime = time;

      const p = physicsRef.current;
      const hSub = dt / 3;

      for (let s = 0; s < 3; s++) {
        const diff = p.cur - p.target;
        const acc = -K * diff - C * p.vel;
        p.vel += acc * hSub;
        p.cur += p.vel * hSub;
      }

      if (Math.abs(p.cur - p.target) <= 0.0005 && Math.abs(p.vel) <= 0.0005) {
        p.cur = p.target;
        p.vel = 0;
      }

      p.cursorX += (p.targetCursorX - p.cursorX) * 0.15;
      p.cursorY += (p.targetCursorY - p.cursorY) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${p.cursorX}px, ${p.cursorY}px, 0)`;
      }

      const W = p.stageWidth;
      const H = p.stageHeight;
      const isMobile = p.isMobile;

      if (!isMobile) {
        const cx = 0.5 * W;
        const R = 0.62 * W;
        const P = 1.65 * W;
        const floor = H - 34;
        const horizon = 0.36 * H;
        const step = (2 * Math.PI) / totalBodies;

        bodiesRef.current.forEach((el, a) => {
          if (!el) return;

          let phi = ((a - p.cur) * step) % (2 * Math.PI);
          if (phi > Math.PI) phi -= 2 * Math.PI;
          if (phi <= -Math.PI) phi += 2 * Math.PI;

          const z = R * (1 - Math.cos(phi));
          const persp = P / (P + z);
          const sl = Math.abs(phi) / step;

          const scale = persp * (1 + (fs - 1) * Math.max(0, Math.min(1, 1 - sl)));
          const x = cx + R * Math.sin(phi) * persp;
          const feet = horizon + (floor - horizon) * persp;
          const bottom = H - feet;

          const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
          let opacity = Math.max(0, Math.min(1, (Math.cos(phi) + 0.55) / 0.3));

          if (sl < 0.02) {
            opacity = 0;
          }

          const modelWidth = 320;
          if (x + (modelWidth * scale) / 2 < -4 || x - (modelWidth * scale) / 2 > W + 4) {
            opacity = 0;
          }

          const zIndex = Math.round(scale * 1000);

          el.style.transform = `translate3d(${x}px, ${-bottom}px, 0) translateX(-50%) scale(${scale})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.zIndex = `${zIndex}`;
          el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(1)}px)` : "none";
          el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
          el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
        });
      } else {
        bodiesRef.current.forEach((el, a) => {
          if (!el) return;
          const offset = a - p.cur;
          const absOffset = Math.abs(offset);

          const scale = Math.max(0.6, 1 - absOffset * 0.12);
          const x = 0.5 * W + offset * (W * 0.45);
          const bottom = 24 + absOffset * 8;
          const opacity = Math.max(0, Math.min(1, 1 - absOffset * 0.4));
          const zIndex = Math.round((10 - absOffset) * 100);

          el.style.transform = `translate3d(${x}px, ${-bottom}px, 0) translateX(-50%) scale(${scale})`;
          el.style.opacity = opacity.toFixed(3);
          el.style.zIndex = `${zIndex}`;
          el.style.filter = absOffset > 0.5 ? `blur(${Math.min(absOffset * 1.5, 4)}px)` : "none";
          el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
          el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalBodies]);

  // Autoplay
  useEffect(() => {
    if (!isPlaying || isEngaged || isPopupOpen) return;

    const timer = setInterval(() => {
      if (document.hidden) return;
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying, isEngaged, isPopupOpen, handleNext]);

  // Pointer drag
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const p = physicsRef.current;
    p.isDragging = false;
    p.startX = e.clientX;
    p.startY = e.clientY;
    p.startTarget = p.target;
    p.pointerId = e.pointerId;
    p.dragSamples = [{ x: e.clientX, time: performance.now() }];
    p.hasDragged = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    const stageRect = stageRef.current?.getBoundingClientRect();
    if (stageRect) {
      p.targetCursorX = e.clientX - stageRect.left;
      p.targetCursorY = e.clientY - stageRect.top;
      p.cursorVisible = true;
    }

    if (p.pointerId !== e.pointerId) return;

    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;

    if (!p.isDragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        p.pointerId = -1;
        return;
      }
      if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
        p.isDragging = true;
        p.hasDragged = true;
        stageRef.current?.setPointerCapture(e.pointerId);
      }
    }

    if (p.isDragging) {
      const unit = Math.max(120, 0.3 * p.stageWidth);
      p.target = p.startTarget - dx / unit;

      p.dragSamples.push({ x: e.clientX, time: performance.now() });
      if (p.dragSamples.length > 6) {
        p.dragSamples.shift();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (p.pointerId !== e.pointerId) return;

    if (p.isDragging) {
      p.dragSuppressClickUntil = performance.now() + 60;
      stageRef.current?.releasePointerCapture(e.pointerId);

      const samples = p.dragSamples;
      let vx = 0;
      if (samples.length >= 2) {
        const first = samples[0];
        const last = samples[samples.length - 1];
        const dt = last.time - first.time;
        if (dt > 0) {
          vx = (last.x - first.x) / dt;
        }
      }

      const dx = e.clientX - p.startX;
      const unit = Math.max(120, 0.3 * p.stageWidth);
      const from = Math.round(p.startTarget);

      if (p.isMobile) {
        if (Math.abs(dx) > 30 || Math.abs(vx) > 0.3) {
          moveTo(from + (dx > 0 ? -1 : 1));
        } else {
          moveTo(from);
        }
      } else {
        let dest = Math.round(p.target - (vx * 160) / unit);
        if (dest === from && Math.abs(vx) > 0.3) {
          dest = from + (vx > 0 ? -1 : 1);
        }
        dest = Math.max(from - 2, Math.min(from + 2, dest));
        moveTo(dest);
      }
    }

    p.isDragging = false;
    p.pointerId = -1;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleOpenPopup = () => {
    if (performance.now() < physicsRef.current.dragSuppressClickUntil) return;
    setIsPlaying(false);
    setIsPopupOpen(true);
  };

  const activeLook = CATALOG.looks[lookIndex];

  return (
    <section ref={sectionRef} className="rw-section-frame">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Look {lookIndex + 1}: {activeLook.name}
      </div>

      {/* Left Stage Container */}
      <div className="rw-stage-left">
        {/* Runway Heading */}
        <div className="rw-heading-box">
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "640px" }}>
            <h1 className="rw-title">Try the Look.</h1>
            <p className="rw-sub">
              Six looks, styled head to toe. Tap a pin to see the piece.
            </p>
          </div>
        </div>

        {/* Stage Interactive Carousel Canvas */}
        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Try the Look. — use arrow keys or swipe to change look"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => {
            physicsRef.current.cursorVisible = true;
          }}
          onMouseLeave={() => {
            physicsRef.current.cursorVisible = false;
          }}
          className="rw-stage-viewport"
        >
          {/* Layer 1: Model Actors (12 bodies) */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {Array.from({ length: totalBodies }).map((_, a) => {
              const lookIdx = a % lookCount;
              const lookItem = CATALOG.looks[lookIdx];
              const isClone = a >= lookCount;
              const foot = footShifts[lookIdx];

              return (
                <div
                  key={a}
                  ref={(el) => {
                    bodiesRef.current[a] = el;
                  }}
                  data-rw-clone={isClone ? "true" : undefined}
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    willChange: "transform, opacity",
                    opacity: 0,
                    pointerEvents: "auto",
                    transformOrigin: "50% 100%",
                  }}
                >
                  {/* Shadow */}
                  <div
                    style={{
                      position: "absolute",
                      left: "58%",
                      bottom: 0,
                      width: "150%",
                      height: "9%",
                      minHeight: "14px",
                      maxHeight: "46px",
                      transform: "translate(-50%, 50%)",
                      filter: "blur(2px)",
                      pointerEvents: "none",
                      borderRadius: "50%",
                      background: "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)",
                    }}
                  />

                  {/* Figure 9:16 */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "0.5625",
                      height: "var(--rw-model-h, 540px)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        transform: `translateY(${foot * 100}%)`,
                      }}
                    >
                      <img
                        src={lookItem.model640}
                        srcSet={`${lookItem.model640} 640w, ${lookItem.model1080} 1080w`}
                        sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px"
                        alt={lookItem.name}
                        loading={isClone ? "lazy" : "eager"}
                        decoding="async"
                        width="1100"
                        height="1956"
                        draggable={false}
                        data-model-image
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "50% 100%",
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      aria-label={`Look ${lookIdx + 1}: ${lookItem.name}`}
                      onClick={() => {
                        if (lookIdx === lookIndex) {
                          handleOpenPopup();
                        } else {
                          moveTo(physicsRef.current.target + (a - (physicsRef.current.cur % 12)));
                        }
                      }}
                      onMouseEnter={() => {
                        physicsRef.current.cursorMode = "view";
                      }}
                      onMouseLeave={() => {
                        physicsRef.current.cursorMode = "drag";
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        background: "transparent",
                        border: 0,
                        borderRadius: "24px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layer 2: Hero Model (Front Active Model with Product Pins) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1500,
              paddingBottom: "34px",
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "0.5625",
                pointerEvents: "auto",
                height: "var(--rw-model-h, 540px)",
                transform: "scale(1.08)",
                transformOrigin: "50% 100%",
              }}
            >
              {/* Shadow */}
              <div
                style={{
                  position: "absolute",
                  left: "58%",
                  bottom: 0,
                  width: "150%",
                  height: "9%",
                  minHeight: "14px",
                  maxHeight: "46px",
                  transform: "translate(-50%, 50%)",
                  filter: "blur(2px)",
                  pointerEvents: "none",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 70%)",
                }}
              />

              {/* Front Hero Image */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateY(${footShifts[lookIndex] * 100}%)`,
                }}
              >
                <img
                  src={activeLook.model640}
                  srcSet={`${activeLook.model640} 640w, ${activeLook.model1080} 1080w`}
                  sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px"
                  alt={activeLook.name}
                  loading="eager"
                  decoding="async"
                  width="1100"
                  height="1956"
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "50% 100%",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {/* Hero Hit Target */}
              <button
                type="button"
                aria-label={`View look: ${activeLook.name}`}
                onClick={handleOpenPopup}
                onMouseEnter={() => {
                  physicsRef.current.cursorMode = "view";
                }}
                onMouseLeave={() => {
                  physicsRef.current.cursorMode = "drag";
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 1,
                  background: "transparent",
                  border: 0,
                  borderRadius: "24px",
                  cursor: "pointer",
                }}
              />

              {/* Pins on Active Hero */}
              {activeLook.pins.map((pin) => {
                const isHot = hotPin === pin.pinNumber;

                return (
                  <div
                    key={pin.pinNumber}
                    style={{
                      position: "absolute",
                      zIndex: 20,
                      transform: "translate(-50%, -50%)",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                    }}
                  >
                    <button
                      type="button"
                      data-tip={pin.productName}
                      aria-label={`${pin.pinNumber}: ${pin.productName}`}
                      onClick={() => {
                        handleEngagement();
                        setHotPin(pin.pinNumber);
                        const card = document.querySelector(`[data-rw-card]`);
                        if (card) {
                          card.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      onMouseEnter={() => setHotPin(pin.pinNumber)}
                      onMouseLeave={() => setHotPin(null)}
                      style={{
                        position: "relative",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: 600,
                        backgroundColor: isHot ? "#0e0e0e" : "#fff",
                        color: isHot ? "#fff" : "#151413",
                        boxShadow: isHot
                          ? "0 0 0 6px rgba(14,14,14,0.22), 0 8px 20px -6px rgba(0,0,0,0.45)"
                          : "0 2px 8px rgba(0,0,0,0.15)",
                        transform: isHot ? "scale(1.25)" : "scale(1)",
                        cursor: "pointer",
                        border: 0,
                      }}
                    >
                      <span>{pin.pinNumber}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Layer 3: Light Sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1550,
              mixBlendMode: "soft-light",
              pointerEvents: "none",
              opacity: 0.4,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            }}
          />

          {/* Layer 4: Custom Drag / View Cursor */}
          <div
            ref={cursorRef}
            className="hidden md:block"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
              zIndex: 1600,
              willChange: "transform",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#151413",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.05em",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <span ref={cursorTextRef} style={{ textTransform: "uppercase" }}>
                {physicsRef.current.cursorMode === "view" ? "View" : "Drag"}
              </span>
            </div>
          </div>

          {/* Layer 5: Mobile Walk / Progress Line */}
          <div
            className="md:hidden"
            style={{
              position: "absolute",
              left: "50%",
              bottom: "8px",
              zIndex: 1600,
              width: "min(140px, 38%)",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
          >
            <div style={{ height: "2px", background: "rgba(21,20,19,0.14)", position: "relative", overflow: "hidden", borderRadius: "999px" }}>
              <div
                style={{
                  height: "100%",
                  background: "#151413",
                  transition: "transform 1.1s var(--rw-ease)",
                  transformOrigin: "left",
                  transform: `scaleX(${(lookIndex + 1) / 6})`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Runway Controls (01 - 06 Progress Ticks & Autoplay toggle) */}
        <div
          className="hidden md:flex"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 56px",
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
            zIndex: 10,
          }}
        >
          {/* 01-06 Progress Ticks */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 0%", maxWidth: "540px" }}>
            {CATALOG.looks.map((item, idx) => {
              const isActive = idx === lookIndex;
              const isPast = idx < lookIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Look ${idx + 1}: ${item.name}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => {
                    handleEngagement();
                    moveTo(idx);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    flex: "1 1 0%",
                    textAlign: "left",
                    background: "transparent",
                    border: 0,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "10px", fontVariantNumeric: "tabular-nums", fontWeight: 500, color: isActive ? "#151413" : "#66625c" }}>
                    <span>0{idx + 1}</span>
                    <span style={{ fontSize: "9px", color: "#999", marginLeft: "4px" }}>{item.name}</span>
                  </div>
                  <div style={{ height: "2px", background: "rgba(21,20,19,0.14)", width: "100%", position: "relative", overflow: "hidden", borderRadius: "999px" }}>
                    <div
                      style={{
                        height: "100%",
                        background: "#151413",
                        transformOrigin: "left",
                        transform: isActive ? "scaleX(1)" : isPast ? "scaleX(1)" : "scaleX(0)",
                        opacity: isPast ? 0.35 : 1,
                        transition: "transform 0.4s",
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Autoplay & Arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              type="button"
              aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
              aria-pressed={isPlaying}
              onClick={() => {
                if (!isPlaying) {
                  setIsEngaged(false);
                  setIsPlaying(true);
                } else {
                  setIsPlaying(false);
                }
              }}
              style={{
                fontSize: "11px",
                color: "#66625c",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: 500,
                background: "transparent",
                border: 0,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <button
                type="button"
                aria-label="Previous look"
                onClick={() => {
                  handleEngagement();
                  handlePrev();
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #c8c8c8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#151413",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next look"
                onClick={() => {
                  handleEngagement();
                  handleNext();
                }}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #c8c8c8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#151413",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Product Panel */}
      <LookPanel
        lookIndex={lookIndex}
        hotPin={hotPin}
        onHotChange={setHotPin}
        onEngagement={handleEngagement}
        onAddToBag={onAddToBag}
        selectedSizes={selectedSizes}
        onSelectSize={(productId, size) => {
          setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
          setTouchedCards((prev) => ({ ...prev, [productId]: true }));
        }}
        touchedCards={touchedCards}
        onOpenMobileSheet={(item) => setSheetItem(item)}
        activePickerId={activePickerId}
        setActivePickerId={setActivePickerId}
        bundleMessage={bundleMessage}
        setBundleMessage={setBundleMessage}
        isBundleLoading={isBundleLoading}
        setIsBundleLoading={setIsBundleLoading}
        addedProductIds={addedProductIds}
      />

      {/* Presentation View Popup */}
      <LookPopup
        isOpen={isPopupOpen}
        lookIndex={lookIndex}
        onClose={() => setIsPopupOpen(false)}
        hotPin={hotPin}
        onHotChange={setHotPin}
        onPinClick={(pinNum) => {
          setHotPin(pinNum);
          setIsPopupOpen(false);
          const card = document.querySelector(`[data-rw-card]`);
          if (card) {
            card.scrollIntoView({ behavior: "smooth" });
          }
        }}
        footShift={footShifts[lookIndex]}
      />

      {/* Mobile Size Selection Bottom Sheet */}
      <MobileSizeSheet
        item={sheetItem}
        onClose={() => setSheetItem(null)}
        onConfirm={(size) => {
          if (sheetItem) {
            setSelectedSizes((prev) => ({ ...prev, [sheetItem.id]: size }));
            setTouchedCards((prev) => ({ ...prev, [sheetItem.id]: true }));
            setSheetItem(null);
          }
        }}
        currentSize={sheetItem ? selectedSizes[sheetItem.id] : undefined}
      />
    </section>
  );
};
