// Customer Segmentation System for Targeted Marketing

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  favoriteCategories: string[];
  purchasedProducts: string[];
  tags: string[];
  segment: CustomerSegment;
  score: number; // Customer value score 0-100
}

export type CustomerSegment =
  | "vip"           // High value, frequent buyers
  | "loyal"         // Regular customers
  | "promising"     // Good potential
  | "new"           // First-time buyers
  | "at_risk"       // Haven't ordered recently
  | "dormant"       // Inactive for 6+ months
  | "lost";         // Inactive for 12+ months

export interface SegmentDefinition {
  id: CustomerSegment;
  name: string;
  description: string;
  color: string;
  criteria: {
    minOrders?: number;
    maxOrders?: number;
    minSpent?: number;
    maxSpent?: number;
    daysSinceLastOrder?: { min?: number; max?: number };
    minAvgOrderValue?: number;
  };
  suggestedActions: string[];
}

export const segmentDefinitions: SegmentDefinition[] = [
  {
    id: "vip",
    name: "VIP Customers",
    description: "High-value customers with frequent purchases",
    color: "#c5a572",
    criteria: {
      minOrders: 5,
      minSpent: 1000,
    },
    suggestedActions: [
      "Send exclusive early access offers",
      "Provide dedicated account manager",
      "Offer free expedited shipping",
      "Invite to VIP events",
    ],
  },
  {
    id: "loyal",
    name: "Loyal Customers",
    description: "Regular buyers with consistent purchases",
    color: "#1a3a5c",
    criteria: {
      minOrders: 3,
      minSpent: 300,
      daysSinceLastOrder: { max: 180 },
    },
    suggestedActions: [
      "Send loyalty rewards",
      "Offer referral bonuses",
      "Provide sneak peeks of new products",
      "Request reviews and testimonials",
    ],
  },
  {
    id: "promising",
    name: "Promising Customers",
    description: "Recent buyers showing good potential",
    color: "#22c55e",
    criteria: {
      minOrders: 1,
      maxOrders: 2,
      minAvgOrderValue: 150,
      daysSinceLastOrder: { max: 90 },
    },
    suggestedActions: [
      "Send personalized product recommendations",
      "Offer volume discounts for repeat orders",
      "Share customer success stories",
      "Provide educational content about products",
    ],
  },
  {
    id: "new",
    name: "New Customers",
    description: "First-time buyers within last 30 days",
    color: "#3b82f6",
    criteria: {
      minOrders: 1,
      maxOrders: 1,
      daysSinceLastOrder: { max: 30 },
    },
    suggestedActions: [
      "Send welcome series emails",
      "Offer first-repeat purchase discount",
      "Request feedback on first order",
      "Share product care tips",
    ],
  },
  {
    id: "at_risk",
    name: "At Risk",
    description: "Previously active but slowing down",
    color: "#f59e0b",
    criteria: {
      minOrders: 2,
      daysSinceLastOrder: { min: 90, max: 180 },
    },
    suggestedActions: [
      "Send win-back campaign",
      "Offer special comeback discount",
      "Ask for feedback on experience",
      "Highlight new products since last order",
    ],
  },
  {
    id: "dormant",
    name: "Dormant",
    description: "Inactive for 6-12 months",
    color: "#ef4444",
    criteria: {
      daysSinceLastOrder: { min: 180, max: 365 },
    },
    suggestedActions: [
      "Send reactivation offer",
      "Survey about why they stopped buying",
      "Offer steep discount to re-engage",
      "Update on company improvements",
    ],
  },
  {
    id: "lost",
    name: "Lost Customers",
    description: "No activity for over 12 months",
    color: "#6b7280",
    criteria: {
      daysSinceLastOrder: { min: 365 },
    },
    suggestedActions: [
      "Final win-back attempt",
      "Ask for feedback via survey",
      "Consider removing from active list",
      "Archive for future reference",
    ],
  },
];

// Calculate days since date
function daysSince(dateString?: string): number {
  if (!dateString) return Infinity;
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// Determine customer segment
export function determineSegment(profile: Partial<CustomerProfile>): CustomerSegment {
  const daysSinceOrder = daysSince(profile.lastOrderDate);
  const orders = profile.totalOrders || 0;
  const spent = profile.totalSpent || 0;
  const avgValue = profile.avgOrderValue || 0;

  // Check segments in priority order
  if (orders >= 5 && spent >= 1000) return "vip";
  if (daysSinceOrder > 365) return "lost";
  if (daysSinceOrder > 180) return "dormant";
  if (orders >= 2 && daysSinceOrder > 90) return "at_risk";
  if (orders >= 3 && spent >= 300 && daysSinceOrder <= 180) return "loyal";
  if (orders === 1 && daysSinceOrder <= 30) return "new";
  if (orders <= 2 && avgValue >= 150 && daysSinceOrder <= 90) return "promising";

  return "new";
}

// Calculate customer value score (0-100)
export function calculateCustomerScore(profile: Partial<CustomerProfile>): number {
  let score = 0;

  // Order frequency (max 30 points)
  const orders = profile.totalOrders || 0;
  score += Math.min(orders * 6, 30);

  // Total spent (max 30 points)
  const spent = profile.totalSpent || 0;
  score += Math.min(spent / 50, 30);

  // Average order value (max 20 points)
  const avgValue = profile.avgOrderValue || 0;
  score += Math.min(avgValue / 10, 20);

  // Recency (max 20 points)
  const daysSinceOrder = daysSince(profile.lastOrderDate);
  if (daysSinceOrder <= 30) score += 20;
  else if (daysSinceOrder <= 60) score += 15;
  else if (daysSinceOrder <= 90) score += 10;
  else if (daysSinceOrder <= 180) score += 5;

  return Math.min(Math.round(score), 100);
}

// Build customer profiles from orders
export function buildCustomerProfiles(): CustomerProfile[] {
  if (typeof window === "undefined") return [];

  const orders = JSON.parse(localStorage.getItem("lts-orders") || "[]");
  const users = JSON.parse(localStorage.getItem("lts-users") || "[]");

  const customerMap = new Map<string, CustomerProfile>();

  // Process orders to build profiles
  for (const order of orders) {
    const email = order.shippingInfo?.email;
    if (!email) continue;

    const existing = customerMap.get(email);
    const orderTotal = order.totals?.total || 0;
    const orderDate = order.createdAt;

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += orderTotal;
      existing.avgOrderValue = existing.totalSpent / existing.totalOrders;

      if (!existing.lastOrderDate || orderDate > existing.lastOrderDate) {
        existing.lastOrderDate = orderDate;
      }
      if (!existing.firstOrderDate || orderDate < existing.firstOrderDate) {
        existing.firstOrderDate = orderDate;
      }

      // Track categories
      for (const item of order.items || []) {
        if (item.category && !existing.favoriteCategories.includes(item.category)) {
          existing.favoriteCategories.push(item.category);
        }
        if (item.id && !existing.purchasedProducts.includes(item.id)) {
          existing.purchasedProducts.push(item.id);
        }
      }
    } else {
      const user = users.find((u: { email: string }) => u.email === email);

      const profile: CustomerProfile = {
        id: user?.id || `guest-${Date.now()}`,
        email,
        firstName: order.shippingInfo?.firstName || "",
        lastName: order.shippingInfo?.lastName || "",
        company: order.shippingInfo?.company,
        totalOrders: 1,
        totalSpent: orderTotal,
        avgOrderValue: orderTotal,
        lastOrderDate: orderDate,
        firstOrderDate: orderDate,
        favoriteCategories: [],
        purchasedProducts: [],
        tags: [],
        segment: "new",
        score: 0,
      };

      for (const item of order.items || []) {
        if (item.category) profile.favoriteCategories.push(item.category);
        if (item.id) profile.purchasedProducts.push(item.id);
      }

      customerMap.set(email, profile);
    }
  }

  // Calculate segments and scores
  const profiles = Array.from(customerMap.values());
  for (const profile of profiles) {
    profile.segment = determineSegment(profile);
    profile.score = calculateCustomerScore(profile);

    // Add automatic tags
    if (profile.totalSpent >= 500) profile.tags.push("high-spender");
    if (profile.totalOrders >= 3) profile.tags.push("repeat-buyer");
    if (profile.favoriteCategories.includes("gifts")) profile.tags.push("gift-buyer");
    if (profile.company) profile.tags.push("business");
  }

  return profiles.sort((a, b) => b.score - a.score);
}

// Get segment statistics
export function getSegmentStats(): Record<CustomerSegment, { count: number; totalValue: number }> {
  const profiles = buildCustomerProfiles();
  const stats: Record<CustomerSegment, { count: number; totalValue: number }> = {
    vip: { count: 0, totalValue: 0 },
    loyal: { count: 0, totalValue: 0 },
    promising: { count: 0, totalValue: 0 },
    new: { count: 0, totalValue: 0 },
    at_risk: { count: 0, totalValue: 0 },
    dormant: { count: 0, totalValue: 0 },
    lost: { count: 0, totalValue: 0 },
  };

  for (const profile of profiles) {
    stats[profile.segment].count += 1;
    stats[profile.segment].totalValue += profile.totalSpent;
  }

  return stats;
}

// Get customers by segment
export function getCustomersBySegment(segment: CustomerSegment): CustomerProfile[] {
  return buildCustomerProfiles().filter((p) => p.segment === segment);
}

// Search customers
export function searchCustomers(query: string): CustomerProfile[] {
  const profiles = buildCustomerProfiles();
  const lower = query.toLowerCase();

  return profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(lower) ||
      p.firstName.toLowerCase().includes(lower) ||
      p.lastName.toLowerCase().includes(lower) ||
      p.company?.toLowerCase().includes(lower)
  );
}

// Export for marketing campaigns
export function exportSegmentEmails(segment: CustomerSegment): string[] {
  return getCustomersBySegment(segment).map((p) => p.email);
}
