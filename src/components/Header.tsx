"use client";

import { useState } from "react";
import {
  ChevronDown,
  Search,
  ShoppingBag,
  Phone,
  Menu,
  X,
  User,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { categories } from "@/lib/products";
import { SearchBar } from "./SearchBar";
import { LanguageSelector } from "@/lib/i18n";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { totalItems: wishlistCount } = useWishlist();

  const navItems = [
    { name: "CLOTHING", href: "/products?category=clothing", key: "clothing" },
    { name: "OUTERWEAR", href: "/products?category=outerwear", key: "outerwear" },
    { name: "FLEECE SHOP", href: "/products?category=fleece", key: "fleece" },
    { name: "BAGS & TOTES", href: "/products?category=bags", key: "bags" },
    { name: "BUSINESS GIFTS", href: "/products?category=gifts", key: "gifts" },
    { name: "NEW ARRIVALS", href: "/products?new=true", key: null },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top utility bar */}
      <div className="bg-navy text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-end md:justify-between">
          {/* Left cluster — hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              className="flex items-center hover:text-gold transition-colors"
            >
              Customer Service <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            <a href="tel:207-774-1104" className="flex items-center hover:text-gold transition-colors">
              <Phone className="w-4 h-4 mr-1" /> 207-774-1104
            </a>
            <a href="https://www.ltsincmaine.com" className="hover:text-gold transition-colors">
              ltsincmaine.com
            </a>
          </div>
          {/* Promo — desktop only */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gold font-medium">
              Save up to 20% with Volume Discounts
            </span>
            <Link href="/volume-discounts" className="underline hover:text-gold transition-colors">
              See Details
            </Link>
          </div>
          {/* Right cluster — mobile shows only Contact Us + Sign In */}
          <div className="flex items-center space-x-4">
            <LanguageSelector className="hidden md:block text-white border-white/30 hover:border-white" />
            <Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link>
            <Link href="/account" className="hover:text-gold transition-colors flex items-center gap-1">
              <User className="w-4 h-4" />
              {user ? user.firstName : "Sign In"}
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://cdn.prod.website-files.com/692d1b3d938ed8796599c4e3/692e2170098b3af9c021d3cf_Untitled%20design%20-%202025-12-01T151403.226-p-1080.png"
              alt="LT's Inc"
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-navy tracking-wide hidden sm:block">Your Logo - Our Maine Craft</span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full flex">
              <SearchBar className="flex-1" />
              <button
                type="button"
                className="px-4 bg-navy text-white rounded-r-md hover:bg-navy-dark transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button type="button" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/wishlist" className="relative hidden sm:block hover:text-gold transition-colors">
              <Heart className="w-6 h-6 text-navy" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link href="/cart" className="flex items-center space-x-1 hover:text-gold transition-colors">
              <span className="hidden sm:block text-gray-600">Shopping Bag</span>
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-navy" />
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation with Dropdowns */}
      <nav className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="hidden md:flex items-center justify-center space-x-8 py-3">
            {navItems.map((item) => (
              <li
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.key)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gold transition-colors py-2"
                >
                  {item.name}
                  {item.key && <ChevronDown className="w-4 h-4 ml-1" />}
                </Link>

                {/* Dropdown Menu */}
                {item.key && activeDropdown === item.key && categories[item.key as keyof typeof categories] && (
                  <div className="absolute top-full left-0 w-56 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <Link
                        href={item.href}
                        className="text-sm font-semibold text-navy hover:text-gold"
                      >
                        Shop All {categories[item.key as keyof typeof categories].name}
                      </Link>
                    </div>
                    {categories[item.key as keyof typeof categories].subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/products?category=${item.key}&subcategory=${encodeURIComponent(sub)}`}
                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-cream hover:text-navy transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-gold font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.key && categories[item.key as keyof typeof categories] && (
                  <ul className="pl-4 space-y-1">
                    {categories[item.key as keyof typeof categories].subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/products?category=${item.key}&subcategory=${encodeURIComponent(sub)}`}
                          className="block py-1 text-sm text-gray-500 hover:text-gold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <Link href="/contact" className="block py-2 text-navy font-medium" onClick={() => setIsMenuOpen(false)}>
              Contact Us
            </Link>
            <Link href="/volume-discounts" className="block py-2 text-navy font-medium" onClick={() => setIsMenuOpen(false)}>
              Volume Discounts
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
