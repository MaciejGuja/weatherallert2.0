import React, { useMemo, useState } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export interface MeteoStation {
    stationCode: string | null;
    stationName: string;
    province: string | null;
    country: string | null;
    latitudeGeo: number | null;
    longitudeGeo: number | null;
    stationEstablishmentYear: string | null;
    heightAboveSeaLevel: string | null;
    groundTemperature: number | null;
    groundTemperatureDate: string | null;
    airTemperature: number | null;
    airTemperatureDate: string | null;
    windDirection: number | null;
    windDirectionDate: string | null;
    windAverageSpeed: number | null;
    windAverageSpeedDate: string | null;
    windMaximumSpeed: number | null;
    windMaximumSpeedDate: string | null;
    relativeHumidity: number | null;
    relativeHumidityDate: string | null;
    windGust10min: number | null;
    windGust10minDate: string | null;
    precipitation10min: string | null;
    precipitation10minDate: string | null;
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
}

function makeMeteoDotIcon(label: string, temp?: number | null): L.DivIcon {
    const tempText = temp !== undefined && temp !== null ? `${temp}°C` : '';

    return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -8],
        html: `
            <div style="position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:#2e7d32;border:1px solid #fff;box-shadow:0 0 2px rgba(0,0,0,0.6);cursor:pointer;"></div>
            <div style="position:absolute;left:0;top:6px;transform:translateX(-50%);white-space:nowrap;text-align:center;cursor:pointer;pointer-events:none;">
                <div style="font-size:11px;line-height:1;font-weight:600;color:#1b5e20;text-shadow:0 0 2px #fff,0 0 2px #fff;">${escapeHtml(label)}</div>
                ${tempText ? `<div style="font-size:11px;line-height:1;font-weight:700;color:#2e7d32;text-shadow:0 0 2px #fff;">${escapeHtml(tempText)}</div>` : ''}
            </div>
        `,
    });
}

export function MeteoMarker({ item, position }: { item: MeteoStation; position: [number, number] }) {
    const [popupOpen, setPopupOpen] = useState(false);

    const name = item.stationName;
    const temp = item.airTemperature;

    const dotIcon = useMemo(() => makeMeteoDotIcon(name, temp), [name, temp]);

    const popupContent = (
        <div style={{ minWidth: '230px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '14px', fontWeight: 700 }}>{name}</h3>
                <span style={{ fontSize: '10px', background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>METEO</span>
            </div>
            {item.stationCode && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Kod stacji: {item.stationCode}</p>}
            {item.province && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Województwo: {item.province}</p>}
            {item.country && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Kraj: {item.country}</p>}
            {item.stationEstablishmentYear && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Rok założenia: {item.stationEstablishmentYear}</p>}
            {item.heightAboveSeaLevel && <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Wysokość npm: {item.heightAboveSeaLevel} m</p>}
            <hr style={{ border: 0, borderTop: '1px solid #e0e0e0', margin: '6px 0' }} />

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Temp. powietrza:</strong> {item.airTemperature ?? 'b.d.'} °C</p>
            {item.airTemperatureDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.airTemperatureDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Temp. gruntu:</strong> {item.groundTemperature ?? 'b.d.'} °C</p>
            {item.groundTemperatureDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.groundTemperatureDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Śr. prędkość wiatru:</strong> {item.windAverageSpeed ?? 'b.d.'} m/s</p>
            {item.windAverageSpeedDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.windAverageSpeedDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Maks. prędkość wiatru:</strong> {item.windMaximumSpeed ?? 'b.d.'} m/s</p>
            {item.windMaximumSpeedDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.windMaximumSpeedDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Kierunek wiatru:</strong> {item.windDirection != null ? `${item.windDirection}°` : 'b.d.'}</p>
            {item.windDirectionDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.windDirectionDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Porywy wiatru (10min):</strong> {item.windGust10min ?? 'b.d.'} m/s</p>
            {item.windGust10minDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.windGust10minDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Opad (10 min):</strong> {item.precipitation10min ?? 'b.d.'} mm</p>
            {item.precipitation10minDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.precipitation10minDate}</p>}

            <p style={{ margin: '3px 0', fontSize: '12px' }}><strong>Wilgotność względna:</strong> {item.relativeHumidity ?? 'b.d.'} %</p>
            {item.relativeHumidityDate && <p style={{ margin: '1px 0 3px 0', fontSize: '10px', color: '#888' }}>Pomiar: {item.relativeHumidityDate}</p>}
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

interface MeteoPresentationProps {
    stations: MeteoStation[];
    getPosition: (lat: number, lon: number) => [number, number];
}

export const MeteoPresentation: React.FC<MeteoPresentationProps> = ({ stations, getPosition }) => {
    return (
        <>
            {stations.map((item, index) => {
                if (item.latitudeGeo == null || item.longitudeGeo == null) return null;
                const mapPosition = getPosition(item.latitudeGeo, item.longitudeGeo);
                return <MeteoMarker key={`meteo-${item.stationCode || index}`} item={item} position={mapPosition} />;
            })}
        </>
    );
};