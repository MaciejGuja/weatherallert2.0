import { useMemo } from 'react';
import { GeoJSON } from 'react-leaflet';
import type L from 'leaflet';
import { levelForCode, type AlertLevel, type AlertLevelMap } from './utils';

/**
 * @brief Kolory poziomów zagrożenia: 1 - żółty, 2 - pomarańczowy, 3 - czerwony.
 */
export const ALERT_COLORS: Record<AlertLevel, string> = {
    1: '#fdd835',
    2: '#fb8c00',
    3: '#e53935',
};

const STYLE_ID = 'alert-blink-styles';

/**
 * @brief Jednorazowo dodaje do <head> animację migania. Wyższy poziom zagrożenia miga szybciej.
 */
function ensureAlertStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = `
@keyframes alert-blink {
    0%, 100% { fill-opacity: 0.12; stroke-opacity: 0.45; }
    50%      { fill-opacity: 0.8;  stroke-opacity: 1; }
}
.alert-blink-1 { animation: alert-blink 1.8s ease-in-out infinite; }
.alert-blink-2 { animation: alert-blink 1.2s ease-in-out infinite; }
.alert-blink-3 { animation: alert-blink 0.7s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
    .alert-blink-1, .alert-blink-2, .alert-blink-3 { animation: none; fill-opacity: 0.5; stroke-opacity: 1; }
}`;
    document.head.appendChild(el);
}

interface AlertLayerProps {
    features: GeoJSON.Feature[];
    toLatLng: (coords: number[]) => L.LatLng;
    alertLevels: AlertLevelMap;
}

/**
 * @brief Warstwa migających obszarów (powiatów lub gmin), w których obowiązuje zagrożenie.
 * @param features Obiekty GeoJSON (powiaty albo gminy) z polem properties.code (kod TERYT).
 * @param toLatLng Funkcja przeliczająca współrzędne [lng, lat] na układ danej mapy.
 * @param alertLevels Poziomy zagrożeń zbudowane funkcją buildAlertLevelMap.
 * @return Warstwa GeoJSON albo null
 */
export function AlertLayer({ features, toLatLng, alertLevels }: AlertLayerProps) {
    ensureAlertStyles();

    const alerted = useMemo(
        () =>
            features
                .map((feature) => ({
                    feature,
                    level: levelForCode(alertLevels, String((feature.properties as any)?.code ?? '')),
                }))
                .filter((x) => x.level > 0),
        [features, alertLevels]
    );

    const data = useMemo<GeoJSON.FeatureCollection>(
        () => ({
            type: 'FeatureCollection',
            features: alerted.map((a) => ({
                ...a.feature,
                properties: { ...(a.feature.properties ?? {}), __alertLevel: a.level },
            })),
        }),
        [alerted]
    );

    const signature = alerted.map((a) => `${(a.feature.properties as any)?.code}:${a.level}`).join('|');

    if (alerted.length === 0) return null;

    return (
        <GeoJSON
            key={signature}
            data={data}
            coordsToLatLng={toLatLng as any}
            interactive={false}
            style={(feature) => {
                const level = ((feature?.properties as any)?.__alertLevel ?? 1) as AlertLevel;
                const color = ALERT_COLORS[level];
                return {
                    fillColor: color,
                    fillOpacity: 0.5,
                    color,
                    weight: 2,
                    opacity: 1,
                    interactive: false,
                    className: `alert-blink alert-blink-${level}`,
                };
            }}
        />
    );
}
