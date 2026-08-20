export default function BudgetSlider({ value, onChange, min = 10, max = 200 }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-300">
          Adjust Usable Roof Area
        </label>
        <span className="text-lg font-bold text-emerald-400">
          {value} m²
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer
                   bg-gray-700 accent-emerald-500
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-emerald-400
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:shadow-emerald-400/30"
      />
      <div className="flex justify-between mt-1.5 text-xs text-gray-600">
        <span>{min} m²</span>
        <span>{max} m²</span>
      </div>
    </div>
  );
}
