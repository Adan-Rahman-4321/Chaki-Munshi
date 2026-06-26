import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Transactions() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getWheatEntries(),
      api.getAttaIssues()
    ]).then(([wheatRes, attaRes]) => {
      const entries = [];
      
      if (wheatRes.success) {
        wheatRes.data.forEach(w => entries.push({
          ...w,
          type: 'WHEAT_IN',
          label: 'Wheat Deposit',
          labelUrdu: 'گندم جمع',
          date: new Date(w.createdAt),
          amount: w.totalWeight,
          unit: 'KG'
        }));
      }

      if (attaRes.success) {
        attaRes.data.forEach(a => entries.push({
          ...a,
          type: 'FLOUR_OUT',
          label: 'Flour Issued',
          labelUrdu: 'آٹا جاری',
          date: new Date(a.createdAt),
          amount: a.quantity,
          unit: 'KG',
          revenue: a.totalAmount
        }));
      }

      entries.sort((a, b) => b.date - a.date);
      setTransactions(entries);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-lg animate-fade-in pb-10">
      <section>
        <h2 className="text-xl font-bold text-on-surface">{t('transactionsTitle')}</h2>
        <p className="urdu-font text-xs text-primary mt-1">حالیہ لین دین</p>
      </section>

      <div className="space-y-3">
        {transactions.map(txn => (
          <div 
            key={`${txn.type}-${txn.id}`}
            onClick={() => navigate(`/invoice/${txn.type === 'WHEAT_IN' ? 'wheat' : 'flour'}/${txn.id}`)}
            className="bg-surface-container-low border border-outline-variant p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  txn.type === 'WHEAT_IN' ? 'bg-success-green/20 text-success-green' : 'bg-primary/20 text-primary'
                }`}>
                  <span className="material-symbols-outlined">
                    {txn.type === 'WHEAT_IN' ? 'download' : 'upload'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm sm:text-base leading-snug">{txn.customerName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full font-semibold">
                      {txn.type === 'WHEAT_IN' ? t('wheatTab') : t('flourTab')}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {txn.date.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-left sm:text-right pl-16 sm:pl-0">
                <p className="font-extrabold text-on-surface text-base">
                  {txn.amount.toFixed(2)} {t('kg')}
                </p>
                {txn.type === 'FLOUR_OUT' && (
                  <p className="text-xs font-bold text-primary mt-0.5">
                    Rs {txn.revenue?.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant">{t('noTransactions')}</div>
        )}
      </div>
    </div>
  );
}
