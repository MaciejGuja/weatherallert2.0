import Draggable from 'react-draggable';
import { useEffect, useRef, useState } from 'react';
import {
    SIDE_MENU_WIDTH,
    MAP_FIT_PADDING,
    MAP_HEIGHT,
    MAP_WIDTH,
    imageBounds
} from '../map/constans';
import { DataCollector } from '../WeatherForecast/DataCollector';
import { VoidewodztwoDetailMapInfo } from '../Powiatdetailmaps';
import { MapContainer } from 'react-leaflet/MapContainer';
import { Marker } from 'react-leaflet';
import * as L from 'leaflet';
import { ImageOverlay } from 'react-leaflet/ImageOverlay';
import { useMapFit } from '../map/hooks';

const TOTAL_DAYS = 14;

const MIN_LAT = 49.0;
const MAX_LAT = 54.84;
const MIN_LON = 14.12;
const MAX_LON = 24.15;

const MAP_SCALE = 1;
const MAP_ORIGIN = '50% 40%';

export function WeatherForecastView() {
    const [query, setQuery] = useState('');
    const [activeDayIndex, setActiveDayIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const days = Array.from({ length: TOTAL_DAYS }, (_, index) => index);

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                gap: '0px',
                padding: '0px',
                boxSizing: 'border-box',
                background: '#ffffff',
            }}
        >
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    background: '#ffffff',
                    borderRight: '1px solid #e0e0e0',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px',
                }}
            >
                <Draggable cancel="input,textarea,button,select">
                    <div
                        style={{
                            width: '100%',
                            maxWidth: SIDE_MENU_WIDTH * 1.5,
                            background: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            borderRadius: 10,
                            padding: '14px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                            boxSizing: 'border-box',
                            cursor: 'move',
                        }}
                    >
                        <input
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '12px 14px',
                                borderRadius: 8,
                                border: '1px solid #c0c0c0',
                                backgroundColor: '#ffffff',
                                color: '#222',
                            }}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Szukaj Miasta..."
                            aria-label="Szukaj Miasta"
                        />
                    </div>
                </Draggable>
            </div>

            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: '85%',
                        height: 'calc(100% - 70px)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: `${TOTAL_DAYS * 100}%`,
                            height: '100%',
                            transform: `translateX(-${(activeDayIndex * 100) / TOTAL_DAYS}%)`,
                            transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    >
                        {days.map((index) => (
                            <div
                                key={index}
                                style={{
                                    width: `${100 / TOTAL_DAYS}%`,
                                    height: '100%',
                                    flexShrink: 0,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <ForecastMap dayIndex={index} />
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    style={{
                        width: '85%',
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        background: '#0077b6',
                        borderRadius: 8,
                        padding: '4px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    }}
                >
                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '8px 12px',
                        }}
                    >
                        &lt;
                    </button>

                    <div
                        ref={scrollContainerRef}
                        style={{
                            display: 'flex',
                            overflowX: 'auto',
                            scrollBehavior: 'smooth',
                            gap: '4px',
                            flex: 1,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {days.map((index) => (
                            <button
                                key={index}
                                onClick={() => setActiveDayIndex(index)}
                                style={{
                                    flex: '0 0 auto',
                                    background: activeDayIndex === index ? '#03045e' : 'transparent',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '8px 14px',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'background 0.2s',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                }}
                            >
                                <span>Dzień {index + 1}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => scrollContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '8px 12px',
                        }}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );
}

export function ForecastMap({ dayIndex }: { dayIndex: number }) {
    const mapRef = useRef<L.Map | null>(null);

    useMapFit(mapRef, false);

    const cities = Object.keys(VoidewodztwoDetailMapInfo);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                background: '#ffffff',
                overflow: 'hidden',
                boxSizing: 'border-box',
                position: 'relative',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${MAP_SCALE})`,
                    transformOrigin: MAP_ORIGIN,
                }}
            >
            <MapContainer
                ref={mapRef}
                crs={L.CRS.Simple}
                center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
                bounds={imageBounds}
                boundsOptions={{ padding: MAP_FIT_PADDING }}
                zoomSnap={0}
                minZoom={-3}
                maxZoom={5}
                maxBounds={imageBounds}
                maxBoundsViscosity={1.0}
                zoomControl={false}
                attributionControl={false}
                doubleClickZoom={false}
                dragging={false}
                keyboard={false}
                style={{ height: '100%', width: '100%', background: '#ffffff' }}
            >
                <ImageOverlay url="/polska_mapa_szara.png" bounds={imageBounds} />
                {cities.map((city) => (
                    <ForecastMarker key={city} city={city} dayIndex={dayIndex} />
                ))}
            </MapContainer>
            </div>
        </div>
    );
}

export function ForecastMarker({ city, dayIndex }: { city: string; dayIndex: number }) {
    const [forecast, setForecast] = useState<{ tempMaxC?: string | null; icon?: string | null }[]>([]);

    useEffect(() => {
        DataCollector(city)
            .then((data) => setForecast(data))
            .catch(() => setForecast([]));
    }, [city]);

    if (forecast.length === 0) return null;

    const coords = VoidewodztwoDetailMapInfo[city];
    const y = ((coords.Lan - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
    const x = ((coords.Lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_WIDTH;

    return <Marker position={[y, x]} icon={makeDotIcon(city, forecast[dayIndex]?.tempMaxC, forecast[dayIndex]?.icon)} />;
}

function makeDotIcon(label: string, temp?: string | null, icon?: string | null): L.DivIcon {
    const tempText = temp !== undefined && temp !== null && temp !== '' ? `${temp}°C` : '';
    const iconUrl = icon ? `/weather_icons/${icon}` : '';

    return L.divIcon({
        className: '',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -8],
        html: `
            <div style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:#1a237e;border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.5);cursor:pointer;"></div>
            <div style="position:absolute;left:0;top:8px;transform:translateX(-50%);white-space:nowrap;text-align:center;cursor:pointer;pointer-events:none;">
                <div style="font-size:10px;line-height:1.1;font-weight:600;color:#000;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${escapeHtml(label)}</div>
                ${tempText || iconUrl ? `<div style="display:flex;align-items:center;justify-content:center;gap:2px;font-size:10px;line-height:1.1;font-weight:700;color:#1a237e;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff;">${iconUrl ? `<img src="${escapeHtml(iconUrl)}" style="width:18px;height:18px;" />` : ''}<span>${escapeHtml(tempText)}</span></div>` : ''}
            </div>
        `,
    });
}

function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ));
}