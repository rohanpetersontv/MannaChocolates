import { describe, it, expect } from 'vitest';
import {
  normalizeIndianPhone,
  formatIndianCurrency,
  calculateCartSubtotal,
  calculateDeliveryFee,
  getDeliveryInfo,
  formatContactDisplay,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  resolveProductPrice,
  Product,
  CartItem,
  OrderForm,
} from '../utils/helpers';

describe('1. Phone Normalization (Indian Numbers)', () => {
  it('accepts standard 10-digit numbers starting with 6-9', () => {
    expect(normalizeIndianPhone('9876543210')).toBe('9876543210');
    expect(normalizeIndianPhone('8123456789')).toBe('8123456789');
    expect(normalizeIndianPhone('7000123456')).toBe('7000123456');
    expect(normalizeIndianPhone('6234567890')).toBe('6234567890');
  });

  it('cleans +91 prefix, spaces, and hyphens', () => {
    expect(normalizeIndianPhone('+91 98765 43210')).toBe('9876543210');
    expect(normalizeIndianPhone('+91-98765-43210')).toBe('9876543210');
    expect(normalizeIndianPhone('919876543210')).toBe('9876543210');
  });

  it('cleans leading 0 trunk prefix', () => {
    expect(normalizeIndianPhone('09876543210')).toBe('9876543210');
  });

  it('rejects invalid or too short/long numbers', () => {
    expect(normalizeIndianPhone('')).toBeNull();
    expect(normalizeIndianPhone('12345')).toBeNull();
    expect(normalizeIndianPhone('5555555555')).toBeNull(); // starts with 5
    expect(normalizeIndianPhone('98765432109999')).toBeNull();
    expect(normalizeIndianPhone('abcdefghij')).toBeNull();
  });
});

describe('2. Price Formatting (Indian Currency Style)', () => {
  it('formats numbers with ₹ and Indian grouping', () => {
    expect(formatIndianCurrency(1250)).toBe('₹1,250');
    expect(formatIndianCurrency(80)).toBe('₹80');
    expect(formatIndianCurrency(150000)).toBe('₹1,50,000');
  });

  it('returns null when price is null, undefined, or NaN', () => {
    expect(formatIndianCurrency(null)).toBeNull();
    expect(formatIndianCurrency(undefined)).toBeNull();
    expect(formatIndianCurrency(NaN)).toBeNull();
  });
});

describe('3. Cart Total with and without null prices', () => {
  const itemWithPrice1: CartItem = {
    id: '1',
    productId: 'bar-1',
    name: '50g Bar',
    selectedOptions: {},
    quantity: 2,
    unitPrice: 80,
  };

  const itemWithPrice2: CartItem = {
    id: '2',
    productId: 'bar-2',
    name: '100g Bar',
    selectedOptions: {},
    quantity: 1,
    unitPrice: 150,
  };

  const itemWithoutPrice: CartItem = {
    id: '3',
    productId: 'bites-1',
    name: 'Chocolate Bites',
    selectedOptions: {},
    quantity: 5,
    unitPrice: null, // Price on WhatsApp
  };

  it('calculates total correctly when all items have prices', () => {
    const total = calculateCartSubtotal([itemWithPrice1, itemWithPrice2]);
    expect(total).toBe(310);
  });

  it('returns null if any item has null price (requires WhatsApp quote)', () => {
    const total = calculateCartSubtotal([itemWithPrice1, itemWithoutPrice]);
    expect(total).toBeNull();
  });

  it('returns 0 for empty cart', () => {
    expect(calculateCartSubtotal([])).toBe(0);
  });
});

describe('4. Delivery Rule Logic (10km / Pincodes)', () => {
  it('returns 0 for Pickup orders regardless of settings', () => {
    expect(calculateDeliveryFee('Pickup', '560001', 100, { deliveryFee: 50 })).toBe(0);
    const info = getDeliveryInfo('Pickup', '560001', { deliveryFee: 50 });
    expect(info.isFree).toBe(true);
  });

  it('recognizes pincodes in freeDeliveryPincodes as free delivery within 10 km', () => {
    const settings = {
      freeDeliveryRadiusKm: 10,
      freeDeliveryPincodes: ['560001', '560002'],
      deliveryFee: null,
    };
    const info = getDeliveryInfo('Delivery', '560001', settings);
    expect(info.isFree).toBe(true);
    expect(info.note).toBe('Free delivery (within 10 km)');
    expect(calculateDeliveryFee('Delivery', '560001', null, settings)).toBe(0);
  });

  it('shows delivery charges apply note when pincode is not in freeDeliveryPincodes', () => {
    const settings = {
      freeDeliveryRadiusKm: 10,
      freeDeliveryPincodes: ['560001'],
      deliveryFee: null,
    };
    const info = getDeliveryInfo('Delivery', '560099', settings);
    expect(info.isFree).toBe(false);
    expect(info.note).toBe('Delivery charges apply. We will confirm the amount on WhatsApp.');
    expect(calculateDeliveryFee('Delivery', '560099', null, settings)).toBeNull();
  });

  it('shows delivery charges note when freeDeliveryPincodes is empty', () => {
    const settings = {
      freeDeliveryRadiusKm: 10,
      freeDeliveryPincodes: [],
      deliveryFee: null,
    };
    const info = getDeliveryInfo('Delivery', '560001', settings);
    expect(info.isFree).toBe(false);
    expect(info.note).toBe('Delivery charges apply. We will confirm the amount on WhatsApp.');
  });
});

describe('5. Contact Formatting', () => {
  it('formats secondary contact number as "Call / WhatsApp: 63625 51322"', () => {
    expect(formatContactDisplay('916362551322')).toBe('Call / WhatsApp: 63625 51322');
    expect(formatContactDisplay('6362551322')).toBe('Call / WhatsApp: 63625 51322');
  });
});

describe('6. WhatsApp Message Builder & Link Generator', () => {
  const form: OrderForm = {
    name: 'Customer Name',
    phone: '9876543210',
    orderType: 'Delivery',
    address: 'Street Address',
    pincode: '560001',
    neededByDate: '2026-10-25',
    notes: 'None',
  };

  const items: CartItem[] = [
    {
      id: 'item-1',
      productId: 'bar-50g',
      name: '50g Chocolate Bar',
      selectedOptions: { base: 'Dark Chocolate', flavour: 'Fruit & Nuts' },
      quantity: 2,
      unitPrice: null,
    },
  ];

  it('formats order message matching the exact required template', () => {
    const msg = buildWhatsAppMessage(form, items, null, null);
    expect(msg).toContain("Hello Manna Chocolates! I'd like to place an order.");
    expect(msg).toContain('Name: Customer Name');
    expect(msg).toContain('Phone: 9876543210');
    expect(msg).toContain('Type: Delivery');
    expect(msg).toContain('Address: Street Address, 560001');
    expect(msg).toContain('Needed by: 25 Oct 2026');
    expect(msg).toContain('1. 50g Chocolate Bar – Dark Chocolate, Fruit & Nuts × 2 – price to confirm');
    expect(msg).toContain('Total: to be confirmed');
    expect(msg).toContain('Notes: None');
  });

  it('includes handwritten gift note details when gifting is selected', () => {
    const giftForm: OrderForm = {
      ...form,
      isGift: true,
      giftRecipient: 'Mom',
      giftSender: 'Rohan',
      giftMessage: 'Happy Birthday! Hope you love these chocolates.',
    };
    const msg = buildWhatsAppMessage(giftForm, items, null, null);
    expect(msg).toContain('🎁 Gifting Request:');
    expect(msg).toContain('To: Mom');
    expect(msg).toContain('From: Rohan');
    expect(msg).toContain('Handwritten Note: "Happy Birthday! Hope you love these chocolates."');
    expect(msg).toContain('(Please include a complimentary handwritten card & gift ribbon)');
  });

  it('omits address line for Pickup orders', () => {
    const pickupForm: OrderForm = { ...form, orderType: 'Pickup', address: '', pincode: '' };
    const msg = buildWhatsAppMessage(pickupForm, items, null, null);
    expect(msg).toContain('Type: Pickup');
    expect(msg).not.toContain('Address:');
  });

  it('builds wa.me URL correctly', () => {
    const url = buildWhatsAppUrl('919449802000', 'Test message');
    expect(url).toBe('https://wa.me/919449802000?text=Test%20message');
  });

  it('returns null if WhatsApp number is empty/unset in settings', () => {
    expect(buildWhatsAppUrl('', 'Test message')).toBeNull();
    expect(buildWhatsAppUrl(null, 'Test message')).toBeNull();
  });
});

describe('7. Product Price Resolution', () => {
  const berryVelvetProduct: Product = {
    id: 'berry-velvet-special',
    name: 'Berry Velvet',
    category: 'Special Flavours',
    description: 'Test Berry Velvet',
    price: null,
    pricingMatrix: {
      'Mini Bar': 65,
      'Bites (15 Pcs)': 190,
      'Bites (30 Pcs)': 360,
      '50g Bar': 100,
      '100g Bar': 180,
      '150g Bar': 260,
      '200g Bar': 330,
    },
    options: [
      {
        name: 'Format',
        choices: ['Mini Bar', 'Bites (15 Pcs)', 'Bites (30 Pcs)', '50g Bar', '100g Bar', '150g Bar', '200g Bar'],
      },
    ],
  };

  it('resolves prices for Berry Velvet special formats (15 Pcs 190, 100g 180, 30 Pcs 360, Mini Bar 65)', () => {
    expect(resolveProductPrice(berryVelvetProduct, { Format: 'Mini Bar' })).toBe(65);
    expect(resolveProductPrice(berryVelvetProduct, { Format: 'Bites (15 Pcs)' })).toBe(190);
    expect(resolveProductPrice(berryVelvetProduct, { Format: 'Bites (30 Pcs)' })).toBe(360);
    expect(resolveProductPrice(berryVelvetProduct, { Format: '50g Bar' })).toBe(100);
    expect(resolveProductPrice(berryVelvetProduct, { Format: '100g Bar' })).toBe(180);
    expect(resolveProductPrice(berryVelvetProduct, { Format: '150g Bar' })).toBe(260);
    expect(resolveProductPrice(berryVelvetProduct, { Format: '200g Bar' })).toBe(330);
  });

  const bitesProduct: Product = {
    id: 'chocolate-bites',
    name: 'Chocolate Bites',
    category: 'Bites',
    description: 'Test Bites',
    price: null,
    pricingMatrix: {
      '15 Pieces': { Plain: 150, 'Fruit & Nuts': 160 },
      '30 Pieces': { Plain: 280, 'Fruit & Nuts': 300 },
    },
    options: [
      { name: 'Pack', choices: ['15 Pieces', '30 Pieces'] },
      { name: 'Flavour', choices: ['Plain', 'Fruit & Nuts'] },
    ],
  };

  it('resolves prices for Chocolate Bites 15 Pieces and 30 Pieces packs', () => {
    expect(resolveProductPrice(bitesProduct, { Pack: '15 Pieces', Flavour: 'Plain' })).toBe(150);
    expect(resolveProductPrice(bitesProduct, { Pack: '15 Pieces', Flavour: 'Fruit & Nuts' })).toBe(160);
    expect(resolveProductPrice(bitesProduct, { Pack: '30 Pieces', Flavour: 'Plain' })).toBe(280);
    expect(resolveProductPrice(bitesProduct, { Pack: '30 Pieces', Flavour: 'Fruit & Nuts' })).toBe(300);
  });

  const paanProduct: Product = {
    id: 'paan-special-bites',
    name: 'Paan Special Bites',
    category: 'Special Flavours',
    description: 'Test Paan',
    price: null,
    pricingMatrix: {
      '15 Pieces': 170,
      '30 Pieces': 320,
    },
    options: [
      { name: 'Pack', choices: ['15 Pieces', '30 Pieces'] },
    ],
  };

  it('resolves prices for Paan Special Bites 15 and 30 Pieces packs', () => {
    expect(resolveProductPrice(paanProduct, { Pack: '15 Pieces' })).toBe(170);
    expect(resolveProductPrice(paanProduct, { Pack: '30 Pieces' })).toBe(320);
  });

  const barProduct: Product = {
    id: 'chocolate-bar',
    name: 'Chocolate Bar',
    category: 'Bars',
    description: 'Test Bar',
    price: null,
    pricingMatrix: {
      '50g': { Plain: 90, 'Fruit & Nuts': 100 },
      '100g': { Plain: 160, 'Fruit & Nuts': 180 },
      '150g': { Plain: 240, 'Fruit & Nuts': 260 },
      '200g': { Plain: 310, 'Fruit & Nuts': 330 },
    },
    options: [
      { name: 'Size', choices: ['50g', '100g', '150g', '200g'] },
      { name: 'Flavour', choices: ['Plain', 'Fruit & Nuts'] },
    ],
  };

  it('resolves prices for standard bar sizes including 150g', () => {
    expect(resolveProductPrice(barProduct, { Size: '50g', Flavour: 'Plain' })).toBe(90);
    expect(resolveProductPrice(barProduct, { Size: '150g', Flavour: 'Plain' })).toBe(240);
    expect(resolveProductPrice(barProduct, { Size: '150g', Flavour: 'Fruit & Nuts' })).toBe(260);
    expect(resolveProductPrice(barProduct, { Size: '200g', Flavour: 'Fruit & Nuts' })).toBe(330);
  });
});
