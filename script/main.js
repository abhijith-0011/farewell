/* ═══════════════════════════════════════════════════════════
   FAREWELL NOTE — MAIN SCRIPT
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── CONFIG ──────────────────────────────────────────────────
const PASSWORD = '013';
// EmailJS config — fill in your public key, service ID, template ID
const EMAILJS_KEY = 'pR7pOrv9CHwcPeMsr';      // Replace this
const EMAILJS_SERVICE = 'service_qvterbn';      // Replace this
const EMAILJS_TEMPLATE = 'template_55nzf9w';     // Replace this
const RECIPIENT_EMAIL = 'abhijithbinosh370@gmail.com';    // Your email

const TOTAL_NOTE_PAGES = 15; // pages 1..15 plus hug = total 16 screens after password

// ─── STATE ───────────────────────────────────────────────────
let currentScreenId = 'screen-password';
let notePages = [];   // will be ['screen-1'..'screen-15', 'screen-hug']
let currentPageIdx = -1; // -1 = on password screen

// ─── HELPERS ─────────────────────────────────────────────────
function getScreen(id) {
    return document.getElementById(id);
}

function showScreen(id, direction = 'forward') {
    const prev = getScreen(currentScreenId);
    const next = getScreen(id);

    if (!next) return;

    // Animate out prev
    if (prev) {
        prev.classList.remove('active');
        prev.classList.add(direction === 'forward' ? 'exit-up' : 'enter-from-below');
        setTimeout(() => {
            prev.classList.remove('exit-up', 'enter-from-below');
        }, 700);
    }

    // Animate in next
    next.classList.remove('exit-up', 'enter-from-below');
    // set starting state depending on direction
    if (direction === 'forward') {
        next.style.transform = 'translateY(30px)';
        next.style.opacity = '0';
    } else {
        next.style.transform = 'translateY(-30px)';
        next.style.opacity = '0';
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            next.style.transition = 'opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)';
            next.style.transform = 'translateY(0)';
            next.style.opacity = '1';
            next.classList.add('active');
        });
    });

    // Clean up inline styles after animation
    setTimeout(() => {
        next.style.transition = '';
        next.style.transform = '';
        next.style.opacity = '';
    }, 700);

    currentScreenId = id;
    updateNavBar();
}

// ─── PASSWORD ─────────────────────────────────────────────────
function checkPassword() {
    const input = document.getElementById('passwordInput').value.trim();
    const errMsg = document.getElementById('errorMsg');

    if (input === PASSWORD) {
        errMsg.classList.remove('show');
        // Enter the note experience
        startNoteExperience();
    } else {
        errMsg.classList.add('show');
        const field = document.getElementById('passwordInput');
        field.style.borderColor = '#e88fa0';
        field.style.boxShadow = '0 0 0 3px rgba(232,143,160,0.2)';
        setTimeout(() => {
            field.style.borderColor = '';
            field.style.boxShadow = '';
        }, 1400);
    }
}

function togglePasswordVisibility() {
    const input = document.getElementById('passwordInput');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Allow pressing Enter to unlock
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('passwordInput');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    // Build page list
    for (let i = 1; i <= TOTAL_NOTE_PAGES; i++) {
        notePages.push(`screen-${i}`);
    }
    notePages.push('screen-hug');

    // Spawn petals
    spawnPetals();

    // EmailJS init
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_KEY);
    }
});

// ─── CLICK-TO-ADVANCE ────────────────────────────────────────
// Attach click listener to every page screen (not password, not hug)
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 1; i <= TOTAL_NOTE_PAGES; i++) {
        const s = getScreen(`screen-${i}`);
        if (s) {
            s.addEventListener('click', (e) => {
                // Don't advance if nav buttons clicked
                if (e.target.closest('.nav-bar')) return;
                navigate(1);
            });
        }
    }
});

// ─── START NOTE ───────────────────────────────────────────────
function startNoteExperience() {
    currentPageIdx = 0;
    showScreen(notePages[0], 'forward');
    // Show nav bar
    document.getElementById('navBar').classList.add('visible');

    // Play background music
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.play().catch(err => console.log('Audio autoplay prevented:', err));
    }

    updateNavBar();
}

// ─── NAVIGATION ───────────────────────────────────────────────
function navigate(direction) {
    if (currentPageIdx < 0) return; // on password screen

    const newIdx = currentPageIdx + direction;
    if (newIdx < 0 || newIdx >= notePages.length) return;

    currentPageIdx = newIdx;
    showScreen(notePages[currentPageIdx], direction > 0 ? 'forward' : 'backward');
    updateNavBar();
}

function updateNavBar() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicator = document.getElementById('pageIndicator');

    if (currentPageIdx < 0) return;

    // On hug screen
    const isHug = notePages[currentPageIdx] === 'screen-hug';

    if (prevBtn) prevBtn.disabled = currentPageIdx === 0;
    if (nextBtn) nextBtn.disabled = isHug;

    if (indicator) {
        if (isHug) {
            indicator.textContent = '🌸 Finale';
        } else {
            indicator.textContent = `${currentPageIdx + 1} / ${TOTAL_NOTE_PAGES}`;
        }
    }
}

// ─── HUG BUTTON / EMAIL ───────────────────────────────────────
function sendHug() {
    const note = (document.getElementById('noteInput') || {}).value || '';

    const templateParams = {
        to_email: RECIPIENT_EMAIL,
        from_name: 'Farewell Note',
        note: note || '(No note was left)',
        message: 'Miss clicked the Hug button! 🫂❤️\n\nNote left on the login screen:\n' + (note || '(empty)'),
    };

    // Fire silently — no UI changes, no status text, nothing visible
    if (typeof emailjs !== 'undefined') {
        emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, templateParams)
            .catch(() => { /* silent fail — user never knows */ });
    }

    // Always play the petal celebration so the button click feels nice
    showHugSuccess();
}

function showHugSuccess() {
    // Rain petals / hearts for celebration
    const extra = ['❤️', '🌸', '🥺', '🫂', '💛', '✨'];
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'petal';
            el.textContent = extra[Math.floor(Math.random() * extra.length)];
            el.style.left = (Math.random() * 100) + 'vw';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            el.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
            document.getElementById('petalsBg').appendChild(el);
            setTimeout(() => el.remove(), 4500);
        }, i * 120);
    }
}

// ─── PETALS ───────────────────────────────────────────────────
function spawnPetals() {
    const symbols = ['🌸', '🌺', '✨', '🍃', '🌼', '🌷'];
    const bg = document.getElementById('petalsBg');

    for (let i = 0; i < 18; i++) {
        const el = document.createElement('div');
        el.className = 'petal';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = (Math.random() * 100) + 'vw';
        el.style.animationDelay = (Math.random() * 12) + 's';
        el.style.animationDuration = (8 + Math.random() * 8) + 's';
        el.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
        el.style.opacity = '0';
        bg.appendChild(el);
    }
}

// ─── KEYBOARD NAVIGATION ──────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (currentPageIdx < 0) return; // on password screen
    
    // Do not interfere if the user is typing in an input or textarea
    const tagName = e.target.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') return;

    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        navigate(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        navigate(-1);
    }
});
