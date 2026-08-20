import { Sun, Zap, Droplets, Leaf, AlertTriangle, Wrench, BarChart3 } from 'lucide-react';
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

export default function ResultsDashboard({ results, roofAnalysis, solarData }) {
  if (!results) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Wrench size={16} className="text-emerald-400" />
            Recommended Hardware Kit
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Solar Panels</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.num_panels}
                <span className="text-xs text-gray-500 ml-1">× {results.hardware.panel_wattage_w}W</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">System Size</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.total_system_kw.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kW</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Inverter</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.inverter_size_kw.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kW</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Battery</p>
              <p className="text-lg font-bold text-gray-200">
                {results.hardware.battery_capacity_kwh.toFixed(1)}
                <span className="text-xs text-gray-500 ml-1">kWh</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Est. Cost</p>
              <p className="text-lg font-bold text-emerald-400">{results.hardware.estimated_cost_usd}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
