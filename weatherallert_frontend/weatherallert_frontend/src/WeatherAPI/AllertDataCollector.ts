export interface MeteoAllertDataProps {
    eventId: string;
    eventName: string;
    level: string;
    probability: string;
    validTo: string;
    validFrom: string;
    publishedAt: string;
    content: string;
    comment: string;
    teryt: string[];
    country: string[];
    province: string[];
}
const METEO_CACHE_TTL_MS= 5*60*1000;
let MeteoTimeCache=0;
let MeteoCacheTable: MeteoAllertDataProps[] = [];

function isCacheFresh(savedAt: number): boolean{
    return Date.now()-savedAt<METEO_CACHE_TTL_MS;
}
export async function MeteoAllertDataCollector(): Promise<MeteoAllertDataProps[]> {
    if(isCacheFresh(MeteoTimeCache)){
        return MeteoCacheTable;
    }
    const res = await fetch(`http://localhost:8080/api/warning/meteo/grouped`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
        const data: MeteoAllertDataProps[] = Object.values(raw as Record<string, any[]>)
            .flat()
            .map((d: any) => ({
                eventId: d.eventId,
                eventName: d.eventName,
                level: d.level,
                probability: d.probability,
                validTo: d.validTo,
                validFrom: d.validFrom,
                publishedAt: d.publishedAt,
                content: d.content,
                comment: d.comment,
                teryt: d.teryt,
                country: d.country,
                province: d.province
            }));
        MeteoTimeCache=Date.now();
        MeteoCacheTable.length = 0;  
        for (let i = 0; i < data.length; i++) {
            MeteoCacheTable.push(data[i]);
        }
        return data;
}


export interface HydroAllertDataProps {
    eventId: string;
    eventName: string;
    level: string;
    probability: string;
    validTo: string;
    validFrom: string;
    publishedAt: string;
    content: string;
    comment: string;
}
let HydroTimeCache=0;
let HydroCacheTable: HydroAllertDataProps[] = [];

export async function HydroAllertDataCollector(): Promise<HydroAllertDataProps[]> {
    if(isCacheFresh(HydroTimeCache)){
        return HydroCacheTable;
    }
    const res = await fetch(`http://localhost:8080/api/warning/hydro/grouped`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
        const dataHydro: HydroAllertDataProps[] = Object.values(raw as Record<string, any[]>)
            .flat()
            .map((d: any) => ({
                eventId: d.eventId,
                eventName: d.eventName,
                level: d.level,
                probability: d.probability,
                validTo: d.validTo,
                validFrom: d.validFrom,
                publishedAt: d.publishedAt,
                content: d.content,
                comment: d.comment
            }));
        HydroTimeCache=Date.now();
        HydroCacheTable.length = 0;  
        for (let j = 0; j < dataHydro.length; j++) {
            HydroCacheTable.push(dataHydro[j]);
        }
        return dataHydro;
}