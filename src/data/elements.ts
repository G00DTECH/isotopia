// The starter Elementals. `monster` is the creature's silly display name —
// original, copyright-safe names (no "-mon" suffix) so this can be open-sourced.
// `tint` is a Phaser tint applied to the placeholder sprite so each creature
// reads as visually distinct until real sprite sheets replace it.

export interface ElementInfo {
    id: string;        // matches question.elementId
    symbol: string;    // periodic-table symbol, e.g. "Na"
    name: string;      // "Sodium"
    monster: string;   // silly display name, e.g. "Sodazoom"
    number: number;    // atomic number
    tint: number;      // Phaser tint (0xRRGGBB) for the placeholder sprite
}

export const ELEMENTS: ElementInfo[] = [
    { id: 'hydrogen', symbol: 'H',  name: 'Hydrogen', monster: 'Hydrohop',    number: 1,  tint: 0x7ec8ff },
    { id: 'carbon',   symbol: 'C',  name: 'Carbon',   monster: 'Carbocrunch', number: 6,  tint: 0x9e9e9e },
    { id: 'nitrogen', symbol: 'N',  name: 'Nitrogen', monster: 'Nitronoodle', number: 7,  tint: 0x64b5f6 },
    { id: 'oxygen',   symbol: 'O',  name: 'Oxygen',   monster: 'Oxypuff',     number: 8,  tint: 0xef5350 },
    { id: 'sodium',   symbol: 'Na', name: 'Sodium',   monster: 'Sodazoom',    number: 11, tint: 0xba68c8 },
    // Added with real character art (see src/assets/elementals + data/elementalArt.ts).
    { id: 'magnesium', symbol: 'Mg', name: 'Magnesium', monster: 'Magflash',  number: 12, tint: 0xff8a65 },
    { id: 'iron',      symbol: 'Fe', name: 'Iron',      monster: 'Ironclank', number: 26, tint: 0x8d6e63 },
    { id: 'neon',      symbol: 'Ne', name: 'Neon',      monster: 'Neonglow',  number: 10, tint: 0xff7043 },
    { id: 'uranium',   symbol: 'U',  name: 'Uranium',   monster: 'Glowbun',   number: 92, tint: 0x7cb342 },
];

export const ELEMENTS_BY_ID: Record<string, ElementInfo> =
    ELEMENTS.reduce((acc, e) => { acc[e.id] = e; return acc; }, {} as Record<string, ElementInfo>);

export function getElement(id: string): ElementInfo | undefined {
    return ELEMENTS_BY_ID[id];
}
