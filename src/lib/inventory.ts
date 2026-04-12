// Inventory Management System

export interface InventoryItem {
  productId: string;
  sku: string;
  size: string;
  color: string;
  quantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  lastRestocked?: string;
  reservedQuantity: number; // Items in carts but not purchased
}

export interface StockAlert {
  id: string;
  productId: string;
  sku: string;
  type: "low_stock" | "out_of_stock" | "reorder_needed";
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

// Initialize default inventory from products
export function initializeInventory(): void {
  if (typeof window === "undefined") return;

  const existing = localStorage.getItem("lts-inventory");
  if (existing) return;

  // Import products dynamically to avoid circular dependency
  const defaultInventory: InventoryItem[] = [
    // Polo-1
    { productId: "polo-1", sku: "POLO1-S-NAV", size: "S", color: "Navy", quantity: 50, lowStockThreshold: 10, reorderPoint: 20, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-M-NAV", size: "M", color: "Navy", quantity: 75, lowStockThreshold: 15, reorderPoint: 30, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-L-NAV", size: "L", color: "Navy", quantity: 100, lowStockThreshold: 20, reorderPoint: 40, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-XL-NAV", size: "XL", color: "Navy", quantity: 60, lowStockThreshold: 15, reorderPoint: 30, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-M-WHT", size: "M", color: "White", quantity: 45, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-L-WHT", size: "L", color: "White", quantity: 55, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "polo-1", sku: "POLO1-M-BLK", size: "M", color: "Black", quantity: 8, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 }, // Low stock

    // Shirt-1
    { productId: "shirt-1", sku: "SHIRT1-S-WHT", size: "S", color: "White", quantity: 30, lowStockThreshold: 8, reorderPoint: 20, reservedQuantity: 0 },
    { productId: "shirt-1", sku: "SHIRT1-M-WHT", size: "M", color: "White", quantity: 45, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "shirt-1", sku: "SHIRT1-L-WHT", size: "L", color: "White", quantity: 40, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "shirt-1", sku: "SHIRT1-M-BLU", size: "M", color: "Light Blue", quantity: 0, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 }, // Out of stock

    // Jacket-1
    { productId: "jacket-1", sku: "JACK1-M-NAV", size: "M", color: "Navy", quantity: 25, lowStockThreshold: 5, reorderPoint: 15, reservedQuantity: 0 },
    { productId: "jacket-1", sku: "JACK1-L-NAV", size: "L", color: "Navy", quantity: 30, lowStockThreshold: 5, reorderPoint: 15, reservedQuantity: 0 },
    { productId: "jacket-1", sku: "JACK1-XL-NAV", size: "XL", color: "Navy", quantity: 20, lowStockThreshold: 5, reorderPoint: 15, reservedQuantity: 0 },
    { productId: "jacket-1", sku: "JACK1-L-BLK", size: "L", color: "Black", quantity: 3, lowStockThreshold: 5, reorderPoint: 15, reservedQuantity: 0 }, // Low stock

    // Fleece-1
    { productId: "fleece-1", sku: "FLEE1-S-NAV", size: "S", color: "Navy", quantity: 35, lowStockThreshold: 8, reorderPoint: 20, reservedQuantity: 0 },
    { productId: "fleece-1", sku: "FLEE1-M-NAV", size: "M", color: "Navy", quantity: 50, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "fleece-1", sku: "FLEE1-L-NAV", size: "L", color: "Navy", quantity: 45, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 },
    { productId: "fleece-1", sku: "FLEE1-M-GRY", size: "M", color: "Gray", quantity: 5, lowStockThreshold: 10, reorderPoint: 25, reservedQuantity: 0 }, // Low stock

    // Bag-1
    { productId: "bag-1", sku: "BAG1-MED-NAV", size: "Medium", color: "Natural/Navy", quantity: 100, lowStockThreshold: 20, reorderPoint: 50, reservedQuantity: 0 },
    { productId: "bag-1", sku: "BAG1-LRG-NAV", size: "Large", color: "Natural/Navy", quantity: 80, lowStockThreshold: 15, reorderPoint: 40, reservedQuantity: 0 },

    // Gift-1
    { productId: "gift-1", sku: "GIFT1-20OZ-NAV", size: "20oz", color: "Navy", quantity: 200, lowStockThreshold: 40, reorderPoint: 80, reservedQuantity: 0 },
    { productId: "gift-1", sku: "GIFT1-20OZ-BLK", size: "20oz", color: "Black", quantity: 150, lowStockThreshold: 30, reorderPoint: 60, reservedQuantity: 0 },
  ];

  localStorage.setItem("lts-inventory", JSON.stringify(defaultInventory));
}

// Get all inventory
export function getInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  initializeInventory();
  return JSON.parse(localStorage.getItem("lts-inventory") || "[]");
}

// Save inventory
export function saveInventory(inventory: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lts-inventory", JSON.stringify(inventory));
}

// Get inventory for a specific product
export function getProductInventory(productId: string): InventoryItem[] {
  return getInventory().filter((item) => item.productId === productId);
}

// Get specific SKU inventory
export function getSkuInventory(sku: string): InventoryItem | undefined {
  return getInventory().find((item) => item.sku === sku);
}

// Check stock availability
export function checkStock(
  productId: string,
  size: string,
  color: string,
  quantity: number
): { available: boolean; currentStock: number; message?: string } {
  const inventory = getInventory();
  const item = inventory.find(
    (i) => i.productId === productId && i.size === size && i.color === color
  );

  if (!item) {
    return { available: true, currentStock: 999, message: "Unlimited stock" }; // Default to available if not tracked
  }

  const availableQty = item.quantity - item.reservedQuantity;

  if (availableQty <= 0) {
    return { available: false, currentStock: 0, message: "Out of stock" };
  }

  if (availableQty < quantity) {
    return {
      available: false,
      currentStock: availableQty,
      message: `Only ${availableQty} available`,
    };
  }

  return { available: true, currentStock: availableQty };
}

// Reserve stock (when adding to cart)
export function reserveStock(
  productId: string,
  size: string,
  color: string,
  quantity: number
): boolean {
  const inventory = getInventory();
  const index = inventory.findIndex(
    (i) => i.productId === productId && i.size === size && i.color === color
  );

  if (index === -1) return true; // Not tracked, allow

  const item = inventory[index];
  const availableQty = item.quantity - item.reservedQuantity;

  if (availableQty < quantity) return false;

  inventory[index].reservedQuantity += quantity;
  saveInventory(inventory);
  return true;
}

// Release reserved stock (when removing from cart)
export function releaseStock(
  productId: string,
  size: string,
  color: string,
  quantity: number
): void {
  const inventory = getInventory();
  const index = inventory.findIndex(
    (i) => i.productId === productId && i.size === size && i.color === color
  );

  if (index === -1) return;

  inventory[index].reservedQuantity = Math.max(0, inventory[index].reservedQuantity - quantity);
  saveInventory(inventory);
}

// Deduct stock (when order is placed)
export function deductStock(
  productId: string,
  size: string,
  color: string,
  quantity: number
): void {
  const inventory = getInventory();
  const index = inventory.findIndex(
    (i) => i.productId === productId && i.size === size && i.color === color
  );

  if (index === -1) return;

  inventory[index].quantity = Math.max(0, inventory[index].quantity - quantity);
  inventory[index].reservedQuantity = Math.max(0, inventory[index].reservedQuantity - quantity);
  saveInventory(inventory);

  // Check for alerts
  checkAndCreateAlerts(inventory[index]);
}

// Add stock (restock)
export function addStock(sku: string, quantity: number): void {
  const inventory = getInventory();
  const index = inventory.findIndex((i) => i.sku === sku);

  if (index === -1) return;

  inventory[index].quantity += quantity;
  inventory[index].lastRestocked = new Date().toISOString();
  saveInventory(inventory);

  // Clear any related alerts
  clearAlertForSku(sku);
}

// Update inventory item
export function updateInventoryItem(sku: string, updates: Partial<InventoryItem>): void {
  const inventory = getInventory();
  const index = inventory.findIndex((i) => i.sku === sku);

  if (index !== -1) {
    inventory[index] = { ...inventory[index], ...updates };
    saveInventory(inventory);
  }
}

// Get stock alerts
export function getStockAlerts(): StockAlert[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("lts-stock-alerts") || "[]");
}

// Save stock alerts
export function saveStockAlerts(alerts: StockAlert[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("lts-stock-alerts", JSON.stringify(alerts));
}

// Check and create alerts
export function checkAndCreateAlerts(item: InventoryItem): void {
  const alerts = getStockAlerts();
  const existingAlert = alerts.find((a) => a.sku === item.sku && !a.acknowledged);

  if (existingAlert) return; // Already has an active alert

  let alert: StockAlert | null = null;

  if (item.quantity <= 0) {
    alert = {
      id: `alert-${Date.now()}`,
      productId: item.productId,
      sku: item.sku,
      type: "out_of_stock",
      message: `${item.sku} is OUT OF STOCK`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };
  } else if (item.quantity <= item.lowStockThreshold) {
    alert = {
      id: `alert-${Date.now()}`,
      productId: item.productId,
      sku: item.sku,
      type: "low_stock",
      message: `${item.sku} is low on stock (${item.quantity} remaining)`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };
  } else if (item.quantity <= item.reorderPoint) {
    alert = {
      id: `alert-${Date.now()}`,
      productId: item.productId,
      sku: item.sku,
      type: "reorder_needed",
      message: `${item.sku} should be reordered (${item.quantity} remaining)`,
      createdAt: new Date().toISOString(),
      acknowledged: false,
    };
  }

  if (alert) {
    alerts.push(alert);
    saveStockAlerts(alerts);
  }
}

// Clear alert for SKU
export function clearAlertForSku(sku: string): void {
  const alerts = getStockAlerts().filter((a) => a.sku !== sku);
  saveStockAlerts(alerts);
}

// Acknowledge alert
export function acknowledgeAlert(alertId: string): void {
  const alerts = getStockAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);
  if (index !== -1) {
    alerts[index].acknowledged = true;
    saveStockAlerts(alerts);
  }
}

// Get low stock items
export function getLowStockItems(): InventoryItem[] {
  return getInventory().filter((item) => item.quantity <= item.lowStockThreshold);
}

// Get out of stock items
export function getOutOfStockItems(): InventoryItem[] {
  return getInventory().filter((item) => item.quantity <= 0);
}

// Generate stock report
export function generateStockReport(): {
  totalItems: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  reorderNeededCount: number;
} {
  const inventory = getInventory();
  return {
    totalItems: inventory.length,
    totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
    lowStockCount: inventory.filter((i) => i.quantity <= i.lowStockThreshold && i.quantity > 0).length,
    outOfStockCount: inventory.filter((i) => i.quantity <= 0).length,
    reorderNeededCount: inventory.filter((i) => i.quantity <= i.reorderPoint).length,
  };
}

// Initialize alerts on load
export function initializeAlerts(): void {
  const inventory = getInventory();
  inventory.forEach((item) => checkAndCreateAlerts(item));
}
