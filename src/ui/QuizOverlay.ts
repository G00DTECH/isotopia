// DOM-based battle-style quiz shown when the dog trainer walks up to an
// Elemental. Styled after a Game Boy Advance Pokémon battle: the wild Elemental
// slides in on a platform (top-right), your dog stands opposite (bottom-left),
// and a bordered pixel-font textbox types out "A wild X appeared!" then the
// multiple-choice question. Rendered as an HTML overlay on top of the Phaser
// canvas so it's easy to style and read on a classroom projector / iPad.

import GlobalInfo from '../GlobalInfo';
import { getQuestion } from '../data/questionSource';
import { markSeen, markCaught } from '../data/progress';
import { getElement } from '../data/elements';
import { elementalArtKey } from '../data/elementalArt';

let isOpen = false;
let firstFightReacted = false;

// Freeze / unfreeze the dog by toggling the shared `inDialogue` flag that the
// movement + interaction systems already listen for.
function setDialogue(active: boolean): void {
    GlobalInfo._gameProgress.inDialogue = active;
    GlobalInfo.emit('inDialogue', active);
}

// On the very first encounter, briefly pop the pixel dog as a reaction image.
// It sits above the quiz but ignores pointer events, then removes itself.
function showDogReaction(): void {
    const reaction = document.createElement('div');
    reaction.className = 'dog-reaction';
    reaction.innerHTML = `
        <img src="assets/images/pixel-dog.png" alt="Your dog reacts">
        <div class="dog-reaction-caption">Woof! Your first Elemental!</div>`;
    document.body.appendChild(reaction);
    setTimeout(() => reaction.remove(), 2400);   // matches the CSS animation
}

// 0xRRGGBB Phaser tint -> "#rrggbb" for the no-art fallback disc.
function hexColor(tint: number): string {
    return '#' + tint.toString(16).padStart(6, '0');
}

// Types `text` into `el` one char at a time. Returns a function that, when
// called, instantly finishes the current line (tap-to-skip) and fires `done`.
function typewriter(el: HTMLElement, text: string, done?: () => void): () => void {
    el.textContent = '';
    let i = 0;
    let finished = false;
    const timer = window.setInterval(step, 18);
    function step(): void {
        if (i >= text.length) return finish();
        el.textContent += text[i++];
    }
    function finish(): void {
        if (finished) return;
        finished = true;
        window.clearInterval(timer);
        el.textContent = text;
        done?.();
    }
    return finish;
}

export async function openQuiz(elementId: string): Promise<void> {
    if (isOpen) return;
    const element = getElement(elementId);
    const question = await getQuestion(elementId);
    if (!element || !question) return;

    isOpen = true;
    setDialogue(true);

    if (!firstFightReacted) {
        firstFightReacted = true;
        showDogReaction();
    }

    // The wild Elemental's sprite (real art if it has any, else a tinted disc
    // with its symbol — mirrors the Isotopedex fallback).
    const hasArt = elementalArtKey(elementId) !== undefined;
    const enemyArt = hasArt
        ? `<img class="battle-sprite" src="assets/elementals/${elementId}.png" alt="${element.monster}">`
        : `<div class="battle-sprite battle-sprite--disc" style="background:${hexColor(element.tint)}">${element.symbol}</div>`;

    const overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    overlay.innerHTML = `
        <div class="quiz-card battle">
            <button class="quiz-x" aria-label="Close without answering">✕</button>
            <div class="battle-scene">
                <div class="battle-info battle-info--enemy">
                    <span class="battle-name">${element.monster}</span>
                    <span class="battle-elem">${element.symbol} · ${element.name}</span>
                </div>
                <div class="battle-enemy">
                    <div class="battle-platform"></div>
                    ${enemyArt}
                </div>
                <div class="battle-player">
                    <div class="battle-platform"></div>
                    <img class="battle-sprite battle-sprite--dog" src="assets/images/pixel-dog.png" alt="Your dog">
                </div>
            </div>
            <div class="battle-textbox">
                <div class="battle-text"></div>
                <span class="battle-arrow" hidden>▼</span>
                <div class="quiz-choices" hidden></div>
                <div class="quiz-feedback"></div>
                <div class="quiz-actions">
                    <button class="quiz-retry" hidden>↻ Try again</button>
                    <button class="quiz-continue" hidden>Continue ▶</button>
                </div>
            </div>
        </div>`;

    const textEl = overlay.querySelector('.battle-text') as HTMLDivElement;
    const arrowEl = overlay.querySelector('.battle-arrow') as HTMLSpanElement;
    const textboxEl = overlay.querySelector('.battle-textbox') as HTMLDivElement;
    const choicesEl = overlay.querySelector('.quiz-choices') as HTMLDivElement;
    const feedbackEl = overlay.querySelector('.quiz-feedback') as HTMLDivElement;
    const continueBtn = overlay.querySelector('.quiz-continue') as HTMLButtonElement;
    const retryBtn = overlay.querySelector('.quiz-retry') as HTMLButtonElement;

    const buttons: HTMLButtonElement[] = question.choices.map((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-choice';
        btn.innerHTML = `<span class="quiz-key">${i + 1}</span> ${choice}`;
        btn.addEventListener('click', () => answer(i));
        choicesEl.appendChild(btn);
        return btn;
    });

    // ---- Battle intro -> question, driven by typewriter + a tappable textbox.
    type Stage = 'intro' | 'question' | 'answered';
    let stage: Stage = 'intro';
    let skip: () => void = () => {};      // finishes the current typewriter line
    let answered = false;

    function startIntro(): void {
        stage = 'intro';
        arrowEl.hidden = true;
        skip = typewriter(textEl, `A wild ${element!.monster} appeared!`, () => {
            arrowEl.hidden = false;       // blink ▼ to prompt a tap
        });
    }

    function showQuestion(): void {
        stage = 'question';
        arrowEl.hidden = true;
        skip = typewriter(textEl, question!.prompt, () => {
            choicesEl.hidden = false;     // reveal the answer menu once typed
        });
    }

    // Tapping the textbox skips the current line, then advances intro -> question.
    function advance(): void {
        skip();                            // finish typing first
        if (stage === 'intro') showQuestion();
    }
    textboxEl.addEventListener('click', (e) => {
        // Don't hijack taps on the actual choice/action buttons.
        if ((e.target as HTMLElement).closest('button')) return;
        advance();
    });

    function answer(index: number): void {
        if (answered) return;
        answered = true;
        stage = 'answered';
        const correct = index === question!.correctIndex;

        // Mark answers with a glyph as well as colour, so the correct/wrong
        // signal doesn't rely on green-vs-red (colour-blind students).
        buttons.forEach((b, i) => {
            b.disabled = true;
            if (i === question!.correctIndex) {
                b.classList.add('correct');
                b.insertAdjacentHTML('beforeend', ' <span class="quiz-mark">✓</span>');
            } else if (i === index) {
                b.classList.add('wrong');
                b.insertAdjacentHTML('beforeend', ' <span class="quiz-mark">✗</span>');
            }
        });

        const answerText = question!.choices[question!.correctIndex];
        feedbackEl.textContent = correct
            ? `Caught it! ${element!.monster} joined your Isotopedex. 🎉`
            : `So close! The answer is "${answerText}" ✓. Tap Try again to catch ${element!.monster}!`;
        feedbackEl.classList.add(correct ? 'ok' : 'no');

        // A correct answer catches the Elemental (adds its card); any encounter
        // at least counts it as Seen (spec §4.2). markCaught also marks it seen.
        if (correct) {
            markCaught(elementId);
            overlay.querySelector('.battle-enemy')?.classList.add('caught');
        } else {
            markSeen(elementId);
            retryBtn.hidden = false;   // let them retry without walking away
        }
        continueBtn.hidden = false;
        (correct ? continueBtn : retryBtn).focus();
    }

    function close(): void {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        isOpen = false;
        setDialogue(false);
    }

    function onKey(e: KeyboardEvent): void {
        if (stage === 'question' && !choicesEl.hidden && !answered
            && e.key >= '1' && e.key <= String(question!.choices.length)) {
            answer(parseInt(e.key, 10) - 1);
            e.preventDefault();
        } else if (stage === 'answered' && (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ')) {
            close();
            e.preventDefault();
        } else if (stage !== 'answered' && (e.key === 'Enter' || e.key === ' ')) {
            advance();               // tap-to-advance equivalent on desktop
            e.preventDefault();
        }
    }

    continueBtn.addEventListener('click', close);
    // Try again: reopen a fresh question for the same Elemental (a wrong answer
    // already recorded it as Seen; getQuestion picks a new one).
    retryBtn.addEventListener('click', () => { close(); void openQuiz(elementId); });
    // ✕ lets a student back out of a quiz they didn't mean to start (iPads have
    // no keyboard, so this is the only non-answer way out). The Elemental stays
    // de-armed until they step away, so it won't instantly reopen.
    (overlay.querySelector('.quiz-x') as HTMLButtonElement).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);

    startIntro();
}
