// Stripe Payment Service
// This is a simulated implementation for demo purposes
// In production, integrate with actual Stripe API

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "paypal" | "apple_pay" | "google_pay";
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "requires_payment_method" | "requires_confirmation" | "processing" | "succeeded" | "failed" | "canceled";
  clientSecret: string;
  paymentMethodId?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface StripeConfig {
  publishableKey: string;
  // In production, the secret key would be on the server only
}

// Demo configuration
export const stripeConfig: StripeConfig = {
  publishableKey: "pk_test_demo_key_12345", // Replace with actual Stripe publishable key
};

// Simulated card validation
export function validateCard(cardNumber: string): { valid: boolean; brand: string } {
  const cleanNumber = cardNumber.replace(/\s/g, "");

  // Basic validation patterns
  if (/^4/.test(cleanNumber)) {
    return { valid: cleanNumber.length === 16, brand: "visa" };
  }
  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return { valid: cleanNumber.length === 16, brand: "mastercard" };
  }
  if (/^3[47]/.test(cleanNumber)) {
    return { valid: cleanNumber.length === 15, brand: "amex" };
  }
  if (/^6(?:011|5)/.test(cleanNumber)) {
    return { valid: cleanNumber.length === 16, brand: "discover" };
  }

  return { valid: cleanNumber.length >= 13 && cleanNumber.length <= 19, brand: "unknown" };
}

// Simulated payment processing
export async function createPaymentIntent(
  amount: number,
  currency: string = "usd",
  metadata?: Record<string, string>
): Promise<PaymentIntent> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const paymentIntent: PaymentIntent = {
    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount,
    currency,
    status: "requires_payment_method",
    clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    metadata,
  };

  // Store in localStorage for demo
  const intents = JSON.parse(localStorage.getItem("lts-payment-intents") || "[]");
  intents.push(paymentIntent);
  localStorage.setItem("lts-payment-intents", JSON.stringify(intents));

  return paymentIntent;
}

// Simulated payment confirmation
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethod: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    name: string;
  }
): Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Validate card
  const { valid, brand } = validateCard(paymentMethod.cardNumber);
  if (!valid) {
    return { success: false, error: "Invalid card number" };
  }

  // Simulate payment failure for specific test numbers
  const testNumber = paymentMethod.cardNumber.replace(/\s/g, "");
  if (testNumber === "4000000000000002") {
    return { success: false, error: "Your card was declined" };
  }
  if (testNumber === "4000000000009995") {
    return { success: false, error: "Insufficient funds" };
  }

  // Get and update payment intent
  const intents = JSON.parse(localStorage.getItem("lts-payment-intents") || "[]");
  const intentIndex = intents.findIndex((i: PaymentIntent) => i.id === paymentIntentId);

  if (intentIndex === -1) {
    return { success: false, error: "Payment intent not found" };
  }

  const updatedIntent: PaymentIntent = {
    ...intents[intentIndex],
    status: "succeeded",
    paymentMethodId: `pm_${Date.now()}`,
  };

  intents[intentIndex] = updatedIntent;
  localStorage.setItem("lts-payment-intents", JSON.stringify(intents));

  // Store payment method (masked)
  const last4 = paymentMethod.cardNumber.replace(/\s/g, "").slice(-4);
  const [expMonth, expYear] = paymentMethod.expiry.split("/");

  const savedMethod: PaymentMethod = {
    id: updatedIntent.paymentMethodId!,
    type: "card",
    brand,
    last4,
    expMonth: parseInt(expMonth),
    expYear: parseInt(`20${expYear}`),
  };

  const methods = JSON.parse(localStorage.getItem("lts-payment-methods") || "[]");
  methods.push(savedMethod);
  localStorage.setItem("lts-payment-methods", JSON.stringify(methods));

  return { success: true, paymentIntent: updatedIntent };
}

// Get saved payment methods
export function getSavedPaymentMethods(): PaymentMethod[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("lts-payment-methods") || "[]");
}

// Simulated refund
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Partial refund if specified
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const intents = JSON.parse(localStorage.getItem("lts-payment-intents") || "[]");
  const intent = intents.find((i: PaymentIntent) => i.id === paymentIntentId);

  if (!intent) {
    return { success: false, error: "Payment not found" };
  }

  if (intent.status !== "succeeded") {
    return { success: false, error: "Payment cannot be refunded" };
  }

  const refundId = `re_${Date.now()}`;

  // Store refund record
  const refunds = JSON.parse(localStorage.getItem("lts-refunds") || "[]");
  refunds.push({
    id: refundId,
    paymentIntentId,
    amount: amount || intent.amount,
    reason,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("lts-refunds", JSON.stringify(refunds));

  return { success: true, refundId };
}

// Apple Pay availability check
export function isApplePayAvailable(): boolean {
  if (typeof window === "undefined") return false;
  // @ts-expect-error - ApplePaySession is not in standard Window type
  return window.ApplePaySession?.canMakePayments() ?? false;
}

// Google Pay availability check
export function isGooglePayAvailable(): boolean {
  // In production, check Google Pay API availability
  return true; // Simulated
}

// Format card number with spaces
export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  return parts.length ? parts.join(" ") : value;
}

// Format expiry date
export function formatExpiry(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return v.slice(0, 2) + "/" + v.slice(2, 4);
  }
  return v;
}

// Get card brand icon
export function getCardBrandIcon(brand: string): string {
  const icons: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
    unknown: "💳",
  };
  return icons[brand] || icons.unknown;
}
