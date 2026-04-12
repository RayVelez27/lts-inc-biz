"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { volumeDiscounts } from "@/lib/products";
import { validatePromoCode, type PromoValidationResult } from "@/lib/promotions";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, Check } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice, getVolumeDiscount } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<PromoValidationResult | null>(null);
  const [promoError, setPromoError] = useState("");

  const discount = getVolumeDiscount();
  const discountAmount = totalPrice * discount;
  const promoDiscount = promoResult?.valid ? promoResult.discount || 0 : 0;
  const shippingCost = totalPrice >= 150 || promoResult?.freeShipping ? 0 : 12.99;
  const finalTotal = totalPrice - discountAmount - promoDiscount + shippingCost;

  const handleApplyPromo = () => {
    setPromoError("");
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    const cartItems = items.map((item) => ({
      category: item.category,
      id: item.id,
      quantity: item.quantity,
    }));

    const result = validatePromoCode(promoCode, totalPrice - discountAmount, cartItems, shippingCost);

    if (result.valid) {
      setPromoResult(result);
    } else {
      setPromoError(result.error || "Invalid promo code");
      setPromoResult(null);
    }
  };

  const removePromo = () => {
    setPromoCode("");
    setPromoResult(null);
    setPromoError("");
  };

  const getNextDiscountTier = () => {
    for (const tier of volumeDiscounts) {
      if (totalItems < tier.minQty) {
        return {
          itemsNeeded: tier.minQty - totalItems,
          discount: tier.label,
        };
      }
    }
    return null;
  };

  const nextTier = getNextDiscountTier();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy mb-2">Your bag is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any items to your bag yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
            >
              Continue Shopping <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Volume Discount Banner */}
              {nextTier && (
                <div className="bg-gold/10 border border-gold rounded-lg p-4 flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gold" />
                  <p className="text-sm">
                    Add <strong>{nextTier.itemsNeeded} more items</strong> to unlock{" "}
                    <strong>{nextTier.discount}</strong>!
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-navy">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-center min-w-[50px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-navy">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clearCart}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear all items
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
                <h2 className="text-xl font-semibold text-navy mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount ({(discount * 100).toFixed(0)}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {promoResult?.valid && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        Promo: {promoResult.promoCode?.code}
                        <button type="button" onClick={removePromo} className="text-red-400 hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                      <span>
                        {promoResult.freeShipping ? "Free Shipping" : `-${promoDiscount.toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shippingCost === 0 ? "text-green-600" : "text-gray-500"}>
                      {shippingCost === 0 ? "FREE" : `${shippingCost.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Logo Setup</span>
                    <span className="text-gray-500">Included</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-navy">
                      <span>Estimated Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  {promoResult?.valid ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <Check className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-700">{promoResult.promoCode?.code}</p>
                        <p className="text-sm text-green-600">{promoResult.promoCode?.description}</p>
                      </div>
                      <button type="button" onClick={removePromo} className="text-green-600 hover:text-green-800">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="mt-2 text-sm text-red-600">{promoError}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Try: WELCOME10, SAVE20, FREESHIP
                      </p>
                    </div>
                  )}
                </div>

                {/* Volume Discount Progress */}
                <div className="mt-6 p-4 bg-cream rounded-lg">
                  <h3 className="text-sm font-semibold text-navy mb-2">Volume Discounts</h3>
                  <div className="space-y-2">
                    {volumeDiscounts.map((tier) => (
                      <div
                        key={tier.minQty}
                        className={`flex justify-between text-sm ${
                          totalItems >= tier.minQty ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        <span>{tier.minQty}+ items</span>
                        <span className="font-medium">{tier.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full mt-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors text-center"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="block text-center mt-4 text-sm text-gray-600 hover:text-gold transition-colors"
                >
                  Continue Shopping
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
