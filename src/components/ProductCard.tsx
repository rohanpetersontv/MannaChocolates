import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Check, Clock, Sparkles, Heart } from 'lucide-react';
import { Product, formatIndianCurrency, resolveProductPrice } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedOptions: Record<string, string>, quantity: number, resolvedPrice: number | null) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.choices && opt.choices.length > 0) initial[opt.name] = opt.choices[0];
    });
    return initial;
  });

  const [customNote, setCustomNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleOptionChange = (name: string, choice: string) =>
    setSelectedOptions((prev) => ({ ...prev, [name]: choice }));

  const handleQuantityDelta = (delta: number) =>
    setQuantity((prev) => Math.max(1, prev + delta));

  const resolvedPrice = resolveProductPrice(product, selectedOptions);

  const handleAdd = () => {
    if (product.isComingSoon) return;
    const finalOptions = { ...selectedOptions };
    if (customNote.trim()) finalOptions['Customization'] = customNote.trim();
    onAddToCart(product, finalOptions, quantity, resolvedPrice);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const getImage = (id: string, category: string) => {
    if (product.image) return product.image;
    if (id.includes('bar')) return '/images/dark_chocolate_bar.jpg';
    if (id.includes('bites') || category.toLowerCase().includes('bites')) return '/images/chocolate_bites.jpg';
    return '/images/gift_pack.jpg';
  };

  const imageSrc = getImage(product.id, product.category);
  const activeFlavour = selectedOptions['Flavour'];
  const activeFlavourDesc =
    activeFlavour && product.flavourDescriptions?.[activeFlavour]
      ? product.flavourDescriptions[activeFlavour]
      : null;
  const displayDescription = activeFlavourDesc || product.description;
  const isSpecial = !!product.label;

  return (
    <article className={`product-card flex flex-col ${product.isComingSoon ? 'opacity-70' : ''}`}>

      {/* ── Image area ── */}
      <div className="relative bg-parchment rounded-t-[20px] overflow-hidden" style={{ minHeight: 200 }}>
        {/* Wishlist button */}
        <button
          onClick={() => setWishlisted((w) => !w)}
          aria-label="Wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-espresso/40'}`}
          />
        </button>

        {/* Special label */}
        {isSpecial && (
          <div className="absolute top-3 left-3 z-10">
            <span className="special-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #4A1A08, #C4834A)' }}>
              <Sparkles className="w-2.5 h-2.5" />
              {product.label}
            </span>
          </div>
        )}

        {/* Category (non-special) */}
        {!isSpecial && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm text-espresso/60 text-[10px] font-semibold uppercase tracking-wider border border-espresso/8">
              {product.category}
            </span>
          </div>
        )}

        {/* Coming soon */}
        {product.isComingSoon && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-espresso/80 text-cream text-[10px] font-semibold">
              <Clock className="w-3 h-3" />
              Coming Soon
            </span>
          </div>
        )}

        <img
          src={imageSrc}
          alt={product.name}
          className="card-image-zoom w-full h-48 object-cover"
          loading="lazy"
        />
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex-1 flex flex-col gap-3">

        {/* Name + price row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif font-bold text-lg text-espresso leading-snug flex-1">
            {product.name}
          </h3>
          {resolvedPrice !== null && !product.isComingSoon && (
            <span
              className="flex-shrink-0 font-bold text-base px-3 py-1 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #6B2D0F, #C4834A)' }}
            >
              {formatIndianCurrency(resolvedPrice)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-espresso/55 leading-relaxed line-clamp-2">
          {displayDescription}
        </p>

        {/* Divider */}
        <div className="h-px bg-espresso/6" />

        {/* Options */}
        {product.options.length > 0 && (
          <div className="space-y-2.5">
            {product.options.map((option) => (
              <div key={option.name}>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-espresso/40 mb-1.5 block">
                  {option.name}
                </span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup">
                  {option.choices.map((choice) => {
                    const isSelected = selectedOptions[option.name] === choice;
                    const previewPrice = resolveProductPrice(product, { ...selectedOptions, [option.name]: choice });
                    return (
                      <button
                        key={choice}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={product.isComingSoon}
                        onClick={() => handleOptionChange(option.name, choice)}
                        className={`option-chip px-3 py-1.5 rounded-full text-xs font-medium border ${
                          isSelected
                            ? 'text-white border-transparent'
                            : 'bg-parchment text-espresso/70 border-espresso/10 hover:border-cocoa/30 hover:bg-linen'
                        } ${product.isComingSoon ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={isSelected ? { background: 'linear-gradient(135deg, #6B2D0F, #C4834A)', borderColor: 'transparent' } : {}}
                      >
                        <span>{choice}</span>
                        {previewPrice !== null && (option.name === 'Flavour' || option.name === 'Size' || option.name === 'Format' || option.name === 'Pack') && (
                          <span className={`block text-[9px] leading-none mt-0.5 ${isSelected ? 'opacity-75' : 'text-cocoa/60'}`}>
                            {formatIndianCurrency(previewPrice)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Custom note */}
        {!product.isComingSoon && (
          <input
            id={`note-${product.id}`}
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Custom request (optional)…"
            className="w-full px-3 py-2 text-xs rounded-xl border border-espresso/10 bg-parchment text-espresso placeholder-espresso/30 focus:outline-none focus:ring-1 focus:ring-cocoa/40 transition-all"
          />
        )}

        {/* Quantity + Add */}
        <div className="flex items-center gap-2.5 mt-auto pt-1">
          {product.isComingSoon ? (
            <button disabled className="w-full h-11 rounded-full font-medium text-sm bg-linen text-espresso/30 cursor-not-allowed border border-espresso/8">
              Coming Soon
            </button>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center rounded-full border border-espresso/12 bg-parchment overflow-hidden h-11">
                <button
                  onClick={() => handleQuantityDelta(-1)}
                  className="w-10 h-11 flex items-center justify-center text-espresso/50 hover:text-espresso hover:bg-linen active:scale-90 transition-all"
                  aria-label="Decrease"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-espresso text-sm" aria-live="polite">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityDelta(1)}
                  className="w-10 h-11 flex items-center justify-center text-espresso/50 hover:text-espresso hover:bg-linen active:scale-90 transition-all"
                  aria-label="Increase"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={handleAdd}
                className={`flex-1 h-11 rounded-full font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] ${
                  justAdded
                    ? 'bg-green-success text-white added-indicator'
                    : isSpecial
                    ? 'add-btn-special text-white'
                    : 'btn-choco'
                }`}
                style={!justAdded && isSpecial ? { background: 'linear-gradient(135deg, #4A1A08, #C4834A)' } : {}}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                    {resolvedPrice !== null && (
                      <span className="font-bold opacity-80 text-xs">
                        {formatIndianCurrency(resolvedPrice * quantity)}
                      </span>
                    )}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
