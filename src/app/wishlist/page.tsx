"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { getProductById } from "@/lib/products";
import { Heart, ShoppingBag, Trash2, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const handleAddToCart = (item: typeof items[0]) => {
    const product = getProductById(item.id);
    if (product) {
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
      setAddedToCart(item.id);
      setTimeout(() => setAddedToCart(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">My Wishlist</h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
            >
              Browse Products <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <Link href={`/products/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    {item.category}
                  </p>
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-semibold text-navy hover:text-gold transition-colors mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-navy mb-2">
                    ${item.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Added on {formatDate(item.addedAt)}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      className={`flex-1 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                        addedToCart === item.id
                          ? "bg-green-600 text-white"
                          : "bg-gold text-navy hover:bg-gold-light"
                      }`}
                    >
                      {addedToCart === item.id ? (
                        <>Added!</>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 border border-gray-300 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Products */}
        {items.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy mb-6">You Might Also Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Show products not in wishlist */}
              {/* This would be dynamic in a real app */}
              <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                <Link
                  href="/products"
                  className="text-gold hover:text-navy transition-colors font-medium"
                >
                  Browse more products →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
