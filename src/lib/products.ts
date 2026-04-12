export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory: string;
  colors: string[];
  sizes: string[];
  featured?: boolean;
  new?: boolean;
}

export const categories = {
  clothing: {
    name: "Clothing",
    subcategories: ["Polos", "Dress Shirts", "T-Shirts", "Sweaters", "Vests"],
  },
  outerwear: {
    name: "Outerwear",
    subcategories: ["Insulated Jackets", "Rain Jackets", "Softshell", "Vests"],
  },
  fleece: {
    name: "Fleece Shop",
    subcategories: ["Full Zip", "Quarter Zip", "Pullover", "Vest"],
  },
  bags: {
    name: "Bags & Totes",
    subcategories: ["Tote Bags", "Backpacks", "Duffel Bags", "Laptop Bags"],
  },
  gifts: {
    name: "Business Gifts",
    subcategories: ["Drinkware", "Blankets", "Tech Accessories", "Gift Sets"],
  },
};

export const products: Product[] = [
  // Clothing - Polos
  {
    id: "polo-1",
    name: "Premium Performance Polo",
    description: "Moisture-wicking fabric with UV protection. Perfect for team uniforms.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=600&fit=crop",
    category: "clothing",
    subcategory: "Polos",
    colors: ["Navy", "White", "Black", "Red", "Forest Green"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    featured: true,
  },
  {
    id: "polo-2",
    name: "Classic Pique Polo",
    description: "Timeless cotton pique polo with embroidered logo placement.",
    price: 38.00,
    image: "https://images.unsplash.com/photo-1625910513413-5fc5b66ed12f?w=600&h=600&fit=crop",
    category: "clothing",
    subcategory: "Polos",
    colors: ["Navy", "White", "Black", "Gray"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  // Clothing - Dress Shirts
  {
    id: "shirt-1",
    name: "Wrinkle-Free Oxford Shirt",
    description: "Professional wrinkle-free oxford shirt perfect for the office.",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=600&fit=crop",
    category: "clothing",
    subcategory: "Dress Shirts",
    colors: ["White", "Light Blue", "Navy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    featured: true,
  },
  {
    id: "shirt-2",
    name: "Easy Care Dress Shirt",
    description: "Machine washable dress shirt that looks pressed all day.",
    price: 55.00,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    category: "clothing",
    subcategory: "Dress Shirts",
    colors: ["White", "Blue", "Gray"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  // Outerwear
  {
    id: "jacket-1",
    name: "Insulated Parka",
    description: "Premium insulated parka with your logo. Built for Maine winters.",
    price: 185.00,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    category: "outerwear",
    subcategory: "Insulated Jackets",
    colors: ["Navy", "Black", "Forest Green"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    featured: true,
  },
  {
    id: "jacket-2",
    name: "All-Weather Rain Jacket",
    description: "Waterproof, breathable rain jacket for any conditions.",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    category: "outerwear",
    subcategory: "Rain Jackets",
    colors: ["Navy", "Black", "Red", "Yellow"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    new: true,
  },
  {
    id: "jacket-3",
    name: "Softshell Jacket",
    description: "Versatile softshell jacket with wind and water resistance.",
    price: 125.00,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
    category: "outerwear",
    subcategory: "Softshell",
    colors: ["Navy", "Black", "Gray"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  // Fleece
  {
    id: "fleece-1",
    name: "Full-Zip Fleece Jacket",
    description: "Warm, lightweight fleece perfect for layering or standalone wear.",
    price: 75.00,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
    category: "fleece",
    subcategory: "Full Zip",
    colors: ["Navy", "Black", "Gray", "Forest Green"],
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    featured: true,
  },
  {
    id: "fleece-2",
    name: "Quarter-Zip Fleece Pullover",
    description: "Classic quarter-zip fleece with excellent logo placement.",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=600&fit=crop",
    category: "fleece",
    subcategory: "Quarter Zip",
    colors: ["Navy", "Black", "Charcoal", "Burgundy"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    new: true,
  },
  {
    id: "fleece-3",
    name: "Fleece Vest",
    description: "Lightweight fleece vest for active team members.",
    price: 55.00,
    image: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=600&fit=crop",
    category: "fleece",
    subcategory: "Vest",
    colors: ["Navy", "Black", "Gray"],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  // Bags
  {
    id: "bag-1",
    name: "Canvas Boat & Tote",
    description: "Iconic canvas tote with your embroidered logo.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: "bags",
    subcategory: "Tote Bags",
    colors: ["Natural/Navy", "Natural/Red", "Navy", "Black"],
    sizes: ["Small", "Medium", "Large"],
    featured: true,
  },
  {
    id: "bag-2",
    name: "Executive Laptop Backpack",
    description: "Professional backpack with padded laptop compartment.",
    price: 85.00,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: "bags",
    subcategory: "Backpacks",
    colors: ["Black", "Navy", "Gray"],
    sizes: ["One Size"],
  },
  {
    id: "bag-3",
    name: "Weekender Duffel Bag",
    description: "Versatile duffel bag for travel or gym use.",
    price: 75.00,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    category: "bags",
    subcategory: "Duffel Bags",
    colors: ["Navy", "Black", "Gray"],
    sizes: ["One Size"],
    new: true,
  },
  // Gifts
  {
    id: "gift-1",
    name: "Insulated Travel Tumbler",
    description: "20oz stainless steel tumbler with laser-engraved logo.",
    price: 28.00,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
    category: "gifts",
    subcategory: "Drinkware",
    colors: ["Navy", "Black", "White", "Red"],
    sizes: ["20oz"],
    featured: true,
  },
  {
    id: "gift-2",
    name: "Cozy Throw Blanket",
    description: "Soft fleece throw blanket with embroidered logo.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    category: "gifts",
    subcategory: "Blankets",
    colors: ["Navy", "Gray", "Cream"],
    sizes: ["50x60"],
  },
  {
    id: "gift-3",
    name: "Premium Gift Set",
    description: "Tumbler, blanket, and notebook set in gift box.",
    price: 95.00,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=600&fit=crop",
    category: "gifts",
    subcategory: "Gift Sets",
    colors: ["Navy", "Black"],
    sizes: ["One Size"],
    new: true,
  },
];

export const volumeDiscounts = [
  { minQty: 24, maxQty: 47, discount: 5, label: "5% Off" },
  { minQty: 48, maxQty: 71, discount: 10, label: "10% Off" },
  { minQty: 72, maxQty: 143, discount: 15, label: "15% Off" },
  { minQty: 144, maxQty: Infinity, discount: 20, label: "20% Off" },
];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.new);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
