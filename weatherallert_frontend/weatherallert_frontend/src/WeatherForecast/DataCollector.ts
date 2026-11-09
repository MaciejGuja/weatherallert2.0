export async function DataCollector(cityName: string): Promise<ForecastDay[]> {
    const res = await fetch("http://localhost:8080/forecast/cityname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName })
    });

    if (!res.ok) {
        throw new Error(`Forecast request failed: ${res.status} ${res.statusText}`);
    }

    const raw = await res.json();

    return raw.map((d: any) => ({
        date: d.date,
        tempMaxC: d.tempMaxC,
        tempMinC: d.tempMinC,
        windSpeedKph: parseFloat(String(d.windSpeedKph).replace(",", ".")),
        windGustKph: parseFloat(String(d.windGustKph).replace(",", ".")),
        windDir: d.windDir,
        windDirDeg: d.windDirDeg,
        icon: d.icon
    }));
}
export interface ForecastDay {
    date: string;
    tempMaxC: number;
    tempMinC: number;
    windSpeedKph: number;
    windGustKph: number;
    windDir: string;
    windDirDeg: number;
    icon: string;
}