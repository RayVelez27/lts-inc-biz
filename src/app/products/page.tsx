"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCompare } from "@/lib/compare-context";
import { products, categories, type Product } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Filter, X, ChevronRight, Star, Heart, GitCompare } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { items: compareItems, addItem: addToCompare, removeItem: removeFromCompare, isComparing, canAdd, maxItems } = useCompare();

  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const newParam = searchParams.get("new");

  const [sortBy, setSortBy] = useState("featured");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Get all unique colors and sizes
  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => p.colors.forEach((c) => colors.add(c)));
    return Array.from(colors).sort();
  }, []);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizes.add(s)));
    return Array.from(sizes);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categoryParam) {
      result = result.filter((p) => p.category === categoryParam);
    }

    // Subcategory filter
    if (subcategoryParam) {
      result = result.filter((p) => p.subcategory === subcategoryParam);
    }

    // New arrivals filter
    if (newParam === "true") {
      result = result.filter((p) => p.new);
    }

    // Color filter
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [categoryParam, subcategoryParam, newParam, selectedColors, selectedSizes, sortBy]);

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleQuickAdd = (product: Product) => {
    setQuickAddProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  const handleAddToCart = () => {
    if (quickAddProduct && selectedSize && selectedColor) {
      addItem({
        id: `${quickAddProduct.id}-${selectedSize}-${selectedColor}`,
        name: quickAddProduct.name,
        price: quickAddProduct.price,
        image: quickAddProduct.image,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        category: quickAddProduct.category,
      });
      setQuickAddProduct(null);
    }
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  };

  const handleCompareToggle = (product: Product) => {
    if (isComparing(product.id)) {
      removeFromCompare(product.id);
    } else {
      if (!canAdd) {
        alert(`You can compare up to ${maxItems} products at a time`);
        return;
      }
      addToCompare(product);
    }
  };

  const getPageTitle = () => {
    if (newParam === "true") return "New Arrivals";
    if (subcategoryParam) return subcategoryParam;
    if (categoryParam && categories[categoryParam as keyof typeof categories]) {
      return categories[categoryParam as keyof typeof categories].name;
    }
    return "All Products";
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-cream py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/products" className="hover:text-gold">Products</Link>
            {categoryParam && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href={`/products?category=${categoryParam}`} className="hover:text-gold">
                  {categories[categoryParam as keyof typeof categories]?.name || categoryParam}
                </Link>
              </>
            )}
            {subcategoryParam && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-navy font-medium">{subcategoryParam}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600">{filteredProducts.length} products</p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button
              type="button"
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-64 flex-shrink-0`}>
            <div className="sticky top-32 space-y-6">
              {/* Categories */}
              {!categoryParam && (
                <div>
                  <h3 className="font-semibold text-navy mb-3">Categories</h3>
                  <ul className="space-y-2">
                    {Object.entries(categories).map(([key, cat]) => (
                      <li key={key}>
                        <Link
                          href={`/products?category=${key}`}
                          className="text-gray-600 hover:text-gold transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subcategories */}
              {categoryParam && categories[categoryParam as keyof typeof categories] && (
                <div>
                  <h3 className="font-semibold text-navy mb-3">Subcategories</h3>
                  <ul className="space-y-2">
                    {categories[categoryParam as keyof typeof categories].subcategories.map((sub) => (
                      <li key={sub}>
                        <Link
                          href={`/products?category=${categoryParam}&subcategory=${encodeURIComponent(sub)}`}
                          className={`transition-colors ${
                            subcategoryParam === sub ? 'text-gold font-medium' : 'text-gray-600 hover:text-gold'
                          }`}
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Color Filter */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Color</h3>
                <div className="space-y-2">
                  {allColors.slice(0, 8).map((color) => (
                    <div key={color} className="flex items-center">
                      <Checkbox
                        id={`color-${color}`}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => handleColorToggle(color)}
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className="ml-2 text-sm text-gray-600 cursor-pointer"
                      >
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="font-semibold text-navy mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1 text-sm border rounded transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-navy text-white border-navy'
                          : 'border-gray-300 hover:border-navy'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedColors.length > 0 || selectedSizes.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedSizes([]);
                  }}
                  className="text-sm text-gold hover:text-navy transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const inWishlist = isInWishlist(product.id);
                const inCompare = isComparing(product.id);

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Link href={`/products/${product.id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                      {product.new && (
                        <Badge className="absolute top-3 left-3 bg-gold text-navy">
                          New
                        </Badge>
                      )}
                      {product.featured && !product.new && (
                        <Badge className="absolute top-3 left-3 bg-navy text-white">
                          Featured
                        </Badge>
                      )}

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleWishlistToggle(product)}
                          className={`p-2 rounded-full shadow-md transition-colors ${
                            inWishlist
                              ? "bg-red-500 text-white"
                              : "bg-white text-gray-600 hover:text-red-500"
                          }`}
                          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCompareToggle(product)}
                          className={`p-2 rounded-full shadow-md transition-colors ${
                            inCompare
                              ? "bg-navy text-white"
                              : "bg-white text-gray-600 hover:text-navy"
                          }`}
                          title={inCompare ? "Remove from compare" : "Add to compare"}
                        >
                          <GitCompare className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className="absolute bottom-3 right-3 p-3 bg-navy text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {product.subcategory}
                      </p>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-semibold text-navy mb-1 group-hover:text-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-navy">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 4).map((color) => (
                            <span
                              key={color}
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{
                                backgroundColor:
                                  color.toLowerCase() === "white"
                                    ? "#fff"
                                    : color.toLowerCase() === "navy"
                                    ? "#1a3a5c"
                                    : color.toLowerCase() === "black"
                                    ? "#000"
                                    : color.toLowerCase() === "gray"
                                    ? "#6b7280"
                                    : color.toLowerCase() === "red"
                                    ? "#dc2626"
                                    : color.toLowerCase() === "forest green"
                                    ? "#166534"
                                    : "#c5a572",
                              }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-gray-500">
                              +{product.colors.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedSizes([]);
                  }}
                  className="mt-4 text-gold hover:text-navy transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Bar */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-navy text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-6">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5" />
            <span className="font-medium">{compareItems.length} of {maxItems} products selected</span>
          </div>
          <div className="flex gap-2">
            {compareItems.map((item) => (
              <div key={item.id} className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFromCompare(item.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <Link
            href="/compare"
            className="px-4 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
          >
            Compare Now
          </Link>
        </div>
      )}

      {/* Quick Add Modal */}
      {quickAddProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-navy">{quickAddProduct.name}</h3>
              <button type="button" onClick={() => setQuickAddProduct(null)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex gap-4 mb-4">
              <img
                src={quickAddProduct.image}
                alt={quickAddProduct.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div>
                <p className="text-2xl font-bold text-navy">${quickAddProduct.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{quickAddProduct.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {quickAddProduct.sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded transition-colors ${
                        selectedSize === size
                          ? 'bg-navy text-white border-navy'
                          : 'border-gray-300 hover:border-navy'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {quickAddProduct.colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded transition-colors ${
                        selectedColor === color
                          ? 'bg-navy text-white border-navy'
                          : 'border-gray-300 hover:border-navy'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
