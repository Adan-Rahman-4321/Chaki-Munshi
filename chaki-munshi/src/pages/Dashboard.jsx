import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import EntryCard from '../components/EntryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    api.getDashboard()
      .then((res) => {
        if (res.success) {
          setData(res.data);
        } else {
          setError('Failed to fetch dashboard metrics');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to connect to mill server');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-stack-md text-center bg-error-container text-on-error-container rounded-xl border border-error">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-1.5 bg-error text-on-error rounded-full text-xs font-bold"
        >
          {isRtl ? 'دوبارہ کوشش کریں' : 'Retry'}
        </button>
      </div>
    );
  }

  const { todayWheat, todayFlour, todaySales, pendingPayments, recentEntries, trends } = data;

  // Find max value in trends to scale chart heights correctly
  const maxTrendVal = Math.max(...trends.map(t => t.total), 50);

  return (
    <div className="space-y-stack-lg animate-fade-in">
      {/* Hero Header Greeting */}
      <section className="select-none">
        <h2 className="text-xl font-bold text-on-surface">{t('greeting')}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{t('dashboardSub')}</p>
      </section>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {/* Today's Wheat */}
        <StatCard
          icon="grass"
          label="TODAY'S WHEAT"
          labelUrdu="آج کی گندم"
          value={todayWheat}
          unit="kg"
          colorClass="text-primary"
        />

        {/* Today's Flour */}
        <StatCard
          icon="bakery_dining"
          label="TODAY'S FLOUR"
          labelUrdu="آج کا آٹا"
          value={todayFlour}
          unit="kg"
          colorClass="text-secondary"
        />

        {/* Today's Total Sales */}
        <div className="col-span-2 md:col-span-2 bg-primary-container p-stack-md rounded-xl border border-primary flex flex-col justify-between min-h-[140px] relative overflow-hidden shadow-sm">
          <div className="relative z-10 select-none">
            <span className="material-symbols-outlined text-on-primary-container text-[28px] mb-2">
              payments
            </span>
            <div className="flex justify-between items-baseline">
              <span className="font-label-caps text-label-caps text-on-primary-container">{t('totalSales')}</span>
              <span className="urdu-font text-[10px] text-on-primary-container opacity-90">کل فروخت</span>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <h3 className="font-bold text-3xl text-on-primary-container">Rs. {todaySales.toLocaleString()}</h3>
            <p className="text-xs text-on-primary-container/85 mt-1">
              {t('salesTransCount').replace('{count}', recentEntries.filter(e => e.type === 'flour').length)}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 select-none">
            <span className="material-symbols-outlined text-[120px]">receipt_long</span>
          </div>
        </div>

        {/* Pending Payments (Udhaar) */}
        <div className="col-span-2 md:col-span-4 bg-surface-container-highest p-stack-md rounded-xl border border-danger-red/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm responsive-card-row">
          <div className="flex items-center gap-3">
            <div className="bg-error-container text-on-error-container w-12 h-12 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">pending_actions</span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1.5">
                {t('pendingPayments')} <span className="urdu-font text-[10px] text-danger-red">بقایا رقم</span>
              </p>
              <h3 className="font-bold text-xl text-danger-red">Rs. {pendingPayments.toLocaleString()}</h3>
            </div>
          </div>
          <button 
            onClick={() => navigate('/customers')}
              className="bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-gray button-click card-actions shrink-0"
          >
            {t('viewAllBtn')}
          </button>
        </div>
      </div>

      {/* Recent Entries Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-stack-md">
        <h3 className="font-bold text-lg text-on-surface">{t('recentEntries')}</h3>
        <button 
          onClick={() => setShowEntryModal(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full font-bold shadow-md button-click text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          {t('newEntryBtn')}
        </button>
      </div>

      {/* Recent Entries List */}
      <div className="space-y-stack-sm">
        {recentEntries.length === 0 ? (
          <div className="py-6 text-center text-on-surface-variant text-sm border border-dashed border-outline-variant rounded-xl">
            {isRtl ? 'کوئی حالیہ اندراج نہیں ملا۔' : 'No recent entries found today.'}
          </div>
        ) : (
          recentEntries.map((entry) => (
            <EntryCard
              key={`${entry.type}-${entry.id}`}
              type={entry.type}
              invoiceNo={entry.invoiceNo}
              customerName={entry.customerName}
              quantity={entry.quantity}
              amount={entry.amount}
              status={entry.status}
              date={entry.createdAt}
              onClick={() => navigate(`/invoice/${entry.type}/${entry.id}`)}
            />
          ))
        )}
      </div>

      {/* Grinding Trends Bar Chart */}
      <section className="p-stack-md bg-surface-container-low rounded-xl border border-outline-variant relative overflow-hidden shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="font-bold text-on-surface text-base">{t('grindingTrends')}</h4>
            <p className="text-xs text-on-surface-variant">{t('last7Days')}</p>
          </div>
          <button 
            onClick={() => navigate('/reports')}
            className="text-primary text-xs font-bold flex items-center gap-0.5 hover:text-primary/80 transition-colors"
          >
            {t('detailsBtn')} 
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* CSS Flexbox-based Bar Chart */}
        <div className="h-32 w-full flex items-end justify-between gap-3 px-2">
          {trends.map((day, idx) => {
            // Calculate height percent
            const heightPercent = maxTrendVal > 0 ? (day.total / maxTrendVal) * 100 : 0;
            const isToday = idx === trends.length - 1;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-inverse-surface text-inverse-on-surface text-[10px] py-0.5 px-1.5 rounded shadow z-20 whitespace-nowrap">
                  {day.total} kg
                </div>
                {/* Bar */}
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 cursor-pointer ${
                    isToday 
                      ? 'bg-primary shadow-lg shadow-primary/20' 
                      : 'bg-primary-fixed-dim hover:bg-primary-fixed'
                  }`}
                  style={{ height: `${Math.max(heightPercent, 6)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-on-surface-variant font-label-caps">
          {trends.map(trend => (
            <span key={trend.date}>{trend.day}</span>
          ))}
        </div>
      </section>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40 pb-safe lg:hidden">
        <button 
          onClick={() => setShowEntryModal(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center button-click"
        >
          <span className="material-symbols-outlined text-[32px]">add</span>
        </button>
      </div>

      {/* Modal for Selecting Entry Type */}
      <Modal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        title={isRtl ? 'نیا اندراج کریں' : 'Create New Entry'}
        titleUrdu="نیا اندراج منتخب کریں"
      >
        <div className="grid grid-cols-2 gap-4 pt-2">
          <button
            onClick={() => {
              setShowEntryModal(false);
              navigate('/entry/wheat');
            }}
            className="flex flex-col items-center gap-3 p-4 bg-wheat-light hover:bg-primary-fixed-dim border border-outline-variant/60 rounded-xl transition-all duration-150 button-click group"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">scale</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-on-surface text-sm">{t('wheatTab')}</div>
              <div className="urdu-font text-[10px] text-primary leading-none mt-1">گندم کی آمد</div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowEntryModal(false);
              navigate('/entry/flour');
            }}
            className="flex flex-col items-center gap-3 p-4 bg-secondary-fixed/30 hover:bg-secondary-fixed/60 border border-outline-variant/60 rounded-xl transition-all duration-150 button-click group"
          >
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">local_shipping</span>
            </div>
            <div className="text-center">
              <div className="font-bold text-on-surface text-sm">{t('flourTab')}</div>
              <div className="urdu-font text-[10px] text-secondary leading-none mt-1">آٹا کی نکاسی</div>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}
