// ===== ADJECTIVE COMPARATIVE & SUPERLATIVE EXERCISES =====
const adjectiveList = [
    // Add more adjectives as needed
    { base: 'groß', comparative: 'größer', superlative: 'am größten', en: 'big' },
    { base: 'klein', comparative: 'kleiner', superlative: 'am kleinsten', en: 'small' },
    { base: 'schnell', comparative: 'schneller', superlative: 'am schnellsten', en: 'fast' },
    { base: 'langsam', comparative: 'langsamer', superlative: 'am langsamsten', en: 'slow' },
    { base: 'alt', comparative: 'älter', superlative: 'am ältesten', en: 'old' },
    { base: 'jung', comparative: 'jünger', superlative: 'am jüngsten', en: 'young' },
    { base: 'gut', comparative: 'besser', superlative: 'am besten', en: 'good' },
    { base: 'schlecht', comparative: 'schlechter', superlative: 'am schlechtesten', en: 'bad' },
    { base: 'teuer', comparative: 'teurer', superlative: 'am teuersten', en: 'expensive' },
    { base: 'billig', comparative: 'billiger', superlative: 'am billigsten', en: 'cheap' },
    { base: 'schön', comparative: 'schöner', superlative: 'am schönsten', en: 'beautiful' },
    { base: 'leicht', comparative: 'leichter', superlative: 'am leichtesten', en: 'easy' },
    { base: 'schwer', comparative: 'schwerer', superlative: 'am schwersten', en: 'difficult' },
];

// Initialize global state objects
let quizState = {};           // Track quiz progress per section
let unlimitedState = {};      // Track unlimited exercise progress
let adjExerciseState = null;  // Current adjective exercise state

// ID constants - centralized for easy refactoring
const DOM_IDS = {
    // Quiz IDs
    quizInput: (id) => `quizInput-${id}`,
    quizWord: (id) => `quizWord-${id}`,
    quizFeedback: (id) => `quizFeedback-${id}`,
    quizScore: (id) => `quizScore-${id}`,
    
    // Unlimited exercise IDs
    unlimitedInput: (id) => `uInput-${id}`,
    unlimitedCard: (id) => `uCard-${id}`,
    unlimitedFeedback: (id) => `uFeedback-${id}`,
    unlimitedAnswer: (id) => `uAnswer-${id}`,
    unlimitedBank: (id) => `uBank-${id}`,
    unlimitedHint: (id) => `uHint-${id}`,
    unlimitedCorrect: (id) => `uCorrect-${id}`,
    unlimitedWrong: (id) => `uWrong-${id}`,
    unlimitedTotal: (id) => `uTotal-${id}`,
    unlimitedProgress: (id) => `uProgress-${id}`,
    unlimitedScoreText: (id) => `uScoreText-${id}`,
    
    // Grid IDs
    grid: (id) => `grid-${id}`,
    
    // Tab IDs
    tab: (id) => `tab-${id}`,
    
    // Global
    globalError: 'globalError',
    mobileMenu: 'mobileMenu',
    themeToggle: '.theme-toggle',
    adjectiveContainer: 'adjective-exercise-container',
    adjectiveInput: 'adj-ex-input',
    adjectiveFeedback: 'adj-ex-feedback',
    bubbleContainer: 'bubble-container'
};

// Storage manager with localStorage fallback
const StorageManager = {
    _cache: {},
    _isLocalStorageAvailable: null,
    
    _checkStorage() {
        if (this._isLocalStorageAvailable !== null) return;
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            this._isLocalStorageAvailable = true;
        } catch (e) {
            this._isLocalStorageAvailable = false;
            console.warn('localStorage unavailable - using in-memory storage fallback');
        }
    },
    
    setItem(key, value) {
        this._checkStorage();
        try {
            if (this._isLocalStorageAvailable) {
                localStorage.setItem(key, value);
            }
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
        // Always save to cache as fallback
        this._cache[key] = value;
    },
    
    getItem(key) {
        this._checkStorage();
        try {
            if (this._isLocalStorageAvailable) {
                const item = localStorage.getItem(key);
                if (item !== null) {
                    this._cache[key] = item;
                    return item;
                }
            }
        } catch (e) {
            console.warn('Could not read from localStorage:', e);
        }
        return this._cache[key] || null;
    }
};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===== ADJECTIVE COMPARATIVE & SUPERLATIVE EXERCISES =====
function startAdjectiveExercise() {
    const adj = adjectiveList[Math.floor(Math.random() * adjectiveList.length)];
    const forms = ['comparative', 'superlative'];
    const form = forms[Math.floor(Math.random() * forms.length)];
    adjExerciseState = { adj, form };
    let prompt = '';
    if (form === 'comparative') {
        prompt = `What is the comparative of <b>${escapeHtml(adj.base)}</b> (${escapeHtml(adj.en)})?`;
    } else {
        prompt = `What is the superlative of <b>${escapeHtml(adj.base)}</b> (${escapeHtml(adj.en)})?`;
    }
    const html = `
        <div class="adj-ex-prompt">${prompt}</div>
        <input type="text" id="${DOM_IDS.adjectiveInput}" class="quiz-input" placeholder="Type your answer...">
        <button class="btn btn-primary" onclick="checkAdjectiveExercise()">Check</button>
        <div id="${DOM_IDS.adjectiveFeedback}"></div>
    `;
    const container = document.getElementById(DOM_IDS.adjectiveContainer);
    if (container) {
        container.innerHTML = html;
        document.getElementById(DOM_IDS.adjectiveInput).focus();
    }
}

function checkAdjectiveExercise() {
    if (!adjExerciseState) return;
    const userInput = document.getElementById(DOM_IDS.adjectiveInput).value.trim().toLowerCase();
    const correct = adjExerciseState.adj[adjExerciseState.form].toLowerCase();
    const feedback = document.getElementById(DOM_IDS.adjectiveFeedback);
    if (userInput === correct) {
        feedback.textContent = '✅ Correct!';
        feedback.style.color = '#4CAF50';
    } else {
        feedback.textContent = '❌ Correct answer: ' + correct;
        feedback.style.color = '#f44336';
    }
    setTimeout(startAdjectiveExercise, 1500);
}

// ===== GLOBAL ERROR BANNER =====
function showError(msg) {
    const el = document.getElementById(DOM_IDS.globalError);
    if (el) {
        el.textContent = msg;
        el.style.display = '';
        setTimeout(() => { el.style.display = 'none'; }, 6000);
    } else {
        alert(msg);
    }
}

function hideError() {
    const el = document.getElementById(DOM_IDS.globalError);
    if (el) el.style.display = 'none';
}

// ====== AUDIO (LOCAL & BROWSER TTS) SUPPORT ======
function playAudio(text) {
    if (!text) return;
    console.log(`Attempting to play audio for: "${text}"`);
    
    // 1. Try to play from local /static/audio folder first
    const fileName = text.toLowerCase().trim().replace(/\s+/g, '_') + '.mp3';
    const localPath = `/static/audio/${fileName}`;
    
    const audio = new Audio(localPath);
    
    audio.play()
        .then(() => console.log(`Playing local file: ${localPath}`))
        .catch(e => {
            console.warn(`Local file not found or failed: ${localPath}. Falling back to Browser TTS.`);
            
            // 2. FALLBACK: Use Browser's Built-in Speech Synthesis
            if (!window.speechSynthesis) {
                console.error("Speech Synthesis not supported in this browser.");
                return;
            }
            
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utter = new window.SpeechSynthesisUtterance(text);
            
            // Find a German voice specifically
            const voices = window.speechSynthesis.getVoices();
            const germanVoice = voices.find(v => v.lang.startsWith('de')) || voices[0];
            
            if (germanVoice) {
                utter.voice = germanVoice;
                console.log(`Using voice: ${germanVoice.name} (${germanVoice.lang})`);
            }
            
            utter.lang = 'de-DE';
            utter.rate = 0.9;
            utter.pitch = 1.0;
            
            utter.onerror = (err) => console.error("TTS Error:", err);
            utter.onstart = () => console.log("TTS Started speaking...");
            
            window.speechSynthesis.speak(utter);
        });
}

// Ensure voices are loaded (some browsers load them asynchronously)
window.speechSynthesis.getVoices();
if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

function playQuizAudio(sectionId) {
    if (!quizState || !quizState[sectionId]) return;
    const state = quizState[sectionId];
    if (!state.words || state.index >= state.words.length) return;
    const word = state.words[state.index]?.de;
    if (word) playAudio(word);
}

function playSentenceAudio(sectionId) {
    if (!unlimitedState || !unlimitedState[sectionId]) return;
    const state = unlimitedState[sectionId];
    const sentence = state.exercise?.answer;
    if (sentence) playAudio(sentence);
}

// ====== PERSISTENT PROGRESS HELPERS ======
function saveUnlimitedProgress(sectionId) {
    try {
        const state = unlimitedState[sectionId];
        if (!state) return;
        StorageManager.setItem('unlimited_' + sectionId, JSON.stringify({
            correct: state.correct,
            wrong: state.wrong,
            total: state.total
        }));
    } catch (e) {
        console.error('Could not save progress:', e);
    }
}

function loadUnlimitedProgress(sectionId) {
    try {
        const raw = StorageManager.getItem('unlimited_' + sectionId);
        if (!raw) return { correct: 0, wrong: 0, total: 0 };
        const obj = JSON.parse(raw);
        return {
            correct: obj.correct || 0,
            wrong: obj.wrong || 0,
            total: obj.total || 0
        };
    } catch (e) {
        return { correct: 0, wrong: 0, total: 0 };
    }
}

function saveQuizProgress(sectionId) {
    try {
        const state = quizState[sectionId];
        if (!state) return;
        StorageManager.setItem('quiz_' + sectionId, JSON.stringify({
            index: state.index,
            correct: state.correct,
            total: state.total
        }));
    } catch (e) {
        console.error('Could not save quiz progress:', e);
    }
}

function loadQuizProgress(sectionId) {
    try {
        const raw = StorageManager.getItem('quiz_' + sectionId);
        if (!raw) return { index: 0, correct: 0, total: 0 };
        const obj = JSON.parse(raw);
        return {
            index: obj.index || 0,
            correct: obj.correct || 0,
            total: obj.total || 0
        };
    } catch (e) {
        return { index: 0, correct: 0, total: 0 };
    }
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const menu = document.getElementById(DOM_IDS.mobileMenu);
    if (menu) menu.classList.toggle('open');
}

// ===== THEME TOGGLE =====
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    StorageManager.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const btn = document.querySelector(DOM_IDS.themeToggle);
    if (btn) {
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

(function initTheme() {
    const savedTheme = StorageManager.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    
    function updateIcon() {
        updateThemeIcon(theme);
    }
    
    if (document.readyState !== 'loading') {
        updateIcon();
    } else {
        document.addEventListener('DOMContentLoaded', updateIcon);
    }
})();

// ===== TAB SWITCHING =====
function switchTab(tabId, btn) {
    const parent = btn.closest('.container') || document.querySelector('.container');
    parent.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    parent.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const targetTab = document.getElementById(DOM_IDS.tab(tabId));
    if (targetTab) targetTab.classList.add('active');
    btn.classList.add('active');
}

// ===== VOCAB CARD FLIP =====
function flipCard(card) {
    card.classList.toggle('flipped');
}

function toggleAll(sectionId) {
    const grid = document.getElementById(DOM_IDS.grid(sectionId));
    if (!grid) return;
    const cards = grid.querySelectorAll('.vocab-card');
    const anyFlipped = Array.from(cards).some(c => c.classList.contains('flipped'));
    cards.forEach(c => {
        if (anyFlipped) c.classList.remove('flipped');
        else c.classList.add('flipped');
    });
}

function shuffleCards(sectionId) {
    const grid = document.getElementById(DOM_IDS.grid(sectionId));
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.vocab-card'));
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        grid.appendChild(cards[j]);
    }
}

// ===== QUIZ MODE =====
function startQuiz(sectionId) {
    if (!quizState) quizState = {};
    
    // Get vocabulary data from page
    // vocabData is expected to be an array of sections, or just use the first one if it's the merged list
    const section = Array.isArray(vocabData) ? vocabData.find(s => s.id === sectionId) : vocabData;
    
    if (!section || !section.words) {
        showError('No vocabulary data available');
        return;
    }
    
    // Load saved progress
    const saved = loadQuizProgress(sectionId);
    
    quizState[sectionId] = {
        words: section.words || [],
        index: saved.index || 0,
        correct: saved.correct || 0,
        total: saved.total || 0
    };
    
    displayQuizWord(sectionId);
}

function displayQuizWord(sectionId) {
    const state = quizState[sectionId];
    if (!state) return;
    
    const wordEl = document.getElementById(DOM_IDS.quizWord(sectionId));
    const scoreEl = document.getElementById(DOM_IDS.quizScore(sectionId));
    const inputEl = document.getElementById(DOM_IDS.quizInput(sectionId));
    const feedbackEl = document.getElementById(DOM_IDS.quizFeedback(sectionId));
    
    if (state.index >= state.words.length) {
        // Quiz complete
        if (wordEl) wordEl.textContent = 'Quiz Complete! 🎉';
        if (scoreEl) scoreEl.textContent = `Final Score: ${state.correct} / ${state.total}`;
        return;
    }
    
    const word = state.words[state.index];
    if (wordEl) wordEl.textContent = word.de;
    if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
    }
    if (feedbackEl) feedbackEl.textContent = '';
    if (scoreEl) scoreEl.textContent = `Score: ${state.correct} / ${state.total}`;
}

function checkQuiz(sectionId) {
    const state = quizState[sectionId];
    if (!state || state.index >= state.words.length) return;
    
    const inputEl = document.getElementById(DOM_IDS.quizInput(sectionId));
    const feedbackEl = document.getElementById(DOM_IDS.quizFeedback(sectionId));
    
    const userAnswer = (inputEl.value || '').trim().toLowerCase();
    const correctAnswer = (state.words[state.index].en || '').toLowerCase();
    
    state.total++;
    
    if (userAnswer === correctAnswer) {
        state.correct++;
        if (feedbackEl) {
            feedbackEl.textContent = '✅ Correct!';
            feedbackEl.style.color = '#4CAF50';
        }
    } else {
        if (feedbackEl) {
            feedbackEl.innerHTML = '❌ Correct answer: <strong>' + escapeHtml(correctAnswer) + '</strong>';
            feedbackEl.style.color = '#f44336';
        }
    }
    
    state.index++;
    saveQuizProgress(sectionId);
    
    setTimeout(() => displayQuizWord(sectionId), 1500);
}

function nextQuiz(sectionId) {
    const state = quizState[sectionId];
    if (!state) return;
    state.index++;
    state.total++;
    saveQuizProgress(sectionId);
    displayQuizWord(sectionId);
}

// ===== UNLIMITED MODE =====
function startUnlimitedExercise(sectionId) {
    if (!unlimitedState) unlimitedState = {};
    const saved = loadUnlimitedProgress(sectionId);
    unlimitedState[sectionId] = {
        correct: saved.correct,
        wrong: saved.wrong,
        total: saved.total,
        answered: false,
        exercise: generateRandomExercise(sectionId)
    };
    displayUnlimitedExercise(sectionId);
}

function generateRandomExercise(sectionId) {
    if (typeof SentenceGenerator !== 'undefined') {
        return SentenceGenerator.getExercise(sectionId);
    }
    return { answer: 'No exercises available', words: [], prompt: 'Error', hint: '' };
}

function displayUnlimitedExercise(sectionId) {
    const state = unlimitedState[sectionId];
    if (!state || !state.exercise) return;
    
    document.getElementById('uPrompt-' + sectionId).textContent = state.exercise.prompt;
    document.getElementById('uHint-' + sectionId).textContent = state.exercise.hint;
    document.getElementById('uHint-' + sectionId).style.display = 'none';
    
    const bank = document.getElementById(DOM_IDS.unlimitedBank(sectionId));
    bank.innerHTML = '';
    state.exercise.words.forEach(word => {
        const btn = document.createElement('button');
        btn.className = 'word-tile';
        btn.textContent = word;
        btn.onclick = () => selectUnlimitedWord(btn, sectionId);
        bank.appendChild(btn);
    });

    const card = document.getElementById(DOM_IDS.unlimitedCard(sectionId));
    if (card) card.classList.remove('correct', 'incorrect');
    
    clearUnlimitedAnswer(sectionId);
    state.answered = false;
    
    const feedback = document.getElementById(DOM_IDS.unlimitedFeedback(sectionId));
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'exercise-feedback';
    }
}

function selectUnlimitedWord(tile, sectionId) {
    if (tile.classList.contains('used')) return;
    const answerArea = document.getElementById(DOM_IDS.unlimitedAnswer(sectionId));
    const placeholder = answerArea.querySelector('.answer-placeholder');
    if (placeholder) placeholder.remove();
    tile.classList.add('used');
    const answerTile = document.createElement('button');
    answerTile.className = 'word-tile';
    answerTile.textContent = tile.textContent;
    answerTile.onclick = () => {
        tile.classList.remove('used');
        answerTile.remove();
        if (!answerArea.querySelector('.word-tile')) {
            const ph = document.createElement('span');
            ph.className = 'answer-placeholder';
            ph.textContent = 'Click words above to build your sentence...';
            answerArea.appendChild(ph);
        }
    };
    answerArea.appendChild(answerTile);
}

function checkUnlimited(sectionId) {
    const state = unlimitedState[sectionId];
    if (!state || state.answered) return;
    const input = document.getElementById(DOM_IDS.unlimitedInput(sectionId));
    const answerArea = document.getElementById(DOM_IDS.unlimitedAnswer(sectionId));
    const feedback = document.getElementById(DOM_IDS.unlimitedFeedback(sectionId));
    const card = document.getElementById(DOM_IDS.unlimitedCard(sectionId));
    let userAnswer = input.value.trim();
    if (!userAnswer) {
        const tiles = answerArea.querySelectorAll('.word-tile');
        userAnswer = Array.from(tiles).map(t => t.textContent.trim()).join(' ');
    }
    if (!userAnswer) {
        if (feedback) {
            feedback.textContent = 'Please build or type a sentence first.';
            feedback.className = 'exercise-feedback incorrect';
        }
        return;
    }
    const clean = s => s.replace(/[.!?,]/g, '').trim().toLowerCase();
    const isCorrect = clean(userAnswer) === clean(state.exercise.answer);
    state.answered = true;
    state.total++;
    if (isCorrect) {
        state.correct++;
        if (feedback) {
            feedback.textContent = '✅ Richtig! (Correct!)';
            feedback.className = 'exercise-feedback correct';
        }
        if (card) card.classList.add('correct');
    } else {
        state.wrong++;
        if (feedback) {
            const el = document.createElement('div');
            el.innerHTML = '❌ Not quite. Expected: <strong></strong>';
            el.querySelector('strong').textContent = state.exercise.answer;
            feedback.replaceChildren(el);
            feedback.className = 'exercise-feedback incorrect';
        }
        if (card) card.classList.add('incorrect');
    }
    updateUnlimitedStats(sectionId);
    saveUnlimitedProgress(sectionId);
}

function updateUnlimitedStats(sectionId) {
    const state = unlimitedState[sectionId];
    document.getElementById(DOM_IDS.unlimitedCorrect(sectionId)).textContent = '✅ ' + state.correct;
    document.getElementById(DOM_IDS.unlimitedWrong(sectionId)).textContent = '❌ ' + state.wrong;
    document.getElementById(DOM_IDS.unlimitedTotal(sectionId)).textContent = '📝 ' + state.total + ' practiced';
    const pct = state.total > 0 ? Math.round((state.correct / state.total) * 100) : 0;
    const fill = document.getElementById(DOM_IDS.unlimitedProgress(sectionId));
    const scoreText = document.getElementById(DOM_IDS.unlimitedScoreText(sectionId));
    if (fill) fill.style.width = pct + '%';
    if (scoreText) scoreText.textContent = state.correct + ' / ' + state.total + ' correct (' + pct + '%)';
}

function nextUnlimited(sectionId) {
    startUnlimitedExercise(sectionId);
}

function revealUnlimited(sectionId) {
    const state = unlimitedState[sectionId];
    if (!state || !state.exercise) return;
    const feedback = document.getElementById(DOM_IDS.unlimitedFeedback(sectionId));
    if (feedback) {
        const el = document.createElement('div');
        el.innerHTML = '💡 Answer: <strong></strong>';
        el.querySelector('strong').textContent = state.exercise.answer;
        feedback.replaceChildren(el);
        feedback.className = 'exercise-feedback';
        feedback.style.background = '#eff6ff';
        feedback.style.color = '#1a56db';
    }
}

function toggleUnlimitedHint(sectionId) {
    const hint = document.getElementById(DOM_IDS.unlimitedHint(sectionId));
    if (hint) hint.style.display = hint.style.display === 'none' ? 'inline-block' : 'none';
}

function clearUnlimitedAnswer(sectionId) {
    const bank = document.getElementById(DOM_IDS.unlimitedBank(sectionId));
    if (bank) {
        bank.querySelectorAll('.word-tile.used').forEach(tile => tile.classList.remove('used'));
    }
    const answerArea = document.getElementById(DOM_IDS.unlimitedAnswer(sectionId));
    if (answerArea) {
        answerArea.innerHTML = '<span class="answer-placeholder">Click words above to build your sentence...</span>';
    }
    const input = document.getElementById(DOM_IDS.unlimitedInput(sectionId));
    if (input) input.value = '';
}

// ===== CANVAS-BASED BURST ANIMATION =====
function burstAndNavigate(event, href) {
    event.preventDefault();
    event.stopPropagation();
    const container = document.getElementById(DOM_IDS.bubbleContainer);
    if (!container) {
        window.location.href = href;
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const colors = ['#667eea', '#764ba2', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rect = event.target.getBoundingClientRect();
    const clickX = event.clientX || (rect.left + rect.width / 2);
    const clickY = event.clientY || (rect.top + rect.height / 2);
    const particles = [];
    for (let i = 0; i < 200; i++) {
        const angle = (Math.PI * 2 / 200) * i + Math.random() * 0.3;
        const speed = Math.random() * 8 + 3;
        particles.push({ x: clickX, y: clickY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: Math.random() * 6 + 2, color: colors[i % colors.length], alpha: 1, decay: Math.random() * 0.02 + 0.015 });
    }
    const startTime = performance.now();
    function animate() {
        ctx.clearRect(0, 0, screenW, screenH);
        let alive = false;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.alpha <= 0) continue;
            alive = true;
            p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        if (alive && performance.now() - startTime < 800) requestAnimationFrame(animate);
        else canvas.remove();
    }
    requestAnimationFrame(animate);
    setTimeout(() => { window.location.href = href; }, 600);
}
