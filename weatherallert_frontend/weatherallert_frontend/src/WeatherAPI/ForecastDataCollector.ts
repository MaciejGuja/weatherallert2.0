export interface ForecastDay {
    date: string;
    tempMaxC: string;
    tempMinC: string;
    windSpeedKph: number;
    windGustKph: number;
    windDir: string;
    windDirDeg: number;
    icon: string;
    rainMm: number;
}

interface CacheItem {
    timestamp: number;
    data: ForecastDay[];
}

const weatherCache = new Map<string, CacheItem>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; 

export async function ForecastDataCollector(cityName: string): Promise<ForecastDay[]> {
    if (!cityName || !cityName.trim()) return [];
    
    const normalizedCity = cityName.trim().toLowerCase();
    const now = Date.now();
    if (weatherCache.has(normalizedCity)) {
        const cached = weatherCache.get(normalizedCity)!;
        if (now - cached.timestamp < CACHE_DURATION_MS) {
            return cached.data; 
        }
    }

    const res = await fetch("http://localhost:8080/forecast/cityname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName })
    });

    if (!res.ok) {
        throw new Error(`Forecast request failed: ${res.status} ${res.statusText}`);
    }

    const raw = await res.json();

    const data: ForecastDay[] = raw.map((d: any) => ({
        date: d.date,
        tempMaxC: d.tempMaxC,
        tempMinC: d.tempMinC,
        windSpeedKph: parseFloat(String(d.windSpeedKph).replace(",", ".")),
        windGustKph: parseFloat(String(d.windGustKph).replace(",", ".")),
        rainMm: d.rainMm ? parseFloat(d.rainMm) : 0,
        windDir: d.windDir,
        windDirDeg: d.windDirDeg,
        icon: d.icon
    }));
    weatherCache.set(normalizedCity, {
        timestamp: now,
        data: data
    });

    return data;
}