import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Expenses() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  function fetchExpenses() {
    api.getExpenses()
      .then((res) => {
        if (res.success) {
          setExpenses(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setSaving(true);
    setError('');

    api.createExpense({ amount: parseFloat(amount), category, description })
      .then((res) => {
        if (res.success) {
          setAmount('');
          setDescription('');
          fetchExpenses();
        } else {
          setError(res.message);
        }
      })
      .catch(() => setError('Error saving expense'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    const msg = isRtl ? 'کیا آپ واقعی اس خرچے کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this expense?';
    if (window.confirm(msg)) {
      api.deleteExpense(id).then(() => fetchExpenses());
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-lg animate-fade-in pb-10 max-w-2xl mx-auto">
      <section className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">{isRtl ? 'arrow_forward' : 'arrow_back'}</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-on-surface">Daily Expenses</h2>
          <p className="urdu-font text-xs text-primary mt-1">روزانہ کے اخراجات</p>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container border border-error rounded-xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined">add_circle</span> Add New Expense
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="AMOUNT (RS)"
            labelUrdu="رقم (روپے)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <FormSelect
            label="CATEGORY"
            labelUrdu="قسم"
            options={[
              { value: 'Electricity', label: 'Electricity (بجلی)' },
              { value: 'Maintenance', label: 'Maintenance (مرمت)' },
              { value: 'Salary', label: 'Salary (تنخواہ)' },
              { value: 'Other', label: 'Other (دیگر)' }
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <FormInput
          label="DESCRIPTION"
          labelUrdu="تفصیل"
          type="text"
          placeholder="Expense details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl shadow hover:opacity-90 disabled:opacity-50 mt-2"
        >
          {saving ? 'Saving...' : 'Add Expense (خرچہ شامل کریں)'}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="font-bold text-on-surface">Recent Expenses</h3>
        {expenses.length === 0 ? (
          <p className="text-on-surface-variant text-sm">No expenses found for today.</p>
        ) : (
          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 shadow-sm">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-bold text-on-surface">{exp.category}</span>
                    <span className="text-xs px-2 py-0.5 bg-surface-variant rounded-full text-on-surface-variant">
                      {new Date(exp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">{exp.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                  <span className="font-extrabold text-error">Rs {exp.amount.toFixed(2)}</span>
                  <button onClick={() => handleDelete(exp.id)} className="text-on-surface-variant hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
