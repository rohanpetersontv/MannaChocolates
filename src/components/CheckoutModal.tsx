import React, { useState } from 'react';
import { X, Send, AlertCircle, Calendar, MapPin, Phone, User, MessageSquare, Truck, Store, Check } from 'lucide-react';
import {
  CartItem,
  OrderForm,
  Settings,
  normalizeIndianPhone,
  calculateCartSubtotal,
  calculateDeliveryFee,
  getDeliveryInfo,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatIndianCurrency,
} from '../utils/helpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  settings: Settings;
  onOrderSubmitted: (
    orderText: string,
    primaryWaUrl: string | null,
    secondaryWaUrl: string | null,
    orderedItems: CartItem[]
  ) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  settings,
  onOrderSubmitted,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<OrderForm>({
    name: '',
    phone: '',
    orderType: 'Delivery',
    address: '',
    pincode: '',
    neededByDate: todayStr,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const subtotal = calculateCartSubtotal(items);
  const deliveryFee = calculateDeliveryFee(formData.orderType, formData.pincode, subtotal, settings);
  const deliveryInfo = getDeliveryInfo(formData.orderType, formData.pincode, settings);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    const normalizedPhone = normalizeIndianPhone(formData.phone);
    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!normalizedPhone) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number.';
    }

    if (formData.orderType === 'Delivery') {
      if (!formData.address.trim()) {
        newErrors.address = 'Please enter your delivery address.';
      }
      if (!formData.pincode.trim()) {
        newErrors.pincode = 'Please enter your 6-digit postal pincode.';
      } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
        newErrors.pincode = 'Pincode must be 6 digits.';
      }
    }

    if (!formData.neededByDate) {
      newErrors.neededByDate = 'Please select a date.';
    } else if (formData.neededByDate < todayStr) {
      newErrors.neededByDate = 'Please select today or a future date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!validate()) {
      return;
    }

    const primaryNumber = settings.whatsappNumber || '919449802000';
    const secondaryNumber = settings.secondaryContactNumber || '916362551322';

    const message = buildWhatsAppMessage(formData, items, subtotal, deliveryFee);
    const primaryUrl = buildWhatsAppUrl(primaryNumber, message);
    const secondaryUrl = buildWhatsAppUrl(secondaryNumber, message);

    if (primaryUrl) {
      window.open(primaryUrl, '_blank', 'noopener,noreferrer');
    }

    onOrderSubmitted(message, primaryUrl, secondaryUrl, items);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(46,14,0,0.55)', backdropFilter: 'blur(10px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-dialog-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden my-8 dialog-fade rounded-3xl"
        style={{
          background: '#fff',
          border: '1px solid rgba(74,26,8,0.08)',
          boxShadow: '0 32px 80px rgba(46,14,0,0.2)',
          color: '#2E0E00',
        }}
      >
        {/* Top brown accent bar */}
        <div className="h-1.5 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #4A1A08, #C4834A, #4A1A08)' }} />
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(74,26,8,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="p-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #C4834A, #6B2D0F)' }}>
              <img
                src="/images/logo.jpg"
                alt="Manna Chocolates"
                className="w-9 h-9 rounded-full object-cover"
                style={{ border: '2px solid #fff' }}
              />
            </div>
            <div>
              <h2 id="checkout-dialog-title" className="font-serif text-lg font-bold leading-tight" style={{ color: '#4A1A08' }}>
                Complete Your Order
              </h2>
              <p className="text-[11px]" style={{ color: '#C4834A' }}>
                Sent directly via WhatsApp · under 1 minute
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-espresso/10 text-espresso/30 hover:text-espresso hover:border-espresso/25 transition-all"
            aria-label="Close checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer-name" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C4834A' }} />
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (attemptedSubmit) setErrors({ ...errors, name: '' });
                }}
                placeholder="Your name"
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-xl text-base focus:outline-none transition-all"
                style={{
                  background: errors.name ? 'rgba(220,38,38,0.06)' : '#F5EDE0',
                  border: errors.name ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(74,26,8,0.1)',
                  color: '#2E0E00',
                }}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* Customer Phone */}
          <div>
            <label htmlFor="customer-phone" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
              WhatsApp Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C4834A' }} />
              <input
                id="customer-phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (attemptedSubmit) setErrors({ ...errors, phone: '' });
                }}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-xl text-base focus:outline-none transition-all"
                style={{
                  background: errors.phone ? 'rgba(220,38,38,0.06)' : '#F5EDE0',
                  border: errors.phone ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(74,26,8,0.1)',
                  color: '#2E0E00',
                }}
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </p>
            ) : (
              <p className="mt-1 text-[11px]" style={{ color: '#7A5140' }}>
                We reply to this number on WhatsApp to confirm availability.
              </p>
            )}
          </div>

          {/* Order Method */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
              Order Type
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['Delivery', 'Pickup'] as const).map((type) => {
                const isActive = formData.orderType === type;
                const Icon = type === 'Delivery' ? Truck : Store;
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 p-3 rounded-xl cursor-pointer min-h-[48px] transition-all"
                    style={isActive ? {
                      background: 'rgba(107,45,15,0.08)',
                      border: '1px solid rgba(107,45,15,0.3)',
                      color: '#6B2D0F',
                    } : {
                      background: '#F5EDE0',
                      border: '1px solid rgba(74,26,8,0.08)',
                      color: '#7A5140',
                    }}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      checked={isActive}
                      onChange={() => setFormData({ ...formData, orderType: type })}
                      className="w-4 h-4"
                    />
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Conditional Address & Pincode for Delivery */}
          {formData.orderType === 'Delivery' && (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: '#F5EDE0', border: '1px solid rgba(74,26,8,0.08)' }}>
              <div>
                <label htmlFor="delivery-address" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: '#C4834A' }} />
                  <textarea
                    id="delivery-address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (attemptedSubmit) setErrors({ ...errors, address: '' });
                    }}
                    placeholder="House/flat no., street, landmark, area"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
                    style={{
                      background: errors.address ? 'rgba(220,38,38,0.06)' : '#fff',
                      border: errors.address ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(74,26,8,0.1)',
                      color: '#2E0E00',
                    }}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="delivery-pincode" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  id="delivery-pincode"
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => {
                    setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') });
                    if (attemptedSubmit) setErrors({ ...errors, pincode: '' });
                  }}
                  placeholder="6-digit pincode"
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    background: errors.pincode ? 'rgba(220,38,38,0.06)' : '#fff',
                    border: errors.pincode ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(74,26,8,0.1)',
                    color: '#2E0E00',
                  }}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.pincode}
                  </p>
                )}
              </div>

              <div
                className="p-2.5 rounded-xl text-xs flex items-start gap-2"
                style={deliveryInfo.isFree ? {
                  background: 'rgba(38,115,77,0.08)',
                  border: '1px solid rgba(38,115,77,0.25)',
                  color: '#26734D',
                } : {
                  background: 'rgba(107,45,15,0.06)',
                  border: '1px solid rgba(107,45,15,0.12)',
                  color: '#7A5140',
                }}
              >
                {deliveryInfo.isFree
                  ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  : <Truck className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span>{deliveryInfo.note}</span>
              </div>
            </div>
          )}

          {/* Needed By Date */}
          <div>
            <label htmlFor="needed-by-date" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
              Needed By Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#C4834A' }} />
              <input
                id="needed-by-date"
                type="date"
                min={todayStr}
                value={formData.neededByDate}
                onChange={(e) => {
                  setFormData({ ...formData, neededByDate: e.target.value });
                  if (attemptedSubmit) setErrors({ ...errors, neededByDate: '' });
                }}
                className="w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: errors.neededByDate ? 'rgba(220,38,38,0.06)' : '#F5EDE0',
                  border: errors.neededByDate ? '1px solid rgba(220,38,38,0.4)' : '1px solid rgba(74,26,8,0.1)',
                  color: '#2E0E00',
                  colorScheme: 'light',
                }}
              />
            </div>
            {errors.neededByDate && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.neededByDate}
              </p>
            )}
          </div>

          {/* Gift Message / Special Notes */}
          <div>
            <label htmlFor="order-notes" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#7A5140' }}>
              Notes or Gift Message <span className="font-normal normal-case" style={{ color: '#C4834A' }}>(optional)</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4" style={{ color: '#C4834A' }} />
              <textarea
                id="order-notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Gift message or special requests…"
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: '#F5EDE0',
                  border: '1px solid rgba(74,26,8,0.1)',
                  color: '#2E0E00',
                }}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(74,26,8,0.08)' }}>
            <div className="flex justify-between text-xs" style={{ color: '#7A5140' }}>
              <span>Items in order</span>
              <span className="font-semibold" style={{ color: '#4A1A08' }}>{items.reduce((s, i) => s + i.quantity, 0)} items</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs" style={{ color: '#7A5140' }}>Estimated Total</span>
              <div>
                {subtotal !== null ? (
                  <span className="font-serif font-bold text-xl" style={{ color: '#4A1A08' }}>
                    {formatIndianCurrency(subtotal)}
                  </span>
                ) : (
                  <span className="text-sm italic" style={{ color: '#7A5140' }}>Confirmed on WhatsApp</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-choco w-full min-h-[52px] rounded-2xl font-bold text-base flex items-center justify-center gap-2.5"
          >
            <Send className="w-4 h-4" />
            <span>Send Order via WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
};
