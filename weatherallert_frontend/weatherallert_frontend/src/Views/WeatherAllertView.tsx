import { SIDE_MENU_WIDTH } from "../map/constans";
import { useState,useEffect } from "react";
import { MeteoAllertDataCollector, type MeteoAllertDataProps, HydroAllertDataCollector, type HydroAllertDataProps } from "../WeatherAPI/AllertDataCollector";
type WeatherForecastViewProps={
    translateKey: Map<string, string>;
}
function backgroudLevel(x: string): string{
    switch(x){
        case '1': return '#ffeb3b';   
        case '2': return '#ff9800';   
        case '3': return '#f44336';   
        default:  return '#f8f9fa';
    }
}
function isNoWarningMeteo(y: MeteoAllertDataProps[]){
    if(y.length===0){
        return true;
    }else{
        return false;
    }
}
function isNoWarningHydro(y: HydroAllertDataProps[]){
    if(y.length===0){
        return true;
    }else{
        return false;
    }
}
function setEventName(x: string,translateKey: Map<string,string>) {
    switch(x) {
        case "Burze": return translateKey.get("warning-storms");
        case "Gęsta mgła": return translateKey.get("warning-dense-fog");
        case "Gwałtowne wzrosty stanów wody": return translateKey.get("warning-rapid-water-rises");
        case "Intensywne opady deszczu": return translateKey.get("warning-heavy-rain");
        case "Intensywne opady śniegu": return translateKey.get("warning-heavy-snow");
        case "Mgła intensywnie osadzająca szadź": return translateKey.get("warning-freezing-fog");
        case "Oblodzenie": return translateKey.get("warning-ice");
        case "Opady marznące": return translateKey.get("warning-freezing-precipitation");
        case "Opady śniegu": return translateKey.get("warning-snowfall");
        case "Przymrozki": return translateKey.get("warning-frost");
        case "Roztopy": return translateKey.get("warning-thaw");
        case "Silny deszcz z burzami": return translateKey.get("warning-heavy-rain-thunderstorms");
        case "Silny mróz": return translateKey.get("warning-severe-frost");
        case "Silny wiatr": return translateKey.get("warning-strong-wind");
        case "Upal": return translateKey.get("warning-heat");
        case "Susza hydrologiczna": return translateKey.get("warning-hydrological-drought");
        case "Wezbranie z przekroczeniem stanów alarmowych": return translateKey.get("warning-flood-alarm");
        case "Wezbranie z przekroczeniem stanów ostrzegawczych": return translateKey.get("warning-flood-warning");
        case "Zawieje zamiecie śnieżne": return translateKey.get("warning-snowstorms");
        default: return translateKey.get("warning-unknown");
    }
}
function isNotWorthy(alert: HydroAllertDataProps): boolean {
    return alert.level === "-1";
}
export function WeatherAllertView({translateKey}:WeatherForecastViewProps){
    const [meteoAlerts, setMeteoAlerts] = useState<MeteoAllertDataProps[]>([]);
    const [hydroAlerts, setHydroAlerts] = useState<HydroAllertDataProps[]>([]);
    const x: MeteoAllertDataProps[] = [];
    useEffect(() => {
    MeteoAllertDataCollector()
        .then(data => {setMeteoAlerts(data); });
}, []);
useEffect(() => {
    HydroAllertDataCollector()
        .then(data => {setHydroAlerts(data); });
}, []);
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center'}}>
                <div style={{ padding: '24px 24px 0' }}>{translateKey.get("warnings-hydrological")}</div>
                {!isNoWarningHydro(hydroAlerts)&&
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box',marginTop: '20px' }}>
                        {hydroAlerts.filter(alert => !isNotWorthy(alert)).map((alert, index) => (
                            <button
                                key={alert.eventId + index}
                                style={{
                                    width: '100%',
                                    maxWidth: SIDE_MENU_WIDTH * 2.75,
                                    background: backgroudLevel(alert.level),
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 10,
                                    padding: '12px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                                    boxSizing: 'border-box',
                                    cursor: 'move',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', color: 'black', width: '100%' }}>
                                    <div style={{ width: '100px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                        {alert.eventName && (
                                            <img
                                                src={`/weather_icons/allert_icons/${alert.eventName}.png`}
                                                alt="Weather Icon"
                                                style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </div>
                                    <div style={{ 
                                        flex: 1, 
                                        fontSize: '16px', 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        padding: '0 40px',
                                        wordBreak: 'break-word'
                                    }}>
                                        {setEventName(alert.eventName,translateKey)}
                                    </div>
                                    <div style={{ 
                                        width: '120px', 
                                        flexShrink: 0, 
                                        fontSize: '32px', 
                                        fontWeight: 'bold', 
                                        textAlign: 'center'
                                    }}>
                                        {alert.probability}%
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
}               
                {isNoWarningHydro(hydroAlerts)&&<div style={{marginTop: '200px'}}>Brak ostrzeżeń</div>}
                <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                    <div
                        style={{
                            alignItems: "center",
                            width: '85%',
                            height: 'calc(100% - 70px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                    </div>
                </div>
            </div>

            <div style={{ width: 1, background: '#e0e0e0' }} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center'}}>
                <div style={{ padding: '24px 24px 0' }}>{translateKey.get("warnings-meteorological")}</div>
                {!isNoWarningMeteo(meteoAlerts)&&
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center', padding: '0 20px', boxSizing: 'border-box',marginTop: '20px' }}>
                        {meteoAlerts.map((alert, index) => (
                            <button
                                key={alert.eventId + index}
                                style={{
                                    width: '100%',
                                    maxWidth: SIDE_MENU_WIDTH * 2.75,
                                    background: backgroudLevel(alert.level),
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 10,
                                    padding: '12px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                                    boxSizing: 'border-box',
                                    cursor: 'move',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', color: 'black', width: '100%' }}>
                                    <div style={{ width: '100px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                                        {alert.eventName && (
                                            <img
                                                src={`/weather_icons/allert_icons/${alert.eventName}.png`}
                                                alt="Weather Icon"
                                                style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </div>
                                    <div style={{ 
                                        flex: 1, 
                                        fontSize: '32px', 
                                        fontWeight: 'bold', 
                                        textAlign: 'center',
                                        padding: '0 40px',
                                        wordBreak: 'break-word'
                                    }}>
                                        {setEventName(alert.eventName,translateKey)}
                                    </div>
                                    <div style={{ 
                                        width: '120px', 
                                        flexShrink: 0, 
                                        fontSize: '32px', 
                                        fontWeight: 'bold', 
                                        textAlign: 'center'
                                    }}>
                                        {alert.probability}%
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
}               
                {isNoWarningMeteo(meteoAlerts)&&<div style={{marginTop: '200px'}}>Brak ostrzeżeń</div>}
                <div style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
                    <div
                        style={{
                            alignItems: "center",
                            width: '85%',
                            height: 'calc(100% - 70px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                    </div>
                </div>
            </div>
        </div>
    );
}