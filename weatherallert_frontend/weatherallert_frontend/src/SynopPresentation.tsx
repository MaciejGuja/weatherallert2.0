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

const CAPITAL_ALIASES: Record<string, string[]> = {
    'Białystok': ['BIAŁYSTOK'],
    'Katowice': ['KATOWICE'],
    'Gdańsk': ['GDAŃSK'],
    'Gorzów': ['GORZÓW WIELKOPOLSKI', 'GORZÓW WLKP', 'GORZÓW'],
    'Zielona Góra': ['ZIELONA GÓRA'],
    'Wrocław': ['WROCŁAW'],
    'Poznań': ['POZNAŃ'],
    'Kraków': ['KRAKÓW'],
    'Szczecin': ['SZCZECIN'],
    'Olsztyn': ['OLSZTYN'],
    'Kielce': ['KIELCE'],
    'Warszawa': ['WARSZAWA'],
    'Rzeszów': ['RZESZÓW'],
    'Lublin': ['LUBLIN'],
    'Łódź': ['ŁÓDŹ'],
    'Opole': ['OPOLE'],
    'Toruń': ['TORUŃ'],
};

export function filterCapitalStations(stations: SynopStation[]): SynopStation[] {
    const matchedCapitals: SynopStation[] = [];

    Object.entries(CAPITAL_ALIASES).forEach(([capitalCanonicalName, aliases]) => {
        const found = stations.find(s => {
            const nameUpper = s.station.trim().toUpperCase();
            return aliases.some(alias => nameUpper === alias);
        }) || stations.find(s => {
            const nameUpper = s.station.trim().toUpperCase();
            return aliases.some(alias => nameUpper.includes(alias));
        });

        if (found) {
            matchedCapitals.push({
                ...found,
                station: capitalCanonicalName
            });
        }
    });

    return matchedCapitals;
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
}

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

export function SynopMarker({ item, position }: { item: SynopStation; position: [number, number] }) {
    const [popupOpen, setPopupOpen] = useState(false);

    const name = item.station;
    const temp = item.temprature;
    const pressure = item.airPressure;
    const humidity = item.relativeHumidity;
    const wind = item.windSpeed;
    const windDirection = item.windDirection;
    const precipitation = item.totalPrecipitation;

    const dotIcon = useMemo(() => makeSynopDotIcon(name, temp), [name, temp]);

    const popupContent = (
        <div style={{ minWidth: '200px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, color: '#1a237e', fontSize: '15px', fontWeight: 700 }}>{name}</h3>
                <span style={{ fontSize: '10px', background: '#e8eaf6', color: '#1a237e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>SYNOP</span>
            </div>
            {item.stationId && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>ID stacji: {item.stationId}</p>}
            {item.province && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Województwo: {item.province}</p>}
            {item.country && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Kraj: {item.country}</p>}
            {item.measurementData && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Data pomiaru: {item.measurementData}</p>}
            {item.measurementHour && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Godzina: {item.measurementHour}</p>}
            <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '6px 0' }} />
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Temperatura:</strong> {temp ?? 'b.d.'} °C</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Ciśnienie:</strong> {pressure ?? 'b.d.'} hPa</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Wilgotność:</strong> {humidity ?? 'b.d.'} %</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Wiatr:</strong> {wind ?? 'b.d.'} m/s</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Kierunek wiatru:</strong> {windDirection ?? 'b.d.'}</p>
            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Opad całkowity:</strong> {precipitation ?? 'b.d.'} mm</p>
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
}

export const SynopPresentation: React.FC<SynopPresentationProps> = ({ stations, getPosition }) => {
    return (
        <>
            {stations.map((item, index) => {
                if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                const mapPosition = getPosition(item.latitudeGeo, item.longitudeGeo);
                return <SynopMarker key={`synop-${item.stationId || index}`} item={item} position={mapPosition} />;
            })}
        </>
    );
};