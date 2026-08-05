// The secret-path cutscene. Stepping onto the lookout at the very top of the
// woods trail freezes the dog and plays a slow, wondering reveal of the distant
// city across the bridge (bridge.png). The bridge is framed by a sunset sky above
// and a dark tree-line below, so it reads as a vista glimpsed through the woods
// rather than an image with hard edges. Tap to head back.

import GlobalInfo from '../GlobalInfo';

let playing = false;

function setDialogue(active: boolean): void {
    GlobalInfo._gameProgress.inDialogue = active;
    GlobalInfo.emit('inDialogue', active);
}

// A dark pine tree-line silhouette (built as an SVG path) that frames the bottom.
function treeLineSvg(): string {
    const W = 1200, H = 260, n = 22, step = W / n, base = H, valley = base - H * 0.16;
    let d = `M0,${valley}`;
    for (let i = 0; i < n; i++) {
        const x = i * step;
        const h = H * (0.4 + ((i * 41) % 100) / 100 * 0.5);   // varied peak heights
        d += ` L${x.toFixed(0)},${valley.toFixed(0)}`
           + ` L${(x + step / 2).toFixed(0)},${(base - h).toFixed(0)}`
           + ` L${(x + step).toFixed(0)},${valley.toFixed(0)}`;
    }
    d += ` L${W},${valley} L${W},${base} L0,${base} Z`;
    return `<svg class="cr-trees" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="#0a1a10"/></svg>`;
}

export function playCityReveal(): void {
    if (playing) return;
    playing = true;
    setDialogue(true);                 // freeze the dog for the cutscene

    const overlay = document.createElement('div');
    overlay.className = 'city-reveal';
    overlay.innerHTML = `
        <div class="cr-sky"></div>
        <img class="cr-bridge" src="assets/city/bridge.png" alt="A view of the distant city across the bridge">
        ${treeLineSvg()}
        <div class="cr-caption"></div>`;
    document.body.appendChild(overlay);
    const caption = overlay.querySelector('.cr-caption') as HTMLElement;

    // Slowly pan out to reveal the whole bridge.
    requestAnimationFrame(() => overlay.classList.add('cr-bridge-in'));

    // Once it has settled, let the player linger, then tap to return.
    const t = window.setTimeout(() => {
        caption.textContent = 'Across the bridge lies a city…   (tap to head back)';
        overlay.addEventListener('click', dismiss);
    }, 9600);

    function dismiss(): void {
        overlay.removeEventListener('click', dismiss);
        clearTimeout(t);
        overlay.classList.add('cr-out');
        window.setTimeout(() => {
            overlay.remove();
            playing = false;
            setDialogue(false);
        }, 700);
    }
}
