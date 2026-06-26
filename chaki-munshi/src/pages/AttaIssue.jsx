import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { pdf } from '../utils/pdf';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AttaIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRtl } = useLanguage();

  const initialCustId = location.state?.selectedCustomerId || '';

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(initialCustId);
  const [quantity, setQuantity] = useState('');
  const [ratePerKg, setRatePerKg] = useState('10'); // Default Grinding Rate
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidAmount, setPaidAmount] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCustomers()
      .then((res) => {
        if (res.success) {
          setCustomers(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setFetching(false));
  }, []);

  const qty = parseFloat(quantity) || 0;
  const rate = parseFloat(ratePerKg) || 0;
  const totalAmount = qty * rate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || qty <= 0 || rate <= 0) {
      setError('Please choose a customer and specify valid quantity and rate.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      customerId: parseInt(customerId),
      quantity: qty,
      ratePerKg: rate,
      paymentMethod,
      paidAmount: paidAmount ? parseFloat(paidAmount) : undefined
    };

    api.createAttaIssue(payload)
      .then(async (res) => {
        if (res.success) {
          const createdEntry = res.data;
          
          const cust = customers.find(c => c.id === parseInt(customerId));
          createdEntry.customerName = cust ? cust.name : 'Unknown';
          createdEntry.customerPhone = cust ? cust.phone : '';

          await pdf.printReceipt(createdEntry, isRtl);
          
          navigate(`/customer/history/${customerId}`);
        } else {
          setError(res.message || 'Failed to save issue');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Network error, please try again.');
      })
      .finally(() => setLoading(false));
  };

  if (fetching) return <LoadingSpinner />;

  const customerOptions = [
    ...customers.map(c => ({
      value: c.id.toString(),
      label: `${c.name} (${c.phone || 'No Phone'})`
    }))
  ];

  return (
    <div className="space-y-stack-md animate-fade-in max-w-md mx-auto">
      <section className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Issue Flour (Atta)</h2>
          <p className="urdu-font text-[10px] text-primary leading-none mt-1">آٹا جاری کریں</p>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-stack-md bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm">
        <FormSelect
          label="CUSTOMER SELECTION"
          labelUrdu="گاہک کا انتخاب"
          placeholder="Select a customer..."
          options={customerOptions}
          value={customerId}
          onChange={(e) => {
            if (e.target.value === 'new') {
              navigate('/customer/add');
            } else {
              setCustomerId(e.target.value);
            }
          }}
          required
        />
        
        <div className="flex justify-end -mt-3.5 select-none">
          <button 
            type="button"
            onClick={() => navigate('/customer/add')}
            className="text-primary text-xs font-bold flex items-center gap-0.5 hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">person_add</span>
            <span>{isRtl ? 'نیا گاہک بنائیں' : '+ Add New Customer'}</span>
          </button>
        </div>

        <FormInput
          label="FLOUR QUANTITY (KG)"
          labelUrdu="آٹے کی مقدار (کلو)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />

        <FormInput
          label="GRINDING RATE PER KG (RS)"
          labelUrdu="پسائی ریٹ فی کلو (روپے)"
          type="number"
          step="0.01"
          placeholder="10"
          value={ratePerKg}
          onChange={(e) => setRatePerKg(e.target.value)}
          required
        />

        <div className="bg-wheat-light border-2 border-primary-container rounded-xl p-stack-md mt-6 relative overflow-hidden group select-none">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <span className="material-symbols-outlined text-[120px]">payments</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-baseline border-b border-outline-variant/30 pb-2 mb-2">
              <span className="text-on-primary-container font-label-caps text-label-caps">Total Amount</span>
              <span className="urdu-font text-xs text-primary font-bold">کل رقم</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-primary">Rs {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <FormSelect
          label="PAYMENT METHOD"
          labelUrdu="ادائیگی کا طریقہ"
          options={[
            { value: 'Cash', label: 'Cash (نقد)' },
            { value: 'Credit', label: 'Credit (ادھار)' },
            { value: 'Online', label: 'Online/Bank' }
          ]}
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />

        {paymentMethod !== 'Credit' && (
          <FormInput
            label="PAID AMOUNT (RS) - Optional"
            labelUrdu="ادا شدہ رقم (اگر پوری نہ ہو)"
            type="number"
            step="0.01"
            placeholder={totalAmount.toString()}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
        )}

        <button
          type="submit"
          disabled={loading || qty <= 0 || rate <= 0}
          className="w-full h-16 bg-primary-container text-on-primary-container font-bold rounded-xl flex items-center justify-center gap-3 shadow-md hover:bg-primary-container/95 disabled:opacity-50 disabled:pointer-events-none button-click mt-4"
        >
          {loading ? (
            <span>Saving...</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">print</span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-bold">Issue Flour & Print</span>
                <span className="text-[9px] opacity-80 urdu-font -mt-1">آٹا جاری کریں اور رسید پرنٹ کریں</span>
              </div>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
