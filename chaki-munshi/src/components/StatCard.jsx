export default function StatCard({ icon, label, labelUrdu, value, unit, trend, trendDirection, colorClass }) {
  const isUp = trendDirection === 'up';

  return (
    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col justify-between min-h-[120px] shadow-sm animate-scale-in">
      <div>
        <span className={`material-symbols-outlined text-[24px] mb-1.5 ${colorClass || 'text-primary'}`}>
          {icon}
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant leading-tight">
            {label}
          </span>
          {labelUrdu && (
            <span className="urdu-font text-[10px] text-primary leading-tight">{labelUrdu}</span>
          )}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="font-bold text-xl sm:text-2xl text-on-surface leading-tight">
          {value} {unit && <span className="text-sm font-normal text-on-surface-variant">{unit}</span>}
        </h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold mt-1 ${isUp ? 'text-success-green' : 'text-danger-red'}`}>
            <span className="material-symbols-outlined text-xs">
              {isUp ? 'trending_up' : 'trending_down'}
            </span>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
