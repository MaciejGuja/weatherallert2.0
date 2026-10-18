import { useEffect, useRef, useState } from 'react';
import {SideSettingsMenu} from './SideSettingsMenu';
import './TopMenu.css';
type ViewType = 'none' | 'conditions' | 'forecast' | 'allerts';
type TopMenuProps = {
    onViewChanged: (view: ViewType) => void;
    
};
export function TopMenu({onViewChanged}: TopMenuProps){
    const [isSideSettingsOpen, setSettingsOpen]=useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const settingsBtnRef = useRef<HTMLButtonElement | null>(null);
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
                    AKTUALNE WARUNKI
                </button>
                <button className="ghost-button-top-menu-options" onClick={()=>onViewChanged('forecast')}>
                    PROGNOZA POGODY
                </button>
                <button className="ghost-button-top-menu-options" onClick={()=>onViewChanged('allerts')}>
                    ZAGROŻENIA POGODOWE
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
                        isOpen={isSideSettingsOpen} onClose={()=>setSettingsOpen(false)} toggleButtonRef={settingsBtnRef}
                    />
        </div>
    )
}