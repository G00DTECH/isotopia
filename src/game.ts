import { GridEngine } from "grid-engine";

import HouseScene from "./Scenes/HouseScene";
import TestScene from "./Scenes/TestScene";
import { ensureSignedIn } from "./data/auth";
import { loadQuestionBank } from "./data/questionSource";

// If Firebase is configured: sign the student in anonymously, then pull the live
// question bank. If not (or on any error), the game just keeps the local seed.
(async () => {
    try {
        const uid = await ensureSignedIn();
        await loadQuestionBank();
        console.log(uid
            ? `Isotopia: signed in (${uid.slice(0, 6)}…), questions loaded from Firebase.`
            : "Isotopia: Firebase not configured — using local questions.");
    } catch (err) {
        console.warn("Isotopia: using local questions (Firebase unavailable):", err);
    }
})();

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#ffffff',
    scene: [TestScene, HouseScene],
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            },
        ],
    },
    scale: {
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

const game = new Phaser.Game(config);