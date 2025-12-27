import React from 'react';

// Victron-inspired color palette
const COLORS = {
    victronBlue: '#003366',
    victronOrange: '#ff6600',
    solarYellow: '#fbbf24',
    batteryGreen: '#22c55e',
    batteryRed: '#ef4444',
    acBlue: '#60a5fa',
    dcRed: '#f87171',
    dataGreen: '#2dd4bf',
    metalGray: '#94a3b8',
    darkGray: '#1e293b',
};

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
    batteryPercent?: number;
}

/**
 * Solar Panel Icon
 * Yellow/amber panel with grid lines
 */
export const SolarPanelIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Panel body */}
        <rect x="4" y="8" width="40" height="32" rx="2" fill="#1e293b" stroke="#fbbf24" strokeWidth="2" />
        {/* Grid cells */}
        <line x1="16" y1="8" x2="16" y2="40" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        <line x1="32" y1="8" x2="32" y2="40" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        <line x1="4" y1="20" x2="44" y2="20" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        <line x1="4" y1="28" x2="44" y2="28" stroke="#fbbf24" strokeWidth="1" opacity="0.6" />
        {/* Sun reflection */}
        <circle cx="36" cy="14" r="4" fill="#fbbf24" opacity="0.4" />
    </svg>
);

/**
 * Battery Icon
 * Shows SOC level with color gradient
 */
export const BatteryIcon: React.FC<IconProps> = ({
    size = 48,
    className = '',
    batteryPercent = 100
}) => {
    const fillHeight = (batteryPercent / 100) * 28;
    const fillColor = batteryPercent > 60 ? COLORS.batteryGreen
        : batteryPercent > 30 ? '#eab308'
            : COLORS.batteryRed;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            className={className}
        >
            {/* Battery terminal */}
            <rect x="18" y="4" width="12" height="4" rx="1" fill={COLORS.metalGray} />
            {/* Battery body */}
            <rect x="8" y="8" width="32" height="36" rx="3" fill={COLORS.darkGray} stroke={COLORS.metalGray} strokeWidth="2" />
            {/* Fill level */}
            <rect
                x="11"
                y={41 - fillHeight}
                width="26"
                height={fillHeight}
                rx="1"
                fill={fillColor}
                opacity="0.9"
            />
            {/* Percentage text */}
            <text
                x="24"
                y="30"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
            >
                {batteryPercent}%
            </text>
        </svg>
    );
};

/**
 * MPPT Charger Icon
 * Lightning bolt with solar input
 */
export const MpptIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Box */}
        <rect x="8" y="8" width="32" height="32" rx="4" fill={COLORS.darkGray} stroke={COLORS.victronBlue} strokeWidth="2" />
        {/* Lightning bolt */}
        <path
            d="M26 8 L18 24 L24 24 L22 40 L30 22 L24 22 Z"
            fill={COLORS.solarYellow}
        />
        {/* Solar indicator (top) */}
        <circle cx="14" cy="14" r="3" fill={COLORS.solarYellow} opacity="0.6" />
    </svg>
);

/**
 * DC-DC Converter Icon
 * Two voltage levels with arrow
 */
export const DcDcIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Box */}
        <rect x="8" y="8" width="32" height="32" rx="4" fill={COLORS.darkGray} stroke={COLORS.batteryGreen} strokeWidth="2" />
        {/* DC text */}
        <text x="16" y="22" fill={COLORS.metalGray} fontSize="8" fontWeight="bold">DC</text>
        {/* Arrow */}
        <path d="M24 20 L24 32 M20 28 L24 32 L28 28" stroke={COLORS.batteryGreen} strokeWidth="2" />
        {/* DC text */}
        <text x="28" y="38" fill={COLORS.metalGray} fontSize="8" fontWeight="bold">DC</text>
    </svg>
);

/**
 * Inverter/Charger Icon
 * AC/DC conversion symbol
 */
export const InverterIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Box */}
        <rect x="6" y="10" width="36" height="28" rx="4" fill={COLORS.darkGray} stroke={COLORS.victronBlue} strokeWidth="2" />
        {/* AC wave */}
        <path
            d="M12 24 Q16 16, 20 24 Q24 32, 28 24"
            stroke={COLORS.acBlue}
            strokeWidth="2"
            fill="none"
        />
        {/* Arrow */}
        <path d="M30 24 L36 24 M33 21 L36 24 L33 27" stroke="white" strokeWidth="1.5" />
        {/* DC line */}
        <line x1="38" y1="24" x2="42" y2="24" stroke={COLORS.dcRed} strokeWidth="2" />
    </svg>
);

/**
 * Distributor/Fuse Box Icon
 * Multiple connection points
 */
export const DistributorIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Box */}
        <rect x="8" y="8" width="32" height="32" rx="2" fill={COLORS.darkGray} stroke={COLORS.metalGray} strokeWidth="2" />
        {/* Connection points (top) */}
        <circle cx="16" cy="8" r="3" fill={COLORS.dcRed} />
        <circle cx="24" cy="8" r="3" fill={COLORS.dcRed} />
        <circle cx="32" cy="8" r="3" fill={COLORS.dcRed} />
        {/* Connection points (bottom) */}
        <circle cx="16" cy="40" r="3" fill={COLORS.dcRed} />
        <circle cx="24" cy="40" r="3" fill={COLORS.dcRed} />
        <circle cx="32" cy="40" r="3" fill={COLORS.dcRed} />
        {/* Fuse symbols */}
        <rect x="14" y="18" width="4" height="12" rx="1" fill={COLORS.metalGray} />
        <rect x="22" y="18" width="4" height="12" rx="1" fill={COLORS.metalGray} />
        <rect x="30" y="18" width="4" height="12" rx="1" fill={COLORS.metalGray} />
    </svg>
);

/**
 * Monitor/Cerbo GX Icon
 * Screen with data display
 */
export const MonitorIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Screen body */}
        <rect x="6" y="8" width="36" height="28" rx="3" fill={COLORS.darkGray} stroke={COLORS.dataGreen} strokeWidth="2" />
        {/* Screen */}
        <rect x="10" y="12" width="28" height="20" rx="1" fill="#0f172a" />
        {/* Display lines */}
        <line x1="14" y1="18" x2="34" y2="18" stroke={COLORS.dataGreen} strokeWidth="1" />
        <line x1="14" y1="24" x2="30" y2="24" stroke={COLORS.dataGreen} strokeWidth="1" />
        <line x1="14" y1="28" x2="26" y2="28" stroke={COLORS.dataGreen} strokeWidth="1" />
        {/* Stand */}
        <rect x="20" y="36" width="8" height="4" fill={COLORS.metalGray} />
        <rect x="16" y="40" width="16" height="2" rx="1" fill={COLORS.metalGray} />
    </svg>
);

/**
 * 12V Consumer Icon
 * Light bulb
 */
export const Consumer12VIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Bulb */}
        <circle cx="24" cy="20" r="12" fill="#fef3c7" stroke={COLORS.solarYellow} strokeWidth="2" />
        {/* Filament */}
        <path d="M20 20 Q22 16, 24 20 Q26 24, 28 20" stroke={COLORS.solarYellow} strokeWidth="1.5" fill="none" />
        {/* Base */}
        <rect x="18" y="32" width="12" height="8" rx="2" fill={COLORS.metalGray} />
        <line x1="18" y1="36" x2="30" y2="36" stroke={COLORS.darkGray} strokeWidth="1" />
        <line x1="18" y1="38" x2="30" y2="38" stroke={COLORS.darkGray} strokeWidth="1" />
        {/* 12V label */}
        <text x="24" y="46" textAnchor="middle" fill={COLORS.dcRed} fontSize="8" fontWeight="bold">12V</text>
    </svg>
);

/**
 * 230V Consumer Icon
 * Power outlet
 */
export const Consumer230VIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Outlet body */}
        <rect x="8" y="8" width="32" height="32" rx="4" fill="white" stroke={COLORS.acBlue} strokeWidth="2" />
        {/* Socket holes */}
        <circle cx="18" cy="24" r="3" fill={COLORS.darkGray} />
        <circle cx="30" cy="24" r="3" fill={COLORS.darkGray} />
        {/* Ground pin */}
        <rect x="22" y="14" width="4" height="6" rx="1" fill={COLORS.darkGray} />
        {/* 230V label */}
        <text x="24" y="46" textAnchor="middle" fill={COLORS.acBlue} fontSize="8" fontWeight="bold">230V</text>
    </svg>
);

/**
 * Shore Power Icon
 * Power plug
 */
export const ShorePowerIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Plug body */}
        <rect x="14" y="4" width="20" height="24" rx="3" fill={COLORS.darkGray} stroke={COLORS.acBlue} strokeWidth="2" />
        {/* Prongs */}
        <rect x="18" y="28" width="4" height="12" rx="1" fill={COLORS.metalGray} />
        <rect x="26" y="28" width="4" height="12" rx="1" fill={COLORS.metalGray} />
        {/* Cable */}
        <path d="M24 4 L24 0" stroke={COLORS.acBlue} strokeWidth="3" />
        {/* Power symbol */}
        <circle cx="24" cy="16" r="6" stroke={COLORS.acBlue} strokeWidth="2" fill="none" />
        <line x1="24" y1="10" x2="24" y2="16" stroke={COLORS.acBlue} strokeWidth="2" />
    </svg>
);

/**
 * Generator/Alternator Icon
 * Engine with coil
 */
export const AlternatorIcon: React.FC<IconProps> = ({
    size = 48,
    className = ''
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={className}
    >
        {/* Engine body */}
        <rect x="8" y="12" width="32" height="24" rx="4" fill={COLORS.darkGray} stroke={COLORS.batteryGreen} strokeWidth="2" />
        {/* Coil symbol */}
        <path
            d="M16 24 Q20 18, 24 24 Q28 30, 32 24"
            stroke={COLORS.batteryGreen}
            strokeWidth="2"
            fill="none"
        />
        {/* Output terminals */}
        <circle cx="12" cy="24" r="3" fill={COLORS.dcRed} />
        <circle cx="36" cy="24" r="3" fill={COLORS.dcRed} />
        {/* Pulley */}
        <circle cx="24" cy="6" r="4" fill={COLORS.metalGray} />
        <line x1="20" y1="6" x2="16" y2="2" stroke={COLORS.metalGray} strokeWidth="2" />
    </svg>
);

// Icon map for easy lookup
export const ELECTRICAL_ICONS: Record<string, React.FC<IconProps>> = {
    solar_panel: SolarPanelIcon,
    battery: BatteryIcon,
    mppt: MpptIcon,
    dc_dc: DcDcIcon,
    inverter: InverterIcon,
    distributor: DistributorIcon,
    monitor: MonitorIcon,
    consumer_12v: Consumer12VIcon,
    consumer_230v: Consumer230VIcon,
    shore_power: ShorePowerIcon,
    alternator: AlternatorIcon,
};

/**
 * Get icon component by type
 */
export const getElectricalIcon = (type: string): React.FC<IconProps> => {
    return ELECTRICAL_ICONS[type] || SolarPanelIcon;
};
