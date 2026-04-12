"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Users,
  Star,
  TrendingUp,
  AlertTriangle,
  Clock,
  XCircle,
  Mail,
  Download,
  Filter,
  ChevronRight,
} from "lucide-react";
import {
  buildCustomerProfiles,
  getSegmentStats,
  segmentDefinitions,
  type CustomerProfile,
  type CustomerSegment,
} from "@/lib/segmentation";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [segmentStats, setSegmentStats] = useState<Record<CustomerSegment, { count: number; totalValue: number }> | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem("lts-admin-auth");
    if (adminAuth !== "true") {
      router.push("/admin");
      return;
    }

    loadData();
  }, [router]);

  const loadData = () => {
    const profiles = buildCustomerProfiles();
    setCustomers(profiles);
    setSegmentStats(getSegmentStats());
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSegment = selectedSegment === "all" || customer.segment === selectedSegment;
    const matchesSearch =
      !searchQuery ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSegment && matchesSearch;
  });

  const getSegmentIcon = (segment: CustomerSegment) => {
    switch (segment) {
      case "vip": return Star;
      case "loyal": return Users;
      case "promising": return TrendingUp;
      case "new": return Users;
      case "at_risk": return AlertTriangle;
      case "dormant": return Clock;
      case "lost": return XCircle;
      default: return Users;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExportEmails = () => {
    const emails = filteredCustomers.map((c) => c.email).join("\n");
    const blob = new Blob([emails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${selectedSegment}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-2xl font-bold text-navy">Customer Segmentation</h1>
          </div>
          <button
            type="button"
            onClick={handleExportEmails}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark"
          >
            <Download className="w-4 h-4" />
            Export Emails
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Segment Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {segmentDefinitions.map((segment) => {
            const stats = segmentStats?.[segment.id];
            const Icon = getSegmentIcon(segment.id);
            const isSelected = selectedSegment === segment.id;

            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => setSelectedSegment(isSelected ? "all" : segment.id)}
                className={`p-4 rounded-lg text-left transition-all ${
                  isSelected
                    ? "ring-2 ring-offset-2 ring-gold"
                    : "hover:shadow-md"
                } bg-white`}
                style={{
                  borderColor: isSelected ? segment.color : undefined,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${segment.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: segment.color }} />
                </div>
                <h3 className="font-semibold text-navy text-sm">{segment.name}</h3>
                <p className="text-2xl font-bold" style={{ color: segment.color }}>
                  {stats?.count || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats?.totalValue || 0)}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                      value={selectedSegment}
                      onChange={(e) => setSelectedSegment(e.target.value as CustomerSegment | "all")}
                      className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="all">All Segments</option>
                      {segmentDefinitions.map((seg) => (
                        <option key={seg.id} value={seg.id}>{seg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const segmentDef = segmentDefinitions.find((s) => s.id === customer.segment);

                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => setSelectedCustomer(customer)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedCustomer?.id === customer.id ? "bg-gold/5" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: segmentDef?.color || "#6b7280" }}
                            >
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-navy">
                                {customer.firstName} {customer.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-navy">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.totalOrders} orders
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${segmentDef?.color}20`,
                              color: segmentDef?.color,
                            }}
                          >
                            {segmentDef?.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            Score: {customer.score}/100
                          </span>
                          {customer.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No customers found</p>
                    <p className="text-sm">Customers will appear here after orders are placed</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Detail / Segment Info */}
          <div className="lg:col-span-1">
            {selectedCustomer ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-navy">Customer Profile</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-3"
                    style={{
                      backgroundColor: segmentDefinitions.find((s) => s.id === selectedCustomer.segment)?.color,
                    }}
                  >
                    {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-navy">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  {selectedCustomer.company && (
                    <p className="text-sm text-gray-500">{selectedCustomer.company}</p>
                  )}
                </div>

                {/* Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Customer Score</span>
                    <span className="font-bold text-navy">{selectedCustomer.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${selectedCustomer.score}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-navy">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-gray-500">Total Orders</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-navy">
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500">Total Spent</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-navy">
                      {formatCurrency(selectedCustomer.avgOrderValue)}
                    </p>
                    <p className="text-xs text-gray-500">Avg Order</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm font-bold text-navy">
                      {formatDate(selectedCustomer.lastOrderDate)}
                    </p>
                    <p className="text-xs text-gray-500">Last Order</p>
                  </div>
                </div>

                {/* Tags */}
                {selectedCustomer.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Categories */}
                {selectedCustomer.favoriteCategories.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Favorite Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCustomer.favoriteCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-navy/10 text-navy rounded-full text-xs capitalize"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    className="w-full py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    View Orders
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-navy mb-4">Segment Guide</h2>

                <div className="space-y-4">
                  {segmentDefinitions.map((segment) => (
                    <div key={segment.id} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <h3 className="font-medium text-navy">{segment.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                      <div className="space-y-1">
                        {segment.suggestedActions.slice(0, 2).map((action, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            {action}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
