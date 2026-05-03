(function () {
    'use strict';

    // ---------------- LOCOMOTIVE SCROLL ----------------
    let scroll;
    function initLocomotive() {
        if (typeof LocomotiveScroll === 'undefined') {
            console.warn('Locomotive Scroll failed to load. Falling back to native scroll.');
            // Add a fallback inview class trigger using IntersectionObserver
            initFallbackInView();
            return;
        }
        scroll = new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true,
            multiplier: 0.9,
            lerp: 0.08,
            class: 'is-inview'
        });

        // Update on resize / DOM changes
        window.addEventListener('load', () => scroll && scroll.update());
        setTimeout(() => scroll && scroll.update(), 600);

        // Smooth-scroll handlers for [data-scroll-to]
        document.querySelectorAll('[data-scroll-to]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target && scroll) scroll.scrollTo(target, { offset: -60 });
                else if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function initFallbackInView() {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) en.target.classList.add('is-inview');
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('[data-scroll]').forEach(el => io.observe(el));

        document.querySelectorAll('[data-scroll-to]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    // ---------------- THEME TOGGLE ----------------
    function initTheme() {
        const root = document.documentElement;
        const toggle = document.getElementById('themeToggle');
        const saved = localStorage.getItem('pollit-theme');
        if (saved === 'dark') root.setAttribute('data-theme', 'dark');

        toggle.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            if (isDark) {
                root.removeAttribute('data-theme');
                localStorage.setItem('pollit-theme', 'light');
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('pollit-theme', 'dark');
            }
            if (scroll) setTimeout(() => scroll.update(), 200);
        });
    }

    // ---------------- HELP MODAL ----------------
    function initHelp() {
        const btn = document.getElementById('helpBtn');
        const modal = document.getElementById('helpModal');
        const close = document.getElementById('helpClose');

        const open = () => modal.classList.add('show');
        const hide = () => modal.classList.remove('show');

        btn.addEventListener('click', open);
        close.addEventListener('click', hide);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hide();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip when typing
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            const key = e.key.toLowerCase();
            if (key === 'escape') return hide();
            if (key === '?' || (e.shiftKey && key === '/')) {
                e.preventDefault();
                modal.classList.contains('show') ? hide() : open();
            }
            if (key === 't') document.getElementById('themeToggle').click();
            if (key === 'v') gotoSection('#booth');
            if (key === 'l') gotoSection('#ledger');

            if (['1', '2', '3', '4', '5'].includes(key)) {
                const map = { '1': '#timeline', '2': '#booth', '3': '#ledger', '4': '#crisis', '5': '#quiz' };
                gotoSection(map[key]);
            }
        });

        function gotoSection(sel) {
            const t = document.querySelector(sel);
            if (!t) return;
            if (scroll) scroll.scrollTo(t, { offset: -60 });
            else t.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // ---------------- TIMELINE ----------------
    function renderTimeline() {
        const list = document.getElementById('timelineList');
        if (!list) return;
        list.innerHTML = TIMELINE_DATA.map((item, i) => `
            <div class="timeline-item" data-scroll data-scroll-class="is-inview" data-scroll-offset="20%">
                <div class="timeline-dot"></div>
                <div class="timeline-card glass">
                    <span class="timeline-icon">${item.icon}</span>
                    <span class="timeline-year">${item.year}</span>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                </div>
            </div>
        `).join('');
    }

    // ---------------- VOTING BOOTH ----------------
    let chosenCandidate = null;

    function initBooth() {
        // Step 1: ID Card flip
        const card = document.getElementById('idCard');
        const proceed = document.getElementById('proceedToBooth');
        card.addEventListener('click', () => {
            card.classList.add('flipped');
            setTimeout(() => proceed.removeAttribute('disabled'), 600);
        });
        proceed.addEventListener('click', () => goToStep(2));

        // Step 2: Enter booth
        const enterBtn = document.getElementById('enterBooth');
        const room = document.querySelector('.booth-room');
        enterBtn.addEventListener('click', () => {
            room.classList.add('open');
            setTimeout(() => goToStep(3), 1100);
        });

        // Step 3: Render EVM candidates
        const evmBody = document.getElementById('evmBody');
        evmBody.innerHTML = CANDIDATES.map((c, i) => `
            <div class="candidate-row">
                <div class="candidate-num">${i + 1}</div>
                <div class="candidate-info">
                    <strong>${c.name}</strong>
                    <span><span class="party-symbol">${c.symbol}</span>${c.party}</span>
                </div>
                <button class="vote-btn" data-cand="${i}" aria-label="Vote ${c.name}">▶</button>
            </div>
        `).join('');

        evmBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.vote-btn');
            if (!btn) return;
            const idx = +btn.getAttribute('data-cand');
            castVote(idx, btn);
        });

        document.getElementById('resetBooth').addEventListener('click', resetBooth);
    }

    function goToStep(n) {
        document.querySelectorAll('.booth-step').forEach(s => s.classList.remove('active'));
        document.getElementById('boothStep' + n).classList.add('active');
        document.querySelectorAll('.step').forEach(s => {
            const num = +s.getAttribute('data-step');
            s.classList.toggle('active', num === n);
            s.classList.toggle('done', num < n);
        });
        if (scroll) setTimeout(() => scroll.update(), 200);
    }

    function castVote(idx, btn) {
        if (chosenCandidate !== null) return;
        chosenCandidate = idx;
        const c = CANDIDATES[idx];

        // Flash LED
        const led = document.getElementById('evmLed');
        led.classList.add('flash');
        setTimeout(() => led.classList.remove('flash'), 1700);

        // Pressed effect
        btn.classList.add('pressed');
        document.querySelectorAll('.vote-btn').forEach(b => { if (b !== btn) b.disabled = true; });

        // Beep
        playBeep();

        // VVPAT slip animation
        const slip = document.getElementById('vvpatSlip');
        const slipContent = document.getElementById('slipContent');
        const time = new Date().toLocaleTimeString();
        slipContent.innerHTML = `
            <strong>VOTE RECORDED ✓</strong>
            <div class="slip-divider"></div>
            <span><b>Candidate:</b> ${c.name}</span>
            <span><b>Party:</b> ${c.party} ${c.symbol}</span>
            <span><b>Booth:</b> 042 / Const. 12</span>
            <span><b>Time:</b> ${time}</span>
            <div class="slip-divider"></div>
            <span style="font-size:0.7rem;opacity:0.7;">Verify slip · Drop in box · Thank you 🇮🇳</span>
        `;
        setTimeout(() => slip.classList.add('printed'), 350);

        // Result
        const result = document.getElementById('voteResult');
        result.className = 'vote-result success show';
        result.innerHTML = `✓ Your vote for <strong>${c.name}</strong> has been recorded — and added to the trust ledger below.`;

        // Push into ledger
        addBlockFromVote(c);
    }

    function resetBooth() {
        chosenCandidate = null;
        document.getElementById('idCard').classList.remove('flipped');
        document.querySelector('.booth-room').classList.remove('open');
        document.getElementById('proceedToBooth').setAttribute('disabled', '');
        document.querySelectorAll('.vote-btn').forEach(b => { b.classList.remove('pressed'); b.disabled = false; });
        document.getElementById('vvpatSlip').classList.remove('printed');
        document.getElementById('voteResult').classList.remove('show');
        goToStep(1);
    }

    // Web Audio beep
    let audioCtx;
    function playBeep() {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'square';
            o.frequency.setValueAtTime(880, audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);
            g.gain.setValueAtTime(0.15, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            o.connect(g); g.connect(audioCtx.destination);
            o.start();
            o.stop(audioCtx.currentTime + 0.5);
        } catch (e) { /* silent if audio not supported */ }
    }

    // ---------------- TRUST LEDGER (mock blockchain) ----------------
    let chain = [];

    // Tiny FNV-1a-ish hash producing a hex-like string (good enough for visual demo)
    function mockHash(input) {
        let h1 = 0x811c9dc5, h2 = 0x1b873593;
        const s = String(input);
        for (let i = 0; i < s.length; i++) {
            h1 ^= s.charCodeAt(i);
            h1 = (h1 * 0x01000193) >>> 0;
            h2 = ((h2 ^ s.charCodeAt(i)) * 0x85ebca6b) >>> 0;
        }
        const a = h1.toString(16).padStart(8, '0');
        const b = h2.toString(16).padStart(8, '0');
        const c = (h1 ^ h2).toString(16).padStart(8, '0');
        return ('0x' + a + b + c).slice(0, 18);
    }

    function buildGenesisChain() {
        chain = [
            { id: 0, data: 'GENESIS · Block 0', prev: '0x0000000000000000', hash: '' },
            { id: 1, data: 'Vote · A. Mehra · 🌳', prev: '', hash: '' },
            { id: 2, data: 'Vote · L. Singh · ☀️', prev: '', hash: '' }
        ];
        recalcChain();
        renderChain();
    }

    function recalcChain() {
        for (let i = 0; i < chain.length; i++) {
            if (i > 0) chain[i].prev = chain[i - 1].hash;
            chain[i].hash = mockHash(chain[i].id + '|' + chain[i].data + '|' + chain[i].prev);
        }
    }

    function renderChain() {
        const wrap = document.getElementById('chain');
        if (!wrap) return;

        // Validate
        const valid = chain.map((b, i) => {
            const expected = mockHash(b.id + '|' + b.data + '|' + b.prev);
            const linkOk = i === 0 ? true : (b.prev === chain[i - 1].hash);
            return expected === b.hash && linkOk;
        });

        let html = '';
        chain.forEach((b, i) => {
            const isTampered = !valid[i];
            html += `
                <div class="block ${isTampered ? 'tampered' : ''}" data-block="${i}">
                    <div class="block-head">
                        <span class="block-num">Block #${b.id}</span>
                        <span class="block-status">${isTampered ? '⚠ TAMPERED' : '✓ VALID'}</span>
                    </div>
                    <div class="block-field">
                        <label>Data</label>
                        <input type="text" data-edit="${i}" value="${escapeAttr(b.data)}">
                    </div>
                    <div class="block-field">
                        <label>Prev Hash</label>
                        <div class="block-readonly hash-display">${b.prev}</div>
                    </div>
                    <div class="block-field">
                        <label>Hash</label>
                        <div class="block-readonly hash-display">${b.hash}</div>
                    </div>
                </div>
            `;
            if (i < chain.length - 1) {
                const next = !valid[i + 1] || !valid[i];
                html += `<div class="block-link ${next ? 'broken' : ''}"></div>`;
            }
        });
        wrap.innerHTML = html;

        // Edit listeners — DO NOT auto-recalc, that defeats the demo.
        // Instead, we update the data and re-validate visually so tamper shows up.
        wrap.querySelectorAll('input[data-edit]').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = +e.target.getAttribute('data-edit');
                chain[idx].data = e.target.value;
                // Note: we do NOT re-mine the hash. Block keeps its old hash → mismatch → tampered.
                renderChain();
                // Restore focus + caret
                setTimeout(() => {
                    const next = wrap.querySelector(`input[data-edit="${idx}"]`);
                    if (next) {
                        next.focus();
                        const len = next.value.length;
                        next.setSelectionRange(len, len);
                    }
                }, 0);
            });
        });
    }

    function escapeAttr(s) { return String(s).replace(/"/g, '&quot;'); }

    function addBlockFromVote(candidate) {
        const id = chain.length;
        const b = { id, data: `Vote · ${candidate.name} · ${candidate.symbol}`, prev: '', hash: '' };
        chain.push(b);
        recalcChain();
        renderChain();
    }

    function initLedger() {
        buildGenesisChain();
        document.getElementById('addBlockBtn').addEventListener('click', () => {
            const c = CANDIDATES[Math.floor(Math.random() * (CANDIDATES.length - 1))]; // skip NOTA
            addBlockFromVote(c);
        });
        document.getElementById('resetChainBtn').addEventListener('click', () => {
            buildGenesisChain();
        });
    }

    // ---------------- CRISIS ENGINE ----------------
    const stats = { turnout: 62, trust: 75, safety: 80 };
    let crisisIdx = 0;

    function initCrisis() {
        renderCrisis();
        document.getElementById('nextCrisisBtn').addEventListener('click', () => {
            crisisIdx = (crisisIdx + 1) % CRISIS_DATA.length;
            renderCrisis();
        });
    }

    function renderCrisis() {
        const sc = CRISIS_DATA[crisisIdx];
        document.getElementById('crisisLabel').textContent = `SCENARIO ${crisisIdx + 1} / ${CRISIS_DATA.length}`;
        document.getElementById('crisisSeverity').textContent = sc.severity;
        document.getElementById('crisisTitle').textContent = sc.title;
        document.getElementById('crisisDesc').textContent = sc.desc;

        const cw = document.getElementById('crisisChoices');
        cw.innerHTML = sc.choices.map((c, i) => `
            <button class="choice-btn" data-choice="${i}">
                <span class="choice-icon">${c.icon}</span>
                <span>${c.label}</span>
            </button>
        `).join('');

        cw.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => handleChoice(+btn.getAttribute('data-choice')));
        });

        document.getElementById('crisisFeedback').classList.remove('show');
        document.getElementById('crisisFeedback').textContent = '';
        document.getElementById('nextCrisisBtn').style.display = 'none';
    }

    function handleChoice(i) {
        const sc = CRISIS_DATA[crisisIdx];
        const c = sc.choices[i];

        stats.turnout = clamp(stats.turnout + c.turnout);
        stats.trust   = clamp(stats.trust + c.trust);
        stats.safety  = clamp(stats.safety + c.safety);
        updateStats();

        const fb = document.getElementById('crisisFeedback');
        fb.textContent = c.feedback;
        fb.classList.add('show');

        document.querySelectorAll('.crisis-choices .choice-btn').forEach(b => b.classList.add('disabled'));
        document.getElementById('nextCrisisBtn').style.display = 'inline-flex';
    }

    function clamp(v) { return Math.max(0, Math.min(100, v)); }

    function updateStats() {
        document.getElementById('turnoutPct').textContent = stats.turnout + '%';
        document.getElementById('turnoutBar').style.width = stats.turnout + '%';
        document.getElementById('trustPct').textContent = stats.trust + '%';
        document.getElementById('trustBar').style.width = stats.trust + '%';
        document.getElementById('safetyPct').textContent = stats.safety + '%';
        document.getElementById('safetyBar').style.width = stats.safety + '%';
        document.getElementById('commissionerScore').textContent = computeGrade();
    }

    function computeGrade() {
        const avg = (stats.turnout + stats.trust + stats.safety) / 3;
        if (avg >= 90) return 'A+';
        if (avg >= 82) return 'A';
        if (avg >= 75) return 'B+';
        if (avg >= 65) return 'B';
        if (avg >= 55) return 'C';
        if (avg >= 45) return 'D';
        return 'F';
    }

    // ---------------- QUIZ ----------------
    let qIdx = 0, score = 0, answered = false;

    function initQuiz() {
        renderQuiz();
        document.getElementById('nextQuizBtn').addEventListener('click', () => {
            if (qIdx < QUIZ_DATA.length - 1) { qIdx++; answered = false; renderQuiz(); }
            else { qIdx = 0; score = 0; answered = false; renderQuiz(); }
        });
    }

    function renderQuiz() {
        const q = QUIZ_DATA[qIdx];
        document.getElementById('quizQuestion').textContent = q.q;
        document.getElementById('quizProgressLabel').textContent = `Q ${qIdx + 1} / ${QUIZ_DATA.length}`;
        document.getElementById('quizBarFill').style.width = ((qIdx) / QUIZ_DATA.length * 100) + '%';
        document.getElementById('quizScore').textContent = `Score: ${score}`;
        const next = document.getElementById('nextQuizBtn');
        next.disabled = true;
        next.textContent = (qIdx === QUIZ_DATA.length - 1) ? 'Restart ↺' : 'Next →';

        const opts = document.getElementById('quizOptions');
        const letters = ['A', 'B', 'C', 'D'];
        opts.innerHTML = q.options.map((opt, i) => `
            <button class="quiz-opt" data-i="${i}">
                <span class="quiz-opt-letter">${letters[i]}</span>
                <span>${opt}</span>
            </button>
        `).join('');

        opts.querySelectorAll('.quiz-opt').forEach(btn => {
            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;
                const i = +btn.getAttribute('data-i');
                const correct = i === q.correct;
                if (correct) { btn.classList.add('correct'); score++; }
                else {
                    btn.classList.add('wrong');
                    opts.querySelector(`.quiz-opt[data-i="${q.correct}"]`).classList.add('correct');
                }
                opts.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
                document.getElementById('quizScore').textContent = `Score: ${score}`;
                document.getElementById('quizBarFill').style.width = ((qIdx + 1) / QUIZ_DATA.length * 100) + '%';
                document.getElementById('nextQuizBtn').disabled = false;
            });
        });
    }

    // ---------------- BOOT ----------------
    document.addEventListener('DOMContentLoaded', () => {
        renderTimeline();
        initBooth();
        initLedger();
        initCrisis();
        initQuiz();
        initTheme();
        initHelp();
        initLocomotive();

        // After locomotive renders, update sizing
        setTimeout(() => { if (scroll) scroll.update(); }, 800);
    });

})();