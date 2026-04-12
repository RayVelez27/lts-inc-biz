"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Truck,
  Check,
  X,
  MoreVertical,
} from "lucide-react";
import { sendShippingUpdateEmail } from "@/lib/email-service";

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
    email: string;
    phone?: string;
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

const statusOptions = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "proof", label: "Proof Sent", color: "bg-purple-100 text-purple-700" },
  { value: "approved", label: "Approved", color: "bg-indigo-100 text-indigo-700" },
  { value: "production", label: "In Production", color: "bg-yellow-100 text-yellow-700" },
  { value: "shipped", label: "Shipped", color: "bg-green-100 text-green-700" },
  { value: "delivered", label: "Delivered", color: "bg-gray-100 text-gray-700" },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showShipModal, setShowShipModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("UPS");

  useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem("lts-admin-auth");
    if (adminAuth !== "true") {
      router.push("/admin");
      return;
    }

    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
    setOrders(savedOrders);
    setFilteredOrders(savedOrders);
  }, [router]);

  useEffect(() => {
    let result = [...orders];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.shippingInfo.firstName.toLowerCase().includes(query) ||
          order.shippingInfo.lastName.toLowerCase().includes(query) ||
          order.shippingInfo.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem("lts-orders", JSON.stringify(updatedOrders));

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleShipOrder = () => {
    if (!selectedOrder || !trackingNumber) return;

    updateOrderStatus(selectedOrder.id, "shipped");

    // Send shipping email
    sendShippingUpdateEmail(
      selectedOrder.id,
      selectedOrder.shippingInfo.email,
      selectedOrder.shippingInfo.firstName,
      trackingNumber,
      carrier
    );

    setShowShipModal(false);
    setTrackingNumber("");
    setSelectedOrder(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-navy">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-navy">Orders</h1>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="all">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Order ID</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Items</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-navy">{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{order.shippingInfo.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ${order.totals.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowShipModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                          title="Mark as Shipped"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showShipModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy">Order {selectedOrder.id}</h2>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {statusOptions.find((s) => s.value === selectedOrder.status)?.label}
                </span>
                <span className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</span>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-navy mb-2">Customer</h3>
                <p className="text-gray-600">
                  {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}
                </p>
                <p className="text-gray-600">{selectedOrder.shippingInfo.email}</p>
                {selectedOrder.shippingInfo.phone && (
                  <p className="text-gray-600">{selectedOrder.shippingInfo.phone}</p>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-navy mb-2">Shipping Address</h3>
                <p className="text-gray-600">{selectedOrder.shippingInfo.address1}</p>
                <p className="text-gray-600">
                  {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}{" "}
                  {selectedOrder.shippingInfo.zip}
                </p>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold text-navy mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.color} / {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Info */}
              {selectedOrder.logoInfo.hasLogo && (
                <div>
                  <h3 className="font-semibold text-navy mb-2">Logo Details</h3>
                  <p className="text-gray-600">
                    Placement: {selectedOrder.logoInfo.logoPlacement}
                  </p>
                  <p className="text-gray-600">Size: {selectedOrder.logoInfo.logoSize}</p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${selectedOrder.totals.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${selectedOrder.totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.totals.embroidery > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Embroidery</span>
                      <span>${selectedOrder.totals.embroidery.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {selectedOrder.totals.shipping === 0
                        ? "FREE"
                        : `$${selectedOrder.totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${selectedOrder.totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setShowShipModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship Order Modal */}
      {showShipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-navy">Ship Order</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600">
                Enter tracking information for order <strong>{selectedOrder.id}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  A shipping confirmation email will be sent to{" "}
                  <strong>{selectedOrder.shippingInfo.email}</strong>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowShipModal(false);
                  setTrackingNumber("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleShipOrder}
                disabled={!trackingNumber}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Ship & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
