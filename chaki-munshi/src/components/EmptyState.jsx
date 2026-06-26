import { useLanguage } from '../context/LanguageContext';

export default function EmptyState({ icon, message, messageUrdu, actionText, actionTextUrdu, onAction }) {
  const { isRtl } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low animate-scale-in">
      <span className="material-symbols-outlined text-[48px] text-primary/50 mb-3">
        {icon || 'inbox'}
      </span>
      <p className="text-on-surface-variant text-sm font-semibold">{message}</p>
      {messageUrdu && <p className="urdu-font text-xs text-primary leading-none mt-1">{messageUrdu}</p>}

      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-md hover:opacity-90 button-click min-h-0"
        >
          {isRtl && actionTextUrdu ? actionTextUrdu : actionText}
        </button>
      )}
    </div>
  );
}
