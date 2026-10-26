import httpx
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("integrations.open_meteo")


class OpenMeteoClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.OPEN_METEO_BASE_URL

    async def get_current_weather(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """Fetch current weather data from Open-Meteo API. Returns None on failure."""
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": "true",
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m",
            "timezone": "auto",
        }
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/forecast", params=params)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current_weather", {})
                    return {
                        "temperature_c": current.get("temperature"),
                        "windspeed_kmh": current.get("windspeed"),
                        "weathercode": current.get("weathercode"),
                        "time": current.get("time"),
                        "source": "Open-Meteo (Free Open API)",
                        "attribution": "Weather data by Open-Meteo.com",
                    }
                logger.warning("open_meteo_non_200", status_code=response.status_code)
                return None
        except Exception as exc:
            logger.info("open_meteo_unavailable", error=str(exc))
            return None


open_meteo_client = OpenMeteoClient()
