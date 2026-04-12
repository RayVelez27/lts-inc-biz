/**
 * DecoNetwork API Integration
 *
 * This module handles integration with the DecoNetwork API for product
 * customization, order management, and design tools.
 */

// DecoNetwork API configuration
const DECO_API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_DECO_API_URL || 'https://api.deconetwork.com',
  apiKey: process.env.DECO_API_KEY || '',
  storeId: process.env.DECO_STORE_ID || '',
};

// Interface for authentication response
interface DecoAuthResponse {
  token: string;
  expires: number;
}

// Interface for customization options
export interface DecoCustomizationOptions {
  productId: string;
  designId?: string;
  colors?: string[];
  size?: string;
  quantity: number;
  locations?: {
    position: string;
    artwork?: string;
    text?: string;
  }[];
}

// Interface for product data
export interface DecoProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  colors: string[];
  sizes: string[];
  decorationMethods: string[];
  decorationAreas: {
    name: string;
    maxWidth: number;
    maxHeight: number;
  }[];
}

// Interface for decoration price quote
export interface DecoPriceQuote {
  basePrice: number;
  decorationPrice: number;
  quantityDiscount: number;
  totalPrice: number;
  breakdown: {
    item: string;
    price: number;
  }[];
}

/**
 * DecoNetwork API Client
 */
export class DecoNetworkClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private apiKey: string = DECO_API_CONFIG.apiKey,
    private storeId: string = DECO_API_CONFIG.storeId,
    private baseUrl: string = DECO_API_CONFIG.baseUrl
  ) {}

  /**
   * Authenticate with the DecoNetwork API
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          storeId: this.storeId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data: DecoAuthResponse = await response.json();
      this.token = data.token;
      this.tokenExpiry = data.expires;
      return this.token;
    } catch (error) {
      console.error('DecoNetwork authentication error:', error);
      throw error;
    }
  }

  /**
   * Make an authenticated request to the DecoNetwork API
   */
  private async request<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
    const token = await this.authenticate();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        ...(data && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`DecoNetwork API error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get a list of available products
   */
  async getProducts(): Promise<DecoProduct[]> {
    return this.request<DecoProduct[]>('/products');
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<DecoProduct> {
    return this.request<DecoProduct>(`/products/${productId}`);
  }

  /**
   * Get a price quote for a customized product
   */
  async getPriceQuote(options: DecoCustomizationOptions): Promise<DecoPriceQuote> {
    return this.request<DecoPriceQuote>('/quote', 'POST', options);
  }

  /**
   * Create a new design in the DecoNetwork system
   */
  async createDesign(
    productId: string,
    designData: {
      name: string;
      artwork?: string;
      text?: string;
      font?: string;
      colors?: string[];
    }
  ): Promise<{ designId: string; previewUrl: string }> {
    return this.request('/designs', 'POST', {
      productId,
      ...designData,
    });
  }

  /**
   * Add a customized product to the shopping cart
   */
  async addToCart(options: DecoCustomizationOptions): Promise<{ cartItemId: string }> {
    return this.request('/cart/add', 'POST', options);
  }

  /**
   * Submit an order to DecoNetwork
   */
  async submitOrder(
    cartItems: string[],
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    shippingAddress: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    },
    paymentInfo?: {
      method: string;
      transactionId?: string;
    }
  ): Promise<{ orderId: string; status: string }> {
    return this.request('/orders', 'POST', {
      cartItems,
      customer,
      shippingAddress,
      paymentInfo,
    });
  }

  /**
   * Get the status of an existing order
   */
  async getOrderStatus(orderId: string): Promise<{
    orderId: string;
    status: string;
    items: {
      productId: string;
      quantity: number;
      status: string;
    }[];
  }> {
    return this.request(`/orders/${orderId}`);
  }

  /**
   * Get the URL for the customization interface
   */
  getCustomizerUrl(productId: string, designId?: string): string {
    const params = new URLSearchParams({
      storeId: this.storeId,
      productId,
      ...(designId && { designId }),
      returnUrl: typeof window !== 'undefined' ? window.location.href : '',
    });

    return `${this.baseUrl}/customize?${params.toString()}`;
  }
}

// Export a singleton instance for use throughout the app
export const decoNetworkClient = new DecoNetworkClient();

// Utility function to format a price from the DecoNetwork API
export const formatDecoPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
