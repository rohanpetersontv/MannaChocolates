import React, { useState, useEffect } from 'react';
import productsData from './data/products.json';
import settingsData from './data/settings.json';
import { Product, CartItem, Settings } from './utils/helpers';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ThankYouModal } from './components/ThankYouModal';
import { ShoppingBag, ArrowDown, ChevronRight, PhoneCall, Instagram, X, Gift, Truck, Package } from 'lucide-react';

const CART_STORAGE_KEY = 'manna_chocolates_cart';
const FIRST_ORDER_POPUP_KEY = 'manna_first_order_popup_seen';

export const App: React.FC = () => {
  const products: Product[] = productsData as Product[];
  const settings: Settings = settingsData as Settings;

  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [submittedOrderText, setSubmittedOrderText] = useState('');
  const [submittedPrimaryUrl, setSubmittedPrimaryUrl] = useState<string | null>(null);
  const [submittedSecondaryUrl, setSubmittedSecondaryUrl] = useState<string | null>(null);
  const [submittedOrderedItems, setSubmittedOrderedItems] = useState<CartItem[]>([]);

  // First-order popup (show once per session)
  const [showFirstOrderPopup, setShowFirstOrderPopup] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(FIRST_ORDER_POPUP_KEY);
    if (!alreadySeen) {
      const timer = setTimeout(() => {
        setShowFirstOrderPopup(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPopup = () => {
    setShowFirstOrderPopup(false);
    sessionStorage.setItem(FIRST_ORDER_POPUP_KEY, '1');
  };

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  // Extract unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Compute numeric subtotal (items with known price)
  const cartSubtotal = cart.reduce((sum, item) => {
    if (item.unitPrice !== null) return sum + item.unitPrice * item.quantity;
    return sum;
  }, 0);

  // Delivery progress thresholds
  const FREE_LOCAL_THRESHOLD = 500;
  const FREE_NATIONAL_THRESHOLD = 999;

  const getDeliveryStatus = (): { type: 'none' | 'local' | 'national'; message: string; progress: number } => {
    if (cartSubtotal >= FREE_NATIONAL_THRESHOLD) {
      return { type: 'national', message: '🎉 You\'ve unlocked Free Pan-India delivery!', progress: 100 };
    }
    if (cartSubtotal >= FREE_LOCAL_THRESHOLD) {
      const needed = FREE_NATIONAL_THRESHOLD - cartSubtotal;
      const progress = Math.round((cartSubtotal / FREE_NATIONAL_THRESHOLD) * 100);
      return { type: 'local', message: `🚚 Free local delivery unlocked! Add ₹${needed} more for Free Pan-India delivery.`, progress };
    }
    const needed = FREE_LOCAL_THRESHOLD - cartSubtotal;
    const progress = Math.round((cartSubtotal / FREE_LOCAL_THRESHOLD) * 100);
    return { type: 'none', message: `Add ₹${needed} more for Free delivery within 10 km!`, progress };
  };

  // Cart operations — now accepts resolvedPrice
  const handleAddToCart = (product: Product, selectedOptions: Record<string, string>, quantity: number, resolvedPrice: number | null) => {
    const optionKey = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const instanceId = `${product.id}-${optionKey}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === instanceId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: instanceId,
            productId: product.id,
            name: product.name,
            selectedOptions,
            quantity,
            unitPrice: resolvedPrice,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSubmitted = (
    orderText: string,
    primaryUrl: string | null,
    secondaryUrl: string | null,
    orderedItems: CartItem[]
  ) => {
    setSubmittedOrderText(orderText);
    setSubmittedPrimaryUrl(primaryUrl);
    setSubmittedSecondaryUrl(secondaryUrl);
    setSubmittedOrderedItems(orderedItems);
    setIsCheckoutOpen(false);
    setIsThankYouOpen(true);
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('chocolates');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/weekendbusinessmens?utm_source=qr&xtok=MTBqdG4wenVtZmV1ZQ==';
  const instagramHandle = settings.instagramHandle || '@weekendbusinessmens';

  const deliveryStatus = cart.length > 0 ? getDeliveryStatus() : null;

  return (
    <div className="min-h-screen bg-cream text-espresso flex flex-col font-sans selection:bg-gold/30 selection:text-espresso overflow-x-hidden">
      {/* 10% off first order sticky top banner */}
      <div className="w-full bg-gradient-to-r from-[#7B3F20] via-[#9E6938] to-[#7B3F20] text-cream text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide sticky top-0 z-40 flex items-center justify-center gap-2">
        <Gift className="w-3.5 h-3.5 text-[#F5D78E] flex-shrink-0" />
        <span>🎉 <strong>10% OFF</strong> on your first delivery order! Use code <strong>FIRST10</strong> — mention it on WhatsApp.</span>
      </div>

      {/* Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        whatsappNumber={settings.whatsappNumber}
      />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
        {/* Simple, warm hero */}
        <section className="text-center py-8 sm:py-12 px-4 rounded-xl bg-white border border-[#E8DCCF]">
          <div className="max-w-2xl mx-auto space-y-3.5">
            {/* Brand Logo Medallion */}
            <div className="flex justify-center mb-1">
              <div className="p-1 rounded-full bg-gradient-to-br from-[#E2B774] via-[#9E6938] to-[#422216] shadow-md inline-block">
                <img
                  src="/images/logo.jpg"
                  alt="Manna Chocolates Crest"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-cream/90 transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-espresso tracking-tight">
              Handcrafted chocolates
            </h1>

            <p className="text-sm sm:text-base text-[#68534D] leading-relaxed max-w-xl mx-auto">
              Small-batch chocolates made to order in India. Pick your chocolates below and place your order directly on WhatsApp in under 1 minute.
            </p>

            {/* Factual bullet highlights — "No login required" removed */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-[#68534D]">
              <span className="px-2.5 py-1 rounded bg-cream border border-[#E8DCCF] inline-flex items-center gap-1">
                <Truck className="w-3 h-3" /> Free delivery within 10 km
              </span>
              <span className="px-2.5 py-1 rounded bg-cream border border-[#E8DCCF] inline-flex items-center gap-1">
                <Package className="w-3 h-3" /> Made fresh to order
              </span>
              <span className="px-2.5 py-1 rounded bg-[#FDF6E3] border border-[#E2B774] text-[#7B3F20] font-semibold inline-flex items-center gap-1">
                <Gift className="w-3 h-3 text-[#9E6938]" /> 10% off first delivery
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={scrollToProducts}
                className="btn-shimmer inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-cocoa hover:bg-espresso text-cream font-medium rounded-lg transition-all duration-200 text-sm sm:text-base hover:shadow-md active:scale-[0.98]"
              >
                <span>View Chocolates</span>
                <ArrowDown className="w-4 h-4 text-gold" />
              </button>
            </div>
          </div>
        </section>

        {/* Chocolates section */}
        <section id="chocolates" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCCF] pb-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-espresso">
              Our Chocolates
            </h2>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Chocolate categories">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    role="tab"
                    aria-selected={isSelected}
                    className={`category-pill px-3.5 py-1.5 min-h-[40px] rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-cocoa text-cream font-semibold shadow-sm'
                        : 'bg-white text-espresso border border-[#E8DCCF] hover:border-cocoa hover:bg-[#FDF6E3] hover:text-cocoa'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#E8DCCF] space-y-1">
              <p className="font-serif text-lg font-bold text-espresso">No chocolates in this category.</p>
              <p className="text-xs text-[#68534D]">Select another category above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Cart Bar (Mobile) */}
      {totalCartCount > 0 && (
        <aside
          aria-label="Order summary"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-30"
        >
          <div className="p-3 bg-white border border-[#E8DCCF] rounded-lg shadow-sheet flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-cocoa" />
              <span className="text-xs font-semibold text-espresso">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3.5 py-2 min-h-[40px] bg-cocoa text-cream text-xs font-medium rounded-md hover:bg-espresso flex items-center gap-1 transition-all duration-200 active:scale-[0.97]"
            >
              <span>View Cart</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold" />
            </button>
          </div>
        </aside>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-[#E8DCCF] bg-white py-10 px-4 text-center text-xs text-[#68534D] space-y-3">
        <div className="flex justify-center mb-1">
          <img
            src="/images/logo.jpg"
            alt="Manna Chocolates Logo"
            className="w-14 h-14 rounded-full object-cover shadow-xs border border-[#C8A15A]/60 mx-auto"
          />
        </div>
        <p className="font-serif font-bold text-lg text-espresso">Manna Chocolates</p>
        <p className="max-w-md mx-auto">
          Home-based handmade chocolates in India • Freshly made to order
        </p>

        {/* Contact Links */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
          <a
            href="https://wa.me/919449802000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cream border border-[#E8DCCF] hover:border-green-success/60 hover:bg-green-success/5 text-espresso transition-all duration-200 font-medium text-xs min-h-[36px]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-green-success" />
            <span>WhatsApp: 94498 02000</span>
          </a>

          <a
            href="https://wa.me/916362551322"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cream border border-[#E8DCCF] hover:border-cocoa hover:bg-cocoa/5 text-espresso transition-all duration-200 font-medium text-xs min-h-[36px]"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cocoa" />
            <span>Call / WhatsApp: 63625 51322</span>
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cream border border-[#E8DCCF] hover:border-[#C13584]/50 hover:bg-[#C13584]/5 text-espresso transition-all duration-200 font-medium text-xs min-h-[36px]"
          >
            <Instagram className="w-3.5 h-3.5 text-[#C13584]" />
            <span>Instagram: {instagramHandle}</span>
          </a>
        </div>

        <p className="text-[11px] text-[#A69389] pt-1">
          Orders are sent on WhatsApp. We will confirm availability and payment there.
        </p>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
        cartSubtotal={cartSubtotal}
        deliveryStatus={deliveryStatus}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        settings={settings}
        onOrderSubmitted={handleOrderSubmitted}
      />

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={isThankYouOpen}
        orderText={submittedOrderText}
        primaryWhatsAppUrl={submittedPrimaryUrl}
        secondaryWhatsAppUrl={submittedSecondaryUrl}
        orderedItems={submittedOrderedItems}
        onClose={() => setIsThankYouOpen(false)}
      />

      {/* First Order 10% OFF Popup */}
      {showFirstOrderPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-espresso/60 backdrop-blur-sm p-4"
          onClick={dismissPopup}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-[#E8DCCF] animate-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismissPopup}
              className="absolute top-3 right-3 p-1.5 text-espresso/50 hover:text-espresso rounded-full hover:bg-cream transition-colors"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Confetti / emoji accent */}
            <div className="text-4xl mb-3">🍫🎉</div>

            <div className="inline-block bg-gradient-to-r from-[#7B3F20] to-[#9E6938] text-cream text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
              Welcome Offer
            </div>

            <h2 className="font-serif text-2xl font-bold text-espresso mb-2">
              10% OFF Your First Delivery!
            </h2>

            <p className="text-sm text-[#68534D] leading-relaxed mb-4">
              Enjoy an exclusive <strong>10% discount</strong> on your very first delivery order from Manna Chocolates. Just mention code&nbsp;
              <strong className="text-cocoa">FIRST10</strong> when you WhatsApp us your order.
            </p>

            {/* Delivery info */}
            <div className="bg-[#FDF6E3] border border-[#E2B774] rounded-lg p-3 mb-4 text-xs text-[#7B3F20] space-y-1">
              <div className="flex items-center gap-2 justify-center">
                <Truck className="w-3.5 h-3.5" />
                <span>Free delivery within 10 km on orders above ₹500</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Package className="w-3.5 h-3.5" />
                <span>Free Pan-India delivery on orders above ₹999</span>
              </div>
            </div>

            <button
              onClick={() => { dismissPopup(); scrollToProducts(); }}
              className="w-full min-h-[48px] bg-cocoa hover:bg-espresso text-cream font-semibold rounded-lg transition-colors text-sm"
            >
              Shop Now 🛍️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
