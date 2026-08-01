import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// The Gray Hardware Store (red storefront in town) — placeholder interior art
// for now. Home to Iron (Ferrox — nails, tools, steel) and Carbon (Carbbit —
// graphite, charcoal).
export default class HardwareScene extends InteriorScene {
    constructor() {
        super(SceneName.Hardware, 'treats-interior.png', ['iron', 'carbon']);
    }
}
