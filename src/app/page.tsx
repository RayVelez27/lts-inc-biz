"use client";

import Link from "next/link";
import {
  ArrowRight,
  Star,
  Check,
  Shield,
  Award,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Hero Section
function Hero() {
  return (
    <section className="relative bg-navy overflow-hidden">
      <div className="hero-pattern absolute inset-0" />
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white space-y-6">
            <p className="text-gold uppercase tracking-wider text-sm font-medium">
              LT's Embroidery - The Fabric of Maine
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover New Ways to
              <span className="text-gold"> Outfit Your Team</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              At LT's Business, we have the gear and gifts your staff will love and appreciate. Premium embroidery and screen printing, crafted right here in Maine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors"
              >
                Shop Now <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-navy transition-colors"
              >
                Free Samples
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg overflow-hidden aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop"
                    alt="Business professional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/10 rounded-lg overflow-hidden aspect-[4/5]">
                  <img
                    src="https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&h=500&fit=crop"
                    alt="Team apparel"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Slant bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }} />
    </section>
  );
}

// Product Categories Section
function ProductCategories() {
  const categories = [
    {
      title: "Fleece Layers for Team Players",
      subtitle: "Customize Fleece Layers",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop",
      href: "/products?category=fleece",
    },
    {
      title: "A Refined Team Look",
      subtitle: "Customize Business Shirts",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&h=750&fit=crop",
      href: "/products?category=clothing&subcategory=Dress%20Shirts",
    },
    {
      title: "Company Pride, Rain and Shine",
      subtitle: "Customize Wind & Rain Jackets",
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=750&fit=crop",
      href: "/products?category=outerwear",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-lg aspect-[4/5] shadow-lg hover:shadow-xl transition-shadow"
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">{cat.title}</h3>
                <p className="text-gold underline group-hover:text-gold-light transition-colors">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Products Section
function FeaturedProducts() {
  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop"
              alt="Insulated outerwear"
              className="w-full aspect-square object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Warm Thanks, Well Earned
            </h2>
            <p className="text-gray-600 text-lg">
              Celebrate your team with premium outerwear, featuring your brand's logo, built for the chilly days ahead.
            </p>
            <Link
              href="/products?category=outerwear&subcategory=Insulated%20Jackets"
              className="inline-flex items-center px-6 py-3 border-2 border-navy text-navy font-semibold rounded-md hover:bg-navy hover:text-white transition-colors"
            >
              Shop Insulated Outerwear
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center mt-16">
          <div className="space-y-6 order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Team Appreciation, 9 to 5 and Beyond
            </h2>
            <p className="text-gray-600 text-lg">
              Always made with exceptional quality and embroidered with your business logo, these gifts will enhance every off-the-clock activity.
            </p>
            <Link
              href="/products?category=gifts"
              className="inline-flex items-center px-6 py-3 border-2 border-navy text-navy font-semibold rounded-md hover:bg-navy hover:text-white transition-colors"
            >
              Logo-Ready Team Gift Ideas
            </Link>
          </div>
          <div className="relative rounded-lg overflow-hidden order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
              alt="Business gifts and bags"
              className="w-full aspect-square object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Services Section
function Services() {
  const services = [
    {
      title: "Embroidery",
      description: "Premium logo embroidery with precision stitching that lasts.",
      image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=450&fit=crop",
    },
    {
      title: "Screen Printing",
      description: "Vibrant, durable prints for your team apparel and promotions.",
      image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=450&fit=crop",
    },
    {
      title: "Sublimation",
      description: "Full-color, edge-to-edge designs that never fade or peel.",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=450&fit=crop",
    },
  ];

  return (
    <section className="py-16 bg-navy">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold uppercase tracking-wider text-sm font-medium mb-3">
            LT's Embroidery - The Fabric of Maine
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Understanding Our Branding Services
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Based right here in Maine, we know what local businesses need — from durable embroidery to sharp screen printing and deliver branded products crafted to represent your company with lasting quality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative rounded-lg overflow-hidden aspect-[4/3]"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-gray-300 text-sm">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Section
function Stats() {
  const stats = [
    { number: "34", label: "Years Serving Maine" },
    { number: "98+", label: "Local Businesses" },
    { number: "33+", label: "Charities Supported" },
    { number: "100%", label: "Maine Committed" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-navy mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Buying Guides Section
function BuyingGuides() {
  const guides = [
    {
      title: "Fleece Buying Guide",
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
      href: "/products?category=fleece",
    },
    {
      title: "Outerwear Buying Guide",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      href: "/products?category=outerwear",
    },
    {
      title: "Dress Shirt Buying Guide",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=400&fit=crop",
      href: "/products?category=clothing&subcategory=Dress%20Shirts",
    },
    {
      title: "Polo Buying Guide",
      image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=400&fit=crop",
      href: "/products?category=clothing&subcategory=Polos",
    },
  ];

  return (
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            More to Explore
          </h2>
          <p className="text-gray-600 italic max-w-2xl mx-auto">
            "We feel professional and confident when we wear our branded clothing with our logo on it."
          </p>
          <p className="text-gray-500 mt-2">— Western Maine Machines</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group"
            >
              <div className="relative rounded-lg overflow-hidden aspect-square mb-3">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-navy font-medium underline group-hover:text-gold transition-colors">
                {guide.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Banner
function FeaturesBanner() {
  return (
    <section className="py-12 bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-gold uppercase tracking-wider text-sm mb-2">Your Logo - Our Maine Craft</p>
          <h2 className="text-3xl md:text-4xl font-bold italic">
            The Best Brand for Your Brand
          </h2>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            <span>Reliable Service</span>
          </div>
          <span className="hidden md:block text-gold">—</span>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" />
            <span>Expert Customization</span>
          </div>
          <span className="hidden md:block text-gold">—</span>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-gold" />
            <span>Quality Products</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Testimonials
function Testimonials() {
  const testimonials = [
    {
      name: "Gary Vankleek",
      company: "Portland Tech",
      text: "Would highly recommend. The quality and service exceeded our expectations.",
      rating: 5,
    },
    {
      name: "Sarah Mitchell",
      company: "Maine Brewing Co",
      text: "LT's helped us outfit our entire team. The embroidery quality is outstanding.",
      rating: 5,
    },
    {
      name: "Michael Kane",
      company: "Coastal Properties",
      text: "Always there to answer my questions and deliver on time. True Maine quality.",
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-navy text-center mb-12">
          Recent Success Stories
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-lg p-6 shadow-md"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={`star-${testimonial.name}-${i}`}
                    className="w-5 h-5 text-gold fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">{testimonial.text}</p>
              <div>
                <p className="font-semibold text-navy">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter
function Newsletter() {
  return (
    <section className="py-16 bg-navy">
      <div className="max-w-4xl mx-auto px-4">
        <div className="md:flex items-center justify-between gap-8">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Sign up for our newsletter
            </h2>
            <p className="text-gray-300">
              Learn about exclusive sales, special offers and more.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gold min-w-[250px]"
            />
            <button
              type="button"
              className="px-6 py-3 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors whitespace-nowrap"
            >
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Partners Section
function Partners() {
  const partners = [
    {
      name: "City of Portland",
      logo: "https://ext.same-assets.com/3928788836/638063029.png",
    },
    {
      name: "Kittery Trading Post",
      logo: "https://ext.same-assets.com/3928788836/484075978.jpeg",
    },
    {
      name: "Central Maine Medical",
      logo: "https://ext.same-assets.com/3928788836/2611164629.png",
    },
    {
      name: "Maine Community Bank",
      logo: "https://ext.same-assets.com/3928788836/4154411984.png",
    },
  ];

  return (
    <section className="py-12 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-xl font-semibold text-navy text-center mb-8">
          Some of Our Trusted Maine Partners
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-12">
          {partners.map((partner) => (
            <div key={partner.name} className="text-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Banner
function CTABanner() {
  return (
    <section className="relative py-24 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=600&fit=crop')" }}>
      <div className="absolute inset-0 bg-navy/70" />
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <p className="text-gold uppercase tracking-wider text-sm font-medium mb-4">
          LT's Embroidery - The Fabric of Maine
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Let's Build Something Your Customers Will Love
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Get started with a free sample and see the Maine quality difference for yourself.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center px-8 py-4 bg-gold text-navy font-semibold rounded-md hover:bg-gold-light transition-colors text-lg"
        >
          Request Free Sample <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </section>
  );
}

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProductCategories />
      <FeaturedProducts />
      <Services />
      <Stats />
      <BuyingGuides />
      <FeaturesBanner />
      <Partners />
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
    </main>
  );
}
