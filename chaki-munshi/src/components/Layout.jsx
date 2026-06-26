import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t, isRtl } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'statsTab', icon: 'dashboard' },
    { path: '/customers', label: 'customersTab', icon: 'groups' },
    { path: '/transactions', label: 'entriesTab', icon: 'inventory_2' },
    { path: '/expenses', label: 'expenseTitle', icon: 'payments' },
    { path: '/reports', label: 'reportsTab', icon: 'assessment' },
    { path: '/settings', label: 'settingsTab', icon: 'settings' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const millName = localStorage.getItem('chaki_mill_name') || 'Chaki Munshi';

  const navButtonClass = (active, compact = false) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all button-click shrink-0 ${
      compact ? 'min-w-[4.25rem] px-2 py-2' : 'px-3 py-2'
    } ${
      active
        ? 'bg-primary-container text-on-primary-container shadow-sm'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`;

  return (
    <div
      className={`min-h-dvh flex flex-col bg-background text-on-background transition-colors duration-200 ${
        isRtl ? 'urdu-active' : ''
      }`}
    >
      <header className="sticky top-0 z-50 bg-surface border-b border-outline-variant shadow-sm pt-safe">
        {/* Brand bar */}
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 px-4 h-14 sm:h-16">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 min-w-0 touch-target-auto"
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary-container flex items-center justify-center border-2 border-primary">
              <span className="material-symbols-outlined text-primary text-[20px]">agriculture</span>
            </div>
            <div className="min-w-0 text-left">
              <h1 className="font-bold text-[15px] sm:text-lg text-primary truncate leading-tight">
                {millName}
              </h1>
              <p className="hidden sm:block text-[10px] text-on-surface-variant leading-none">
                {isRtl ? 'ڈیجیٹل منشی کھاتہ' : 'Digital Ledger Assistant'}
              </p>
            </div>
          </button>

          {/* Desktop nav — inline in header */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all touch-target-auto ${
                    active
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400` }}
                  >
                    {item.icon}
                  </span>
                  <span className={isRtl ? 'urdu-font text-xs' : ''}>{t(item.label)}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low text-primary hover:bg-surface-container-high transition-colors touch-target-auto"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 bg-primary text-on-primary font-bold text-[11px] rounded-full shadow-sm hover:opacity-90 transition-all touch-target-auto"
            >
              {language === 'en' ? 'اردو' : 'EN'}
            </button>
          </div>
        </div>

        {/* Mobile & tablet nav — always visible, horizontal scroll */}
        <nav
          className="lg:hidden border-t border-outline-variant/60 bg-surface-container-low/50"
          aria-label="Main navigation"
        >
          <div className="max-w-6xl mx-auto px-3 py-2 flex gap-1.5 overflow-x-auto overscroll-x-contain scrollbar-none snap-x snap-mandatory md:justify-center md:overflow-visible md:grid md:grid-cols-6 md:gap-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`snap-start touch-target-auto ${navButtonClass(active, true)} md:min-w-0`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}, 'wght' 400` }}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold leading-tight text-center max-w-[4.25rem] truncate ${
                      isRtl ? 'urdu-font' : 'uppercase tracking-tight'
                    }`}
                  >
                    {t(item.label)}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-5 pb-8 pb-safe animate-fade-in">
        {children}
      </main>
    </div>
  );
}
