import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// The Gray auto-repair garage (brown storefront in town) — placeholder interior
// art for now. Home to Magnesium (Magmunch — alloy wheels/flares) and Nitrogen
// (the gas shops pump into tires; still a tinted placeholder, no art yet).
export default class AutoScene extends InteriorScene {
    constructor() {
        super(SceneName.Auto, 'treats-interior.png', ['magnesium', 'nitrogen']);
    }
}
