import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageCircle, Instagram, Menu, X } from 'lucide-react';
import settings from '../data/settings.json';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  whatsappNumber?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, whatsappNumber }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const effectiveNumber = whatsappNumber ?? settings.whatsappNumber;
  const whatsappUrl = effectiveNumber
    ? `https://wa.me/${effectiveNumber.replace(/\D/g, '')}`
    : null;
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/weekendbusinessmens';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-[36px] z-40 site-header transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <a href="#" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative">
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 transition-all duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #C4834A, #6B2D0F)' }}
            >
              <img
                src="/images/logo.jpg"
                alt="Manna Chocolates"
                className="w-full h-full rounded-full object-cover"
                style={{ border: '2px solid #FFF8F0' }}
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif font-bold text-lg sm:text-xl text-espresso tracking-tight group-hover:text-cocoa transition-colors">
              Manna Chocolates
            </span>
            <span className="text-[10px] text-brown-warm font-medium tracking-widest uppercase opacity-70">
              Handcrafted · Made to Order
            </span>
          </div>
        </a>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: 'Shop', id: 'chocolates' },
            { label: 'Gallery', id: 'gallery' },
            { label: 'About', id: 'about' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm font-medium text-espresso/70 hover:text-cocoa transition-colors relative group py-1"
            >
              {label}
              <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-cocoa rounded transition-all duration-300" />
            </button>
          ))}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 rounded-full border border-espresso/10 flex items-center justify-center text-espresso/60 hover:text-[#E1306C] hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5 transition-all"
          >
            <Instagram className="w-4 h-4" />
          </a>

          {/* WhatsApp */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full border border-espresso/10 text-espresso/70 hover:text-green-success hover:border-green-success/30 hover:bg-green-success/5 text-xs font-medium transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Cart */}
          <button
            onClick={onOpenCart}
            aria-label={`Cart — ${cartCount} items`}
            className="btn-choco relative h-10 px-5 flex items-center gap-2 text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-espresso text-cream text-[10px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            className="md:hidden w-10 h-10 rounded-full border border-espresso/10 flex items-center justify-center text-espresso/70 hover:text-espresso transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ── */}
      {menuOpen && (
        <div className="md:hidden bg-cream border-t border-espresso/8 px-5 py-4 space-y-1 shadow-lg">
          {[
            { label: 'Shop', id: 'chocolates' },
            { label: 'Gallery', id: 'gallery' },
            { label: 'About', id: 'about' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="w-full text-left px-4 py-3 text-espresso/80 hover:text-cocoa font-medium text-sm rounded-xl hover:bg-cocoa/5 transition-all"
            >
              {label}
            </button>
          ))}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-espresso/80 hover:text-green-success text-sm font-medium rounded-xl hover:bg-green-success/5 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          )}
        </div>
      )}
    </header>
  );
};
