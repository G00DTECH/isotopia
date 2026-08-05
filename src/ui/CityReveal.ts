// The secret-path cutscene. Stepping onto the lookout at the very top of the
// woods trail freezes the dog and plays a slow, wondering reveal: pan out to
// show the whole distant bridge/skyline (bridge.png), fade to black, then reveal
// the full city (all the city buildings), then tap to head back to the woods.
// Pure DOM overlay, so it fills the screen crisply on any device.

import GlobalInfo from '../GlobalInfo';

let playing = false;

function setDialogue(active: boolean): void {
    GlobalInfo._gameProgress.inDialogue = active;
    GlobalInfo.emit('inDialogue', active);
}

export function playCityReveal(): void {
    if (playing) return;
    playing = true;
    setDialogue(true);                 // freeze the dog for the cutscene

    const overlay = document.createElement('div');
    overlay.className = 'city-reveal';
    overlay.innerHTML = `
        <img class="cr-bridge" src="assets/city/bridge.png" alt="A view of the distant city across the bridge">
        <img class="cr-city" src="assets/city/city-skyline.png" alt="The city skyline">
        <div class="cr-black"></div>
        <div class="cr-caption"></div>`;
    document.body.appendChild(overlay);
    const caption = overlay.querySelector('.cr-caption') as HTMLElement;

    // Phase 1 — the bridge slowly pans out to reveal the whole image.
    requestAnimationFrame(() => overlay.classList.add('cr-bridge-in'));

    // Phase 2 — fade to black over the bridge.
    const t2 = window.setTimeout(() => overlay.classList.add('cr-to-black'), 4600);

    // Phase 3 — reveal the full city with a slow drift.
    const t3 = window.setTimeout(() => {
        overlay.classList.add('cr-city-in');
        caption.textContent = 'The city awaits…';
    }, 6000);

    // Phase 4 — let the player tap to return to the woods.
    const t4 = window.setTimeout(() => {
        caption.textContent = 'The city awaits…   (tap to head back)';
        overlay.addEventListener('click', dismiss);
    }, 8500);

    function dismiss(): void {
        overlay.removeEventListener('click', dismiss);
        [t2, t3, t4].forEach(clearTimeout);
        overlay.classList.add('cr-out');
        window.setTimeout(() => {
            overlay.remove();
            playing = false;
            setDialogue(false);
        }, 700);
    }
}
