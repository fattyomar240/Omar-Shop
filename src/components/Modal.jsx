import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  iconClassName = 'text-amber-400',
  children,
  footer,
  onSubmit,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const Body = onSubmit ? 'form' : 'div';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full sm:max-w-lg md:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-xl border border-slate-200 flex flex-col max-h-[90dvh] overflow-hidden mb-[env(safe-area-inset-bottom)] sm:mb-0"
      >
        <div className="flex-shrink-0 flex items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white rounded-t-2xl">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 min-w-0">
            {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${iconClassName}`} />}
            <span className="leading-snug break-words">{title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Body onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 space-y-4">
            {children}
          </div>
          {footer && (
            <div className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-white sticky bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {footer}
            </div>
          )}
        </Body>
      </div>
    </div>
  );
}
