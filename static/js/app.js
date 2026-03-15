/**
 * GERMAN LEARNING APP - CORE JAVASCRIPT (PRO)
 * Unified engines for Audio, Quiz, and Adjectives.
 */

// ====== DOM CONSTANTS ======
const DOM_IDS = {
    globalError: 'globalError',
    adjContainer: 'adjective-exercise-container',
    adjInput: 'adjInput',
    adjFeedback: 'adjFeedback'
};

// ====== 1. AUDIO ENGINE (SINGLETON) ======
const AudioEngine = {
    speech: window.speechSynthesis,
    
    play(text) {
        if (!text || !this.speech) return;

        const cleanText = text.split('[')[0].split('(')[0].trim();
        this.speech.resume();
        this.speech.cancel();

        setTimeout(() => {
            const utter = new SpeechSynthesisUtterance(cleanText);
            const voices = this.speech.getVoices();
            const voice = voices.find(v => v.lang.startsWith('de') && v.name.includes('Google')) ||
                          voices.find(v => v.lang.startsWith('de')) ||
                          voices[0];
            
            if (voice) { utter.voice = voice; utter.lang = voice.lang; }
            else { utter.lang = 'de-DE'; }

            utter.rate = 0.85;
            this.speech.speak(utter);
        }, 50);
    },

    init() {
        this.speech.getVoices();
        if (this.speech.onvoiceschanged !== undefined) {
            this.speech.onvoiceschanged = () => this.speech.getVoices();
        }
    }
};

// ====== 2. QUIZ ENGINE ======
const QuizEngine = {
    states: {}, // Per-section state

    init(sectionId, words) {
        this.states[sectionId] = {
            words: this.shuffle([...words]),
            index: 0,
            score: 0
        };
        this.render(sectionId);
    },

    shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    },

    render(sectionId) {
        const state = this.states[sectionId];
        const container = document.getElementById(`quiz-${sectionId}`);
        if (!state || !container) return;

        container.classList.add('active');
        const wordObj = state.words[state.index];
        
        document.getElementById(`quizWord-${sectionId}`).textContent = wordObj.de;
        document.getElementById(`quizFeedback-${sectionId}`).textContent = '';
        document.getElementById(`quizInput-${sectionId}`).value = '';
        document.getElementById(`quizInput-${sectionId}`).focus();
        this.updateScore(sectionId);
    },

    check(sectionId) {
        const state = this.states[sectionId];
        const input = document.getElementById(`quizInput-${sectionId}`);
        const feedback = document.getElementById(`quizFeedback-${sectionId}`);
        
        const userAns = input.value.trim().toLowerCase();
        const correctAns = state.words[state.index].en.toLowerCase();

        if (userAns === correctAns) {
            state.score++;
            feedback.textContent = "✅ Correct!";
            feedback.className = "quiz-feedback correct";
            setTimeout(() => this.next(sectionId), 1000);
        } else {
            feedback.textContent = `❌ Expected: ${state.words[state.index].en}`;
            feedback.className = "quiz-feedback incorrect";
            input.focus();
        }
        this.updateScore(sectionId);
    },

    next(sectionId) {
        const state = this.states[sectionId];
        state.index = (state.index + 1) % state.words.length;
        if (state.index === 0) state.score = 0; // Reset score on loop
        this.render(sectionId);
    },

    updateScore(sectionId) {
        const state = this.states[sectionId];
        const el = document.getElementById(`quizScore-${sectionId}`);
        if (el) el.textContent = `Score: ${state.score} / ${state.words.length}`;
    }
};

// ====== 3. ADJECTIVE ENGINE (INTEGRATED) ======
const AdjectiveEngine = {
    state: null,

    start() {
        // Attempt to find real adjectives from global vocabData
        let candidates = [];
        if (typeof vocabData !== 'undefined') {
            vocabData.forEach(sec => {
                const adjs = sec.words.filter(w => w.comparative || (w.de && w.de.toLowerCase().endsWith('ig') || w.de.toLowerCase().endsWith('lich')));
                candidates.push(...adjs);
            });
        }

        // Fallback if no specific adjectives found in this level
        if (candidates.length === 0) {
            candidates = [
                { de: "gut", comparative: "besser", superlative: "am besten" },
                { de: "groß", comparative: "größer", superlative: "am größten" },
                { de: "schnell", comparative: "schneller", superlative: "am schnellsten" }
            ];
        }

        const adj = candidates[Math.floor(Math.random() * candidates.length)];
        const form = Math.random() > 0.5 ? 'comparative' : 'superlative';
        
        // If the real data doesn't have forms, generate standard ones
        const expected = adj[form] || (form === 'comparative' ? adj.de + 'er' : 'am ' + adj.de + 'sten');
        
        this.state = { adj, form, expected };

        const html = `
            <div class="exercise-card">
                <p>What is the <strong>${form}</strong> of: <strong>${adj.de}</strong>?</p>
                <div class="quiz-buttons">
                    <input type="text" id="${DOM_IDS.adjInput}" class="sentence-input" placeholder="Type answer..." autocomplete="off">
                    <button class="btn btn-primary" onclick="AdjectiveEngine.check()">Check</button>
                </div>
                <div id="${DOM_IDS.adjFeedback}" class="exercise-feedback"></div>
            </div>
        `;
        const container = document.getElementById(DOM_IDS.adjContainer);
        if (container) {
            container.innerHTML = html;
            document.getElementById(DOM_IDS.adjInput).focus();
        }
    },

    check() {
        const input = document.getElementById(DOM_IDS.adjInput);
        const feedback = document.getElementById(DOM_IDS.adjFeedback);
        const userAns = input.value.trim().toLowerCase();
        const correctAns = this.state.expected.toLowerCase();

        if (userAns === correctAns) {
            feedback.textContent = '✅ Correct!';
            feedback.className = 'exercise-feedback correct';
            setTimeout(() => this.start(), 1500);
        } else {
            feedback.textContent = `❌ Try: ${this.state.expected}`;
            feedback.className = 'exercise-feedback incorrect';
            input.focus();
        }
    }
};

// ====== 4. VOCAB GRID HANDLER ======
function handleVocabClick(e) {
    const audioBtn = e.target.closest('.audio-btn');
    const card = e.target.closest('.vocab-card');

    if (audioBtn) {
        e.stopPropagation();
        AudioEngine.play(audioBtn.dataset.word);
    } else if (card) {
        const isFlipped = card.classList.toggle('flipped');
        if (isFlipped) {
            const wordDe = card.querySelector('.vocab-de').textContent;
            const definitionArea = card.querySelector('.vocab-definition-area');
            if (definitionArea && !definitionArea.dataset.loaded) {
                loadDefinition(wordDe, definitionArea);
            }
        }
    }
}

// ====== 5. DICTIONARY LOADER ======
async function loadDefinition(word, container) {
    container.innerHTML = '<div class="loading-dots">...</div>';
    container.dataset.loaded = "true";
    try {
        const response = await fetch(`/api/define/${encodeURIComponent(word)}`);
        if (!response.ok) throw new Error('404');
        const data = await response.json();
        let html = '';
        if (data.ipa) html += `<span class="vocab-ipa">/${data.ipa}/</span>`;
        if (data.definition) html += `<div class="vocab-official-def">${data.definition}</div>`;
        container.innerHTML = html || '<div class="vocab-official-def">No extra data.</div>';
        container.closest('.vocab-back').classList.add('has-definition');
    } catch (e) {
        container.innerHTML = ''; 
    }
}

// ====== 6. GLOBAL UTILS (COMPATIBILITY) ======
const AudioEngineInit = () => AudioEngine.init();
window.addEventListener('load', AudioEngineInit);

function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }

function toggleAll(sectionId) {
    const cards = document.querySelectorAll(`#grid-${sectionId} .vocab-card`);
    const anyFlipped = Array.from(cards).some(c => c.classList.contains('flipped'));
    cards.forEach(c => c.classList.toggle('flipped', !anyFlipped));
}

function shuffleCards(sectionId) {
    const grid = document.getElementById(`grid-${sectionId}`);
    const cards = Array.from(grid.children);
    cards.sort(() => Math.random() - 0.5).forEach(c => grid.appendChild(c));
}

// Quiz Wrappers
function startQuiz(sid) { QuizEngine.init(sid, vocabData.find(s => s.id === sid).words); }
function checkQuiz(sid) { QuizEngine.check(sid); }
function nextQuiz(sid) { QuizEngine.next(sid); }
function playQuizAudio(sid) {
    const state = QuizEngine.states[sid];
    if (state) AudioEngine.play(state.words[state.index].de);
}

// Sentence Wrappers
function playSentenceAudio(sid) {
    if (typeof unlimitedState !== 'undefined' && unlimitedState[sid]) {
        AudioEngine.play(unlimitedState[sid].exercise?.answer);
    }
}

// Legacy cleanup
function playAudio(t) { AudioEngine.play(t); }
function playVocabAudio(e, t) { if(e) e.stopPropagation(); AudioEngine.play(t); }
