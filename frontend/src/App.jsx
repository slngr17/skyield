import { useState, useEffect, useCallback } from 'react';
import { Sun, MapPin, Camera, Loader2, AlertCircle, Globe } from 'lucide-react';
import MapPicker from './components/MapPicker';
import ImageUploader from './components/ImageUploader';
import BudgetSlider from './components/BudgetSlider';
import ResultsDashboard from './components/ResultsDashboard';
import { api } from './services/api';

export default function App() {
  const [location, setLocation] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [solarData, setSolarData] = useState(null);
  const [roofAnalysis, setRoofAnalysis] = useState(null);
  const [results, setResults] = useState(null);
  const [areaOverride, setAreaOverride] = useState(50);
  const [loadingSolar, setLoadingSolar] = useState(false);
  const [loadingRoof, setLoadingRoof] = useState(false);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [error, setError] = useState(null);

  // Fetch solar data when location changes
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

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

  // Auto-calculate when solar data or area changes
  useEffect(() => {
    if (!solarData) return;
    let cancelled = false;

    async function calculate() {
      setLoadingCalc(true);
      try {
        const area = areaOverride;
        const shading = roofAnalysis ? roofAnalysis.shading_factor : 0.0;
        const data = await api.calculate({
          usable_area_sqm: area,
          annual_avg_ghi_kwh_m2_day: solarData.annual_avg_ghi_kwh_m2_day,
          annual_rainfall_mm: solarData.annual_rainfall_mm,
          shading_factor: shading,
        });
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError('Calculation failed. Please try again.');
      } finally {
        if (!cancelled) setLoadingCalc(false);
      }
    }

    calculate();
    return () => { cancelled = true; };
  }, [solarData, areaOverride, roofAnalysis]);

  // Handle file upload
  const handleFileSelect = useCallback((file) => {
    setUploadedFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedFile(null);
    setImagePreview(null);
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

  const isLoading = loadingSolar || loadingRoof || loadingCalc;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 py-6 px-6 shadow-lg shadow-emerald-900/20">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="bg-white/20 p-2.5 rounded-xl">
            <Globe size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Skyield
            </h1>
            <p className="text-emerald-100/80 text-sm mt-0.5">
              Hyperlocal Microclimate & Solar Potential Analyzer
            </p>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3">
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
            {/* Left Column: Map + Upload */}
            <div className="lg:col-span-5 space-y-6">
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

              {/* Area Slider */}
              {solarData && (
                <section>
                  <BudgetSlider value={areaOverride} onChange={setAreaOverride} />
                </section>
              )}
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
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
                  {loadingCalc && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <Loader2 size={14} className="animate-spin" />
                      Recalculating...
                    </div>
                  )}
                  <ResultsDashboard
                    results={results}
                    roofAnalysis={roofAnalysis}
                    solarData={solarData}
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
          <span>Built for the <span className="text-emerald-500 font-medium">AI 4 Earth Hackathon</span></span>
          <span>
            Data from <a href="https://open-meteo.com" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · AI by <a href="https://ai.google.dev" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Google Gemini</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
