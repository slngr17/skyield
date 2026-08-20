import os
import json
import math
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Skyield Backend...")
    print("Listening on http://0.0.0.0:8000")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SolarDataResponse(BaseModel):
    latitude: float
    longitude: float
    daily_ghi_kwh_m2: list[float]
    daily_direct_radiation_kwh_m2: list[float]
    daily_daylight_duration_hours: list[float]
    dates: list[str]
    annual_avg_ghi_kwh_m2_day: float
    annual_rainfall_mm: float

class RoofAnalysis(BaseModel):
    roof_type: str
    estimated_usable_area_sqm: float
    shading_factor: float
    recommended_tilt_angle_deg: float
    detected_obstructions: list[str]
    confidence: str
    notes: str

class CalculationRequest(BaseModel):
    usable_area_sqm: float
    annual_avg_ghi_kwh_m2_day: float
    annual_rainfall_mm: float
    shading_factor: float = 0.0
    panel_wattage: int = 400
    panel_efficiency: float = 0.18
    system_performance_ratio: float = 0.75
    runoff_coefficient: float = 0.85

class HardwareRecommendation(BaseModel):
    num_panels: int
    panel_wattage_w: int
    total_system_kw: float
    inverter_size_kw: float
    battery_capacity_kwh: float
    estimated_cost_usd: str

class CalculationResponse(BaseModel):
    solar_yield_kwh_month: float
    solar_yield_kwh_year: float
    rainwater_capture_liters_year: float
    carbon_offset_kg_year: float
    hardware: HardwareRecommendation

@app.get("/api/solar-data", response_model=SolarDataResponse)
async def get_solar_data(lat: float, lon: float):
    try:
        async with httpx.AsyncClient() as client:
            forecast_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=shortwave_radiation_sum,direct_radiation_sum,daylight_duration&timezone=auto&forecast_days=7"
            forecast_resp = await client.get(forecast_url)
            forecast_resp.raise_for_status()
            forecast_data = forecast_resp.json()

            # Archive for rainfall (2024 total)
            archive_url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date=2024-01-01&end_date=2024-12-31&daily=precipitation_sum&timezone=auto"
            archive_resp = await client.get(archive_url)
            archive_resp.raise_for_status()
            archive_data = archive_resp.json()

        daily = forecast_data.get("daily", {})
        
        shortwave_mj = daily.get("shortwave_radiation_sum", [])
        # convert MJ/m² to kWh/m²: 1 MJ = 0.277778 kWh (open meteo returns MJ/m² by default for radiation sum)
        daily_ghi = [val * 0.277778 if val is not None else 0 for val in shortwave_mj]
        
        direct_mj = daily.get("direct_radiation_sum", [])
        daily_direct = [val * 0.277778 if val is not None else 0 for val in direct_mj]
        
        daylight_s = daily.get("daylight_duration", [])
        daily_daylight = [val / 3600 if val is not None else 0 for val in daylight_s]
        
        dates = daily.get("time", [])

        if len(daily_ghi) > 0:
            annual_avg_ghi = sum(daily_ghi) / len(daily_ghi)
        else:
            annual_avg_ghi = 0.0

        precip_data = archive_data.get("daily", {}).get("precipitation_sum", [])
        annual_rainfall = sum([val for val in precip_data if val is not None])

        return SolarDataResponse(
            latitude=lat,
            longitude=lon,
            daily_ghi_kwh_m2=daily_ghi,
            daily_direct_radiation_kwh_m2=daily_direct,
            daily_daylight_duration_hours=daily_daylight,
            dates=dates,
            annual_avg_ghi_kwh_m2_day=annual_avg_ghi,
            annual_rainfall_mm=annual_rainfall
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-roof", response_model=RoofAnalysis)
async def analyze_roof(lat: float = Form(...), lon: float = Form(...), file: UploadFile = File(...)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return RoofAnalysis(
            roof_type="Flat concrete roof",
            estimated_usable_area_sqm=45.0,
            shading_factor=0.15,
            recommended_tilt_angle_deg=15.0,
            detected_obstructions=["Small water tank on NE corner", "Adjacent building shadow (afternoon)"],
            confidence="medium",
            notes="Mock analysis — set GEMINI_API_KEY for real AI analysis."
        )

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        img_bytes = await file.read()
        
        prompt = f"""You are a solar energy rooftop assessment expert. Analyze this rooftop image and provide a structured JSON assessment.
        
        Return ONLY valid JSON with these exact fields:
        {{
          "roof_type": "description of roof type (e.g., flat concrete, sloped tile, corrugated metal)",
          "estimated_usable_area_sqm": <number, estimated usable area in square meters>,
          "shading_factor": <number between 0.0 and 1.0, where 0 = no shading, 1 = fully shaded>,
          "recommended_tilt_angle_deg": <number, optimal panel tilt angle in degrees>,
          "detected_obstructions": ["list of detected obstructions like trees, water tanks, HVAC units, nearby buildings"],
          "confidence": "low|medium|high",
          "notes": "additional observations about the roof suitability for solar panels"
        }}
        
        The location coordinates are: {lat}, {lon}
        Be realistic and conservative in your estimates.
        """

        response = model.generate_content([
            {"mime_type": file.content_type or "image/jpeg", "data": img_bytes},
            prompt
        ])

        text = response.text
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        parsed = json.loads(text)
        return RoofAnalysis(**parsed)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calculate", response_model=CalculationResponse)
async def calculate_solar(req: CalculationRequest):
    try:
        # daily_yield = area * ghi * efficiency * performance_ratio * (1 - shading_factor)
        daily_yield = (req.usable_area_sqm * req.annual_avg_ghi_kwh_m2_day * 
                       req.panel_efficiency * req.system_performance_ratio * 
                       (1 - req.shading_factor))
        monthly_yield = daily_yield * 30
        annual_yield = daily_yield * 365
        
        # rainwater = area * annual_rainfall_mm * runoff_coefficient (liters)
        rainwater = req.usable_area_sqm * req.annual_rainfall_mm * req.runoff_coefficient
        
        # carbon_offset = annual_yield * 0.42 (kg CO2e)
        carbon_offset = annual_yield * 0.42
        
        panel_area = 2.0
        num_panels = math.ceil(req.usable_area_sqm / panel_area)
        
        total_system_kw = (num_panels * req.panel_wattage) / 1000.0
        inverter_size = total_system_kw * 1.2
        battery_kwh = daily_yield * 0.5
        
        estimated_cost_low = int(total_system_kw * 1000 * 2.5)
        estimated_cost_high = int(total_system_kw * 1000 * 3.5)
        cost_str = f"${estimated_cost_low} - ${estimated_cost_high}"
        
        hw = HardwareRecommendation(
            num_panels=num_panels,
            panel_wattage_w=req.panel_wattage,
            total_system_kw=total_system_kw,
            inverter_size_kw=inverter_size,
            battery_capacity_kwh=battery_kwh,
            estimated_cost_usd=cost_str
        )
        
        return CalculationResponse(
            solar_yield_kwh_month=monthly_yield,
            solar_yield_kwh_year=annual_yield,
            rainwater_capture_liters_year=rainwater,
            carbon_offset_kg_year=carbon_offset,
            hardware=hw
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
