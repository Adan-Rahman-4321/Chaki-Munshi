export default function FormInput({ label, labelUrdu, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline">
        <label className="text-on-surface text-[11px] font-bold uppercase tracking-wide">{label}</label>
        {labelUrdu && <span className="urdu-font text-[11px] text-primary">{labelUrdu}</span>}
      </div>
      <input
        className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-lg px-3.5 text-[15px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50"
        {...props}
      />
    </div>
  );
}
