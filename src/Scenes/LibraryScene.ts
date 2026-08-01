import { InteriorScene } from './InteriorScene';
import { SceneName } from './enums/SceneNames';

// The Gray Public Library (blue storefront in town) — a quiet study. Home to
// Uranium (Uranibbit — the science-reference heavyweight) and Helium (still a
// tinted placeholder, no art yet).
export default class LibraryScene extends InteriorScene {
    constructor() {
        super(SceneName.Library, 'library-interior.png', ['uranium', 'helium']);
    }
}
