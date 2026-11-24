import { useEffect, useRef, useState} from "react";
import type { RefObject  } from "react";
import {TOP_MENU_HEIGHT, SIDE_MENU_WIDTH} from '../map/constans'
import Draggable from 'react-draggable';
import './SideSettingsMenu.css'
import { LoginAuthentication } from "../LoginAuthentication";
import {changePassword} from '../PasswordChanger'
type SideSettingsProps={
    isOpen: boolean;
    onClose: () => void;
    toggleButtonRef: RefObject<HTMLButtonElement | null>;
    onLogout:()=>void;
    translateKey: Map<string, string>;
    loginInUse: string;
}
export function SideSettingsMenu({isOpen, onClose, toggleButtonRef, onLogout,translateKey,loginInUse}: SideSettingsProps){
    const menuRef = useRef<HTMLDivElement>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [myAccount, setMyAccount]=useState(false);
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
                    <li><button className="btn-primary"onClick={()=>setMyAccount(true)}>{translateKey.get("side-menu-my-account")}</button></li>
                    <li><button className="btn-primary">{translateKey.get("side-menu-contact")}</button></li>
                    <li><button className="btn-primary" onClick={()=>setIsMobileOpen(true)}>{translateKey.get("side-menu-mobile")}</button></li>
                    <li><button className="btn-primary" onClick={()=>onLogout()}>{translateKey.get("side-menu-logout")}</button></li>
                </ul>
            </aside>
            {isMobileOpen && (
                <Mobile onClose={() => setIsMobileOpen(false)} translateKey={translateKey} />
            )}
            {myAccount&&(
                //<MyConto onClose={()=>setMyAccount(false)}translateKey={translateKey}/>
                <MyConto loginInUse={loginInUse} onClose={()=>setMyAccount(false)} />
            )}
            {}
            </>
    )   
}
export function Mobile({ onClose,translateKey }: { onClose: () => void,translateKey: Map<string,string> }){
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
                            {translateKey.get("side-menu-mobile")}
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
//export function MyConto({ onClose,translateKey }: { onClose: () => void,translateKey: Map<string,string> }) {
export function MyConto({onClose,loginInUse}:{onClose: ()=>void,loginInUse: string}) {
    const [responseMessage,setResponseMessage]=useState('');
    const [actualPassword,setActualPassword]=useState('');
    const [newPassword,setNewPassword]=useState('');
    const [newPassword2,setNewPassword2]=useState('');
    const [isChanged,setIsChanged]=useState<boolean>(false);
    const [regexError,setRegexError]=useState({actualPassword: '',newPassword: '',newPassword2: ''});
    const nodeRef = useRef<HTMLDivElement>(null);
    const downOnBackdrop = useRef(false);
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?& ])[A-Za-z\d@$!%*?& ]{8,20}$/;
    const handleChangePassword = async ()=>{
        if(regexPassword.test(actualPassword)&&regexPassword.test(newPassword)&&regexPassword.test(newPassword2)){
            if(newPassword===newPassword2){
                const result = await LoginAuthentication(loginInUse,actualPassword,true);
                if(!(result.info_k==="Zalogowano")){
                    setResponseMessage(result.info_k);
                    setIsChanged(false);
                }else{
                    const changeResult = await changePassword(loginInUse,newPassword);
                    setResponseMessage((await changeResult).info_k);
                    setIsChanged(true);
                }
        }else{
            setIsChanged(false);
            setResponseMessage("Wpisz poprawnie obydwa hasła");
        }
        }
        };
    useEffect(()=>{
        if(actualPassword.length>0&&!regexPassword.test(actualPassword)){
            setRegexError({
                actualPassword: 'Hasło musi mieć od 8 do 20 znaków, zawierać małą litere, dużą litere, cyfrę oraz znak specjalny',
                newPassword: regexError.newPassword,
                newPassword2: regexError.newPassword2
        });
        } else{
            setRegexError({
                actualPassword: '',
                newPassword: regexError.newPassword,
                newPassword2: regexError.newPassword2
        });
        } 
    }, [actualPassword]);
    useEffect(()=>{
        if(newPassword.length>0&&!regexPassword.test(newPassword)){
            setRegexError({
                actualPassword: regexError.actualPassword,
                newPassword: 'Hasło musi mieć od 8 do 20 znaków, zawierać małą litere, dużą litere, cyfrę oraz znak specjalny',
                newPassword2: regexError.newPassword2
        });
        }else{
            setRegexError({
                actualPassword: regexError.actualPassword,
                newPassword: '',
                newPassword2: regexError.newPassword2
        });
        }
    }, [newPassword]);
    useEffect(()=>{
        if(newPassword2.length>0&&!regexPassword.test(newPassword2)){
            setRegexError({
                actualPassword: regexError.actualPassword,
                newPassword: regexError.newPassword,
                newPassword2: 'Hasło musi mieć od 8 do 20 znaków, zawierać małą litere, dużą litere, cyfrę oraz znak specjalny'
        });
        }else{
            setRegexError({
                actualPassword: regexError.actualPassword,
                newPassword: regexError.newPassword,
                newPassword2: ''
        });
        }
    }, [newPassword2]);

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
                zIndex: 1000
            }}
        >
        <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
            <div
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    width: '50vw',
                    height: '50vh',
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
                        cursor: 'grab'
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
                        width: '20px',
                        height: '20px',
                        padding: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '50%',
                        fontSize: '12px',
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
                gap: '16px', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                width: '100vw',
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'scale(0.5)',
                transformOrigin: 'top left',
                overflow: 'hidden'
            }}>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', 
                        zIndex: -1,         
                        filter: 'brightness(0.6)' 
                    }}
                >
                    <source src="/register_video.mp4" type="video/mp4" />
                </video>

                <img 
                    src="/weather_allert_logo_white.png"
                    alt="Logo"
                    style={{ 
                        height: '112px', 
                        width: "198px", 
                        marginBottom: '10px',
                        filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' 
                    }}
                />

                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px', 
                    width: '320px', 
                    alignItems: 'flex-start',
                    textAlign: 'left' 
                }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        <label style={{ 
                            fontFamily: "'Roboto', sans-serif", 
                            fontWeight: 500, 
                            fontSize: '16px', 
                            color: 'white',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            textAlign: 'left'
                        }}>
                            Wpisz Aktualne Hasło:
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="text"
                                value={actualPassword}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: regexError.actualPassword ? '1px solid #ff5252' : '1px solid rgba(255, 255, 255, 0.3)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'background-color 0.2s, border-color 0.2s'
                                }}
                                onFocus={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                onChange={(e) => setActualPassword(e.target.value.trim())}
                            />
                            {regexError.actualPassword && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '40px',          
                                    left: '0',
                                    color: '#ff5252', 
                                    fontSize: '8px', 
                                    marginTop: '2px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    whiteSpace: 'nowrap'  
                                }}>
                                    {regexError.actualPassword}
                                </span>
                            )}
                            {responseMessage && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-65px',
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    color: isChanged? '#4caf50':'#ff5252',
                                    fontSize: '20px',
                                    marginTop: '2px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {responseMessage}
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        <label style={{ 
                            marginTop: "15px",
                            fontFamily: "'Roboto', sans-serif", 
                            fontWeight: 500, 
                            fontSize: '16px', 
                            color: 'white',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            textAlign: 'left' 
                        }}>
                            Wpisz Nowe Hasło:
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="password"
                                value={newPassword}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: regexError.newPassword ? '1px solid #ff5252' : '1px solid rgba(255, 255, 255, 0.3)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'background-color 0.2s, border-color 0.2s'
                                }}
                                onFocus={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                onChange={(e) => setNewPassword(e.target.value.trim())}
                            />
                            {regexError.newPassword && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '40px',          
                                    left: '0',
                                    color: '#ff5252', 
                                    fontSize: '8px', 
                                    marginTop: '2px',
                                    marginBottom: '10px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    whiteSpace: 'nowrap'  
                                }}>
                                    {regexError.newPassword}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                        <label style={{ 
                            marginTop: "15px",
                            fontFamily: "'Roboto', sans-serif", 
                            fontWeight: 500, 
                            fontSize: '16px', 
                            color: 'white',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                            textAlign: 'left' 
                        }}>
                            Powtórz Nowe Hasło:
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="password"
                                value={newPassword2}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    border: regexError.newPassword2 ? '1px solid #ff5252' : '1px solid rgba(255, 255, 255, 0.3)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'background-color 0.2s, border-color 0.2s'
                                }}
                                onFocus={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                                onChange={(e) => setNewPassword2(e.target.value.trim())}
                            />
                            {regexError.newPassword2 && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: '40px',          
                                    left: '0',
                                    color: '#ff5252', 
                                    fontSize: '8px', 
                                    marginTop: '2px',
                                    marginBottom: '10px',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                    whiteSpace: 'nowrap'  
                                }}>
                                    {regexError.newPassword2}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                        <button style={{
                            padding: '12px 40px',
                            backgroundColor: '#a57db1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '20px',
                            marginTop: '20px',
                            fontWeight: 'bold',
                            fontFamily: "'Roboto', sans-serif",
                            cursor: 'pointer',
                            transition: 'background-color 0.2s, transform 0.1s',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#af98b6'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#a57db1'}
                        onClick={handleChangePassword}
                        >
                            Zmień Hasło
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </Draggable>
        </aside>
    )
}