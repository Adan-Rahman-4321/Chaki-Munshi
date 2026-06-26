import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Customers() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = (searchVal = '') => {
    setLoading(true);
    api.getCustomers(searchVal)
      .then((res) => {
        if (res.success) {
          setCustomers(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(search);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <div className="space-y-stack-md animate-fade-in">
      {/* Directory Title */}
      <section className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{t('customersTitle')}</h2>
          <p className="urdu-font text-[10px] text-primary leading-none mt-1">گاہکوں کی فہرست اور تفصیلات</p>
        </div>
      </section>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl pl-11 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-outline">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Loading & Customer Cards List */}
      {loading ? (
        <LoadingSpinner />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="groups"
          message={t('noCustomers')}
          messageUrdu="کوئی گاہک نہیں ملا"
          actionText={t('addCustomerBtn')}
          actionTextUrdu="نیا گاہک شامل کریں"
          onAction={() => navigate('/customer/add')}
        />
      ) : (
        <div className="space-y-stack-sm">
          {customers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => navigate(`/customer/history/${cust.id}`)}
              className="bg-surface-container-lowest p-stack-md rounded-xl border border-outline-variant flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-primary cursor-pointer group button-click shadow-sm responsive-card-row"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold">
                  {cust.name.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface leading-none group-hover:text-primary transition-colors">
                    {cust.name}
                  </h3>
                  {cust.phone && (
                    <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">call</span>
                      <span className="font-mono">{cust.phone}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right flex flex-col gap-1 items-end">
                {/* Wheat Balance */}
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-wheat-light text-primary flex gap-1 items-center">
                  <span className="material-symbols-outlined text-[10px]">scale</span>
                  <span>{cust.wheatBalance} {t('kg')}</span>
                </span>
                
                {/* Pending Balance (Udhaar) */}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  cust.pendingBalance > 0 
                    ? 'bg-error-container text-danger-red' 
                    : 'bg-success-green/10 text-success-green'
                }`}>
                  {cust.pendingBalance > 0 
                    ? `Rs. ${cust.pendingBalance}` 
                    : t('paid')
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Add Button */}
      <div className="fixed bottom-5 right-4 sm:right-6 z-30 pb-safe">
        <button 
          onClick={() => navigate('/customer/add')}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center button-click"
        >
          <span className="material-symbols-outlined text-[32px]">person_add</span>
        </button>
      </div>
    </div>
  );
}
