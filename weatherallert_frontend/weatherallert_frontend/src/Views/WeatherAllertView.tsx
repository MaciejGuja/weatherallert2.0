type WeatherForecastViewProps={
    translateKey: Map<string, string>;
}
export function WeatherAllertView({translateKey}:WeatherForecastViewProps){
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
            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    background: '#ffffff',
                    borderRight: '1px solid #e0e0e0',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px 40px',
                    overflow: 'hidden',
                }}
            >
            </div>

{/* L / P */}

            <div
                style={{
                    flex: 1,
                    position: 'relative',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: '85%',
                        height: 'calc(100% - 70px)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                </div>
            </div>
        </div>
    );
}