import { useLanguage } from '../context/LanguageContext';

export default function EntryCard({ type, invoiceNo, customerName, quantity, amount, status, date, onClick }) {
  const { t } = useLanguage();
  const isWheat = type === 'wheat';

  const getStatusBadge = () => {
    if (status === 'Completed' || status === 'Paid') {
      return (
        <span className="px-2 py-0.5 bg-success-green/10 text-success-green text-[10px] font-bold rounded uppercase">
          {status === 'Completed' ? t('completed') : t('paid')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-error-container text-danger-red text-[10px] font-bold rounded uppercase">
        {t('udhaar')}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant flex items-center justify-between gap-3 hover:border-primary transition-colors cursor-pointer group button-click shadow-sm"
    >
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center ${
          isWheat ? 'bg-wheat-light text-primary' : 'bg-secondary-fixed text-secondary'
        }`}>
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
            {isWheat ? 'scale' : 'local_shipping'}
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm sm:text-base text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
            {customerName}
          </h4>
          <p className="text-xs text-on-surface-variant mt-1 flex gap-1.5 items-center">
            <span>{isWheat ? t('wheatTab') : t('flourTab')}</span>
            <span className="text-[10px] opacity-40">•</span>
            <span className="font-mono text-[11px] truncate">{invoiceNo}</span>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="text-right shrink-0">
        <p className="font-bold text-sm sm:text-base text-on-surface">
          {isWheat ? `${quantity} ${t('kg')}` : `Rs. ${amount}`}
        </p>
        <div className="mt-1">{getStatusBadge()}</div>
      </div>
    </div>
  );
}
