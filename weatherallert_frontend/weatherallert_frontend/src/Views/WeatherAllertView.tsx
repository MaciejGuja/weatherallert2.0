import { SIDE_MENU_WIDTH } from "../map/constans";
import { useState,useEffect,useRef } from "react";
import { MeteoAllertDataCollector, type MeteoAllertDataProps, HydroAllertDataCollector, type HydroAllertDataProps } from "../WeatherAPI/AllertDataCollector";
import Draggable from "react-draggable";
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
    const [frameMeteoView,setFrameMeteoView]=useState<boolean>(false);
    const [frameHydroView,setFrameHydroView]=useState<boolean>(false);
    const [selectedMeteoAlert, setSelectedMeteoAlert] = useState<MeteoAllertDataProps>();
    const [selectedHydroAlert, setSelectedHydroAlert] = useState<HydroAllertDataProps>();
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
        <>
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
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                                onClick={() => {
                                    setFrameHydroView(true);
                                    setSelectedHydroAlert(alert);
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
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                                onClick={() => {
                                    setFrameMeteoView(true);
                                    setSelectedMeteoAlert(alert);
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
}               {}
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
        {frameMeteoView&&selectedMeteoAlert &&(<AllertMeteo onClose={()=>setFrameMeteoView(false)} meteo={selectedMeteoAlert} translateKey={translateKey}/>)}
        {frameHydroView && selectedHydroAlert && (
            <AllertHydro onClose={() => setFrameHydroView(false)} hydro={selectedHydroAlert} translateKey={translateKey} />
        )}
        </>
    );
}
export function AllertMeteo({ onClose, meteo, translateKey }: { onClose: () => void, meteo: MeteoAllertDataProps, translateKey: Map<string, string> }) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const downOnBackdrop = useRef(false);
    return (
        <aside
            onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
            onClick={() => { if (downOnBackdrop.current) onClose?.(); }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 2000
            }}
        >
            <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
                <div
                    ref={nodeRef}
                    style={{
                        position: 'absolute',
                        width: '75vw',
                        height: '75vh',
                        backgroundColor: backgroudLevel(meteo.level),
                        overflow: 'hidden',
                        borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
                    }}
                >
                    <div 
                        className="drag-handle" 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '40px', 
                            zIndex: 10,
                            cursor: 'grab',
                            backgroundColor: 'black',
                            borderBottom: '1px solid #e0e0e0'
                        }} 
                    />
                    
                    <button
                        type="button"
                        aria-label="Zamknij"
                        onClick={() => onClose?.()}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '24px',
                            height: '24px',
                            padding: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '50%',
                            fontSize: '14px',
                            lineHeight: 1,
                            fontFamily: "'Roboto', sans-serif",
                            cursor: 'pointer',
                            zIndex: 20,
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ff5252'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0, 0, 0, 0.45)'}
                    >
                        ✕
                    </button>
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
                        padding: '60px 40px 40px 40px', boxSizing: 'border-box', color: 'black', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                            <img
                                src={`/weather_icons/allert_icons/${meteo.eventName}.png`}
                                alt="Icon"
                                style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0 }}
                            />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                                    {setEventName(meteo.eventName, translateKey)}
                                </h1>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '16px', marginBottom: '20px' }}>
                            <div><strong>{translateKey.get("warning-info-level")}</strong> {meteo.level}</div>
                            <div><strong>{translateKey.get("warning-info-probability")}</strong> {meteo.probability}%</div>
                            <div><strong>{translateKey.get("warning-info-valid-from")}</strong> {meteo.validFrom}</div>
                            <div><strong>{translateKey.get("warning-info-valid-to")}</strong> {meteo.validTo}</div>
                            <div><strong>{translateKey.get("warning-info-published")}</strong> {meteo.publishedAt}</div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <strong>{translateKey.get("warning-info-content")}</strong>
                            <p style={{ margin: '5px 0 0 0', lineHeight: '1.5' }}>{meteo.content}</p>
                        </div>
                        
                        {meteo.comment && meteo.comment !== "Brak." && (
                            <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '15px' }}>
                                <strong>{translateKey.get("warning-info-comment")}</strong> {meteo.comment}
                            </div>
                        )}

                        <div style={{ fontSize: '14px', marginTop: 'auto', paddingTop: '20px' }}>
                            {meteo.province && meteo.province.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <strong>{translateKey.get("warning-info-provinces")}</strong> {meteo.province.join(", ")}
                                </div>
                            )}
                            {meteo.country && meteo.country.length > 0 && (
                                <div>
                                    <strong>{translateKey.get("warning-info-counties")}</strong> {meteo.country.join(", ")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Draggable>
        </aside>
    );
}
export function AllertHydro({ onClose, hydro, translateKey }: { onClose: () => void, hydro: HydroAllertDataProps, translateKey: Map<string, string> }) {
    const nodeRef = useRef<HTMLDivElement>(null);
    const downOnBackdrop = useRef(false);
    return (
        <aside
            onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
            onClick={() => { if (downOnBackdrop.current) onClose?.(); }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 2000
            }}
        >
            <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
                <div
                    ref={nodeRef}
                    style={{
                        position: 'absolute',
                        width: '75vw',
                        height: '75vh',
                        backgroundColor: backgroudLevel(hydro.level),
                        overflow: 'hidden',
                        borderRadius: '16px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.6)'
                    }}
                >
                    <div 
                        className="drag-handle" 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '40px', 
                            zIndex: 10,
                            cursor: 'grab',
                            backgroundColor: 'black',
                            borderBottom: '1px solid #e0e0e0'
                        }} 
                    />
                    
                    <button
                        type="button"
                        aria-label="Zamknij"
                        onClick={() => onClose?.()}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '24px',
                            height: '24px',
                            padding: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '50%',
                            fontSize: '14px',
                            lineHeight: 1,
                            fontFamily: "'Roboto', sans-serif",
                            cursor: 'pointer',
                            zIndex: 20,
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ff5252'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0, 0, 0, 0.45)'}
                    >
                        ✕
                    </button>
                    <div style={{ 
                        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
                        padding: '60px 40px 40px 40px', boxSizing: 'border-box', color: 'black', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                            <img
                                src={`/weather_icons/allert_icons/${hydro.eventName}.png`}
                                alt="Icon"
                                style={{ width: '100px', height: '100px', objectFit: 'contain', flexShrink: 0 }}
                            />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                                    {setEventName(hydro.eventName, translateKey)}
                                </h1>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '16px', marginBottom: '20px' }}>
                            <div><strong>{translateKey.get("warning-info-level")}</strong> {hydro.level}</div>
                            <div><strong>{translateKey.get("warning-info-probability")}</strong> {hydro.probability}%</div>
                            <div><strong>{translateKey.get("warning-info-valid-from")}</strong> {hydro.validFrom}</div>
                            <div><strong>{translateKey.get("warning-info-valid-to")}</strong> {hydro.validTo}</div>
                            <div><strong>{translateKey.get("warning-info-published")}</strong> {hydro.publishedAt}</div>
                        </div>

                        <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                            <strong>{translateKey.get("warning-info-content")}</strong>
                            <p style={{ margin: '5px 0 0 0', lineHeight: '1.5' }}>{hydro.content}</p>
                        </div>
                        
                        {hydro.comment && hydro.comment !== "Brak." && (
                            <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '15px' }}>
                                <strong>{translateKey.get("warning-info-comment")}</strong> {hydro.comment}
                            </div>
                        )}
                    </div>
                </div>
            </Draggable>
        </aside>
    );
}