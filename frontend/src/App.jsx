import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sun, MapPin, Camera, Loader2, AlertCircle, Globe } from 'lucide-react';
import MapPicker from './components/MapPicker';
import ImageUploader from './components/ImageUploader';
import HardwareCustomizer from './components/HardwareCustomizer';
import ResultsDashboard from './components/ResultsDashboard';
import Logo from './components/Logo';
import { api, calculateLocal } from './services/api';
import { CURRENCY_MAP, getCurrencyForCoordinates } from './utils/currency';

export default function App() {
  const [location, setLocation] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [roofAnalysis, setRoofAnalysis] = useState(null);
  const [areaOverride, setAreaOverride] = useState(50);
  const [panelWattage, setPanelWattage] = useState(400);
  const [inverterType, setInverterType] = useState('string');
  const [customPanelCount, setCustomPanelCount] = useState(null);
  const [currency, setCurrency] = useState(CURRENCY_MAP.USD);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [loadingRoof, setLoadingRoof] = useState(false);
  const [error, setError] = useState(null);

  // Fetch solar data & detect localized currency when location changes
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    // Detect country currency for the pin location
    getCurrencyForCoordinates(location.lat, location.lng).then((detectedCurr) => {
      if (!cancelled && detectedCurr) {
        setCurrency(detectedCurr);
      }
    });

    async function fetchSolar() {
      setLoadingSolar(true);
      setError(null);
      try {
        const data = await api.getSolarData(location.lat, location.lng);
        if (!cancelled) setSolarData(data);
      } catch (err) {
        if (!cancelled) setError('Failed to fetch solar data. Please try again.');
      } finally {
        if (!cancelled) setLoadingSolar(false);
      }
    }

    fetchSolar();
    return () => { cancelled = true; };
  }, [location]);

  // Instantaneous 60fps calculation using useMemo
  const results = useMemo(() => {
    if (!solarData) return null;
    const area = areaOverride;
    const shading = roofAnalysis ? roofAnalysis.shading_factor : 0.0;
    return calculateLocal({
      usable_area_sqm: area,
      annual_avg_ghi_kwh_m2_day: solarData.annual_avg_ghi_kwh_m2_day,
      annual_rainfall_mm: solarData.annual_rainfall_mm,
      shading_factor: shading,
      panel_wattage: panelWattage,
      inverter_type: inverterType,
      custom_panel_count: customPanelCount,
      currency: currency,
    });
  }, [solarData, areaOverride, roofAnalysis, panelWattage, inverterType, customPanelCount, currency]);

  // Handle file upload with memory management
  const handleFileSelect = useCallback((file) => {
    setUploadedFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  const handleClearImage = useCallback(() => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadedFile(null);
    setRoofAnalysis(null);
  }, []);

  // Analyze roof when file is uploaded and location is set
  useEffect(() => {
    if (!uploadedFile || !location) return;
    let cancelled = false;

    async function analyzeRoof() {
      setLoadingRoof(true);
      setError(null);
      try {
        const data = await api.analyzeRoof(uploadedFile, location.lat, location.lng);
        if (!cancelled) {
          setRoofAnalysis(data);
          setAreaOverride(Math.round(data.estimated_usable_area_sqm));
        }
      } catch (err) {
        if (!cancelled) setError('Roof analysis failed. Please try again.');
      } finally {
        if (!cancelled) setLoadingRoof(false);
      }
    }

    analyzeRoof();
    return () => { cancelled = true; };
  }, [uploadedFile, location]);

  const isLoading = loadingSolar || loadingRoof;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-4 px-6 shadow-lg shadow-emerald-950/30 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Logo className="w-10 h-10" withText={true} />
          
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/15 text-xs text-emerald-100">
              <span className="text-[11px] text-emerald-300 font-medium hidden sm:inline">Currency:</span>
              <select
                value={currency.code}
                onChange={(e) => setCurrency(CURRENCY_MAP[e.target.value] || CURRENCY_MAP.USD)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer [&>option]:bg-gray-900 [&>option]:text-white"
                title="Auto-detected from pin location, or select manually"
              >
                {Object.values(CURRENCY_MAP).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Microclimate</span>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 print:hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Map + Upload (Hidden in print/export report) */}
            <div className="lg:col-span-5 space-y-6 print:hidden">
              {/* Map Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-semibold text-gray-300">Select Location</h2>
                  {loadingSolar && (
                    <Loader2 size={14} className="text-emerald-400 animate-spin ml-auto" />
                  )}
                </div>
                <MapPicker onLocationSelect={setLocation} />
              </section>

              {/* Hardware Configurator & Area Slider */}
              {solarData && (
                <section>
                  <HardwareCustomizer
                    area={areaOverride}
                    onAreaChange={setAreaOverride}
                    panelWattage={panelWattage}
                    onPanelWattageChange={setPanelWattage}
                    inverterType={inverterType}
                    onInverterTypeChange={setInverterType}
                    customPanelCount={customPanelCount}
                    onCustomPanelCountChange={setCustomPanelCount}
                    currency={currency}
                    onCurrencyChange={setCurrency}
                    hardwareResults={results?.hardware}
                  />
                </section>
              )}

              {/* Upload Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Camera size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-semibold text-gray-300">Upload Rooftop Photo</h2>
                  <span className="text-xs text-gray-600">(optional)</span>
                  {loadingRoof && (
                    <Loader2 size={14} className="text-emerald-400 animate-spin ml-auto" />
                  )}
                </div>
                <ImageUploader
                  onFileSelect={handleFileSelect}
                  preview={imagePreview}
                  onClear={handleClearImage}
                />
              </section>
            </div>

            {/* Right Column: Results (Full-width in print report) */}
            <div className="lg:col-span-7 print:col-span-12 print:w-full">
              {!location && !isLoading && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <Sun size={48} className="text-gray-700 mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    Drop a pin to get started
                  </h3>
                  <p className="text-sm text-gray-600 max-w-sm">
                    Click anywhere on the map to select a location. We'll fetch solar irradiance,
                    rainfall data, and calculate your energy potential instantly.
                  </p>
                </div>
              )}

              {isLoading && !results && (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <Loader2 size={40} className="text-emerald-400 animate-spin mb-4" />
                  <p className="text-sm text-gray-400">
                    {loadingSolar
                      ? 'Fetching solar & weather data...'
                      : loadingRoof
                        ? 'Analyzing rooftop with AI...'
                        : 'Computing results...'}
                  </p>
                </div>
              )}

              {results && (
                <div className="space-y-6">
                  <ResultsDashboard
                    results={results}
                    roofAnalysis={roofAnalysis}
                    solarData={solarData}
                    location={location}
                    areaOverride={areaOverride}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>© {new Date().getFullYear()} Skyield</span>
          <span>
            Data from <a href="https://open-meteo.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · AI by <a href="https://ai.google.dev" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Google Gemini</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
