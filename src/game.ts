import { GridEngine } from "grid-engine";

import TestScene from "./Scenes/TestScene";
import HomeScene from "./Scenes/HomeScene";
import HardwareScene from "./Scenes/HardwareScene";
import HannafordScene from "./Scenes/HannafordScene";
import AutoScene from "./Scenes/AutoScene";
import LibraryScene from "./Scenes/LibraryScene";
import WoodsScene from "./Scenes/WoodsScene";
import { ensureSignedIn } from "./data/auth";
import { loadQuestionBank } from "./data/questionSource";
import { initIsotopedex } from "./ui/Isotopedex";
import { initIntro } from "./ui/Intro";

// Mount the persistent Isotopedex corner button (independent of Phaser scenes)
// and the first-run "how to play" card + "?" help button.
initIsotopedex();
initIntro();

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
    // Crisp upscaling of the pixel art now that FIT stretches the canvas to fill
    // an iPad screen (default linear filtering would blur it).
    pixelArt: true,
    scene: [TestScene, HomeScene, HardwareScene, HannafordScene, AutoScene, LibraryScene, WoodsScene],
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
        // FIT scales the 600×600 game up to fill the device screen while keeping
        // its aspect ratio — on an iPad the fixed box would otherwise sit tiny
        // in the middle. CENTER_BOTH keeps it centred within any letterboxing.
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        // 4:3 to match the iPad screen (landscape), so FIT barely letterboxes
        // instead of leaving big bars beside a square. Interiors bump their
        // camera zoom to fill the wider view (see InteriorScene).
        width: 800,
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
