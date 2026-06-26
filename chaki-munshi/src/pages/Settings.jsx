import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { language, setLanguage, isRtl, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-stack-lg animate-fade-in max-w-2xl mx-auto pb-10">
      <section>
        <h2 className="text-xl font-bold text-on-surface">App Settings</h2>
        <p className="urdu-font text-xs text-primary mt-1">ایپ کی ترتیبات</p>
      </section>

      <div className="bg-surface-container-low p-stack-md rounded-2xl border border-outline-variant shadow-sm space-y-6">
        
        {/* Language Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/50 pb-6">
          <div>
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">translate</span> Language (زبان)
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Choose your preferred language</p>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg p-2 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="en">English (LTR)</option>
            <option value="ur">اردو (RTL)</option>
          </select>
        </div>

        {/* Theme Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/50 pb-6">
          <div>
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">dark_mode</span> Appearance (ظاہری شکل)
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Toggle between Light and Dark mode</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg font-bold hover:bg-surface-variant transition-colors"
          >
            {theme === 'dark' ? (
              <><span className="material-symbols-outlined text-yellow-500">light_mode</span> Light Mode</>
            ) : (
              <><span className="material-symbols-outlined text-blue-500">dark_mode</span> Dark Mode</>
            )}
          </button>
        </div>

        {/* Print Settings (Placeholder for future) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">print</span> Default Printer
            </h3>
            <p className="text-sm text-on-surface-variant mt-1">Configure thermal printer settings</p>
          </div>
          <button className="bg-surface-variant text-on-surface-variant px-4 py-2 rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">
            System Default
          </button>
        </div>

      </div>
    </div>
  );
}
