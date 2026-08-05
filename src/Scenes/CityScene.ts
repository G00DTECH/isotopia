import 'phaser';
import { CollisionStrategy } from 'grid-engine';

import GameScene from './GameScene';
import { LayerType } from './enums/LayerType';
import { Door } from './components/Door';
import { drawDoorCue } from './components/DoorCue';
import { SceneName } from './enums/SceneNames';
import { MAPS } from '../data/maps';

// The walkable City across the bridge — reached from the woods lookout via the
// city-reveal cutscene. Paved streets with the nine city buildings laid out in
// three rows: overlay art over invisible collision footprints, the same pattern
// as the town. Buildings are decorative for now (not enterable). A glowing
// "WOODS ▼" pad at the bottom returns you to the woods.
//
// Keep BUILDINGS in sync with tools/gen_city.py PLACEMENTS (the collision
// footprints in city_map.json are generated from the same numbers).
const BUILDINGS: { id: string; centerCol: number; baseRow: number; widthTiles: number }[] = [
    { id: 'power-tower',      centerCol: 8,  baseRow: 13, widthTiles: 5.0 },
    { id: 'finance-tower',    centerCol: 22, baseRow: 13, widthTiles: 5.0 },
    { id: 'large-tower',      centerCol: 36, baseRow: 13, widthTiles: 6.0 },
    { id: 'large-church',     centerCol: 8,  baseRow: 29, widthTiles: 5.5 },
    { id: 'museum',           centerCol: 22, baseRow: 29, widthTiles: 5.0 },
    { id: 'fashion-district', centerCol: 36, baseRow: 29, widthTiles: 5.0 },
    { id: 'radio-tower',      centerCol: 9,  baseRow: 45, widthTiles: 3.5 },
    { id: 'power-station',    centerCol: 22, baseRow: 45, widthTiles: 8.0 },
    { id: 'radio-tower-2',    centerCol: 35, baseRow: 45, widthTiles: 3.5 },
];

export default class CityScene extends GameScene {
    private static readonly START = { x: 22, y: 47 };
    private static readonly EXIT = { x: 22, y: 50 };

    constructor() {
        super(SceneName.City, CityScene.START.x, CityScene.START.y, [LayerType.Floor, LayerType.Walls]);

        this.imageNames = {
            Perli: `${SceneName.City}_perli`,
            Veterinary: `${SceneName.City}_veterinary`,
            Map: 'city_map',
        };
        this.tilemapJSONPath = 'assets/tilemap/city_map.json';
        this.mapData = MAPS.city_map;
        this.imageMapDefaultPath = 'assets/tiles/';
        this.imageMapNames = { modern_exterior: { name: 'modern_exterior' } };

        this.gridEngineSettings = {
            startPosition: { ...CityScene.START },
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
        BUILDINGS.forEach(b => this.load.image(`city_${b.id}`, `assets/city/${b.id}.png`));
        // Human pedestrian sprites (grid-engine standard 3x4 layout per person).
        this.load.spritesheet(this.imageNames.Veterinary, 'assets/Characters/NPCs_1.png',
            { frameWidth: 32, frameHeight: 64 });
        // Plaza props.
        this.load.image('city_lamp', 'assets/city/lamp.png');
        this.load.image('city_bench', 'assets/city/bench.png');
    }

    create(): void {
        super.create();

        // Real building art over the invisible collision footprints.
        BUILDINGS.forEach(b => this.drawBuilding(b));

        // Plaza dressing: lit lamps (glow at dusk) + benches around the centre.
        this.drawProp('city_lamp', 20, 36, 1.4);
        this.drawProp('city_lamp', 24, 36, 1.4);
        this.drawProp('city_bench', 20, 38, 1.8);
        this.drawProp('city_bench', 24, 38, 1.8);

        // Way back to the woods lookout (step onto the pad from the north).
        new Door({
            scene: this, xPosition: CityScene.EXIT.x, yPosition: CityScene.EXIT.y,
            nextScene: SceneName.Woods, entryOffset: { dx: 0, dy: -1 },
        });
        drawDoorCue(this, CityScene.EXIT.x, CityScene.EXIT.y - 1, 'WOODS', '▼');
    }

    // Overlay one building: anchored bottom-centre on its base row and scaled so
    // the art spans `widthTiles` tiles (aspect preserved). Depth 1 keeps it above
    // the ground but below the dog (depth 10), so the dog walks in front.
    private drawBuilding(b: { id: string; centerCol: number; baseRow: number; widthTiles: number }): void {
        const key = `city_${b.id}`;
        const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
        const scale = (b.widthTiles * 16) / src.width;
        this.add.image((b.centerCol + 0.5) * 16, (b.baseRow + 1) * 16, key)
            .setOrigin(0.5, 1)
            .setScale(scale)
            .setDepth(1);
    }

    // A decorative prop (lamp, bench…) anchored bottom-centre on a tile, scaled
    // to `tilesWide`. Depth 1 like buildings, so the dog walks in front.
    private drawProp(key: string, col: number, row: number, tilesWide: number): void {
        const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
        const scale = (tilesWide * 16) / src.width;
        this.add.image((col + 0.5) * 16, (row + 1) * 16, key)
            .setOrigin(0.5, 1)
            .setScale(scale)
            .setDepth(1);
    }

    createNpcs(): void {
        // Pedestrians wandering the streets + plaza — (charIndex, col, row). All
        // on clearly walkable tiles (roads / open plaza) so they roam freely.
        const people: [number, number, number][] = [
            [0, 7, 15], [1, 36, 15],   // top street
            [2, 7, 31], [3, 36, 31],   // middle street
            [4, 20, 36], [5, 23, 36],  // plaza
            [6, 10, 48], [7, 34, 48],  // front street
        ];
        people.forEach(([i, x, y]) => this.spawnPedestrian(i, x, y));

        // A few characters who say hello when you walk up to them.
        this.spawnTalkingNpc(1, 22, 40, 'City Guide', [
            'Welcome to the city! It grew from every element you catch.',
            'Have a wander — there is more to come here soon.',
        ]);
        this.spawnTalkingNpc(3, 13, 43, 'Professor', [
            'Look around: concrete, steel, glass, neon…',
            'Every bit of this city is chemistry at work!',
        ]);
        this.spawnTalkingNpc(5, 31, 43, 'City Kid', [
            'Whoa, a dog downtown!',
            'Did you see the towers? They are HUGE.',
        ]);
    }

    update(): void {
        super.update();
    }
}
