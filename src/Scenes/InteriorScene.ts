import 'phaser';
import { CollisionStrategy } from 'grid-engine';

import GameScene from './GameScene';
import { LayerType } from './enums/LayerType';
import { Door } from './components/Door';
import { SceneName } from './enums/SceneNames';

// A building interior you reach from the town. The room art is a single Luna
// Town background image; a shared 16x16 collision grid (interior_room.json)
// keeps the dog on the visible white floor. Every interior has an EXIT door
// back to the town, so "there is an exit for each room".
//
// Grid layout (see tools/gen_interior.py): walkable cols 3-11, rows 10-13.
export abstract class InteriorScene extends GameScene {
    private static readonly START = { x: 7, y: 10 };
    private static readonly EXIT = { x: 7, y: 13 };
    private static readonly SPAWN_TILES = [
        { x: 4, y: 11 },
        { x: 10, y: 11 },
    ];

    private readonly elementIds: string[];
    private readonly backgroundKey: string;
    private readonly backgroundPath: string;

    constructor(sceneName: SceneName, backgroundFile: string, elementIds: string[]) {
        super(sceneName, InteriorScene.START.x, InteriorScene.START.y, [LayerType.Floor, LayerType.Walls]);
        this.elementIds = elementIds;
        this.backgroundKey = `${sceneName}_bg`;
        this.backgroundPath = `../assets/rooms/${backgroundFile}`;

        this.imageNames = {
            Perli: `${sceneName}_perli`,
            Veterinary: `${sceneName}_veterinary`,
            Map: `${sceneName}_room`,
        };

        this.tilemapJSONPath = '../assets/tilemap/interior_room.json';
        this.imageMapDefaultPath = '../assets/tiles/';
        this.imageMapNames = {
            blank16: { name: 'blank16' },
        };

        this.gridEngineSettings = {
            startPosition: { ...InteriorScene.START },
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
        this.load.image(this.backgroundKey, this.backgroundPath);
    }

    loadObjectImages(): void {
        this.load.spritesheet(this.imageNames.Veterinary,
            '../assets/Characters/NPCs_1.png',
            { frameWidth: 32, frameHeight: 64 });
        this.loadElementalArt(this.elementIds);
    }

    create(): void {
        super.create();

        // The room art, stretched to cover the whole collision grid and sat
        // behind every sprite.
        this.add.image(0, 0, this.backgroundKey)
            .setOrigin(0, 0)
            .setDisplaySize(this.map.widthInPixels, this.map.heightInPixels)
            .setDepth(-100);

        // EXIT back to town, labelled like every other door.
        const door = new Door({
            scene: this, xPosition: InteriorScene.EXIT.x, yPosition: InteriorScene.EXIT.y,
            nextScene: SceneName.Test,
        });
        this.addFloatingLabel(door.name, 'EXIT ▶', '#ffe066');
    }

    createNpcs(): void {
        this.elementIds.forEach((id, i) => {
            const tile = InteriorScene.SPAWN_TILES[i];
            if (!tile) return;
            this.spawnElemental(id, tile.x, tile.y);
        });
    }

    update(): void {
        super.update();
    }
}
