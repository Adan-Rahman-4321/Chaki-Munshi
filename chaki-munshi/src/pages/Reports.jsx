import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Reports() {
  const { t, isRtl } = useLanguage();
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // For daily report
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // For monthly report
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    fetchReport();
  }, [reportType, date, month, year]);

  function fetchReport() {
    setLoading(true);
    let promise;
    if (reportType === 'daily') {
      promise = api.getDailyReport(date);
    } else if (reportType === 'monthly') {
      promise = api.getMonthlyReport(year, month);
    } else {
      promise = api.getYearlyReport(year);
    }

    promise
      .then(res => {
        if (res.success) {
          setData(res.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }

  const years = Array.from({length: 5}, (_, i) => String(new Date().getFullYear() - i));

  return (
    <div className="space-y-stack-lg animate-fade-in pb-10">
      <section>
        <h2 className="text-xl font-bold text-on-surface">Financial Reports</h2>
        <p className="urdu-font text-xs text-primary mt-1">مالیاتی رپورٹ</p>
      </section>

      <div className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setReportType('daily')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${reportType === 'daily' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}
          >
            Daily <span className="urdu-font text-[10px] block font-normal">روزانہ</span>
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${reportType === 'monthly' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}
          >
            Monthly <span className="urdu-font text-[10px] block font-normal">ماہانہ</span>
          </button>
          <button
            onClick={() => setReportType('yearly')}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${reportType === 'yearly' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}
          >
            Yearly <span className="urdu-font text-[10px] block font-normal">سالانہ</span>
          </button>
        </div>

        <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row gap-4">
          {reportType === 'daily' && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-on-surface mb-1">Select Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-[52px]"
              />
            </div>
          )}
          
          {(reportType === 'monthly' || reportType === 'yearly') && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-on-surface mb-1">Select Year</label>
              <select 
                value={year} 
                onChange={e => setYear(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-[52px]"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {reportType === 'monthly' && (
            <div className="flex-1">
              <label className="block text-xs font-bold text-on-surface mb-1">Select Month</label>
              <select 
                value={month} 
                onChange={e => setMonth(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-[52px]"
              >
                {Array.from({length: 12}, (_, i) => {
                  const m = String(i + 1).padStart(2, '0');
                  const mName = new Date(2000, i).toLocaleString('default', { month: 'long' });
                  return <option key={m} value={m}>{mName}</option>
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-wheat-light border border-primary-container p-6 rounded-2xl">
            <h3 className="font-bold text-on-primary-container mb-2">Wheat Processing</h3>
            <p className="text-3xl font-extrabold text-primary">{data.totalWheatReceived.toFixed(2)} KG</p>
            <p className="text-sm mt-1 text-on-surface-variant">Total Wheat Received</p>
          </div>

          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-2xl">
            <h3 className="font-bold text-on-surface mb-2">Flour Issues</h3>
            <p className="text-3xl font-extrabold text-on-surface">{data.totalFlourIssued.toFixed(2)} KG</p>
            <p className="text-sm mt-1 text-on-surface-variant">Total Flour Issued</p>
          </div>

          <div className="bg-success-green/10 border border-success-green/30 p-6 rounded-2xl">
            <h3 className="font-bold text-success-green mb-2">Revenue Generated</h3>
            <p className="text-3xl font-extrabold text-success-green">Rs {data.revenueGenerated.toFixed(2)}</p>
            <p className="text-sm mt-1 text-on-surface-variant">From Grinding Services</p>
          </div>

          <div className="bg-error-container/50 border border-error/30 p-6 rounded-2xl">
            <h3 className="font-bold text-error mb-2">Expenses</h3>
            <p className="text-3xl font-extrabold text-error">Rs {data.totalExpenses.toFixed(2)}</p>
            <p className="text-sm mt-1 text-on-surface-variant">Operational Costs</p>
          </div>

          <div className="md:col-span-2 bg-primary-container text-on-primary-container p-6 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-md">
            <div>
              <h3 className="font-bold mb-1">Net Profit</h3>
              <p className="urdu-font text-xs opacity-80">خالص منافع</p>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold">Rs {(data.revenueGenerated - data.totalExpenses).toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-on-surface-variant">No data available for this period.</div>
      )}
    </div>
  );
}
