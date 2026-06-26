export default function Modal({ isOpen, onClose, title, titleUrdu, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />

      {/* Dialog */}
      <div className="relative w-full sm:max-w-md bg-surface border-t sm:border border-outline-variant rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl z-10 animate-slide-up max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="font-bold text-lg text-on-surface">{title}</h3>
            {titleUrdu && <p className="urdu-font text-xs text-primary leading-none mt-1">{titleUrdu}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors min-h-0 min-w-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
