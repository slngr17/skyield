import { useState } from 'react';
import { Sliders, Zap, Cpu, Layers, HelpCircle, Check, Info } from 'lucide-react';

export default function HardwareCustomizer({
  area,
  onAreaChange,
  panelWattage,
  onPanelWattageChange,
  inverterType,
  onInverterTypeChange,
  customPanelCount,
  onCustomPanelCountChange,
  hardwareResults,
  minArea = 10,
  maxArea = 200,
}) {
  const [isManualPanels, setIsManualPanels] = useState(customPanelCount !== null);
  const [showCostExplainer, setShowCostExplainer] = useState(false);

  const panelOptions = [
    { wattage: 250, label: '250W Poly', subtitle: 'Standard (15.6% eff)', area: '1.6m²' },
    { wattage: 400, label: '400W Mono', subtitle: 'High-Eff (20.0% eff)', area: '2.0m²', recommended: true },
    { wattage: 550, label: '550W Bifacial', subtitle: 'Tier-1 (21.6% eff)', area: '2.55m²' },
  ];

  const inverterOptions = [
    { id: 'string', name: 'String Inverter', desc: 'Cost-effective central unit (ILR 0.90)', costRange: '$2.00-$2.60/W' },
    { id: 'hybrid', name: 'Hybrid (Storage)', desc: 'Battery-ready with islanding (ILR 0.85)', costRange: '$2.40-$3.20/W' },
    { id: 'micro', name: 'Microinverters', desc: 'Per-panel MPPT for shaded roofs (ILR 1.0)', costRange: '$2.60-$3.40/W' },
  ];

  const handleToggleManual = (manual) => {
    setIsManualPanels(manual);
    if (!manual) {
      onCustomPanelCountChange(null);
    } else {
      onCustomPanelCountChange(hardwareResults?.num_panels || 10);
    }
  };

  return (
    <div className="glass-card p-5 space-y-5 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders size={16} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
            Hardware &amp; Roof Configurator
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setShowCostExplainer(!showCostExplainer)}
          className="text-xs text-gray-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          title="How are prices and hardware calculated?"
        >
          <HelpCircle size={13} className="text-emerald-400" />
          <span className="hidden sm:inline">Pricing Methodology</span>
        </button>
      </div>

      {/* Pricing Explainer Modal/Callout */}
      {showCostExplainer && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-100/90 space-y-2 animate-in fade-in">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Where do the price estimates come from?</p>
              <p className="text-gray-300 mt-1 leading-relaxed">
                Hardware cost estimates are benchmarked against official <strong>NREL (National Renewable Energy Laboratory)</strong> and <strong>IRENA (International Renewable Energy Agency)</strong> residential solar cost indices:
              </p>
              <ul className="list-disc list-inside mt-1.5 space-y-1 text-gray-400">
                <li><strong>Turnkey Installed Rate:</strong> $2.00 – $3.40 per Watt DC capacity.</li>
                <li><strong>Included Scope:</strong> Tier-1 PV modules, selected inverter architecture, racking &amp; mounting, electrical balance of system (BOS), and certified labor.</li>
                <li><strong>Dynamic Multipliers:</strong> Microinverters and hybrid battery-coupled systems reflect appropriate hardware premiums.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 1. Usable Roof Area Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-400" /> Usable Roof Area
          </label>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {area} m²
          </span>
        </div>
        <input
          type="range"
          min={minArea}
          max={maxArea}
          step={5}
          value={area}
          onChange={(e) => onAreaChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-emerald-500"
        />
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
          <span>{minArea} m²</span>
          <span>{maxArea} m²</span>
        </div>
      </div>

      {/* 2. Solar Panel Type Selector */}
      <div>
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-2">
          <Zap size={14} className="text-amber-400" /> Solar Panel Module
        </label>
        <div className="grid grid-cols-3 gap-2">
          {panelOptions.map((opt) => (
            <button
              key={opt.wattage}
              type="button"
              onClick={() => onPanelWattageChange(opt.wattage)}
              className={`p-2.5 rounded-xl text-left border transition-all relative ${
                panelWattage === opt.wattage
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              {opt.recommended && (
                <span className="absolute -top-2 right-2 bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                  Popular
                </span>
              )}
              <p className="text-xs font-bold">{opt.label}</p>
              <p className="text-[10px] opacity-75 mt-0.5">{opt.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Inverter Architecture Selector */}
      <div>
        <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-2">
          <Cpu size={14} className="text-teal-400" /> Inverter Architecture
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {inverterOptions.map((inv) => (
            <button
              key={inv.id}
              type="button"
              onClick={() => onInverterTypeChange(inv.id)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                inverterType === inv.id
                  ? 'bg-teal-500/15 border-teal-400 text-teal-200 shadow-md shadow-teal-950/40'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold">{inv.name}</p>
                {inverterType === inv.id && <Check size={13} className="text-teal-400" />}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{inv.desc}</p>
              <p className="text-[10px] text-emerald-400/80 font-mono mt-1">{inv.costRange}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Panel Quantity Customizer Mode */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-300 font-medium">Panel Quantity Mode</span>
          <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => handleToggleManual(false)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                !isManualPanels ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Auto-Fit ({hardwareResults?.num_panels || Math.floor(area / 2)} panels)
            </button>
            <button
              type="button"
              onClick={() => handleToggleManual(true)}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                isManualPanels ? 'bg-emerald-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Custom Count
            </button>
          </div>
        </div>

        {isManualPanels && (
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="flex-1">
              <input
                type="range"
                min={1}
                max={100}
                value={customPanelCount || hardwareResults?.num_panels || 10}
                onChange={(e) => onCustomPanelCountChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-700 accent-emerald-500"
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
                <span>1 panel</span>
                <span>100 panels</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {customPanelCount || hardwareResults?.num_panels || 10}
              </span>
              <span className="text-xs text-gray-400">panels</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
