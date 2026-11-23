import { useEffect, useRef, useState} from "react";
import type { RefObject  } from "react";
import {TOP_MENU_HEIGHT, SIDE_MENU_WIDTH} from '../map/constans'
import Draggable from 'react-draggable';
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
    const [isMobileOpen, setIsMobileOpen] = useState(false);
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
        <>
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
                    <li><button className="btn-primary" onClick={()=>setIsMobileOpen(true)}>{translateKey.get("side-menu-mobile")}</button></li>
                    <li><button className="btn-primary" onClick={()=>onLogout()}>{translateKey.get("side-menu-logout")}</button></li>
                </ul>
            </aside>
            {isMobileOpen && (
                <Mobile onClose={() => setIsMobileOpen(false)} />
            )}
            </>
    )   
}
export function Mobile({ onClose }: { onClose: () => void }){
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
                        width: '60vw',
                        height: '60vh',
                        backgroundColor: '#ffeb3b',
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
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        width: '100%',
                        paddingTop: '50px', 
                        boxSizing: 'border-box',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black'
                    }}>
                        <div style={{fontWeight: "bold", fontSize: "24px", fontFamily: "cursive",marginBottom: "15px",marginTop: "10px" }}>
                            POBIERZ APLIKACJE MOBILNĄ
                        </div>
                        <div style={{marginBottom: "30px"}}>
                            <img
                                                src={`qr.png`}
                                                alt="QR"
                                                style={{ width: '190px', height: '190px', objectFit: 'contain' }}
                                            />
                        </div>
                    </div>
                </div>
            </Draggable>
        </aside>
    );
}