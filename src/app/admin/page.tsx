"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  Eye,
  ChevronRight,
  LogOut,
  Bell,
  Search,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check if admin is authenticated
    const adminAuth = localStorage.getItem("lts-admin-auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      loadDashboardStats();
    }
  }, []);

  const loadDashboardStats = () => {
    // Load stats from localStorage
    const orders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
    const users = JSON.parse(localStorage.getItem("lts-users") || "[]");

    const totalRevenue = orders.reduce(
      (sum: number, order: { totals: { total: number } }) => sum + (order.totals?.total || 0),
      0
    );

    const recentOrders = orders
      .slice(-5)
      .reverse()
      .map((order: { id: string; shippingInfo: { firstName: string; lastName: string }; totals: { total: number }; status: string; createdAt: string }) => ({
        id: order.id,
        customer: `${order.shippingInfo?.firstName || "Guest"} ${order.shippingInfo?.lastName || ""}`,
        total: order.totals?.total || 0,
        status: order.status || "confirmed",
        date: order.createdAt,
      }));

    setStats({
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: users.length,
      pendingOrders: orders.filter((o: { status: string }) => o.status === "confirmed" || o.status === "proof").length,
      recentOrders,
      topProducts: [
        { name: "Premium Performance Polo", sales: 145, revenue: 6525 },
        { name: "Full-Zip Fleece Jacket", sales: 98, revenue: 7350 },
        { name: "Insulated Parka", sales: 67, revenue: 12395 },
        { name: "Canvas Boat & Tote", sales: 234, revenue: 10530 },
        { name: "Insulated Travel Tumbler", sales: 312, revenue: 8736 },
      ],
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: password is "admin123"
    if (adminPassword === "admin123") {
      localStorage.setItem("lts-admin-auth", "true");
      setIsAuthenticated(true);
      loadDashboardStats();
    } else {
      alert("Invalid password. Demo password: admin123");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lts-admin-auth");
    setIsAuthenticated(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://ext.same-assets.com/3928788836/1212695810.svg"
                alt="LT's Inc"
                className="h-10 w-auto"
              />
              <span className="text-lg font-light text-navy ml-2">Admin</span>
            </div>
            <p className="text-gray-600">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-navy text-white font-semibold rounded-md hover:bg-navy-dark transition-colors"
            >
              Sign In to Admin
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Demo password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code>
          </p>

          <Link
            href="/"
            className="block text-center text-sm text-gold hover:text-navy mt-4"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-full bg-navy text-white">
        <div className="p-6 border-b border-navy-light">
          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="https://ext.same-assets.com/3928788836/1212695810.svg"
              alt="LT's Inc"
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-sm font-light opacity-80">Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
            { id: "orders", label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
            { id: "products", label: "Products", icon: Package, href: "/admin/products" },
            { id: "customers", label: "Customers", icon: Users, href: "/admin/customers" },
            { id: "emails", label: "Emails", icon: Mail, href: "/admin/emails" },
            { id: "analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
            { id: "settings", label: "Settings", icon: Settings, href: "/admin/settings" },
          ].map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                activeTab === item.id
                  ? "bg-gold text-navy"
                  : "hover:bg-navy-light"
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-light">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-navy-light rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders, products..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <button type="button" className="relative p-2 text-gray-500 hover:text-navy">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link href="/" className="text-sm text-gold hover:text-navy">
                View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-navy">{stats?.totalOrders || 0}</h3>
              <p className="text-gray-500">Total Orders</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +8%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-navy">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </h3>
              <p className="text-gray-500">Total Revenue</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +5%
                </span>
              </div>
              <h3 className="text-3xl font-bold text-navy">{stats?.totalCustomers || 0}</h3>
              <p className="text-gray-500">Customers</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy">{stats?.pendingOrders || 0}</h3>
              <p className="text-gray-500">Pending Orders</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-navy">Recent Orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-sm text-gold hover:text-navy flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-navy">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-navy">${order.total.toFixed(2)}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "shipped"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-navy">Top Products</h2>
                <Link
                  href="/admin/products"
                  className="text-sm text-gold hover:text-navy flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {stats?.topProducts?.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-4"
                  >
                    <span className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-navy">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} units sold</p>
                    </div>
                    <p className="font-medium text-navy">${product.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/orders"
                className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors text-center"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-navy" />
                <p className="font-medium text-navy">Manage Orders</p>
              </Link>
              <Link
                href="/admin/products"
                className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors text-center"
              >
                <Package className="w-8 h-8 mx-auto mb-2 text-navy" />
                <p className="font-medium text-navy">Add Product</p>
              </Link>
              <Link
                href="/admin/emails"
                className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors text-center"
              >
                <Mail className="w-8 h-8 mx-auto mb-2 text-navy" />
                <p className="font-medium text-navy">Send Email</p>
              </Link>
              <Link
                href="/admin/analytics"
                className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors text-center"
              >
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-navy" />
                <p className="font-medium text-navy">View Reports</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
