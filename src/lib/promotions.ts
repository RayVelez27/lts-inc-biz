// Promotional Code System

export interface PromoCode {
  code: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
  value: number; // Percentage (0-100) or fixed amount
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  description: string;
  isActive: boolean;
}

// Default promo codes
export const defaultPromoCodes: PromoCode[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderAmount: 50,
    description: "10% off your first order (min $50)",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "SAVE20",
    type: "percentage",
    value: 20,
    minOrderAmount: 150,
    maxDiscount: 50,
    description: "20% off orders over $150 (max $50 off)",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "FLAT25",
    type: "fixed",
    value: 25,
    minOrderAmount: 100,
    description: "$25 off orders over $100",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrderAmount: 75,
    description: "Free shipping on orders over $75",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "MAINE15",
    type: "percentage",
    value: 15,
    description: "15% off for Maine locals",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "BULK30",
    type: "percentage",
    value: 30,
    minOrderAmount: 500,
    applicableCategories: ["clothing", "fleece"],
    description: "30% off clothing orders over $500",
    usageCount: 0,
    isActive: true,
  },
  {
    code: "SPRING2026",
    type: "percentage",
    value: 15,
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    description: "Spring sale - 15% off",
    usageCount: 0,
    isActive: true,
  },
];

// Initialize promo codes in localStorage
export function initializePromoCodes(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("lts-promo-codes");
  if (!existing) {
    localStorage.setItem("lts-promo-codes", JSON.stringify(defaultPromoCodes));
  }
}

// Get all promo codes
export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return defaultPromoCodes;
  initializePromoCodes();
  return JSON.parse(localStorage.getItem("lts-promo-codes") || "[]");
}

// Save promo codes
export function savePromoCodes(codes: PromoCode[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lts-promo-codes", JSON.stringify(codes));
}

// Add a new promo code
export function addPromoCode(code: PromoCode): void {
  const codes = getPromoCodes();
  codes.push(code);
  savePromoCodes(codes);
}

// Update a promo code
export function updatePromoCode(code: string, updates: Partial<PromoCode>): void {
  const codes = getPromoCodes();
  const index = codes.findIndex((c) => c.code === code);
  if (index !== -1) {
    codes[index] = { ...codes[index], ...updates };
    savePromoCodes(codes);
  }
}

// Delete a promo code
export function deletePromoCode(code: string): void {
  const codes = getPromoCodes().filter((c) => c.code !== code);
  savePromoCodes(codes);
}

// Validate and apply promo code
export interface PromoValidationResult {
  valid: boolean;
  error?: string;
  discount?: number;
  freeShipping?: boolean;
  promoCode?: PromoCode;
}

export function validatePromoCode(
  code: string,
  cartTotal: number,
  cartItems: Array<{ category: string; id: string; quantity: number }>,
  shippingCost: number
): PromoValidationResult {
  const promoCodes = getPromoCodes();
  const promo = promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase());

  if (!promo) {
    return { valid: false, error: "Invalid promo code" };
  }

  if (!promo.isActive) {
    return { valid: false, error: "This promo code is no longer active" };
  }

  // Check date validity
  const now = new Date();
  if (promo.startDate && new Date(promo.startDate) > now) {
    return { valid: false, error: "This promo code is not yet active" };
  }
  if (promo.endDate && new Date(promo.endDate) < now) {
    return { valid: false, error: "This promo code has expired" };
  }

  // Check usage limit
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: "This promo code has reached its usage limit" };
  }

  // Check minimum order amount
  if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
    return {
      valid: false,
      error: `Minimum order of $${promo.minOrderAmount} required for this code`,
    };
  }

  // Check applicable categories
  if (promo.applicableCategories && promo.applicableCategories.length > 0) {
    const hasApplicableItem = cartItems.some((item) =>
      promo.applicableCategories!.includes(item.category)
    );
    if (!hasApplicableItem) {
      return {
        valid: false,
        error: `This code is only valid for: ${promo.applicableCategories.join(", ")}`,
      };
    }
  }

  // Calculate discount
  let discount = 0;
  let freeShipping = false;

  switch (promo.type) {
    case "percentage":
      discount = cartTotal * (promo.value / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
      break;
    case "fixed":
      discount = promo.value;
      break;
    case "free_shipping":
      freeShipping = true;
      discount = shippingCost;
      break;
  }

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100,
    freeShipping,
    promoCode: promo,
  };
}

// Increment usage count
export function usePromoCode(code: string): void {
  const codes = getPromoCodes();
  const index = codes.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (index !== -1) {
    codes[index].usageCount += 1;
    savePromoCodes(codes);
  }
}
