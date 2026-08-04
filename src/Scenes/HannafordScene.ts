import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// Hannaford's grocery (red storefront in town) — placeholder cafe interior art
// for now. Home to Sodium (Sodazoom — the salt aisle). Chlorine has been retired.
export default class HannafordScene extends InteriorScene {
    constructor() {
        super(SceneName.Hannaford, 'cafe-interior.png', ['sodium']);
    }
}
