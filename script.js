// Globális változók deklarálása (még érték nélkül)
let canvas, ctx, stats, audioCtx, player;
let isRunning = false, isPaused = false, frameCount = 0, lastTime = 0, score = 0, sessionCoins = 0, level = 1;
let gameMode = 'endless', currentMission = null, missionCounter = 0, shake = 0, sessionStartTime = 0;
let projectiles = [], enemies = [], particles = [], pickups = [], bots = [], botRespawnQueue = [];
let keys = {}, mouse = { x: 0, y: 0, down: false };

const appId = "neon-overdrive-v3-final";

// --- Adatok és Konfiguráció ---
const translations = {
    hu: {
        engage: "Végtelen", story: "Történet", upgrades: "Fejlesztések", settings: "Beállítások",
        creditsUnit: "KREDIT", back: "Vissza", volume: "Hangerő", language: "Nyelv",
        techHub: "Tech Központ", integrity: "Integritás", shield: "Pajzs", paused: "Szünet",
        resume: "Folytatás", failure: "Rendszerhiba", reboot: "Újraindítás", terminal: "Menü",
        objective: "Feladat", cost: "Ár", droneUplink: "Drón Kapcsolat", locked: "Lezárva",
        uplink: "Adatkapcsolat kiépítése...", uplinkDesc: "Titkosított adatfolyam fogadása kreditekért cserébe.",
        uplinkBtn: "ADATKAPCSOLAT (+300 CR)", chasisTab: "Gépváz", droneTab: "Drón Tech",
        phase: "FÁZIS", level: "SZINT", success: "KÜLDETÉS TELJESÍTVE", victory: "GYŐZELEM",
        done: "TELJESÍTVE", launch: "Indítás", unlock: "Feloldás", drUnlockText: "Drón Technológia Lezárva",
        stats: "Statisztika", statsTitle: "Rendszer Napló", statKills: "Megsemmisítések", statMoney: "Összes bevétel",
        statTimeEndless: "Végtelen rekordidő", statTimeStory: "Történeti játékidő"
    },
    en: {
        engage: "Endless", story: "Story Mode", upgrades: "Upgrades", settings: "Settings",
        creditsUnit: "CREDITS", back: "Back", volume: "Volume", language: "Language",
        techHub: "Tech Hub", integrity: "Integrity", shield: "Shield", paused: "Paused",
        resume: "Resume", failure: "Core Failure", reboot: "Reboot", terminal: "Menu",
        objective: "Objective", cost: "Cost", droneUplink: "Drone Uplink", locked: "Locked",
        uplink: "Establishing Uplink...", uplinkDesc: "Receiving encrypted data stream for credits.",
        uplinkBtn: "DATA UPLINK (+300 CR)", chasisTab: "Chassis", droneTab: "Drone Tech",
        phase: "PHASE", level: "LVL", success: "MISSION SUCCESS", victory: "VICTORY",
        done: "COMPLETED", launch: "Launch", unlock: "Unlock", drUnlockText: "Drone Tech Locked",
        stats: "Statistics", statsTitle: "System Logs", statKills: "Total Destructions", statMoney: "All-time Earnings",
        statTimeEndless: "Endless Time Log", statTimeStory: "Story Time Log"
    }
};

const missions = [
    { id: 0, title: { hu: "Alap Kiképzés", en: "Basic Training" }, goal: "survive", value: 30, desc: { hu: "Élj túl 30 másodpercig.", en: "Survive for 30 seconds." }, reward: 500 },
    { id: 1, title: { hu: "Szektor Tisztítás", en: "Sector Clearance" }, goal: "kills", value: 25, desc: { hu: "Semmisíts meg 25 ellenséget.", en: "Destroy 25 enemies." }, reward: 1000 },
    { id: 2, title: { hu: "Elit Vadászat", en: "Elite Hunter" }, goal: "boss", value: 1, desc: { hu: "Győzd le az első szektor őrét.", en: "Defeat the first sector guardian." }, reward: 2000 },
    { id: 3, title: { hu: "Végtelen Hullám", en: "Infinite Wave" }, goal: "survive", value: 60, desc: { hu: "Élj túl 60 másodpercig nagy nyomás alatt.", en: "Survive for 60 seconds under high pressure." }, reward: 3500 },
    { id: 4, title: { hu: "Rendszer Törlés", en: "System Wipe" }, goal: "kills", value: 100, desc: { hu: "Töröld el a fenyegetést: 100 megsemmisítés.", en: "Wipe out the threat: 100 kills." }, reward: 7500 }
];

const playerUpgradeData = [
    { id: 'hp', title: { hu: 'Páncélzat', en: 'Hull Plating' }, desc: { hu: 'Növeli a maximális életerőt.', en: 'Increases max health.' }, baseCost: 500 },
    { id: 'fire', title: { hu: 'Tűzgyorsaság', en: 'Fire Rate' }, desc: { hu: 'Gyorsabb impulzus lövések.', en: 'Faster pulse shots.' }, baseCost: 750 },
    { id: 'speed', title: { hu: 'Hajtómű', en: 'Ion Thrusters' }, desc: { hu: 'Gyorsabb manőverezés.', en: 'Faster movement.' }, baseCost: 400 },
    { id: 'shield', title: { hu: 'Pajzs Generátor', en: 'Shield Gen' }, desc: { hu: 'Öntöltő védőpajzs.', en: 'Regenerating shield.' }, baseCost: 1000 },
    { id: 'magnet', title: { hu: 'Kredit Mágnes', en: 'Credit Magnet' }, desc: { hu: 'Messzebbről gyűjti a krediteket.', en: 'Pulls credits from distance.' }, baseCost: 600 },
    { id: 'damage', title: { hu: 'Neutron Mag', en: 'Neutron Core' }, desc: { hu: 'Nagyobb lövedéksebzés.', en: 'Higher bullet damage.' }, baseCost: 1200 },
];

const botUpgradeData = [
    { id: 'count', title: { hu: 'Drón Osztag', en: 'Drone Squad' }, desc: { hu: 'Több aktív drón egyszerre.', en: 'More active drones.' }, baseCost: 2500 },
    { id: 'hp', title: { hu: 'Drón Páncél', en: 'Drone Armor' }, desc: { hu: 'Növeli a drónok életerejét.', en: 'Drone durability up.' }, baseCost: 1500 },
    { id: 'damage', title: { hu: 'Drón Fegyverzet', en: 'Drone Weapons' }, desc: { hu: 'Nagyobb drón tűzerő.', en: 'Drone firepower up.' }, baseCost: 2000 },
];

// --- Inicializálás (Amikor a DOM betöltődött) ---
document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Hiba: 'game-canvas' nem található!");
        return;
    }
    ctx = canvas.getContext('2d');

    // Állapot betöltése
    let savedStats = JSON.parse(localStorage.getItem(appId + '_stats'));
    stats = {
        coins: 0,
        upgrades: { hp: 1, fire: 1, speed: 1, shield: 1, magnet: 1, damage: 1 },
        botTech: { unlocked: false, count: 1, hp: 1, damage: 1 },
        storyProgress: 0,
        settings: { volume: 50, lang: 'hu' },
        history: { totalKills: 0, timeEndless: 0, timeStory: 0, allTimeEarnings: 0 }
    };

    if (savedStats) {
        Object.keys(savedStats).forEach(key => {
            if (typeof savedStats[key] === 'object' && savedStats[key] !== null && !Array.isArray(savedStats[key])) {
                stats[key] = { ...stats[key], ...savedStats[key] };
            } else {
                stats[key] = savedStats[key];
            }
        });
    }
    if (!stats.history) stats.history = { totalKills: 0, timeEndless: 0, timeStory: 0, allTimeEarnings: 0 };

    window.onresize();
    updateUI();
});

// --- Audio Rendszer ---
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playS(f, t, d, v = 0.1, r = true) {
    if (!audioCtx || stats.settings.volume <= 0) return;
    const globalVol = stats.settings.volume / 100;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = t; o.frequency.setValueAtTime(f, audioCtx.currentTime);
    if (r) o.frequency.exponentialRampToValueAtTime(f / 4, audioCtx.currentTime + d);
    g.gain.setValueAtTime(v * globalVol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + d);
}

const sfx = {
    shoot: () => playS(450, 'square', 0.08, 0.03),
    hit: () => playS(150, 'sawtooth', 0.1, 0.06, false),
    explosion: () => playS(80, 'sawtooth', 0.4, 0.12),
    pickup: () => { playS(800, 'sine', 0.15, 0.08); setTimeout(() => playS(1200, 'sine', 0.15, 0.08), 40); },
    upgrade: () => playS(600, 'sine', 0.5, 0.1)
};

// --- Globális kezelők (window-hoz kötve, hogy a HTML onclick lássa) ---
window.startGame = function (mode, missionIdx = null) {
    initAudio();
    gameMode = mode; isRunning = true; isPaused = false;
    frameCount = 0; score = 0; sessionCoins = 0; level = 1;
    sessionStartTime = Date.now();
    player = new Player(); enemies = []; projectiles = []; particles = []; pickups = []; bots = []; botRespawnQueue = [];

    if (stats.botTech.unlocked) { for (let i = 0; i < stats.botTech.count; i++) bots.push(new Bot(i)); }
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('story-menu').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';

    if (mode === 'story') {
        currentMission = missions[missionIdx]; missionCounter = 0;
        document.getElementById('mission-objective-ui').style.display = 'block';
        document.getElementById('objective-text').innerText = currentMission.desc[stats.settings.lang];
    } else {
        document.getElementById('mission-objective-ui').style.display = 'none';
        showWaveAlert(1);
    }
    updateLevelTag();
    lastTime = performance.now();
    requestAnimationFrame(loop);
};

window.buyUpgrade = function (category, id) {
    let cost = 0;
    if (category === 'player') {
        const up = playerUpgradeData.find(u => u.id === id);
        cost = stats.upgrades[id] * up.baseCost;
        if (stats.coins >= cost) { stats.coins -= cost; stats.upgrades[id]++; sfx.upgrade(); save(); }
    } else {
        const up = botUpgradeData.find(u => u.id === id);
        cost = stats.botTech[id] * up.baseCost;
        if (stats.coins >= cost) { stats.coins -= cost; stats.botTech[id]++; sfx.upgrade(); save(); }
    }
};

window.unlockBots = function () { if (stats.coins >= 3000) { stats.coins -= 3000; stats.botTech.unlocked = true; sfx.upgrade(); save(); } };
window.openStory = function () { document.getElementById('main-menu').style.display = 'none'; document.getElementById('story-menu').style.display = 'flex'; renderStoryMissions(); };
window.closeStory = function () { document.getElementById('story-menu').style.display = 'none'; document.getElementById('main-menu').style.display = 'flex'; };
window.openStats = function () { document.getElementById('main-menu').style.display = 'none'; document.getElementById('stats-menu').style.display = 'flex'; renderStats(); };
window.closeStats = function () { document.getElementById('stats-menu').style.display = 'none'; document.getElementById('main-menu').style.display = 'flex'; };
window.openLobby = function () { document.getElementById('main-menu').style.display = 'none'; document.getElementById('lobby-menu').style.display = 'flex'; renderUpgrades(); };
window.closeLobby = function () { document.getElementById('lobby-menu').style.display = 'none'; document.getElementById('main-menu').style.display = 'flex'; };
window.toggleSettings = function (show) { document.getElementById('settings-menu').style.display = show ? 'flex' : 'none'; };
window.updateVolume = function (v) { stats.settings.volume = parseInt(v); save(); };
window.setLanguage = function (l) { stats.settings.lang = l; save(); };
window.switchTab = function (t) {
    document.getElementById('player-upgrades').style.display = t === 'player' ? 'grid' : 'none';
    document.getElementById('bot-upgrades').style.display = t === 'bots' ? 'grid' : 'none';
    document.getElementById('tab-player').classList.toggle('active', t === 'player');
    document.getElementById('tab-bots').classList.toggle('active', t === 'bots');
};
window.returnToMenu = function () {
    const timeDiff = (Date.now() - sessionStartTime) / 1000;
    if (isRunning && stats.history) {
        if (gameMode === 'endless') stats.history.timeEndless += timeDiff;
        else stats.history.timeStory += timeDiff;
        stats.coins += sessionCoins;
        save();
    }
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'none';
    isRunning = false;
    document.getElementById('main-menu').style.display = 'flex';
    updateUI();
};
window.restartGame = function () { if (gameMode === 'story') window.startGame('story', currentMission.id); else window.startGame('endless'); };
window.startRewardProcess = function () {
    document.getElementById('reward-modal').style.display = 'flex';
    let progress = 0;
    const bar = document.getElementById('reward-bar');
    const interval = setInterval(() => {
        progress += 1;
        bar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            stats.coins += 300;
            stats.history.allTimeEarnings += 300;
            save();
            document.getElementById('reward-modal').style.display = 'none';
        }
    }, 150);
};

// --- Belső Segédfunkciók ---
function save() {
    localStorage.setItem(appId + '_stats', JSON.stringify(stats));
    updateUI();
}

function formatTime(seconds) {
    if (!seconds) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateUI() {
    if (!stats) return;
    document.getElementById('global-coins').innerText = stats.coins.toLocaleString();
    document.getElementById('lobby-coins').innerText = stats.coins.toLocaleString();
    const lang = stats.settings.lang;
    const t = translations[lang];

    document.querySelectorAll('[class*="t-"]').forEach(el => {
        const classList = Array.from(el.classList);
        const tClass = classList.find(c => c.startsWith('t-'));
        if (tClass) {
            const key = tClass.split('-')[1];
            if (t[key]) el.innerText = t[key];
        }
    });

    document.getElementById('vol-val').innerText = stats.settings.volume + '%';
    document.getElementById('volume-slider').value = stats.settings.volume;

    document.getElementById('lang-hu').className = `flex-1 py-2 border rounded transition-all ${lang === 'hu' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-700 bg-white/5'}`;
    document.getElementById('lang-en').className = `flex-1 py-2 border rounded transition-all ${lang === 'en' ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-700 bg-white/5'}`;

    if (document.getElementById('lobby-menu').style.display === 'flex') renderUpgrades();
    if (document.getElementById('story-menu').style.display === 'flex') renderStoryMissions();
    if (document.getElementById('stats-menu').style.display === 'flex') renderStats();
}

function renderStats() {
    const s = stats.history;
    document.getElementById('stat-total-kills').innerText = s.totalKills.toLocaleString();
    document.getElementById('stat-total-money').innerText = s.allTimeEarnings.toLocaleString();
    document.getElementById('stat-time-endless').innerText = formatTime(s.timeEndless);
    document.getElementById('stat-time-story').innerText = formatTime(s.timeStory);
}

function renderUpgrades() {
    const lang = stats.settings.lang;
    const pCont = document.getElementById('player-upgrades');
    pCont.innerHTML = '';
    playerUpgradeData.forEach(up => {
        const lvl = stats.upgrades[up.id];
        const cost = lvl * up.baseCost;
        pCont.innerHTML += `
            <div class="upgrade-card">
                <div class="flex justify-between items-center"><span class="font-bold uppercase text-xs">${up.title[lang]}</span><span class="text-blue-400 font-bold">LVL ${lvl}</span></div>
                <p class="text-[10px] text-slate-400 leading-tight h-8">${up.desc[lang]}</p>
                <button onclick="buyUpgrade('player', '${up.id}')" ${stats.coins < cost ? 'disabled' : ''} class="neon-btn text-[10px] py-2 mt-1">${translations[lang].cost}: ${cost}</button>
            </div>`;
    });

    const bCont = document.getElementById('bot-upgrades');
    bCont.innerHTML = '';
    if (!stats.botTech.unlocked) {
        bCont.innerHTML = `<div class="col-span-full flex flex-col items-center py-10">
            <i class="fas fa-lock text-5xl text-purple-900 mb-4"></i>
            <h3 class="orbitron text-xl mb-4 text-purple-400">${translations[lang].drUnlockText}</h3>
            <button onclick="unlockBots()" ${stats.coins < 3000 ? 'disabled' : ''} class="neon-btn border-purple-500 text-purple-500">${translations[lang].unlock}: 3000 CR</button>
        </div>`;
    } else {
        botUpgradeData.forEach(up => {
            const lvl = stats.botTech[up.id];
            const cost = lvl * up.baseCost;
            bCont.innerHTML += `
                <div class="upgrade-card border-purple-500/30">
                    <div class="flex justify-between items-center"><span class="font-bold uppercase text-xs text-purple-400">${up.title[lang]}</span><span class="text-purple-400 font-bold">LVL ${lvl}</span></div>
                    <p class="text-[10px] text-slate-400 leading-tight h-8">${up.desc[lang]}</p>
                    <button onclick="buyUpgrade('bot', '${up.id}')" ${stats.coins < cost ? 'disabled' : ''} class="neon-btn border-purple-500 text-purple-500 text-[10px] py-2 mt-1">${translations[lang].cost}: ${cost}</button>
                </div>`;
        });
    }
}

function renderStoryMissions() {
    const list = document.getElementById('mission-list');
    list.innerHTML = '';
    const lang = stats.settings.lang;
    const t = translations[lang];

    missions.forEach((m, idx) => {
        const isLocked = idx > stats.storyProgress;
        const isDone = idx < stats.storyProgress;
        list.innerHTML += `
            <div class="mission-card ${isLocked ? 'locked' : 'unlocked'}">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="orbitron font-bold text-lg ${isDone ? 'text-green-400' : ''}">${m.title[lang]}</h4>
                    ${isDone ? `<span class="text-green-400 font-bold text-[10px] border border-green-400 px-2 rounded">${t.done}</span>` : (isLocked ? '<i class="fas fa-lock text-slate-600"></i>' : '')}
                </div>
                <p class="text-xs text-slate-400 mb-6 h-8">${m.desc[lang]}</p>
                <div class="flex justify-between items-center">
                    <span class="text-yellow-400 font-bold text-sm"><i class="fas fa-coins mr-1"></i> +${m.reward} CR</span>
                    <button onclick="startGame('story', ${idx})" ${isLocked ? 'disabled' : ''} class="neon-btn py-1 px-6 text-xs ${isLocked ? '' : 'border-pink-500 text-pink-500 hover:bg-pink-500'}">
                        ${isLocked ? t.locked : t.launch}
                    </button>
                </div>
            </div>`;
    });
}

function updateBoostVisuals() {
    const container = document.getElementById('boost-container');
    if (!container) return;

    let html = '';
    if (player.overdrive > 0) {
        const percent = (player.overdrive / 400) * 100;
        html += `<div class="w-32 h-3 bg-slate-900 border border-yellow-500 rounded-full overflow-hidden mb-2 shadow-[0_0_10px_#fff200]">
                    <div class="h-full bg-yellow-400 transition-all" style="width: ${percent}%"></div>
                 </div>`;
    }
    if (player.tripleShot > 0) {
        const percent = (player.tripleShot / 400) * 100;
        html += `<div class="w-32 h-3 bg-slate-900 border border-pink-500 rounded-full overflow-hidden shadow-[0_0_10px_#ff00ff]">
                    <div class="h-full bg-pink-500 transition-all" style="width: ${percent}%"></div>
                 </div>`;
    }
    container.innerHTML = html;
}




// --- Játék Objektumok (Osztályok) ---
class Player {
    constructor() {
        this.x = canvas.width / 2; this.y = canvas.height / 2; this.radius = 18;
        this.maxHp = 100 + (stats.upgrades.hp - 1) * 25;
        this.hp = this.maxHp;
        this.maxShield = (stats.upgrades.shield - 1) * 40;
        this.shield = this.maxShield;
        this.baseSpeed = 4.5 + (stats.upgrades.speed - 1) * 0.45;
        this.fireRate = Math.max(12, 42 - (stats.upgrades.fire - 1) * 2.2);
        this.magnetRadius = 80 + (stats.upgrades.magnet - 1) * 45;
        this.dmgMult = 1 + (stats.upgrades.damage - 1) * 0.4;
        this.angle = 0; this.lastShot = 0; this.lastRegen = 0;
        this.overdrive = 0; this.tripleShot = 0;
    }
    update(dt) {
        let dx = 0, dy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
        if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x + dx * this.baseSpeed * dt));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y + dy * this.baseSpeed * dt));
        this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

        if (this.overdrive > 0) this.overdrive -= dt;
        if (this.tripleShot > 0) this.tripleShot -= dt;

        const currentFR = this.overdrive > 0 ? this.fireRate * 0.4 : this.fireRate;
        if (mouse.down && frameCount - this.lastShot >= currentFR) { this.shoot(); this.lastShot = frameCount; }

        if (this.maxShield > 0 && frameCount - this.lastRegen > 60 && this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + (0.06 * dt));
        }

        document.getElementById('hp-fill').style.width = `${(this.hp / this.maxHp) * 100}%`;
        document.getElementById('hp-val').innerText = `${Math.ceil((this.hp / this.maxHp) * 100)}%`;
        document.getElementById('shield-fill').style.width = this.maxShield > 0 ? `${(this.shield / this.maxShield) * 100}%` : '0%';
        document.getElementById('shield-val').innerText = this.maxShield > 0 ? `${Math.ceil((this.shield / this.maxShield) * 100)}%` : 'KI';
    }
    takeDamage(d) {
        this.lastRegen = frameCount + 150;
        if (this.shield > 0) { this.shield -= d; if (this.shield < 0) { this.hp += this.shield; this.shield = 0; } }
        else { this.hp -= d; }
        shake = 12; sfx.hit();
    }
    shoot() {
        if (this.tripleShot > 0) {
            projectiles.push(new Projectile(this.x, this.y, this.angle, true, this.dmgMult));
            projectiles.push(new Projectile(this.x, this.y, this.angle - 0.2, true, this.dmgMult));
            projectiles.push(new Projectile(this.x, this.y, this.angle + 0.2, true, this.dmgMult));
        } else {
            projectiles.push(new Projectile(this.x, this.y, this.angle, true, this.dmgMult));
        }
        sfx.shoot();
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y);
        if (this.shield > 0) {
            ctx.beginPath(); ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 + Math.sin(frameCount * 0.1) * 0.1})`;
            ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.rotate(this.angle);
        ctx.shadowBlur = 15; ctx.shadowColor = '#00f3ff'; ctx.fillStyle = '#00f3ff';
        ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); ctx.closePath(); ctx.fill();
        ctx.restore();
    }
}

class Bot {
    constructor(index) {
        this.index = index; this.radius = 11;
        this.maxHp = 60 + (stats.botTech.hp - 1) * 25;
        this.hp = this.maxHp;
        this.dmgMult = 0.6 + (stats.botTech.damage - 1) * 0.35;
        this.x = player.x; this.y = player.y;
        this.type = index % 3;
        this.targetPos = { x: this.x, y: this.y };
        this.roamTimer = 0;
        this.fireRate = 60;
        this.lastShot = Math.random() * 50;
    }
    update(dt) {
        if (this.type === 0) {
            const orbitDist = 70;
            const angleOffset = (Math.PI * 2 / stats.botTech.count) * this.index;
            const tx = player.x + Math.cos(frameCount * 0.04 + angleOffset) * orbitDist;
            const ty = player.y + Math.sin(frameCount * 0.04 + angleOffset) * orbitDist;
            this.x += (tx - this.x) * 0.1 * dt; this.y += (ty - this.y) * 0.1 * dt;
            this.shootLogic();
        } else if (this.type === 1) {
            this.roamTimer -= dt;
            if (this.roamTimer <= 0) {
                this.targetPos = { x: Math.random() * canvas.width, y: Math.random() * canvas.height };
                this.roamTimer = 180 + Math.random() * 120;
            }
            const a = Math.atan2(this.targetPos.y - this.y, this.targetPos.x - this.x);
            this.x += Math.cos(a) * 3 * dt; this.y += Math.sin(a) * 3 * dt;
            this.shootLogic();
        } else {
            let near = null, md = 600;
            enemies.forEach(e => { let d = dist(this.x, this.y, e.x, e.y); if (d < md) { md = d; near = e; } });
            if (near) {
                const a = Math.atan2(near.y - this.y, near.x - this.x);
                this.x += Math.cos(a) * 6 * dt; this.y += Math.sin(a) * 6 * dt;
                if (md < this.radius + near.radius) {
                    near.hp -= 5 * this.dmgMult;
                    this.hp -= 2;
                    if (near.hp <= 0) handleEnemyDeath(near);
                    if (frameCount % 5 === 0) sfx.hit();
                }
            } else {
                const a = Math.atan2(player.y - this.y, player.x - this.x);
                this.x += Math.cos(a) * 4 * dt; this.y += Math.sin(a) * 4 * dt;
            }
        }
    }
    shootLogic() {
        let target = null, mdS = 400;
        enemies.forEach(e => { let d = dist(this.x, this.y, e.x, e.y); if (d < mdS) { mdS = d; target = e; } });
        if (target && frameCount - this.lastShot > this.fireRate) {
            const a = Math.atan2(target.y - this.y, target.x - this.x);
            projectiles.push(new Projectile(this.x, this.y, a, true, this.dmgMult));
            this.lastShot = frameCount;
        }
    }
    draw() {
        const colors = ['#bc13fe', '#00f3ff', '#ff8c00'];
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.shadowBlur = 12; ctx.shadowColor = colors[this.type]; ctx.fillStyle = colors[this.type];
        ctx.beginPath();
        if (this.type === 2) {
            ctx.rotate(frameCount * 0.1);
            ctx.moveTo(12, 0); ctx.lineTo(-8, -8); ctx.lineTo(-8, 8);
        } else {
            ctx.arc(0, 0, this.radius, 0, 7);
        }
        ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, typeIdx) {
        this.x = x; this.y = y; this.type = typeIdx;
        const types = [
            { r: 18, hp: 3, s: 2.2, c: '#bc13fe', val: 10 },
            { r: 14, hp: 2, s: 4.5, c: '#fff200', val: 15 },
            { r: 35, hp: 15, s: 1.2, c: '#ff0055', val: 50 },
            { r: 22, hp: 5, s: 1.6, c: '#00f3ff', shoot: true, fr: 120, val: 30 },
            { r: 75, hp: 250, s: 0.5, c: '#ffffff', boss: true, fr: 60, val: 1000 }
        ];
        const t = types[Math.min(typeIdx, types.length - 1)];
        this.radius = t.r; this.hp = t.hp + (level * 2); this.speed = t.s; this.color = t.c;
        this.canShoot = t.shoot || t.boss; this.fireRate = t.fr; this.lastShot = Math.random() * 50;
        this.isBoss = t.boss; this.coinValue = t.val;
    }
    update(dt) {
        const target = player;
        const a = Math.atan2(target.y - this.y, target.x - this.x);
        const d = dist(this.x, this.y, target.x, target.y);

        if (this.canShoot && d < 450 && d > 200) {
            if (frameCount - this.lastShot > this.fireRate) { this.shoot(a); this.lastShot = frameCount; }
        } else {
            this.x += Math.cos(a) * this.speed * dt; this.y += Math.sin(a) * this.speed * dt;
        }

        if (d < this.radius + target.radius) {
            target.takeDamage(15); 
            this.hp = 0; 
            createExplosion(this.x, this.y, this.color, 12);
            handleEnemyDeath(this);
        }
    }
    shoot(a) {
        if (this.isBoss) {
            for (let i = 0; i < 6; i++) projectiles.push(new Projectile(this.x, this.y, a + (i * Math.PI / 3), false));
        } else {
            projectiles.push(new Projectile(this.x, this.y, a, false));
        }
    }
    draw() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(frameCount * 0.05);
        ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.strokeStyle = this.color; ctx.lineWidth = 3;
        ctx.beginPath();
        const sides = this.isBoss ? 8 : (this.type === 3 ? 3 : 4);
        for (let i = 0; i < sides; i++) ctx.lineTo(Math.cos(i * (Math.PI * 2 / sides)) * this.radius, Math.sin(i * (Math.PI * 2 / sides)) * this.radius);
        ctx.closePath(); ctx.stroke(); ctx.restore();
    }
}

class Projectile {
    constructor(x, y, a, isP, dmg = 1) {
        this.x = x; this.y = y; this.speed = isP ? 16 : 7;
        this.vx = Math.cos(a) * this.speed; this.vy = Math.sin(a) * this.speed;
        this.radius = isP ? 4 : 5; this.isPlayer = isP; this.life = 120; this.damage = dmg;
    }
    update(dt) {
        this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt;
        if (this.isPlayer) {
            enemies.forEach(e => {
                if (dist(this.x, this.y, e.x, e.y) < e.radius + this.radius) {
                    e.hp -= this.damage; this.life = 0;
                    if (e.hp <= 0) {
                        handleEnemyDeath(e);
                    }
                }
            });
        } else {
            if (dist(this.x, this.y, player.x, player.y) < player.radius + this.radius) {
                player.takeDamage(10); this.life = 0;
            }
            bots.forEach(b => {
                if (dist(this.x, this.y, b.x, b.y) < b.radius + this.radius) {
                    b.hp -= 15; this.life = 0;
                }
            });
        }
    }
    draw() {
        ctx.shadowBlur = 10; ctx.shadowColor = this.isPlayer ? '#00f3ff' : '#ff00ff';
        ctx.fillStyle = this.isPlayer ? '#fff' : '#ff00ff';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, 7); ctx.fill();
    }
}

class Pickup {
    constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.radius = 12; this.life = 600; }
    update(dt) {
        const d = dist(this.x, this.y, player.x, player.y);
        if (d < player.magnetRadius) {
            const a = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(a) * 8 * dt; this.y += Math.sin(a) * 8 * dt;
        }
        if (d < this.radius + player.radius) {
            sfx.pickup();
            if (this.type === 'H') player.hp = Math.min(player.maxHp, player.hp + (player.maxHp * 0.3));
            else if (this.type === 'O') player.overdrive = 400;
            else if (this.type === 'T') player.tripleShot = 400;
            return true;
        }
        this.life -= dt; return this.life <= 0;
    }
    draw() {
        const colors = { H: '#39ff14', O: '#fff200', T: '#ff00ff' };
        ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = colors[this.type];
        ctx.shadowBlur = 15; ctx.shadowColor = colors[this.type];
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
        ctx.fillText(this.type, 0, 4); ctx.restore();
    }
}

class Particle {
    constructor(x, y, c) { this.x = x; this.y = y; this.c = c; this.vx = (Math.random() - 0.5) * 12; this.vy = (Math.random() - 0.5) * 12; this.life = 1.0; }
    update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; this.life -= 0.03 * dt; }
    draw() { ctx.globalAlpha = this.life; ctx.fillStyle = this.c; ctx.fillRect(this.x, this.y, 2, 2); ctx.globalAlpha = 1; }
}

// --- Játéklogika Funkciók ---
function createExplosion(x, y, c, count = 10) { for (let i = 0; i < count; i++) particles.push(new Particle(x, y, c)); }
function dist(x1, y1, x2, y2) { return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); }

function checkProgression() {
    if (gameMode === 'endless') {
        const next = Math.floor(score / 5000) + 1;
        if (next > level) { level = next; updateLevelTag(); showWaveAlert(level); }
    } else {
        if (currentMission.goal === 'kills' && missionCounter >= currentMission.value) winMission();
        if (currentMission.goal === 'boss' && missionCounter >= 1) winMission();
    }
    document.getElementById('score-container').innerText = score.toString().padStart(6, '0');
    document.getElementById('hud-coins').innerText = sessionCoins.toLocaleString();
}

function updateLevelTag() {
    const lang = stats.settings.lang;
    document.getElementById('level-display').innerText = `${translations[lang].level} ${level.toString().padStart(2, '0')}`;
}

function showWaveAlert(n) {
    const lang = stats.settings.lang;
    const alert = document.getElementById('wave-alert');
    alert.innerText = `${translations[lang].phase} ${n}`;
    alert.classList.remove('animate-wave'); void alert.offsetWidth; alert.classList.add('animate-wave');
}

function spawn() {
    if (frameCount % Math.max(20, 90 - level * 5) === 0) {
        if (gameMode === 'story' && currentMission.goal === 'boss') {
            if (enemies.length === 0 && missionCounter === 0) enemies.push(new Enemy(canvas.width / 2, -100, 4));
            return;
        }
        const s = Math.floor(Math.random() * 4); let x, y;
        if (s === 0) { x = Math.random() * canvas.width; y = -50; }
        else if (s === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
        else if (s === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
        else { x = -50; y = Math.random() * canvas.height; }
        let typeRange = Math.min(3, Math.floor(level / 2));
        enemies.push(new Enemy(x, y, Math.floor(Math.random() * (typeRange + 1))));
    }
}

function winMission() {
    isRunning = false;
    const timeDiff = (Date.now() - sessionStartTime) / 1000;
    if (stats.history) stats.history.timeStory += timeDiff;
    if (currentMission.id === stats.storyProgress) stats.storyProgress++;
    stats.coins += currentMission.reward + sessionCoins;
    save();
    showEndScreen(translations[stats.settings.lang].success, "#39ff14");
}

function endGame() {
    isRunning = false;
    const timeDiff = (Date.now() - sessionStartTime) / 1000;
    if (stats.history) {
        if (gameMode === 'endless') stats.history.timeEndless += timeDiff;
        else stats.history.timeStory += timeDiff;
    }
    stats.coins += sessionCoins;
    save();
    showEndScreen(translations[stats.settings.lang].failure, "#ff0055");
}

function showEndScreen(title, color) {
    const lang = stats.settings.lang;
    const screen = document.getElementById('game-over');
    const titleEl = document.getElementById('end-title');
    titleEl.innerText = title; titleEl.style.color = color;
    document.getElementById('final-score').innerText = score.toLocaleString();
    document.getElementById('session-coins').innerText = `+${sessionCoins.toLocaleString()} ${translations[lang].creditsUnit}`;
    screen.style.display = 'flex'; setTimeout(() => screen.style.opacity = '1', 50);
    document.getElementById('hud').style.display = 'none';
}

function loop(timestamp) {
    if (!isRunning || isPaused) return;
    const dt = Math.min(2, (timestamp - lastTime) / (1000 / 60));
    lastTime = timestamp;
    frameCount++;
    score += 0.2 * dt;
    document.getElementById('score-container').innerText = Math.floor(score).toString().padStart(6, '0');

    updateBoostVisuals();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameMode === 'story' && currentMission.goal === 'survive') {
        missionCounter = Math.floor(frameCount / 60);
        document.getElementById('objective-text').innerText = `${translations[stats.settings.lang].objective}: ${missionCounter} / ${currentMission.value}s`;
        if (missionCounter >= currentMission.value) winMission();
    }

    botRespawnQueue.forEach((item, idx) => {
        item.timer -= dt;
        if (item.timer <= 0) { bots.push(new Bot(item.index)); botRespawnQueue.splice(idx, 1); }
    });

    ctx.save();
    if (shake > 0) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.9; }
    spawn();
    player.update(dt); player.draw();
    bots.forEach((b, i) => {
        b.update(dt); b.draw();
        if (b.hp <= 0) {
            createExplosion(b.x, b.y, '#bc13fe', 20);
            botRespawnQueue.push({ index: b.index, timer: 600 });
            bots.splice(i, 1); sfx.explosion();
        }
    });
    if (stats.botTech.unlocked) document.getElementById('bot-status').innerText = `DRÓNOK: ${bots.length}/${stats.botTech.count}`;
    enemies.forEach((e, i) => { e.update(dt); e.draw(); if (e.hp <= 0) enemies.splice(i, 1); });
    projectiles.forEach((p, i) => { p.update(dt); p.draw(); if (p.life <= 0) projectiles.splice(i, 1); });
    pickups.forEach((p, i) => { if (p.update(dt)) pickups.splice(i, 1); else p.draw(); });
    particles.forEach((p, i) => { p.update(dt); p.draw(); if (p.life <= 0) particles.splice(i, 1); });
    ctx.restore();
    if (player.hp <= 0) endGame();
    requestAnimationFrame(loop);
}

// --- Eseménykezelők ---
window.onkeydown = e => { keys[e.code] = true; if (e.code === 'Escape') togglePause(); };
window.onkeyup = e => keys[e.code] = false;
window.onmousemove = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
window.onmousedown = () => { mouse.down = true; initAudio(); };
window.onmouseup = () => mouse.down = false;
window.onresize = () => {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
};

function togglePause() {
    if (!isRunning) return;
    isPaused = !isPaused;
    document.getElementById('pause-menu').style.display = isPaused ? 'flex' : 'none';
    document.getElementById('pause-icon').className = isPaused ? 'fas fa-play' : 'fas fa-pause';
    if (!isPaused) { lastTime = performance.now(); requestAnimationFrame(loop); }
}

function handleEnemyDeath(e) {
    score += 100;
    sessionCoins += e.coinValue;
    if (stats.history) {
        stats.history.totalKills++;
        stats.history.allTimeEarnings += e.coinValue;
    }
    sfx.explosion();
    createExplosion(e.x, e.y, e.color, e.isBoss ? 40 : 15);
    
    if (Math.random() < 0.25) {
        pickups.push(new Pickup(e.x, e.y, Math.random() < 0.5 ? 'H' : (Math.random() < 0.8 ? 'O' : 'T')));
    }

    if (gameMode === 'story') {
        if (currentMission.goal === 'kills') missionCounter++;
        if (currentMission.goal === 'boss' && e.isBoss) missionCounter++;
    }
    checkProgression();
}