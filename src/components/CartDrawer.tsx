import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, formatIndianCurrency, calculateCartSubtotal } from '../utils/helpers';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = calculateCartSubtotal(items);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const getImage = (productId: string) => {
    if (productId.startsWith('bar') || productId.includes('bar')) return '/images/dark_chocolate_bar.jpg';
    if (productId.includes('bites')) return '/images/chocolate_bites.jpg';
    return '/images/gift_pack.jpg';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-espresso/50 backdrop-blur-2xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-cream border-l border-[#E8DCCF] text-espresso shadow-sheet flex flex-col drawer-enter">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DCCF] bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-cocoa" />
              <h2 id="cart-drawer-title" className="font-serif text-xl font-bold text-espresso">
                Your Cart {totalItemCount > 0 && `(${totalItemCount})`}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-espresso/70 hover:text-espresso rounded-md hover:bg-cream transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List / Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <img
                  src="/images/logo.jpg"
                  alt="Manna Chocolates"
                  className="w-16 h-16 rounded-full object-cover border border-[#C8A15A]/70 shadow-xs mx-auto mb-1"
                />
                <div className="space-y-1">
                  <p className="font-serif text-lg font-bold text-espresso">Your cart is empty</p>
                  <p className="text-xs text-[#68534D]">
                    Pick chocolates from the collection to start your order.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2.5 min-h-[48px] bg-cocoa text-cream text-sm font-medium rounded-lg hover:bg-espresso transition-colors"
                >
                  Browse Chocolates
                </button>
              </div>
            ) : (
              items.map((item) => {
                const optValues = Object.entries(item.selectedOptions);
                const itemTotal = item.unitPrice !== null ? item.unitPrice * item.quantity : null;
                const thumbSrc = getImage(item.productId);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg bg-white border border-[#E8DCCF] space-y-2.5"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={thumbSrc}
                        alt={item.name}
                        className="w-14 h-14 rounded-md object-cover border border-[#E8DCCF] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-base text-espresso leading-snug truncate">
                          {item.name}
                        </h3>
                        {optValues.length > 0 && (
                          <div className="flex flex-wrap gap-1 text-[11px] text-[#68534D] mt-1">
                            {optValues.map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded bg-cream border border-[#E8DCCF]"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-espresso/50 hover:text-red-700 p-1.5 -mr-1 rounded min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F2EAE0]">
                      {/* Stepper */}
                      <div className="flex items-center bg-cream border border-[#E8DCCF] rounded-md">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-espresso hover:bg-[#E8DCCF]/50 transition-colors"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-espresso text-xs" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-espresso hover:bg-[#E8DCCF]/50 transition-colors"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right">
                        {itemTotal !== null ? (
                          <span className="font-bold text-base text-cocoa">
                            {formatIndianCurrency(itemTotal)}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#7A5A4A] italic">
                            Price on WhatsApp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8DCCF] bg-white space-y-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-[#68534D]">Estimated Total:</span>
                <div>
                  {subtotal !== null ? (
                    <span className="font-serif text-xl font-bold text-cocoa">
                      {formatIndianCurrency(subtotal)}
                    </span>
                  ) : (
                    <span className="font-medium text-xs sm:text-sm text-espresso italic">
                      Total will be shared on WhatsApp
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full min-h-[48px] px-5 py-3 bg-cocoa hover:bg-espresso text-cream font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] text-base"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
