import 'phaser';
import { CollisionStrategy } from 'grid-engine';

import GameScene from './GameScene';
import { LayerType } from './enums/LayerType';
import { Door } from './components/Door';
import { drawDoorCue } from './components/DoorCue';
import { SceneName } from './enums/SceneNames';

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

        this.tilemapJSONPath = '../assets/tilemap/woods_map.json';
        this.imageMapDefaultPath = '../assets/tiles/';
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

    loadObjectImages(): void {
        // No NPCs in the woods yet — nothing extra to load.
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

        // The woods are empty on purpose (for now) — a sign says so, so it reads
        // as "coming soon" instead of "broken / I missed something".
        this.add.text(WoodsScene.START.x * 16 + 8, 14 * 16, 'Wild Elementals\ncoming soon!', {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#eaf4ff',
            align: 'center',
            backgroundColor: 'rgba(16, 32, 58, 0.7)',
            padding: { x: 5, y: 4 },
        }).setOrigin(0.5).setDepth(60).setResolution(3);
    }

    createNpcs(): void {
        // Intentionally empty for now — the woods are for exploring.
    }

    update(): void {
        super.update();
    }
}
