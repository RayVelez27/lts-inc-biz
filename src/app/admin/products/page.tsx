"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Image as ImageIcon,
  Package,
  AlertTriangle,
} from "lucide-react";
import { products as defaultProducts, categories, type Product } from "@/lib/products";
import { getProductInventory, type InventoryItem } from "@/lib/inventory";
import { Label } from "@/components/ui/label";

export default function AdminProductsPage() {
  const router = useRouter();
  const [productList, setProductList] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: "clothing",
    subcategory: "",
    colors: [],
    sizes: [],
    featured: false,
    new: false,
  });

  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    // Check admin auth
    const adminAuth = localStorage.getItem("lts-admin-auth");
    if (adminAuth !== "true") {
      router.push("/admin");
      return;
    }

    // Load products (merge default with custom)
    const customProducts = JSON.parse(localStorage.getItem("lts-custom-products") || "[]");
    const allProducts = [...defaultProducts, ...customProducts];
    setProductList(allProducts);
  }, [router]);

  const filteredProducts = productList.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      category: "clothing",
      subcategory: "",
      colors: [],
      sizes: [],
      featured: false,
      new: false,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      alert("Name and price are required");
      return;
    }

    const customProducts = JSON.parse(localStorage.getItem("lts-custom-products") || "[]");

    if (editingProduct) {
      // Update existing
      if (defaultProducts.find((p) => p.id === editingProduct.id)) {
        // Can't edit default products, create a modified version
        alert("Cannot edit built-in products. Changes will be saved as a custom product.");
        const newProduct: Product = {
          ...formData,
          id: `custom-${Date.now()}`,
        } as Product;
        customProducts.push(newProduct);
      } else {
        // Edit custom product
        const index = customProducts.findIndex((p: Product) => p.id === editingProduct.id);
        if (index !== -1) {
          customProducts[index] = { ...formData, id: editingProduct.id };
        }
      }
    } else {
      // Add new
      const newProduct: Product = {
        ...formData,
        id: `custom-${Date.now()}`,
      } as Product;
      customProducts.push(newProduct);
    }

    localStorage.setItem("lts-custom-products", JSON.stringify(customProducts));
    setProductList([...defaultProducts, ...customProducts]);
    setShowModal(false);
  };

  const handleDelete = (productId: string) => {
    if (defaultProducts.find((p) => p.id === productId)) {
      alert("Cannot delete built-in products");
      return;
    }

    const customProducts = JSON.parse(localStorage.getItem("lts-custom-products") || "[]");
    const filtered = customProducts.filter((p: Product) => p.id !== productId);
    localStorage.setItem("lts-custom-products", JSON.stringify(filtered));
    setProductList([...defaultProducts, ...filtered]);
    setDeleteConfirm(null);
  };

  const addColor = () => {
    if (newColor && !formData.colors?.includes(newColor)) {
      setFormData({ ...formData, colors: [...(formData.colors || []), newColor] });
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      colors: formData.colors?.filter((c) => c !== color),
    });
  };

  const addSize = () => {
    if (newSize && !formData.sizes?.includes(newSize)) {
      setFormData({ ...formData, sizes: [...(formData.sizes || []), newSize] });
      setNewSize("");
    }
  };

  const removeSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter((s) => s !== size),
    });
  };

  const getInventoryStatus = (productId: string): { total: number; low: boolean } => {
    const inventory = getProductInventory(productId);
    const total = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const hasLowStock = inventory.some((item) => item.quantity <= item.lowStockThreshold);
    return { total, low: hasLowStock };
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
            <h1 className="text-2xl font-bold text-navy">Products</h1>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </header>

      <div className="p-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inventory = getInventoryStatus(product.id);
            const isCustom = product.id.startsWith("custom-");

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.new && (
                    <span className="absolute top-2 left-2 bg-gold text-navy text-xs px-2 py-1 rounded">
                      New
                    </span>
                  )}
                  {product.featured && (
                    <span className="absolute top-2 right-2 bg-navy text-white text-xs px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                  {inventory.low && (
                    <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">{product.subcategory}</p>
                      <h3 className="font-semibold text-navy">{product.name}</h3>
                    </div>
                    <p className="font-bold text-navy">${product.price.toFixed(2)}</p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{product.colors.length} colors</span>
                    <span>{product.sizes.length} sizes</span>
                    <span>{inventory.total} in stock</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(product.id)}
                        className="py-2 px-3 border border-red-300 text-red-500 rounded-md hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <select
                    id="subcategory"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="">Select subcategory</option>
                    {formData.category &&
                      categories[formData.category as keyof typeof categories]?.subcategories.map(
                        (sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        )
                      )}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label>Colors</Label>
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {formData.colors?.map((color) => (
                    <span
                      key={color}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {color}
                      <button type="button" onClick={() => removeColor(color)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <Label>Sizes</Label>
                <div className="flex flex-wrap gap-2 mt-1 mb-2">
                  {formData.sizes?.map((size) => (
                    <span
                      key={size}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {size}
                      <button type="button" onClick={() => removeSize(size)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add size"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-dark"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Flags */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Featured Product
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.new}
                    onChange={(e) => setFormData({ ...formData, new: e.target.checked })}
                    className="w-4 h-4"
                  />
                  New Arrival
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Delete Product?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
