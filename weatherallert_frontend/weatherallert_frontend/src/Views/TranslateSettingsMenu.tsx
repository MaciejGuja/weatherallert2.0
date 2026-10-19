import { useEffect, useRef} from "react";
import type { RefObject  } from "react";
import {TOP_MENU_HEIGHT, SIDE_MENU_WIDTH} from '../map/constans'
import './TranslateSettingsMenu.css'
import { FlagPL, FlagGB, FlagDE } from '../assets/Flags'
import type { LanguageCode } from '../App';
type TranslateSettingsProps={
    isOpen: boolean;
    onClose: () => void;
    toggleButtonRef: RefObject<HTMLButtonElement | null>;
    onLogout:()=>void;
    translateKey: Map<string, string>;
    onLanguageChange: (code: LanguageCode) => void;
}
export function TranslateSettingsMenu({isOpen, onClose, toggleButtonRef, onLogout,translateKey,onLanguageChange}:TranslateSettingsProps){
    const menuRef = useRef<HTMLDivElement>(null);
    const handleLanguage=(code: LanguageCode)=>{
        onLanguageChange(code);
    }
    useEffect(()=>{
        function handleClickOutside(event: MouseEvent){
                if(!isOpen){
                    return;
                }
                if(toggleButtonRef.current&&toggleButtonRef.current.contains(event.target as Node)){
                    return;
                }
                if(isOpen&&menuRef.current&&menuRef.current.contains(event.target as Node)){
                    return;
                }
                onClose();
                
        }
        if(isOpen){
            document.addEventListener('mousedown',handleClickOutside);
        }
        return()=>{
            document.removeEventListener('mousedown',handleClickOutside);
            
        };
    },[isOpen,onClose,toggleButtonRef,onLogout]);
    return(
        <aside
                ref={menuRef}
                style={{
                    position: 'fixed', 
                    top: TOP_MENU_HEIGHT, 
                    right: 0, 
                    width: SIDE_MENU_WIDTH, 
                    height: `150px`,
                    backgroundColor: '#f8f9fa', 
                    zIndex: 1501, 
                    //padding: '20px',
                    boxSizing: 'border-box',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
                }}
            >
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0px', marginTop: '1px' }}>
                <li>
                    <button className="btn-primary btn-language" onClick={()=>handleLanguage("pl")}>
                        <FlagPL />
                        <span>{translateKey.get("translate-menu-polish")}</span>
                    </button>
                </li>
                <li>
                    <button className="btn-primary btn-language" onClick={()=>handleLanguage("en")}>
                        <FlagGB />
                        <span>{translateKey.get("translate-menu-english")}</span>
                    </button>
                </li>
                <li>
                    <button className="btn-primary btn-language" onClick={()=>handleLanguage("de")}>
                        <FlagDE />
                        <span>{translateKey.get("translate-menu-german")}</span>
                    </button>
                </li>
            </ul>
            </aside>
    )   
}