"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formType, setFormType] = useState<"contact" | "sample">("sample");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    estimatedQty: "",
    productInterest: [] as string[],
    message: "",
    newsletter: false,
  });

  const productOptions = [
    "Polos",
    "Dress Shirts",
    "Fleece",
    "Outerwear",
    "Bags & Totes",
    "Business Gifts",
    "Other",
  ];

  const handleProductToggle = (product: string) => {
    setFormData((prev) => ({
      ...prev,
      productInterest: prev.productInterest.includes(product)
        ? prev.productInterest.filter((p) => p !== product)
        : [...prev.productInterest, product],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to an API
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-navy mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-6">
              {formType === "sample"
                ? "Your free sample request has been submitted. A member of our team will be in touch within 1-2 business days."
                : "Your message has been received. We'll get back to you as soon as possible."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  company: "",
                  jobTitle: "",
                  estimatedQty: "",
                  productInterest: [],
                  message: "",
                  newsletter: false,
                });
              }}
              className="px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
            >
              Submit Another Request
            </button>
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
            Let's Build Something Together
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Request a free sample, ask a question, or get a custom quote. Our team is here to help outfit your business.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-semibold text-navy mb-6">Get In Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cream rounded-lg">
                    <Phone className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-navy">Phone</h3>
                    <a href="tel:207-774-1104" className="text-gray-600 hover:text-gold">
                      207-774-1104
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cream rounded-lg">
                    <Mail className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-navy">Email</h3>
                    <a href="mailto:business@ltsportland.com" className="text-gray-600 hover:text-gold">
                      business@ltsportland.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cream rounded-lg">
                    <MapPin className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-navy">Location</h3>
                    <p className="text-gray-600">
                      37 Danforth St.<br />
                      Portland, ME 04101
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cream rounded-lg">
                    <Clock className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-navy">Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday<br />
                      8 AM - 5 PM ET
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gold/10 rounded-lg border border-gold">
                <h3 className="font-semibold text-navy mb-2">Why Request a Sample?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Feel the quality before you order</li>
                  <li>See how your logo will look</li>
                  <li>No obligation, completely free</li>
                  <li>Ships within 3-5 business days</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              {/* Form Type Toggle */}
              <div className="flex gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setFormType("sample")}
                  className={`flex-1 py-3 rounded-md font-semibold transition-colors ${
                    formType === "sample"
                      ? "bg-gold text-navy"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Request Free Sample
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("contact")}
                  className={`flex-1 py-3 rounded-md font-semibold transition-colors ${
                    formType === "contact"
                      ? "bg-gold text-navy"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  General Inquiry
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Company */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <input
                      type="text"
                      id="company"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <input
                      type="text"
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                {formType === "sample" && (
                  <>
                    {/* Estimated Quantity */}
                    <div>
                      <Label htmlFor="estimatedQty">Estimated Order Quantity</Label>
                      <Select
                        value={formData.estimatedQty}
                        onValueChange={(value) => setFormData({ ...formData, estimatedQty: value })}
                      >
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Select quantity range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-24">1-24 items</SelectItem>
                          <SelectItem value="24-48">24-48 items (5% discount)</SelectItem>
                          <SelectItem value="48-72">48-72 items (10% discount)</SelectItem>
                          <SelectItem value="72-144">72-144 items (15% discount)</SelectItem>
                          <SelectItem value="144+">144+ items (20% discount)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Interest */}
                    <div>
                      <Label>Products of Interest</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {productOptions.map((product) => (
                          <div key={product} className="flex items-center">
                            <Checkbox
                              id={`product-${product}`}
                              checked={formData.productInterest.includes(product)}
                              onCheckedChange={() => handleProductToggle(product)}
                            />
                            <Label
                              htmlFor={`product-${product}`}
                              className="ml-2 text-sm text-gray-600 cursor-pointer"
                            >
                              {product}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Message */}
                <div>
                  <Label htmlFor="message">
                    {formType === "sample" ? "Additional Details" : "Message *"}
                  </Label>
                  <Textarea
                    id="message"
                    required={formType === "contact"}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={
                      formType === "sample"
                        ? "Tell us about your project, timeline, or any specific requirements..."
                        : "How can we help you?"
                    }
                    className="mt-1"
                  />
                </div>

                {/* Newsletter */}
                <div className="flex items-center">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, newsletter: checked as boolean })
                    }
                  />
                  <Label htmlFor="newsletter" className="ml-2 text-sm text-gray-600 cursor-pointer">
                    Sign me up for the LT's Business newsletter with exclusive offers and updates.
                  </Label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                >
                  {formType === "sample" ? "Request Free Sample" : "Send Message"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
