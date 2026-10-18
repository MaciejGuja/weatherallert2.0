import { useEffect, useRef} from "react";
import type { RefObject  } from "react";
import {TOP_MENU_HEIGHT, SIDE_MENU_WIDTH} from './map/constans'
import './SideSettingsMenu.css'
type SideSettingsProps={
    isOpen: boolean;
    onClose: () => void;
    toggleButtonRef: RefObject<HTMLButtonElement | null>;
    onLogout:()=>void;
    translateKey: Map<string, string>;
}
export function SideSettingsMenu({isOpen, onClose, toggleButtonRef, onLogout,translateKey}: SideSettingsProps){
    const menuRef = useRef<HTMLDivElement>(null);
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
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0px',marginTop: '1px' }}>
                    <li><button className="btn-primary">{translateKey.get("side-menu-my-account")}</button></li>
                    <li><button className="btn-primary">{translateKey.get("side-menu-contact")}</button></li>
                    <li><button className="btn-primary" onClick={()=>onLogout()}>{translateKey.get("side-menu-logout")}</button></li>
                </ul>
            </aside>
    )   
}