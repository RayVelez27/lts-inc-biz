"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useAuth, type Address } from "@/lib/auth-context";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { sendOrderConfirmationEmail, type OrderEmailData } from "@/lib/email-service";
import { createPaymentIntent, confirmPayment, validateCard, formatCardNumber } from "@/lib/stripe-service";
import {
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Truck,
  FileImage,
  Check,
  Lock,
  Upload,
  X,
  AlertCircle,
} from "lucide-react";

type CheckoutStep = "shipping" | "logo" | "payment" | "review";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  saveAddress: boolean;
}

interface LogoInfo {
  hasLogo: boolean;
  logoFile: File | null;
  logoPreview: string | null;
  logoPlacement: string;
  logoSize: string;
  specialInstructions: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  billingAddress: "same" | "different";
  billingInfo: ShippingInfo;
}

const steps: { id: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "logo", label: "Logo & Customization", icon: FileImage },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: Check },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, getVolumeDiscount, clearCart } = useCart();
  const { user, addAddress } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    company: user?.company || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    saveAddress: false,
  });

  const [logoInfo, setLogoInfo] = useState<LogoInfo>({
    hasLogo: true,
    logoFile: null,
    logoPreview: null,
    logoPlacement: "left-chest",
    logoSize: "standard",
    specialInstructions: "",
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    billingAddress: "same",
    billingInfo: { ...shippingInfo },
  });

  useEffect(() => {
    if (user?.addresses.length) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setShippingInfo({
          firstName: defaultAddr.firstName,
          lastName: defaultAddr.lastName,
          company: defaultAddr.company || "",
          email: user.email,
          phone: user.phone || "",
          address1: defaultAddr.address1,
          address2: defaultAddr.address2 || "",
          city: defaultAddr.city,
          state: defaultAddr.state,
          zip: defaultAddr.zip,
          country: defaultAddr.country,
          saveAddress: false,
        });
      }
    }
  }, [user]);

  const discount = getVolumeDiscount();
  const discountAmount = totalPrice * discount;
  const logoSetupFee = logoInfo.hasLogo ? 0 : 0; // Logo setup included
  const embroideryFee = logoInfo.hasLogo ? items.reduce((sum, item) => sum + item.quantity * 8, 0) : 0;
  const shippingCost = totalPrice >= 150 ? 0 : 12.99;
  const subtotal = totalPrice - discountAmount;
  const finalTotal = subtotal + embroideryFee + shippingCost;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoInfo({
          ...logoInfo,
          logoFile: file,
          logoPreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoInfo({
      ...logoInfo,
      logoFile: null,
      logoPreview: null,
    });
  };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent(
        Math.round(finalTotal * 100), // Amount in cents
        "usd",
        { source: "web_checkout" }
      );

      // Process payment
      const paymentResult = await confirmPayment(paymentIntent.id, {
        cardNumber: paymentInfo.cardNumber,
        expiry: paymentInfo.expiry,
        cvv: paymentInfo.cvv,
        name: paymentInfo.cardName,
      });

      if (!paymentResult.success) {
        alert(paymentResult.error || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Save address if requested
      if (shippingInfo.saveAddress && user) {
        addAddress({
          type: "shipping",
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          company: shippingInfo.company,
          address1: shippingInfo.address1,
          address2: shippingInfo.address2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo.zip,
          country: shippingInfo.country,
          isDefault: false,
        });
      }

      // Generate order ID
      const newOrderId = `LTS-${Date.now().toString().slice(-8)}`;
      setOrderId(newOrderId);

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
    orders.push({
      id: newOrderId,
      userId: user?.id,
      items,
      shippingInfo,
      logoInfo: {
        hasLogo: logoInfo.hasLogo,
        logoPlacement: logoInfo.logoPlacement,
        logoSize: logoInfo.logoSize,
        specialInstructions: logoInfo.specialInstructions,
      },
      totals: {
        subtotal: totalPrice,
        discount: discountAmount,
        embroidery: embroideryFee,
        shipping: shippingCost,
        total: finalTotal,
      },
      status: "confirmed",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("lts-orders", JSON.stringify(orders));

      // Send order confirmation email
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 21);

      const emailData: OrderEmailData = {
        orderId: newOrderId,
        customerName: shippingInfo.firstName,
        customerEmail: shippingInfo.email,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totals: {
          subtotal: totalPrice,
          discount: discountAmount,
          embroidery: embroideryFee,
          shipping: shippingCost,
          total: finalTotal,
        },
        shippingAddress: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          address: shippingInfo.address1,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip: shippingInfo.zip,
        },
        estimatedDelivery: estimatedDelivery.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      sendOrderConfirmationEmail(emailData);

      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error("Order error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
          >
            Browse Products
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  if (orderComplete) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. We've sent a confirmation email to {shippingInfo.email}.
            </p>

            <div className="bg-cream rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-navy">{orderId}</p>
            </div>

            <div className="text-left space-y-4 mb-8">
              <h3 className="font-semibold text-navy">What's Next?</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  We'll review your logo and create a digital proof
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  You'll receive a proof for approval within 2 business days
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  Production begins after your approval
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 mt-0.5" />
                  Typical turnaround is 2-3 weeks
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/order-tracking?id=${orderId}`}
                className="px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
              >
                Track Your Order
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isPast = steps.findIndex((s) => s.id === currentStep) > index;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => isPast && goToStep(step.id)}
                    disabled={!isPast}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      isActive
                        ? "bg-navy text-white"
                        : isPast
                        ? "bg-gold text-navy cursor-pointer"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-1 mx-2 ${
                        isPast ? "bg-gold" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Step */}
            {currentStep === "shipping" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Shipping Information</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                  className="space-y-4"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <input
                      type="text"
                      id="company"
                      value={shippingInfo.company}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, company: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <input
                        type="tel"
                        id="phone"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address1">Address *</Label>
                    <input
                      type="text"
                      id="address1"
                      required
                      value={shippingInfo.address1}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
                    <input
                      type="text"
                      id="address2"
                      value={shippingInfo.address2}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <input
                        type="text"
                        id="city"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <input
                        type="text"
                        id="state"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <input
                        type="text"
                        id="zip"
                        required
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  {user && (
                    <div className="flex items-center">
                      <Checkbox
                        id="saveAddress"
                        checked={shippingInfo.saveAddress}
                        onCheckedChange={(checked) =>
                          setShippingInfo({ ...shippingInfo, saveAddress: checked as boolean })
                        }
                      />
                      <Label htmlFor="saveAddress" className="ml-2 cursor-pointer">
                        Save this address for future orders
                      </Label>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center gap-2"
                    >
                      Continue to Logo <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Logo Step */}
            {currentStep === "logo" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Logo & Customization</h2>

                <div className="space-y-6">
                  {/* Logo Upload Toggle */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setLogoInfo({ ...logoInfo, hasLogo: true })}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                        logoInfo.hasLogo
                          ? "border-navy bg-navy/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-navy">Add Logo Embroidery</p>
                      <p className="text-sm text-gray-500">$8 per item</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInfo({ ...logoInfo, hasLogo: false })}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                        !logoInfo.hasLogo
                          ? "border-navy bg-navy/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-navy">No Logo</p>
                      <p className="text-sm text-gray-500">Blank items only</p>
                    </button>
                  </div>

                  {logoInfo.hasLogo && (
                    <>
                      {/* Logo Upload */}
                      <div>
                        <Label>Upload Your Logo</Label>
                        <div className="mt-2">
                          {logoInfo.logoPreview ? (
                            <div className="relative inline-block">
                              <img
                                src={logoInfo.logoPreview}
                                alt="Logo preview"
                                className="max-w-xs h-32 object-contain border border-gray-200 rounded-lg p-2"
                              />
                              <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gold transition-colors">
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">
                                Click to upload logo
                              </span>
                              <span className="text-xs text-gray-400 mt-1">
                                PNG, JPG, AI, EPS (max 10MB)
                              </span>
                              <input
                                type="file"
                                accept="image/*,.ai,.eps"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Don't have your logo ready? No problem! You can email it to us at business@ltsportland.com after placing your order.
                        </p>
                      </div>

                      {/* Logo Placement */}
                      <div>
                        <Label>Logo Placement</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                          {[
                            { id: "left-chest", label: "Left Chest" },
                            { id: "right-chest", label: "Right Chest" },
                            { id: "center-chest", label: "Center Chest" },
                            { id: "back", label: "Back" },
                          ].map((placement) => (
                            <button
                              key={placement.id}
                              type="button"
                              onClick={() => setLogoInfo({ ...logoInfo, logoPlacement: placement.id })}
                              className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                                logoInfo.logoPlacement === placement.id
                                  ? "border-navy bg-navy/5 font-medium"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {placement.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Size */}
                      <div>
                        <Label>Logo Size</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {[
                            { id: "small", label: 'Small (2.5")' },
                            { id: "standard", label: 'Standard (3.5")' },
                            { id: "large", label: 'Large (4.5")' },
                          ].map((size) => (
                            <button
                              key={size.id}
                              type="button"
                              onClick={() => setLogoInfo({ ...logoInfo, logoSize: size.id })}
                              className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                                logoInfo.logoSize === size.id
                                  ? "border-navy bg-navy/5 font-medium"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div>
                        <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                        <textarea
                          id="instructions"
                          rows={3}
                          value={logoInfo.specialInstructions}
                          onChange={(e) =>
                            setLogoInfo({ ...logoInfo, specialInstructions: e.target.value })
                          }
                          placeholder="Any specific requirements for your logo placement or colors..."
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center gap-2"
                    >
                      Continue to Payment <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === "payment" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Payment Information</h2>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm mb-4">
                    <Lock className="w-4 h-4" />
                    Your payment information is secure and encrypted
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <input
                      type="text"
                      id="cardNumber"
                      required
                      maxLength={19}
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
                        setPaymentInfo({ ...paymentInfo, cardNumber: value });
                      }}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <input
                      type="text"
                      id="cardName"
                      required
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiration Date</Label>
                      <input
                        type="text"
                        id="expiry"
                        required
                        maxLength={5}
                        placeholder="MM/YY"
                        value={paymentInfo.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2);
                          }
                          setPaymentInfo({ ...paymentInfo, expiry: value });
                        }}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <input
                        type="text"
                        id="cvv"
                        required
                        maxLength={4}
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, "") })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Label>Billing Address</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={paymentInfo.billingAddress === "same"}
                          onChange={() => setPaymentInfo({ ...paymentInfo, billingAddress: "same" })}
                          className="mr-2"
                        />
                        Same as shipping
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={paymentInfo.billingAddress === "different"}
                          onChange={() => setPaymentInfo({ ...paymentInfo, billingAddress: "different" })}
                          className="mr-2"
                        />
                        Different address
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center gap-2"
                    >
                      Review Order <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Review Step */}
            {currentStep === "review" && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-navy mb-4">Order Items</h2>
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="py-4 flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-navy">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.color} / {item.size} • Qty: {item.quantity}
                          </p>
                          {logoInfo.hasLogo && (
                            <p className="text-sm text-gold">+ Logo embroidery</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-navy">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          {logoInfo.hasLogo && (
                            <p className="text-sm text-gray-500">
                              +${(8 * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Logo Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy">Shipping Address</h3>
                      <button
                        type="button"
                        onClick={() => goToStep("shipping")}
                        className="text-sm text-gold hover:text-navy"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-gray-600">
                      <p className="font-medium text-navy">
                        {shippingInfo.firstName} {shippingInfo.lastName}
                      </p>
                      {shippingInfo.company && <p>{shippingInfo.company}</p>}
                      <p>{shippingInfo.address1}</p>
                      {shippingInfo.address2 && <p>{shippingInfo.address2}</p>}
                      <p>
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                      </p>
                      <p className="mt-2">{shippingInfo.email}</p>
                      {shippingInfo.phone && <p>{shippingInfo.phone}</p>}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-navy">Customization</h3>
                      <button
                        type="button"
                        onClick={() => goToStep("logo")}
                        className="text-sm text-gold hover:text-navy"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-gray-600">
                      {logoInfo.hasLogo ? (
                        <>
                          <p className="font-medium text-navy">Logo Embroidery</p>
                          <p>Placement: {logoInfo.logoPlacement.replace("-", " ")}</p>
                          <p>Size: {logoInfo.logoSize}</p>
                          {logoInfo.logoPreview && (
                            <img
                              src={logoInfo.logoPreview}
                              alt="Logo"
                              className="mt-2 h-16 object-contain"
                            />
                          )}
                          {!logoInfo.logoPreview && (
                            <p className="text-sm text-gold mt-2">
                              Remember to email your logo after ordering
                            </p>
                          )}
                        </>
                      ) : (
                        <p>No logo embroidery</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-8 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">◌</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Place Order • ${finalTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-lg font-semibold text-navy mb-4">Order Summary</h2>

              {/* Items Preview */}
              <div className="max-h-48 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 py-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {logoInfo.hasLogo && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Logo Embroidery</span>
                    <span>${embroideryFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-navy">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shippingCost > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Add ${(150 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
