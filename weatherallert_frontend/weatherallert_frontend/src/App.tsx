import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { MapContainer, ImageOverlay, GeoJSON, useMapEvents } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { SynopPresentation, filterCapitalStations, SynopMarker, type SynopStation } from './SynopPresentation';
import { MeteoPresentation, MeteoMarker, type MeteoStation } from './MeteoPresentation';
import { POWIAT_DETAIL_MAPS, type PowiatDetailMapInfo } from './powiatDetailMaps';

type DataType = 'synop' | 'meteo';

type StationData = SynopStation | MeteoStation;

function flattenBackendResponse(data: Record<string, any[]> | any[]): any[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Object.values(data).flat();
}

function normalizeSynopData(item: any): SynopStation {
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

function normalizeMeteoData(item: any): MeteoStation {
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

const MENU_HEIGHT = 80;
const PAGE_GAP = 16;
const MAP_FRAME_SIZE = `min(calc(100vh - ${MENU_HEIGHT}px - ${PAGE_GAP * 2}px), calc(100vw - ${PAGE_GAP * 2}px))`;

const MAP_HEIGHT = 1000;
const MAP_WIDTH = 1000;

const imageBounds: LatLngBoundsExpression = [
    [0, 0],
    [MAP_HEIGHT, MAP_WIDTH]
];

const GEO_BOUNDS = {
    minLat: 48.9,
    maxLat: 55.0,
    minLng: 14.0,
    maxLng: 24.2
};

function parseGpsToMapCoords(lat: number, lng: number): [number, number] {
    const y = ((lat - GEO_BOUNDS.minLat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * MAP_HEIGHT;
    const x = ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * MAP_WIDTH;
    return [y, x];
}

function coordsToLatLng(coords: number[]): L.LatLng {
    const [lng, lat] = coords;
    const [y, x] = parseGpsToMapCoords(lat, lng);
    return L.latLng(y, x);
}

function capitalizeWoj(name: string): string {
    return name.replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
}

type Ring = number[][];

function rayCastInRing(lng: number, lat: number, ring: Ring): boolean {
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

function pointInGeometry(lng: number, lat: number, geometry: GeoJSON.Geometry): boolean {
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

function stationsInProvince(
    stations: StationData[],
    geoData: GeoJSON.FeatureCollection | null,
    provinceNazwa: string
): StationData[] {
    if (!geoData) return [];
    const feature = geoData.features.find(
        f => ((f.properties as any)?.nazwa as string | undefined)?.toLowerCase() === provinceNazwa.toLowerCase()
    );
    if (!feature) return [];
    return stations.filter(s => {
        if (s.latitudeGeo == null || s.longitudeGeo == null) return false;
        return pointInGeometry(s.longitudeGeo, s.latitudeGeo, feature.geometry);
    });
}

function stationsInGeometry(stations: StationData[], geometry?: GeoJSON.Geometry): StationData[] {
    if (!geometry) return [];
    return stations.filter(s => {
        if (s.latitudeGeo == null || s.longitudeGeo == null) return false;
        return pointInGeometry(s.longitudeGeo, s.latitudeGeo, geometry);
    });
}

// Kody TERYT województw (2 pierwsze cyfry kodu powiatu).
const WOJ_TERYT: Record<string, string> = {
    "dolnośląskie": "02", "kujawsko-pomorskie": "04", "lubelskie": "06", "lubuskie": "08",
    "łódzkie": "10", "małopolskie": "12", "mazowieckie": "14", "opolskie": "16",
    "podkarpackie": "18", "podlaskie": "20", "pomorskie": "22", "śląskie": "24",
    "świętokrzyskie": "26", "warmińsko-mazurskie": "28", "wielkopolskie": "30", "zachodniopomorskie": "32",
};

// "raciborski" -> "Powiat raciborski", miasto na prawach powiatu -> samo "Katowice"
function powiatLabel(info: PowiatDetailMapInfo): string {
    return info.subdivided ? `Powiat ${info.name}` : info.name;
}

const DEFAULT_STYLE: L.PathOptions = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: 'transparent',
    weight: 0,
};

const HOVER_STYLE: L.PathOptions = {
    fillColor: '#ffca28',
    fillOpacity: 0.45,
    color: '#ffffff',
    weight: 2,
};

function VoivodeshipsLayer({ geoData, onSelect }: { geoData: GeoJSON.FeatureCollection | null; onSelect: (rawName: string) => void }) {
    const geoJsonRef = useRef<L.GeoJSON | null>(null);

    if (!geoData) return null;

    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
        const rawName: string = (feature.properties as any)?.nazwa ?? '';
        const path = layer as L.Path;

        layer.on({
            mouseover: () => {
                path.setStyle(HOVER_STYLE);
                path.bringToFront();
            },
            mouseout: () => {
                geoJsonRef.current?.resetStyle(path);
            },
            click: () => {
                onSelect(rawName);
            },
        });

        layer.bindTooltip(capitalizeWoj(rawName), { sticky: true });
    };

    return (
        <GeoJSON
            ref={geoJsonRef}
            data={geoData}
            coordsToLatLng={coordsToLatLng as any}
            style={() => DEFAULT_STYLE}
            onEachFeature={onEachFeature}
        />
    );
}

interface VoivodeshipMapInfo {
    file: string;
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
}

const POWIAT_MAPS: Record<string, VoivodeshipMapInfo> = {
    "śląskie": { file: "powiaty_slaskie.png", minLng: 17.9574, maxLng: 20.0516, minLat: 49.3258, maxLat: 51.1676 },
    "opolskie": { file: "powiaty_opolskie.png", minLng: 16.8364, maxLng: 18.7669, minLat: 49.9236, maxLat: 51.2435 },
    "wielkopolskie": { file: "powiaty_wielkopolskie.png", minLng: 15.6432, maxLng: 19.2381, minLat: 51.0016, maxLat: 53.758 },
    "zachodniopomorskie": { file: "powiaty_zachodniopomorskie.png", minLng: 14.0085, maxLng: 17.0965, minLat: 52.5469, maxLat: 54.6475 },
    "świętokrzyskie": { file: "powiaty_swietokrzyskie.png", minLng: 19.6178, maxLng: 21.9557, minLat: 50.1397, maxLat: 51.3887 },
    "kujawsko-pomorskie": { file: "powiaty_kujawsko_pomorskie.png", minLng: 17.1467, maxLng: 19.8622, minLat: 52.2726, maxLat: 53.8391 },
    "podlaskie": { file: "powiaty_podlaskie.png", minLng: 21.4989, maxLng: 24.0404, minLat: 52.1947, maxLat: 54.4956 },
    "dolnośląskie": { file: "powiaty_dolnoslaskie.png", minLng: 14.6983, maxLng: 17.9144, minLat: 50.028, maxLat: 51.8731 },
    "podkarpackie": { file: "powiaty_podkarpackie.png", minLng: 21.046, maxLng: 23.6441, minLat: 48.9293, maxLat: 50.8932 },
    "małopolskie": { file: "powiaty_malopolskie.png", minLng: 18.9897, maxLng: 21.5144, minLat: 49.1248, maxLat: 50.5742 },
    "pomorskie": { file: "powiaty_pomorskie.png", minLng: 16.5811, maxLng: 19.7667, minLat: 53.4372, maxLat: 54.8902 },
    "warmińsko-mazurskie": { file: "powiaty_warminsko_mazurskie.png", minLng: 18.9805, maxLng: 22.9532, minLat: 53.0865, maxLat: 54.5059 },
    "łódzkie": { file: "powiaty_lodzkie.png", minLng: 17.9711, maxLng: 20.7627, minLat: 50.7813, maxLat: 52.4561 },
    "mazowieckie": { file: "powiaty_mazowieckie.png", minLng: 19.1044, maxLng: 23.2832, minLat: 50.9144, maxLat: 53.5805 },
    "lubelskie": { file: "powiaty_lubelskie.png", minLng: 21.5143, maxLng: 24.247, minLat: 50.1704, maxLat: 52.3692 },
    "lubuskie": { file: "powiaty_lubuskie.png", minLng: 14.4589, maxLng: 16.4921, minLat: 51.2928, maxLat: 53.1944 },
};

type GeoRect = Pick<VoivodeshipMapInfo, 'minLng' | 'maxLng' | 'minLat' | 'maxLat'>;

// Wysokość obrazka w jednostkach Leafleta to zawsze 1000, szerokość = 1000 * aspect
// (aspect = 1 dla obrazków województw, dla powiatów bierzemy go z powiatDetailMaps.ts).
function OutsideShapeCloser({ geo, aspect, geometry, onClose }: { geo: GeoRect; aspect: number; geometry?: GeoJSON.Geometry; onClose: () => void }) {
    useMapEvents({
        click: (e) => {
            if (!geometry) return;
            const y = e.latlng.lat;
            const x = e.latlng.lng;
            const lat = geo.minLat + (y / 1000) * (geo.maxLat - geo.minLat);
            const lng = geo.minLng + (x / (1000 * aspect)) * (geo.maxLng - geo.minLng);
            if (!pointInGeometry(lng, lat, geometry)) onClose();
        },
    });
    return null;
}

// Powiaty wybranego województwa: podświetlenie po najechaniu + klik = wejście w powiat.
// Rysowane na obrazku województwa, więc używamy jego własnego kadru (info).
function PowiatsLayer({ features, info, onSelect }: { features: GeoJSON.Feature[]; info: GeoRect; onSelect: (code: string) => void }) {
    const geoJsonRef = useRef<L.GeoJSON | null>(null);
    const data = useMemo<GeoJSON.FeatureCollection>(() => ({ type: 'FeatureCollection', features }), [features]);
    const toLatLng = useMemo(() => (coords: number[]) => {
        const [lng, lat] = coords;
        const y = ((lat - info.minLat) / (info.maxLat - info.minLat)) * 1000;
        const x = ((lng - info.minLng) / (info.maxLng - info.minLng)) * 1000;
        return L.latLng(y, x);
    }, [info]);

    if (features.length === 0) return null;

    const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
        const code: string = (feature.properties as any)?.code ?? '';
        const path = layer as L.Path;
        const detail = POWIAT_DETAIL_MAPS[code];

        layer.on({
            mouseover: () => {
                path.setStyle(HOVER_STYLE);
                path.bringToFront();
            },
            mouseout: () => {
                geoJsonRef.current?.resetStyle(path);
            },
            click: () => {
                if (detail) onSelect(code);
            },
        });

        const fallbackName: string = (feature.properties as any)?.name ?? '';
        layer.bindTooltip(detail ? powiatLabel(detail) : fallbackName, { sticky: true });
    };

    return (
        <GeoJSON
            ref={geoJsonRef}
            data={data}
            coordsToLatLng={toLatLng as any}
            style={() => DEFAULT_STYLE}
            onEachFeature={onEachFeature}
        />
    );
}

// Jedna mapka w modalu: widok województwa (obrazek powiatów) albo widok powiatu (obrazek gmin).
function ModalMap({ imageUrl, geo, aspect = 1, stations, dataType, geometry, onClose, overlay }: {
    imageUrl: string;
    geo: GeoRect;
    aspect?: number;
    stations: StationData[];
    dataType: DataType;
    geometry?: GeoJSON.Geometry;
    onClose: () => void;
    overlay?: ReactNode;
}) {
    const H = 1000;
    const W = 1000 * aspect;
    const bounds: LatLngBoundsExpression = [[0, 0], [H, W]];
    const containerRef = useRef<HTMLDivElement | null>(null);

    const toXY = (lat: number, lng: number): [number, number] => {
        const y = ((lat - geo.minLat) / (geo.maxLat - geo.minLat)) * H;
        const x = ((lng - geo.minLng) / (geo.maxLng - geo.minLng)) * W;
        return [y, x];
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const stop = (e: MouseEvent) => e.stopPropagation();
        el.addEventListener('click', stop);
        el.addEventListener('mousedown', stop);
        el.addEventListener('dblclick', stop);
        return () => {
            el.removeEventListener('click', stop);
            el.removeEventListener('mousedown', stop);
            el.removeEventListener('dblclick', stop);
        };
    }, []);

    return (
        <div ref={containerRef}>
            <MapContainer
                crs={L.CRS.Simple}
                bounds={bounds}
                boundsOptions={{ padding: [30, 30] }}
                zoomSnap={0.1}
                minZoom={-3}
                maxZoom={3}
                maxBounds={bounds}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                attributionControl={false}
                doubleClickZoom={false}
                dragging={false}
                keyboard={false}
                style={{
                    height: 'min(85vh, 95vw)',
                    width: 'min(85vh, 95vw)',
                    background: 'transparent',
                }}
            >
                <ImageOverlay url={imageUrl} bounds={bounds} />
                {overlay}
                <OutsideShapeCloser geo={geo} aspect={aspect} geometry={geometry} onClose={onClose} />
                {stations.map((item, index) => {
                    if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                    const pos = toXY(item.latitudeGeo, item.longitudeGeo);
                    if (dataType === 'synop') {
                        const s = item as SynopStation;
                        return <SynopMarker key={`synop-${s.stationId || index}`} item={s} position={pos} />;
                    }
                    const m = item as MeteoStation;
                    return <MeteoMarker key={`meteo-${m.stationCode || index}`} item={m} position={pos} />;
                })}
            </MapContainer>
        </div>
    );
}

export default function App() {
    const [dataType, setDataType] = useState<DataType>('synop');
    const [synopStations, setSynopStations] = useState<SynopStation[]>([]);
    const [meteoStations, setMeteoStations] = useState<MeteoStation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [powiatGeoData, setPowiatGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [selectedPowiat, setSelectedPowiat] = useState<string | null>(null); // kod TERYT powiatu
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        setLoading(true);
        const endpoint = dataType === 'synop'
            ? 'http://localhost:8080/api/synop/grouped'
            : 'http://localhost:8080/api/meteo/grouped';

        fetch(endpoint)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                const rawList = flattenBackendResponse(data);
                if (dataType === 'synop') {
                    setSynopStations(rawList.map(normalizeSynopData));
                } else {
                    setMeteoStations(rawList.map(normalizeMeteoData));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(`Błąd pobierania (${dataType}):`, err);
                if (dataType === 'synop') setSynopStations([]);
                else setMeteoStations([]);
                setLoading(false);
            });
    }, [dataType]);

    useEffect(() => {
        fetch('/wojewodztwa.geojson')
            .then(res => res.json())
            .then((data: GeoJSON.FeatureCollection) => setGeoData(data))
            .catch(err => console.error("Błąd wczytywania granic województw:", err));
    }, []);

    useEffect(() => {
        fetch('/powiaty_teryt.geojson')
            .then(res => res.json())
            .then((data: GeoJSON.FeatureCollection) => setPowiatGeoData(data))
            .catch(err => console.error("Błąd wczytywania granic powiatów:", err));
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const raf = requestAnimationFrame(() => {
            map.invalidateSize();
            map.fitBounds(imageBounds, { padding: [10, 10] });
            map.panTo([MAP_HEIGHT / 2, MAP_WIDTH / 2], { animate: false });
        });

        return () => cancelAnimationFrame(raf);
    }, [loading]);

    const handleSelectProvince = (rawName: string) => {
        setSelectedProvince(rawName);
        setSelectedPowiat(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPowiat(null);
    };

    const displayedSynop = useMemo(() => filterCapitalStations(synopStations), [synopStations]);
    const displayedMeteo = meteoStations;

    const activeStations: StationData[] = dataType === 'synop' ? displayedSynop : displayedMeteo;
    const allStations: StationData[] = dataType === 'synop' ? synopStations : meteoStations;

    const provinceInfo = selectedProvince ? POWIAT_MAPS[selectedProvince.toLowerCase()] : undefined;
    const provinceStations = selectedProvince ? stationsInProvince(allStations, geoData, selectedProvince) : [];
    const provinceGeometry = selectedProvince
        ? geoData?.features.find(
            f => ((f.properties as any)?.nazwa as string | undefined)?.toLowerCase() === selectedProvince.toLowerCase()
        )?.geometry
        : undefined;

    const stationCount = dataType === 'synop' ? synopStations.length : meteoStations.length;

    // --- POWIATY ---
    const provinceCode = selectedProvince ? WOJ_TERYT[selectedProvince.toLowerCase()] : undefined;
    const provincePowiatFeatures = useMemo(
        () => (powiatGeoData && provinceCode
            ? powiatGeoData.features.filter(f => String((f.properties as any)?.code ?? '').startsWith(provinceCode))
            : []),
        [powiatGeoData, provinceCode]
    );
    const powiatInfo = selectedPowiat ? POWIAT_DETAIL_MAPS[selectedPowiat] : undefined;
    const powiatGeometry = selectedPowiat
        ? powiatGeoData?.features.find(f => (f.properties as any)?.code === selectedPowiat)?.geometry
        : undefined;
    const powiatStations = stationsInGeometry(allStations, powiatGeometry);

    const modalTitle = !selectedProvince
        ? ''
        : selectedPowiat && powiatInfo
            ? `${powiatLabel(powiatInfo)} (woj. ${capitalizeWoj(selectedProvince)}) – ${powiatStations.length} stacji ${dataType.toUpperCase()}`
            : `Województwo ${capitalizeWoj(selectedProvince)} (${provinceStations.length} stacji ${dataType.toUpperCase()})`;

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#ffffff', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: MENU_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                zIndex: 1000,
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <span style={{ fontWeight: 600, fontSize: '15px', color: '#333' }}>Źródło danych:</span>

                <div style={{
                    display: 'inline-flex',
                    background: '#e0e0e0',
                    borderRadius: '24px',
                    padding: '3px',
                    gap: '4px'
                }}>
                    <button
                        onClick={() => setDataType('synop')}
                        style={{
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: dataType === 'synop' ? 'bold' : 'normal',
                            background: dataType === 'synop' ? '#1a237e' : 'transparent',
                            color: dataType === 'synop' ? '#ffffff' : '#424242',
                            transition: 'all 0.2s ease',
                            boxShadow: dataType === 'synop' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        Synoptyczne
                    </button>
                    <button
                        onClick={() => setDataType('meteo')}
                        style={{
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: dataType === 'meteo' ? 'bold' : 'normal',
                            background: dataType === 'meteo' ? '#2e7d32' : 'transparent',
                            color: dataType === 'meteo' ? '#ffffff' : '#424242',
                            transition: 'all 0.2s ease',
                            boxShadow: dataType === 'meteo' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        Meteorologiczne ({meteoStations.length} stacji)
                    </button>
                </div>
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: MENU_HEIGHT,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {loading ? (
                    <div style={{ fontSize: '16px', color: dataType === 'synop' ? '#1a237e' : '#2e7d32', fontWeight: 600 }}>
                        Ładowanie stacji ({dataType === 'synop' ? 'Synop' : 'Meteo'})...
                    </div>
                ) : (
                    <div
                        style={{
                            width: MAP_FRAME_SIZE,
                            height: MAP_FRAME_SIZE,
                            flex: 'none',
                            background: '#ffffff',
                            borderRadius: 8,
                            overflow: 'hidden',
                            filter: isModalOpen ? 'blur(6px) brightness(0.7)' : 'none',
                            transition: 'filter 0.25s ease',
                        }}
                    >
                        <MapContainer
                            ref={mapRef}
                            crs={L.CRS.Simple}
                            center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
                            bounds={imageBounds}
                            zoomSnap={0.1}
                            minZoom={-3}
                            maxZoom={5}
                            maxBounds={imageBounds}
                            maxBoundsViscosity={1.0}
                            doubleClickZoom={false}
                            dragging={false}
                            keyboard={false}
                            style={{ height: '100%', width: '100%', background: '#ffffff' }}
                        >
                            <ImageOverlay
                                url="/polska_mapa_szara.png"
                                bounds={imageBounds}
                            />

                            <VoivodeshipsLayer geoData={geoData} onSelect={handleSelectProvince} />

                            {dataType === 'synop' ? (
                                <SynopPresentation stations={displayedSynop} getPosition={parseGpsToMapCoords} />
                            ) : (
                                <MeteoPresentation stations={displayedMeteo} getPosition={parseGpsToMapCoords} />
                            )}
                        </MapContainer>
                    </div>
                )}
            </div>

            {isModalOpen && selectedProvince && (
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <h2 style={{ margin: 0, color: dataType === 'synop' ? '#1a237e' : '#2e7d32', pointerEvents: 'none' }}>
                            {modalTitle}
                        </h2>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeModal();
                            }}
                            aria-label="Zamknij"
                            style={{
                                background: 'rgba(0,0,0,0.35)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                fontSize: 20,
                                lineHeight: 1,
                                cursor: 'pointer',
                                color: 'white',
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {selectedPowiat && powiatInfo ? (
                        // WIDOK POWIATU (gminy). Klik poza kształtem = powrót do widoku województwa.
                        <ModalMap
                            key={`powiat-${selectedPowiat}`}
                            imageUrl={`/powiat_detail/${powiatInfo.file}`}
                            geo={powiatInfo}
                            aspect={powiatInfo.aspect}
                            stations={powiatStations}
                            dataType={dataType}
                            geometry={powiatGeometry}
                            onClose={() => setSelectedPowiat(null)}
                        />
                    ) : provinceInfo ? (
                        // WIDOK WOJEWÓDZTWA (powiaty). Klik w powiat = wejście w powiat, klik poza kształtem = zamknięcie.
                        <ModalMap
                            key={`woj-${selectedProvince}`}
                            imageUrl={`/powiaty/${provinceInfo.file}`}
                            geo={provinceInfo}
                            stations={provinceStations}
                            dataType={dataType}
                            geometry={provinceGeometry}
                            onClose={closeModal}
                            overlay={<PowiatsLayer features={provincePowiatFeatures} info={provinceInfo} onSelect={setSelectedPowiat} />}
                        />
                    ) : (
                        <p style={{ color: '#1a237e' }}>Brak mapy powiatów dla tego województwa.</p>
                    )}
                </div>
            )}
        </div>
    );
}