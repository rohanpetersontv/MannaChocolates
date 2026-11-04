import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Package, CheckCircle2, Sparkles } from 'lucide-react';
import { CartItem, formatIndianCurrency, calculateCartSubtotal } from '../utils/helpers';

interface DeliveryStatus {
  type: 'none' | 'local' | 'national';
  message: string;
  progress: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  cartSubtotal: number;
  deliveryStatus: DeliveryStatus | null;
}

const getImage = (productId: string) => {
  if (productId.includes('paan'))   return '/images/paan_bites.jpg';
  if (productId.includes('orange')) return '/images/midnight_orange_bites.jpg';
  if (productId.includes('bar'))    return '/images/dark_chocolate_bar.jpg';
  if (productId.includes('bites'))  return '/images/chocolate_bites.jpg';
  return '/images/gift_pack.jpg';
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onProceedToCheckout, cartSubtotal, deliveryStatus,
}) => {
  if (!isOpen) return null;

  const subtotal = calculateCartSubtotal(items);
  const totalItemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: 'rgba(46,14,0,0.5)', backdropFilter: 'blur(8px)' }}
      role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md flex flex-col drawer-bg drawer-enter" style={{ borderLeft: '1px solid rgba(74,26,8,0.08)', boxShadow: '-8px 0 40px rgba(46,14,0,0.12)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-espresso/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(107,45,15,0.09)' }}>
                <ShoppingBag className="w-4 h-4" style={{ color: '#6B2D0F' }} />
              </div>
              <div>
                <h2 id="cart-drawer-title" className="font-serif text-lg font-bold text-espresso leading-tight">Your Cart</h2>
                {totalItemCount > 0 && <p className="text-[11px] text-espresso/40">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</p>}
              </div>
            </div>
            <button onClick={onClose} aria-label="Close cart"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-espresso/10 text-espresso/40 hover:text-espresso hover:border-espresso/25 hover:bg-espresso/4 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery Progress */}
          {items.length > 0 && deliveryStatus && (
            <div className="px-5 py-3" style={{ background: 'rgba(107,45,15,0.04)', borderBottom: '1px solid rgba(107,45,15,0.07)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                {deliveryStatus.type === 'national'
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-success flex-shrink-0" />
                  : <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6B2D0F' }} />}
                <p className={`text-xs font-semibold ${deliveryStatus.type === 'national' ? 'text-green-success' : 'text-cocoa'}`}>
                  {deliveryStatus.message}
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-espresso/8">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${deliveryStatus.progress}%`,
                    background: deliveryStatus.type === 'national'
                      ? 'linear-gradient(90deg, #26734D, #34d399)'
                      : 'linear-gradient(90deg, #6B2D0F, #C4834A)',
                  }} />
              </div>
              <div className="flex justify-between text-[10px] text-espresso/35 mt-1">
                <span>₹0</span>
                <span className={cartSubtotal >= 500 ? 'text-green-success font-bold' : ''}>₹500</span>
                <span className={cartSubtotal >= 999 ? 'text-green-success font-bold' : ''}>₹999 Pan-India</span>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <img src="/images/logo.jpg" alt="Manna" className="w-20 h-20 rounded-full object-cover border-2 border-espresso/10" />
                <div>
                  <p className="font-serif text-xl font-bold text-espresso">Your cart is empty</p>
                  <p className="text-xs text-espresso/40 mt-1 max-w-xs">Browse our handcrafted chocolates and place your order.</p>
                </div>
                <button onClick={onClose} className="btn-choco px-6 py-2.5 text-sm mt-2">Browse Chocolates</button>
              </div>
            ) : (
              items.map((item) => {
                const opts = Object.entries(item.selectedOptions);
                const total = item.unitPrice !== null ? item.unitPrice * item.quantity : null;
                return (
                  <div key={item.id} className="p-3.5 rounded-2xl border border-espresso/7 bg-parchment/50 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <img src={getImage(item.productId)} alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-espresso/8 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-bold text-sm text-espresso leading-snug truncate">{item.name}</h3>
                        {opts.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {opts.map(([k, v]) => (
                              <span key={k} className="px-1.5 py-0.5 rounded text-[10px] text-cocoa font-medium"
                                style={{ background: 'rgba(107,45,15,0.08)' }}>{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => onRemoveItem(item.id)} aria-label={`Remove ${item.name}`}
                        className="text-espresso/20 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-espresso/6">
                      <div className="flex items-center rounded-full overflow-hidden border border-espresso/10"
                        style={{ background: '#fff' }}>
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-espresso/40 hover:text-espresso hover:bg-espresso/5 transition-all" aria-label="Decrease">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-bold text-espresso text-xs" aria-live="polite">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-espresso/40 hover:text-espresso hover:bg-espresso/5 transition-all" aria-label="Increase">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {total !== null
                        ? <span className="font-bold text-base" style={{ color: '#6B2D0F' }}>{formatIndianCurrency(total)}</span>
                        : <span className="text-xs text-espresso/40 italic">Price on WhatsApp</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-5 space-y-4 border-t border-espresso/8 bg-parchment/30">
              <div className="space-y-1 text-xs text-espresso/40">
                <div className="flex items-center gap-1.5"><Truck className="w-3 h-3 text-cocoa/50" /><span>Free within 10 km on orders above ₹500</span></div>
                <div className="flex items-center gap-1.5"><Package className="w-3 h-3 text-cocoa/50" /><span>Free Pan-India shipping above ₹999</span></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-espresso/55">Estimated Total</span>
                {subtotal !== null
                  ? <span className="font-serif text-2xl font-bold" style={{ color: '#4A1A08' }}>{formatIndianCurrency(subtotal)}</span>
                  : <span className="text-sm text-espresso/40 italic">Confirmed on WhatsApp</span>}
              </div>

              <button onClick={onProceedToCheckout}
                className="btn-choco w-full min-h-[50px] rounded-2xl font-bold text-base flex items-center justify-center gap-2.5">
                <Sparkles className="w-4 h-4" />
                Proceed to Order
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
