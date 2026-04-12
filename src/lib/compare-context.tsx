"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "./products";

interface CompareContextType {
  items: Product[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isComparing: (productId: string) => boolean;
  canAdd: boolean;
  maxItems: number;
}

const MAX_COMPARE_ITEMS = 4;

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const addItem = (product: Product): boolean => {
    if (items.length >= MAX_COMPARE_ITEMS) {
      return false;
    }
    if (items.some((item) => item.id === product.id)) {
      return false;
    }
    setItems([...items, product]);
    return true;
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.id !== productId));
  };

  const clearAll = () => {
    setItems([]);
  };

  const isComparing = (productId: string) => {
    return items.some((item) => item.id === productId);
  };

  const canAdd = items.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearAll,
        isComparing,
        canAdd,
        maxItems: MAX_COMPARE_ITEMS,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
