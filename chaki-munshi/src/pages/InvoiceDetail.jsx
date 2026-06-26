import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { pdf } from '../utils/pdf';
import LoadingSpinner from '../components/LoadingSpinner';

export default function InvoiceDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    
    // Determine which API call to make
    const isWheat = type === 'wheat' || type === 'WHEAT_IN';
    const fetchPromise = isWheat ? api.getWheatEntry(id) : api.getAttaIssue(id);

    fetchPromise
      .then(res => {
        if (res.success) {
          setInvoice(res.data);
        } else {
          setError(res.message || 'Invoice not found');
        }
      })
      .catch(() => setError('Failed to load invoice details'))
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 text-center bg-error-container text-on-error-container rounded-xl border border-error">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-error text-on-error rounded-full text-xs font-bold shadow-md hover:bg-error/90"
        >
          {t('back')}
        </button>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-on-surface-variant">
        <p>{t('noHistory')}</p>
      </div>
    );
  }

  const isWheat = invoice.invoiceNo?.startsWith('WHT') || type === 'wheat' || type === 'WHEAT_IN';
  
  const handlePrint = () => {
    pdf.printReceipt(invoice, isRtl);
  };

  return (
    <div className="space-y-stack-md animate-fade-in max-w-lg mx-auto pb-10">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="Go Back"
          >
            <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
          </button>
          <div>
            <h2 className="text-lg font-bold text-on-surface">{t('invoiceTitle')}</h2>
            <p className="urdu-font text-[10px] text-primary mt-1">رسید کی تفصیلات</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 shadow-md transition-all active:scale-95"
          title="Print Receipt"
        >
          <span className="material-symbols-outlined">print</span>
        </button>
      </section>

      {/* Premium Receipt Card */}
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-outline-variant shadow-md space-y-5 font-mono text-sm max-w-md mx-auto">
        <div className="text-center border-b border-dashed border-outline-variant pb-4">
          <h1 className="text-xl font-extrabold tracking-widest text-primary">CHAKI MUNSHI</h1>
          <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wider">
            {isWheat ? t('wheatTab') : t('flourTab')}
          </p>
          <p className="urdu-font text-[10px] text-primary mt-1 leading-none">
            {isWheat ? 'تصدیق شدہ گندم رسید' : 'تصدیق شدہ آٹا تقسیم رسید'}
          </p>
        </div>

        {/* Invoice Metadata */}
        <div className="space-y-2.5 border-b border-dashed border-outline-variant pb-4">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{t('invoiceNoLabel')}:</span>
            <span className="font-bold text-on-surface">{invoice.invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{t('dateLabel')}:</span>
            <span className="font-bold text-on-surface text-[12px]">{new Date(invoice.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Customer:</span>
            <span className="font-bold text-on-surface">{invoice.customerName}</span>
          </div>
          {invoice.customerPhone && (
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Phone:</span>
              <span className="font-bold text-on-surface">{invoice.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Transaction Content */}
        {isWheat ? (
          /* Wheat Intake Details */
          <div className="space-y-2.5 border-b border-dashed border-outline-variant pb-4">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('totalWeight')}:</span>
              <span className="font-bold text-on-surface">{invoice.totalWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('cleaningWeight')}:</span>
              <span className="font-bold text-danger-red">-{invoice.cleaningWeight} kg</span>
            </div>
            <div className="divider border-t border-dashed border-outline-variant/60 my-2"></div>
            <div className="flex justify-between text-base">
              <span className="font-bold text-on-surface">{t('netWeight')}:</span>
              <span className="font-extrabold text-primary">{invoice.netWeight} kg</span>
            </div>
          </div>
        ) : (
          /* Flour Distribution Details */
          <div className="space-y-2.5 border-b border-dashed border-outline-variant pb-4">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('flourQty')}:</span>
              <span className="font-bold text-on-surface">{invoice.quantity} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">{t('ratePerKg')}:</span>
              <span className="font-bold text-on-surface">Rs {invoice.ratePerKg}</span>
            </div>
            <div className="divider border-t border-dashed border-outline-variant/60 my-2"></div>
            <div className="flex justify-between text-base">
              <span className="font-bold text-on-surface">{t('totalAmount')}:</span>
              <span className="font-extrabold text-primary">Rs {invoice.totalAmount}</span>
            </div>
          </div>
        )}

        {/* Financial & Status Details */}
        {!isWheat && (
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">{t('paymentMethod')}:</span>
              <span className="font-semibold text-on-surface uppercase">{t(invoice.paymentMethod.toLowerCase())}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">{t('totalPaid')}:</span>
              <span className="font-bold text-success-green">Rs {invoice.paidAmount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">{t('remainingAmount')}:</span>
              <span className={`font-bold ${invoice.remainingBalance > 0 ? 'text-danger-red' : 'text-success-green'}`}>
                Rs {invoice.remainingBalance}
              </span>
            </div>
          </div>
        )}

        {/* Internal Notes if any */}
        {invoice.notes && (
          <div className="p-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface-variant">
            <span className="font-bold text-[10px] uppercase block mb-1 text-primary">{t('notes')}:</span>
            <p className="font-sans leading-relaxed">{invoice.notes}</p>
          </div>
        )}

        {/* Scan & Verification */}
        <div className="text-center pt-4 border-t border-dashed border-outline-variant">
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            {t('verifyMsg')}
          </p>
        </div>
      </div>
    </div>
  );
}
