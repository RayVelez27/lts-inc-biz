"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCompare } from "@/lib/compare-context";
import { useCart } from "@/lib/cart-context";
import { getProductRating } from "@/lib/reviews";
import {
  X,
  ShoppingBag,
  Plus,
  Star,
  Check,
  Minus,
  ArrowRight,
  GitCompare,
} from "lucide-react";
import { useState } from "react";

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompare();
  const { addItem: addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart({
      id: `${product.id}-${product.sizes[0]}-${product.colors[0]}`,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
      color: product.colors[0],
      quantity: 1,
      category: product.category,
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const compareAttributes = [
    { key: "price", label: "Price" },
    { key: "category", label: "Category" },
    { key: "subcategory", label: "Type" },
    { key: "colors", label: "Available Colors" },
    { key: "sizes", label: "Available Sizes" },
    { key: "rating", label: "Customer Rating" },
    { key: "featured", label: "Featured" },
    { key: "new", label: "New Arrival" },
  ];

  const getValue = (product: typeof items[0], key: string) => {
    switch (key) {
      case "price":
        return `$${product.price.toFixed(2)}`;
      case "colors":
        return product.colors.length;
      case "sizes":
        return product.sizes.join(", ");
      case "rating":
        const rating = getProductRating(product.id);
        return rating.count > 0 ? `${rating.average.toFixed(1)} (${rating.count})` : "No reviews";
      case "featured":
        return product.featured ? "Yes" : "No";
      case "new":
        return product.new ? "Yes" : "No";
      case "category":
        return product.category;
      case "subcategory":
        return product.subcategory;
      default:
        return "—";
    }
  };

  const getBestValue = (key: string): string | null => {
    if (items.length < 2) return null;

    switch (key) {
      case "price":
        const minPrice = Math.min(...items.map((p) => p.price));
        return items.find((p) => p.price === minPrice)?.id || null;
      case "colors":
        const maxColors = Math.max(...items.map((p) => p.colors.length));
        return items.find((p) => p.colors.length === maxColors)?.id || null;
      case "rating":
        const ratings = items.map((p) => getProductRating(p.id));
        const maxRating = Math.max(...ratings.map((r) => r.average));
        const bestIndex = ratings.findIndex((r) => r.average === maxRating);
        return bestIndex >= 0 ? items[bestIndex].id : null;
      default:
        return null;
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <GitCompare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-navy mb-4">No Products to Compare</h1>
            <p className="text-gray-600 mb-6">
              Add products to compare by clicking the compare icon on product cards.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
            >
              Browse Products <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Compare Products</h1>
            <p className="text-gray-600">{items.length} products selected</p>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
            <Link
              href="/products"
              className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add More
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Product Images & Names */}
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-48 p-4 text-left font-medium text-gray-500 bg-gray-50">
                    Product
                  </th>
                  {items.map((product) => (
                    <th
                      key={product.id}
                      className="p-4 text-center min-w-[200px]"
                    >
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => removeItem(product.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link href={`/products/${product.id}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                          />
                        </Link>
                        <Link
                          href={`/products/${product.id}`}
                          className="font-semibold text-navy hover:text-gold transition-colors block"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">{product.subcategory}</p>
                      </div>
                    </th>
                  ))}
                  {/* Empty columns for remaining slots */}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 min-w-[200px]">
                      <Link
                        href="/products"
                        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex flex-col items-center justify-center text-gray-400 hover:border-gold hover:text-gold transition-colors"
                      >
                        <Plus className="w-8 h-8 mb-2" />
                        <span className="text-sm">Add Product</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Attributes */}
              <tbody>
                {compareAttributes.map((attr) => {
                  const bestId = getBestValue(attr.key);

                  return (
                    <tr key={attr.key} className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700 bg-gray-50">
                        {attr.label}
                      </td>
                      {items.map((product) => {
                        const value = getValue(product, attr.key);
                        const isBest = bestId === product.id;

                        return (
                          <td
                            key={product.id}
                            className={`p-4 text-center ${
                              isBest ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {attr.key === "rating" && (
                                <Star className="w-4 h-4 text-gold fill-current" />
                              )}
                              {attr.key === "featured" && value === "Yes" && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                              {attr.key === "new" && value === "Yes" && (
                                <Check className="w-4 h-4 text-gold" />
                              )}
                              {attr.key === "colors" ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-medium">{value} colors</span>
                                  <div className="flex gap-1 mt-1">
                                    {product.colors.slice(0, 5).map((color) => (
                                      <span
                                        key={color}
                                        className="w-4 h-4 rounded-full border border-gray-200"
                                        style={{
                                          backgroundColor:
                                            color.toLowerCase() === "white" ? "#fff" :
                                            color.toLowerCase() === "navy" ? "#1a3a5c" :
                                            color.toLowerCase() === "black" ? "#000" :
                                            color.toLowerCase() === "gray" ? "#6b7280" :
                                            "#c5a572",
                                        }}
                                        title={color}
                                      />
                                    ))}
                                    {product.colors.length > 5 && (
                                      <span className="text-xs text-gray-500">+{product.colors.length - 5}</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className={isBest ? "font-semibold text-green-700" : ""}>
                                  {value}
                                </span>
                              )}
                              {isBest && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  Best
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      {/* Empty cells */}
                      {Array.from({ length: 4 - items.length }).map((_, i) => (
                        <td key={`empty-${i}`} className="p-4 text-center text-gray-300">
                          —
                        </td>
                      ))}
                    </tr>
                  );
                })}

                {/* Description Row */}
                <tr className="border-b border-gray-100">
                  <td className="p-4 font-medium text-gray-700 bg-gray-50">
                    Description
                  </td>
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center text-sm text-gray-600">
                      {product.description}
                    </td>
                  ))}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4" />
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-4 bg-gray-50" />
                  {items.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`w-full py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                            addedToCart === product.id
                              ? "bg-green-600 text-white"
                              : "bg-gold text-navy hover:bg-gold-light"
                          }`}
                        >
                          {addedToCart === product.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              Added!
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                        <Link
                          href={`/products/${product.id}`}
                          className="block w-full py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 4 - items.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Compare up to 4 products side by side. Green highlighting shows the best value in each category.</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
