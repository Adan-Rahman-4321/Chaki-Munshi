import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { reminder } from '../utils/reminder';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import EntryCard from '../components/EntryCard';

export default function CustomerHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getCustomer(id),
      api.getCustomerHistory(id)
    ])
      .then(([custRes, histRes]) => {
        if (custRes.success && histRes.success) {
          setCustomer(custRes.data);
          setHistory(histRes.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    if (window.confirm(isRtl ? 'کیا آپ واقعی اس گاہک کو حذف کرنا چاہتے ہیں؟ اس سے تمام متعلقہ ریکارڈز حذف ہو جائیں گے۔' : 'Are you sure you want to delete this customer? All their ledger entries will be removed.')) {
      setDeleting(true);
      api.deleteCustomer(id)
        .then((res) => {
          if (res.success) navigate('/customers');
        })
        .catch((err) => console.error(err))
        .finally(() => setDeleting(false));
    }
  };

  const handleEditEntry = (entryId, type) => {
    if (type === 'wheat') {
      navigate(`/wheat-entry/edit/${entryId}`);
    } else {
      navigate(`/atta-issue/edit/${entryId}`);
    }
  };

  const handleDeleteEntry = async (entryId, type) => {
    if (!window.confirm(isRtl ? 'کیا آپ واقعی اس اندراج کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const deleteApi = type === 'wheat' ? api.deleteWheatEntry : api.deleteAttaIssue;
      const res = await deleteApi(entryId);
      if (res.success) {
        setHistory(history.filter(h => h.id !== entryId));
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'حذف کرنے میں ناکام' : 'Failed to delete entry');
    }
  };

  if (loading || deleting) return <LoadingSpinner />;
  if (!customer) return <div className="text-center py-12">{t('noCustomers')}</div>;

  const { name, phone, address, createdAt, stats } = customer;

  return (
    <div className="space-y-stack-md animate-fade-in">
      {/* Title / Back navigation */}
      <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => navigate('/customers')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high active:scale-90"
          >
            <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-on-surface">{name}</h2>
            <p className="text-xs text-on-surface-variant leading-none mt-1 font-mono">{phone || 'No Phone'}</p>
          </div>
        </div>
        
        {/* Edit / Delete Actions */}
        <div className="flex gap-1">
          <button 
            onClick={() => navigate(`/customer/edit/${id}`)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button 
            onClick={handleDelete}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-high text-danger-red hover:bg-danger-red/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </section>

      {/* Address Block */}
      {address && (
        <div className="p-stack-sm bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs text-on-surface-variant flex items-start gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          <span>{address}</span>
        </div>
      )}

      {/* Ledger Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wheat Balance */}
        <div className="bg-wheat-light/70 p-3.5 rounded-xl border border-primary/20 flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] font-bold text-primary tracking-wide uppercase select-none">
            {t('wheatBalance')}
          </span>
          <h4 className="text-xl font-bold text-primary">
            {stats.wheatBalance} <span className="text-xs font-normal">kg</span>
          </h4>
        </div>

        {/* Outstanding Balance */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[90px] ${
          stats.pendingBalance > 0 ? 'bg-error-container border-error/20' : 'bg-success-green/10 border-success-green/20'
        }`}>
          <span className="text-[10px] font-bold text-on-surface-variant tracking-wide uppercase select-none">
            {t('pendingBalance')}
          </span>
          <h4 className={`text-xl font-bold ${stats.pendingBalance > 0 ? 'text-danger-red' : 'text-success-green'}`}>
            Rs. {stats.pendingBalance}
          </h4>
        </div>

        {/* Total Deposits summary */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] text-on-surface-variant font-medium select-none">{t('totalDeposits')}</span>
          <h4 className="text-base font-bold text-on-surface">{stats.totalWheat} kg</h4>
        </div>

        {/* Total flour distribution summary */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant flex flex-col justify-between min-h-[90px]">
          <span className="text-[10px] text-on-surface-variant font-medium select-none">{t('totalIssued')}</span>
          <h4 className="text-base font-bold text-on-surface">{stats.totalFlour} kg</h4>
        </div>
      </div>

      {/* Transaction Control Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => navigate('/entry/wheat', { state: { selectedCustomerId: id } })}
          className="h-12 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs button-click"
        >
          <span className="material-symbols-outlined text-[18px]">scale</span>
          <span>{t('wheatTab')}</span>
        </button>
        <button
          onClick={() => navigate('/entry/flour', { state: { selectedCustomerId: id } })}
          className="h-12 bg-secondary text-on-secondary font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs button-click"
        >
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          <span>{t('flourTab')}</span>
        </button>
      </div>

      {/* WhatsApp Udhaar Reminder Action */}
      {stats.pendingBalance > 0 && (
        <button
          onClick={() => reminder.sendWhatsApp(name, phone, stats.pendingBalance, isRtl)}
          className="w-full h-11 bg-success-green text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-success-green/95 button-click text-xs"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>{t('sendReminderBtn')}</span>
        </button>
      )}

      {/* Transactions History Header */}
      <div className="border-t border-outline-variant pt-4 mt-2">
        <h3 className="font-bold text-sm text-on-surface select-none uppercase tracking-wide">
          {t('custHistoryTitle')}
        </h3>
      </div>

      {/* Transactions ledger timeline list */}
      <div className="space-y-stack-sm">
        {history.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            message={t('noHistory')}
            messageUrdu="اس گاہک کی کوئی تفصیلات موجود نہیں ہیں"
          />
        ) : (
          history.map((item) => (
            <EntryCard
              key={`${item.type}-${item.id}`}
              type={item.type}
              invoiceNo={item.invoiceNo}
              customerName={name}
              quantity={item.quantity}
              amount={item.amount}
              status={item.status}
              date={item.createdAt}
              entryId={item.id}
              onClick={() => navigate(`/invoice/${item.type}/${item.id}`)}
              onEdit={(id) => handleEditEntry(id, item.type)}
              onDelete={(id) => handleDeleteEntry(id, item.type)}
            />
          ))
        )}
      </div>
    </div>
  );
}
