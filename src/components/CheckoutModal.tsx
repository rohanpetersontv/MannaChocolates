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
      className="fixed inset-0 z-50 overflow-y-auto bg-espresso/60 backdrop-blur-2xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-dialog-title"
    >
      <div className="relative w-full max-w-lg bg-cream rounded-xl shadow-sheet border border-[#E8DCCF] overflow-hidden text-espresso my-8 dialog-fade">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8DCCF] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.jpg"
              alt="Manna Chocolates"
              className="w-10 h-10 rounded-full object-cover border border-[#C8A15A]/70 shadow-xs"
            />
            <div>
              <h2 id="checkout-dialog-title" className="font-serif text-xl font-bold text-espresso leading-tight">
                Checkout
              </h2>
              <p className="text-xs text-[#68534D]">
                Order directly via WhatsApp in under 1 minute
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-espresso/70 hover:text-espresso rounded-md hover:bg-cream transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Customer Name */}
          <div>
            <label htmlFor="customer-name" className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
              Your Name <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7668]" />
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
                className={`w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-lg border ${
                  errors.name ? 'border-red-600 bg-red-50/50' : 'border-[#E8DCCF] bg-white'
                } text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa text-base`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* Customer Phone */}
          <div>
            <label htmlFor="customer-phone" className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
              WhatsApp Phone Number <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7668]" />
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
                className={`w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-lg border ${
                  errors.phone ? 'border-red-600 bg-red-50/50' : 'border-[#E8DCCF] bg-white'
                } text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa text-base`}
              />
            </div>
            {errors.phone ? (
              <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#68534D]">
                We reply to this number to confirm availability.
              </p>
            )}
          </div>

          {/* Order Method */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1.5">
              Order Type
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer min-h-[48px] transition-colors ${
                  formData.orderType === 'Delivery'
                    ? 'border-cocoa bg-white font-medium text-espresso'
                    : 'border-[#E8DCCF] bg-cream text-[#68534D]'
                }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="Delivery"
                  checked={formData.orderType === 'Delivery'}
                  onChange={() => setFormData({ ...formData, orderType: 'Delivery' })}
                  className="w-4 h-4 text-cocoa"
                />
                <Truck className="w-4 h-4 text-cocoa" />
                <span className="text-sm">Delivery</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer min-h-[48px] transition-colors ${
                  formData.orderType === 'Pickup'
                    ? 'border-cocoa bg-white font-medium text-espresso'
                    : 'border-[#E8DCCF] bg-cream text-[#68534D]'
                }`}
              >
                <input
                  type="radio"
                  name="orderType"
                  value="Pickup"
                  checked={formData.orderType === 'Pickup'}
                  onChange={() => setFormData({ ...formData, orderType: 'Pickup' })}
                  className="w-4 h-4 text-cocoa"
                />
                <Store className="w-4 h-4 text-cocoa" />
                <span className="text-sm">Pickup</span>
              </label>
            </div>
          </div>

          {/* Conditional Address & Pincode for Delivery */}
          {formData.orderType === 'Delivery' && (
            <div className="p-3.5 rounded-lg bg-white border border-[#E8DCCF] space-y-3">
              <div>
                <label htmlFor="delivery-address" className="block text-xs font-semibold text-espresso mb-1">
                  Address <span className="text-red-700">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#8C7668]" />
                  <textarea
                    id="delivery-address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (attemptedSubmit) setErrors({ ...errors, address: '' });
                    }}
                    placeholder="House/flat no., street, landmark, area"
                    className={`w-full pl-9 pr-3 py-2 rounded-md border ${
                      errors.address ? 'border-red-600 bg-red-50/50' : 'border-[#E8DCCF] bg-cream'
                    } text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa text-sm`}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="delivery-pincode" className="block text-xs font-semibold text-espresso mb-1">
                  Pincode <span className="text-red-700">*</span>
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
                  className={`w-full px-3 py-2.5 min-h-[48px] rounded-md border ${
                    errors.pincode ? 'border-red-600 bg-red-50/50' : 'border-[#E8DCCF] bg-cream'
                  } text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa text-sm`}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.pincode}
                  </p>
                )}
              </div>

              {/* Delivery rule notice: free within 10 km via freeDeliveryPincodes, otherwise charges confirmed on WhatsApp */}
              <div
                className={`p-2.5 rounded-md border text-xs flex items-start gap-2 ${
                  deliveryInfo.isFree
                    ? 'bg-emerald-50 border-emerald-300 text-green-success font-medium'
                    : 'bg-cream border-[#E8DCCF] text-[#68534D]'
                }`}
              >
                {deliveryInfo.isFree ? (
                  <Check className="w-4 h-4 text-green-success flex-shrink-0 mt-0.5" />
                ) : (
                  <Truck className="w-4 h-4 text-cocoa flex-shrink-0 mt-0.5" />
                )}
                <span>{deliveryInfo.note}</span>
              </div>
            </div>
          )}

          {/* Needed By Date */}
          <div>
            <label htmlFor="needed-by-date" className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
              Needed By Date <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7668]" />
              <input
                id="needed-by-date"
                type="date"
                min={todayStr}
                value={formData.neededByDate}
                onChange={(e) => {
                  setFormData({ ...formData, neededByDate: e.target.value });
                  if (attemptedSubmit) setErrors({ ...errors, neededByDate: '' });
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 min-h-[48px] rounded-lg border ${
                  errors.neededByDate ? 'border-red-600 bg-red-50/50' : 'border-[#E8DCCF] bg-white'
                } text-espresso focus:outline-none focus:ring-1 focus:ring-cocoa text-sm`}
              />
            </div>
            {errors.neededByDate && (
              <p className="mt-1 text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.neededByDate}
              </p>
            )}
          </div>

          {/* Gift Message / Special Notes */}
          <div>
            <label htmlFor="order-notes" className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-1">
              Notes or Gift Message <span className="text-[#8C7668] font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#8C7668]" />
              <textarea
                id="order-notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Gift message or special requests (optional)"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E8DCCF] bg-white text-espresso placeholder-[#A69389] focus:outline-none focus:ring-1 focus:ring-cocoa text-sm"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="pt-2 border-t border-[#E8DCCF] text-xs space-y-1 text-[#68534D]">
            <div className="flex justify-between">
              <span>Items count:</span>
              <span className="font-semibold text-espresso">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-0.5">
              <span>Estimated Total:</span>
              <div>
                {subtotal !== null ? (
                  <span className="font-serif font-bold text-base text-cocoa">
                    {formatIndianCurrency(subtotal)}
                  </span>
                ) : (
                  <span className="font-medium text-espresso italic">To be confirmed</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 bg-cocoa hover:bg-espresso text-cream font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.99] text-base"
          >
            <Send className="w-4 h-4" />
            <span>Send Order</span>
          </button>
        </form>
      </div>
    </div>
  );
};
