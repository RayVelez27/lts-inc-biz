"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Users,
  Calendar,
  DollarSign,
  Upload,
  CheckCircle,
  Building,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

interface OrderLine {
  id: string;
  productType: string;
  quantity: number;
  sizes: string;
  colors: string;
  notes: string;
}

export default function BulkOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([
    { id: "1", productType: "", quantity: 0, sizes: "", colors: "", notes: "" },
  ]);

  const [formData, setFormData] = useState({
    // Company Info
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    industry: "",

    // Order Details
    totalQuantity: "",
    budget: "",
    deadline: "",
    hasLogo: true,
    logoFile: null as File | null,

    // Additional Info
    previousCustomer: false,
    taxExempt: false,
    needsSamples: true,
    additionalNotes: "",

    // Preferences
    preferredContact: "email",
    bestTimeToCall: "",
  });

  const productTypes = [
    "Polos",
    "Dress Shirts",
    "T-Shirts",
    "Fleece Jackets",
    "Insulated Jackets",
    "Rain Jackets",
    "Vests",
    "Bags & Totes",
    "Drinkware",
    "Gift Sets",
    "Other",
  ];

  const industries = [
    "Healthcare",
    "Construction",
    "Technology",
    "Finance",
    "Education",
    "Hospitality",
    "Manufacturing",
    "Retail",
    "Non-Profit",
    "Government",
    "Other",
  ];

  const budgetRanges = [
    "$500 - $1,000",
    "$1,000 - $2,500",
    "$2,500 - $5,000",
    "$5,000 - $10,000",
    "$10,000 - $25,000",
    "$25,000+",
  ];

  const addOrderLine = () => {
    setOrderLines([
      ...orderLines,
      {
        id: Date.now().toString(),
        productType: "",
        quantity: 0,
        sizes: "",
        colors: "",
        notes: "",
      },
    ]);
  };

  const removeOrderLine = (id: string) => {
    if (orderLines.length > 1) {
      setOrderLines(orderLines.filter((line) => line.id !== id));
    }
  };

  const updateOrderLine = (id: string, field: keyof OrderLine, value: string | number) => {
    setOrderLines(
      orderLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to localStorage for demo
    const bulkOrders = JSON.parse(localStorage.getItem("lts-bulk-orders") || "[]");
    bulkOrders.push({
      id: `BULK-${Date.now()}`,
      ...formData,
      orderLines,
      submittedAt: new Date().toISOString(),
      status: "pending",
    });
    localStorage.setItem("lts-bulk-orders", JSON.stringify(bulkOrders));

    setSubmitted(true);
  };

  const totalItems = orderLines.reduce((sum, line) => sum + (line.quantity || 0), 0);

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-navy mb-4">Request Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your bulk order inquiry. Our corporate sales team will review your request and contact you within 1 business day.
            </p>

            <div className="bg-cream rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-navy mb-3">What happens next?</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  Our team reviews your requirements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  We prepare a custom quote with volume pricing
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  We send samples if requested
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                  You approve the design proof
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-navy text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">5</span>
                  Production begins on your order
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
              >
                Browse Products
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bulk Order Request
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Planning a large order for your team? Get custom pricing, dedicated support, and volume discounts of up to 30% off.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: DollarSign, label: "Volume Discounts", desc: "Up to 30% off" },
              { icon: Users, label: "Dedicated Rep", desc: "Personal service" },
              { icon: Package, label: "Free Samples", desc: "Before you buy" },
              { icon: Calendar, label: "Rush Available", desc: "When you need it" },
            ].map((benefit) => (
              <div key={benefit.label} className="flex flex-col items-center">
                <div className="p-3 bg-gold/10 rounded-lg mb-2">
                  <benefit.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-navy">{benefit.label}</h3>
                <p className="text-sm text-gray-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-navy/10 rounded-lg">
                <Building className="w-5 h-5 text-navy" />
              </div>
              <h2 className="text-xl font-semibold text-navy">Company Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <input
                  type="text"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <Label htmlFor="contactName">Contact Name *</Label>
                <input
                  type="text"
                  id="contactName"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">Select industry</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy/10 rounded-lg">
                  <Package className="w-5 h-5 text-navy" />
                </div>
                <h2 className="text-xl font-semibold text-navy">Order Details</h2>
              </div>
              <button
                type="button"
                onClick={addOrderLine}
                className="flex items-center gap-1 text-sm text-gold hover:text-navy"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {orderLines.map((line, index) => (
                <div key={line.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-navy">Item {index + 1}</span>
                    {orderLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOrderLine(line.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-4 gap-3">
                    <div>
                      <Label>Product Type</Label>
                      <select
                        value={line.productType}
                        onChange={(e) => updateOrderLine(line.id, "productType", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      >
                        <option value="">Select...</option>
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <input
                        type="number"
                        min="0"
                        value={line.quantity || ""}
                        onChange={(e) => updateOrderLine(line.id, "quantity", parseInt(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label>Sizes Needed</Label>
                      <input
                        type="text"
                        placeholder="S, M, L, XL..."
                        value={line.sizes}
                        onChange={(e) => updateOrderLine(line.id, "sizes", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <Label>Color Preference</Label>
                      <input
                        type="text"
                        placeholder="Navy, Black..."
                        value={line.colors}
                        onChange={(e) => updateOrderLine(line.id, "colors", e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalItems > 0 && (
              <div className="mt-4 p-3 bg-gold/10 rounded-lg">
                <p className="text-sm text-navy">
                  <strong>Total Items:</strong> {totalItems} pieces
                  {totalItems >= 144 && " (Qualifies for 20% volume discount!)"}
                  {totalItems >= 72 && totalItems < 144 && " (Qualifies for 15% volume discount!)"}
                  {totalItems >= 48 && totalItems < 72 && " (Qualifies for 10% volume discount!)"}
                  {totalItems >= 24 && totalItems < 48 && " (Qualifies for 5% volume discount!)"}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div>
                <Label htmlFor="budget">Estimated Budget</Label>
                <select
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">Select budget range</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="deadline">Needed By</Label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
          </div>

          {/* Logo & Customization */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-navy/10 rounded-lg">
                <FileText className="w-5 h-5 text-navy" />
              </div>
              <h2 className="text-xl font-semibold text-navy">Logo & Customization</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={formData.hasLogo}
                    onChange={() => setFormData({ ...formData, hasLogo: true })}
                    className="w-4 h-4"
                  />
                  Yes, I have a logo to add
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!formData.hasLogo}
                    onChange={() => setFormData({ ...formData, hasLogo: false })}
                    className="w-4 h-4"
                  />
                  No logo / Need help designing
                </label>
              </div>

              {formData.hasLogo && (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop your logo or click to browse
                  </p>
                  <input
                    type="file"
                    accept="image/*,.ai,.eps,.pdf"
                    className="hidden"
                    id="logoUpload"
                    onChange={(e) => setFormData({ ...formData, logoFile: e.target.files?.[0] || null })}
                  />
                  <label
                    htmlFor="logoUpload"
                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200 text-sm"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, AI, EPS, PDF (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-navy mb-6">Additional Options</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="needsSamples"
                  checked={formData.needsSamples}
                  onCheckedChange={(checked) => setFormData({ ...formData, needsSamples: checked as boolean })}
                />
                <div>
                  <Label htmlFor="needsSamples" className="cursor-pointer">
                    Send me samples before I order
                  </Label>
                  <p className="text-sm text-gray-500">We'll send up to 3 product samples free of charge</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="previousCustomer"
                  checked={formData.previousCustomer}
                  onCheckedChange={(checked) => setFormData({ ...formData, previousCustomer: checked as boolean })}
                />
                <div>
                  <Label htmlFor="previousCustomer" className="cursor-pointer">
                    I've ordered from LT's before
                  </Label>
                  <p className="text-sm text-gray-500">We may have your logo on file already</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="taxExempt"
                  checked={formData.taxExempt}
                  onCheckedChange={(checked) => setFormData({ ...formData, taxExempt: checked as boolean })}
                />
                <div>
                  <Label htmlFor="taxExempt" className="cursor-pointer">
                    My organization is tax-exempt
                  </Label>
                  <p className="text-sm text-gray-500">We'll ask for documentation during checkout</p>
                </div>
              </div>

              <div>
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Tell us more about your project, specific requirements, or any questions..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-navy mb-6">Contact Preferences</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Preferred Contact Method</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="email"
                      checked={formData.preferredContact === "email"}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                      className="w-4 h-4"
                    />
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="phone"
                      checked={formData.preferredContact === "phone"}
                      onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                      className="w-4 h-4"
                    />
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="bestTime">Best Time to Call</Label>
                <select
                  id="bestTime"
                  value={formData.bestTimeToCall}
                  onChange={(e) => setFormData({ ...formData, bestTimeToCall: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <option value="">Select time</option>
                  <option value="morning">Morning (8am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 5pm)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="submit"
              className="px-8 py-4 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
            >
              Submit Bulk Order Request
            </button>
            <Link
              href="/contact"
              className="px-8 py-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-center"
            >
              Contact Us Instead
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
