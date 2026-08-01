import { Npc } from './components/Npc';
import { SceneName } from './enums/SceneNames';
import { Door } from './components/Door';
import { CollisionStrategy } from 'grid-engine';
import GameScene from "./GameScene"
import { LayerType } from './enums/LayerType';
import { getElement } from '../data/elements';
import { openQuiz } from '../ui/QuizOverlay';

// Where each starter Elemonster stands in the town (walkable tiles, clear of the
// player start (4,4) and the house door (7,7)).
const MONSTER_SPAWNS: { elementId: string; x: number; y: number }[] = [
    { elementId: 'hydrogen', x: 3,  y: 7 },
    { elementId: 'helium',   x: 6,  y: 8 },
    { elementId: 'carbon',   x: 9,  y: 7 },
    { elementId: 'nitrogen', x: 3,  y: 11 },
    { elementId: 'oxygen',   x: 6,  y: 11 },
    { elementId: 'sodium',   x: 9,  y: 11 },
    { elementId: 'chlorine', x: 12, y: 9 },
];


export default class TestScene extends GameScene {
    constructor() {
        super(SceneName.Test, 4, 4, [LayerType.Floor, LayerType.Walls, LayerType.Furnitures])

        this.imageNames = {
            Perli: `${SceneName.Test}_perli`,
            Veterinary: 'test_veterinary',
            Map: 'test_map',
        }

        this.tilemapJSONPath = '../assets/tilemap/test_map.json'
        this.imageMapDefaultPath = '../assets/tiles/'
        this.imageMapNames = {
            Basement_16x16: {
                name: "Basement_16x16",
            },
        }

        this.gridEngineSettings = {
            startPosition: {
                x: 4,
                y: 4
            },
            scale: 5,
            characterCollisionStrategy: CollisionStrategy.BLOCK_ONE_TILE_AHEAD,
            layerOverlay: false
        }
    }

    preload(): void {
        super.preload()
        super.loadAvatarSpritesheet()
        super.loadMapImages()
        this.loadObjectImages()
    }

    loadObjectImages(): void {
        this.load.spritesheet(
            this.imageNames.Veterinary,
            '../assets/Characters/NPCs_1.png',
            {
                frameWidth: 32,
                frameHeight: 64
            }
        )
    }

    create(): void {
        super.create()

        // Exit door to the house — labelled so players know where to leave.
        const door = new Door({
            scene: this, xPosition: 7, yPosition: 7, nextScene: SceneName.House
        })
        this.addFloatingLabel(door.name, 'EXIT ▶', '#ffe066')
    }

    createNpcs(): void {

        // One monster NPC per starter element. Face it and press E to start its
        // quiz. A floating element symbol makes each one identifiable.
        MONSTER_SPAWNS.forEach(spawn => {
            const element = getElement(spawn.elementId);
            if (!element) return;

            const monster = new Npc({
                scene: this,
                xPosition: spawn.x,
                yPosition: spawn.y,
                texture: this.imageNames.Veterinary,
                scale: 0.7,
                tint: element.tint,
                action: () => { openQuiz(spawn.elementId); },
                walkingAnimationMapping: 0,
            });
            this.addFloatingLabel(monster.name, element.symbol, '#ffffff');
        });
    }

    // Places a small always-on text label above a character (monster or door).
    private addFloatingLabel(charName: string, text: string, color: string): void {
        const sprite = this.gridEngine.getSprite(charName);
        if (!sprite) return;
        const top = sprite.getTopCenter();
        this.add.text(top.x, top.y - 2, text, {
            fontFamily: 'monospace',
            fontSize: '9px',
            color,
            backgroundColor: '#000000aa',
            padding: { x: 2, y: 1 },
        }).setOrigin(0.5, 1).setDepth(9999);
    }

    update(): void {
        super.update()
    }
}