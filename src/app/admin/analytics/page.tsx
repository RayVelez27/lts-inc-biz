"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryData {
  category: string;
  revenue: number;
  percentage: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("30d");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem("lts-admin-auth");
    if (adminAuth !== "true") {
      router.push("/admin");
      return;
    }

    loadAnalytics();
  }, [router, dateRange]);

  const loadAnalytics = () => {
    setIsLoading(true);

    // Generate sample sales data
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const sales: SalesData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      sales.push({
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 5000) + 1000,
        orders: Math.floor(Math.random() * 20) + 5,
      });
    }
    setSalesData(sales);

    // Category breakdown
    setCategoryData([
      { category: "Clothing", revenue: 45200, percentage: 35 },
      { category: "Outerwear", revenue: 32400, percentage: 25 },
      { category: "Fleece", revenue: 25900, percentage: 20 },
      { category: "Bags & Totes", revenue: 15500, percentage: 12 },
      { category: "Business Gifts", revenue: 10300, percentage: 8 },
    ]);

    // Customer metrics
    setCustomerMetrics({
      totalCustomers: 1247,
      newCustomers: 89,
      returningCustomers: 1158,
      avgOrderValue: 187.50,
    });

    setTimeout(() => setIsLoading(false), 500);
  };

  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgDailyRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;

  // Calculate trend (compare last half to first half)
  const halfPoint = Math.floor(salesData.length / 2);
  const firstHalf = salesData.slice(0, halfPoint).reduce((sum, d) => sum + d.revenue, 0);
  const secondHalf = salesData.slice(halfPoint).reduce((sum, d) => sum + d.revenue, 0);
  const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

  // Simple bar chart using CSS
  const maxRevenue = Math.max(...salesData.map((d) => d.revenue));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
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
            <h1 className="text-2xl font-bold text-navy">Analytics</h1>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={loadAnalytics}
              className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-md"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {trend >= 0 ? (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +{trend.toFixed(1)}%
                </span>
              ) : (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {trend.toFixed(1)}%
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-navy">{formatCurrency(totalRevenue)}</h3>
            <p className="text-gray-500">Total Revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy">{totalOrders}</h3>
            <p className="text-gray-500">Total Orders</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy">
              {customerMetrics?.totalCustomers || 0}
            </h3>
            <p className="text-gray-500">Total Customers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-navy">
              {formatCurrency(customerMetrics?.avgOrderValue || 0)}
            </h3>
            <p className="text-gray-500">Avg Order Value</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-6">Revenue Over Time</h2>

            {/* Simple CSS Bar Chart */}
            <div className="h-64 flex items-end gap-1">
              {salesData.map((data, index) => {
                const height = (data.revenue / maxRevenue) * 100;
                // Show every nth label based on data length
                const showLabel = salesData.length <= 14 || index % Math.ceil(salesData.length / 14) === 0;

                return (
                  <div key={data.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-navy hover:bg-gold transition-colors rounded-t cursor-pointer relative group"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                        {formatCurrency(data.revenue)}
                        <br />
                        {data.orders} orders
                      </div>
                    </div>
                    {showLabel && (
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left whitespace-nowrap">
                        {new Date(data.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-navy">{formatCurrency(avgDailyRevenue)}</p>
                <p className="text-sm text-gray-500">Avg Daily Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">
                  {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0}
                </p>
                <p className="text-sm text-gray-500">Avg Order Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">
                  {(totalOrders / salesData.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Avg Daily Orders</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-6">Sales by Category</h2>

            <div className="space-y-4">
              {categoryData.map((cat, index) => {
                const colors = [
                  "bg-navy",
                  "bg-gold",
                  "bg-green-500",
                  "bg-blue-500",
                  "bg-purple-500",
                ];
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(cat.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${colors[index % colors.length]}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{cat.percentage}% of total</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total</span>
                <span className="font-bold text-navy">
                  {formatCurrency(categoryData.reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-6">Customer Insights</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-navy">
                  {customerMetrics?.newCustomers || 0}
                </p>
                <p className="text-sm text-gray-500">New Customers</p>
                <p className="text-xs text-green-600 mt-1">This period</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-navy">
                  {customerMetrics?.returningCustomers || 0}
                </p>
                <p className="text-sm text-gray-500">Returning</p>
                <p className="text-xs text-gray-400 mt-1">
                  {customerMetrics
                    ? (
                        (customerMetrics.returningCustomers / customerMetrics.totalCustomers) *
                        100
                      ).toFixed(1)
                    : 0}
                  % retention
                </p>
              </div>
            </div>

            {/* Customer distribution pie chart simulation */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1a3a5c"
                    strokeWidth="20"
                    strokeDasharray={`${93 * 2.51} ${100 * 2.51}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#c5a572"
                    strokeWidth="20"
                    strokeDasharray={`${7 * 2.51} ${100 * 2.51}`}
                    strokeDashoffset={`${-93 * 2.51}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-navy">93%</p>
                    <p className="text-xs text-gray-500">Returning</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-navy rounded-full" />
                Returning
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gold rounded-full" />
                New
              </span>
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-navy mb-6">Top Performing Products</h2>

            <div className="space-y-4">
              {[
                { name: "Premium Performance Polo", sales: 234, revenue: 10530 },
                { name: "Full-Zip Fleece Jacket", sales: 189, revenue: 14175 },
                { name: "Insulated Parka", sales: 156, revenue: 28860 },
                { name: "Canvas Boat & Tote", sales: 312, revenue: 14040 },
                { name: "Insulated Travel Tumbler", sales: 445, revenue: 12460 },
              ].map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                  <p className="font-semibold text-navy">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-navy mb-6">Conversion Funnel</h2>

          <div className="flex items-center justify-between">
            {[
              { stage: "Visitors", value: 12450, width: 100 },
              { stage: "Product Views", value: 8320, width: 75 },
              { stage: "Add to Cart", value: 2150, width: 50 },
              { stage: "Checkout", value: 890, width: 35 },
              { stage: "Purchase", value: 645, width: 25 },
            ].map((stage, index, arr) => (
              <div key={stage.stage} className="flex-1 text-center relative">
                <div
                  className="mx-auto bg-navy rounded-lg flex items-center justify-center text-white font-bold"
                  style={{
                    width: `${stage.width}%`,
                    height: "80px",
                    clipPath:
                      index === arr.length - 1
                        ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        : "polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)",
                  }}
                >
                  {stage.value.toLocaleString()}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">{stage.stage}</p>
                {index > 0 && (
                  <p className="text-xs text-gray-500">
                    {((stage.value / arr[index - 1].value) * 100).toFixed(1)}% conversion
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Overall conversion rate:{" "}
              <span className="font-bold text-navy">5.18%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
