import { useEffect, useRef, useState } from 'react';
import {SideSettingsMenu} from './SideSettingsMenu';
import {LanguageController} from './Language/LanguageController'
import './TopMenu.css';
type LanguageCode = "pl" | "en" | "de";
type ViewType = 'none' | 'conditions' | 'forecast' | 'allerts';
type TopMenuProps = {
    onViewChanged: (view: ViewType) => void;
    onLogout: ()=>void;
};
export function TopMenu({onViewChanged, onLogout}: TopMenuProps){
    const [isSideSettingsOpen, setSettingsOpen]=useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
    const [translateKey,setTranslateKey]=useState<Map<string,string>>(new Map());
    const [languageCode, setLanguageCode] = useState<LanguageCode>("en");
    useEffect(() => {
        let canceled = false;
        LanguageController({ languageCode })
            .then(map => { if (!canceled) setTranslateKey(map); })
            .catch(err => console.error("BŁĄD TŁUMACZEŃ", err));
        return () => { canceled = true; };
}, [languageCode]);
    return(
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                zIndex: 1000,
                boxSizing: 'border-box',
        }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-evenly',flex: 1}}>
                <img
                    src="/weather_allert_logo_transparent.png"
                    alt="Logo"
                    style={{ height: '56px', width: "99px" }} />
                <button className="ghost-button-top-menu-options" onClick={()=>onViewChanged('conditions')}>
                    {translateKey.get("tob-bar-current-conditions")}
                </button>
                <button className="ghost-button-top-menu-options" onClick={()=>onViewChanged('forecast')}>
                    {translateKey.get("tob-bar-weather-conditions")}
                </button>
                <button className="ghost-button-top-menu-options" onClick={()=>onViewChanged('allerts')}>
                    {translateKey.get("tob-bar-weather-dangers")}
                </button>
                <button className="ghost-button-theme-changer">

                </button>
                <button className="ghost-button-translate">

                </button>
                <button ref={settingsBtnRef}  className="ghost-button-settings" onClick={(e)=> {
                    e.stopPropagation(); 
                    setSettingsOpen(!isSideSettingsOpen);
                }
                }>
                    
                </button>
                
            </div>
            <SideSettingsMenu
                        isOpen={isSideSettingsOpen} onClose={()=>setSettingsOpen(false)} toggleButtonRef={settingsBtnRef} onLogout={()=>onLogout()} translateKey={translateKey}
                    />
        </div>
    )
}