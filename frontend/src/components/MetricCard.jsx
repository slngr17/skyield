export default function MetricCard({ icon: Icon, title, value, unit, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-2 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon size={18} className={colorMap[color] || 'text-emerald-400'} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold ${colorMap[color] || 'text-emerald-400'}`}>
          {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  );
}
