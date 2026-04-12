"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { volumeDiscounts } from "@/lib/products";
import { Calculator, Check, ArrowRight, Tag, Percent, Users, DollarSign } from "lucide-react";

export default function VolumeDiscountsPage() {
  const [quantity, setQuantity] = useState(50);
  const [pricePerItem, setPricePerItem] = useState(45);

  const getDiscount = (qty: number) => {
    for (const tier of [...volumeDiscounts].reverse()) {
      if (qty >= tier.minQty) {
        return tier.discount;
      }
    }
    return 0;
  };

  const discount = getDiscount(quantity);
  const subtotal = quantity * pricePerItem;
  const savings = subtotal * (discount / 100);
  const total = subtotal - savings;

  const getCurrentTier = (qty: number) => {
    for (const tier of [...volumeDiscounts].reverse()) {
      if (qty >= tier.minQty) {
        return tier;
      }
    }
    return null;
  };

  const getNextTier = (qty: number) => {
    for (const tier of volumeDiscounts) {
      if (qty < tier.minQty) {
        return tier;
      }
    }
    return null;
  };

  const currentTier = getCurrentTier(quantity);
  const nextTier = getNextTier(quantity);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Volume Discounts
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The more you order, the more you save. Calculate your savings and unlock exclusive volume pricing on all LT's Business products.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Discount Tiers */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {volumeDiscounts.map((tier, index) => (
            <div
              key={tier.minQty}
              className={`p-6 rounded-lg border-2 transition-all ${
                currentTier?.minQty === tier.minQty
                  ? "bg-gold/10 border-gold"
                  : "bg-white border-gray-200 hover:border-gold/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Tier {index + 1}</span>
                {currentTier?.minQty === tier.minQty && (
                  <span className="text-xs bg-gold text-navy px-2 py-1 rounded font-medium">
                    Current
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-navy mb-1">{tier.discount}%</div>
              <div className="text-sm text-gray-600">
                {tier.maxQty === Number.POSITIVE_INFINITY
                  ? `${tier.minQty}+ items`
                  : `${tier.minQty}-${tier.maxQty} items`}
              </div>
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gold/10 rounded-lg">
                <Calculator className="w-6 h-6 text-gold" />
              </div>
              <h2 className="text-2xl font-bold text-navy">Savings Calculator</h2>
            </div>

            <div className="space-y-8">
              {/* Quantity Slider */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="font-medium text-navy">Order Quantity</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-gray-500">items</span>
                  </div>
                </div>
                <Slider
                  value={[quantity]}
                  onValueChange={(value) => setQuantity(value[0])}
                  min={1}
                  max={200}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200+</span>
                </div>
              </div>

              {/* Price Per Item */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="font-medium text-navy">Average Price Per Item</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <input
                      type="number"
                      value={pricePerItem}
                      onChange={(e) => setPricePerItem(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                </div>
                <Slider
                  value={[pricePerItem]}
                  onValueChange={(value) => setPricePerItem(value[0])}
                  min={10}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>$10</span>
                  <span>$50</span>
                  <span>$100</span>
                  <span>$150</span>
                  <span>$200</span>
                </div>
              </div>

              {/* Next Tier Prompt */}
              {nextTier && (
                <div className="p-4 bg-gold/10 rounded-lg border border-gold">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-gold" />
                    <span className="font-semibold text-navy">Unlock More Savings!</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add <strong>{nextTier.minQty - quantity} more items</strong> to your order to unlock{" "}
                    <strong>{nextTier.discount}% off</strong> and save an additional{" "}
                    <strong>
                      ${((nextTier.discount - discount) / 100 * (nextTier.minQty * pricePerItem)).toFixed(2)}
                    </strong>
                    !
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="bg-navy rounded-lg shadow-sm p-6 md:p-8 text-white">
            <h2 className="text-2xl font-bold mb-8">Your Estimated Savings</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gold" />
                  <span>Quantity</span>
                </div>
                <span className="text-xl font-semibold">{quantity} items</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gold" />
                  <span>Subtotal</span>
                </div>
                <span className="text-xl font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-gold" />
                  <span>Volume Discount ({discount}%)</span>
                </div>
                <span className="text-xl font-semibold text-green-400">
                  -${savings.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-xl">Estimated Total</span>
                <span className="text-3xl font-bold text-gold">${total.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="bg-green-500/20 rounded-lg p-4 text-center mt-6">
                  <p className="text-lg">
                    You're saving <strong className="text-gold">${savings.toFixed(2)}</strong> with volume pricing!
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <Link
                href="/products"
                className="block w-full py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors text-center"
              >
                Shop Now <ArrowRight className="w-5 h-5 inline ml-2" />
              </Link>
              <Link
                href="/contact"
                className="block w-full py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-navy transition-colors text-center"
              >
                Request Custom Quote
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-navy text-center mb-8">
            Why Choose LT's for Volume Orders?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "No Hidden Fees",
                description: "Logo setup and digitization are included with every order. What you see is what you pay.",
              },
              {
                title: "Quality Guaranteed",
                description: "Every item is made with exceptional Maine craftsmanship. We stand behind our products 100%.",
              },
              {
                title: "Fast Turnaround",
                description: "Most orders ship within 2-3 weeks. Rush options available for tight deadlines.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-navy">{benefit.title}</h3>
                </div>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-navy mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I combine multiple products to reach a volume tier?",
                a: "Yes! Your total order quantity across all products counts toward volume discount tiers.",
              },
              {
                q: "How do I get my logo on the products?",
                a: "Simply upload your logo when placing your order or send it to us separately. Our team will create a digital proof for your approval before production.",
              },
              {
                q: "Is there a minimum order quantity?",
                a: "Our minimum order is just 12 pieces per style/color. Volume discounts kick in at 24+ items.",
              },
              {
                q: "What if I need more than 200 items?",
                a: "Contact us for custom enterprise pricing! Orders over 200 items qualify for additional discounts and dedicated account management.",
              },
            ].map((faq) => (
              <div key={faq.q} className="pb-6 border-b border-gray-200 last:border-0">
                <h3 className="font-semibold text-navy mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
