"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, ArrowRight, Clock, TrendingUp, Sparkles, Tag } from "lucide-react";
import { products, categories } from "@/lib/products";
import { resolveColorHex } from "@/lib/color-map";

// ── types ───────────────────────────────────────────────────────────────

interface SearchResult {
  kind: "product" | "category" | "brand";
  id: string;
  name: string;
  href: string;
  image?: string;
  price?: number;
  badge?: string;
  colorCount?: number;
  score: number;
  /** Ranges of [start, length] to highlight in the name. */
  highlights: [number, number][];
}

// ── scoring ─────────────────────────────────────────────────────────────

function scoreProduct(
  p: (typeof products)[number],
  lower: string,
): { score: number; highlights: [number, number][] } {
  let score = 0;
  const highlights: [number, number][] = [];
  const nameLower = p.name.toLowerCase();
  const codeLower = (p.code ?? "").toLowerCase();
  const badgeLower = (p.badge ?? "").toLowerCase();
  const descLower = p.description.toLowerCase();
  const catLower = p.category.toLowerCase();

  // Exact name match
  if (nameLower === lower) {
    score += 200;
  }
  // Name starts with
  if (nameLower.startsWith(lower)) {
    score += 100;
    highlights.push([0, lower.length]);
  } else {
    // Name contains
    const idx = nameLower.indexOf(lower);
    if (idx !== -1) {
      score += 60;
      highlights.push([idx, lower.length]);
    }
  }
  // Product code match
  if (codeLower === lower) {
    score += 90;
  } else if (codeLower.includes(lower)) {
    score += 50;
  }
  // Brand / badge match
  if (badgeLower.includes(lower)) {
    score += 45;
  }
  // Category match
  if (catLower.includes(lower)) {
    score += 35;
  }
  // Description match (weaker)
  if (descLower.includes(lower)) {
    score += 15;
  }

  return { score, highlights };
}

// ── recent searches persistence ─────────────────────────────────────────

const RECENT_KEY = "lts-recent-searches";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(query: string) {
  const recent = [query, ...loadRecent().filter((s) => s !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  return recent;
}

function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
}

// ── suggested searches ──────────────────────────────────────────────────

const POPULAR = [
  { label: "Carhartt jackets", query: "Carhartt" },
  { label: "Nike polos", query: "Nike polo" },
  { label: "North Face fleece", query: "North Face" },
  { label: "Safety hi-vis", query: "safety" },
  { label: "Hoodies", query: "hoodie" },
  { label: "Columbia rain gear", query: "Columbia" },
];

// ── component ───────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecent());
      setQuery("");
      setActiveIdx(-1);
      // Autofocus after the animation frame
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── search ──────────────────────────────────���───────────────────────
  const results: SearchResult[] = useMemo(() => {
    const lower = query.toLowerCase().trim();
    if (lower.length < 2) return [];

    const items: SearchResult[] = [];

    // Products
    for (const p of products) {
      const { score, highlights } = scoreProduct(p, lower);
      if (score > 0) {
        items.push({
          kind: "product",
          id: p.id,
          name: p.name,
          href: `/products/${p.id}`,
          image: p.image,
          price: p.price,
          badge: p.badge,
          colorCount: p.colors.length,
          score,
          highlights,
        });
      }
    }

    // Categories
    for (const [key, cat] of Object.entries(categories)) {
      if (cat.name.toLowerCase().includes(lower)) {
        items.push({
          kind: "category",
          id: `cat-${key}`,
          name: cat.name,
          href: `/products?category=${key}`,
          score: 40,
          highlights: [],
        });
      }
    }

    // Brands (dedupe from products)
    const seenBrands = new Set<string>();
    for (const p of products) {
      if (!p.badge || seenBrands.has(p.badge)) continue;
      if (p.badge.toLowerCase().includes(lower)) {
        seenBrands.add(p.badge);
        items.push({
          kind: "brand",
          id: `brand-${p.badge}`,
          name: p.badge,
          href: `/products?badge=${encodeURIComponent(p.badge)}`,
          score: 42,
          highlights: [],
        });
      }
    }

    items.sort((a, b) => b.score - a.score);
    return items.slice(0, 12);
  }, [query]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(-1);
  }, [results]);

  // ── navigation ──────────────────────────────────────────────────────
  const navigate = useCallback(
    (href: string, searchQuery?: string) => {
      if (searchQuery) setRecentSearches(saveRecent(searchQuery));
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        navigate(results[activeIdx].href, query);
      } else if (query.trim()) {
        navigate(`/products?search=${encodeURIComponent(query)}`, query);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  if (!isOpen) return null;

  const showEmpty = query.trim().length >= 2 && results.length === 0;
  const showSuggestions = query.trim().length < 2;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center pt-[12vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, categories…"
            className="flex-1 text-lg outline-none placeholder:text-gray-400"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results / suggestions */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {/* Live results */}
          {results.length > 0 && (
            <div className="py-2">
              {results.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => navigate(r.href, query)}
                  className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                    activeIdx === i ? "bg-cream" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Thumbnail */}
                  {r.kind === "product" && r.image ? (
                    <img src={r.image} alt="" className="w-12 h-12 object-cover rounded-md border border-gray-200 shrink-0" />
                  ) : r.kind === "brand" ? (
                    <div className="w-12 h-12 rounded-md bg-navy flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-gold" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-cream flex items-center justify-center shrink-0">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">
                      <HighlightedText text={r.name} highlights={r.highlights} />
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="capitalize">{r.kind}</span>
                      {r.badge && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium">{r.badge}</span>}
                      {r.colorCount ? <span>{r.colorCount} colors</span> : null}
                    </p>
                  </div>

                  {/* Price */}
                  {r.price != null && (
                    <span className="text-sm font-semibold text-navy shrink-0">
                      ${r.price.toFixed(2)}
                    </span>
                  )}

                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="py-12 text-center text-gray-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No results for &quot;{query}&quot;</p>
              <p className="text-sm mt-1">Try a different term or browse by category</p>
            </div>
          )}

          {/* Suggestions (when input is empty/short) */}
          {showSuggestions && (
            <div className="py-3">
              {/* Recent */}
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between px-5 py-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecent();
                        setRecentSearches([]);
                      }}
                      className="text-xs text-gold hover:text-navy"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setQuery(s);
                        inputRef.current?.focus();
                      }}
                      className="w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-left transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular */}
              <div>
                <p className="px-5 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Trending
                </p>
                {POPULAR.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => {
                      setQuery(s.query);
                      inputRef.current?.focus();
                    }}
                    className="w-full flex items-center gap-3 px-5 py-2 hover:bg-gray-50 text-left transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">↑</kbd>
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">↵</kbd>
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">esc</kbd>
              close
            </span>
          </div>
          <span>{products.length} products</span>
        </div>
      </div>
    </div>
  );
}

// ── highlight helper ────────────────────────────────────────────────────

function HighlightedText({
  text,
  highlights,
}: {
  text: string;
  highlights: [number, number][];
}) {
  if (!highlights.length) return <>{text}</>;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const [start, len] of highlights) {
    if (start > cursor) parts.push(text.slice(cursor, start));
    parts.push(
      <mark key={start} className="bg-gold/30 text-navy rounded-sm px-0.5">
        {text.slice(start, start + len)}
      </mark>,
    );
    cursor = start + len;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}
