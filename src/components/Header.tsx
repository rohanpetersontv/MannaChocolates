import React from 'react';
import { ShoppingBag, MessageCircle, Instagram } from 'lucide-react';
import settings from '../data/settings.json';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  whatsappNumber?: string | null;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, whatsappNumber }) => {
  const effectiveNumber = whatsappNumber ?? settings.whatsappNumber;
  const whatsappUrl = effectiveNumber
    ? `https://wa.me/${effectiveNumber.replace(/\D/g, '')}`
    : null;
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/weekendbusinessmens?utm_source=qr&xtok=MTBqdG4wenVtZmV1ZQ==';

  return (
    <header className="sticky top-0 z-40 bg-cream/95 border-b border-[#E8DCCF]">
      <div className="max-w-[1100px] mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between">
        {/* Brand identity */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
          <img
            src="/images/logo.jpg"
            alt="Manna Chocolates Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#C8A15A]/70 shadow-xs transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl sm:text-2xl text-espresso tracking-tight transition-colors leading-tight">
              Manna Chocolates
            </span>
            <span className="text-[11px] sm:text-xs text-bronze font-medium tracking-wide">
              Handmade chocolates made to order
            </span>
          </div>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Instagram Link */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram profile @weekendbusinessmens"
            className="min-h-[48px] min-w-[48px] px-3 rounded-lg border border-[#E8DCCF] bg-white text-espresso hover:border-cocoa transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
            title="Follow on Instagram @weekendbusinessmens"
          >
            <Instagram className="w-4 h-4 text-[#C13584]" />
            <span className="hidden md:inline">Instagram</span>
          </a>

          {/* Direct WhatsApp link */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat directly on WhatsApp"
              className="min-h-[48px] min-w-[48px] px-3 rounded-lg border border-[#E8DCCF] bg-white text-espresso hover:border-cocoa transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-green-success" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            aria-label={`Cart with ${cartCount} items`}
            className="min-h-[48px] px-4 sm:px-5 rounded-lg bg-cocoa text-cream hover:bg-espresso active:scale-[0.99] transition-colors flex items-center gap-2 font-medium text-sm sm:text-base shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-gold" />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-gold text-espresso font-bold text-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
