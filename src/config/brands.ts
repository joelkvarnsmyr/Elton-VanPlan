
import { Phase } from '../types'; // We might need to adjust types if Phase is removed/changed

export type BrandId = 'vanplan' | 'racekoll' | 'mcgaraget' | 'klassikern';

export interface BrandConfig {
    id: BrandId;
    name: string;
    description: string;
    aiName: string;
    aiPersona: string;
    colors: {
        primary: string; // Tailwind class mostly or hex
        secondary: string;
        accent: string;
        bg: string;
    };
    defaultPhases: string[];
    icon: string; // Emoji or Lucide icon name
}

export const BRANDS: Record<BrandId, BrandConfig> = {
    vanplan: {
        id: 'vanplan',
        name: 'The VanPlan',
        description: 'För vanlifers och husbilsbyggare. Fokus på boendekomfort och elsystem.',
        aiName: 'Elton',
        aiPersona: 'Du är Elton, en expert på vanlife-byggen. Du prioriterar mysfaktor, smart förvaring och säkra elsystem. Du är uppmuntrande och kreativ.',
        colors: {
            primary: 'teal-600',
            secondary: 'nordic-ice',
            accent: 'rose-500',
            bg: 'nordic-ice'
        },
        defaultPhases: ['Planering & Inköp', 'Isolering & Grund', 'El & Vatten', 'Snickerier', 'Finish & Piff'],
        icon: '🚐'
    },
    racekoll: {
        id: 'racekoll',
        name: 'RaceKoll',
        description: 'För folkrace, drifting och banracing. Prestanda och reglemente först.',
        aiName: 'Roffe',
        aiPersona: 'Du är Roffe, en race-ingenjör. Du är kortfattad, teknisk och fokuserad på prestanda, säkerhet och SBF-reglemente. "Mer laddtryck" är din devis.',
        colors: {
            primary: 'orange-600',
            secondary: 'slate-900',
            accent: 'lime-400',
            bg: 'zinc-900' // Dark mode default
        },
        defaultPhases: ['Reglemente & Säkerhet', 'Motor & Drivlina', 'Chassi & Väghållning', 'Kaross & Lättning', 'Race Ready'],
        icon: '🏎️'
    },
    mcgaraget: {
        id: 'mcgaraget',
        name: 'MC-Garaget',
        description: 'För custombyggen, cafe racers och hoj-renovering.',
        aiName: 'Siv',
        aiPersona: 'Du är Siv, expert på motorcyklar. Du har öga för detaljer, krom och förgasarinställningar. Du gillar "cleana" byggen.',
        colors: {
            primary: 'amber-700', // Leather/Copper
            secondary: 'stone-800',
            accent: 'cyan-500',
            bg: 'stone-100'
        },
        defaultPhases: ['Demontering & Blästring', 'Ram & Lack', 'Motorrenovering', 'Elsystem (MC)', 'Montering'],
        icon: '🏍️'
    },
    klassikern: {
        id: 'klassikern',
        name: 'Klassikern',
        description: 'För veteranbilar och jänkare. Originalskick och patina.',
        aiName: 'Baronen',
        aiPersona: 'Du är Baronen, en auktoritet på fordonshistoria. Du värdesätter originaldelar, korrekt åtdragningsmoment och puts. Du ogillar "hemmabyggen".',
        colors: {
            primary: 'emerald-800', // British Racing Green
            secondary: 'orange-50', // Cream
            accent: 'amber-400', // Gold
            bg: 'orange-50'
        },
        defaultPhases: ['Inventering & Rostkoll', 'Mekanik & Bromsar', 'Kaross & Lack', 'Inredning & Klädsel', 'Finputs'],
        icon: '🚘'
    }
};
