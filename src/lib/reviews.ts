export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  images?: string[];
}

// Sample reviews for products
export const reviews: Review[] = [
  // Polo reviews
  {
    id: "rev-1",
    productId: "polo-1",
    userName: "Michael K.",
    rating: 5,
    title: "Perfect for our team uniforms",
    content: "We ordered 50 of these polos for our sales team and they look amazing. The embroidery quality is outstanding and the fabric holds up great after multiple washes. Our team loves wearing them!",
    verified: true,
    helpful: 12,
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "rev-2",
    productId: "polo-1",
    userName: "Sarah M.",
    rating: 5,
    title: "Great quality, fast turnaround",
    content: "LT's delivered our custom polos in just 2 weeks. The moisture-wicking fabric is perfect for our outdoor events. Highly recommend!",
    verified: true,
    helpful: 8,
    createdAt: "2026-03-01T14:30:00Z",
  },
  {
    id: "rev-3",
    productId: "polo-1",
    userName: "David L.",
    rating: 4,
    title: "Good but runs slightly small",
    content: "Quality is excellent and the logo looks great. Only note is that the sizing runs a bit small - recommend ordering one size up.",
    verified: true,
    helpful: 15,
    createdAt: "2026-02-20T09:15:00Z",
  },
  // Dress shirt reviews
  {
    id: "rev-4",
    productId: "shirt-1",
    userName: "Jennifer R.",
    rating: 5,
    title: "Professional and wrinkle-free",
    content: "These shirts are perfect for our bank staff. They truly are wrinkle-free and look crisp all day long. The embroidered logo is subtle and professional.",
    verified: true,
    helpful: 10,
    createdAt: "2026-03-10T11:00:00Z",
  },
  {
    id: "rev-5",
    productId: "shirt-1",
    userName: "Robert T.",
    rating: 5,
    title: "Best dress shirts we've ordered",
    content: "We've tried several vendors for our company shirts and LT's quality is unmatched. The attention to detail on the logo placement is perfect.",
    verified: true,
    helpful: 7,
    createdAt: "2026-02-28T16:45:00Z",
  },
  // Jacket reviews
  {
    id: "rev-6",
    productId: "jacket-1",
    userName: "Thomas B.",
    rating: 5,
    title: "Perfect for Maine winters",
    content: "Our construction crew needed warm, durable jackets and these deliver. The insulation is excellent and the logo embroidery is holding up great even with daily wear.",
    verified: true,
    helpful: 18,
    createdAt: "2026-03-05T08:30:00Z",
  },
  {
    id: "rev-7",
    productId: "jacket-1",
    userName: "Amanda C.",
    rating: 4,
    title: "Great quality, love the warmth",
    content: "Very warm and well-made. The only reason for 4 stars is the limited color options - would love to see more colors available.",
    verified: true,
    helpful: 5,
    createdAt: "2026-02-15T13:20:00Z",
  },
  // Fleece reviews
  {
    id: "rev-8",
    productId: "fleece-1",
    userName: "Chris P.",
    rating: 5,
    title: "Team favorite!",
    content: "Our entire office loves these fleece jackets. They're warm, comfortable, and look great with our logo. We've already ordered more!",
    verified: true,
    helpful: 14,
    createdAt: "2026-03-12T10:00:00Z",
  },
  {
    id: "rev-9",
    productId: "fleece-2",
    userName: "Lisa W.",
    rating: 5,
    title: "Perfect layering piece",
    content: "The quarter-zip is ideal for our office. Easy to put on and take off, and the logo placement on the chest looks very professional.",
    verified: true,
    helpful: 9,
    createdAt: "2026-03-08T15:00:00Z",
  },
  // Bag reviews
  {
    id: "rev-10",
    productId: "bag-1",
    userName: "Emily S.",
    rating: 5,
    title: "Classic tote, excellent quality",
    content: "We give these to our clients and they love them! The canvas is heavy-duty and the embroidered logo is beautiful. Great for brand visibility.",
    verified: true,
    helpful: 11,
    createdAt: "2026-03-18T09:00:00Z",
  },
  // Gift reviews
  {
    id: "rev-11",
    productId: "gift-1",
    userName: "Mark D.",
    rating: 5,
    title: "Perfect client gifts",
    content: "The laser-engraved tumbler looks amazing with our logo. We've given these to our top clients and received so many compliments.",
    verified: true,
    helpful: 6,
    createdAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "rev-12",
    productId: "gift-3",
    userName: "Nancy H.",
    rating: 5,
    title: "Impressive gift set",
    content: "We ordered these for our employee appreciation day. The presentation is beautiful and everyone was thrilled with the quality.",
    verified: true,
    helpful: 8,
    createdAt: "2026-03-22T11:30:00Z",
  },
];

export function getProductReviews(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

export function getProductRating(productId: string): { average: number; count: number } {
  const productReviews = getProductReviews(productId);
  if (productReviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: total / productReviews.length,
    count: productReviews.length,
  };
}

export function addReview(review: Omit<Review, "id" | "createdAt" | "helpful">): Review {
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
    helpful: 0,
  };

  // In a real app, this would be saved to a database
  // For now, we'll save to localStorage
  const savedReviews = JSON.parse(localStorage.getItem("lts-reviews") || "[]");
  savedReviews.push(newReview);
  localStorage.setItem("lts-reviews", JSON.stringify(savedReviews));

  return newReview;
}

export function getAllReviews(): Review[] {
  // Combine default reviews with user-added reviews from localStorage
  const savedReviews = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("lts-reviews") || "[]")
    : [];
  return [...reviews, ...savedReviews];
}
