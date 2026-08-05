import 'phaser';
import { CollisionStrategy } from 'grid-engine';

import GameScene from './GameScene';
import { LayerType } from './enums/LayerType';
import { Door } from './components/Door';
import { drawDoorCue } from './components/DoorCue';
import { SceneName } from './enums/SceneNames';
import { MAPS } from '../data/maps';
import GlobalInfo from '../GlobalInfo';
import { playCityReveal } from '../ui/CityReveal';

// The North Woods & Meadow — a natural area reached by following the trail north
// out of town (see the Woods door in TestScene). The whole scene is built from
// modern_exterior tiles by tools/gen_woods.py: tree groves frame the edges, a
// wildflower meadow and walkable tall-grass patches fill the middle, and a
// cobblestone trail runs to the south exit back to town. No NPCs yet — it's here
// to explore (populate with wild Elementals later).
export default class WoodsScene extends GameScene {
    // South exit back to town, and where the player arrives when entering.
    private static readonly EXIT = { x: 20, y: 23 };
    private static readonly START = { x: 20, y: 21 };

    constructor() {
        super(SceneName.Woods, WoodsScene.START.x, WoodsScene.START.y,
            [LayerType.Floor, LayerType.Walls]);

        this.imageNames = {
            Perli: `${SceneName.Woods}_perli`,
            Veterinary: `${SceneName.Woods}_veterinary`,
            Map: 'woods_map',
        };

        this.tilemapJSONPath = 'assets/tilemap/woods_map.json';
        this.imageMapDefaultPath = 'assets/tiles/';
        this.mapData = MAPS.woods_map;
        this.imageMapNames = {
            modern_exterior: { name: 'modern_exterior' },
        };

        this.gridEngineSettings = {
            startPosition: { ...WoodsScene.START },
            scale: 5,
            characterCollisionStrategy: CollisionStrategy.BLOCK_ONE_TILE_AHEAD,
            layerOverlay: false,
        };
    }

    preload(): void {
        super.preload();
        super.loadAvatarSpritesheet();
        super.loadMapImages();
        this.loadObjectImages();
    }

    // The wild Elementals that roam the woods (each has real art).
    private static readonly WILD: { elementId: string; x: number; y: number }[] = [
        { elementId: 'oxygen',   x: 16, y: 8 },    // up north in the meadow
        { elementId: 'nitrogen', x: 25, y: 10 },   // in the tall grass
        { elementId: 'carbon',   x: 17, y: 15 },   // lower clearing
    ];

    // Walkable tall-grass GIDs (from tools/gen_woods.py: TALL1/TALL2), and the
    // pool of wild Elementals that can ambush you when you step through them.
    private static readonly GRASS_GIDS = [1852, 1853];
    private static readonly GRASS_POOL = ['oxygen', 'nitrogen', 'carbon', 'hydrogen'];

    loadObjectImages(): void {
        this.loadElementalArt(WoodsScene.WILD.map(w => w.elementId));
        // Neonu Reeves, the disco bug — now your woods companion.
        this.load.image('neonu_reeves', 'assets/elementals/neonu-reeves.png');
    }

    create(): void {
        super.create();

        // Trail back to town at the south edge; the walkable meadow is to the
        // north, so the entrance pad is the tile to the north (approach from
        // above and step onto it to leave). A glowing "TOWN ▼" pad marks it.
        new Door({
            scene: this, xPosition: WoodsScene.EXIT.x, yPosition: WoodsScene.EXIT.y,
            nextScene: SceneName.Test, entryOffset: { dx: 0, dy: -1 },
        });
        drawDoorCue(this, WoodsScene.EXIT.x, WoodsScene.EXIT.y - 1, 'TOWN', '▼');

        // Wild Elementals ambush you in the tall grass, Pokémon-style.
        this.enableGrassEncounters(WoodsScene.GRASS_POOL, WoodsScene.GRASS_GIDS);

        // Secret lookout: walk up the hidden corridor (column 20) to the very top
        // of the woods to trigger the city-reveal cutscene.
        const cityReveal = this.gridEngine.movementStopped().subscribe((o) => {
            if (o.charId !== this.playerName) return;
            if (GlobalInfo._gameProgress.inDialogue) return;
            const p = this.gridEngine.getPosition(this.playerName);
            if (p.x === 20 && p.y <= 1) playCityReveal(() => this.switch(SceneName.City));
        });
        this.events.once('shutdown', () => cityReveal.unsubscribe());
    }

    createNpcs(): void {
        // Wild Elementals roaming the meadow — walk up to any to start its quiz.
        WoodsScene.WILD.forEach(w => this.spawnElemental(w.elementId, w.x, w.y));

        // Neonu Reeves waits near the entrance; talk to him and he tags along.
        this.spawnCompanionNpc('neonu_reeves', 20, 19, 'Neonu Reeves', [
            'Yo yo yo! Neonu Reeves — grooviest bug in the whole meadow.',
            "You're out catchin' Elementals? Righteous. These woods are crawlin' with 'em.",
            "Tell you what: I'll tag along and keep the vibes high. Let's boogie!",
        ]);
    }

    update(): void {
        super.update();
    }
}
