import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EntryCard from '../components/EntryCard';

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
          type: 'wheat',
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
          type: 'flour',
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

  const handleEdit = (id, type) => {
    if (type === 'wheat') {
      navigate(`/wheat-entry/edit/${id}`);
    } else {
      navigate(`/atta-issue/edit/${id}`);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(isRtl ? 'کیا آپ واقعی اس اندراج کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const deleteApi = type === 'wheat' ? api.deleteWheatEntry : api.deleteAttaIssue;
      const res = await deleteApi(id);
      if (res.success) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert(isRtl ? 'حذف کرنے میں ناکام' : 'Failed to delete entry');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-stack-lg animate-fade-in pb-10">
      <section>
        <h2 className="text-xl font-bold text-on-surface">{t('transactionsTitle')}</h2>
        <p className="urdu-font text-xs text-primary mt-1">حالیہ لین دین</p>
      </section>

      <div className="space-y-3">
        {transactions.map(txn => (
          <EntryCard
            key={`${txn.type}-${txn.id}`}
            type={txn.type}
            invoiceNo={txn.invoiceNo}
            customerName={txn.customerName}
            quantity={txn.amount}
            amount={txn.revenue || 0}
            status={txn.paymentMethod === 'Credit' ? 'Pending' : 'Paid'}
            date={txn.createdAt}
            entryId={txn.id}
            onClick={() => navigate(`/invoice/${txn.type}/${txn.id}`)}
            onEdit={(id) => handleEdit(id, txn.type)}
            onDelete={(id) => handleDelete(id, txn.type)}
          />
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant">{t('noTransactions')}</div>
        )}
      </div>
    </div>
  );
}
