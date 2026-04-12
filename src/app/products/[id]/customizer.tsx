"use client";

import { useState, useEffect } from "react";
import {
  decoNetworkClient,
  DecoCustomizationOptions,
  formatDecoPrice,
  type DecoPriceQuote
} from "@/lib/deco-network";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { Loader2, ExternalLink, Edit } from "lucide-react";

interface ProductCustomizerProps {
  productId: string;
  productName: string;
  basePrice: number;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export default function ProductCustomizer({
  productId,
  productName,
  basePrice,
  selectedSize,
  selectedColor,
  quantity,
}: ProductCustomizerProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [priceQuote, setPriceQuote] = useState<DecoPriceQuote | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Prepare customization options based on current selections
  const getCustomizationOptions = (): DecoCustomizationOptions => {
    return {
      productId,
      size: selectedSize,
      colors: [selectedColor],
      quantity,
      ...(designId && { designId }),
      locations: [],
    };
  };

  // Get price quote when options change
  useEffect(() => {
    const fetchPriceQuote = async () => {
      if (designId) {
        setIsLoading(true);
        try {
          const options = getCustomizationOptions();
          const quote = await decoNetworkClient.getPriceQuote(options);
          setPriceQuote(quote);
        } catch (error) {
          console.error("Error fetching price quote:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPriceQuote();
  }, [designId, selectedSize, selectedColor, quantity]);

  // Function to open the customizer in a new window
  const openCustomizer = () => {
    setCustomizationOpen(true);
    const customizerUrl = decoNetworkClient.getCustomizerUrl(productId, designId || undefined);

    // Open the customizer in a popup window
    const customizerWindow = window.open(
      customizerUrl,
      "DecoNetworkCustomizer",
      "width=1200,height=800,top=50,left=50"
    );

    // Poll for design ID from the customizer window
    const checkForDesignId = setInterval(() => {
      try {
        // Check if the window location contains a design ID
        if (customizerWindow && customizerWindow.location.href.includes("designId=")) {
          clearInterval(checkForDesignId);
          const url = new URL(customizerWindow.location.href);
          const newDesignId = url.searchParams.get("designId");

          if (newDesignId) {
            setDesignId(newDesignId);
            setPreviewImageUrl(`${process.env.NEXT_PUBLIC_DECO_API_URL}/designs/${newDesignId}/preview`);
          }

          customizerWindow.close();
          setCustomizationOpen(false);
        }
      } catch (e) {
        // Cross-origin errors will occur while the customizer is open
        // This is normal and we can ignore them
      }
    }, 1000);

    // Clean up interval if the window is closed
    const checkIfClosed = setInterval(() => {
      if (customizerWindow && customizerWindow.closed) {
        clearInterval(checkForDesignId);
        clearInterval(checkIfClosed);
        setCustomizationOpen(false);
      }
    }, 1000);
  };

  // Function to add the customized item to cart
  const addCustomizedItemToCart = async () => {
    if (!designId) {
      // If no design yet, open the customizer
      openCustomizer();
      return;
    }

    setIsLoading(true);
    try {
      const options = getCustomizationOptions();
      const result = await decoNetworkClient.addToCart(options);

      // Add to local cart as well
      addItem({
        id: `${productId}-${designId}-${selectedSize}-${selectedColor}`,
        name: `${productName} (Customized)`,
        price: priceQuote?.totalPrice || basePrice,
        image: previewImageUrl || "",
        size: selectedSize,
        color: selectedColor,
        quantity,
        category: "custom",
        customizationInfo: {
          designId,
          cartItemId: result.cartItemId
        }
      });

      // Show success message or redirect
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Reset design when product options change significantly
  useEffect(() => {
    // Only reset if we already have a design
    if (designId) {
      setDesignId(null);
      setPreviewImageUrl(null);
    }
  }, [productId]); // Reset when product changes

  return (
    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
      <h3 className="text-lg font-semibold text-navy mb-2">
        Customization Options
      </h3>

      {!designId ? (
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">
            Add your logo or custom design to this product with our online customizer.
          </p>
          <Button
            onClick={openCustomizer}
            disabled={isLoading || customizationOpen}
            className="bg-gold hover:bg-gold-light text-navy font-semibold"
          >
            {customizationOpen ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Customizer Loading...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Start Customizing
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {previewImageUrl && (
              <div className="w-40 h-40 border rounded bg-white flex items-center justify-center p-2">
                <img
                  src={previewImageUrl}
                  alt="Design Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span>{formatDecoPrice(basePrice)}</span>
              </div>

              {priceQuote?.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{item.item}:</span>
                  <span>{formatDecoPrice(item.price)}</span>
                </div>
              ))}

              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Price:</span>
                <span>{formatDecoPrice(priceQuote?.totalPrice || basePrice)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={openCustomizer}
              variant="outline"
              className="flex-1"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Design
            </Button>

            <Button
              onClick={addCustomizedItemToCart}
              disabled={isLoading}
              className="flex-1 bg-gold hover:bg-gold-light text-navy"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
