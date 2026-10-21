import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag, Check, Clock } from 'lucide-react';
import { Product, formatIndianCurrency, resolveProductPrice } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedOptions: Record<string, string>, quantity: number, resolvedPrice: number | null) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  // Initialize option state with first available choice
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.choices && opt.choices.length > 0) {
        initial[opt.name] = opt.choices[0];
      }
    });
    return initial;
  });

  const [customNote, setCustomNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleOptionChange = (optionName: string, choice: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: choice }));
  };

  const handleQuantityDelta = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Resolve current price based on selected options
  const resolvedPrice = resolveProductPrice(product, selectedOptions);

  const handleAdd = () => {
    if (product.isComingSoon) return;
    const finalOptions = { ...selectedOptions };
    if (customNote.trim()) {
      finalOptions['Customization'] = customNote.trim();
    }
    onAddToCart(product, finalOptions, quantity, resolvedPrice);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const getImage = (id: string, category: string) => {
    if (id.startsWith('bar') || id.includes('bar')) return '/images/dark_chocolate_bar.jpg';
    if (id.includes('bites') || category.toLowerCase().includes('bites')) return '/images/chocolate_bites.jpg';
    return '/images/gift_pack.jpg';
  };

  const imageSrc = getImage(product.id, product.category);

  return (
    <article className={`rounded-xl bg-white border ${
      product.isComingSoon ? 'border-[#E8DCCF] opacity-80' : 'border-[#E8DCCF] hover:border-bronze shadow-card'
    } transition-colors flex flex-col overflow-hidden`}>
      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream">
        <img
          src={imageSrc}
          alt={product.name}
          className={`w-full h-full object-cover ${product.isComingSoon ? 'grayscale-[25%]' : 'img-zoom'}`}
          loading="lazy"
        />
        
        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md bg-cream/95 text-espresso border border-[#E8DCCF] text-xs font-semibold uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Price / Coming Soon badge */}
        <div className="absolute top-3 right-3">
          {product.isComingSoon ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-700 text-white font-semibold text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </span>
          ) : resolvedPrice !== null ? (
            <span className="px-3 py-1 rounded-md bg-cocoa text-cream font-bold text-sm">
              {formatIndianCurrency(resolvedPrice)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-espresso">
            {product.name}
          </h3>
          <p className="text-sm text-[#68534D] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Options */}
        {product.options && product.options.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#F2EAE0]">
            {product.options.map((option) => (
              <div key={option.name} className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#68534D]">
                  {option.name}
                </span>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={option.name}>
                  {option.choices.map((choice) => {
                    const isSelected = selectedOptions[option.name] === choice;
                    // Compute preview price for this choice
                    const previewOptions = { ...selectedOptions, [option.name]: choice };
                    const previewPrice = resolveProductPrice(product, previewOptions);

                    return (
                      <button
                        key={choice}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={product.isComingSoon}
                        onClick={() => handleOptionChange(option.name, choice)}
                        className={`px-3 py-1.5 min-h-[38px] rounded-md text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-cocoa text-cream font-semibold'
                            : 'bg-cream text-espresso border border-[#E8DCCF] hover:border-cocoa'
                        } ${product.isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>{choice}</span>
                        {/* Show price hint only for flavour/size buttons where it changes */}
                        {previewPrice !== null && (option.name === 'Flavour' || option.name === 'Size') && (
                          <span className={`block text-[10px] leading-tight mt-0.5 ${isSelected ? 'text-cream/80' : 'text-[#9E6938]'}`}>
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

        {/* Customization input */}
        {!product.isComingSoon && (
          <div className="pt-2 border-t border-[#F2EAE0] space-y-1">
            <label htmlFor={`note-${product.id}`} className="block text-xs font-semibold text-[#68534D]">
              Custom request (optional)
            </label>
            <input
              id={`note-${product.id}`}
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. less sweet, extra nuts..."
              className="w-full px-3 py-2 text-xs rounded-md border border-[#E8DCCF] bg-white text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa"
            />
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="pt-3 border-t border-[#F2EAE0] flex items-center gap-2.5">
          {product.isComingSoon ? (
            <button
              disabled
              className="w-full min-h-[48px] px-4 py-3 rounded-lg font-medium text-sm bg-cream border border-[#E8DCCF] text-[#8C7668] cursor-not-allowed"
            >
              Coming Soon
            </button>
          ) : (
            <>
              {/* Stepper */}
              <div className="flex items-center bg-cream rounded-lg border border-[#E8DCCF] min-h-[48px]">
                <button
                  type="button"
                  onClick={() => handleQuantityDelta(-1)}
                  className="w-10 h-10 flex items-center justify-center text-espresso hover:bg-[#E8DCCF]/50 transition-colors"
                  aria-label={`Decrease quantity of ${product.name}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-espresso text-sm" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityDelta(1)}
                  className="w-10 h-10 flex items-center justify-center text-espresso hover:bg-[#E8DCCF]/50 transition-colors"
                  aria-label={`Increase quantity of ${product.name}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 min-h-[48px] px-4 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  justAdded
                    ? 'bg-green-success text-white added-indicator'
                    : 'bg-cocoa hover:bg-espresso text-cream'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-gold" />
                    <span>Add to Cart</span>
                    {resolvedPrice !== null && (
                      <span className="text-gold/90 font-bold">{formatIndianCurrency(resolvedPrice * quantity)}</span>
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
