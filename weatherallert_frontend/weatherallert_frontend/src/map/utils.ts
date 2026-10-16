import L from 'leaflet';
import type { SynopStation } from './SynopPresentation';
import type { MeteoStation } from './MeteoPresentation';
import type { PowiatDetailMapInfo } from '../Powiatdetailmaps';
import type { Ring, StationData } from './types';
import {GEO_BOUNDS, MAP_HEIGHT, MAP_WIDTH } from './constans';
/**
 * @brief Przelicza współrzędne GPS na współrzędne mapy głównej (układ Leaflet CRS.Simple).
 * @param lat Szerokość geograficzna.
 * @param lng Długość geograficzna.
 * @return Para [y, x] w układzie mapy.
 */
export function parseGpsToMapCoords(lat: number, lng: number): [number, number] {
    const y = ((lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * MAP_HEIGHT;
    const x = ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * MAP_WIDTH;
    return [y, x];
};
/**
 * @brief Konwertuje współrzędne GeoJSON [lng, lat] na punkt Leaflet w układzie mapy głównej.
 * @param coords Tablica [lng, lat].
 * @return Obiekt L.LatLng w układzie mapy.
 */
export function coordsToLatLng(coords: number[]): L.LatLng {
    const [lng, lat] = coords;
    const [y, x] = parseGpsToMapCoords(lat, lng);
    return L.latLng(y, x);
}

/**
 * @brief Sprawdza metodą ray casting, czy punkt leży wewnątrz pojedynczego pierścienia.
 * @param lng Długość geograficzna punktu.
 * @param lat Szerokość geograficzna punktu.
 * @param ring Pierścień wielokąta (lista par [lng, lat]).
 * @return true, jeśli punkt leży wewnątrz pierścienia.
 */
export function rayCastInRing(lng: number, lat: number, ring: Ring): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        const intersect = (yi > lat) !== (yj > lat) &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

/**
 * @brief Sprawdza, czy punkt leży wewnątrz geometrii.
 * @param lng Długość geograficzna punktu.
 * @param lat Szerokość geograficzna punktu.
 * @param geometry Geometria GeoJSON.
 * @return true, jeśli punkt leży wewnątrz geometrii.
 */
export function pointInGeometry(lng: number, lat: number, geometry: GeoJSON.Geometry): boolean {
    if (geometry.type === 'Polygon') {
        const rings = geometry.coordinates as unknown as Ring[];
        if (rings.length === 0 || !rayCastInRing(lng, lat, rings[0])) return false;
        for (let h = 1; h < rings.length; h++) {
            if (rayCastInRing(lng, lat, rings[h])) return false;
        }
        return true;
    }
    if (geometry.type === 'MultiPolygon') {
        const polygons = geometry.coordinates as unknown as Ring[][];
        for (const rings of polygons) {
            if (rings.length === 0 || !rayCastInRing(lng, lat, rings[0])) continue;
            let inHole = false;
            for (let h = 1; h < rings.length; h++) {
                if (rayCastInRing(lng, lat, rings[h])) { inHole = true; break; }
            }
            if (!inHole) return true;
        }
        return false;
    }
    return false;
}

/**
 * @brief Zamienia pierwszą literę każdego słowa (po spacji lub myślniku) na wielką.
 * @param name Nazwa województwa.
 * @return Nazwa z wielkimi literami na początku członów.
 */
export function capitalizeWoj(name: string): string {
    return name.replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
}

/**
 * @brief Tworzy etykietę powiatu.
 * @param info Informacje o szczegółowej mapie powiatu.
 * @return Etykieta powiatu.
 */
export function powiatLabel(info: PowiatDetailMapInfo): string {
    return info.subdivided ? `Powiat ${info.name}` : info.name;
}
/**
 * @brief Spłaszcza odpowiedź backendu do jednej listy.
 * @param data Odpowiedź backendu.
 * @return Płaska lista rekordów.
 */
export function flattenBackendResponse(data: Record<string, any[]> | any[]): any[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data).flat();
}

/**
 * @brief Normalizuje surowy rekord stacji SYNOP do typu SynopStation.
 * @param item Surowy rekord z backendu.
 * @return Znormalizowana stacja SYNOP.
 */
export function normalizeSynopData(item: any): SynopStation {
    const latRaw = item.latitudeGeo ?? item.lat;
    const lonRaw = item.longitudeGeo ?? item.lon;
    const lat = latRaw != null ? parseFloat(String(latRaw)) : null;
    const lon = lonRaw != null ? parseFloat(String(lonRaw)) : null;

    return {
        stationId: item.stationId ?? null,
        station: item.station ?? 'Nieznana stacja',
        province: item.province ?? null,
        country: item.country ?? null,
        measurementData: item.measurementData ?? null,
        measurementHour: item.measurementHour ?? null,
        temprature: item.temprature ?? null,
        windSpeed: item.windSpeed ?? null,
        windDirection: item.windDirection ?? null,
        relativeHumidity: item.relativeHumidity ?? null,
        totalPrecipitation: item.totalPrecipitation ?? null,
        airPressure: item.airPressure ?? null,
        latitudeGeo: lat === null || Number.isNaN(lat) ? null : lat,
        longitudeGeo: lon === null || Number.isNaN(lon) ? null : lon,
    };
}

/**
 * @brief Normalizuje surowy rekord stacji METEO do typu MeteoStation.
 * @param item Surowy rekord z backendu.
 * @return Znormalizowana stacja METEO.
 */
export function normalizeMeteoData(item: any): MeteoStation {
    const parseNum = (v: any): number | null => {
        if (v === null || v === undefined || v === '') return null;
        const n = typeof v === 'number' ? v : parseFloat(String(v));
        return Number.isNaN(n) ? null : n;
    };

    return {
        stationCode: item.stationCode ?? null,
        stationName: item.stationName ?? 'Nieznana stacja',
        province: item.province ?? null,
        country: item.country ?? null,
        latitudeGeo: parseNum(item.lat),
        longitudeGeo: parseNum(item.lon),
        stationEstablishmentYear: item.stationEstablishmentYear ?? null,
        heightAboveSeaLevel: item.heightAboveSeaLevel ?? null,
        groundTemperature: item.groundTemperature ?? null,
        groundTemperatureDate: item.groundTemperatureDate ?? null,
        airTemperature: item.airTemperature ?? null,
        airTemperatureDate: item.airTemperatureDate ?? null,
        windDirection: item.windDirection ?? null,
        windDirectionDate: item.windDirectionDate ?? null,
        windAverageSpeed: item.windAverageSpeed ?? null,
        windAverageSpeedDate: item.windAverageSpeedDate ?? null,
        windMaximumSpeed: item.windMaximumSpeed ?? null,
        windMaximumSpeedDate: item.windMaximumSpeedDate ?? null,
        relativeHumidity: item.relativeHumidity ?? null,
        relativeHumidityDate: item.relativeHumidityDate ?? null,
        windGust10min: item.windGust10min ?? null,
        windGust10minDate: item.windGust10minDate ?? null,
        precipitation10min: item.precipitation10min ?? null,
        precipitation10minDate: item.precipitation10minDate ?? null,
    };
}

/**
 * @brief Zwraca stacje leżące wewnątrz podanej geometrii.
 * @param stations Lista stacji.
 * @param geometry Geometria GeoJSON.
 * @return Stacje znajdujące się w geometrii.
 */
export function stationsInGeometry(stations: StationData[], geometry: GeoJSON.Geometry | null): StationData[] {
    if (!geometry) return [];
    return stations.filter(s=> {
        if(s.latitudeGeo === null || s.longitudeGeo === null) return false;
        return pointInGeometry(s.longitudeGeo, s.latitudeGeo, geometry);
    });
}
/**
 * @brief Zwraca stacje leżące w granicach wskazanego województwa.
 * @param stations Lista stacji.
 * @param geoData Granice województw (GeoJSON).
 * @param provinceNazwa Nazwa województwa.
 * @return Stacje znajdujące się w województwie.
 */
export function stationsInProvince(stations: StationData[], geoData: GeoJSON.FeatureCollection | null, provinceNazwa: string): StationData[] {
    if(!geoData) return [];
    const provinceFeature = geoData.features.find(f =>((f.properties as any)?.nazwa as string | undefined)?.toLowerCase() === provinceNazwa.toLowerCase());
    if(!provinceFeature) return [];
    return stations.filter(s => {
        if(s.latitudeGeo === null || s.longitudeGeo === null) return false;
        return pointInGeometry(s.longitudeGeo, s.latitudeGeo, provinceFeature.geometry);
    });
}
/**
 * @brief Buduje unikalny klucz stacji z prefiksem typu (synop/meteo).
 * @param s Stacja.
 * @return Klucz tekstowy stacji.
 */
export function stationKey(s: StationData): string {
    return 'stationId' in s ? `synop:${s.stationId ?? s.station}` : `meteo:${s.stationCode ?? s.stationName}`;
}

/**
 * @brief Zwraca nazwę wyświetlaną stacji niezależnie od jej typu.
 * @param s Stacja.
 * @return Nazwa stacji.
 */
export function stationLabel(s: StationData): string {
    return 'stationId' in s ? s.station : s.stationName;
}
/**
 * @brief Dla widoku województwa zostawia z każdego powiatu JEDNĄ stację. Pierwszeństwo ma
 *        stacja pokazywana na mapie głównej (miasto wojewódzkie), potem pierwsza alfabetycznie.
 * @param stations Stacje z województwa.
 * @param powiatFeatures Obiekty GeoJSON powiatów województwa.
 * @param preferKeys Zbiór kluczy stacji preferowanych (widocznych na mapie głównej).
 * @return Lista stacji - po jednej na powiat.
 */
export function pickOnePerPowiat(stations: StationData[], powiatFeatures: GeoJSON.Feature[], preferKeys: Set<string>): StationData[] {
    const groups = new Map<string, StationData[]>();
    stations.forEach((s, i) => {
        const lat = s.latitudeGeo;
        const lng = s.longitudeGeo;
        if (lat == null || lng == null) return;
        const feature = powiatFeatures.find(pf => pointInGeometry(lng, lat, pf.geometry));
        const groupId: string = (feature?.properties as any)?.code ?? `poza-${i}`;
        const list = groups.get(groupId);
        if (list) list.push(s); else groups.set(groupId, [s]);
    });
    const result: StationData[] = [];

    for (const list of groups.values()) {
        const preferred = list.filter(s => preferKeys.has(stationKey(s)));
        let pool: StationData[];
        if (preferred.length > 0) {
            pool = preferred;
        } else {
            pool = list;
        }
        const sorted = [...pool].sort((a, b) =>
            stationLabel(a).localeCompare(stationLabel(b), 'pl')
        );
        if (sorted.length > 0) {
            result.push(sorted[0]);
        }
    }
return result;
}

