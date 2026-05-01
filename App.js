// app.js v3.4 — MOTOR COMPLETO LEOENGLISH (Firebase, Roles, Admin Preview & Guided Route)

import { auth, db, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, getDocs } from './firebase-config.js';

// ============================================================
// ESTADO GLOBAL
// ============================================================
let state = {
    role: 'student', 
    adminView: false, // <-- NUEVO: Controla si el admin tiene los candados apagados
    xp: 0,
    level: 1,
    streak: 1,
    dailyXP: 0,
    dailyGoal: 50,
    totalAnswers: 0,
    correctAnswers: 0,
    modulesCompleted: 0,
    activityLog: [],
    scores: {
        to_be_pronouns: null, articles_dem: null, possessives: null, there_is_are: null,
        present_simple: null, present_cont: null, simple_vs_cont: null,
        numbers: null, past_to_be: null, past_simple: null, future_going_to: null, 
        prepositions: null, imperatives: null, can_could: null, future_will: null,
        comparisons: null, quantifiers: null, past_continuous: null, present_perfect: null,
        future_mixed: null, modals_obligation: null, conditionals: null, phrasal_gerunds: null
    },
    readingScores: {},
    writingDone: {},
    vocabScores: {},
    userName: 'Estudiante'
};

// ============================================================
// ESTADO DE SESIÓN (no persiste)
// ============================================================
let isChecking = false;
let currentModuleId = '';
let currentExerciseIdx = 0;
let currentScore = 0;
let currentErrors = 0;
let currentReadingId = '';
let currentReadingQIdx = 0;
let currentReadingScore = 0;
let vocabCurrentTopic = null;
let vocabMode = 'flash';

// ============================================================
// AUTENTICACIÓN Y PERSISTENCIA (FIREBASE)
// ============================================================

onAuthStateChanged(auth, (user) => {
    const loginOverlay = document.getElementById('login-overlay');
    if (user) {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        state.userName = user.displayName || user.email.split('@')[0];
        loadState(user.uid);
    } else {
        if (loginOverlay) loginOverlay.classList.remove('hidden');
    }
});

window.handleGoogleLogin = async function() {
    try {
        await signInWithPopup(auth, googleProvider);
        window.showToast('¡Bienvenido!', 'success');
    } catch (error) {
        console.error(error);
        window.showToast('Error al iniciar con Google', 'error');
    }
};

window.handleEmailLogin = async function() {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    if(!email || !pass) return window.showToast('Completa los campos', 'warn');
    
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.showToast('Sesión iniciada', 'success');
    } catch (error) {
        console.error(error);
        window.showToast('Credenciales incorrectas', 'error');
    }
};

window.handleEmailRegister = async function() {
    const email = document.getElementById('auth-email').value.trim();
    const pass = document.getElementById('auth-password').value.trim();
    if(!email || !pass) return window.showToast('Completa los campos', 'warn');
    if(pass.length < 6) return window.showToast('La contraseña debe tener al menos 6 caracteres', 'warn');
    
    try {
        await createUserWithEmailAndPassword(auth, email, pass);
        state.userName = email.split('@')[0];
        await saveState(); 
        window.showToast('Cuenta creada con éxito', 'success');
    } catch (error) {
        console.error(error);
        window.showToast('Error al crear cuenta. Quizás ya existe.', 'error');
    }
};

window.handleLogout = async function() {
    try {
        await signOut(auth);
        state = { role: 'student', adminView: false, xp: 0, level: 1, streak: 1, dailyXP: 0, dailyGoal: 50, totalAnswers: 0, correctAnswers: 0, modulesCompleted: 0, activityLog: [], scores: {}, readingScores: {}, writingDone: {}, vocabScores: {}, userName: 'Estudiante' };
        document.getElementById('auth-email').value = '';
        document.getElementById('auth-password').value = '';
        window.showScreen('dashboard');
        window.showToast('Sesión cerrada', 'success');
    } catch (error) {
        window.showToast('Error al cerrar sesión', 'error');
    }
};

async function saveState() {
    if (!auth.currentUser) return;
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, state, { merge: true });
    } catch(e) {
        console.error("Error guardando progreso: ", e);
    }
}

async function loadState(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            state = { ...state, ...docSnap.data() };
        } 
        
        // OVERRIDE DE SEGURIDAD PARA EL ADMIN
        if (auth.currentUser && auth.currentUser.email === 'joseleonardobecerrac@gmail.com') {
            state.role = 'admin';
        } else if (!docSnap.exists()) {
            state.role = 'student';
        }
        
        await saveState();
        updateHeaderUI();
        
        // LÓGICA PARA MOSTRAR/OCULTAR MODO ADMIN
        const adminZone = document.getElementById('admin-zone');
        if (adminZone && auth.currentUser) {
            if (state.role === 'admin') {
                adminZone.style.display = 'block';
            } else {
                adminZone.style.display = 'none';
            }
        }
        
        window.renderDashboard();
        lucide.createIcons();
    } catch(e) {
        console.error("Error cargando progreso: ", e);
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
window.onload = function() {
    lucide.createIcons();
};

function setGreeting() {
    const h = new Date().getHours();
    const g = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
    const el = document.getElementById('greeting-text');
    if (el) el.textContent = `${g}, ${state.userName}!`;
}

// ============================================================
// NAVEGACIÓN
// ============================================================
window.showScreen = function(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + screenId);
    if (el) { el.classList.add('active'); el.scrollTop = 0; }
    document.getElementById('main-content').scrollTop = 0;

    if (screenId === 'dashboard') window.renderDashboard();
    else if (screenId === 'reading-hub') window.renderReadingHub();
    else if (screenId === 'writing-hub') window.renderWritingHub();
    else if (screenId === 'vocab-hub') window.renderVocabHub();
    else if (screenId === 'settings') window.renderSettings();
    lucide.createIcons();
};

window.setActiveNav = function(btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

window.setActiveNavById = function(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const dashBtn = document.querySelector(`.nav-btn[onclick*="${id}"]`);
    if (dashBtn) dashBtn.classList.add('active');
};

window.toggleSidebar = function() {
    const sb = document.getElementById('sidebar');
    const icon = document.getElementById('toggle-icon');
    sb.classList.toggle('collapsed');
    const collapsed = sb.classList.contains('collapsed');
    icon.setAttribute('data-lucide', collapsed ? 'panel-left-open' : 'panel-left-close');
    lucide.createIcons();
};


// ============================================================
// DASHBOARD & LEADERBOARD
// ============================================================
window.renderDashboard = function() {
    updateHeaderUI();
    setGreeting();

    const acc = state.totalAnswers > 0 ? Math.round((state.correctAnswers / state.totalAnswers) * 100) + '%' : '—';
    safeSet('stat-xp', state.xp);
    safeSet('stat-done', state.modulesCompleted);
    safeSet('stat-streak', state.streak);
    safeSet('stat-accuracy', acc);

    const validModuleKeys = Object.keys(modulesData);
    const grammarScores = validModuleKeys.map(k => state.scores[k] || 0);
    const grammar = grammarScores.length ? Math.round(grammarScores.reduce((a,b)=>a+b,0) / grammarScores.length) : 0;
    
    const reading = Object.values(state.readingScores).length ? Math.round(Object.values(state.readingScores).reduce((a,b)=>a+b,0) / Object.values(state.readingScores).length) : 0;
    const writing = Object.values(state.writingDone).length ? Math.round(Object.values(state.writingDone).reduce((a,b)=>a+b,0) / Object.values(state.writingDone).length) : 0;
    const vocab = Object.values(state.vocabScores).length ? Math.round(Object.values(state.vocabScores).reduce((a,b)=>a+b,0) / Object.values(state.vocabScores).length) : 0;

    const skills = [
        { name: 'Gramática', val: grammar, color: '#534AB7' },
        { name: 'Vocabulario', val: vocab, color: '#1D9E75' },
        { name: 'Reading', val: reading, color: '#378ADD' },
        { name: 'Writing', val: writing, color: '#D85A30' }
    ];
    
    const barsEl = document.getElementById('skills-bars');
    if (barsEl) {
        barsEl.innerHTML = skills.map(s => `
            <div class="skill-row-item">
                <div class="skill-info"><span>${s.name}</span><span>${s.val}%</span></div>
                <div class="s-bar"><div class="s-fill" style="width:${s.val}%;background:${s.color}"></div></div>
            </div>`).join('');
    }

    const allScores = [grammar, reading, writing, vocab].filter(v => v > 0);
    const totalAvg = allScores.length ? Math.round(allScores.reduce((a,b)=>a+b,0)/allScores.length) : 0;
    safeSet('total-progress-pct', totalAvg + '%');
    const fill = document.getElementById('total-progress-fill');
    if (fill) fill.style.width = totalAvg + '%';

    renderFeedback(grammar, reading, writing, vocab);

    const rank = getrank(totalAvg);
    safeSet('rank-display', rank.name);
    const cefr = document.getElementById('cefr-badge');
    if (cefr) { cefr.textContent = rank.cefr; }

    const grid = document.getElementById('modules-status-grid');
    if (grid) {
        grid.innerHTML = '';
        
        const curriculum = [
            {
                levelName: 'Nivel A1: Fundamentos',
                color: '#38A169',
                modules: [
                    'to_be_pronouns', 'articles_dem', 'possessives', 'there_is_are',
                    'present_simple', 'present_cont', 'prepositions', 'imperatives',
                    'can_could', 'past_to_be', 'past_simple', 'future_going_to'
                ]
            },
            {
                levelName: 'Nivel A2: Explorador Avanzado',
                color: '#3182CE',
                modules: [
                    'comparisons', 'quantifiers', 'past_continuous', 'present_perfect',
                    'future_mixed', 'modals_obligation', 'conditionals', 'phrasal_gerunds'
                ]
            }
        ];

        let isLocked = false; 
        let globalModuleIndex = 1;

        curriculum.forEach(level => {
            const levelHeader = document.createElement('div');
            levelHeader.className = 'level-divider';
            levelHeader.innerHTML = `<h4 style="color:${level.color}; font-size:18px; font-weight:800; margin: 24px 0 16px 0; border-bottom: 2px solid ${level.color}30; padding-bottom: 8px;">${level.levelName}</h4>`;
            grid.appendChild(levelHeader);

            const levelGrid = document.createElement('div');
            levelGrid.className = 'modules-grid';
            levelGrid.style = 'margin-bottom: 32px;';

            level.modules.forEach(modId => {
                if(!modulesData[modId]) return; 

                const m = modulesData[modId];
                const score = state.scores[m.id];
                const isPassed = score !== null && score >= 80;
                
                // Lógica de visualización con el Modo Administrador
                let visualLocked = isLocked;
                if (state.role === 'admin' && state.adminView) {
                    visualLocked = false; // El admin rompe visualmente el candado
                }

                const isCurrent = !isPassed && !isLocked;

                const div = document.createElement('div');
                div.className = `mod-card ${isPassed ? 'mod-done' : ''} ${(!isPassed && !visualLocked) ? 'mod-current' : ''} ${visualLocked ? 'mod-locked' : ''}`;

                if (visualLocked) {
                    div.innerHTML = `
                        <div class="mod-icon-wrap">
                            <i data-lucide="lock"></i>
                        </div>
                        <div style="flex:1;min-width:0">
                            <div class="mod-title">${globalModuleIndex}. ${m.title}</div>
                            <div class="mod-status" style="color:#A0AEC0">Bloqueado</div>
                        </div>`;
                    div.onclick = () => window.showToast('Debes aprobar la lección anterior con 80% o más.', 'warn');
                } else if (isPassed) {
                    div.innerHTML = `
                        <div class="mod-icon-wrap" style="background:${m.color}18;color:${m.color}">
                            <i data-lucide="check-circle"></i>
                        </div>
                        <div style="flex:1;min-width:0">
                            <div class="mod-title">${globalModuleIndex}. ${m.title}</div>
                            <div class="mod-status" style="color:#38A169">✓ Aprobado: ${score}%</div>
                            <div class="mod-score-bar"><div class="mod-score-fill" style="width:${score}%;background:${m.color}"></div></div>
                        </div>`;
                    div.onclick = () => window.openModule(m.id);
                } else {
                    // Diseño desbloqueado (o Current normal)
                    const isAdminBypassed = state.adminView && !isCurrent;
                    
                    div.innerHTML = `
                        <div class="mod-icon-wrap" style="background:${m.color};color:white">
                            <i data-lucide="${isAdminBypassed ? 'unlock' : 'play'}"></i>
                        </div>
                        <div style="flex:1;min-width:0">
                            <div class="mod-title">${globalModuleIndex}. ${m.title}</div>
                            <div class="mod-status" style="color:var(--primary-mid);font-weight:800;">
                                ${isAdminBypassed ? 'Admin: Desbloqueado' : 'Siguiente lección'}
                            </div>
                            ${score !== null ? `<div style="font-size:11px; color:#E53E3E; margin-top:4px;">Último intento: ${score}% (Necesitas 80%)</div>` : ''}
                        </div>`;
                    div.onclick = () => window.openModule(m.id);
                }
                
                // El motor real sigue bloqueando el resto si no has superado este
                if (!isPassed) {
                    isLocked = true; 
                }
                
                levelGrid.appendChild(div);
                globalModuleIndex++;
            });

            grid.appendChild(levelGrid);
        });
        
        lucide.createIcons();
    }

    renderActivity();
    renderLeaderboard();
};

async function renderLeaderboard() {
    const lbContainer = document.getElementById('leaderboard-list');
    if (!lbContainer) return;

    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        
        let usersList = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            usersList.push({
                id: doc.id,
                name: data.userName || 'Jugador',
                xp: data.xp || 0,
                level: data.level || 1
            });
        });

        usersList.sort((a, b) => b.xp - a.xp);

        if (usersList.length === 0) {
            lbContainer.innerHTML = '<div class="activity-empty">Aún no hay datos familiares.</div>';
            return;
        }

        lbContainer.innerHTML = usersList.map((u, index) => {
            const isFirst = index === 0;
            const isMe = auth.currentUser && auth.currentUser.uid === u.id;
            const rankDisplay = isFirst ? '👑' : `${index + 1}`;
            const initial = u.name.charAt(0).toUpperCase();
            
            return `
            <div class="leaderboard-item ${isMe ? 'lb-me' : ''}">
                <div class="lb-rank ${isFirst ? 'rank-1' : ''}">${rankDisplay}</div>
                <div class="lb-avatar">${initial}</div>
                <div class="lb-info">
                    <span class="lb-name">${u.name} ${isMe ? '(Tú)' : ''}</span>
                    <span class="lb-level">Nivel ${u.level}</span>
                </div>
                <div class="lb-xp">${u.xp} XP</div>
            </div>`;
        }).join('');

    } catch (error) {
        console.error("Error cargando leaderboard:", error);
        lbContainer.innerHTML = '<div class="activity-empty" style="color:#E53E3E;">Error al cargar el ranking.</div>';
    }
}

function renderFeedback(grammar, reading, writing, vocab) {
    const el = document.getElementById('teacher-feedback');
    if (!el) return;
    const items = [];
    if (state.modulesCompleted === 0) {
        items.push({ type: 'fb-info', icon: 'info', text: '¡Bienvenido! Completa tu primer módulo para recibir feedback personalizado.' });
    } else {
        if (grammar >= 80) items.push({ type: 'fb-success', icon: 'check-circle', text: `Excelente dominio de la gramática (${grammar}%). ¡Sigue así!` });
        else if (grammar > 0) items.push({ type: 'fb-warn', icon: 'alert-triangle', text: `Tu gramática está en ${grammar}%. Repasa los tiempos verbales.` });
        
        if (reading >= 80) items.push({ type: 'fb-success', icon: 'check-circle', text: `Muy buena comprensión lectora (${reading}%).` });
        else if (reading > 0) items.push({ type: 'fb-warn', icon: 'alert-triangle', text: `Practica más reading. Tu comprensión actual: ${reading}%.` });
        else items.push({ type: 'fb-info', icon: 'book-open', text: 'Aún no has practicado Reading. ¡Prueba los textos graduados!' });
        
        if (writing > 0 && writing < 70) items.push({ type: 'fb-warn', icon: 'pen-line', text: `Tu writing necesita práctica. Intenta los ejercicios guiados.` });
        if (vocab > 0) items.push({ type: 'fb-success', icon: 'layers', text: `Has estudiado vocabulario con ${vocab}% de precisión.` });
    }
    el.innerHTML = items.map(i => `<div class="fb-item ${i.type}"><i data-lucide="${i.icon}"></i><span>${i.text}</span></div>`).join('') || '<div class="fb-item fb-info"><i data-lucide="info"></i><span>Sigue completando módulos.</span></div>';
}

function renderActivity() {
    const el = document.getElementById('activity-log');
    if (!el) return;
    if (state.activityLog.length === 0) {
        el.innerHTML = '<div class="activity-empty">Aún no hay actividad. ¡Empieza una lección!</div>';
        return;
    }
    el.innerHTML = state.activityLog.slice(0, 6).map(a => `
        <div class="activity-item">
            <div class="activity-dot" style="background:${a.color||'#534AB7'}"></div>
            <div class="activity-text">${a.text}</div>
            <div class="activity-xp">+${a.xp} XP</div>
            <div class="activity-time">${a.time}</div>
        </div>`).join('');
}

function getrank(avg) {
    if (avg >= 90) return { name: 'Maestro del Inglés', cefr: 'B1' };
    if (avg >= 75) return { name: 'Explorador Avanzado', cefr: 'A2+' };
    if (avg >= 50) return { name: 'Viajero del Idioma', cefr: 'A2' };
    if (avg >= 25) return { name: 'Aprendiz Curioso', cefr: 'A1+' };
    return { name: 'Explorador Novato', cefr: 'A1' };
}

// ============================================================
// MÓDULOS DE GRAMÁTICA
// ============================================================
window.openModule = function(modId) {
    currentModuleId = modId;
    currentExerciseIdx = 0;
    currentScore = 0;
    currentErrors = 0;
    isChecking = false;
    window.showScreen('module');
    const mod = modulesData[modId];
    const content = document.getElementById('module-content');
    content.innerHTML = `
        <div class="lesson-header">
            <button class="back-btn" onclick="showScreen('dashboard');setActiveNavById('dashboard')">
                <i data-lucide="arrow-left"></i> Volver
            </button>
            <span class="lesson-title">${mod.title}</span>
        </div>
        <div class="tab-nav">
            <button class="tab-btn active" id="btn-theory" onclick="setPhase('theory')"><i data-lucide="book-open" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i> Teoría</button>
            <button class="tab-btn" id="btn-practice" onclick="setPhase('practice')"><i data-lucide="zap" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px"></i> Ejercicios (${mod.exercises.length})</button>
        </div>
        <div id="phase-content"></div>`;
    lucide.createIcons();
    window.setPhase('theory');
};

window.setPhase = function(phase) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + phase);
    if (btn) btn.classList.add('active');
    const mod = modulesData[currentModuleId];
    const content = document.getElementById('phase-content');
    
    if (phase === 'theory') {
        content.innerHTML = `
            <div class="card-theory animate-pop">${mod.theory}
                <div style="text-align:right;margin-top:20px">
                    <button class="btn-check" onclick="setPhase('practice')">
                        <i data-lucide="zap"></i> Empezar ejercicios →
                    </button>
                </div>
            </div>`;
        lucide.createIcons();
    } else {
        currentExerciseIdx = 0; currentScore = 0; currentErrors = 0; isChecking = false;
        renderExercise();
    }
};

function renderExercise() {
    isChecking = false;
    const mod = modulesData[currentModuleId];
    const q = mod.exercises[currentExerciseIdx];
    const dots = mod.exercises.map((_, i) => `<div class="ex-dot ${i < currentExerciseIdx ? 'done' : i === currentExerciseIdx ? 'current' : ''}"></div>`).join('');
    const typeLabel = q.type === 'choice' ? 'Selección múltiple' : q.type === 'write' ? 'Escritura' : 'Ordenar';
    const typeIcon = q.type === 'choice' ? 'list' : q.type === 'write' ? 'pen-line' : 'move';

    let bodyHtml = '';
    if (q.type === 'choice') {
        bodyHtml = `<div class="opts-grid">${q.opts.map(o => `<button class="opt-btn" onclick="checkChoice('${o.replace(/'/g,"\\'")}','${q.a.replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}</div>`;
    } else if (q.type === 'write') {
        bodyHtml = `
            <input type="text" id="write-answer" class="write-input" placeholder="Escribe tu respuesta aquí..."
                onkeypress="if(event.key==='Enter')checkWrite()" autocomplete="off">
            <div class="btn-row">
                <button class="btn-check" onclick="checkWrite()"><i data-lucide="check"></i> Comprobar</button>
            </div>`;
    } else if (q.type === 'order') {
        window.orderAvail = [...q.words].sort(() => Math.random() - 0.5);
        window.orderSel = [];
        window.orderCorrect = q.a;
        bodyHtml = `<div id="order-ui"></div>`;
    }

    document.getElementById('phase-content').innerHTML = `
        <div class="exercise-card animate-pop">
            <div class="ex-meta"><i data-lucide="${typeIcon}"></i> ${typeLabel} · Ejercicio ${currentExerciseIdx + 1} / ${mod.exercises.length}</div>
            <div class="ex-progress">${dots}</div>
            <div class="ex-q">${q.q}</div>
            ${bodyHtml}
            <div id="ex-feedback"></div>
        </div>`;
    lucide.createIcons();
    if (q.type === 'order') drawOrderUI();
    if (q.type === 'write') setTimeout(() => { const inp = document.getElementById('write-answer'); if(inp) inp.focus(); }, 100);
}

function drawOrderUI() {
    const c = document.getElementById('order-ui');
    if (!c) return;
    const allDone = window.orderAvail.length === 0;
    c.innerHTML = `
        <div class="order-zone" id="order-zone">
            ${window.orderSel.length === 0 ? '<span style="color:#A0AEC0;font-size:13px">Toca las palabras para construir la frase...</span>' : ''}
            <div class="order-words-pool" style="justify-content:center">
                ${window.orderSel.map((w,i) => `<div class="order-word in-zone" onclick="moveWord(${i},'back')">${w}</div>`).join('')}
            </div>
        </div>
        <div class="order-words-pool">
            ${window.orderAvail.map((w,i) => `<div class="order-word" onclick="moveWord(${i},'add')">${w}</div>`).join('')}
        </div>
        <div class="btn-row">
            <button class="btn-check" onclick="checkOrder()" ${!allDone?'disabled style="opacity:0.5;cursor:not-allowed"':''}>
                <i data-lucide="check"></i> Evaluar frase
            </button>
            <button class="btn" style="padding:10px 18px;border:1.5px solid #E2E8F0;border-radius:12px;background:white;cursor:pointer;font-size:13px" onclick="resetOrder()">
                Reiniciar
            </button>
        </div>`;
    lucide.createIcons();
}

window.moveWord = function(idx, dir) {
    if (dir === 'add') { window.orderSel.push(window.orderAvail.splice(idx, 1)[0]); }
    else { window.orderAvail.push(window.orderSel.splice(idx, 1)[0]); }
    drawOrderUI();
};

window.resetOrder = function() {
    const all = [...window.orderSel, ...window.orderAvail].sort(() => Math.random() - 0.5);
    window.orderSel = []; window.orderAvail = all;
    drawOrderUI();
};

window.checkChoice = function(val, correct, btn) {
    if (isChecking) return;
    isChecking = true;
    state.totalAnswers++;
    document.querySelectorAll('.opt-btn').forEach(b => { b.disabled = true; });
    if (val === correct) {
        btn.classList.add('correct');
        state.correctAnswers++; currentScore++;
        showFeedback(true, `¡Correcto! "${correct}" es la respuesta exacta.`);
        addXP(10, true);
    } else {
        btn.classList.add('wrong');
        document.querySelectorAll('.opt-btn').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
        currentErrors++;
        showFeedback(false, `Incorrecto. La respuesta correcta es "<strong>${correct}</strong>".`);
    }
    saveState();
    setTimeout(() => advanceExercise(), 1600);
};

window.checkWrite = function() {
    if (isChecking) return;
    const input = document.getElementById('write-answer');
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    if (!val) { window.showToast('Escribe tu respuesta primero', 'warn'); return; }
    isChecking = true;
    state.totalAnswers++;
    const mod = modulesData[currentModuleId];
    const correct = mod.exercises[currentExerciseIdx].a.toLowerCase();
    
    if (val === correct) {
        input.classList.add('correct');
        state.correctAnswers++; currentScore++;
        showFeedback(true, `¡Perfecto! "${mod.exercises[currentExerciseIdx].a}" es correcto.`);
        addXP(15, true);
    } else {
        input.classList.add('wrong');
        input.value = mod.exercises[currentExerciseIdx].a;
        currentErrors++;
        showFeedback(false, `Incorrecto. La respuesta es "<strong>${mod.exercises[currentExerciseIdx].a}</strong>".`);
    }
    saveState();
    setTimeout(() => advanceExercise(), 1800);
};

window.checkOrder = function() {
    if (isChecking) return;
    isChecking = true;
    state.totalAnswers++;
    const sentence = window.orderSel.join(' ').trim();
    const zone = document.getElementById('order-zone');
    if (sentence === window.orderCorrect.trim()) {
        if (zone) zone.classList.add('correct');
        state.correctAnswers++; currentScore++;
        showFeedback(true, `¡Sintaxis perfecta! "${window.orderCorrect}"`);
        addXP(20, true);
    } else {
        if (zone) zone.classList.add('wrong');
        currentErrors++;
        showFeedback(false, `Incorrecto. La frase correcta es: "<strong>${window.orderCorrect}</strong>".`);
    }
    saveState();
    setTimeout(() => advanceExercise(), 2000);
};

function showFeedback(ok, msg) {
    const el = document.getElementById('ex-feedback');
    if (!el) return;
    el.innerHTML = `<div class="ex-feedback ${ok?'success':'error'}">
        <i data-lucide="${ok?'check-circle':'x-circle'}"></i><span>${msg}</span></div>`;
    lucide.createIcons();
}

function advanceExercise() {
    isChecking = false;
    currentExerciseIdx++;
    const mod = modulesData[currentModuleId];
    if (currentExerciseIdx < mod.exercises.length) {
        renderExercise();
    } else {
        finishModule();
    }
}

function finishModule() {
    const mod = modulesData[currentModuleId];
    const total = mod.exercises.length;
    const pct = Math.round((currentScore / total) * 100);
    const prev = state.scores[currentModuleId];
    state.scores[currentModuleId] = prev !== null ? Math.max(prev, pct) : pct;
    if (prev === null) state.modulesCompleted++;

    const xpBonus = pct >= 80 ? 60 : pct >= 60 ? 40 : 20;
    addXP(xpBonus, false);
    logActivity(`Módulo "${mod.title}" completado`, xpBonus, mod.color);

    const stars = pct >= 80 ? 3 : pct >= 60 ? 2 : 1;
    const starsHtml = [1,2,3].map(i => `<span class="star ${i<=stars?'lit':''}">★</span>`).join('');
    const msg = pct >= 80 ? '¡Dominio excelente! Eres un pro.' : pct >= 60 ? 'Buen trabajo. Repasa algún punto.' : 'Sigue practicando. ¡Tú puedes!';

    document.getElementById('phase-content').innerHTML = `
        <div class="results-card animate-pop">
            <div class="stars-row">${starsHtml}</div>
            <div class="results-score">${pct}%</div>
            <p class="results-msg">${msg}</p>
            <div class="results-detail">
                <span class="results-pill pill-good">✓ ${currentScore} correctas</span>
                <span class="results-pill pill-bad">✗ ${currentErrors} errores</span>
                <span class="results-pill pill-xp">+${xpBonus} XP</span>
            </div>
            <div class="btn-row">
                <button class="btn-check" onclick="setPhase('practice')" style="background:#718096">
                    <i data-lucide="refresh-cw"></i> Repetir
                </button>
                <button class="btn-check" onclick="showScreen('dashboard');setActiveNavById('dashboard')">
                    <i data-lucide="layout-dashboard"></i> Tablero
                </button>
            </div>
        </div>`;
    lucide.createIcons();
    saveState();
}

// ============================================================
// READING HUB
// ============================================================
window.renderReadingHub = function() {
    const el = document.getElementById('reading-hub-content');
    if (!el) return;
    el.innerHTML = `
        <div class="reading-grid">
            ${readingTexts.map(r => {
                const score = state.readingScores[r.id];
                const done = score != null;
                return `<div class="reading-card" onclick="openReading('${r.id}')">
                    <div class="reading-card-banner" style="background:${r.levelColor}"></div>
                    <div class="reading-card-body">
                        <span class="reading-level-badge" style="background:${r.levelColor}20;color:${r.levelColor}">${r.level} · ${r.topic}</span>
                        <div class="reading-card-title">${r.title}</div>
                        <div class="reading-card-desc">${r.desc}</div>
                    </div>
                    <div class="reading-card-footer">
                        <span>${r.questions} preguntas</span>
                        <span style="font-weight:700;color:${done?'#38A169':'#A0AEC0'}">${done ? `✓ ${score}%` : 'Sin completar'}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
};

window.openReading = function(id) {
    currentReadingId = id;
    currentReadingQIdx = 0;
    currentReadingScore = 0;
    isChecking = false;
    const r = readingTexts.find(x => x.id === id);
    if (!r) return;
    const el = document.getElementById('reading-hub-content');
    el.innerHTML = `
        <div style="margin-bottom:12px">
            <button class="back-btn" onclick="renderReadingHub()">
                <i data-lucide="arrow-left"></i> Volver a textos
            </button>
        </div>
        <div class="reading-lesson-wrap">
            <div class="reading-text-area">
                <div class="reading-title">${r.title}</div>
                <div class="reading-meta">Nivel ${r.level} · ${r.topic} · Toca las palabras <span style="border-bottom:2px solid #63B3ED;color:#2B6CB0;font-weight:600">subrayadas</span> para ver la traducción</div>
                <div class="reading-body">${r.body}</div>
            </div>
            <div class="reading-qs">
                <h4>Preguntas de comprensión</h4>
                <div id="reading-q-zone"></div>
            </div>
        </div>`;
    lucide.createIcons();
    renderReadingQ(r);
};

function renderReadingQ(r) {
    if (currentReadingQIdx >= r.qs.length) {
        finishReading(r);
        return;
    }
    const q = r.qs[currentReadingQIdx];
    isChecking = false;
    const zone = document.getElementById('reading-q-zone');
    zone.innerHTML = `
        <div style="margin-bottom:10px;font-size:12px;color:#A0AEC0;font-weight:700">
            Pregunta ${currentReadingQIdx + 1} de ${r.qs.length}
        </div>
        <div class="ex-q" style="font-size:16px;text-align:left;margin-bottom:16px">${q.q}</div>
        <div class="opts-grid">
            ${q.opts.map((o, i) => `<button class="opt-btn" onclick="checkReadingQ(${i},${q.a},this,'${q.exp.replace(/'/g,"\\'")}',document.getElementById('rq-fb'))">${o}</button>`).join('')}
        </div>
        <div id="rq-fb"></div>`;
    lucide.createIcons();
}

window.checkReadingQ = function(chosen, correct, btn, exp, fbEl) {
    if (isChecking) return;
    isChecking = true;
    state.totalAnswers++;
    document.querySelectorAll('.opts-grid .opt-btn').forEach(b => b.disabled = true);
    if (chosen === correct) {
        btn.classList.add('correct');
        state.correctAnswers++; currentReadingScore++;
        if (fbEl) fbEl.innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i><span>¡Correcto! ${exp}</span></div>`;
        addXP(10, true);
    } else {
        btn.classList.add('wrong');
        document.querySelectorAll('.opts-grid .opt-btn')[correct].classList.add('correct');
        if (fbEl) fbEl.innerHTML = `<div class="ex-feedback error"><i data-lucide="x-circle"></i><span>Incorrecto. ${exp}</span></div>`;
    }
    lucide.createIcons();
    saveState();
    setTimeout(() => {
        const r = readingTexts.find(x => x.id === currentReadingId);
        currentReadingQIdx++;
        renderReadingQ(r);
    }, 1800);
};

function finishReading(r) {
    const pct = Math.round((currentReadingScore / r.qs.length) * 100);
    const prev = state.readingScores[r.id];
    state.readingScores[r.id] = prev != null ? Math.max(prev, pct) : pct;
    const xpBonus = pct >= 80 ? 50 : pct >= 60 ? 30 : 15;
    addXP(xpBonus, false);
    logActivity(`Reading "${r.title}" completado`, xpBonus, r.levelColor);
    const stars = pct >= 80 ? 3 : pct >= 60 ? 2 : 1;
    const starsHtml = [1,2,3].map(i => `<span class="star ${i<=stars?'lit':''}">★</span>`).join('');
    const zone = document.getElementById('reading-q-zone');
    zone.innerHTML = `
        <div class="results-card animate-pop" style="border:none;box-shadow:none;padding:20px 0">
            <div class="stars-row">${starsHtml}</div>
            <div class="results-score">${pct}%</div>
            <p class="results-msg">${pct>=80?'¡Lectura dominada!':pct>=60?'Buena comprensión. Relee el texto.':'Vuelve a leer el texto con calma.'}</p>
            <div class="results-detail">
                <span class="results-pill pill-good">✓ ${currentReadingScore}/${r.qs.length}</span>
                <span class="results-pill pill-xp">+${xpBonus} XP</span>
            </div>
            <div class="btn-row">
                <button class="btn-check" onclick="openReading('${r.id}')" style="background:#718096"><i data-lucide="refresh-cw"></i> Repetir</button>
                <button class="btn-check" onclick="renderReadingHub()"><i data-lucide="book-marked"></i> Más textos</button>
            </div>
        </div>`;
    lucide.createIcons();
    saveState();
}

// ============================================================
// WRITING HUB
// ============================================================
window.renderWritingHub = function() {
    const el = document.getElementById('writing-hub-content');
    if (!el) return;
    el.innerHTML = `
        <div class="writing-grid">
            ${writingExercises.map(ex => {
                const done = state.writingDone[ex.id] != null;
                const score = state.writingDone[ex.id];
                return `<div class="writing-ex-card" onclick="openWriting('${ex.id}')">
                    <span class="writing-type-badge" style="background:${ex.typeColor}20;color:${ex.typeColor}">${ex.typeLabel}</span>
                    <div class="writing-ex-title">${ex.title}</div>
                    <div class="writing-ex-desc">${ex.desc}</div>
                    ${done ? `<div style="margin-top:10px;font-size:12px;font-weight:700;color:#38A169">✓ Completado: ${score}%</div>` : '<div style="margin-top:10px;font-size:12px;color:#A0AEC0">Sin completar</div>'}
                </div>`;
            }).join('')}
        </div>`;
};

window.openWriting = function(id) {
    const ex = writingExercises.find(x => x.id === id);
    if (!ex) return;
    const el = document.getElementById('writing-hub-content');

    if (ex.type === 'order') {
        window.wOrderTasks = ex.tasks;
        window.wOrderIdx = 0;
        window.wOrderScore = 0;
        el.innerHTML = `
            <div style="margin-bottom:12px"><button class="back-btn" onclick="renderWritingHub()"><i data-lucide="arrow-left"></i> Volver</button></div>
            <div class="exercise-card animate-pop">
                <div class="ex-meta"><i data-lucide="move"></i> ${ex.title}</div>
                <div id="w-order-ui"></div>
            </div>`;
        lucide.createIcons();
        renderWritingOrder();
        return;
    }

    if (ex.type === 'transform') {
        window.wTransTasks = ex.tasks;
        window.wTransIdx = 0;
        window.wTransScore = 0;
        el.innerHTML = `
            <div style="margin-bottom:12px"><button class="back-btn" onclick="renderWritingHub()"><i data-lucide="arrow-left"></i> Volver</button></div>
            <div class="exercise-card animate-pop">
                <div class="ex-meta"><i data-lucide="pen-line"></i> ${ex.title}</div>
                <div id="w-trans-ui"></div>
            </div>`;
        lucide.createIcons();
        renderWritingTransform();
        return;
    }

    if (ex.type === 'free') {
        window.wFreeTasks = ex.tasks;
        window.wFreeIdx = 0;
        window.wFreeScore = 0;
        el.innerHTML = `
            <div style="margin-bottom:12px"><button class="back-btn" onclick="renderWritingHub()"><i data-lucide="arrow-left"></i> Volver</button></div>
            <div class="exercise-card animate-pop">
                <div class="ex-meta"><i data-lucide="pen-line"></i> ${ex.title}</div>
                <div id="w-free-ui"></div>
            </div>`;
        lucide.createIcons();
        renderWritingFree();
        return;
    }
};

function renderWritingOrder() {
    const ui = document.getElementById('w-order-ui');
    if (!ui) return;
    const t = window.wOrderTasks[window.wOrderIdx];
    if (!t) { finishWriting('word_order_basic', window.wOrderScore, window.wOrderTasks.length); return; }
    window.woAvail = [...t.words].sort(() => Math.random() - 0.5);
    window.woSel = [];
    window.woCurrent = t.answer;
    ui.innerHTML = `
        <div class="ex-q">${t.prompt}</div>
        <div class="tip-callout" style="margin-bottom:16px"><i data-lucide="lightbulb"></i> ${t.tip}</div>
        <div class="order-zone" id="wo-zone">
            <div class="order-words-pool" id="wo-sel"></div>
        </div>
        <div class="order-words-pool" id="wo-avail"></div>
        <div id="wo-fb"></div>
        <div class="btn-row">
            <button class="btn-check" id="wo-check-btn" onclick="checkWritingOrder()" disabled style="opacity:0.5;cursor:not-allowed">
                <i data-lucide="check"></i> Comprobar
            </button>
        </div>`;
    lucide.createIcons();
    refreshWritingOrder();
}

function refreshWritingOrder() {
    const selEl = document.getElementById('wo-sel');
    const availEl = document.getElementById('wo-avail');
    if (selEl) selEl.innerHTML = window.woSel.map((w,i)=>`<div class="order-word in-zone" onclick="woMove(${i},'back')">${w}</div>`).join('') || '<span style="color:#A0AEC0;font-size:13px">Selecciona palabras...</span>';
    if (availEl) availEl.innerHTML = window.woAvail.map((w,i)=>`<div class="order-word" onclick="woMove(${i},'add')">${w}</div>`).join('');
    const btn = document.getElementById('wo-check-btn');
    if (btn) { const ok = window.woAvail.length === 0; btn.disabled = !ok; btn.style.opacity = ok ? '1' : '0.5'; btn.style.cursor = ok ? 'pointer' : 'not-allowed'; }
}

window.woMove = function(i, dir) {
    if (dir === 'add') { window.woSel.push(window.woAvail.splice(i,1)[0]); }
    else { window.woAvail.push(window.woSel.splice(i,1)[0]); }
    refreshWritingOrder();
};

window.checkWritingOrder = function() {
    const sentence = window.woSel.join(' ').trim();
    const fb = document.getElementById('wo-fb');
    state.totalAnswers++;
    if (sentence === window.woCurrent.trim()) {
        state.correctAnswers++; window.wOrderScore++;
        if (fb) fb.innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i> ¡Correcto! "${window.woCurrent}"</div>`;
        addXP(15, true);
    } else {
        if (fb) fb.innerHTML = `<div class="ex-feedback error"><i data-lucide="x-circle"></i> La frase correcta es: "<strong>${window.woCurrent}</strong>"</div>`;
    }
    lucide.createIcons();
    saveState();
    setTimeout(() => { window.wOrderIdx++; renderWritingOrder(); }, 1800);
};

function renderWritingTransform() {
    const ui = document.getElementById('w-trans-ui');
    if (!ui) return;
    const t = window.wTransTasks[window.wTransIdx];
    if (!t) { finishWriting('sentence_transform', window.wTransScore, window.wTransTasks.length); return; }
    ui.innerHTML = `
        <div class="ex-q" style="text-align:left">${t.prompt}</div>
        <div class="tip-callout" style="margin-bottom:14px"><i data-lucide="lightbulb"></i> ${t.tip}</div>
        <input type="text" id="wt-input" class="write-input" placeholder="Escribe la frase transformada..." autocomplete="off">
        <div id="wt-fb"></div>
        <div class="btn-row">
            <button class="btn-check" onclick="checkWritingTransform('${t.answer.replace(/'/g,"\\'")}')">
                <i data-lucide="check"></i> Comprobar
            </button>
        </div>`;
    lucide.createIcons();
    setTimeout(() => { const i = document.getElementById('wt-input'); if(i) i.focus(); }, 100);
}

window.checkWritingTransform = function(correct) {
    const inp = document.getElementById('wt-input');
    if (!inp) return;
    const val = inp.value.trim().toLowerCase();
    const fb = document.getElementById('wt-fb');
    state.totalAnswers++;
    if (val === correct.toLowerCase()) {
        state.correctAnswers++; window.wTransScore++;
        inp.classList.add('correct');
        if (fb) fb.innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i> ¡Perfecto!</div>`;
        addXP(15, true);
    } else {
        inp.classList.add('wrong');
        if (fb) fb.innerHTML = `<div class="ex-feedback error"><i data-lucide="x-circle"></i> La respuesta correcta es: "<strong>${correct}</strong>"</div>`;
    }
    lucide.createIcons();
    saveState();
    setTimeout(() => { window.wTransIdx++; renderWritingTransform(); }, 1800);
};

function renderWritingFree() {
    const ui = document.getElementById('w-free-ui');
    if (!ui) return;
    const t = window.wFreeTasks[window.wFreeIdx];
    if (!t) { finishWriting('free_writing', window.wFreeScore, window.wFreeTasks.length); return; }
    ui.innerHTML = `
        <div class="ex-q" style="text-align:left;margin-bottom:16px">${t.prompt}</div>
        <div class="tip-callout" style="margin-bottom:12px"><i data-lucide="lightbulb"></i> <strong>Guía:</strong> ${t.hint}</div>
        <div style="background:#F7FAFC;border:1px dashed #CBD5E0;border-radius:10px;padding:12px;margin-bottom:12px;font-size:13px;color:#718096">
            <strong>Ejemplo:</strong> ${t.example}
        </div>
        <textarea id="wf-area" class="writing-textarea" placeholder="Escribe aquí tu respuesta en inglés..."></textarea>
        <div id="wf-fb"></div>
        <div class="btn-row">
            <button class="btn-check" onclick="checkFreeWriting(${t.minWords})">
                <i data-lucide="send"></i> Enviar
            </button>
        </div>`;
    lucide.createIcons();
}

window.checkFreeWriting = function(minWords) {
    const area = document.getElementById('wf-area');
    const fb = document.getElementById('wf-fb');
    if (!area) return;
    const val = area.value.trim();
    const words = val.split(/\s+/).filter(w => w.length > 0).length;
    if (words < 5) { window.showToast('Escribe al menos algunas oraciones.', 'warn'); return; }
    state.totalAnswers++;
    if (words >= minWords) {
        state.correctAnswers++; window.wFreeScore++;
        if (fb) fb.innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i> ¡Muy bien! Escribiste ${words} palabras. Tu producción escrita está mejorando.</div>`;
        addXP(20, true);
    } else {
        if (fb) fb.innerHTML = `<div class="ex-feedback error"><i data-lucide="alert-circle"></i> Escribiste ${words} palabras. Intenta añadir más detalles (mínimo ${minWords} palabras).</div>`;
    }
    lucide.createIcons();
    saveState();
    setTimeout(() => { window.wFreeIdx++; renderWritingFree(); }, 2200);
};

function finishWriting(id, score, total) {
    const pct = Math.round((score / total) * 100);
    const prev = state.writingDone[id];
    state.writingDone[id] = prev != null ? Math.max(prev, pct) : pct;
    const xpBonus = pct >= 80 ? 40 : pct >= 60 ? 25 : 15;
    addXP(xpBonus, false);
    logActivity('Ejercicio de Writing completado', xpBonus, '#D85A30');
    const ex = writingExercises.find(x => x.id === id);
    const ui = document.getElementById('w-order-ui') || document.getElementById('w-trans-ui') || document.getElementById('w-free-ui');
    if (!ui) return;
    ui.innerHTML = `
        <div class="results-card animate-pop" style="border:none;box-shadow:none;padding:20px 0">
            <div class="results-score">${pct}%</div>
            <p class="results-msg">${pct>=80?'¡Escritura excelente!':pct>=60?'Buen esfuerzo. Sigue practicando.':'La escritura mejora con la práctica.'}</p>
            <div class="results-detail">
                <span class="results-pill pill-good">✓ ${score}/${total}</span>
                <span class="results-pill pill-xp">+${xpBonus} XP</span>
            </div>
            <div class="btn-row">
                <button class="btn-check" onclick="renderWritingHub()"><i data-lucide="pen-line"></i> Más ejercicios</button>
            </div>
        </div>`;
    lucide.createIcons();
    saveState();
}

// ============================================================
// VOCABULARY HUB CON WEB SPEECH API
// ============================================================
window.renderVocabHub = function() {
    const el = document.getElementById('vocab-hub-content');
    if (!el) return;
    el.innerHTML = `
        <div class="vocab-topics-grid" id="vocab-topics-grid">
            ${vocabTopics.map(t => {
                const score = state.vocabScores[t.id];
                return `<div class="vocab-topic-card" onclick="openVocabTopic('${t.id}')">
                    <div class="vocab-topic-icon">${t.icon}</div>
                    <div class="vocab-topic-title">${t.title}</div>
                    <div class="vocab-topic-count">${t.count} palabras</div>
                    ${score != null ? `<div style="margin-top:6px;font-size:12px;font-weight:700;color:#38A169">✓ ${score}%</div>` : ''}
                </div>`;
            }).join('')}
        </div>`;
};

window.openVocabTopic = function(id) {
    vocabCurrentTopic = vocabTopics.find(t => t.id === id);
    if (!vocabCurrentTopic) return;
    vocabMode = 'flash';
    const el = document.getElementById('vocab-hub-content');
    el.innerHTML = `
        <div style="margin-bottom:12px">
            <button class="back-btn" onclick="renderVocabHub()"><i data-lucide="arrow-left"></i> Volver a temas</button>
        </div>
        <div class="lesson-title" style="margin-bottom:16px">${vocabCurrentTopic.icon} ${vocabCurrentTopic.title}</div>
        <div class="vocab-tabs">
            <button class="vocab-tab active" id="vtab-flash" onclick="setVocabMode('flash',this)">Tarjetas</button>
            <button class="vocab-tab" id="vtab-match" onclick="setVocabMode('match',this)">Conectar</button>
            <button class="vocab-tab" id="vtab-quiz" onclick="setVocabMode('quiz',this)">Quiz</button>
        </div>
        <div id="vocab-mode-content"></div>`;
    lucide.createIcons();
    renderVocabFlash();
};

window.setVocabMode = function(mode, btn) {
    vocabMode = mode;
    document.querySelectorAll('.vocab-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (mode === 'flash') renderVocabFlash();
    else if (mode === 'match') renderVocabMatch();
    else renderVocabQuiz();
};

function renderVocabFlash() {
    const c = document.getElementById('vocab-mode-content');
    const words = vocabCurrentTopic.words;
    c.innerHTML = `
        <p style="font-size:13px;color:#718096;margin-bottom:14px">Toca el ícono para escuchar, o toca la tarjeta para ver la traducción.</p>
        <div class="flashcard-grid">
            ${words.map((w,i) => `
                <div class="flashcard" id="fc${i}" onclick="this.classList.toggle('flipped')">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <button class="btn-audio" onclick="playAudio('${w.en.replace(/'/g,"\\'")}', 'en-US', event)" title="Escuchar">
                                <i data-lucide="volume-2"></i>
                            </button>
                            <div class="card-word">${w.en}</div>
                            <div class="card-hint">Toca para ver</div>
                        </div>
                        <div class="flashcard-back">
                            <div class="card-word">${w.es}</div>
                            <div class="card-hint">${w.example}</div>
                        </div>
                    </div>
                </div>`).join('')}
        </div>`;
    lucide.createIcons();
}

function renderVocabMatch() {
    const c = document.getElementById('vocab-mode-content');
    const words = vocabCurrentTopic.words.slice(0, 8);
    const lefts = words.map((w, i) => ({ id: 'L' + i, text: w.en, pair: i }));
    const rights = [...words.map((w, i) => ({ id: 'R' + i, text: w.es, pair: i }))].sort(() => Math.random() - 0.5);
    window.matchState = { lefts, rights, matched: [], firstSel: null, errors: 0, correct: 0 };

    c.innerHTML = `
        <p style="font-size:13px;color:#718096;margin-bottom:14px">Conecta cada palabra con su traducción.</p>
        <div class="match-game-grid">
            <div class="match-col" id="match-left">${lefts.map(l=>`<button class="match-btn" id="${l.id}" onclick="selectMatch('${l.id}',${l.pair},'L')">${l.text}</button>`).join('')}</div>
            <div class="match-col" id="match-right">${rights.map(r=>`<button class="match-btn" id="${r.id}" onclick="selectMatch('${r.id}',${r.pair},'R')">${r.text}</button>`).join('')}</div>
        </div>
        <div id="match-result" style="margin-top:16px"></div>`;
}

window.selectMatch = function(id, pair, side) {
    const ms = window.matchState;
    const el = document.getElementById(id);
    if (!el || el.classList.contains('matched')) return;

    if (side === 'L') {
        const wordData = ms.lefts.find(l => l.id === id);
        if (wordData) window.playAudio(wordData.text, 'en-US');
    }

    if (!ms.firstSel) {
        if (ms.firstSel && ms.firstSel.id !== id) document.getElementById(ms.firstSel.id).classList.remove('selected');
        ms.firstSel = { id, pair, side };
        el.classList.add('selected');
    } else {
        if (ms.firstSel.id === id) { el.classList.remove('selected'); ms.firstSel = null; return; }
        if (ms.firstSel.side === side) {
            document.getElementById(ms.firstSel.id).classList.remove('selected');
            ms.firstSel = { id, pair, side }; el.classList.add('selected'); return;
        }
        if (ms.firstSel.pair === pair) {
            document.getElementById(ms.firstSel.id).classList.remove('selected');
            document.getElementById(ms.firstSel.id).classList.add('matched');
            el.classList.remove('selected'); el.classList.add('matched');
            ms.matched.push(pair); ms.correct++;
            addXP(5, true);
            if (ms.matched.length === ms.lefts.length) {
                const xp = 20; addXP(xp, false);
                state.vocabScores[vocabCurrentTopic.id] = 100;
                logActivity(`Vocabulario "${vocabCurrentTopic.title}" — Matching`, xp, '#1D9E75');
                document.getElementById('match-result').innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i> ¡Completaste todas las parejas! +${xp} XP extra</div>`;
                lucide.createIcons(); saveState();
            }
        } else {
            document.getElementById(ms.firstSel.id).classList.remove('selected');
            el.classList.add('wrong-pair');
            document.getElementById(ms.firstSel.id).classList.add('wrong-pair');
            ms.errors++;
            setTimeout(() => {
                el.classList.remove('wrong-pair');
                if (document.getElementById(ms.firstSel?.id)) document.getElementById(ms.firstSel.id).classList.remove('wrong-pair');
            }, 600);
        }
        ms.firstSel = null;
    }
};

function renderVocabQuiz() {
    const words = vocabCurrentTopic.words;
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    window.vqTasks = shuffled.map(w => {
        const wrong = words.filter(x => x.en !== w.en).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.es);
        const opts = [w.es, ...wrong].sort(() => Math.random() - 0.5);
        return { q: `¿Cómo se dice en español: "${w.en}"?`, opts, answer: w.es };
    });
    window.vqIdx = 0; window.vqScore = 0;
    renderVocabQ();
}

function renderVocabQ() {
    const c = document.getElementById('vocab-mode-content');
    if (!c) return;
    if (window.vqIdx >= window.vqTasks.length) {
        const pct = Math.round((window.vqScore / window.vqTasks.length) * 100);
        const prev = state.vocabScores[vocabCurrentTopic.id];
        state.vocabScores[vocabCurrentTopic.id] = prev != null ? Math.max(prev, pct) : pct;
        const xpB = pct >= 80 ? 40 : 20;
        addXP(xpB, false);
        logActivity(`Vocab Quiz "${vocabCurrentTopic.title}"`, xpB, '#1D9E75');
        saveState();
        c.innerHTML = `
            <div class="results-card animate-pop" style="border:none;box-shadow:none;padding:20px 0">
                <div class="results-score">${pct}%</div>
                <p class="results-msg">${pct>=80?'¡Vocabulario dominado!':pct>=60?'Buen trabajo. Repasa las tarjetas.':'Vuelve a las tarjetas y repite el quiz.'}</p>
                <div class="results-detail">
                    <span class="results-pill pill-good">✓ ${window.vqScore}/${window.vqTasks.length}</span>
                    <span class="results-pill pill-xp">+${xpB} XP</span>
                </div>
                <div class="btn-row">
                    <button class="btn-check" onclick="setVocabMode('flash',document.getElementById('vtab-flash'))"><i data-lucide="layers"></i> Ver tarjetas</button>
                    <button class="btn-check" onclick="setVocabMode('quiz',document.getElementById('vtab-quiz'))" style="background:#718096"><i data-lucide="refresh-cw"></i> Repetir Quiz</button>
                </div>
            </div>`;
        lucide.createIcons(); return;
    }
    const q = window.vqTasks[window.vqIdx];
    isChecking = false;
    c.innerHTML = `
        <div style="margin-bottom:10px;font-size:12px;color:#A0AEC0;font-weight:700">Pregunta ${window.vqIdx+1} / ${window.vqTasks.length}</div>
        <div class="ex-q" style="text-align:left">${q.q}</div>
        <div class="opts-grid">
            ${q.opts.map(o=>`<button class="opt-btn" onclick="checkVocabQ('${o.replace(/'/g,"\\'")}','${q.answer.replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}
        </div>
        <div id="vq-fb"></div>`;
    lucide.createIcons();
}

window.checkVocabQ = function(val, correct, btn) {
    if (isChecking) return;
    isChecking = true;
    state.totalAnswers++;
    document.querySelectorAll('#vocab-mode-content .opt-btn').forEach(b => b.disabled = true);
    if (val === correct) {
        btn.classList.add('correct');
        state.correctAnswers++; window.vqScore++;
        document.getElementById('vq-fb').innerHTML = `<div class="ex-feedback success"><i data-lucide="check-circle"></i> ¡Correcto!</div>`;
        addXP(8, true);
    } else {
        btn.classList.add('wrong');
        document.querySelectorAll('#vocab-mode-content .opt-btn').forEach(b => { if(b.textContent === correct) b.classList.add('correct'); });
        document.getElementById('vq-fb').innerHTML = `<div class="ex-feedback error"><i data-lucide="x-circle"></i> Era: "<strong>${correct}</strong>"</div>`;
    }
    lucide.createIcons();
    saveState();
    setTimeout(() => { window.vqIdx++; renderVocabQ(); }, 1600);
};

// ============================================================
// SETTINGS
// ============================================================
window.renderSettings = function() {
    const inp = document.getElementById('setting-name');
    if (inp) inp.value = state.userName;
    document.querySelectorAll('.goal-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.goal) === state.dailyGoal);
    });
};

window.setGoal = function(btn) {
    document.querySelectorAll('.goal-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.dailyGoal = parseInt(btn.dataset.goal);
    saveState();
};

window.saveSettings = function() {
    const inp = document.getElementById('setting-name');
    if (inp && inp.value.trim()) {
        state.userName = inp.value.trim();
        const nameEl = document.getElementById('user-name-display');
        if (nameEl) nameEl.textContent = state.userName;
        const init = document.getElementById('avatar-initials');
        if (init) init.textContent = state.userName.charAt(0).toUpperCase();
        saveState();
        window.showToast('Cambios guardados', 'success');
    }
};

window.confirmReset = function() {
    window.openModal(`
        <div style="text-align:center">
            <div style="font-size:40px;margin-bottom:16px">⚠️</div>
            <h3 style="font-size:18px;font-weight:700;margin-bottom:8px">¿Reiniciar progreso?</h3>
            <p style="color:#718096;font-size:14px;margin-bottom:24px">Se eliminarán todos tus XP, puntuaciones y actividad. No se puede deshacer.</p>
            <div style="display:flex;gap:10px;justify-content:center">
                <button onclick="closeModal()" style="padding:10px 24px;border:1.5px solid #E2E8F0;border-radius:10px;background:white;cursor:pointer;font-weight:600">Cancelar</button>
                <button onclick="doReset()" style="padding:10px 24px;background:#E53E3E;color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700">Sí, reiniciar</button>
            </div>
        </div>`);
};

window.doReset = async function() {
    window.closeModal();
    state = { role: state.role, adminView: false, xp: 0, level: 1, streak: 1, dailyXP: 0, dailyGoal: 50, totalAnswers: 0, correctAnswers: 0, modulesCompleted: 0, activityLog: [], scores: {}, readingScores: {}, writingDone: {}, vocabScores: {}, userName: state.userName };
    await saveState();
    location.reload();
};

window.openModal = function(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('open');
    lucide.createIcons();
};

window.closeModal = function() {
    document.getElementById('modal-overlay').classList.remove('open');
};

// ============================================================
// XP, NIVELES Y ACTIVIDAD
// ============================================================
function addXP(baseVal, showMsg) {
    const streakBonus = Math.min(state.streak * 0.05, 0.50); 
    const totalXP = Math.round(baseVal * (1 + streakBonus));

    state.xp += totalXP;
    state.dailyXP += totalXP;

    let xpForNext = Math.floor(100 * Math.pow(state.level, 1.5));

    while (state.xp >= xpForNext) {
        state.level++;
        xpForNext = Math.floor(100 * Math.pow(state.level, 1.5));
        window.showToast('¡NIVEL SUBIDO! 🎉 Nivel ' + state.level, 'success');
    }

    updateHeaderUI();
    saveState();
    
    if (showMsg && totalXP > 0) {
        window.showToast(`+${totalXP} XP ${streakBonus > 0 ? '🔥' : ''}`, 'success');
    }
}

function updateHeaderUI() {
    const xpCurrentLevelBase = state.level === 1 ? 0 : Math.floor(100 * Math.pow(state.level - 1, 1.5));
    const xpNextLevelBase = Math.floor(100 * Math.pow(state.level, 1.5));
    
    const xpInLevel = state.xp - xpCurrentLevelBase;
    const xpRequiredForNext = xpNextLevelBase - xpCurrentLevelBase;
    
    const pct = Math.min(100, Math.max(0, Math.round((xpInLevel / xpRequiredForNext) * 100)));
    
    const fill = document.getElementById('xp-fill');
    if (fill) fill.style.width = pct + '%';
    
    safeSet('xp-display', `${xpInLevel} / ${xpRequiredForNext} XP`);
    
    const rankInfo = getrank(0); 
    safeSet('level-display', `Nivel ${state.level} · ${rankInfo.cefr}`);
    
    safeSet('xp-pill', `${state.xp} XP`);
    safeSet('streak-display', `${state.streak} Día${state.streak !== 1 ? 's' : ''}`);
    
    const init = document.getElementById('avatar-initials');
    if (init) init.textContent = state.userName.charAt(0).toUpperCase();
    const nameEl = document.getElementById('user-name-display');
    if (nameEl) nameEl.textContent = state.userName;
}

function logActivity(text, xp, color) {
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    state.activityLog.unshift({ text, xp, color: color || '#534AB7', time });
    if (state.activityLog.length > 20) state.activityLog.pop();
}

// ============================================================
// MOTOR DE AUDIO (Web Speech API)
// ============================================================
window.playAudio = function(text, lang = 'en-US', event = null) {
    if (event) {
        event.stopPropagation();
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85; 
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    } else {
        window.showToast('Tu navegador no soporta reproducción de audio', 'warn');
    }
};

// ============================================================
// TOAST & UTILITY
// ============================================================
let toastTimer = null;
window.showToast = function(msg, type) {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = msg;
    t.className = 'toast ' + (type ? 'toast-' + type : 'toast-success') + ' show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
};

function safeSet(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ============================================================
// MODO VISTA PREVIA (ADMINISTRADOR)
// ============================================================
window.toggleAdminView = function() {
    state.adminView = !state.adminView;
    window.showToast(state.adminView ? 'Modo Vista Previa: Candados desactivados' : 'Candados activados nuevamente', 'success');
    window.renderDashboard();
};
