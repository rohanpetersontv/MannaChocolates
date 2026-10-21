export interface ProductOption {
  name: string;
  choices: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  isComingSoon?: boolean;
  options: ProductOption[];
  /** Pricing matrix keyed by size (bars) or flavour (bites) → price or sub-object */
  pricingMatrix?: Record<string, Record<string, number> | number>;
}

/**
 * Resolves the unit price for a product given selected options.
 * For bars: looks up pricingMatrix[Size][Flavour]
 * For bites: looks up pricingMatrix[Flavour]
 * Falls back to product.price if no matrix defined.
 */
export function resolveProductPrice(
  product: Product,
  selectedOptions: Record<string, string>
): number | null {
  if (!product.pricingMatrix) return product.price;

  const size = selectedOptions['Size'];
  const flavour = selectedOptions['Flavour'];

  if (size && flavour) {
    // Bar pricing: matrix[size][flavour]
    const sizeEntry = product.pricingMatrix[size];
    if (sizeEntry && typeof sizeEntry === 'object' && flavour in sizeEntry) {
      return (sizeEntry as Record<string, number>)[flavour];
    }
  }

  if (flavour && !size) {
    // Bites pricing: matrix[flavour]
    const flavourEntry = product.pricingMatrix[flavour];
    if (typeof flavourEntry === 'number') return flavourEntry;
  }

  return product.price;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  name: string;
  selectedOptions: Record<string, string>;
  quantity: number;
  unitPrice: number | null;
}

export interface OrderForm {
  name: string;
  phone: string;
  orderType: 'Delivery' | 'Pickup';
  address: string;
  pincode: string;
  neededByDate: string; // YYYY-MM-DD
  notes: string;
}

export interface Settings {
  businessName: string;
  tagline: string;
  whatsappNumber: string | null;
  secondaryContactNumber?: string | null;
  instagramUrl?: string;
  instagramHandle?: string;
  freeDeliveryRadiusKm?: number | null;
  freeDeliveryPincodes?: string[];
  freeDeliveryAbove?: number | null;
  deliveryFee?: number | null;
  currencySymbol: string;
}

/**
 * Normalizes Indian phone number.
 * Accepts 10 digits, +91, 0 prefix, 91 prefix, and whitespace.
 * Returns 10-digit string if valid, or null if invalid.
 */
export function normalizeIndianPhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    return digits.slice(1);
  }
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    return digits.slice(2);
  }
  return null;
}

/**
 * Formats a price in Indian Rupees with comma separation (e.g. ₹1,250).
 * If price is null or undefined, returns null.
 */
export function formatIndianCurrency(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return null;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Calculates cart subtotal.
 * Returns null if ANY item in the cart has a null unitPrice.
 * Uses integer math (paise) to prevent floating-point errors.
 */
export function calculateCartSubtotal(items: CartItem[]): number | null {
  if (items.length === 0) return 0;
  let totalPaise = 0;
  for (const item of items) {
    if (item.unitPrice === null || item.unitPrice === undefined) {
      return null;
    }
    const itemPaise = Math.round(item.unitPrice * 100) * item.quantity;
    totalPaise += itemPaise;
  }
  return totalPaise / 100;
}

/**
 * Evaluates delivery eligibility and description for checkout.
 * Rule: Free within 10 km if pincode is in freeDeliveryPincodes, otherwise charges confirmed on WhatsApp.
 */
export function getDeliveryInfo(
  orderType: 'Delivery' | 'Pickup',
  pincode: string,
  settings: Partial<Settings>
): { isFree: boolean; note: string; fee: number | null } {
  if (orderType === 'Pickup') {
    return {
      isFree: true,
      note: 'Self pickup (no delivery charges)',
      fee: 0,
    };
  }

  const cleanPin = pincode ? pincode.trim() : '';
  const freePincodes = settings.freeDeliveryPincodes || [];
  const radius = settings.freeDeliveryRadiusKm || 10;

  // If 6-digit pincode entered and in freeDeliveryPincodes
  if (cleanPin.length === 6 && freePincodes.includes(cleanPin)) {
    return {
      isFree: true,
      note: `Free delivery (within ${radius} km)`,
      fee: 0,
    };
  }

  return {
    isFree: false,
    note: 'Delivery charges apply. We will confirm the amount on WhatsApp.',
    fee: null,
  };
}

/**
 * Calculates delivery fee based on order type, pincode, and settings.
 * Returns 0 for pickup or verified freeDeliveryPincodes; otherwise null (to be confirmed on WhatsApp).
 */
export function calculateDeliveryFee(
  orderType: 'Delivery' | 'Pickup',
  pincode: string,
  _subtotal?: number | null,
  settings?: Partial<Settings>
): number | null {
  if (orderType === 'Pickup') {
    return 0;
  }
  const cleanPin = pincode ? pincode.trim() : '';
  const freePincodes = settings?.freeDeliveryPincodes || [];
  if (cleanPin.length === 6 && freePincodes.includes(cleanPin)) {
    return 0;
  }
  return null;
}

/**
 * Formats date to "DD MMM YYYY".
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Builds the exact WhatsApp order text required by rule.
 */
export function buildWhatsAppMessage(
  form: OrderForm,
  items: CartItem[],
  subtotal: number | null,
  deliveryFee: number | null
): string {
  const lines: string[] = [];
  lines.push("Hello Manna Chocolates! I'd like to place an order.");
  lines.push('');
  lines.push(`Name: ${form.name.trim()}`);
  lines.push(`Phone: ${form.phone.trim()}`);
  lines.push(`Type: ${form.orderType}`);

  if (form.orderType === 'Delivery') {
    const addressPart = [form.address.trim(), form.pincode.trim()].filter(Boolean).join(', ');
    lines.push(`Address: ${addressPart}`);
  }

  lines.push(`Needed by: ${formatDisplayDate(form.neededByDate)}`);
  lines.push('');
  lines.push('Items:');

  items.forEach((item, index) => {
    const optValues = Object.values(item.selectedOptions).filter(Boolean);
    const optionsStr = optValues.length > 0 ? ` – ${optValues.join(', ')}` : '';
    const linePrice = item.unitPrice !== null ? formatIndianCurrency(item.unitPrice * item.quantity) : 'price to confirm';
    lines.push(`${index + 1}. ${item.name}${optionsStr} × ${item.quantity} – ${linePrice}`);
  });

  lines.push('');

  // Total calculation text
  if (subtotal !== null) {
    if (deliveryFee !== null && deliveryFee > 0) {
      const grandTotal = subtotal + deliveryFee;
      lines.push(`Total: ${formatIndianCurrency(grandTotal)} (incl. delivery ${formatIndianCurrency(deliveryFee)})`);
    } else if (deliveryFee === 0 && form.orderType === 'Delivery') {
      lines.push(`Total: ${formatIndianCurrency(subtotal)} (Free delivery)`);
    } else {
      lines.push(`Total: ${formatIndianCurrency(subtotal)}`);
    }
  } else {
    lines.push('Total: to be confirmed');
  }

  lines.push(`Notes: ${form.notes.trim() ? form.notes.trim() : 'None'}`);

  return lines.join('\n');
}

/**
 * Formats secondary phone number as "Call / WhatsApp: 63625 51322".
 */
export function formatContactDisplay(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
  if (tenDigits.length === 10) {
    return `Call / WhatsApp: ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }
  return `Call / WhatsApp: ${phone}`;
}

/**
 * Creates the full wa.me URL for the message.
 */
export function buildWhatsAppUrl(whatsappNumber: string | null | undefined, message: string): string | null {
  if (!whatsappNumber || !whatsappNumber.trim()) {
    return null;
  }
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const fullNumber = cleanNumber.startsWith('91') && cleanNumber.length === 12
    ? cleanNumber
    : (cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber);

  return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}
