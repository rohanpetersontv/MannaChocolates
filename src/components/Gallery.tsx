import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, ZoomIn, X, ChevronLeft, ChevronRight, MessageCircle, Heart } from 'lucide-react';
import settings from '../data/settings.json';

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  image: string;
  description: string;
  tags: string[];
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'butterscotch',
    title: 'Butterscotch Crunch',
    subtitle: 'Golden caramelized crunch bar with heart motifs',
    category: 'New Flavour',
    badge: 'Coming Soon',
    image: '/images/butterscotch.jpg',
    description:
      'Artisanal chocolate bar infused with caramelized butterscotch toffee pralines and crafted with intricate geometric and heart textures. A perfect balance of buttery crunch and smooth, melting sweetness.',
    tags: ['Caramelized Crunch', 'Artisan Heart Pattern', 'Small Batch'],
  },
  {
    id: 'berry-velvet',
    title: 'Berry Velvet Symphony',
    subtitle: 'White chocolate studded with dried berries & nuts',
    category: 'Special Edition',
    badge: 'Artisanal Delight',
    image: '/images/berry_velvet.jpg',
    description:
      'Luxurious velvety white chocolate slab loaded with hand-picked California almonds, cashews, sweet golden raisins, and ruby cranberries. Each bar delivers an exquisite medley of tart berry bursts and rich nutty crunch.',
    tags: ['Wild Cranberries', 'Roasted Cashews & Almonds', 'Velvety White'],
  },
  {
    id: 'chocolate-combo',
    title: 'Manna Royale Combo Tub',
    subtitle: 'Assorted foil-wrapped chocolate bites in a keepsake tub',
    category: 'Gift Assortment',
    badge: 'Signature Box',
    image: '/images/combo_chocolates.jpg',
    description:
      'Our iconic branded Manna Chocolates tub filled to the brim with individually wrapped royal blue and metallic bronze chocolate bites. Handcrafted for special celebrations, festivals, and unforgettable gifting.',
    tags: ['Royal Blue & Copper Foils', 'Celebration Tub', 'Perfect for Gifting'],
  },
];

export const Gallery: React.FC = () => {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    setActiveItemIndex((prev) =>
      prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length
    );
  }, []);

  const handleNext = useCallback(() => {
    setActiveItemIndex((prev) =>
      prev === null ? 0 : (prev + 1) % galleryItems.length
    );
  }, []);

  const handleClose = useCallback(() => {
    setActiveItemIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeItemIndex === null) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItemIndex, handleClose, handlePrev, handleNext]);

  const activeItem = activeItemIndex !== null ? galleryItems[activeItemIndex] : null;

  const waNumber = (settings.whatsappNumber || '919449802000').replace(/\D/g, '');

  return (
    <section id="gallery" className="py-20 relative overflow-hidden" style={{ background: '#F4ECE1' }}>
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-[0.06] pointer-events-none" style={{ background: '#6B2D0F' }} />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full opacity-[0.05] pointer-events-none" style={{ background: '#C4834A' }} />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3 flex items-center justify-center gap-2" style={{ color: '#C4834A' }}>
            <span className="w-8 h-px bg-current inline-block" />
            Visual Showcase
            <span className="w-8 h-px bg-current inline-block" />
          </p>
          <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4" style={{ color: '#4A1A08' }}>
            Our Handcrafted Gallery
          </h2>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#7A5140' }}>
            A peek into our artisanal kitchen. Real textures, fresh ingredients, and signature handcrafted presentations made fresh to your order.
          </p>
        </div>

        {/* 3-Item Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {galleryItems.map((item, index) => (
            <article
              key={item.id}
              onClick={() => setActiveItemIndex(index)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white border transition-all duration-300 hover:-translate-y-2 flex flex-col"
              style={{
                borderColor: 'rgba(74,26,8,0.1)',
                boxShadow: '0 8px 30px rgba(74,26,8,0.06)',
              }}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#2E0E00]/5">
                <picture>
                  <source srcSet={item.image.replace(/\.(jpg|jpeg|png)$/, '.webp')} type="image/webp" />
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                </picture>

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-sm"
                    style={{ background: 'linear-gradient(135deg, #4A1A08, #C4834A)' }}
                  >
                    <Sparkles className="w-3 h-3 text-gold" />
                    {item.badge}
                  </span>
                </div>

                {/* Category Pill */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/90 text-cocoa shadow-sm backdrop-blur-sm border border-white/40">
                    {item.category}
                  </span>
                </div>

                {/* Hover Overlay with Zoom Icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                  <span className="w-13 h-13 rounded-full bg-white/90 text-cocoa shadow-xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <ZoomIn className="w-6 h-6 text-cocoa" />
                  </span>
                </div>
              </div>

              {/* Text Information */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl mb-1.5 group-hover:text-cocoa transition-colors" style={{ color: '#4A1A08' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium mb-3" style={{ color: '#C4834A' }}>
                    {item.subtitle}
                  </p>
                  <p className="text-xs leading-relaxed line-clamp-3 mb-4" style={{ color: '#7A5140' }}>
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-espresso/6">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2.5 py-1 rounded-full text-[10px] font-medium"
                      style={{ background: 'rgba(107,45,15,0.06)', color: '#7A5140' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <p className="text-xs font-medium inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{ background: 'rgba(107,45,15,0.07)', color: '#7A5140', border: '1px solid rgba(107,45,15,0.12)' }}>
            <Heart className="w-3.5 h-3.5 text-cocoa" />
            <span>Click any image to view high-resolution photography and artisanal details</span>
          </p>
        </div>

      </div>

      {/* ── Lightbox Modal ── */}
      {activeItem && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(30,10,2,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={handleClose}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] animate-popup"
            onClick={(e) => e.stopPropagation()}
            style={{ border: '1px solid rgba(255,248,240,0.15)' }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close lightbox"
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 text-espresso hover:bg-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image View with Nav Arrows */}
            <div className="md:w-3/5 relative bg-[#1A0800] flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
              <picture className="w-full h-full flex items-center justify-center">
                <source srcSet={activeItem.image.replace(/\.(jpg|jpeg|png)$/, '.webp')} type="image/webp" />
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-contain max-h-[70vh] md:max-h-[85vh]"
                />
              </picture>

              {/* Prev Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous creation"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Arrow */}
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next creation"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Counter Pill */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold backdrop-blur-sm">
                {(activeItemIndex ?? 0) + 1} / {galleryItems.length}
              </div>
            </div>

            {/* Right Details Panel */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto" style={{ background: '#FAF6F0' }}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ background: 'linear-gradient(135deg, #4A1A08, #C4834A)' }}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    {activeItem.badge}
                  </span>
                  <span className="text-xs font-semibold text-espresso/50">
                    {activeItem.category}
                  </span>
                </div>

                <h3 className="font-serif font-black text-2xl sm:text-3xl leading-snug mb-2" style={{ color: '#4A1A08' }}>
                  {activeItem.title}
                </h3>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#C4834A' }}>
                  {activeItem.subtitle}
                </p>

                <p className="text-sm leading-relaxed mb-6" style={{ color: '#7A5140' }}>
                  {activeItem.description}
                </p>

                <div className="space-y-2 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-espresso/40">Creation Highlights</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItem.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white text-espresso border border-espresso/10"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-espresso/10">
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Manna Chocolates! I saw the ${activeItem.title} in your gallery and would love to know more or place an order!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-choco w-full py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  Inquire on WhatsApp
                </a>
                <button
                  onClick={() => {
                    handleClose();
                    document.getElementById('chocolates')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-full text-xs font-bold text-cocoa bg-transparent hover:bg-cocoa/5 transition-colors border border-cocoa/20"
                >
                  Explore Collection
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

