type FlagProps = { width?: number; height?: number };

const flagStyle: React.CSSProperties = {
    borderRadius: 2,
    boxShadow: '0 0 0 1px rgba(0,0,0,0.25)',
    flexShrink: 0,
    display: 'block',
};

export function FlagPL({ width = 24, height = 16 }: FlagProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 16 10" style={flagStyle} aria-hidden="true">
            <rect width="16" height="5" fill="#ffffff" />
            <rect y="5" width="16" height="5" fill="#dc143c" />
        </svg>
    );
}

export function FlagGB({ width = 24, height = 16 }: FlagProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 60 30" preserveAspectRatio="none" style={flagStyle} aria-hidden="true">
            <clipPath id="gb-clip">
                <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </clipPath>
            <rect width="60" height="30" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#gb-clip)" stroke="#c8102e" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        </svg>
    );
}

export function FlagDE({ width = 24, height = 16 }: FlagProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 5 3" preserveAspectRatio="none" style={flagStyle} aria-hidden="true">
            <rect width="5" height="1" fill="#000000" />
            <rect y="1" width="5" height="1" fill="#dd0000" />
            <rect y="2" width="5" height="1" fill="#ffce00" />
        </svg>
    );
}