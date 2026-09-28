import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, Tooltip, GeoJSON, useMapEvents } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ikona stacji: czarna kropka + mały podpis (nazwa miasta) pod spodem.
// Punkt zakotwiczenia to środek kropki (iconSize [0,0] + elementy pozycjonowane absolutnie),
// więc kropka leży dokładnie w miejscu współrzędnych stacji.
function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
}

function makeDotIcon(label: string, temp?: string | number): L.DivIcon {
    const tempText = temp !== undefined && temp !== null && temp !== ''
        ? `${temp}°C`
        : '';

    return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -8],
        html: `
            <div style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#000;cursor:pointer;"></div>
            <div style="position:absolute;left:0;top:8px;transform:translateX(-50%);white-space:nowrap;text-align:center;cursor:pointer;pointer-events:none;">
                <div style="font-size:18px;line-height:1.1;font-weight:600;color:#000;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${escapeHtml(label)}</div>
                ${tempText ? `<div style="font-size:18px;line-height:1.1;font-weight:700;color:#1a237e;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${escapeHtml(tempText)}</div>` : ''}
            </div>
        `,
    });
}

interface SynopItem {
    station: string;
    province?: string; // opcjonalne - patrz uwaga przy stationsInProvince() niżej
    temprature?: string;
    airPressure?: string;
    relativeHumidity?: string;
    windSpeed?: string;
    latitudeGeo?: number;
    longitudeGeo?: number;
}

type GroupedSynopResponse = Record<string, SynopItem[]>;

// ============================================================================
// MAPA GŁÓWNA (cała Polska)
// ============================================================================

// UKŁAD STRONY: wysokość zarezerwowana u góry na menu oraz sztywny rozmiar ramki mapy.
// Ramka jest kwadratowa (obrazek mapy jest 1:1) i zawsze mieści się w oknie pod menu.
const MENU_HEIGHT = 80; // px - tu wjedzie menu
const PAGE_GAP = 16;    // px - odstęp mapy od krawędzi
const MAP_FRAME_SIZE = `min(calc(100vh - ${MENU_HEIGHT}px - ${PAGE_GAP * 2}px), calc(100vw - ${PAGE_GAP * 2}px))`;

const MAP_HEIGHT = 1000;
const MAP_WIDTH = 1000;

const imageBounds: LatLngBoundsExpression = [
    [0, 0],
    [MAP_HEIGHT, MAP_WIDTH]
];

// WAŻNE: te wartości muszą być identyczne z zakresem lon/lat użytym przy
// renderowaniu polska_mapa_szara.png (aspect='auto', bez marginesu, bez
// zniekształcenia proporcji - obrazek wypełnia kadr krawędź-do-krawędzi).
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

// "śląskie" / "warmińsko-mazurskie" -> "Śląskie" / "Warmińsko-Mazurskie"
function capitalizeWoj(name: string): string {
    return name.replace(/(^|[\s-])\p{L}/gu, (c) => c.toUpperCase());
}

// Miasta wojewódzkie pokazywane na widoku podstawowym (cała Polska).
// Dopasowanie po nazwie stacji (dokładnie tak, jak przychodzi z API w polu
// "stacja"/"station"). To rozwiązanie pragmatyczne - jeśli kiedyś backend
// zacznie zwracać np. flagę "isCapital" albo stabilne station_id, lepiej
// przełączyć się na to zamiast dopasowania po nazwie tekstowej.
// (Lubuskie ma dwie siedziby władz: Gorzów Wielkopolski i Zielona Góra -
// stąd 17 nazw na 16 województw).
const CAPITAL_STATION_NAMES = new Set<string>([
    'Białystok',       // podlaskie
    'Katowice',        // śląskie
    'Gdańsk',          // pomorskie
    'Gorzów',          // lubuskie (siedziba wojewody)
    'Zielona Góra',    // lubuskie (siedziba sejmiku)
    'Wrocław',         // dolnośląskie
    'Poznań',          // wielkopolskie
    'Kraków',          // małopolskie
    'Szczecin',        // zachodniopomorskie
    'Olsztyn',         // warmińsko-mazurskie
    'Kielce',          // świętokrzyskie
    'Warszawa',        // mazowieckie
    'Rzeszów',         // podkarpackie
    'Lublin',          // lubelskie
    'Łódź',            // łódzkie
    'Opole',           // opolskie
    'Toruń',           // kujawsko-pomorskie
]);

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

interface VoivodeshipsLayerProps {
    geoData: GeoJSON.FeatureCollection | null;
    onSelect: (rawName: string) => void;
}

function VoivodeshipsLayer({ geoData, onSelect }: VoivodeshipsLayerProps) {
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
                // Nie zoomujemy już mapy głównej w tle - samo kliknięcie tylko
                // otwiera modal ze szczegółową mapą powiatów (patrz ModalMap).
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

// ============================================================================
// GEOMETRIA: sprawdzanie, czy punkt (stacja) leży wewnątrz danego województwa
// Liczymy to bezpośrednio z tych samych granic (wojewodztwa.geojson), których
// już używamy do rysowania/hover/klik - więc wynik zawsze jest spójny z tym,
// co widać na mapie, niezależnie od tego, czy backend przysyła pole "province".
// ============================================================================

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
            if (rayCastInRing(lng, lat, rings[h])) return false; // dziura (np. enklawa)
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
    stations: SynopItem[],
    geoData: GeoJSON.FeatureCollection | null,
    provinceNazwa: string
): SynopItem[] {
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

// ============================================================================
// PINEZKA STACJI: tooltip przy najechaniu + popup z danymi po kliknięciu
// ============================================================================

// Odporne na drobne różnice w nazwach pól z API (np. temprature/temperature).
// Jeśli nadal widzisz "b.d." - zrób console.log(stations[0]) i sprawdź,
// jak naprawdę nazywają się pola w odpowiedzi backendu.
function pick(item: any, ...keys: string[]): any {
    for (const k of keys) {
        if (item?.[k] !== undefined && item?.[k] !== null && item?.[k] !== '') return item[k];
    }
    return undefined;
}

function stationName(item: SynopItem): string {
    return pick(item, 'station', 'stacja') ?? 'Stacja';
}
// function formatTemp(temp?: string | number): string | undefined {
//     if (temp === undefined || temp === null || temp === '') return undefined;
//     const n = typeof temp === 'number' ? temp : parseFloat(String(temp).replace(',', '.'));
//     if (Number.isNaN(n)) return String(temp);
//     return `${Math.round(n)}`;
// }
function StationMarker({ item, position }: { item: SynopItem; position: [number, number] }) {
    const [popupOpen, setPopupOpen] = useState(false);

    const name = stationName(item);
    //const dotIcon = useMemo(() => makeDotIcon(name), [name]);
    const temp = pick(item, 'temprature', 'temperature', 'temperatura');
    const pressure = pick(item, 'airPressure', 'cisnienie');
    const humidity = pick(item, 'relativeHumidity', 'wilgotnosc_wzgledna', 'wilgotnoscWzgledna');
    const wind = pick(item, 'windSpeed', 'predkosc_wiatru', 'predkoscWiatru');
    const dotIcon = useMemo(() => makeDotIcon(name, temp), [name, temp]);
    const popupContent = (
        <div style={{ minWidth: '160px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#1a237e', fontSize: '16px', fontWeight: 700 }}>{name}</h3>
            <p style={{ margin: '3px 0' }}><strong>Temp:</strong> {temp ?? 'b.d.'} °C</p>
            <p style={{ margin: '3px 0' }}><strong>Ciśnienie:</strong> {pressure ?? 'b.d.'} hPa</p>
            <p style={{ margin: '3px 0' }}><strong>Wilgotność:</strong> {humidity ?? 'b.d.'} %</p>
            <p style={{ margin: '3px 0' }}><strong>Wiatr:</strong> {wind ?? 'b.d.'} m/s</p>
        </div>
    );

    return (
        <Marker position={position} icon={dotIcon} eventHandlers={{
        click: (e) => {
            L.DomEvent.stopPropagation(e.originalEvent);
        },
    }}>
            {!popupOpen && (
                <Tooltip direction="auto" offset={[0, 0]}>
                    {popupContent}
                </Tooltip>
            )}
            <Popup
                eventHandlers={{
                    add: () => setPopupOpen(true),
                    remove: () => setPopupOpen(false),
                }}
            >
                {popupContent}
            </Popup>
        </Marker>
    );
}

// ============================================================================
// MAPA POWIATÓW W MODALU (jedno województwo)
// ============================================================================

interface VoivodeshipMapInfo {
    file: string;
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
}

// Wygenerowane razem z obrazkami (patrz make_powiat_maps_v2.py -> manifest.json).
// Każde województwo ma WŁASNY kadr (inny zakres lon/lat), dlatego każde ma
// swój własny zestaw granic tu, obok pliku PNG.
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

interface ModalMapProps {
    info: VoivodeshipMapInfo;
    stations: SynopItem[];
    geometry?: GeoJSON.Geometry; // kształt klikniętego województwa (do wykrywania kliknięcia "poza")
    onClose: () => void;
}

// Kliknięcie w mapę: zamieniamy pozycję kliknięcia z powrotem na lon/lat
// (odwrotność toXY) i sprawdzamy, czy leży wewnątrz kształtu województwa.
// Jeśli NIE - zamykamy modal i wracamy do mapy Polski. Kliknięcia w pinezki
// nie docierają tu (Leaflet nie przekazuje ich do mapy), więc popupy działają.
function OutsideShapeCloser({ info, geometry, onClose }: {
    info: VoivodeshipMapInfo;
    geometry?: GeoJSON.Geometry;
    onClose: () => void;
}) {
    useMapEvents({
        click: (e) => {
            if (!geometry) return;
            const y = e.latlng.lat; // w CRS.Simple: lat = y, lng = x (0..1000)
            const x = e.latlng.lng;
            const lat = info.minLat + (y / 1000) * (info.maxLat - info.minLat);
            const lng = info.minLng + (x / 1000) * (info.maxLng - info.minLng);
            if (!pointInGeometry(lng, lat, geometry)) onClose();
        },
    });
    return null;
}

function ModalMap({ info, stations, geometry, onClose }: ModalMapProps) {
    const H = 1000;
    const W = 1000;
    const bounds: LatLngBoundsExpression = [[0, 0], [H, W]];
    const containerRef = useRef<HTMLDivElement | null>(null);

    const toXY = (lat: number, lng: number): [number, number] => {
        const y = ((lat - info.minLat) / (info.maxLat - info.minLat)) * H;
        const x = ((lng - info.minLng) / (info.maxLng - info.minLng)) * W;
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
                <ImageOverlay url={`/powiaty/${info.file}`} bounds={bounds} />
            <OutsideShapeCloser info={info} geometry={geometry} onClose={onClose} />
                {stations.map((item, index) => {
                    if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                    const pos = toXY(item.latitudeGeo, item.longitudeGeo);
                    return <StationMarker key={index} item={item} position={pos} />;
                })}
            </MapContainer>
        </div>
    );
}

// ============================================================================
// APP
// ============================================================================

export default function App() {
    const [stations, setStations] = useState<SynopItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/synop/grouped')
            .then(res => res.json() as Promise<GroupedSynopResponse>)
            .then(data => {
                setStations(Object.values(data).flat());
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd podczas pobierania danych:", err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetch('/wojewodztwa.geojson')
            .then(res => res.json())
            .then((data: GeoJSON.FeatureCollection) => setGeoData(data))
            .catch(err => console.error("Błąd wczytywania granic województw:", err));
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
    }, [loading]); // mapa montuje się dopiero po zakończeniu ładowania

    const handleSelectProvince = (rawName: string) => {
        setSelectedProvince(rawName);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div style={{ padding: '20px' }}>Ładowanie mapy...</div>;

    // Widok podstawowy: TYLKO miasta wojewódzkie.
    const capitalStations = stations.filter(s => CAPITAL_STATION_NAMES.has(stationName(s)));

    const provinceInfo = selectedProvince ? POWIAT_MAPS[selectedProvince.toLowerCase()] : undefined;
    const provinceStations = selectedProvince ? stationsInProvince(stations, geoData, selectedProvince) : [];
    const provinceGeometry = selectedProvince
        ? geoData?.features.find(
            f => ((f.properties as any)?.nazwa as string | undefined)?.toLowerCase() === selectedProvince.toLowerCase()
        )?.geometry
        : undefined;

    return (
        // position: fixed + inset: 0 -> strona zajmuje cały ekran niezależnie od
        // domyślnego CSS z Vite (#root z max-width/padding/margin), bez scrolla.
        <div style={{ position: 'fixed', inset: 0, background: '#ffffff', overflow: 'hidden' }}>
            {/* Miejsce na menu */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: MENU_HEIGHT }} />

            {/* Kontener mapy głównej - dostaje blur, gdy modal jest otwarty */}
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
              {/* Sztywna, wycentrowana ramka mapy (blur działa tylko na nią) */}
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
                dragging={false}   // mapy nie da się przesuwać
                keyboard={false}   // ani strzałkami
                    style={{ height: '100%', width: '100%', background: '#ffffff' }}
                >
                    <ImageOverlay
                        url="/polska_mapa_szara.png"
                        bounds={imageBounds}
                    />

                    <VoivodeshipsLayer geoData={geoData} onSelect={handleSelectProvince} />

                    {capitalStations.map((item, index) => {
                        if (!item.latitudeGeo || !item.longitudeGeo) return null;
                        const mapPosition = parseGpsToMapCoords(item.latitudeGeo, item.longitudeGeo);

                        return <StationMarker key={index} item={item} position={mapPosition} />;
                    })}
                </MapContainer>
              </div>
            </div>

            {/* MODAL: mapa powiatów wybranego województwa + jego stacje, na przezroczystym tle */}
            {isModalOpen && selectedProvince && (
                // UWAGA: celowo NIE ma tu żadnego wewnętrznego stopPropagation na
                // treści modala. Dzięki temu kliknięcie w JAKIEKOLWIEK miejsce
                // w obrębie tego kontenera - w tym w puste/przezroczyste miejsca
                // wokół kształtu województwa na mapce powiatów - bąbelkuje aż
                // tutaj i zamyka modal. Wyjątki: przycisk "x" (jawnie zatrzymuje
                // propagację) oraz markery/popupy Leaflet (Leaflet sam zatrzymuje
                // propagację kliknięcia na pinezce, więc otwarcie popupu nie
                // zamyka modala).
                <div
                    onClick={closeModal}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'transparent', // NIE zasłaniamy zblurowanej mapy Polski żadnym kolorem
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 8,
                    }}>
                        <h2 style={{
                            margin: 0,
                            color: '#1a237e',
                            pointerEvents: 'none', // klik "przez" tytuł też zamyka modal
                        }}>
                            Województwo {capitalizeWoj(selectedProvince)}
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

                    {provinceInfo ? (
                        <ModalMap info={provinceInfo} stations={provinceStations} geometry={provinceGeometry} onClose={closeModal} />
                    ) : (
                        <p style={{ color: '#1a237e' }}>Brak mapy powiatów dla tego województwa.</p>
                    )}
                </div>
            )}
        </div>
    );
}
