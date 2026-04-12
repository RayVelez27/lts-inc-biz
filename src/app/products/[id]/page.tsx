"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { getProductById, products, type Product } from "@/lib/products";
import { getProductReviews, getProductRating, addReview, type Review } from "@/lib/reviews";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProductCustomizer from "./customizer";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Star,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

const sizeChart: Record<string, Record<string, string>> = {
  clothing: {
    XS: "32-34",
    S: "34-36",
    M: "38-40",
    L: "42-44",
    XL: "46-48",
    "2XL": "50-52",
    "3XL": "54-56",
  },
  bags: {
    Small: '12" x 10" x 5"',
    Medium: '16" x 14" x 7"',
    Large: '20" x 18" x 9"',
    "One Size": "Standard",
  },
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const product = getProductById(id);
  const inWishlist = product ? isInWishlist(product.id) : false;

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"details" | "sizing" | "care" | "reviews">("details");
  const [addedToCart, setAddedToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setReviews(getProductReviews(product.id));
      setRating(getProductRating(product.id));
    }
  }, [product]);

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
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

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity,
      category: product.category,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const review = addReview({
      productId: product.id,
      userId: user?.id,
      userName: user ? `${user.firstName} ${user.lastName.charAt(0)}.` : "Anonymous",
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      verified: !!user,
    });

    setReviews([review, ...reviews]);
    setRating({
      average: (rating.average * rating.count + newReview.rating) / (rating.count + 1),
      count: rating.count + 1,
    });
    setShowReviewForm(false);
    setReviewSubmitted(true);
    setNewReview({ rating: 5, title: "", content: "" });
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const getColorStyle = (color: string) => {
    const colorMap: Record<string, string> = {
      White: "#fff",
      Navy: "#1a3a5c",
      Black: "#000",
      Gray: "#6b7280",
      Charcoal: "#374151",
      Red: "#dc2626",
      "Forest Green": "#166534",
      Burgundy: "#7f1d1d",
      Yellow: "#eab308",
      "Light Blue": "#93c5fd",
      Blue: "#2563eb",
      Cream: "#fef3c7",
      "Natural/Navy": "#f5f2ed",
      "Natural/Red": "#f5f2ed",
    };
    return colorMap[color] || "#c5a572";
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-cream py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-gold">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href="/products" className="hover:text-gold">Products</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link href={`/products?category=${product.category}`} className="hover:text-gold capitalize">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-navy font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.new && (
                <span className="absolute top-4 left-4 bg-gold text-navy px-3 py-1 rounded text-sm font-medium">
                  New
                </span>
              )}
              {product.featured && !product.new && (
                <span className="absolute top-4 left-4 bg-navy text-white px-3 py-1 rounded text-sm font-medium">
                  Featured
                </span>
              )}
            </div>

            {/* Thumbnail strip - would show more images in real app */}
            <div className="flex gap-2">
              <div className="w-20 h-20 rounded border-2 border-navy overflow-hidden">
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="w-20 h-20 rounded border border-gray-200 overflow-hidden opacity-50">
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                {product.subcategory}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(rating.average) ? "text-gold fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className="text-sm text-gray-600 hover:text-gold"
                >
                  ({rating.count} {rating.count === 1 ? "review" : "reviews"})
                </button>
              </div>
              <p className="text-3xl font-bold text-navy">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                As low as ${(product.price * 0.8).toFixed(2)} with volume discount
              </p>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-navy mb-3">
                Color: <span className="font-normal text-gray-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-navy ring-2 ring-navy ring-offset-2"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: getColorStyle(color) }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-navy">
                  Size: <span className="font-normal text-gray-600">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab("sizing")}
                  className="text-sm text-gold hover:text-navy transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      selectedSize === size
                        ? "bg-navy text-white border-navy"
                        : "border-gray-300 hover:border-navy"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-navy mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-2 text-center min-w-[60px] font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Order 24+ for <span className="text-gold font-medium">5% off</span>
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-gold text-navy hover:bg-gold-light"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (product) {
                    if (inWishlist) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                      });
                    }
                  }
                }}
                className={`p-4 border rounded-md transition-colors ${
                  inWishlist
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-gray-300 hover:border-navy"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
              <button
                type="button"
                className="p-4 border border-gray-300 rounded-md hover:border-navy transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* DecoNetwork Customizer */}
            <ProductCustomizer
              productId={product.id}
              productName={product.name}
              basePrice={product.price}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
            />

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <h4 className="font-medium text-navy">Fast Production</h4>
                  <p className="text-sm text-gray-600">7-10 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <h4 className="font-medium text-navy">Quality Guaranteed</h4>
                  <p className="text-sm text-gray-600">Maine craftsmanship</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <h4 className="font-medium text-navy">Easy Returns</h4>
                  <p className="text-sm text-gray-600">30-day policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <h4 className="font-medium text-navy">Custom Logo</h4>
                  <p className="text-sm text-gray-600">Embroidery available</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-navy mb-2" />
                <p className="text-xs text-gray-600">Free Shipping on $150+</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-navy mb-2" />
                <p className="text-xs text-gray-600">Quality Guaranteed</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto text-navy mb-2" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>

            {/* Logo Info */}
            <div className="bg-cream rounded-lg p-4">
              <h3 className="font-semibold text-navy mb-2">Custom Logo Embroidery</h3>
              <p className="text-sm text-gray-600">
                Add your company logo for just $8 per item (includes setup).
                Upload your logo during checkout or contact us for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200">
            {[
              { id: "details", label: "Product Details" },
              { id: "sizing", label: "Size & Fit" },
              { id: "care", label: "Care Instructions" },
              { id: "reviews", label: `Reviews (${rating.count})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-navy border-b-2 border-navy"
                    : "text-gray-500 hover:text-navy"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "details" && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-navy mb-4">Product Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    Premium quality materials built to last
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    Perfect placement for embroidered logos
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    Available in a wide range of sizes
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    Excellent for team uniforms and corporate gifts
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    Maine-quality craftsmanship guaranteed
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "sizing" && (
              <div>
                <h3 className="text-xl font-semibold text-navy mb-4">Size Guide</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-left font-medium text-navy">Size</th>
                        <th className="py-3 px-4 text-left font-medium text-navy">Chest (inches)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizes.map((size) => (
                        <tr key={size} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{size}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {sizeChart[product.category]?.[size] || sizeChart.clothing[size] || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "care" && (
              <div>
                <h3 className="text-xl font-semibold text-navy mb-4">Care Instructions</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Machine wash cold with like colors</li>
                  <li>• Tumble dry low or hang to dry</li>
                  <li>• Do not bleach</li>
                  <li>• Iron on low heat if needed</li>
                  <li>• Do not dry clean</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {/* Review Summary */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Customer Reviews</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${i < Math.round(rating.average) ? "text-gold fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium text-navy">
                        {rating.average.toFixed(1)} out of 5
                      </span>
                      <span className="text-gray-500">
                        ({rating.count} {rating.count === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 md:mt-0 px-6 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Write a Review
                  </button>
                </div>

                {/* Success Message */}
                {reviewSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Thank you for your review! It has been submitted successfully.
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-8 p-6 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-navy mb-4">Write Your Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <Label>Your Rating</Label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= newReview.rating
                                    ? "text-gold fill-current"
                                    : "text-gray-300"
                                } hover:text-gold transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reviewTitle">Review Title</Label>
                        <input
                          type="text"
                          id="reviewTitle"
                          required
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          placeholder="Summarize your experience"
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reviewContent">Your Review</Label>
                        <Textarea
                          id="reviewContent"
                          required
                          rows={4}
                          value={newReview.content}
                          onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                          placeholder="Share your thoughts about this product..."
                          className="mt-1"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-navy mb-2">No reviews yet</h4>
                    <p className="text-gray-600 mb-4">Be the first to review this product!</p>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(true)}
                      className="text-gold hover:text-navy font-medium"
                    >
                      Write a Review
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-6 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-gold fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.verified && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-navy">{review.title}</h4>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{review.content}</p>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">By {review.userName}</span>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-gray-500 hover:text-navy transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-navy group-hover:text-gold transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-gray-600">${p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
