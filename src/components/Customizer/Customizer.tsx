"use client";

import { useCallback, useMemo, useState } from "react";
import { X, Upload, Loader2, Check, AlertCircle, Palette, Type, MapPin, Package, Shirt } from "lucide-react";
import { useCart, type CustomizationInfo, type CustomizationPlacement } from "@/lib/cart-context";
import { volumeDiscounts, type Product } from "@/lib/products";
import { uploadDesign } from "@/lib/supabase/upload";
import CanvasPreview, { getDefaultPosition } from "./CanvasPreview";
import SizeMatrix, { type Matrix } from "./SizeMatrix";

const EMBROIDERY_FEE_PER_ITEM = 8;

const PLACEMENTS: { id: CustomizationPlacement; label: string; hint: string }[] = [
  { id: "front-left-chest", label: "Front Left Chest", hint: "Classic polo/uniform logo spot" },
  { id: "front-center", label: "Front Center", hint: "Larger mark, prominent" },
  { id: "full-back", label: "Full Back", hint: "Team name or roster back" },
  { id: "left-sleeve", label: "Left Sleeve", hint: "Secondary accent" },
  { id: "right-sleeve", label: "Right Sleeve", hint: "Secondary accent" },
];

const FONTS = [
  { label: "Sans", family: "Inter, sans-serif" },
  { label: "Serif", family: "Georgia, serif" },
  { label: "Slab", family: "'Rockwell', 'Courier New', serif" },
  { label: "Script", family: "'Brush Script MT', cursive" },
];

// Common embroidery thread colors — hex approximations.
const THREAD_COLORS = [
  "#1a3a5c", // Navy
  "#000000", // Black
  "#ffffff", // White
  "#c5a572", // Gold
  "#b91c1c", // Red
  "#166534", // Forest
  "#6b7280", // Gray
  "#7c3aed", // Purple
  "#d97706", // Orange
  "#0891b2", // Teal
  "#d1d5db", // Silver
  "#ec4899", // Pink
];

function volumeDiscountRate(qty: number): number {
  for (let i = volumeDiscounts.length - 1; i >= 0; i--) {
    const tier = volumeDiscounts[i];
    if (qty >= tier.minQty) return tier.discount / 100;
  }
  return 0;
}

interface Props {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function Customizer({ product, isOpen, onClose }: Props) {
  const { addItem } = useCart();

  // ── design state ────────────────────────────────────────────────────────
  const [designImageUrl, setDesignImageUrl] = useState<string | null>(null);
  const [designStoragePath, setDesignStoragePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [placement, setPlacement] = useState<CustomizationPlacement>("front-left-chest");
  const [position, setPosition] = useState(getDefaultPosition("front-left-chest"));
  const [designWidthInches, setDesignWidthInches] = useState(3.5);

  const [textContent, setTextContent] = useState("");
  const [textFont, setTextFont] = useState(FONTS[0].family);
  const [textColor, setTextColor] = useState("#ffffff");

  const [threadColor, setThreadColor] = useState(THREAD_COLORS[0]);
  const [notes, setNotes] = useState("");

  const [matrix, setMatrix] = useState<Matrix>({});
  const [submitState, setSubmitState] = useState<"idle" | "adding" | "done">("idle");

  // ── derived ─────────────────────────────────────────────────────────────
  const totalQty = useMemo(
    () =>
      Object.values(matrix).reduce(
        (s, row) => s + Object.values(row).reduce((r, v) => r + (v || 0), 0),
        0,
      ),
    [matrix],
  );

  const hasCustomization = Boolean(designImageUrl || textContent.trim());
  const perItemEmbroidery = hasCustomization ? EMBROIDERY_FEE_PER_ITEM : 0;
  const subtotal = product.price * totalQty;
  const embroidery = perItemEmbroidery * totalQty;
  const preDiscount = subtotal + embroidery;
  const discountRate = volumeDiscountRate(totalQty);
  const discount = preDiscount * discountRate;
  const total = preDiscount - discount;

  const canSubmit = totalQty > 0 && !uploading && submitState !== "adding";

  // ── actions ─────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPG, SVG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Max file size is 5 MB.");
      return;
    }

    // Preview immediately as a data URL while the upload runs in the background.
    const reader = new FileReader();
    reader.onload = () => setDesignImageUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const { url, path } = await uploadDesign(file);
      setDesignImageUrl(url);
      setDesignStoragePath(path);
    } catch (err) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const changePlacement = (p: CustomizationPlacement) => {
    setPlacement(p);
    setPosition(getDefaultPosition(p));
  };

  const handleAddToCart = () => {
    if (!canSubmit || !designStoragePath && !designImageUrl && !textContent) return;
    setSubmitState("adding");

    const designGroupId = `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const customizationInfo: CustomizationInfo = {
      designGroupId,
      designImageUrl: designImageUrl ?? undefined,
      designStoragePath: designStoragePath ?? undefined,
      placement,
      designWidthInches,
      designPosition: position,
      text: textContent.trim()
        ? { content: textContent.trim(), fontFamily: textFont, color: textColor }
        : undefined,
      threadColor,
      notes: notes.trim() || undefined,
      embroideryFeePerItem: perItemEmbroidery,
    };

    // Emit one cart item per color×size cell. They share the same designGroupId
    // so the cart/checkout can group them visually later.
    for (const [color, row] of Object.entries(matrix)) {
      for (const [size, qty] of Object.entries(row)) {
        if (!qty) continue;
        addItem({
          id: `${designGroupId}-${color}-${size}`,
          name: product.name,
          price: product.price + perItemEmbroidery,
          image: product.image,
          size,
          color,
          quantity: qty,
          category: product.category,
          customizationInfo,
        });
      }
    }

    setSubmitState("done");
    setTimeout(() => {
      setSubmitState("idle");
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-navy text-white">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-gold" />
            <h2 className="font-semibold text-lg">Customize: {product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — two columns on desktop */}
        <div className="flex-1 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] overflow-hidden">
          {/* Preview pane */}
          <div className="p-6 bg-gray-50 overflow-y-auto">
            <CanvasPreview
              productImage={product.image}
              productName={product.name}
              designImageUrl={designImageUrl}
              designWidthInches={designWidthInches}
              position={position}
              onPositionChange={setPosition}
              text={textContent ? { content: textContent, fontFamily: textFont, color: textColor } : undefined}
            />
            {/* Size slider under the preview */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-navy mb-2">
                Design size: <span className="font-normal text-gray-600">{designWidthInches.toFixed(1)} inches wide</span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={0.25}
                value={designWidthInches}
                onChange={(e) => setDesignWidthInches(Number(e.target.value))}
                className="w-full accent-navy"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1″</span>
                <span>8″</span>
              </div>
            </div>
          </div>

          {/* Controls pane */}
          <div className="overflow-y-auto border-l border-gray-200">
            <div className="p-6 space-y-8">
              {/* 1. Upload design */}
              <Section icon={<Upload className="w-4 h-4" />} title="Upload your design">
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-navy hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                    </div>
                  ) : designImageUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <img src={designImageUrl} alt="Uploaded design" className="w-12 h-12 object-contain rounded border border-gray-200" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-navy">Design uploaded</p>
                        <p className="text-xs text-gray-500">Click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-navy font-medium">Click to upload or drop a file</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG, WebP — up to 5 MB</p>
                    </div>
                  )}
                </label>
                {uploadError && (
                  <p className="flex items-start gap-1 text-sm text-red-600 mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {uploadError}
                  </p>
                )}
              </Section>

              {/* 2. Placement */}
              <Section icon={<MapPin className="w-4 h-4" />} title="Placement">
                <div className="grid grid-cols-2 gap-2">
                  {PLACEMENTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => changePlacement(p.id)}
                      className={`text-left px-3 py-2 rounded-md border transition-colors ${
                        placement === p.id
                          ? "border-navy bg-navy text-white"
                          : "border-gray-200 hover:border-navy text-navy"
                      }`}
                    >
                      <p className="font-medium text-sm">{p.label}</p>
                      <p className={`text-xs ${placement === p.id ? "text-white/70" : "text-gray-500"}`}>{p.hint}</p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* 3. Custom text */}
              <Section icon={<Type className="w-4 h-4" />} title="Add text (optional)">
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="e.g. Est. 1984"
                  maxLength={60}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
                {textContent && (
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Font</label>
                      <select
                        value={textFont}
                        onChange={(e) => setTextFont(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {FONTS.map((f) => (
                          <option key={f.family} value={f.family} style={{ fontFamily: f.family }}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-8 rounded cursor-pointer border border-gray-300"
                      />
                    </div>
                  </div>
                )}
              </Section>

              {/* 4. Thread color */}
              <Section icon={<Palette className="w-4 h-4" />} title="Thread color">
                <div className="flex flex-wrap gap-2">
                  {THREAD_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setThreadColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        threadColor === c ? "border-navy scale-110 ring-2 ring-navy ring-offset-1" : "border-gray-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </Section>

              {/* 5. Quantity matrix */}
              <Section icon={<Package className="w-4 h-4" />} title="Size & quantity">
                {product.colors.length === 0 || product.sizes.length === 0 ? (
                  <p className="text-sm text-gray-500">This product has no size or color options configured.</p>
                ) : (
                  <SizeMatrix
                    colors={product.colors}
                    sizes={product.sizes}
                    matrix={matrix}
                    onChange={setMatrix}
                  />
                )}
              </Section>

              {/* 6. Notes */}
              <Section title="Notes for the embroiderer">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything special? Thread-color preferences, spacing, mockup requests…"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </Section>
            </div>

            {/* Price summary + submit */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
              <div className="text-sm space-y-1">
                <Row label={`Subtotal (${totalQty} item${totalQty === 1 ? "" : "s"})`} value={`$${subtotal.toFixed(2)}`} />
                {embroidery > 0 && <Row label={`Embroidery @ $${EMBROIDERY_FEE_PER_ITEM}/item`} value={`$${embroidery.toFixed(2)}`} />}
                {discount > 0 && (
                  <Row
                    label={`Volume discount (${(discountRate * 100).toFixed(0)}%)`}
                    value={`−$${discount.toFixed(2)}`}
                    valueClassName="text-green-700"
                  />
                )}
                <div className="h-px bg-gray-200 my-1" />
                <Row label="Total" value={`$${total.toFixed(2)}`} bold />
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 ${
                  submitState === "done"
                    ? "bg-green-600 text-white"
                    : canSubmit
                    ? "bg-gold text-navy hover:bg-gold-light"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {submitState === "adding" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
                ) : submitState === "done" ? (
                  <><Check className="w-4 h-4" /> Added to cart</>
                ) : totalQty === 0 ? (
                  "Add quantities to continue"
                ) : (
                  "Add custom order to cart"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── tiny local components ────────────────────────────────────────────────

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-navy uppercase tracking-wide mb-3">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  bold,
  valueClassName,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base" : ""}`}>
      <span className={bold ? "font-semibold text-navy" : "text-gray-600"}>{label}</span>
      <span className={`${bold ? "font-bold text-navy" : ""} ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
