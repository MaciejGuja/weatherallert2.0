import { useState,useEffect } from 'react';
import MapView from './map/MapView';
import { TopMenu } from './Views/TopMenu';
import { LoginView } from './Views/LoginView';
import {LanguageController} from './Language/LanguageController'
import {WeatherForecastView} from './Views/WeatherForecast';
import { WeatherAllertView } from './Views/WeatherAllertView';
import {MeteoAllertDataCollector, type MeteoAllertDataProps} from './WeatherAPI/AllertDataCollector'
export type ViewType = 'none' | 'conditions' | 'forecast' | 'allerts';
export type LanguageCode = "pl" | "en" | "de";
export default function App() {
    const [view, setView] = useState<ViewType>('none');
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [translateKey,setTranslateKey]=useState<Map<string,string>>(new Map());
    const [languageCode, setLanguageCode] = useState<LanguageCode>("pl");
    const [meteoAlertsForMap, setMeteoAlertsForMap] = useState<MeteoAllertDataProps[]>([]);
    useEffect(() => {
        let canceled = false;
        LanguageController({ languageCode })
            .then(map => { if (!canceled) setTranslateKey(map); })
            .catch(err => console.error("BŁĄD TŁUMACZEŃ", err));
        return () => { canceled = true; };
}, [languageCode]);
    useEffect(() => {
        let canceled = false;
        MeteoAllertDataCollector()
            .then(data => { if (!canceled) setMeteoAlertsForMap(data); })
            .catch(err => console.error("Błąd alertów dla mapy:", err));
        return () => { canceled = true; };
    }, []);
    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            {!isLogin && <LoginView isLoginProps={isLogin} onLoginChange={setIsLogin} translateKey={translateKey}/>}
            {isLogin && (
            <>      
            <TopMenu onViewChanged={setView} onLogout={()=>setIsLogin(false)} translateKey={translateKey} onLanguageChange={setLanguageCode}/>
            <div style={{
                position: 'absolute',
                top: 56,
                left: 0,
                right: 0,
                bottom: 0,
            }}>
                {view === 'conditions' && <MapView translateKey={translateKey} meteoCollector={meteoAlertsForMap}/>}
                {view === 'forecast' && <WeatherForecastView translateKey={translateKey}/>}
                {view === 'allerts' && <WeatherAllertView translateKey={translateKey}/>}
            </div>
            </>
            )}
        </div>
    );
}
