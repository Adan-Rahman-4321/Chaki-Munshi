import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { pdf } from '../utils/pdf';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';

export default function EditWheatEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRtl } = useLanguage();

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [totalWeight, setTotalWeight] = useState('');
  const [cleaningWeight, setCleaningWeight] = useState('0');
  const [requiresCleaning, setRequiresCleaning] = useState(false);
  const [cleaningCharges, setCleaningCharges] = useState('');
  const [grindingCharges, setGrindingCharges] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getCustomers(),
      api.getWheatEntry(id)
    ]).then(([custRes, entryRes]) => {
      if (custRes.success) {
        setCustomers(custRes.data);
      }
      if (entryRes.success) {
        const entry = entryRes.data;
        setCustomerId(entry.customerId.toString());
        setTotalWeight(entry.totalWeight.toString());
        setCleaningWeight(entry.cleaningWeight.toString());
        setRequiresCleaning(entry.requiresCleaning === 1);
        setCleaningCharges(entry.cleaningCharges?.toString() || '');
        setGrindingCharges(entry.grindingCharges?.toString() || '');
        setNotes(entry.notes || '');
      }
    })
    .catch((err) => {
      console.error(err);
      setError('Failed to load entry data');
    })
    .finally(() => setFetching(false));
  }, [id]);

  // Calculate Net Weight
  const total = parseFloat(totalWeight) || 0;
  const clean = parseFloat(cleaningWeight) || 0;
  const netWeight = Math.max(total - clean, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || total <= 0) {
      setError('Please choose a customer and specify a valid weight.');
      return;
    }
    if (clean > total) {
      setError(t('validationWeight'));
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      customerId: parseInt(customerId),
      totalWeight: total,
      cleaningWeight: clean,
      requiresCleaning: requiresCleaning,
      cleaningCharges: requiresCleaning ? (parseFloat(cleaningCharges) || 0) : 0,
      grindingCharges: parseFloat(grindingCharges) || 0,
      notes
    };

    api.updateWheatEntry(id, payload)
      .then(async (res) => {
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: isRtl ? 'کامیابی!' : 'Success!',
            text: isRtl ? 'اندراج کامیابی سے اپ ڈیٹ ہو گیا' : 'Entry updated successfully',
            confirmButtonText: isRtl ? 'ٹھیک ہے' : 'OK',
            confirmButtonColor: '#6d5b00'
          }).then(() => {
            navigate(`/invoice/wheat/${id}`);
          });
        } else {
          setError(res.message || 'Failed to update entry');
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
      {/* Title */}
      <section className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-on-surface">Edit Wheat Entry</h2>
          <p className="urdu-font text-[10px] text-primary leading-none mt-1">گندم کی اندراج میں تبدیلی</p>
        </div>
      </section>

      {/* Entry info summary card */}
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-stack-md shadow-sm select-none">
        <div className="flex justify-between items-center mb-1">
          <span className="text-on-surface-variant font-label-caps text-label-caps">{t('entryStatus')}</span>
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
            EDIT MODE
          </span>
        </div>
        <p className="text-on-surface text-xs mt-1">Modify the wheat intake details below.</p>
      </div>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-stack-md bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm">
        {/* Customer Select dropdown */}
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
        
        {/* Quick add link */}
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

        {/* Weights inputs */}
        <FormInput
          label="TOTAL WEIGHT (KG)"
          labelUrdu="کل وزن (کلو)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={totalWeight}
          onChange={(e) => setTotalWeight(e.target.value)}
          required
        />

        <FormInput
          label="CLEANING WEIGHT (KG)"
          labelUrdu="صفائی کا وزن (کلو)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={cleaningWeight}
          onChange={(e) => setCleaningWeight(e.target.value)}
        />

        {/* Cleaning Option Toggle */}
        <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-3">
          <div>
            <label className="text-on-surface font-label-caps text-label-caps">REQUIRES CLEANING</label>
            <p className="urdu-font text-xs text-primary leading-none mt-1">کیا صفائی کی ضرورت ہے؟</p>
          </div>
          <button
            type="button"
            onClick={() => setRequiresCleaning(!requiresCleaning)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              requiresCleaning ? 'bg-primary' : 'bg-surface-variant'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                requiresCleaning ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Cleaning Charges (shown only if cleaning is required) */}
        {requiresCleaning && (
          <FormInput
            label="CLEANING CHARGES (Rs)"
            labelUrdu="صفائی کے کرایہ (روپے)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={cleaningCharges}
            onChange={(e) => setCleaningCharges(e.target.value)}
            required
          />
        )}

        {/* Grinding Charges */}
        <FormInput
          label="GRINDING CHARGES (Rs)"
          labelUrdu="پیسائی کے کرایہ (روپے)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={grindingCharges}
          onChange={(e) => setGrindingCharges(e.target.value)}
          required
        />

        {/* Auto-Calculated Net Weight Display Card */}
        <div className="bg-wheat-light border-2 border-primary-container rounded-xl p-stack-md mt-6 relative overflow-hidden group select-none">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[120px]">agriculture</span>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-baseline border-b border-outline-variant/30 pb-2 mb-2">
              <span className="text-on-primary-container font-label-caps text-label-caps">{t('netWeight')}</span>
              <span className="urdu-font text-xs text-primary font-bold">خالص وزن</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-primary">{netWeight.toFixed(2)}</span>
              <span className="text-primary font-bold">{t('kg')}</span>
            </div>
          </div>
        </div>

        {/* Remarks Notes */}
        <div className="flex flex-col gap-unit">
          <div className="flex justify-between items-baseline mb-0.5">
            <label className="text-on-surface font-label-caps text-label-caps">{t('notes')}</label>
            <span className="urdu-font text-xs text-primary">وضاحتی نوٹس</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            rows={3}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={loading || netWeight <= 0}
          className="w-full h-16 bg-primary-container text-on-primary-container font-bold rounded-xl flex items-center justify-center gap-3 shadow-md hover:bg-primary-container/95 disabled:opacity-50 disabled:pointer-events-none button-click mt-4"
        >
          {loading ? (
            <span>{t('saving')}</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">save</span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-bold">Update Entry</span>
                <span className="text-[9px] opacity-80 urdu-font -mt-1">اندراج اپ ڈیٹ کریں</span>
              </div>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
