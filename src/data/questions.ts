// Seed question bank — the 21 MCQs from the Q1 spec (§4).
// Shape matches the documented import format (spec §7) so these rows map 1:1 to
// Firestore `questions/{questionId}` documents once Firebase is wired.

export interface Question {
    elementId: string;
    angle: string;          // see spec §3 angle taxonomy: protons, ion, valence, ...
    prompt: string;
    choices: string[];      // exactly 4
    correctIndex: number;   // 0..3
    quarterTheme?: string;
}

export const QUESTIONS: Question[] = [
    // --- Hydromon — Hydrogen (H) ---
    { elementId: 'hydrogen', angle: 'protons',  prompt: 'How many protons does hydrogen have?', choices: ['0', '1', '2', '3'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'hydrogen', angle: 'ion',      prompt: 'What is the charge of a common hydrogen ion (H⁺)?', choices: ['−1', '0', '+1', '+2'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'hydrogen', angle: 'valence',  prompt: 'How many valence electrons does hydrogen have?', choices: ['0', '1', '2', '8'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Heliomon — Helium (He) ---
    { elementId: 'helium', angle: 'protons',  prompt: "Helium's atomic number is 2. How many protons does it have?", choices: ['1', '2', '4', '8'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'helium', angle: 'neutrons', prompt: 'The most common isotope is helium-4. How many neutrons does it have?', choices: ['0', '2', '4', '6'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'helium', angle: 'config',   prompt: 'Which best explains why helium rarely forms ions?', choices: ['It has too many electrons', 'Its outer shell is full', 'It is a metal', 'It has no protons'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Carbonmon — Carbon (C) ---
    { elementId: 'carbon', angle: 'protons',  prompt: 'How many protons does carbon have?', choices: ['4', '6', '8', '12'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'carbon', angle: 'neutrons', prompt: 'Carbon-12 has 6 protons. How many neutrons does it have?', choices: ['6', '12', '0', '18'], correctIndex: 0, quarterTheme: 'starter' },
    { elementId: 'carbon', angle: 'valence',  prompt: 'Carbon has 4 valence electrons. How many covalent bonds does it typically form?', choices: ['1', '2', '4', '6'], correctIndex: 2, quarterTheme: 'starter' },

    // --- Nitromon — Nitrogen (N) ---
    { elementId: 'nitrogen', angle: 'symbol',    prompt: "What is nitrogen's chemical symbol?", choices: ['Ni', 'N', 'Ne', 'Na'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'nitrogen', angle: 'ion',       prompt: 'Nitrogen commonly forms an ion with what charge?', choices: ['+3', '−3', '−1', '+5'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'nitrogen', angle: 'electrons', prompt: 'A neutral nitrogen atom has how many electrons?', choices: ['3', '5', '7', '14'], correctIndex: 2, quarterTheme: 'starter' },

    // --- Oxymon — Oxygen (O) ---
    { elementId: 'oxygen', angle: 'protons', prompt: "Oxygen's atomic number is 8. How many protons does it have?", choices: ['2', '6', '8', '16'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'oxygen', angle: 'ion',     prompt: 'What is the charge of the common oxide ion?', choices: ['+2', '−1', '−2', '+6'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'oxygen', angle: 'valence', prompt: 'How many valence electrons does oxygen have?', choices: ['2', '6', '8', '16'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Sodimon — Sodium (Na) ---
    { elementId: 'sodium', angle: 'symbol',   prompt: "What is sodium's chemical symbol?", choices: ['So', 'Na', 'S', 'Sd'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'sodium', angle: 'neutrons', prompt: 'Sodium-23 has 11 protons. How many neutrons does it have?', choices: ['11', '12', '22', '23'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'sodium', angle: 'ion',      prompt: 'Sodium tends to lose one electron. What ion does it form?', choices: ['Na⁻', 'Na⁺', 'Na²⁺', 'Na (no charge)'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Chloromon — Chlorine (Cl) ---
    { elementId: 'chlorine', angle: 'protons', prompt: 'How many protons does chlorine have?', choices: ['7', '17', '18', '35'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'chlorine', angle: 'ion',     prompt: 'Chlorine gains one electron to form which ion?', choices: ['Cl⁺', 'Cl⁻', 'Cl²⁻', 'Cl (no charge)'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'chlorine', angle: 'mass',    prompt: "Chlorine's atomic mass is about 35.45. Why isn't it a whole number?", choices: ['A rounding error', "It's a weighted average of its isotopes", 'Electrons add mass', 'It has partial protons'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Magmunch — Magnesium (Mg) ---
    { elementId: 'magnesium', angle: 'protons', prompt: "Magnesium's atomic number is 12. How many protons does it have?", choices: ['2', '10', '12', '24'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'magnesium', angle: 'ion',     prompt: 'Magnesium loses 2 electrons. Which ion does it form?', choices: ['Mg⁻', 'Mg⁺', 'Mg²⁺', 'Mg²⁻'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'magnesium', angle: 'valence', prompt: 'How many valence electrons does magnesium have?', choices: ['1', '2', '6', '8'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Ferrox — Iron (Fe) ---
    { elementId: 'iron', angle: 'symbol',  prompt: "What is iron's chemical symbol?", choices: ['Ir', 'In', 'Fe', 'I'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'iron', angle: 'protons', prompt: 'How many protons does iron have?', choices: ['8', '16', '26', '56'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'iron', angle: 'ion',     prompt: 'Iron commonly forms ions with which two charges?', choices: ['−2 and −3', '+2 and +3', '+1 only', '−1 only'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Neono — Neon (Ne) ---
    { elementId: 'neon', angle: 'protons', prompt: "Neon's atomic number is 10. How many protons does it have?", choices: ['2', '8', '10', '20'], correctIndex: 2, quarterTheme: 'starter' },
    { elementId: 'neon', angle: 'symbol',  prompt: "What is neon's chemical symbol?", choices: ['N', 'Ne', 'Na', 'No'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'neon', angle: 'config',  prompt: 'Why is neon a noble gas that rarely reacts?', choices: ['It has 1 valence electron', 'Its outer shell is full', 'It is a metal', 'It has no electrons'], correctIndex: 1, quarterTheme: 'starter' },

    // --- Uranibbit — Uranium (U) ---
    { elementId: 'uranium', angle: 'protons',  prompt: 'How many protons does uranium have?', choices: ['46', '92', '146', '238'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'uranium', angle: 'neutrons', prompt: 'Uranium-238 has 92 protons. How many neutrons does it have?', choices: ['92', '146', '238', '330'], correctIndex: 1, quarterTheme: 'starter' },
    { elementId: 'uranium', angle: 'symbol',   prompt: "What is uranium's chemical symbol?", choices: ['Ur', 'U', 'Un', 'Ux'], correctIndex: 1, quarterTheme: 'starter' },
];

/** All seed questions for one element. */
export function questionsForElement(elementId: string): Question[] {
    return QUESTIONS.filter(q => q.elementId === elementId);
}

/** Pick a random seed question for an element (undefined if none). */
export function randomQuestionForElement(elementId: string): Question | undefined {
    const pool = questionsForElement(elementId);
    if (pool.length === 0) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
}
