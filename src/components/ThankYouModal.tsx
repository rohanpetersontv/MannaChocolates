import React, { useState } from 'react';
import { MessageCircle, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { CartItem } from '../utils/helpers';

interface ThankYouModalProps {
  isOpen: boolean;
  orderText: string;
  primaryWhatsAppUrl: string | null;
  secondaryWhatsAppUrl: string | null;
  orderedItems: CartItem[];
  onClose: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  orderText,
  primaryWhatsAppUrl,
  secondaryWhatsAppUrl,
  orderedItems,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = orderText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-espresso/60 backdrop-blur-2xs flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thank-you-title"
    >
      <div className="relative w-full max-w-lg bg-cream rounded-xl shadow-sheet border border-[#E8DCCF] overflow-hidden text-espresso my-8 dialog-fade">
        {/* Banner */}
        <div className="bg-cocoa text-cream p-6 text-center space-y-2">
          <div className="relative inline-block mx-auto mb-1">
            <img
              src="/images/logo.jpg"
              alt="Manna Chocolates"
              className="w-16 h-16 rounded-full object-cover border-2 border-gold shadow-md mx-auto"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-success text-cream flex items-center justify-center border-2 border-cocoa shadow-xs">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
          </div>
          <h2 id="thank-you-title" className="font-serif text-2xl font-bold text-cream">
            You have successfully ordered!
          </h2>
          <p className="text-xs sm:text-sm text-cream/90 max-w-sm mx-auto leading-relaxed">
            We have received your order details and we will get back to you soon on WhatsApp to confirm availability and payment.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Ordered Items Summary */}
          {orderedItems && orderedItems.length > 0 && (
            <div className="p-3.5 rounded-lg bg-white border border-[#E8DCCF] space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-espresso">
                Ordered Items
              </span>
              <div className="space-y-1.5">
                {orderedItems.map((item, idx) => {
                  const opts = Object.entries(item.selectedOptions);
                  return (
                    <div key={idx} className="flex items-start justify-between text-xs border-b border-[#F2EAE0] pb-1.5 last:border-none last:pb-0">
                      <div>
                        <span className="font-semibold text-espresso">{item.name}</span>
                        {opts.length > 0 && (
                          <div className="text-[11px] text-[#68534D]">
                            {opts.map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-cocoa px-2 py-0.5 rounded bg-cream border border-[#E8DCCF]">
                        × {item.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#68534D]">
                Order text sent:
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-cocoa hover:text-espresso flex items-center gap-1 px-2 py-0.5 rounded border border-[#E8DCCF] bg-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-success" />
                    <span className="text-green-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-white rounded-lg border border-[#E8DCCF] text-xs font-mono text-espresso whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {orderText}
            </pre>
          </div>

          {/* Action buttons for WhatsApp */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {primaryWhatsAppUrl && (
                <a
                  href={primaryWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-3 py-2 bg-green-success hover:bg-[#1f5f3e] text-white font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp 94498 02000</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              )}

              {secondaryWhatsAppUrl && (
                <a
                  href={secondaryWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[46px] px-3 py-2 bg-white hover:bg-cream border border-[#E8DCCF] text-espresso font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
                >
                  <MessageCircle className="w-4 h-4 text-green-success" />
                  <span>WhatsApp 63625 51322</span>
                  <ExternalLink className="w-3 h-3 opacity-75" />
                </a>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="w-full min-h-[44px] px-4 py-2 bg-white hover:bg-cream border border-[#E8DCCF] text-espresso font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-success" />
                  <span className="text-green-success">Order text copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cocoa" />
                  <span>Copy order text</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full min-h-[40px] py-1.5 text-[#68534D] hover:text-espresso font-medium text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Back to Chocolates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
