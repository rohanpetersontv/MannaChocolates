# 🍫 Manna Chocolates — Customer Ordering Website

A simple, fast, mobile-first ordering website for **Manna Chocolates**, a home-based handmade chocolate business in India. Designed for customers to select handcrafted chocolates and send their order request on WhatsApp in under **1 minute**.

---

## 🌟 Key Features & Design Polish
- **Refined Brand Aesthetic**: Built with the signature chocolate palette:
  - Espresso (`#321B16`) & Cocoa (`#59382D`)
  - Warm Bronze (`#B98451`) & Gold (`#C8A15A`)
  - Warm Cream (`#FFF8EF`)
  - Playfair Display serif headings with readable Inter body typography.
- **No AI Tropes**: Free of excessive glow, glassmorphic blurs, artificial gradients, repetitive pill shapes, and filler marketing text. Clean hairline borders and realistic, understated shadows.
- **CSS Design Tokens**: Defined in `:root` inside `src/index.css` for consistent, maintainable styling.
- **Subtle CSS Animations (150–250 ms)**:
  - Tactile button press and hover states.
  - Gentle product image hover (`img-zoom`, 250ms).
  - CSS-only drawer slide-in (`drawer-enter`, 220ms) and modal fade (`dialog-fade`, 180ms).
  - Added-to-cart confirmation feedback.
  - Fully respects `prefers-reduced-motion: reduce`.
- **Mobile-First & Overflow-Free**: Protected against horizontal scroll and overlapping text; min 48px tap targets throughout.
- **Unified Bar Section**: 50g, 100g, and 200g bar sizes consolidated into one product with an open custom request field.
- **Gift Pack Status**: Marked clearly as *Coming Soon* with disabled action controls.
- **Accurate Delivery Rule**: Free delivery within 10 km when customer's pincode matches `freeDeliveryPincodes` in `settings.json`. Otherwise, *"Delivery charges apply. We will confirm the amount on WhatsApp."* Zero invented delivery fees or thresholds.
- **Direct Dual Contact & Instagram**:
  - Orders dispatched to primary WhatsApp: `9449802000`
  - Secondary contact: `6362551322`
  - Instagram: `@weekendbusinessmens` ([https://www.instagram.com/weekendbusinessmens?utm_source=qr&xtok=MTBqdG4wenVtZmV1ZQ==](https://www.instagram.com/weekendbusinessmens?utm_source=qr&xtok=MTBqdG4wenVtZmV1ZQ==))

---

## 🚀 How to Run Locally

If you have Node.js installed on your computer:

1. **Open your terminal or command prompt** in the `manna-chocolates` folder:
   ```bash
   cd manna-chocolates
   ```

2. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Run automated unit tests (Vitest)**:
   ```bash
   npm test
   ```

5. **Run production TypeScript build**:
   ```bash
   npm run build
   ```

---

## ⚙️ Owner Guide: Editing Store Data (Non-Technical)

All customization lives in **two editable files** in `src/data/`:

### 1. `src/data/settings.json` (Contact & Delivery Settings)
```json
{
  "businessName": "Manna Chocolates",
  "tagline": "Handcrafted chocolates made with love in small batches",
  "whatsappNumber": "919449802000",
  "secondaryContactNumber": "916362551322",
  "instagramUrl": "https://www.instagram.com/weekendbusinessmens?utm_source=qr&xtok=MTBqdG4wenVtZmV1ZQ==",
  "instagramHandle": "@weekendbusinessmens",
  "freeDeliveryRadiusKm": 10,
  "freeDeliveryPincodes": [],
  "deliveryFee": null,
  "currencySymbol": "₹"
}
```
- **`whatsappNumber`**: Primary number for customer orders.
- **`secondaryContactNumber`**: Secondary contact shown in the footer and thank-you screen.
- **`instagramUrl` & `instagramHandle`**: Link and display handle for your Instagram profile.
- **`freeDeliveryPincodes`**: Add local 6-digit postal pincodes eligible for free delivery within 10 km (e.g. `["560001", "560038"]`).

---

### 2. `src/data/products.json` (Products, Options & Prices)
```json
[
  {
    "id": "chocolate-bar",
    "name": "Chocolate Bar",
    "category": "Bars",
    "description": "Handcrafted single-origin chocolate bar, tempered to perfection in small fresh batches.",
    "price": null,
    "options": [
      {
        "name": "Size",
        "choices": ["50g", "100g", "200g"]
      },
      {
        "name": "Chocolate Base",
        "choices": ["Dark Chocolate", "Milk Chocolate", "White Chocolate"]
      },
      {
        "name": "Flavour",
        "choices": ["Plain", "Fruit & Nuts"]
      }
    ]
  }
]
```
- **Prices**: Keep `"price": null` to show **"Price on WhatsApp"** and quote prices individually in chat. If you set fixed prices later, replace `null` with a number (e.g. `250`).
- **Gift Pack**: Has `"isComingSoon": true` to display the Coming Soon badge and disabled state.

---

## 🧪 Test & Build Status
- **Vitest Unit Tests**: `18 / 18 passed (100%)`.
- **TypeScript & Vite Build**: Passed cleanly with **0 errors**.
