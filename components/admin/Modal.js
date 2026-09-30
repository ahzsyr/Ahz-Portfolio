import { useEffect, useId, useRef } from "react";

const sizeClass = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  layer = 50,
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const top = dialogs[dialogs.length - 1];
      if (panelRef.current && top === panelRef.current) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus?.();
    }, 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: layer }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={`relative w-full ${sizeClass[size] || sizeClass.lg} max-h-[90vh] flex flex-col bg-white rounded-xl shadow-xl border border-slate-200`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg font-semibold text-slate-900 leading-snug"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-sm text-slate-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-md"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-slate-200 px-5 py-3 bg-slate-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
