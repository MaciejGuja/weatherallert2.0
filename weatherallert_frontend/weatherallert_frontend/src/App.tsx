import { useState } from 'react';
import MapView from './map/MapView';
import { TopMenu } from './TopMenu';
import { LoginView } from './LoginView';
export type ViewType = 'none' | 'conditions' | 'forecast' | 'allerts';

export default function App() {
    const [view, setView] = useState<ViewType>('none');

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <LoginView/>
            {/* <TopMenu onViewChanged={setView} />
            <div style={{
                position: 'absolute',
                top: 56,
                left: 0,
                right: 0,
                bottom: 0,
            }}>
                {view === 'conditions' && <MapView />}
                {view === 'forecast'}
                {view === 'allerts'}
            </div> */}
        </div>
    );
}
