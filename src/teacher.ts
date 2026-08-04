// Isotopia — Teacher admin portal (separate page: teacher.html).
// Google sign-in (school domain) gated by the "teacher" custom claim. Lets the
// teacher edit the question bank, set the 40-day element release schedule, and
// tune capture difficulty — all written live to Realtime Database.
//
// The student game (game.ts) is untouched by this; students play as guests.

import { onTeacherAuth, signInTeacher, signOutTeacher, TeacherSession, ALLOWED_DOMAIN } from './data/adminAuth';
import { isFirebaseConfigured } from './data/firebase';
import { ELEMENTS } from './data/elements';
import {
    ClassSettings, loadSettings, saveSettings, DEFAULT_SETTINGS,
    isElementReleased, currentUnitDay, UNIT_LENGTH_DAYS,
} from './data/classConfig';
import {
    StoredQuestion, loadAllQuestions, saveQuestion, deleteQuestion, importStarterQuestions,
} from './data/questionAdmin';
import { loadClassStudents } from './data/studentAdmin';

const app = document.getElementById('app') as HTMLDivElement;

let session: TeacherSession | null = null;
let settings: ClassSettings = { ...DEFAULT_SETTINGS };
let questions: StoredQuestion[] = [];
let tab: 'questions' | 'schedule' | 'settings' | 'students' = 'questions';
let editing: StoredQuestion | null = null;      // question being added/edited

const esc = (s: string): string =>
    s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

// ---------------------------------------------------------------- boot
function boot(): void {
    if (!isFirebaseConfigured()) {
        app.innerHTML = `<div class="card"><h1>Isotopia Teacher</h1>
            <p>Firebase isn't configured yet — set <code>firebaseConfig</code> in
            <code>src/data/firebase.ts</code>.</p></div>`;
        return;
    }
    onTeacherAuth(async (s) => {
        session = s;
        if (s?.isTeacher) {
            [settings, questions] = await Promise.all([loadSettings(), loadAllQuestions()]);
        }
        render();
    });
}

// ---------------------------------------------------------------- shells
function render(): void {
    if (!session) return renderSignedOut();
    if (!session.isTeacher) return renderNotAuthorized();
    renderPortal();
}

function renderSignedOut(): void {
    app.innerHTML = `<div class="card center">
        <h1>Isotopia Teacher</h1>
        <p>Sign in with your <b>@${ALLOWED_DOMAIN}</b> account to manage the game.</p>
        <button id="signin" class="btn primary">Sign in with Google</button>
    </div>`;
    (document.getElementById('signin') as HTMLButtonElement)
        .addEventListener('click', () => signInTeacher().catch(err => alert(err.message)));
}

function renderNotAuthorized(): void {
    app.innerHTML = `<div class="card center">
        <h1>Not authorized</h1>
        <p>Signed in as <b>${esc(session!.user.email || '')}</b>, but this account
        doesn't have teacher access yet.</p>
        <button id="signout" class="btn">Sign out</button>
    </div>`;
    (document.getElementById('signout') as HTMLButtonElement)
        .addEventListener('click', () => signOutTeacher());
}

function renderPortal(): void {
    app.innerHTML = `
        <header class="topbar">
            <span class="brand">Isotopia Teacher</span>
            <nav class="tabs">
                <button data-tab="questions" class="${tab === 'questions' ? 'on' : ''}">Questions</button>
                <button data-tab="schedule" class="${tab === 'schedule' ? 'on' : ''}">Schedule</button>
                <button data-tab="settings" class="${tab === 'settings' ? 'on' : ''}">Settings</button>
                <button data-tab="students" class="${tab === 'students' ? 'on' : ''}">Students</button>
            </nav>
            <span class="who">${esc(session!.user.email || '')}
                <button id="signout" class="btn small">Sign out</button></span>
        </header>
        <main id="panel"></main>`;

    app.querySelectorAll<HTMLButtonElement>('.tabs button').forEach(b =>
        b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; editing = null; renderPanel(); }));
    (document.getElementById('signout') as HTMLButtonElement)
        .addEventListener('click', () => signOutTeacher());
    renderPanel();
}

function renderPanel(): void {
    if (tab === 'questions') return renderQuestions();
    if (tab === 'schedule') return renderSchedule();
    if (tab === 'students') { void renderStudents(); return; }
    renderSettings();
}

// ---------------------------------------------------------------- questions
function renderQuestions(): void {
    const panel = document.getElementById('panel') as HTMLElement;
    const byElement = ELEMENTS.map(el => ({
        el,
        qs: questions.filter(q => q.elementId === el.id),
    }));

    panel.innerHTML = `
        <div class="row between">
            <h2>Question bank <span class="muted">(${questions.length} total)</span></h2>
            <div>
                ${questions.length === 0 ? `<button id="import" class="btn">Import starter questions</button>` : ''}
                <button id="add" class="btn primary">+ New question</button>
            </div>
        </div>
        <div id="qeditor"></div>
        <div class="qlist">
            ${byElement.map(g => `
                <section>
                    <h3>${esc(g.el.symbol)} · ${esc(g.el.name)}
                        <span class="muted">(${g.qs.length})</span></h3>
                    ${g.qs.length === 0 ? `<p class="muted small">No questions yet.</p>` : ''}
                    ${g.qs.map(q => `
                        <div class="qrow">
                            <div class="qtext">
                                <div class="qprompt">${esc(q.prompt)}</div>
                                <div class="muted small">${esc(q.angle || '')} · answer:
                                    <b>${esc(q.choices[q.correctIndex] ?? '?')}</b></div>
                            </div>
                            <div class="qactions">
                                <button class="btn small" data-edit="${q.id}">Edit</button>
                                <button class="btn small danger" data-del="${q.id}">Delete</button>
                            </div>
                        </div>`).join('')}
                </section>`).join('')}
        </div>`;

    const importBtn = document.getElementById('import');
    importBtn?.addEventListener('click', async () => {
        importBtn.setAttribute('disabled', 'true');
        const n = await importStarterQuestions().catch(err => { alert(err.message); return 0; });
        if (n) { questions = await loadAllQuestions(); }
        renderQuestions();
    });
    (document.getElementById('add') as HTMLButtonElement).addEventListener('click', () => {
        editing = { id: '', elementId: ELEMENTS[0].id, angle: '', prompt: '', choices: ['', '', '', ''], correctIndex: 0 };
        renderQuestionEditor();
    });
    panel.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(b =>
        b.addEventListener('click', () => {
            const q = questions.find(x => x.id === b.dataset.edit);
            if (q) { editing = { ...q, choices: [...q.choices] }; renderQuestionEditor(); }
        }));
    panel.querySelectorAll<HTMLButtonElement>('[data-del]').forEach(b =>
        b.addEventListener('click', async () => {
            if (!confirm('Delete this question?')) return;
            await deleteQuestion(b.dataset.del as string).catch(err => alert(err.message));
            questions = await loadAllQuestions();
            renderQuestions();
        }));
    if (editing) renderQuestionEditor();
}

function renderQuestionEditor(): void {
    const host = document.getElementById('qeditor') as HTMLElement;
    if (!editing) { host.innerHTML = ''; return; }
    const q = editing;
    host.innerHTML = `
        <div class="editor">
            <div class="grid2">
                <label>Element
                    <select id="f-el">${ELEMENTS.map(el =>
                        `<option value="${el.id}" ${el.id === q.elementId ? 'selected' : ''}>${esc(el.symbol)} · ${esc(el.name)}</option>`).join('')}</select>
                </label>
                <label>Angle / topic
                    <input id="f-angle" value="${esc(q.angle || '')}" placeholder="protons, ion, valence…">
                </label>
            </div>
            <label>Question prompt
                <textarea id="f-prompt" rows="2" placeholder="How many protons…">${esc(q.prompt)}</textarea>
            </label>
            <div class="choices">
                ${q.choices.map((c, i) => `
                    <label class="choice">
                        <input type="radio" name="correct" value="${i}" ${i === q.correctIndex ? 'checked' : ''}>
                        <input class="f-choice" data-i="${i}" value="${esc(c)}" placeholder="Choice ${i + 1}">
                    </label>`).join('')}
                <p class="muted small">Select the radio next to the correct answer.</p>
            </div>
            <div class="row">
                <button id="q-save" class="btn primary">Save question</button>
                <button id="q-cancel" class="btn">Cancel</button>
            </div>
        </div>`;

    (document.getElementById('q-cancel') as HTMLButtonElement).addEventListener('click', () => { editing = null; renderQuestions(); });
    (document.getElementById('q-save') as HTMLButtonElement).addEventListener('click', async () => {
        q.elementId = (document.getElementById('f-el') as HTMLSelectElement).value;
        q.angle = (document.getElementById('f-angle') as HTMLInputElement).value.trim();
        q.prompt = (document.getElementById('f-prompt') as HTMLTextAreaElement).value.trim();
        q.choices = Array.from(host.querySelectorAll<HTMLInputElement>('.f-choice')).map(i => i.value.trim());
        q.correctIndex = Number((host.querySelector('input[name="correct"]:checked') as HTMLInputElement).value);
        if (!q.prompt || q.choices.some(c => !c)) { alert('Fill in the prompt and all four choices.'); return; }
        await saveQuestion(q).catch(err => alert(err.message));
        editing = null;
        questions = await loadAllQuestions();
        renderQuestions();
    });
}

// ---------------------------------------------------------------- schedule
function renderSchedule(): void {
    const panel = document.getElementById('panel') as HTMLElement;
    const day = currentUnitDay(settings);
    panel.innerHTML = `
        <h2>Release schedule <span class="muted">(${UNIT_LENGTH_DAYS}-day unit)</span></h2>
        <div class="grid2">
            <label>Unit start date (day 1)
                <input type="date" id="s-start" value="${esc(settings.unitStartDate)}">
            </label>
            <label class="check">
                <input type="checkbox" id="s-all" ${settings.releaseAllNow ? 'checked' : ''}>
                Release everything now (testing)
            </label>
        </div>
        <p class="muted small">${settings.unitStartDate
            ? `Today is <b>day ${day}</b> of ${UNIT_LENGTH_DAYS}.`
            : `No start date set — schedule days won't gate anything until you set one.`}</p>
        <table class="sched">
            <thead><tr><th>Element</th><th>Unlock day (1–${UNIT_LENGTH_DAYS})</th><th>Status now</th></tr></thead>
            <tbody>
                ${ELEMENTS.map(el => {
                    const released = isElementReleased(settings, el.id);
                    return `<tr>
                        <td>${esc(el.symbol)} · ${esc(el.name)}</td>
                        <td><input type="number" min="1" max="${UNIT_LENGTH_DAYS}" class="s-day"
                             data-el="${el.id}" value="${settings.release[el.id] ?? ''}" placeholder="—"></td>
                        <td><span class="badge ${released ? 'ok' : 'lock'}">${released ? 'Released' : 'Locked'}</span></td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        <div class="row"><button id="sched-save" class="btn primary">Save schedule</button></div>`;

    (document.getElementById('sched-save') as HTMLButtonElement).addEventListener('click', async () => {
        settings.unitStartDate = (document.getElementById('s-start') as HTMLInputElement).value;
        settings.releaseAllNow = (document.getElementById('s-all') as HTMLInputElement).checked;
        const release: Record<string, number> = {};
        panel.querySelectorAll<HTMLInputElement>('.s-day').forEach(i => {
            const v = parseInt(i.value, 10);
            if (!Number.isNaN(v)) release[i.dataset.el as string] = Math.max(1, Math.min(UNIT_LENGTH_DAYS, v));
        });
        settings.release = release;
        await saveSettings(settings).catch(err => alert(err.message));
        renderSchedule();
    });
}

// ---------------------------------------------------------------- settings
function renderSettings(): void {
    const panel = document.getElementById('panel') as HTMLElement;
    panel.innerHTML = `
        <h2>Game settings</h2>
        <label>Correct answers needed to catch an Elemental
            <input type="number" id="g-catch" min="1" max="5" value="${settings.questionsToCatch}">
        </label>
        <p class="muted small">1 = catch on the first correct answer. Higher values
            turn each encounter into a short battle (used when the HP-bar battle lands).</p>
        <div class="row"><button id="set-save" class="btn primary">Save settings</button></div>`;

    (document.getElementById('set-save') as HTMLButtonElement).addEventListener('click', async () => {
        const v = parseInt((document.getElementById('g-catch') as HTMLInputElement).value, 10);
        settings.questionsToCatch = Math.max(1, Math.min(5, Number.isNaN(v) ? 1 : v));
        await saveSettings(settings).catch(err => alert(err.message));
        renderSettings();
    });
}

// ---------------------------------------------------------------- students
async function renderStudents(): Promise<void> {
    const panel = document.getElementById('panel') as HTMLElement;
    const head = `<div class="row between"><h2>Students</h2>
        <button id="stu-refresh" class="btn">Refresh</button></div>`;
    const wireRefresh = (): void => {
        document.getElementById('stu-refresh')?.addEventListener('click', () => { void renderStudents(); });
    };

    panel.innerHTML = `${head}<p class="muted">Loading…</p>`;
    wireRefresh();

    const rows = await loadClassStudents().catch(() => []);
    if (rows.length === 0) {
        panel.innerHTML = `${head}<p class="muted">No students have signed in yet.
            Guests who don't sign in won't appear here — have students open the DEX
            and tap "Sign in to save."</p>`;
        wireRefresh();
        return;
    }

    panel.innerHTML = `${head.replace('<h2>Students</h2>', `<h2>Students <span class="muted">(${rows.length})</span></h2>`)}
        <table class="sched">
            <thead><tr><th>Student</th><th>Caught</th><th>Seen</th><th>Accuracy</th></tr></thead>
            <tbody>${rows.map(r => {
                let att = 0, cor = 0;
                (Object.values(r.stats) as { attempts: number; correct: number }[])
                    .forEach(s => { att += s.attempts; cor += s.correct; });
                const acc = att ? Math.round((cor / att) * 100) : 0;
                return `<tr>
                    <td>${esc(r.name)}<div class="muted small">${esc(r.email)}</div></td>
                    <td>${r.caught}</td>
                    <td>${r.seen}</td>
                    <td>${att ? `${acc}% <span class="muted small">(${cor}/${att})</span>` : '—'}</td>
                </tr>`;
            }).join('')}</tbody>
        </table>
        <p class="muted small">Caught / Seen counts and overall answer accuracy.
            Students appear here once they sign in.</p>`;
    wireRefresh();
}

boot();
