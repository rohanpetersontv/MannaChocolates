import React, { useState, useEffect } from 'react';
import productsData from './data/products.json';
import settingsData from './data/settings.json';
import { Product, CartItem, Settings } from './utils/helpers';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Gallery } from './components/Gallery';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ThankYouModal } from './components/ThankYouModal';
import {
  ShoppingBag, ChevronRight, PhoneCall, Instagram, X,
  Gift, Truck, Sparkles, ArrowRight, Leaf, Heart, Shield
} from 'lucide-react';

const CART_STORAGE_KEY = 'manna_chocolates_cart';
const FIRST_ORDER_POPUP_KEY = 'manna_first_order_popup_seen';

export const App: React.FC = () => {
  const products: Product[] = productsData as Product[];
  const settings: Settings = settingsData as Settings;

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { const s = localStorage.getItem(CART_STORAGE_KEY); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [isCartOpen,       setIsCartOpen]       = useState(false);
  const [isCheckoutOpen,   setIsCheckoutOpen]   = useState(false);
  const [isThankYouOpen,   setIsThankYouOpen]   = useState(false);
  const [submittedOrderText,    setSubmittedOrderText]    = useState('');
  const [submittedPrimaryUrl,   setSubmittedPrimaryUrl]   = useState<string | null>(null);
  const [submittedSecondaryUrl, setSubmittedSecondaryUrl] = useState<string | null>(null);
  const [submittedOrderedItems, setSubmittedOrderedItems] = useState<CartItem[]>([]);
  const [showFirstOrderPopup,   setShowFirstOrderPopup]   = useState(false);
  const [selectedCategory,      setSelectedCategory]      = useState('All');

  useEffect(() => {
    const seen = sessionStorage.getItem(FIRST_ORDER_POPUP_KEY);
    if (!seen) {
      const t = setTimeout(() => setShowFirstOrderPopup(true), 1400);
      return () => clearTimeout(t);
    }
  }, []);

  const dismissPopup = () => {
    setShowFirstOrderPopup(false);
    sessionStorage.setItem(FIRST_ORDER_POPUP_KEY, '1');
  };

  useEffect(() => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }
    catch { /* ignore */ }
  }, [cart]);

  const categories = ['All', 'Special Flavours', 'Bars', 'Bites', 'Gift Packs'];
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => {
        if (selectedCategory === 'Special Flavours') {
          return p.category === 'Special Flavours' || !!p.label;
        }
        if (selectedCategory === 'Bars') {
          return p.category === 'Bars' || p.options.some(o => o.choices.some(c => c.toLowerCase().includes('bar')));
        }
        if (selectedCategory === 'Bites') {
          return p.category === 'Bites' || p.options.some(o => o.choices.some(c => c.toLowerCase().includes('bite')));
        }
        return p.category === selectedCategory;
      });
  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartSubtotal   = cart.reduce((s, i) => i.unitPrice !== null ? s + i.unitPrice * i.quantity : s, 0);

  const FREE_LOCAL = 500, FREE_NATIONAL = 999;
  const getDeliveryStatus = () => {
    if (cartSubtotal >= FREE_NATIONAL) return { type: 'national' as const, message: "🎉 Free Pan-India delivery unlocked!", progress: 100 };
    if (cartSubtotal >= FREE_LOCAL) {
      return { type: 'local' as const, message: `🚚 Free local delivery! Add ₹${FREE_NATIONAL - cartSubtotal} more for Pan-India.`, progress: Math.round(cartSubtotal / FREE_NATIONAL * 100) };
    }
    return { type: 'none' as const, message: `Add ₹${FREE_LOCAL - cartSubtotal} more for free delivery within 10 km!`, progress: Math.round(cartSubtotal / FREE_LOCAL * 100) };
  };

  const handleAddToCart = (product: Product, opts: Record<string, string>, qty: number, price: number | null) => {
    const key = Object.entries(opts).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}:${v}`).join('|');
    const id  = `${product.id}-${key}`;
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx > -1) { const u = [...prev]; u[idx] = { ...u[idx], quantity: u[idx].quantity + qty }; return u; }
      return [...prev, { id, productId: product.id, name: product.name, selectedOptions: opts, quantity: qty, unitPrice: price }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) =>
    setCart(prev => prev.map(i => i.id === id ? (i.quantity + delta > 0 ? { ...i, quantity: i.quantity + delta } : null) : i).filter(Boolean) as CartItem[]);

  const handleRemoveItem    = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const handleProceedToCheckout = () => { setIsCartOpen(false); setIsCheckoutOpen(true); };
  const handleOrderSubmitted = (orderText: string, primaryUrl: string | null, secondaryUrl: string | null, orderedItems: CartItem[]) => {
    setSubmittedOrderText(orderText);
    setSubmittedPrimaryUrl(primaryUrl);
    setSubmittedSecondaryUrl(secondaryUrl);
    setSubmittedOrderedItems(orderedItems);
    setIsCheckoutOpen(false);
    setIsThankYouOpen(true);
    setCart([]);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* ignore */ }
  };

  const scrollToProducts = () => document.getElementById('chocolates')?.scrollIntoView({ behavior: 'smooth' });

  const waUrl = `https://wa.me/${(settings.whatsappNumber || '').replace(/\D/g,'')}`;
  const deliveryStatus = cart.length > 0 ? getDeliveryStatus() : null;

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: '#F9F5F0', color: '#2E0E00' }}>

      {/* ── Promo Banner ── */}
      <div className="promo-bar w-full py-2 px-4 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0" />
        <span>
          ✨ <strong className="text-gold">Special Flavours Launching Soon:</strong> Berry Blue & Butterscotch Crunch! · Plus <strong className="text-gold">10% OFF</strong> first order with code <strong className="text-gold">FIRST10</strong>
        </span>
      </div>

      {/* ── Header ── */}
      <Header cartCount={totalCartCount} onOpenCart={() => setIsCartOpen(true)} whatsappNumber={settings.whatsappNumber} />

      <main>

        {/* ═══════════════════════════════════════════════════
            HERO — "Chocolate is happiness"
            Light bg, big serif headline, floating product image
        ═══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden deco-circles" style={{ background: '#F9F5F0', minHeight: '88vh' }}>

          {/* Subtle background dots */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-16 right-[10%] w-72 h-72 rounded-full opacity-[0.04]" style={{ background: '#6B2D0F' }} />
            <div className="absolute bottom-0 left-[5%] w-52 h-52 rounded-full opacity-[0.04]" style={{ background: '#6B2D0F' }} />
            <div className="absolute top-1/3 left-[15%] w-3 h-3 rounded-full opacity-20" style={{ background: '#6B2D0F' }} />
            <div className="absolute top-2/3 right-[20%] w-2 h-2 rounded-full opacity-15" style={{ background: '#C4834A' }} />
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 flex flex-col lg:flex-row items-center min-h-[88vh] gap-10 py-16">

            {/* Left — Text */}
            <div className="flex-1 max-w-lg z-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brown-warm/60 mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-brown-warm/40 inline-block" />
                Handcrafted in India
              </p>
              <h1 className="font-serif font-black leading-[1.05] mb-5" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#4A1A08' }}>
                Chocolate<br />
                <em className="not-italic" style={{ color: '#6B2D0F' }}>is happiness</em>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: '#7A5140', maxWidth: 400 }}>
                All of really need is love, a little chocolate now and then doesn't hurt.
                Handcrafted in small batches, made fresh to your order — no preservatives.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToProducts}
                  className="btn-choco px-7 py-3.5 text-sm font-bold flex items-center gap-2"
                >
                  Shop now
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-choco-outline px-7 py-3.5 text-sm flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-2 mt-7">
                {[
                  { icon: Truck,   t: 'Free delivery within 10 km' },
                  { icon: Leaf,    t: 'No preservatives' },
                  { icon: Gift,    t: '10% off first order' },
                ].map(({ icon: Icon, t }) => (
                  <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                    style={{ background: 'rgba(107,45,15,0.07)', border: '1px solid rgba(107,45,15,0.12)', color: '#7A5140' }}>
                    <Icon className="w-3 h-3" style={{ color: '#6B2D0F' }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Floating product image */}
            <div className="flex-1 flex items-center justify-center relative z-10">
              <div className="relative">
                {/* Large decorative circle behind */}
                <div className="absolute inset-0 -m-12 rounded-full opacity-30"
                  style={{ background: 'radial-gradient(circle, rgba(196,131,74,0.25), transparent 70%)' }} />

                <img
                  src="/images/chocolate_bites.jpg"
                  alt="Manna Chocolate Bites"
                  className="float-product relative z-10 rounded-[2rem] shadow-2xl w-72 sm:w-80 lg:w-96 object-cover"
                  style={{ aspectRatio: '1', rotate: '-6deg', border: '4px solid rgba(255,248,240,0.8)' }}
                />
                {/* Second floating image */}
                <img
                  src="/images/paan_bites.jpg"
                  alt="Paan Special Bites"
                  className="float-product-2 absolute -bottom-8 -right-8 z-20 rounded-2xl shadow-xl w-40 object-cover border-4 border-white"
                  style={{ aspectRatio: '1' }}
                />
                {/* Price tag accent */}
                <div className="absolute -top-4 -left-4 z-30 bg-white rounded-2xl px-3 py-2 shadow-lg border border-espresso/8">
                  <p className="text-[10px] text-espresso/50 font-medium">Starting from</p>
                  <p className="font-serif font-bold text-cocoa text-lg leading-none">₹150</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            DARK WAVE SECTION — "Chocolate Is Like A Hug…"
        ═══════════════════════════════════════════════════ */}
        <section
          className="relative py-20 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #4A1A08 0%, #6B2D0F 100%)' }}
        >
          {/* Wave top */}
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full" style={{ fill: '#F9F5F0' }}>
              <path d="M0,0 C240,60 480,60 720,30 C960,0 1200,0 1440,30 L1440,0 Z" />
            </svg>
          </div>
          {/* Wave bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full" style={{ fill: '#F9F5F0' }}>
              <path d="M0,60 C240,0 480,0 720,30 C960,60 1200,60 1440,30 L1440,60 Z" />
            </svg>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Left — stacked product images */}
            <div className="flex-1 relative flex justify-center">
              <div className="relative">
                <img src="/images/dark_chocolate_bar.jpg" alt="Chocolate Bar" className="rounded-2xl shadow-2xl w-56 sm:w-64 object-cover border-4 border-white/10" style={{ aspectRatio: '1' }} />
                <img src="/images/midnight_orange_bites.jpg" alt="Midnight Orange" className="absolute -bottom-6 -right-6 rounded-xl shadow-xl w-36 object-cover border-4 border-white/10" style={{ aspectRatio: '1' }} />
                {/* Decorative chocolate pieces */}
                <div className="absolute -top-4 -left-4 w-14 h-14 rounded-xl shadow-lg overflow-hidden border-2 border-white/10">
                  <img src="/images/chocolate_bites.jpg" alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right — text */}
            <div className="flex-1 text-white max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold/70 mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-gold/40 inline-block" />
                Our Specialties
              </p>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5 text-white">
                Chocolate is like a<br />
                <em className="not-italic text-gold">hug from the inside</em>
              </h2>
              <p className="text-sm leading-relaxed mb-4 text-white/65">
                Handcrafted in small batches with real ingredients. Every bite is a moment of joy — no preservatives, no shortcuts, just pure love in chocolate form.
              </p>
              <p className="text-sm leading-relaxed mb-8 text-white/65">
                From classic dark chocolate bars to exotic Paan Special bites and zesty Midnight Orange — there's a Manna chocolate for every mood.
              </p>
              <button
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:-translate-y-1 active:scale-97"
                style={{ background: '#fff', color: '#4A1A08', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Explore collection
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            CHOCOLATES SECTION — "Best selling products"
        ═══════════════════════════════════════════════════ */}
        <section id="chocolates" className="py-16 sm:py-20" style={{ background: '#F9F5F0' }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] mb-2 flex items-center gap-2" style={{ color: '#C4834A' }}>
                  <span className="w-6 h-px bg-current inline-block" />
                  Our Collection
                </p>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: '#4A1A08' }}>
                  Best selling chocolates
                </h2>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap items-center gap-2" role="tablist">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      role="tab"
                      aria-selected={active}
                      className={`category-pill px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        active ? 'text-white shadow-btn' : 'text-espresso/60 hover:text-cocoa'
                      }`}
                      style={active
                        ? { background: 'linear-gradient(135deg, #4A1A08, #6B2D0F)' }
                        : { background: 'rgba(74,26,8,0.07)', border: '1px solid rgba(74,26,8,0.1)' }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-white border border-espresso/6">
                <p className="font-serif text-lg font-bold text-espresso mb-1">No chocolates here.</p>
                <p className="text-xs text-espresso/40">Pick another category above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            HANDCRAFTED GALLERY — Artisanal visual showcase
        ═══════════════════════════════════════════════════ */}
        <Gallery />

        {/* ═══════════════════════════════════════════════════
            SECOND DARK SECTION — "Anything is good…"
        ═══════════════════════════════════════════════════ */}
        <section
          className="relative py-20 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #5C2210 0%, #4A1A08 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full" style={{ fill: '#F9F5F0' }}>
              <path d="M0,0 C360,60 720,60 1080,30 C1260,15 1380,0 1440,0 L1440,0 Z" />
            </svg>
          </div>

          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Left — floating images */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <img src="/images/paan_bites.jpg" alt="Paan Special" className="rounded-2xl shadow-2xl w-64 object-cover border-4 border-white/10" style={{ aspectRatio: '1' }} />
                <img src="/images/midnight_orange_bites.jpg" alt="Midnight Orange" className="absolute -bottom-4 -right-4 rounded-xl shadow-lg w-36 border-4 border-white/10 object-cover" style={{ aspectRatio: '1' }} />
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 text-white max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold/70 mb-4 flex items-center gap-2">
                <span className="w-8 h-px bg-gold/40 inline-block" />
                Special Flavours
              </p>
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] mb-5">
                Anything is good<br />
                <em className="not-italic text-gold">made of chocolate</em>
              </h2>
              <p className="text-sm leading-relaxed text-white/65 mb-8">
                From exotic Paan Special to Midnight Orange — our signature flavours bring something truly unique. Perfect for gifting, celebrations, or just treating yourself.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={scrollToProducts}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all hover:-translate-y-1"
                  style={{ background: '#fff', color: '#4A1A08', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
                >
                  Buy now
                </button>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all"
                >
                  WhatsApp Order
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            ABOUT / WHY US
        ═══════════════════════════════════════════════════ */}
        <section id="about" className="py-16 sm:py-24" style={{ background: '#F9F5F0' }}>
          <div className="max-w-[1200px] mx-auto px-5 sm:px-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3 flex items-center justify-center gap-2" style={{ color: '#C4834A' }}>
              <span className="w-6 h-px bg-current inline-block" />
              Our Promise
              <span className="w-6 h-px bg-current inline-block" />
            </p>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl mb-3" style={{ color: '#4A1A08' }}>
              Enjoyable — your life, eat chocolate
            </h2>
            <p className="text-sm text-espresso/50 leading-relaxed max-w-xl mx-auto mb-12">
              Chocolate is especially rich in flavonoids like epicatechin and catechins, which have been shown to improve brain function and boost your immune and cardiovascular health.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 max-w-lg mx-auto mb-14">
              {[
                { value: '100%', label: 'Handcrafted' },
                { value: '0',    label: 'Preservatives' },
                { value: '∞',    label: 'Love' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="font-serif text-4xl sm:text-5xl font-black mb-1" style={{ color: '#6B2D0F' }}>{value}</div>
                  <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#7A5140' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 max-w-3xl mx-auto">
              {[
                { icon: Leaf,    title: 'Real Ingredients',   desc: 'No artificial flavours' },
                { icon: Heart,   title: 'Made with Love',     desc: 'Small-batch handcrafted' },
                { icon: Gift,    title: 'Perfect for Gifting', desc: 'Beautiful packaging' },
                { icon: Shield,  title: 'Quality Assured',    desc: 'Fresh on every order' },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl p-5 text-center group hover:-translate-y-1 transition-transform"
                  style={{ background: '#fff', border: '1px solid rgba(74,26,8,0.07)', boxShadow: '0 2px 16px rgba(74,26,8,0.05)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                    style={{ background: 'rgba(107,45,15,0.08)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#6B2D0F' }} />
                  </div>
                  <p className="font-semibold text-sm text-espresso mb-0.5">{title}</p>
                  <p className="text-[11px] text-espresso/45 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer style={{ background: '#2E0E00', color: '#FFF8F0' }}>
        {/* Wave top */}
        <div className="h-12 overflow-hidden">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" className="w-full h-full" style={{ fill: '#F9F5F0' }}>
            <path d="M0,48 C360,0 720,0 1080,24 C1260,36 1380,48 1440,48 L0,48 Z" />
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #C4834A, #6B2D0F)' }}>
                  <img src="/images/logo.jpg" alt="Manna Chocolates" className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid #2E0E00' }} />
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-white">Manna Chocolates</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Handmade · India</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,248,240,0.45)' }}>
                Home-based handcrafted chocolates made fresh to order. No preservatives. Pure love in every bite.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Quick Links</p>
              <div className="space-y-2">
                {[
                  { label: 'Shop Chocolates', action: () => scrollToProducts() },
                  { label: 'Artisan Gallery', href: '#gallery' },
                  { label: 'About Us',        href: '#about' },
                ].map(({ label, action, href }) => (
                  href
                    ? <a key={label} href={href} className="block text-sm text-white/60 hover:text-white/90 transition-colors">{label}</a>
                    : <button key={label} onClick={action} className="block text-sm text-white/60 hover:text-white/90 transition-colors">{label}</button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">Contact</p>
              <div className="space-y-2.5">
                {[
                  { href: 'https://wa.me/919449802000', icon: PhoneCall, label: '94498 02000' },
                  { href: 'https://wa.me/916362551322', icon: PhoneCall, label: '63625 51322' },
                  { href: settings.instagramUrl || '#', icon: Instagram, label: settings.instagramHandle || '@weekendbusinessmens' },
                ].map(({ href, icon: Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,248,240,0.08)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(255,248,240,0.3)' }}>
              © {new Date().getFullYear()} Manna Chocolates. All rights reserved.
            </p>
            <p className="text-[11px]" style={{ color: 'rgba(255,248,240,0.3)' }}>
              Orders confirmed via WhatsApp
            </p>
          </div>
        </div>
      </footer>

      {/* ── Floating Cart ── */}
      {totalCartCount > 0 && (
        <aside className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-30">
          <div className="cart-float-bar p-3 rounded-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" style={{ color: '#6B2D0F' }} />
              <span className="text-xs font-semibold text-espresso">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'} in cart
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-choco px-4 py-2 text-xs font-bold flex items-center gap-1.5"
            >
              View Cart
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* ── Modals ── */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart}
        onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout} cartSubtotal={cartSubtotal} deliveryStatus={deliveryStatus} />

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)}
        items={cart} settings={settings} onOrderSubmitted={handleOrderSubmitted} />

      <ThankYouModal isOpen={isThankYouOpen} orderText={submittedOrderText}
        primaryWhatsAppUrl={submittedPrimaryUrl} secondaryWhatsAppUrl={submittedSecondaryUrl}
        orderedItems={submittedOrderedItems} onClose={() => setIsThankYouOpen(false)} />

      {/* ── Entrance Notification Popup: Special Flavours Launching Soon & Welcome Offer ── */}
      {showFirstOrderPopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(46,14,0,0.65)', backdropFilter: 'blur(10px)' }}
          onClick={dismissPopup}
        >
          <div
            className="relative max-w-md w-full rounded-3xl p-6 sm:p-7 text-center animate-popup overflow-hidden"
            style={{ background: '#fff', boxShadow: '0 32px 80px rgba(46,14,0,0.28)', border: '1px solid rgba(74,26,8,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: 'linear-gradient(90deg, #4A1A08, #C4834A, #4A1A08)' }} />

            <button onClick={dismissPopup}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-espresso/40 hover:text-espresso hover:bg-espresso/5 transition-all"
              aria-label="Close notification">
              <X className="w-4 h-4" />
            </button>

            {/* Notification Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white mb-3 mt-1"
              style={{ background: 'linear-gradient(135deg, #4A1A08, #C4834A)' }}>
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Special Flavours Launching Soon!
            </div>

            <h2 className="font-serif text-2xl sm:text-[26px] font-black leading-tight mb-2" style={{ color: '#4A1A08' }}>
              Exciting New Flavours<br />
              <span className="text-cocoa font-bold">Are Launching Soon</span>
            </h2>

            <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: '#7A5140' }}>
              Get ready to indulge your senses! We are introducing brand-new handcrafted special flavours:
            </p>

            {/* Special Flavours Preview Box */}
            <div className="rounded-2xl p-3.5 mb-4 text-left space-y-2.5"
              style={{ background: 'rgba(107,45,15,0.05)', border: '1px solid rgba(107,45,15,0.12)' }}>
              
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none">🫐</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-cocoa leading-tight">Berry Blue — Special Flavour</p>
                  <p className="text-[11px] text-espresso/70 leading-normal">
                    Real wild blueberries infused in rich chocolate. Available in <strong>Mini Bars</strong>, <strong>Artisan Bites</strong>, and <strong>Bars (50g, 100g, 150g, 200g)</strong>.
                  </p>
                </div>
              </div>

              <div className="h-px bg-espresso/8" />

              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none">🍯</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-cocoa leading-tight">Butterscotch Crunch — Coming Soon</p>
                  <p className="text-[11px] text-espresso/70 leading-normal">
                    Golden caramelized toffee praline crunch with heart motifs. Available in <strong>all bars, mini bars & bites</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Welcome Promo Pill */}
            <div className="rounded-2xl p-3 mb-5 text-xs text-left flex items-center justify-between gap-2"
              style={{ background: 'linear-gradient(135deg, rgba(196,131,74,0.12), rgba(107,45,15,0.08))', border: '1px dashed rgba(107,45,15,0.3)' }}>
              <div>
                <p className="font-bold text-cocoa text-[11px]">🎉 Welcome Offer: 10% OFF</p>
                <p className="text-[10px] text-espresso/60">Use code <strong className="text-cocoa font-bold">FIRST10</strong> when you WhatsApp us</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: '#6B2D0F' }}>
                FIRST10
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => { dismissPopup(); scrollToProducts(); }}
                className="btn-choco w-full min-h-[46px] rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Flavours & Menu
              </button>
              
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '').replace(/\D/g,'')}?text=${encodeURIComponent('Hi Manna Chocolates! I saw that your new special flavours (Berry Blue & Butterscotch) are launching soon. I would love to inquire and place an order!')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissPopup}
                className="w-full min-h-[40px] rounded-2xl font-semibold text-xs flex items-center justify-center gap-1.5 text-espresso/80 hover:text-green-success hover:bg-green-success/5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-green-success" />
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
