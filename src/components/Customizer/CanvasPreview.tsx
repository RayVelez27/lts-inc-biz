"use client";

import { useCallback, useRef, useState } from "react";
import type { CustomizationPlacement } from "@/lib/cart-context";

/**
 * Default (x, y) position in % of the container for each placement zone.
 * y is measured from the top. Values chosen to look reasonable on a typical
 * front-facing product shot.
 */
const DEFAULT_POSITION: Record<CustomizationPlacement, { xPct: number; yPct: number }> = {
  "front-left-chest": { xPct: 33, yPct: 28 },
  "front-center": { xPct: 50, yPct: 40 },
  "full-back": { xPct: 50, yPct: 40 },
  "left-sleeve": { xPct: 15, yPct: 42 },
  "right-sleeve": { xPct: 85, yPct: 42 },
};

export function getDefaultPosition(p: CustomizationPlacement) {
  return DEFAULT_POSITION[p];
}

interface Props {
  productImage: string;
  productName: string;
  designImageUrl: string | null;
  designWidthInches: number;
  position: { xPct: number; yPct: number };
  onPositionChange: (pos: { xPct: number; yPct: number }) => void;
  text?: { content: string; fontFamily: string; color: string };
}

// Rough conversion: assume the product in the image spans ~20 real inches
// across the canvas width, so 1 inch = 5% of canvas width.
const INCHES_TO_PCT = 5;

export default function CanvasPreview({
  productImage,
  productName,
  designImageUrl,
  designWidthInches,
  position,
  onPositionChange,
  text,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      onPositionChange({
        xPct: Math.max(0, Math.min(100, xPct)),
        yPct: Math.max(0, Math.min(100, yPct)),
      });
    },
    [onPositionChange],
  );

  const designWidthPct = designWidthInches * INCHES_TO_PCT;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden select-none touch-none"
      onPointerDown={(e) => {
        // Only start drag when clicking the design layer itself or empty area
        if (!designImageUrl && !text?.content) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        handlePointer(e);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img
        src={productImage}
        alt={productName}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Design overlay */}
      {designImageUrl && (
        <img
          src={designImageUrl}
          alt="Your design"
          draggable={false}
          className={`absolute pointer-events-none ${dragging ? "opacity-80" : "opacity-95"} transition-opacity`}
          style={{
            left: `${position.xPct}%`,
            top: `${position.yPct}%`,
            width: `${designWidthPct}%`,
            transform: "translate(-50%, -50%)",
            maxWidth: "70%",
            maxHeight: "70%",
          }}
        />
      )}

      {/* Text overlay */}
      {text?.content && (
        <div
          className="absolute pointer-events-none whitespace-nowrap"
          style={{
            left: `${position.xPct}%`,
            top: `${position.yPct + (designImageUrl ? 12 : 0)}%`,
            transform: "translate(-50%, -50%)",
            fontFamily: text.fontFamily,
            color: text.color,
            fontSize: `${designWidthInches * 4}px`,
            fontWeight: 600,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {text.content}
        </div>
      )}

      {/* Empty-state hint */}
      {!designImageUrl && !text?.content && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-center p-6">
          <div>
            <p className="text-lg font-semibold mb-1">Your design preview</p>
            <p className="text-sm opacity-80">Upload a logo or add text to see it on the garment.</p>
          </div>
        </div>
      )}

      {/* Placement tip */}
      {(designImageUrl || text?.content) && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
          Click or drag to reposition
        </div>
      )}
    </div>
  );
}
