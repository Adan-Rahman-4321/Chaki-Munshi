export default function FormSelect({ label, labelUrdu, options, value, onChange, placeholder, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-on-surface text-[11px] font-bold uppercase tracking-wide">{label}</label>
        {labelUrdu && <span className="urdu-font text-[11px] text-primary">{labelUrdu}</span>}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 pr-10 text-[15px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none transition-all"
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
        </div>
      </div>
    </div>
  );
}
