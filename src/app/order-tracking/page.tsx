"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { Label } from "@/components/ui/label";
import {
  Package,
  Truck,
  Check,
  Clock,
  FileText,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface Order {
  id: string;
  userId?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  shippingInfo: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
  };
  logoInfo: {
    hasLogo: boolean;
    logoPlacement: string;
    logoSize: string;
  };
  totals: {
    subtotal: number;
    discount: number;
    embroidery: number;
    shipping: number;
    total: number;
  };
  status: string;
  createdAt: string;
}

const orderStatuses = [
  { id: "confirmed", label: "Order Confirmed", icon: Check },
  { id: "proof", label: "Logo Proof Sent", icon: FileText },
  { id: "approved", label: "Proof Approved", icon: Check },
  { id: "production", label: "In Production", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load user's orders
    if (user) {
      const allOrders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
      const filtered = allOrders.filter((o: Order) => o.userId === user.id);
      setUserOrders(filtered);
    }
  }, [user]);

  useEffect(() => {
    // Auto-search if ID in URL
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setOrderId(idFromUrl.toUpperCase());
      // Search for the order
      const allOrders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
      const found = allOrders.find((o: Order) => o.id === idFromUrl.trim().toUpperCase());
      if (found) {
        setOrder(found);
      } else {
        setNotFound(true);
        setOrder(null);
      }
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (!orderId.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    // Search in localStorage
    const allOrders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
    const found = allOrders.find((o: Order) => o.id === orderId.trim().toUpperCase());

    setTimeout(() => {
      if (found) {
        setOrder(found);
      } else {
        setNotFound(true);
        setOrder(null);
      }
      setIsSearching(false);
    }, 500);
  };

  const getStatusIndex = (status: string) => {
    return orderStatuses.findIndex((s) => s.id === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEstimatedDelivery = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 21); // 3 weeks from order
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Track Your Order</h1>
        <p className="text-gray-600 mb-8">
          Enter your order number to see the current status of your order.
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-4"
          >
            <div className="flex-1">
              <Label htmlFor="orderId" className="sr-only">Order Number</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                  placeholder="Enter order number (e.g., LTS-12345678)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center mb-8">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find an order with that number. Please check the order number and try again.
            </p>
            <p className="text-sm text-gray-500">
              Having trouble? <Link href="/contact" className="text-gold hover:text-navy">Contact us</Link> for assistance.
            </p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-navy">Order #{order.id}</h2>
                  <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Estimated Delivery</p>
                  <p className="font-semibold text-navy">{getEstimatedDelivery(order.createdAt)}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {orderStatuses.map((status, index) => {
                  const currentIndex = getStatusIndex(order.status);
                  const isPast = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = status.icon;

                  return (
                    <div key={status.id} className="relative flex items-start mb-6 last:mb-0">
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isPast
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="ml-4">
                        <p className={`font-medium ${isPast ? "text-navy" : "text-gray-400"}`}>
                          {status.label}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-navy mb-4">Order Items</h3>
              <div className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-navy">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        {item.color} / {item.size}
                      </p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {order.logoInfo.hasLogo && (
                        <p className="text-sm text-gold">
                          Logo: {order.logoInfo.logoPlacement.replace("-", " ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-navy">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-navy mb-4">Shipping Address</h3>
                <div className="text-gray-600">
                  <p className="font-medium text-navy">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p>{order.shippingInfo.address1}</p>
                  <p>
                    {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-navy mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${order.totals.subtotal.toFixed(2)}</span>
                  </div>
                  {order.totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Volume Discount</span>
                      <span>-${order.totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {order.totals.embroidery > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Embroidery</span>
                      <span>${order.totals.embroidery.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{order.totals.shipping === 0 ? "FREE" : `$${order.totals.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-navy">
                    <span>Total</span>
                    <span>${order.totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="flex-1 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-center"
              >
                Contact Support
              </Link>
              <Link
                href="/products"
                className="flex-1 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors text-center"
              >
                Shop Again
              </Link>
            </div>
          </div>
        )}

        {/* User's Orders */}
        {!order && !notFound && user && userOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-navy mb-4">Your Recent Orders</h2>
            <div className="divide-y divide-gray-200">
              {userOrders.map((o) => (
                <div key={o.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">{o.id}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(o.createdAt)} • {o.items.length} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm capitalize px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {o.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderId(o.id);
                        setOrder(o);
                      }}
                      className="text-gold hover:text-navy transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        {!order && !notFound && (
          <div className="bg-cream rounded-lg p-6 mt-8">
            <h3 className="font-semibold text-navy mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-navy mb-1">Where can I find my order number?</p>
                <p className="text-gray-600">
                  Your order number was sent to your email when you placed your order. It starts with "LTS-" followed by 8 digits.
                </p>
              </div>
              <div>
                <p className="font-medium text-navy mb-1">How long does production take?</p>
                <p className="text-gray-600">
                  Most orders ship within 2-3 weeks. Rush options are available for an additional fee.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gold/30">
              <p className="text-gray-600">
                Still need assistance?{" "}
                <Link href="/contact" className="text-gold hover:text-navy font-medium">
                  Contact our support team
                </Link>{" "}
                or call us at{" "}
                <a href="tel:207-774-1104" className="text-gold hover:text-navy font-medium">
                  207-774-1104
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
