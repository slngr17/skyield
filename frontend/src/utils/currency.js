// Currency definitions with symbols and approximate USD exchange rates
export const CURRENCY_MAP = {
  // Global Major
  USD: { code: 'USD', symbol: '$', rate: 1.0, name: 'US Dollar', formatDecimals: 0 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, name: 'Euro', formatDecimals: 0 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, name: 'British Pound', formatDecimals: 0 },
  
  // Africa
  NGN: { code: 'NGN', symbol: '₦', rate: 1550.0, name: 'Nigerian Naira', formatDecimals: 0 },
  KES: { code: 'KES', symbol: 'KSh ', rate: 130.0, name: 'Kenyan Shilling', formatDecimals: 0 },
  ZAR: { code: 'ZAR', symbol: 'R ', rate: 18.5, name: 'South African Rand', formatDecimals: 0 },
  GHS: { code: 'GHS', symbol: 'GH₵ ', rate: 15.5, name: 'Ghanaian Cedi', formatDecimals: 0 },
  EGP: { code: 'EGP', symbol: 'E£ ', rate: 48.0, name: 'Egyptian Pound', formatDecimals: 0 },
  
  // Asia & Middle East
  KRW: { code: 'KRW', symbol: '₩', rate: 1380.0, name: 'South Korean Won', formatDecimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, name: 'Japanese Yen', formatDecimals: 0 },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, name: 'Indian Rupee', formatDecimals: 0 },
  CNY: { code: 'CNY', symbol: '¥', rate: 7.25, name: 'Chinese Yuan', formatDecimals: 0 },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67, name: 'UAE Dirham', formatDecimals: 0 },
  SAR: { code: 'SAR', symbol: 'SAR ', rate: 3.75, name: 'Saudi Riyal', formatDecimals: 0 },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.35, name: 'Singapore Dollar', formatDecimals: 0 },
  PKR: { code: 'PKR', symbol: 'Rs ', rate: 278.0, name: 'Pakistani Rupee', formatDecimals: 0 },
  PHP: { code: 'PHP', symbol: '₱', rate: 58.5, name: 'Philippine Peso', formatDecimals: 0 },
  IDR: { code: 'IDR', symbol: 'Rp ', rate: 16200.0, name: 'Indonesian Rupiah', formatDecimals: 0 },
  
  // Americas & Oceania
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.37, name: 'Canadian Dollar', formatDecimals: 0 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52, name: 'Australian Dollar', formatDecimals: 0 },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.45, name: 'Brazilian Real', formatDecimals: 0 },
  MXN: { code: 'MXN', symbol: 'MX$', rate: 18.2, name: 'Mexican Peso', formatDecimals: 0 },
};

// ISO Country Code (alpha-2) to Currency Code mapping
export const COUNTRY_TO_CURRENCY = {
  // UK
  gb: 'GBP', uk: 'GBP',
  // Nigeria
  ng: 'NGN',
  // South Korea
  kr: 'KRW',
  // US & territories
  us: 'USD', pr: 'USD', vi: 'USD',
  // Eurozone
  de: 'EUR', fr: 'EUR', it: 'EUR', es: 'EUR', nl: 'EUR', be: 'EUR',
  at: 'EUR', pt: 'EUR', gr: 'EUR', fi: 'EUR', ie: 'EUR',
  // Asia
  jp: 'JPY',
  in: 'INR',
  cn: 'CNY',
  ae: 'AED',
  sa: 'SAR',
  sg: 'SGD',
  pk: 'PKR',
  ph: 'PHP',
  id: 'IDR',
  // Africa
  ke: 'KES',
  za: 'ZAR',
  gh: 'GHS',
  eg: 'EGP',
  // Americas & Oceania
  ca: 'CAD',
  au: 'AUD',
  br: 'BRL',
  mx: 'MXN',
};

// Reverse geocode latitude and longitude to find currency
export async function getCurrencyForCoordinates(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=5`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    const countryCode = data.address?.country_code?.toLowerCase();
    
    if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
      const currCode = COUNTRY_TO_CURRENCY[countryCode];
      return CURRENCY_MAP[currCode] || CURRENCY_MAP.USD;
    }
  } catch (err) {
    console.warn('Could not auto-detect currency from coordinates, falling back:', err);
  }

  // Geographic rough bounding box fallback
  if (lat >= 4 && lat <= 14 && lon >= 2 && lon <= 15) return CURRENCY_MAP.NGN; // Nigeria
  if (lat >= 49 && lat <= 60 && lon >= -8 && lon <= 2) return CURRENCY_MAP.GBP; // UK
  if (lat >= 33 && lat <= 39 && lon >= 124 && lon <= 131) return CURRENCY_MAP.KRW; // Korea
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 30) return CURRENCY_MAP.EUR; // Europe
  if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -65) return CURRENCY_MAP.USD; // USA

  return CURRENCY_MAP.USD;
}

// Format an amount in USD to the target currency
export function formatCurrency(amountUsd, currencyObj = CURRENCY_MAP.USD) {
  if (amountUsd == null || isNaN(amountUsd)) return `${currencyObj.symbol}0`;
  const converted = amountUsd * currencyObj.rate;
  return `${currencyObj.symbol}${Math.round(converted).toLocaleString()}`;
}

// Format a price range [lowUsd, highUsd] to the target currency
export function formatCurrencyRange(lowUsd, highUsd, currencyObj = CURRENCY_MAP.USD) {
  const low = Math.round(lowUsd * currencyObj.rate);
  const high = Math.round(highUsd * currencyObj.rate);
  return `${currencyObj.symbol}${low.toLocaleString()} - ${currencyObj.symbol}${high.toLocaleString()}`;
}
