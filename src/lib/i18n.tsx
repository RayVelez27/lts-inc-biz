"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "es" | "fr";

export interface Translations {
  [key: string]: string | Translations;
}

// English translations
const en: Translations = {
  common: {
    home: "Home",
    products: "Products",
    cart: "Cart",
    checkout: "Checkout",
    account: "Account",
    signIn: "Sign In",
    signOut: "Sign Out",
    search: "Search",
    shopNow: "Shop Now",
    addToCart: "Add to Cart",
    viewDetails: "View Details",
    contact: "Contact Us",
    about: "About Us",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "Back",
    next: "Next",
    submit: "Submit",
    required: "Required",
    optional: "Optional",
  },
  nav: {
    clothing: "Clothing",
    outerwear: "Outerwear",
    fleeceShop: "Fleece Shop",
    bagsTotes: "Bags & Totes",
    businessGifts: "Business Gifts",
    newArrivals: "New Arrivals",
    customerService: "Customer Service",
    volumeDiscounts: "Volume Discounts",
    seeDetails: "See Details",
  },
  hero: {
    readyForAnything: "Ready for Anything",
    discoverNewWays: "Discover New Ways to",
    outfitYourTeam: "Outfit Your Team",
    heroDescription: "At LT's Business, we have the gear and gifts your staff will love and appreciate. Premium embroidery and screen printing, crafted right here in Maine.",
    freeSamples: "Free Samples",
  },
  product: {
    price: "Price",
    color: "Color",
    size: "Size",
    quantity: "Quantity",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    addedToCart: "Added to Cart",
    selectSize: "Select Size",
    selectColor: "Select Color",
    productDetails: "Product Details",
    sizeAndFit: "Size & Fit",
    careInstructions: "Care Instructions",
    reviews: "Reviews",
    writeReview: "Write a Review",
    noReviews: "No reviews yet",
    beFirstReview: "Be the first to review this product!",
  },
  cart: {
    shoppingBag: "Shopping Bag",
    emptyCart: "Your bag is empty",
    continueShopping: "Continue Shopping",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    proceedToCheckout: "Proceed to Checkout",
    removeItem: "Remove Item",
    updateQuantity: "Update Quantity",
    promoCode: "Promo Code",
    applyCode: "Apply Code",
    discount: "Discount",
  },
  checkout: {
    shippingInfo: "Shipping Information",
    paymentInfo: "Payment Information",
    orderReview: "Order Review",
    placeOrder: "Place Order",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    city: "City",
    state: "State",
    zipCode: "ZIP Code",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    orderConfirmed: "Order Confirmed!",
    thankYou: "Thank you for your order",
    orderNumber: "Order Number",
  },
  account: {
    myAccount: "My Account",
    profile: "Profile",
    orders: "Orders",
    addresses: "Addresses",
    wishlist: "Wishlist",
    noOrders: "No orders yet",
    noAddresses: "No saved addresses",
    addAddress: "Add Address",
    createAccount: "Create Account",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
  },
  footer: {
    familyOwned: "Family owned and operated in Portland, Maine since 1991.",
    resources: "Resources",
    buyingGuides: "Buying Guides",
    wheresMyOrder: "Where's My Order",
    contactUs: "Contact Us",
    weAreOpen: "We are open",
    mondayFriday: "Monday - Friday",
    requestSample: "Request Free Sample",
    copyright: "LT's Inc is a registered trademark. Copyright 2026.",
  },
  validation: {
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 6 characters",
    passwordsNoMatch: "Passwords do not match",
  },
};

// Spanish translations
const es: Translations = {
  common: {
    home: "Inicio",
    products: "Productos",
    cart: "Carrito",
    checkout: "Pagar",
    account: "Cuenta",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión",
    search: "Buscar",
    shopNow: "Comprar Ahora",
    addToCart: "Agregar al Carrito",
    viewDetails: "Ver Detalles",
    contact: "Contáctenos",
    about: "Sobre Nosotros",
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    back: "Atrás",
    next: "Siguiente",
    submit: "Enviar",
    required: "Requerido",
    optional: "Opcional",
  },
  nav: {
    clothing: "Ropa",
    outerwear: "Ropa Exterior",
    fleeceShop: "Tienda de Polar",
    bagsTotes: "Bolsas",
    businessGifts: "Regalos Corporativos",
    newArrivals: "Novedades",
    customerService: "Servicio al Cliente",
    volumeDiscounts: "Descuentos por Volumen",
    seeDetails: "Ver Detalles",
  },
  hero: {
    readyForAnything: "Listos para Todo",
    discoverNewWays: "Descubre Nuevas Formas de",
    outfitYourTeam: "Vestir a Tu Equipo",
    heroDescription: "En LT's Business, tenemos el equipo y los regalos que su personal amará y apreciará. Bordado premium y serigrafía, elaborados aquí en Maine.",
    freeSamples: "Muestras Gratis",
  },
  product: {
    price: "Precio",
    color: "Color",
    size: "Talla",
    quantity: "Cantidad",
    inStock: "En Stock",
    outOfStock: "Agotado",
    lowStock: "Poco Stock",
    addedToCart: "Agregado al Carrito",
    selectSize: "Seleccionar Talla",
    selectColor: "Seleccionar Color",
    productDetails: "Detalles del Producto",
    sizeAndFit: "Talla y Ajuste",
    careInstructions: "Instrucciones de Cuidado",
    reviews: "Reseñas",
    writeReview: "Escribir una Reseña",
    noReviews: "Sin reseñas aún",
    beFirstReview: "¡Sé el primero en reseñar este producto!",
  },
  cart: {
    shoppingBag: "Bolsa de Compras",
    emptyCart: "Tu bolsa está vacía",
    continueShopping: "Continuar Comprando",
    subtotal: "Subtotal",
    shipping: "Envío",
    total: "Total",
    proceedToCheckout: "Proceder al Pago",
    removeItem: "Eliminar Artículo",
    updateQuantity: "Actualizar Cantidad",
    promoCode: "Código Promocional",
    applyCode: "Aplicar Código",
    discount: "Descuento",
  },
  checkout: {
    shippingInfo: "Información de Envío",
    paymentInfo: "Información de Pago",
    orderReview: "Revisar Pedido",
    placeOrder: "Realizar Pedido",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo Electrónico",
    phone: "Teléfono",
    address: "Dirección",
    city: "Ciudad",
    state: "Estado",
    zipCode: "Código Postal",
    cardNumber: "Número de Tarjeta",
    expiryDate: "Fecha de Vencimiento",
    cvv: "CVV",
    orderConfirmed: "¡Pedido Confirmado!",
    thankYou: "Gracias por su pedido",
    orderNumber: "Número de Pedido",
  },
  account: {
    myAccount: "Mi Cuenta",
    profile: "Perfil",
    orders: "Pedidos",
    addresses: "Direcciones",
    wishlist: "Lista de Deseos",
    noOrders: "Sin pedidos aún",
    noAddresses: "Sin direcciones guardadas",
    addAddress: "Agregar Dirección",
    createAccount: "Crear Cuenta",
    forgotPassword: "¿Olvidó su contraseña?",
    rememberMe: "Recordarme",
  },
  footer: {
    familyOwned: "Empresa familiar operando en Portland, Maine desde 1991.",
    resources: "Recursos",
    buyingGuides: "Guías de Compra",
    wheresMyOrder: "¿Dónde está mi pedido?",
    contactUs: "Contáctenos",
    weAreOpen: "Estamos abiertos",
    mondayFriday: "Lunes - Viernes",
    requestSample: "Solicitar Muestra Gratis",
    copyright: "LT's Inc es una marca registrada. Copyright 2026.",
  },
  validation: {
    emailRequired: "El correo electrónico es requerido",
    passwordRequired: "La contraseña es requerida",
    invalidEmail: "Correo electrónico inválido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    passwordsNoMatch: "Las contraseñas no coinciden",
  },
};

// French translations
const fr: Translations = {
  common: {
    home: "Accueil",
    products: "Produits",
    cart: "Panier",
    checkout: "Commander",
    account: "Compte",
    signIn: "Se Connecter",
    signOut: "Se Déconnecter",
    search: "Rechercher",
    shopNow: "Acheter Maintenant",
    addToCart: "Ajouter au Panier",
    viewDetails: "Voir les Détails",
    contact: "Nous Contacter",
    about: "À Propos",
    loading: "Chargement...",
    save: "Sauvegarder",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    close: "Fermer",
    back: "Retour",
    next: "Suivant",
    submit: "Soumettre",
    required: "Requis",
    optional: "Optionnel",
  },
  nav: {
    clothing: "Vêtements",
    outerwear: "Vêtements d'Extérieur",
    fleeceShop: "Boutique Polaire",
    bagsTotes: "Sacs",
    businessGifts: "Cadeaux d'Entreprise",
    newArrivals: "Nouveautés",
    customerService: "Service Client",
    volumeDiscounts: "Remises sur Volume",
    seeDetails: "Voir les Détails",
  },
  hero: {
    readyForAnything: "Prêt pour Tout",
    discoverNewWays: "Découvrez de Nouvelles Façons de",
    outfitYourTeam: "Habiller Votre Équipe",
    heroDescription: "Chez LT's Business, nous avons l'équipement et les cadeaux que votre personnel adorera. Broderie premium et sérigraphie, fabriqués ici dans le Maine.",
    freeSamples: "Échantillons Gratuits",
  },
  product: {
    price: "Prix",
    color: "Couleur",
    size: "Taille",
    quantity: "Quantité",
    inStock: "En Stock",
    outOfStock: "Rupture de Stock",
    lowStock: "Stock Faible",
    addedToCart: "Ajouté au Panier",
    selectSize: "Sélectionner la Taille",
    selectColor: "Sélectionner la Couleur",
    productDetails: "Détails du Produit",
    sizeAndFit: "Taille et Coupe",
    careInstructions: "Instructions d'Entretien",
    reviews: "Avis",
    writeReview: "Écrire un Avis",
    noReviews: "Pas encore d'avis",
    beFirstReview: "Soyez le premier à évaluer ce produit!",
  },
  cart: {
    shoppingBag: "Panier",
    emptyCart: "Votre panier est vide",
    continueShopping: "Continuer les Achats",
    subtotal: "Sous-total",
    shipping: "Livraison",
    total: "Total",
    proceedToCheckout: "Passer à la Caisse",
    removeItem: "Supprimer l'Article",
    updateQuantity: "Mettre à Jour la Quantité",
    promoCode: "Code Promo",
    applyCode: "Appliquer le Code",
    discount: "Remise",
  },
  checkout: {
    shippingInfo: "Informations de Livraison",
    paymentInfo: "Informations de Paiement",
    orderReview: "Vérification de la Commande",
    placeOrder: "Passer la Commande",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    address: "Adresse",
    city: "Ville",
    state: "État/Province",
    zipCode: "Code Postal",
    cardNumber: "Numéro de Carte",
    expiryDate: "Date d'Expiration",
    cvv: "CVV",
    orderConfirmed: "Commande Confirmée!",
    thankYou: "Merci pour votre commande",
    orderNumber: "Numéro de Commande",
  },
  account: {
    myAccount: "Mon Compte",
    profile: "Profil",
    orders: "Commandes",
    addresses: "Adresses",
    wishlist: "Liste de Souhaits",
    noOrders: "Pas encore de commandes",
    noAddresses: "Aucune adresse enregistrée",
    addAddress: "Ajouter une Adresse",
    createAccount: "Créer un Compte",
    forgotPassword: "Mot de passe oublié?",
    rememberMe: "Se souvenir de moi",
  },
  footer: {
    familyOwned: "Entreprise familiale basée à Portland, Maine depuis 1991.",
    resources: "Ressources",
    buyingGuides: "Guides d'Achat",
    wheresMyOrder: "Où est ma commande?",
    contactUs: "Nous Contacter",
    weAreOpen: "Nous sommes ouverts",
    mondayFriday: "Lundi - Vendredi",
    requestSample: "Demander un Échantillon Gratuit",
    copyright: "LT's Inc est une marque déposée. Copyright 2026.",
  },
  validation: {
    emailRequired: "L'email est requis",
    passwordRequired: "Le mot de passe est requis",
    invalidEmail: "Adresse email invalide",
    passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
    passwordsNoMatch: "Les mots de passe ne correspondent pas",
  },
};

const translations: Record<Language, Translations> = { en, es, fr };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem("lts-language") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split("-")[0] as Language;
      if (translations[browserLang]) {
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lts-language", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: Translations | string = translations[language];

    for (const k of keys) {
      if (typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
      }
    }

    return typeof value === "string" ? value : key;
  };

  const availableLanguages = [
    { code: "en" as Language, name: "English", flag: "🇺🇸" },
    { code: "es" as Language, name: "Español", flag: "🇪🇸" },
    { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
  ];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Language selector component
export function LanguageSelector({ className = "" }: { className?: string }) {
  const { language, setLanguage, availableLanguages } = useI18n();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className={`bg-transparent border border-gray-300 rounded px-2 py-1 text-sm ${className}`}
    >
      {availableLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
