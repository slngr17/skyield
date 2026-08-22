import { Sun, Zap, Droplets, Leaf, AlertTriangle, Wrench, BarChart3, TreePine, DollarSign, Clock, Printer, Sparkles } from 'lucide-react';
import MetricCard from './MetricCard';

function ConfidenceBadge({ level }) {
  const styles = {
    low: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[level] || styles.medium}`}>
      {level} confidence
    </span>
  );
}

function IrradianceChart({ dates, values }) {
  if (!dates || !values || values.length === 0) return null;
  const max = Math.max(...values, 1);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
        <BarChart3 size={16} className="text-amber-400" />
        7-Day Solar Irradiance Forecast
      </h3>
      <div className="flex items-end gap-2 h-36">
        {values.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400 font-mono">
              {val.toFixed(1)}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
              style={{ height: `${(val / max) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-gray-500 mt-1">
              {dates[i] ? new Date(dates[i]).toLocaleDateString('en', { weekday: 'short' }) : ''}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2 text-center">kWh/m² per day</p>
    </div>
  );
}

export default function ResultsDashboard({ results, roofAnalysis, solarData, location, areaOverride }) {
  if (!results) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 print:space-y-4">
      {/* Print-Only Report Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-emerald-800">Skyield Feasibility Assessment Report</h1>
            <p className="text-xs text-slate-600 mt-1">
              Hyperlocal Microclimate, Solar Energy &amp; Rainwater Harvesting Analysis
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{formattedDate}</p>
            <p>Assessment ID: SKY-{Math.abs(Math.round((location?.lat || 0) * 1000))}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Coordinates: </span>
            <span className="text-slate-900 font-mono">
              {location ? `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Usable Area: </span>
            <span className="text-slate-900 font-semibold">{areaOverride || 50} m²</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Annual Irradiance: </span>
            <span className="text-slate-900 font-semibold">
              {solarData?.annual_avg_ghi_kwh_m2_day || 4.8} kWh/m²/day
            </span>
          </div>
        </div>
      </div>

      {/* Screen Header bar with Print/Export (Hidden in print mode) */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Property Assessment</h2>
        </div>
        <button
          onClick={handlePrint}
          type="button"
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        >
          <Printer size={13} className="text-emerald-400" />
          <span>Export / Print Report</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Sun}
          title="Monthly Solar"
          value={results.solar_yield_kwh_month}
          unit="kWh/mo"
          color="amber"
        />
        <MetricCard
          icon={Zap}
          title="Annual Solar"
          value={results.solar_yield_kwh_year}
          unit="kWh/yr"
          color="emerald"
        />
        <MetricCard
          icon={Droplets}
          title="Rainwater Harvest"
          value={results.rainwater_capture_liters_year}
          unit="L/yr"
          color="blue"
        />
        <MetricCard
          icon={Leaf}
          title="Carbon Saved"
          value={results.carbon_offset_kg_year}
          unit="kg CO₂e/yr"
          color="green"
        />
      </div>

      {/* AI Sustainability & ROI Impact Card */}
      {results.impact && (
        <div className="glass-card p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-transparent to-teal-950/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              AI Sustainability &amp; Financial Impact
            </h3>
            <span className="text-[11px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              EPA Standard Models
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <TreePine size={14} className="text-emerald-400" />
                <span>Trees Equivalent</span>
              </div>
              <p className="text-lg font-bold text-emerald-300">
                {results.impact.trees_equivalent.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-1">trees/yr</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">carbon absorption match</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <DollarSign size={14} className="text-amber-400" />
                <span>Est. Bill Savings</span>
              </div>
              <p className="text-lg font-bold text-amber-300">
                {results.impact.annual_savings_formatted}
                <span className="text-xs font-normal text-gray-400 ml-1">/year</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">at regional utility tariff</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Clock size={14} className="text-teal-400" />
                <span>System Payback</span>
              </div>
              <p className="text-lg font-bold text-teal-300">
                ~{results.impact.payback_years}
                <span className="text-xs font-normal text-gray-400 ml-1">years</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">estimated break-even</p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Droplets size={14} className="text-blue-400" />
                <span>Water Supply</span>
              </div>
              <p className="text-lg font-bold text-blue-300">
                {results.impact.water_independence_days.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-1">days</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">household usage offset</p>
            </div>
          </div>
        </div>
      )}

      {/* Solar Irradiance Chart */}
      {solarData && (
        <IrradianceChart
          dates={solarData.dates}
          values={solarData.daily_ghi_kwh_m2}
        />
      )}

      {/* AI Roof Analysis */}
      {roofAnalysis && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">AI Roof Analysis</h3>
            <ConfidenceBadge level={roofAnalysis.confidence} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Roof Type</p>
              <p className="text-sm font-medium text-gray-200">{roofAnalysis.roof_type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Usable Area</p>
              <p className="text-sm font-medium text-gray-200">{roofAnalysis.estimated_usable_area_sqm} m²</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Shading Factor</p>
              <p className="text-sm font-medium text-gray-200">{(roofAnalysis.shading_factor * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Recommended Tilt</p>
              <p className="text-sm font-medium text-gray-200">{roofAnalysis.recommended_tilt_angle_deg}°</p>
            </div>
          </div>

          {roofAnalysis.detected_obstructions?.length > 0 && (
            <div className="border-t border-white/10 pt-3 mt-3">
              <p className="text-xs text-gray-500 mb-2">Detected Obstructions</p>
              <div className="flex flex-wrap gap-2">
                {roofAnalysis.detected_obstructions.map((obs, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-lg border border-amber-500/20"
                  >
                    <AlertTriangle size={12} />
                    {obs}
                  </span>
                ))}
              </div>
            </div>
          )}

          {roofAnalysis.notes && (
            <p className="text-xs text-gray-500 mt-3 italic">{roofAnalysis.notes}</p>
          )}
        </div>
      )}

      {/* Hardware Recommendation */}
      {results.hardware && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Wrench size={16} className="text-emerald-400" />
              Configured Hardware Kit
            </h3>
            <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
              {results.hardware.inverter_name}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Solar Modules</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.num_panels}
                <span className="text-xs text-gray-500 ml-1">× {results.hardware.panel_wattage_w}W</span>
              </p>
              <p className="text-[10px] text-emerald-400/80 mt-0.5 truncate">{results.hardware.panel_type_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">DC Array Size</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.total_system_kw.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kW</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">{results.hardware.effective_active_area_sqm} m² footprint</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Inverter Unit</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.inverter_size_kw.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kW</span>
              </p>
              <p className="text-[10px] text-teal-400/80 mt-0.5 truncate">{results.hardware.inverter_type.toUpperCase()} Arch</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Battery Reserve</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.battery_capacity_kwh.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kWh</span>
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">daily buffer</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Turnkey Installed Cost</p>
              <p className="text-lg font-bold text-emerald-400">{results.hardware.estimated_cost_usd}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">NREL standard</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
            <span>{results.hardware.cost_benchmark_note}</span>
            <span className="text-emerald-500/80 font-medium">Turnkey Hardware + BOS + Labor</span>
          </div>
        </div>
      )}
    </div>
  );
}
