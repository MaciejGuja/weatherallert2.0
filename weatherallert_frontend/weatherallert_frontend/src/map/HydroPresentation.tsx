import React, { useMemo, useState } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
 
export interface HydroStation {
    stationCode: string | null;
    stationName: string;
    river: string | null;
    province: string | null;
    longitudeGeo: number | null;
    latitudeGeo: number | null;
    stationEstablishmentYear: string | null;
    zeroGaugeElevation: string | null;
    riverKilometer: string | null;
    alarmLevel: string | null;
    warningLevel: string | null;
    waterLevel: string | null;
    waterLevelMeasurementDate: string | null;
    waterTemperature: string | null;
    waterTemperatureMeasurementDate: string | null;
    flow: string | null;
    flowDate: string | null;
    icePhenomenon: string | null;
    icePhenomenonMeasurementDate: string | null;
    overgrowthPhenomenon: string | null;
    overgrowthPhenomenonMeasurementDate: string | null;
}
 
/**
 * @brief Zamiana znaków specjalnych HTML na encje
 * @param text Tekst do zabezpieczenia.
 * @return Tekst z zamienionymi znakami &, <, >, " oraz '.
 */
function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
}
 
/**
 * @brief Zamiana tekstowej wartości liczbowej na liczbę
 * @param value Wartość tekstowa (dopuszczalny przecinek jako separator dziesiętny).
 * @return Liczba lub null, gdy wartość jest pusta lub niepoprawna.
 */
function toNumber(value: string | null): number | null {
    if (value == null || value.trim() === '') return null;
    const parsed = Number(value.replace(',', '.'));
    return Number.isNaN(parsed) ? null : parsed;
}
 
/**
 * @brief Wyznaczenie koloru znacznika na podstawie stanu wody i poziomów ostrzegawczych
 * @param item Dane stacji HYDRO.
 * @return Kolor znacznika: czerwony (stan alarmowy), pomarańczowy (stan ostrzegawczy) lub niebieski.
 */
function getHydroColor(item: HydroStation): string {
    const level = toNumber(item.waterLevel);
    const alarm = toNumber(item.alarmLevel);
    const warning = toNumber(item.warningLevel);
 
    if (level !== null && alarm !== null && level >= alarm) return '#c62828';
    if (level !== null && warning !== null && level >= warning) return '#ef6c00';
    return '#1565c0';
}
 
/**
 * @brief Tworzenie ikony znacznika stacji HYDRO
 * @param label Nazwa stacji.
 * @param waterLevel Stan wody wyświetlany pod nazwą.
 * @param color Kolor znacznika.
 * @return Ikona Leaflet typu DivIcon.
 */
function makeHydroDotIcon(label: string, waterLevel: string | null | undefined, color: string): L.DivIcon {
    const levelText = waterLevel !== undefined && waterLevel !== null && waterLevel !== '' ? `${waterLevel} cm` : '';
 
    return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -8],
        html: `
            <div style="position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:${color};border:1px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.6);cursor:pointer;"></div>
            <div style="position:absolute;left:0;top:6px;transform:translateX(-50%);white-space:nowrap;text-align:center;cursor:pointer;pointer-events:none;">
                <div style="font-size:7.5px;line-height:1;font-weight:600;color:#0d47a1;text-shadow:0 0 2px #fff,0 0 2px #fff;">${escapeHtml(label)}</div>
                ${levelText ? `<div style="font-size:11px;line-height:1;font-weight:700;color:${color};text-shadow:0 0 2px #fff;">${escapeHtml(levelText)}</div>` : ''}
            </div>
        `,
    });
}
 
/**
 * @brief Znacznik stacji HYDRO na mapie z tooltipem (po najechaniu) i oknem szczegółów (po kliknięciu).
 * @param item Dane stacji HYDRO.
 * @param position Pozycja znacznika na mapie [y, x].
 * @param translateKey Słownik tłumaczeń.
 * @return Znacznik Leaflet z podpowiedzią i oknem szczegółów.
 */
type HydroMarkerProps = {
    item: HydroStation;
    position: [number, number];
    translateKey: Map<string, string>;
}
export function HydroMarker({ item, position, translateKey }: HydroMarkerProps) {
    const [popupOpen, setPopupOpen] = useState(false);
 
    const name = item.stationName;
    const level = item.waterLevel;
    const color = getHydroColor(item);
 
    const dotIcon = useMemo(() => makeHydroDotIcon(name, level, color), [name, level, color, translateKey]);
 
    const popupContent = (
        <div style={{ minWidth: '230px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, color: '#1565c0', fontSize: '14px', fontWeight: 700 }}>{name}</h3>
                <span style={{ fontSize: '10px', background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>HYDRO</span>
            </div>
            {item.stationCode && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-station-code")} {item.stationCode}</p>}
            {item.river && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-river")} {item.river}</p>}
            {item.riverKilometer && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-river-kilometer")} {item.riverKilometer} km</p>}
            {item.province && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-province")} {item.province}</p>}
            {item.stationEstablishmentYear && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-established-year")} {item.stationEstablishmentYear}</p>}
            {item.zeroGaugeElevation && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-hydro-zero-gauge-elevation")} {item.zeroGaugeElevation} m n.p.m.</p>}
            <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '6px 0' }} />
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-water-level")}</strong> {item.waterLevel ?? 'b.d.'} cm</p>
            {item.waterLevelMeasurementDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>{translateKey.get("map-marker-hydro-measurement-date")} {item.waterLevelMeasurementDate}</p>}
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-warning-level")}</strong> {item.warningLevel ?? 'b.d.'} cm</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-alarm-level")}</strong> {item.alarmLevel ?? 'b.d.'} cm</p>
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-water-temperature")}</strong> {item.waterTemperature ?? 'b.d.'} °C</p>
            {item.waterTemperatureMeasurementDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>{translateKey.get("map-marker-hydro-measurement-date")} {item.waterTemperatureMeasurementDate}</p>}
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-flow")}</strong> {item.flow ?? 'b.d.'} m³/s</p>
            {item.flowDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>{translateKey.get("map-marker-hydro-measurement-date")} {item.flowDate}</p>}
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-ice-phenomenon")}</strong> {item.icePhenomenon ?? 'b.d.'}</p>
            {item.icePhenomenonMeasurementDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>{translateKey.get("map-marker-hydro-measurement-date")} {item.icePhenomenonMeasurementDate}</p>}
 
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-hydro-overgrowth-phenomenon")}</strong> {item.overgrowthPhenomenon ?? 'b.d.'}</p>
            {item.overgrowthPhenomenonMeasurementDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>{translateKey.get("map-marker-hydro-measurement-date")} {item.overgrowthPhenomenonMeasurementDate}</p>}
        </div>
    );
 
    return (
        <Marker
            position={position}
            icon={dotIcon}
            eventHandlers={{
                click: (e) => L.DomEvent.stopPropagation(e.originalEvent),
            }}
        >
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
 
interface HydroPresentationProps {
    stations: HydroStation[];
    getPosition: (lat: number, lon: number) => [number, number];
    translateKey: Map<string, string>;
}
 
/**
 * @brief Warstwa prezentacji stacji HYDRO: renderuje znaczniki dla stacji posiadających współrzędne.
 * @param stations Lista stacji do pokazania.
 * @param getPosition Funkcja przeliczająca współrzędne GPS na pozycję na mapie.
 * @param translateKey Słownik tłumaczeń.
 * @return Zestaw znaczników stacji HYDRO.
 */
export const HydroPresentation: React.FC<HydroPresentationProps> = ({ stations, getPosition, translateKey }) => {
    return (
        <>
            {stations.map((item, index) => {
                if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                const mapPosition = getPosition(item.latitudeGeo, item.longitudeGeo);
                return <HydroMarker key={`hydro-${item.stationCode || index}`} item={item} position={mapPosition} translateKey={translateKey} />;
            })}
        </>
    );
};
 
const CAPITAL_ALIASES: Array<string> = [
    'Głogów',
    'Toruń',
    'Dęblin',
    'Kostrzyn n. Odrą',
    'Sieradz',
    'Kraków – Bielany',
    'Warszawa-Bulwary',
    'Koźle',
    'Rzeszów',
    'Piątnica-Łomża',
    'Tczew',
    'Krzyżanowice',
    'Sandomierz',
    'Samborowo',
    'Poznań Most Rocha',
    'Bielinek',
];
 
/**
 * @brief Normalizacja nazwy stacji do porównań (wielkie litery, bez spacji, kropek i myślników)
 * @param name Nazwa stacji.
 * @return Znormalizowana nazwa składająca się wyłącznie z liter i cyfr.
 */
function normalizeStationName(name: string): string {
    return name.toUpperCase().replace(/[^\p{L}\p{N}]+/gu, '');
}
 
/**
 * @brief Wybiera stacje HYDRO wskazane jako reprezentatywne dla każdego województwa.
 * @param stations Lista wszystkich stacji HYDRO.
 * @return Po jednej stacji dla każdego znalezionego województwa.
 */
export function filterCapitalHydro(stations: HydroStation[]): HydroStation[] {
    const matchedCapitals: HydroStation[] = [];
 
    CAPITAL_ALIASES.forEach((capitalName) => {
        const alias = normalizeStationName(capitalName);
 
        const found =
            stations.find(s => normalizeStationName(s.stationName) === alias) ??
            stations.find(s => {
                const name = normalizeStationName(s.stationName);
                return name.startsWith(alias) || alias.startsWith(name);
            });
 
        if (found) {
            matchedCapitals.push(found);
        }
    });
 
    return matchedCapitals;
}
 