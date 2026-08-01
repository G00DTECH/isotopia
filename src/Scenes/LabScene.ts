import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// The Lab (blue storefront in town) — a Luna Town library/study. Home to two
// Elementals.
export default class LabScene extends InteriorScene {
    constructor() {
        super(SceneName.Lab, 'library-interior.png', ['oxygen', 'nitrogen']);
    }
}
