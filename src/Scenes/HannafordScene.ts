import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// Hannaford's grocery (red storefront in town) — placeholder cafe interior art
// for now. Home to the salt-aisle pair, Sodium and Chlorine (table salt, NaCl).
export default class HannafordScene extends InteriorScene {
    constructor() {
        super(SceneName.Hannaford, 'cafe-interior.png', ['sodium', 'chlorine']);
    }
}
