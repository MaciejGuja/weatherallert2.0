import {useEffect,useMemo,useState,type RefObject} from 'react';
import L from 'leaflet';
import type {DataType,StationData} from './types';
import { filterCapitalMeteo, type MeteoStation } from './MeteoPresentation';
import { filterCapitalStations, type SynopStation } from './SynopPresentation';
import {imageBounds, MAP_HEIGHT, MAP_WIDTH, POWIAT_MAPS, WOJ_TERYT} from './constans';
import {POWIAT_DETAIL_MAPS} from '../Powiatdetailmaps';
import {
    capitalizeWoj,
    flattenBackendResponse,
    normalizeMeteoData,
    normalizeSynopData,
    pickOnePerPowiat,
    powiatLabel,
    stationKey,
    stationsInGeometry,
    stationsInProvince,
} from './utils';

/**
 * @brief Pobiera z backendu stacje SYNOP lub METEO zależnie od wybranego rodzaju danych.
 *        Przy każdej zmianie rodzaju danych ponawia pobieranie i ustawia flagę ładowania.
 * @param dataType Wybrany rodzaj danych.
 * @return Listy stacji SYNOP i METEO oraz flaga ładowania.
 */
export function useStations(dataType: DataType) {
    const [synopStations, setSynopStations] = useState<SynopStation[]>([]);
    const [meteoStations, setMeteoStations] = useState<MeteoStation[]>([]);
    const [hydroStations, setHydroStations] = useState<StationData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/api/${dataType}/grouped`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            const rawList = flattenBackendResponse(data);
                if (dataType === 'synop') {
                    setSynopStations(rawList.map(normalizeSynopData));
                } else if (dataType === 'meteo') {
                    setMeteoStations(rawList.map(normalizeMeteoData));
                } else if (dataType === 'hydro') {
                    // setHydroStations(rawList.map(normalizeHydroData));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(`Błąd pobierania (${dataType}):`, err);
                if (dataType === 'synop') setSynopStations([]);
                else 
                if (dataType === 'meteo') setMeteoStations([]);
                else if (dataType === 'hydro') setHydroStations([]);
                setLoading(false);
            });
    }, [dataType]);
    return { synopStations, meteoStations, hydroStations, loading };
}
/**
 * @brief Wczytuje pliki GeoJSON z granicami województw i powiatów.
 * @return Granice województw (geoData) oraz powiatów (powiatGeoData).
 */
export function useGeoData() {
    const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    const [powiatGeoData, setPowiatGeoData] = useState<GeoJSON.FeatureCollection | null>(null);
    useEffect(() => {
        fetch('./wojewodztwa.geojson')
        .then(res=>res.json())
        .then((data: GeoJSON.FeatureCollection) => setGeoData(data))
        .catch(err => console.error('Błąd pobierania granic województw:', err));
    }, []);
    useEffect(() => {
        fetch('./powiaty_teryt.geojson')
        .then(res=>res.json())
        .then((data: GeoJSON.FeatureCollection) => setPowiatGeoData(data))
        .catch(err => console.error('Błąd pobierania granic powiatów:', err));
    }, []);
    return { geoData, powiatGeoData };
}
/**
 * @brief Wylicza stacje pokazywane na mapie..
 * @param dataType Rodzaj danych.
 * @param synopStations Wszystkie stacje SYNOP.
 * @param meteoStations Wszystkie stacje METEO.
 * @param geoData Granice województw (GeoJSON).
 * @return Stacje wyświetlane (SYNOP, METEO), aktywne, wszystkie oraz liczba stacji.
 */
export function useDisplayedStations(dataType: DataType, synopStations: SynopStation[], meteoStations: MeteoStation[]) {
    const displayedSynopStations = useMemo(() =>  filterCapitalStations(synopStations), [synopStations]);
    const displayedMeteoStations = useMemo(() => filterCapitalMeteo(meteoStations), [meteoStations]);
    const allStations: StationData[] = dataType === 'synop' ? synopStations : meteoStations;
    const activeStations : StationData[] = dataType === 'synop' ? displayedSynopStations : displayedMeteoStations;
    const stationCount = dataType === 'synop' ? synopStations.length : meteoStations.length;
    return { displayedSynopStations, displayedMeteoStations, activeStations, allStations, stationCount };
}
interface UseProvinceModalParams {
    dataType: DataType;
    geoData: GeoJSON.FeatureCollection | null;
    powiatGeoData: GeoJSON.FeatureCollection | null;    
    allStations: StationData[];
    activeStations: StationData[];
}
/**
 * @brief Zarządza stanem okna modalnego (województwo / powiat) oraz wylicza dane do jego wyświetlenia:
 *        mapy, geometrie, stacje i tytuł.
 * @param params Rodzaj danych, granice województw i powiatów oraz listy stacji.
 * @return Stan modala, akcje otwarcia/zamknięcia i dane pochodne dla widoków województwa i powiatu.
 */
export function useProvinceModal({ dataType, geoData, powiatGeoData, allStations, activeStations }: UseProvinceModalParams) {
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedPowiat, setSelectedPowiat] = useState<string | null>(null);
    const handleSelectProvince = (provinceName: string) => {
        setSelectedProvince(provinceName);
        setSelectedPowiat(null);
        setIsModalOpen(true);
    };
    const provinceInfo = selectedProvince ? POWIAT_MAPS[selectedProvince.toLowerCase()] : undefined;
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPowiat(null);
    };
    const provinceStations = useMemo(
        () => (selectedProvince ? stationsInProvince(allStations, geoData, selectedProvince) : []),
        [allStations, geoData, selectedProvince]
    );
    const findProvinceGeometry = (provinceGeo: string | null,
    data: GeoJSON.FeatureCollection | null) => {
        if (!provinceGeo) return undefined;
        if (!data) return undefined;

        const target = provinceGeo.toLowerCase();
        const foundFeature = data.features.find(f => f.properties?.nazwa?.toLowerCase() === target);

    return foundFeature?.geometry;
};
const provinceGeometry = findProvinceGeometry(selectedProvince, geoData);
const provinceCode = selectedProvince ? WOJ_TERYT[selectedProvince.toLowerCase()] : undefined;
const provincePowiatFeatures = useMemo(()=>{
    if(!provinceCode || !powiatGeoData?.features) return [];
    return powiatGeoData?.features.filter(f=>String(f.properties?.code ?? "").startsWith(provinceCode));
}
, [provinceCode, powiatGeoData]);
const preferKeys = useMemo(() => new Set(activeStations.map(stationKey)), [activeStations]);
const provinceStationsShown = useMemo(
        () => pickOnePerPowiat(provinceStations, provincePowiatFeatures, preferKeys),
        [provinceStations, provincePowiatFeatures, preferKeys]
    );
const powiatInfo = selectedPowiat ? POWIAT_DETAIL_MAPS[selectedPowiat] : undefined;
const findPowiatGeometry = (powiatCode: string | null, data: GeoJSON.FeatureCollection | null) => {
    if (!powiatCode) return undefined;
    if (!data?.features) return undefined;

    const foundFeature = data.features.find(f => {
        const code = f.properties?.code;
        return code != null && String(code) === String(powiatCode);
    });

    return foundFeature?.geometry;
};
const powiatGeometry = findPowiatGeometry(selectedPowiat, powiatGeoData);
const powiatStations = stationsInGeometry(allStations, powiatGeometry);
const modalTitle = (() => {
    if (!selectedProvince) {
        return '';
    }

    if (selectedPowiat && powiatInfo) {
        return `${powiatLabel(powiatInfo)} (woj. ${capitalizeWoj(selectedProvince)}) – ${powiatStations.length} stacji ${dataType.toUpperCase()}`;
    }

    return `Województwo ${capitalizeWoj(selectedProvince)}`;
})();
return {
        selectedProvince,
        selectedPowiat,
        setSelectedPowiat,
        isModalOpen,
        handleSelectProvince,
        closeModal,
        provinceInfo,
        provinceGeometry,
        provincePowiatFeatures,
        provinceStationsShown,
        powiatInfo,
        powiatGeometry,
        powiatStations,
        modalTitle,
    };
}
/**
 * @brief Dopasowuje widok mapy głównej do granic obrazka po zmianie stanu ładowania.
 * @param mapRef Referencja do instancji mapy Leaflet.
 * @param loading Flaga ładowania danych (zmiana wyzwala dopasowanie).
 */
export function useMapFit(mapRef: RefObject<L.Map | null>, loading: boolean) {
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
}

