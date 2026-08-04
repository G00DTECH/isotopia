// The Isotopedex: a persistent corner button that opens the student's creature
// collection. Each of the 11 Elementals gets a card whose detail unlocks as it's
// Seen (encountered) then Caught (answered correctly) — see data/progress.ts.
//
// Pure DOM (like QuizOverlay) so it renders crisply on a projector/iPad and sits
// above the Phaser canvas. It lives outside the scenes, so the button persists
// across every room; the overlay is rebuilt on each open to reflect progress.

import GlobalInfo from '../GlobalInfo';
import { ELEMENTS, ElementInfo } from '../data/elements';
import { statusOf, counts } from '../data/progress';
import { elementalArtKey } from '../data/elementalArt';

let overlay: HTMLDivElement | null = null;

// Freeze the dog while the dex is open, via the shared flag the movement +
// proximity systems already watch.
function setDialogue(active: boolean): void {
    GlobalInfo._gameProgress.inDialogue = active;
    GlobalInfo.emit('inDialogue', active);
}

// Create the corner button once the DOM is ready. Safe to call at startup.
export function initIsotopedex(): void {
    const mount = (): void => {
        if (document.getElementById('dex-button')) return;   // already mounted
        const btn = document.createElement('button');
        btn.id = 'dex-button';
        btn.className = 'dex-button';
        btn.setAttribute('aria-label', 'Open your Isotopedex');
        btn.title = 'Isotopedex';
        btn.innerHTML = `
            <span class="dex-lens"></span>
            <span class="dex-dots"><i></i><i></i><i></i></span>
            <span class="dex-btn-label">DEX</span>`;
        btn.addEventListener('click', openIsotopedex);
        document.body.appendChild(btn);
    };
    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);
}

export function openIsotopedex(): void {
    if (overlay) return;
    setDialogue(true);

    const c = counts();
    const total = ELEMENTS.length;

    overlay = document.createElement('div');
    overlay.className = 'dex-overlay';
    overlay.innerHTML = `
        <div class="dex-panel">
            <div class="dex-header">
                <span class="dex-title">Isotopedex</span>
                <span class="dex-counts">
                    <b>${c.caught}</b>/${total} caught &nbsp;·&nbsp; <b>${c.seen}</b>/${total} discovered
                </span>
                <button class="dex-close" aria-label="Close">✕</button>
            </div>
            <div class="dex-grid"></div>
        </div>`;

    const grid = overlay.querySelector('.dex-grid') as HTMLDivElement;
    // Ordered by atomic number, like a periodic-table index.
    [...ELEMENTS]
        .sort((a, b) => a.number - b.number)
        .forEach(el => grid.appendChild(makeCard(el)));

    overlay.querySelector('.dex-close')!.addEventListener('click', closeIsotopedex);
    // Click the dark backdrop (but not the panel) to close.
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeIsotopedex();
    });

    // Hidden teacher entrance: press and hold the "Isotopedex" title for ~1s to
    // open the teacher portal. Students tap cards, not hold the title, so they
    // won't stumble into it — and it's gated by Google login + the teacher claim
    // anyway. A gold underline fills while holding to signal it's working.
    const title = overlay.querySelector('.dex-title') as HTMLElement;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelHold = (): void => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = undefined; }
        title.classList.remove('holding');
    };
    title.addEventListener('pointerdown', () => {
        title.classList.add('holding');
        holdTimer = setTimeout(() => { window.location.href = 'teacher.html'; }, 1000);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
        title.addEventListener(ev, cancelHold));

    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
}

function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
        closeIsotopedex();
        e.preventDefault();
    }
}

export function closeIsotopedex(): void {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    overlay = null;
    setDialogue(false);
}

// One creature card. Unseen → dark silhouette + "???"; seen/caught reveal the
// art, names and atomic-structure facts. Caught gets a gold ✓ badge.
function makeCard(el: ElementInfo): HTMLDivElement {
    const status = statusOf(el.id);
    const known = status !== 'unseen';

    const card = document.createElement('div');
    card.className = `dex-card dex-${status}`;

    // Portrait: real art if the Elemental has a PNG, otherwise a tinted disc
    // showing its symbol. CSS silhouettes either one while it's unseen.
    // Meaningful alt text for screen readers (hidden creatures stay hidden).
    const alt = known ? `${el.monster}, the ${el.name} Elemental` : 'Undiscovered Elemental';
    const artKey = elementalArtKey(el.id);
    const portrait = artKey
        ? `<img class="dex-art" src="assets/elementals/${el.id}.png" alt="${alt}">`
        : `<div class="dex-art dex-art-disc" style="--tint:#${el.tint.toString(16).padStart(6, '0')}" role="img" aria-label="${alt}">${el.symbol}</div>`;

    const badge =
        status === 'caught' ? `<div class="dex-badge caught">✓ Caught</div>`
        : status === 'seen' ? `<div class="dex-badge seen">Seen</div>`
        : `<div class="dex-badge locked">Undiscovered</div>`;

    card.innerHTML = `
        <div class="dex-num">#${el.number}</div>
        <div class="dex-portrait">${portrait}</div>
        <div class="dex-name">${known ? el.monster : '???'}</div>
        <div class="dex-el">${known ? `${el.symbol} · ${el.name}` : '— — —'}</div>
        <div class="dex-stats">${known
            ? `Atomic #${el.number}<br>Protons ${el.number} · Electrons ${el.number}`
            : 'Find and meet it to reveal!'}</div>
        ${badge}`;
    return card;
}
