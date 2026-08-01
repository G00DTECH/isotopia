// The starter Elementals. The first 7 are the Q1 "starter" theme; the last 4
// (Mg, Fe, Ne, U) were added with real character art.
// `monster` names are placeholders from the spec — swap freely once real art lands.
// `tint` is a Phaser tint applied to the placeholder sprite so each monster reads
// as visually distinct until real sprite sheets replace it.

export interface ElementInfo {
    id: string;        // matches question.elementId
    symbol: string;    // periodic-table symbol, e.g. "Na"
    name: string;      // "Sodium"
    monster: string;   // placeholder character name, e.g. "Sodimon"
    number: number;    // atomic number
    tint: number;      // Phaser tint (0xRRGGBB) for the placeholder sprite
}

export const ELEMENTS: ElementInfo[] = [
    { id: 'hydrogen', symbol: 'H',  name: 'Hydrogen', monster: 'Hydromon',  number: 1,  tint: 0x7ec8ff },
    { id: 'helium',   symbol: 'He', name: 'Helium',   monster: 'Heliomon',  number: 2,  tint: 0xffd166 },
    { id: 'carbon',   symbol: 'C',  name: 'Carbon',   monster: 'Carbonmon', number: 6,  tint: 0x9e9e9e },
    { id: 'nitrogen', symbol: 'N',  name: 'Nitrogen', monster: 'Nitromon',  number: 7,  tint: 0x64b5f6 },
    { id: 'oxygen',   symbol: 'O',  name: 'Oxygen',   monster: 'Oxymon',    number: 8,  tint: 0xef5350 },
    { id: 'sodium',   symbol: 'Na', name: 'Sodium',   monster: 'Sodimon',   number: 11, tint: 0xba68c8 },
    { id: 'chlorine', symbol: 'Cl', name: 'Chlorine', monster: 'Chloromon', number: 17, tint: 0xaed581 },
    // Added with real character art (see src/assets/elementals + data/elementalArt.ts).
    { id: 'magnesium', symbol: 'Mg', name: 'Magnesium', monster: 'Magmunch',  number: 12, tint: 0xff8a65 },
    { id: 'iron',      symbol: 'Fe', name: 'Iron',      monster: 'Ferrox',    number: 26, tint: 0x8d6e63 },
    { id: 'neon',      symbol: 'Ne', name: 'Neon',      monster: 'Neono',     number: 10, tint: 0xff7043 },
    { id: 'uranium',   symbol: 'U',  name: 'Uranium',   monster: 'Uranibbit', number: 92, tint: 0x7cb342 },
];

export const ELEMENTS_BY_ID: Record<string, ElementInfo> =
    ELEMENTS.reduce((acc, e) => { acc[e.id] = e; return acc; }, {} as Record<string, ElementInfo>);

export function getElement(id: string): ElementInfo | undefined {
    return ELEMENTS_BY_ID[id];
}
