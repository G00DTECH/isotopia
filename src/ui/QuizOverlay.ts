// DOM-based multiple-choice quiz modal shown when the dog trainer talks to an
// Elemonster. Rendered as an HTML overlay on top of the Phaser canvas so it's
// easy to style and read on a classroom projector.

import GlobalInfo from '../GlobalInfo';
import { getQuestion } from '../data/questionSource';
import { markSeen, markCaught } from '../data/progress';
import { getElement } from '../data/elements';

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

    const overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    overlay.innerHTML = `
        <div class="quiz-card">
            <button class="quiz-x" aria-label="Close without answering">✕</button>
            <div class="quiz-monster">A wild <strong>${element.monster}</strong> appeared!</div>
            <div class="quiz-element">${element.symbol} · ${element.name}</div>
            <div class="quiz-prompt">${question.prompt}</div>
            <div class="quiz-choices"></div>
            <div class="quiz-feedback"></div>
            <button class="quiz-continue" hidden>Continue ▶</button>
        </div>`;

    const choicesEl = overlay.querySelector('.quiz-choices') as HTMLDivElement;
    const feedbackEl = overlay.querySelector('.quiz-feedback') as HTMLDivElement;
    const continueBtn = overlay.querySelector('.quiz-continue') as HTMLButtonElement;

    const buttons: HTMLButtonElement[] = question.choices.map((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-choice';
        btn.innerHTML = `<span class="quiz-key">${i + 1}</span> ${choice}`;
        btn.addEventListener('click', () => answer(i));
        choicesEl.appendChild(btn);
        return btn;
    });

    let answered = false;

    function answer(index: number): void {
        if (answered) return;
        answered = true;
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
            : `So close! The answer is "${answerText}" ✓. You've spotted ${element!.monster} — walk back to try again!`;
        feedbackEl.classList.add(correct ? 'ok' : 'no');

        // A correct answer catches the Elemental (adds its card); any encounter
        // at least counts it as Seen (spec §4.2). markCaught also marks it seen.
        if (correct) markCaught(elementId);
        else markSeen(elementId);
        continueBtn.hidden = false;
        continueBtn.focus();
    }

    function close(): void {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        isOpen = false;
        setDialogue(false);
    }

    function onKey(e: KeyboardEvent): void {
        if (!answered && e.key >= '1' && e.key <= String(question!.choices.length)) {
            answer(parseInt(e.key, 10) - 1);
            e.preventDefault();
        } else if (answered && (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ')) {
            close();
            e.preventDefault();
        }
    }

    continueBtn.addEventListener('click', close);
    // ✕ lets a student back out of a quiz they didn't mean to start (iPads have
    // no keyboard, so this is the only non-answer way out). The Elemental stays
    // de-armed until they step away, so it won't instantly reopen.
    (overlay.querySelector('.quiz-x') as HTMLButtonElement).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
}
