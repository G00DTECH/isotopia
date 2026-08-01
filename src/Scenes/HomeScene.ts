import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// HOME (brown storefront in town) — the player's cozy Gray, Maine house. No
// Elementals live here; it's the trainer's home base, with an EXIT back to town.
export default class HomeScene extends InteriorScene {
    constructor() {
        super(SceneName.Home, 'home-interior.png', []);
    }
}
