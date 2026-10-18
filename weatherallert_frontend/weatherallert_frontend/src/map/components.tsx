import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { MapContainer, ImageOverlay, GeoJSON, useMapEvents } from 'react-leaflet';
import L, { type LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SynopMarker, SynopPresentation, type SynopStation } from './SynopPresentation';
import { MeteoMarker, MeteoPresentation, type MeteoStation } from './MeteoPresentation';
import { POWIAT_DETAIL_MAPS, type PowiatDetailMapInfo } from '../Powiatdetailmaps';
import type { DataType, GeoRect, StationData } from './types';
import {
    DEFAULT_STYLE,
    HOVER_STYLE,
    imageBounds,
    MAP_FIT_PADDING,
    MAP_FRAME_HEIGHT,
    MAP_FRAME_WIDTH,
    MAP_HEIGHT,
    MAP_WIDTH,
    MODAL_FIT_PADDING,
    MODAL_MAP_HEIGHT,
    MODAL_MAP_WIDTH,
    SIDE_MENU_WIDTH,
    TOP_MENU_HEIGHT,
} from './constans';
import { capitalizeWoj, coordsToLatLng, parseGpsToMapCoords, pointInGeometry, powiatLabel } from './utils';
import { useMapFit } from './hooks';

/**
 * @brief Górne menu wyboru rodzaju danych (Synoptyczne / Meteorologiczne / Hydrologiczne).
 * @param dataType Aktualnie wybrany rodzaj danych.
 * @param synopCount Liczba stacji synoptycznych.
 * @param meteoCount Liczba stacji meteorologicznych.
 * @param onChange Wywoływane po wyborze rodzaju danych.
 * @return Pasek menu z przyciskami.
 */
export function DataTypeMenu({ dataType, synopCount, meteoCount, onChange }: {
    dataType: DataType;
    synopCount: number;
    meteoCount: number;
    onChange: (type: DataType) => void;
}) {
    return (
        <div style={{
            position: 'absolute',
            top: TOP_MENU_HEIGHT,                 
            bottom: 0,
            right: 0,                
            width: SIDE_MENU_WIDTH,              
            display: 'flex',
            flexDirection: 'column', 
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            gap: '8px',
            padding: '16px 12px',
            zIndex: 1000,
            background: '#f8f9fa',
            borderLeft: '1px solid #e0e0e0',   
            boxShadow: '-2px 0 4px rgba(0,0,0,0.05)',
            boxSizing: 'border-box',
        }}>
            <span style={{
                fontWeight: 600,
                fontSize: '12px',
                color: '#333',
                marginBottom: 4,
                textAlign: 'center',
            }}>
                Rodzaj danych:
            </span>

            <button
                onClick={() => onChange('synop')}
                style={{
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: dataType === 'synop' ? 'bold' : 'normal',
                    background: dataType === 'synop' ? '#1a237e' : '#e0e0e0',
                    color: dataType === 'synop' ? '#ffffff' : '#424242',
                    transition: 'all 0.2s ease',
                    boxShadow: dataType === 'synop' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                }}
            >
                Synoptyczne ({synopCount})
            </button>

            <button
                onClick={() => onChange('meteo')}
                style={{
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: dataType === 'meteo' ? 'bold' : 'normal',
                    background: dataType === 'meteo' ? '#2e7d32' : '#e0e0e0',
                    color: dataType === 'meteo' ? '#ffffff' : '#424242',
                    transition: 'all 0.2s ease',
                    boxShadow: dataType === 'meteo' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                }}
            >
                Meteorologiczne ({meteoCount})
            </button>

            <button
                onClick={() => onChange('hydro')}
                style={{
                    border: 'none',
                    padding: '10px 12px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: dataType === 'hydro' ? 'bold' : 'normal',
                    background: dataType === 'hydro' ? '#777e1a' : '#e0e0e0',
                    color: dataType === 'hydro' ? '#ffffff' : '#424242',
                    transition: 'all 0.2s ease',
                    boxShadow: dataType === 'hydro' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                }}
            >
                Hydrologiczne ({synopCount})
            </button>
        </div>
    );
}

/**
 * @brief Warstwa województw na mapie głównej
 * @param geoData Granice województw (GeoJSON).
 * @param onSelect Wywoływane z nazwą województwa po kliknięciu.
 * @return Warstwa GeoJSON
 */
export function VoivodeshipsLayer({ geoData, onSelect }: { geoData: GeoJSON.FeatureCollection | null; onSelect: (rawName: string) => void }) {
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

/**
 * @brief Warstwa powiatów wybranego województwa.
 * @param features Obiekty GeoJSON powiatów.
 * @param info Kadr geograficzny obrazka województwa.
 * @param onSelect Wywoływane z kodem powiatu po kliknięciu.
 * @return Warstwa GeoJSON.
 */
export function PowiatsLayer({ features, info, onSelect }: { features: GeoJSON.Feature[]; info: GeoRect; onSelect: (code: string) => void }) {
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

/**
 * @brief Zamykanie widoku, gdy kliknięcie wypadnie poza kształtem (geometrią) na mapie modala.
 * @param geo Kadr geograficzny obrazka.
 * @param aspect Proporcja szerokości do wysokości obrazka.
 * @param geometry Geometria, której wnętrze nie zamyka widoku.
 * @param onClose Wywoływane po kliknięciu poza geometrią.
 * @return null (komponent nie renderuje elementów).
 */
export function OutsideShapeCloser({ geo, aspect, geometry, onClose }: { geo: GeoRect; aspect: number; geometry?: GeoJSON.Geometry; onClose: () => void }) {
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

/**
 * @brief Widok województwa (obrazek powiatów) albo widok powiatu (obrazek gmin).
 * @param imageUrl Adres obrazka podkładu.
 * @param geo Kadr geograficzny obrazka.
 * @param aspect Proporcja szerokości do wysokości obrazka.
 * @param stations Stacje do pokazania na mapie.
 * @param dataType Rodzaj danych (wybór typu znacznika).
 * @param geometry Geometria używana do wykrywania kliknięcia poza kształtem.
 * @param onClose Wywoływane po kliknięciu poza kształtem.
 * @param overlay Dodatkowa warstwa rysowana nad obrazkiem.
 * @return Mapa Leaflet w kontenerze blokującym propagację zdarzeń myszy.
 */
export function ModalMap({ imageUrl, geo, aspect = 1, stations, dataType, geometry, onClose, overlay }: {
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
                boundsOptions={{ padding: MODAL_FIT_PADDING}}
                zoomSnap={0}
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
                    height: MODAL_MAP_HEIGHT,
                    width: MODAL_MAP_WIDTH,
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

interface MainMapProps {
    dataType: DataType;
    loading: boolean;
    isModalOpen: boolean;
    geoData: GeoJSON.FeatureCollection | null;
    displayedSynop: SynopStation[];
    displayedMeteo: MeteoStation[];
    onSelectProvince: (rawName: string) => void;
}

/**
 * @brief Główna mapa Polski z warstwą województw oraz stacjami SYNOP lub METEO.
 * @param props Rodzaj danych, flagi stanu, granice województw, stacje do pokazania i obsługa wyboru województwa.
 * @return Kontener z mapą głównego ekranu.
 */
export function MainMap({ dataType, loading, isModalOpen, geoData, displayedSynop, displayedMeteo, onSelectProvince }: MainMapProps) {
    const mapRef = useRef<L.Map | null>(null);

    useMapFit(mapRef, loading);

    return (
    <div
        style={{
            position: 'absolute',
            top: TOP_MENU_HEIGHT,
            left: 0,
            right: SIDE_MENU_WIDTH,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <div
            style={{
                position: 'relative',
                width: MAP_FRAME_WIDTH,
                height: MAP_FRAME_HEIGHT,
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
                boundsOptions={{ padding: MAP_FIT_PADDING }}
                zoomSnap={0}
                minZoom={-3}
                maxZoom={5}
                maxBounds={imageBounds}
                maxBoundsViscosity={1.0}
                doubleClickZoom={false}
                dragging={false}
                keyboard={false}
                style={{ height: '100%', width: '100%', background: '#ffffff' }}
            >
                <ImageOverlay url="/polska_mapa_szara.png" bounds={imageBounds} />

                <VoivodeshipsLayer geoData={geoData} onSelect={onSelectProvince} />

                {dataType === 'synop' ? (
                    <SynopPresentation stations={displayedSynop} getPosition={parseGpsToMapCoords} />
                ) : (
                    <MeteoPresentation stations={displayedMeteo} getPosition={parseGpsToMapCoords} />
                )}
            </MapContainer>

            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1100,
                    padding: '6px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.92)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: dataType === 'synop' ? '#1a237e' : '#2e7d32',
                }}>
                    Ładowanie stacji ({dataType === 'synop' ? 'Synop' : 'Meteo'})...
                </div>
            )}
        </div>
    </div>
);
}

interface ProvinceModalProps {
    dataType: DataType;
    selectedProvince: string;
    selectedPowiat: string | null;
    modalTitle: string;
    provinceInfo?: GeoRect & { file: string };
    provinceGeometry?: GeoJSON.Geometry;
    provincePowiatFeatures: GeoJSON.Feature[];
    provinceStationsShown: StationData[];
    powiatInfo?: PowiatDetailMapInfo;
    powiatGeometry?: GeoJSON.Geometry;
    powiatStations: StationData[];
    onSelectPowiat: (code: string | null) => void;
    onClose: () => void;
}

/**
 * @brief Okno modalne ze szczegółową mapą: widok województwa (powiaty) albo widok powiatu (gminy).
 * @param props Dane wyświetlanego województwa i powiatu oraz obsługa wyboru powiatu i zamknięcia.
 * @return Nakładka modalna z tytułem, przyciskiem zamknięcia i mapą.
 */
export function ProvinceModal({
    dataType,
    selectedProvince,
    selectedPowiat,
    modalTitle,
    provinceInfo,
    provinceGeometry,
    provincePowiatFeatures,
    provinceStationsShown,
    powiatInfo,
    powiatGeometry,
    powiatStations,
    onSelectPowiat,
    onClose,
}: ProvinceModalProps) {
    return (
        <div
            onClick={onClose}
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
                        onClose();
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
                <ModalMap
                    key={`powiat-${selectedPowiat}`}
                    imageUrl={`/powiat_detail/${powiatInfo.file}`}
                    geo={powiatInfo}
                    aspect={powiatInfo.aspect}
                    stations={powiatStations}
                    dataType={dataType}
                    geometry={powiatGeometry}
                    onClose={() => onSelectPowiat(null)}
                />
            ) : provinceInfo ? (
                <ModalMap
                    key={`woj-${selectedProvince}`}
                    imageUrl={`/powiaty/${provinceInfo.file}`}
                    geo={provinceInfo}
                    stations={provinceStationsShown}
                    dataType={dataType}
                    geometry={provinceGeometry}
                    onClose={onClose}
                    overlay={<PowiatsLayer features={provincePowiatFeatures} info={provinceInfo} onSelect={onSelectPowiat} />}
                />
            ) : (
                <p style={{ color: '#1a237e' }}>Brak mapy powiatów dla tego województwa.</p>
            )}
        </div>
    );
}
