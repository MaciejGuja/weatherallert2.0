import type { SynopStation} from './SynopPresentation';
import type { MeteoStation } from './MeteoPresentation';
export type DataType = 'synop' | 'meteo' | 'hydro';
export type StationData= SynopStation | MeteoStation;
export interface ProvinceMapInfo{
    file: string,
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,     
}
export type GeoRect=Pick<ProvinceMapInfo, 'minLat' | 'maxLat' | 'minLng' | 'maxLng'>;
export type Ring = number[][];
