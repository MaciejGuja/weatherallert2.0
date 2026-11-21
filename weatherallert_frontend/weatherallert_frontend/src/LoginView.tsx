import {useEffect, useState} from 'react';
import {LoginAuthentication} from './LoginAuthentication'
type LoginProps = {
    isLoginProps: boolean;
     onLoginChange: (isLoggedIn: boolean) => void;
}

export function LoginView({isLoginProps,onLoginChange}:LoginProps) {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [responseMessage,setResponseMessage]=useState('');
    const [login,setLogin]=useState('');
    const [password,setPassword]=useState('');
    const [regexError,setRegexError]=useState({login: '',password: ''});
    const handleLoginButton = async ()=>{
        const result = await LoginAuthentication(login,password);
        if(!(result.info==="Zalogowano")){
            setResponseMessage(result.info);
            setIsLogin(false);
            onLoginChange(false);
        }else{
            setResponseMessage("");
            setIsLogin(true);
            onLoginChange(true);
        }
    };
    useEffect(()=>{
        const regexLogin=/^[a-zA-Z0-9@._%+\- ]{3,15}$/;
        if(login.length>0&&!regexLogin.test(login)){
            setRegexError({
                login: 'Login musi mieć od 3 do 15 znaków',
                password: regexError.password
        });
        } else{
            setRegexError({
                login: '',
                password: regexError.password
        });
        } 
    }, [login]);
    useEffect(()=>{
        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?& ])[A-Za-z\d@$!%*?& ]{8,20}$/;
        if(password.length>0&&!regexPassword.test(password)){
            setRegexError({
                login: regexError.login,
                password: 'Hasło musi mieć od 8 do 20 znaków, zawierać małą litere, dużą litere, cyfrę oraz znak specjalny'
        });
        }else{
            setRegexError({
                login: regexError.login,
                password: ''
        });
        }
    }, [password]);
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            width: '100vw',
            position: 'relative',
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
                <source src="/login_alert.mp4" type="video/mp4" />
            </video>

            <img 
                //src="/weather_allert_logo_green_2e7d32.png"
                src="/weather_allert_logo_white.png"
                //src="/weather_allert_logo_gray_cccfd6.png"
                alt="Logo"
                style={{ 
                    height: '112px', 
                    width: "198px", 
                    // height: '168px', 
                    // width: "297px", 
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
                        Login:
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type="text"
                            value={login}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: regexError.login ? '1px solid #ff5252' : '1px solid rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'background-color 0.2s, border-color 0.2s'
                            }}
                            onFocus={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                            onBlur={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            onChange={(e) => setLogin(e.target.value.trim())}
                        />
                        {regexError.login && (
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
                                {regexError.login}
                            </span>
                        
                        )}
                        {responseMessage && (
                            <span style={{
                                position: 'absolute',
                                top: '-65px',
                                left: 0,
                                right: 0,
                                textAlign: 'center',
                                color: '#ff5252',
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
                        Hasło:
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                            type="password"
                            value={password}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: regexError.password ? '1px solid #ff5252' : '1px solid rgba(255, 255, 255, 0.3)',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'background-color 0.2s, border-color 0.2s'
                            }}
                            onFocus={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                            onBlur={(e) => (e.target as HTMLInputElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                            onChange={(e) => setPassword(e.target.value.trim())}
                        />
                        {regexError.password && (
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
                                {regexError.password}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button style={{
                        marginTop: '15px',
                        padding: '12px 40px',
                        backgroundColor: '#2e7d32',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fontFamily: "'Roboto', sans-serif",
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, transform 0.1s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#37943f'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2e7d32'}
                    onClick={handleLoginButton}
                    >
                        Zaloguj się
                    </button>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                    <button style={{
                        padding: '12px 40px',
                        backgroundColor: '#a57db1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        fontFamily: "'Roboto', sans-serif",
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, transform 0.1s',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#af98b6'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#a57db1'}
                    >
                        Zarejestruj się
                    </button>
                </div>
            </div>
        </div>
    )
}