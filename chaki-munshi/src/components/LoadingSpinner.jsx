import { useLanguage } from '../context/LanguageContext';

export default function LoadingSpinner() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-primary-container border-t-primary rounded-full animate-spin" />
      <span className="text-xs text-on-surface-variant font-medium animate-pulse">{t('loading')}</span>
    </div>
  );
}
