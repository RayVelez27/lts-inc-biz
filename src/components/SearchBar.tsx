"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { products, categories } from "@/lib/products";
import Link from "next/link";

interface SearchResult {
  type: "product" | "category" | "subcategory";
  id: string;
  name: string;
  image?: string;
  price?: number;
  href: string;
}

export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lts-recent-searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search products
    products.forEach((product) => {
      if (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.subcategory?.toLowerCase().includes(searchTerm) ?? false)
      ) {
        matches.push({
          type: "product",
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          href: `/products/${product.id}`,
        });
      }
    });

    // Search categories
    Object.entries(categories).forEach(([key, cat]) => {
      if (cat.name.toLowerCase().includes(searchTerm)) {
        matches.push({
          type: "category",
          id: key,
          name: cat.name,
          href: `/products?category=${key}`,
        });
      }

      // Search subcategories
      cat.subcategories.forEach((sub) => {
        if (sub.toLowerCase().includes(searchTerm)) {
          matches.push({
            type: "subcategory",
            id: `${key}-${sub}`,
            name: `${sub} in ${cat.name}`,
            href: `/products?category=${key}&subcategory=${encodeURIComponent(sub)}`,
          });
        }
      });
    });

    // Limit results
    setResults(matches.slice(0, 8));
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("lts-recent-searches", JSON.stringify(updated));

    // Navigate to search results
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery("");
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("lts-recent-searches");
  };

  const popularSearches = ["Polo shirts", "Fleece jackets", "Business gifts", "Embroidered hats"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query);
            }
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          placeholder="What can we help you find?"
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                Search Results
              </p>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                    handleSearch(query);
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-cream rounded-md transition-colors"
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{result.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                  </div>
                  {result.price && (
                    <span className="text-sm font-medium text-navy">
                      ${result.price.toFixed(2)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {/* Recent & Popular Searches (when no query) */}
          {query.length < 2 && (
            <>
              {recentSearches.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </p>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-gold hover:text-navy"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      type="button"
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-cream rounded-md transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2">
                <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Popular Searches
                </p>
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleSearch(search)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-cream rounded-md transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-gold" />
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
