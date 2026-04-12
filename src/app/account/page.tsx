"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/lib/wishlist-context";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  MapPin,
  Package,
  LogOut,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  Heart,
} from "lucide-react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

type TabType = "profile" | "orders" | "addresses" | "wishlist";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, login, register, logout, updateUser, addAddress, removeAddress } = useAuth();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  });

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
  });

  // Add address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "shipping" as "shipping" | "billing",
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    isDefault: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const success = await login(loginData.email, loginData.password);
    if (!success) {
      setError("Invalid email or password");
    }
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const success = await register({
      email: registerData.email,
      password: registerData.password,
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      company: registerData.company,
    });

    if (!success) {
      setError("Email already exists");
    }
    setIsSubmitting(false);
  };

  const handleUpdateProfile = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    setShowAddAddress(false);
    setNewAddress({
      type: "shipping",
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      isDefault: false,
    });
  };

  const startEditing = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company || "",
        phone: user.phone || "",
      });
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Show login/register if not authenticated
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Tab Toggle */}
            <div className="flex mb-8">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                }}
                className={`flex-1 py-3 text-center font-semibold transition-colors ${
                  authMode === "login"
                    ? "text-navy border-b-2 border-navy"
                    : "text-gray-500 border-b border-gray-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setError("");
                }}
                className={`flex-1 py-3 text-center font-semibold transition-colors ${
                  authMode === "register"
                    ? "text-navy border-b-2 border-navy"
                    : "text-gray-500 border-b border-gray-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remember me
                  </label>
                  <button type="button" className="text-gold hover:text-navy">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="regEmail">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="regEmail"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="company"
                      value={registerData.company}
                      onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="regPassword">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="regPassword"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}

            <div className="mt-6">
              <SocialLoginButtons
                mode={authMode}
                onSuccess={(provider, socialUser) => {
                  // Create/login user from social auth
                  const users = JSON.parse(localStorage.getItem("lts-users") || "[]");
                  let foundUser = users.find((u: { email: string }) => u.email === socialUser.email);

                  if (!foundUser) {
                    foundUser = {
                      id: `user-${Date.now()}`,
                      email: socialUser.email,
                      firstName: socialUser.name.split(" ")[0],
                      lastName: socialUser.name.split(" ").slice(1).join(" ") || "",
                      provider,
                      addresses: [],
                    };
                    users.push(foundUser);
                    localStorage.setItem("lts-users", JSON.stringify(users));
                  }

                  localStorage.setItem("lts-user", JSON.stringify(foundUser));
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Show account dashboard if authenticated
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">My Account</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-1">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "orders", label: "Orders", icon: Package },
                { id: "addresses", label: "Addresses", icon: MapPin },
                { id: "wishlist", label: "Wishlist", icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? "bg-gold/10 text-navy font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-navy">Profile Information</h2>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="flex items-center gap-2 text-gold hover:text-navy transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdateProfile();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editFirstName">First Name</Label>
                        <input
                          type="text"
                          id="editFirstName"
                          value={editData.firstName}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editLastName">Last Name</Label>
                        <input
                          type="text"
                          id="editLastName"
                          value={editData.lastName}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="editCompany">Company</Label>
                      <input
                        type="text"
                        id="editCompany"
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>

                    <div>
                      <Label htmlFor="editPhone">Phone</Label>
                      <input
                        type="tel"
                        id="editPhone"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium text-navy">{user.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium text-navy">{user.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-navy">{user.email}</p>
                    </div>
                    {user.company && (
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium text-navy">{user.company}</p>
                      </div>
                    )}
                    {user.phone && (
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-navy">{user.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Order History</h2>

                {/* Placeholder for orders */}
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-navy mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">
                    When you place an order, it will appear here.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                  >
                    Start Shopping
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-navy">Saved Addresses</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-navy mb-4">New Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <Label>Address Type</Label>
                        <div className="flex gap-4 mt-1">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={newAddress.type === "shipping"}
                              onChange={() => setNewAddress({ ...newAddress, type: "shipping" })}
                              className="mr-2"
                            />
                            Shipping
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              checked={newAddress.type === "billing"}
                              onChange={() => setNewAddress({ ...newAddress, type: "billing" })}
                              className="mr-2"
                            />
                            Billing
                          </label>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addrFirstName">First Name</Label>
                          <input
                            type="text"
                            id="addrFirstName"
                            required
                            value={newAddress.firstName}
                            onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addrLastName">Last Name</Label>
                          <input
                            type="text"
                            id="addrLastName"
                            required
                            value={newAddress.lastName}
                            onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="addrCompany">Company (Optional)</Label>
                        <input
                          type="text"
                          id="addrCompany"
                          value={newAddress.company}
                          onChange={(e) => setNewAddress({ ...newAddress, company: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address1">Address Line 1</Label>
                        <input
                          type="text"
                          id="address1"
                          required
                          value={newAddress.address1}
                          onChange={(e) => setNewAddress({ ...newAddress, address1: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                        <input
                          type="text"
                          id="address2"
                          value={newAddress.address2}
                          onChange={(e) => setNewAddress({ ...newAddress, address2: e.target.value })}
                          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <input
                            type="text"
                            id="city"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <input
                            type="text"
                            id="state"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip">ZIP Code</Label>
                          <input
                            type="text"
                            id="zip"
                            required
                            value={newAddress.zip}
                            onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                      </div>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                          className="mr-2"
                        />
                        Set as default address
                      </label>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {user.addresses.length === 0 && !showAddAddress ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-navy mb-2">No saved addresses</h3>
                    <p className="text-gray-600">
                      Add an address to make checkout faster.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border border-gray-200 rounded-lg relative"
                      >
                        {address.isDefault && (
                          <span className="absolute top-2 right-2 text-xs bg-gold text-navy px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                        <p className="font-medium text-navy">
                          {address.firstName} {address.lastName}
                        </p>
                        {address.company && (
                          <p className="text-gray-600">{address.company}</p>
                        )}
                        <p className="text-gray-600">{address.address1}</p>
                        {address.address2 && (
                          <p className="text-gray-600">{address.address2}</p>
                        )}
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.zip}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 capitalize">
                          {address.type} address
                        </p>
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="mt-2 flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-navy">My Wishlist</h2>
                  {wishlistItems.length > 0 && (
                    <Link href="/wishlist" className="text-gold hover:text-navy text-sm">
                      View Full Wishlist
                    </Link>
                  )}
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-navy mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">
                      Save items you love by clicking the heart icon.
                    </p>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
                    >
                      Browse Products
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {wishlistItems.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <Link href={`/products/${item.id}`}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link href={`/products/${item.id}`}>
                            <h3 className="font-medium text-navy hover:text-gold transition-colors">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-lg font-bold text-navy">${item.price.toFixed(2)}</p>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.id)}
                            className="mt-2 text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
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
      </div>

      <Footer />
    </main>
  );
}
