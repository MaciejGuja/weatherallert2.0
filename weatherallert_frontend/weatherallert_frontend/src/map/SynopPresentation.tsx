import React, { useMemo, useState } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export interface SynopStation {
    stationId: string | null;
    station: string;
    province: string | null;
    country: string | null;
    measurementData: string | null;
    measurementHour: string | null;
    temprature: string | null;
    windSpeed: string | null;
    windDirection: string | null;
    relativeHumidity: string | null;
    totalPrecipitation: string | null;
    airPressure: string | null;
    latitudeGeo: number | null;
    longitudeGeo: number | null;
}

const CAPITAL_ALIASES: Array<string> = [
    'BIAŁYSTOK',
    'KATOWICE',
    'GDAŃSK',
    'GORZÓW WIELKOPOLSKI',
    'GORZÓW WLKP',
    'GORZÓW',
    'ZIELONA GÓRA',
    'WROCŁAW',
    'POZNAŃ',
    'KRAKÓW',
    'SZCZECIN',
    'OLSZTYN',
    'KIELCE',
    'WARSZAWA',
    'RZESZÓW',
    'LUBLIN',
    'ŁÓDŹ',
    'OPOLE',
    'TORUŃ',
];

/**
 * @brief Wybieranie stacji SYNOP położonych w miastach wojewódzkich.
 * @param stations Lista wszystkich stacji SYNOP.
 * @return Stacje miast wojewódzkich.
 */
export function filterCapitalStations(stations: SynopStation[]): SynopStation[] {
    const matchedCapitals: SynopStation[] = [];

    CAPITAL_ALIASES.forEach((capitalName) => {
        const found = stations.find(s => s.station.trim().toUpperCase().includes(capitalName));
        if (found){
            matchedCapitals.push(found);
        }
    });

    return matchedCapitals;
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
 * @brief Tworzenie ikony znacznika stacji SYNOP.
 * @param label Nazwa stacji.
 * @param temp Temperatura powietrza wyświetlana pod nazwą.
 * @return Ikona Leaflet typu DivIcon.
 */
function makeSynopDotIcon(label: string, temp?: string | null): L.DivIcon {
    const tempText = temp !== undefined && temp !== null && temp !== '' ? `${temp}°C` : '';

    return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -8],
        html: `
            <div style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#1a237e;border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.5);cursor:pointer;"></div>
            <div style="position:absolute;left:0;top:8px;transform:translateX(-50%);white-space:nowrap;text-align:center;cursor:pointer;pointer-events:none;">
                <div style="font-size:14px;line-height:1.1;font-weight:600;color:#000;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${escapeHtml(label)}</div>
                ${tempText ? `<div style="font-size:14px;line-height:1.1;font-weight:700;color:#1a237e;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${escapeHtml(tempText)}</div>` : ''}
            </div>
        `,
    });
}

/**
 * @brief Znacznik stacji SYNOP na mapie z tooltipem (po najechaniu) i oknem szczegółów (po kliknięciu).
 * @param item Dane stacji SYNOP.
 * @param position Pozycja znacznika na mapie [y, x].
 * @return Znacznik Leaflet z podpowiedzią i oknem szczegółów.
 */
export function SynopMarker({ item, position, translateKey}: { item: SynopStation; position: [number, number];translateKey: Map<string,string> }) {
    const [popupOpen, setPopupOpen] = useState(false);

    const name = item.station;
    const temp = item.temprature;
    const pressure = item.airPressure;
    const humidity = item.relativeHumidity;
    const wind = item.windSpeed;
    const windDirection = item.windDirection;
    const precipitation = item.totalPrecipitation;

    const dotIcon = useMemo(() => makeSynopDotIcon(name, temp), [name, temp, translateKey]);

    const popupContent = (
        <div style={{ minWidth: '200px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, color: '#1a237e', fontSize: '15px', fontWeight: 700 }}>{name}</h3>
                <span style={{ fontSize: '10px', background: '#e8eaf6', color: '#1a237e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>SYNOP</span>
            </div>
            {item.stationId && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-synop-station-id")} {item.stationId}</p>}
            {item.province && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-synop-province")} {item.province}</p>}
            {item.country && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-synop-country")} {item.country}</p>}
            {item.measurementData && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-synop-measurement-date")} {item.measurementData}</p>}
            {item.measurementHour && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>{translateKey.get("map-marker-synop-measurement-hour")} {item.measurementHour}</p>}
            <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '6px 0' }} />
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-temperature")}</strong> {temp ?? 'b.d.'} °C</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-pressure")}</strong> {pressure ?? 'b.d.'} hPa</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-humidity")}</strong> {humidity ?? 'b.d.'} %</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-wind")}</strong> {wind ?? 'b.d.'} m/s</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-wind-direction")}</strong> {windDirection ?? 'b.d.'}</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>{translateKey.get("map-marker-synop-precipitation")}</strong> {precipitation ?? 'b.d.'} mm</p>
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

interface SynopPresentationProps {
    stations: SynopStation[];
    getPosition: (lat: number, lon: number) => [number, number];
    translateKey: Map<string, string>;
}

/**
 * @brief Warstwa prezentacji stacji SYNOP: renderuje znaczniki dla stacji posiadających współrzędne.
 * @param stations Lista stacji do pokazania.
 * @param getPosition Funkcja przeliczająca współrzędne GPS na pozycję na mapie.
 * @return Zestaw znaczników stacji SYNOP.
 */
export const SynopPresentation: React.FC<SynopPresentationProps> = ({ stations, getPosition, translateKey }) => {
    return (
        <>
            {stations.map((item, index) => {
                if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                const mapPosition = getPosition(item.latitudeGeo, item.longitudeGeo);
                return <SynopMarker key={`synop-${item.stationId || index}`} item={item} position={mapPosition} translateKey={translateKey}/>;
            })}
        </>
    );
};