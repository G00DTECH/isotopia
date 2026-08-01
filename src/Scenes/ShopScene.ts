import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// The Shop (red storefront in town) — a Luna Town treats shop. Home to two
// Elementals.
export default class ShopScene extends InteriorScene {
    constructor() {
        super(SceneName.Shop, 'treats-interior.png', ['sodium', 'chlorine']);
    }
}
