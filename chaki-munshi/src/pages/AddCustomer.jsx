import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import FormInput from '../components/FormInput';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AddCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, isRtl } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      api.getCustomer(id)
        .then((res) => {
          if (res.success) {
            setName(res.data.name);
            setPhone(res.data.phone);
            setAddress(res.data.address);
          } else {
            setError('Failed to fetch customer data');
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch customer details');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const payload = { name, phone, address };

    const apiCall = isEdit 
      ? api.updateCustomer(id, payload) 
      : api.createCustomer(payload);

    apiCall
      .then((res) => {
        if (res.success) {
          navigate(isEdit ? `/customer/history/${id}` : '/customers');
        } else {
          setError(res.message || 'Operation failed');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Network error, please try again.');
      })
      .finally(() => setLoading(false));
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-lg animate-fade-in max-w-md mx-auto">
      {/* Title */}
      <section className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
        </button>
        <div>
          <h2 className="text-lg font-bold text-on-surface">
            {isEdit ? t('editCustomerTitle') : t('addCustomerTitle')}
          </h2>
          <p className="urdu-font text-[10px] text-primary leading-none mt-1">
            {isEdit ? 'گاہک کی معلومات میں ترمیم کریں' : 'نیا گاہک رجسٹر کریں'}
          </p>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-stack-md bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm">
        <FormInput
          label="CUSTOMER NAME"
          labelUrdu="گاہک کا نام"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Haji Muhammad Aslam"
          required
        />

        <FormInput
          label="PHONE NUMBER"
          labelUrdu="فون نمبر"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 0300-1234567"
        />

        <FormInput
          label="RESIDENTIAL ADDRESS"
          labelUrdu="رہائشی پتہ"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. G.T. Road, Gujranwala"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-6 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary/95 disabled:opacity-50 disabled:pointer-events-none button-click"
        >
          {loading ? (
            <span>{t('saving')}</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>{isEdit ? t('save') : t('saveBtn')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
