// ══════════════════════════════════════════
//  CineVault — app.js
// ══════════════════════════════════════════

const STORAGE_KEY = 'cinevault_data_v2';
const OMDB_KEY    = 'trilogy';

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let isAdmin       = false;
let activeTab     = 0;
let tabs          = [];
let acTimers      = {};
let gistSaveTimer = null;

// ══════════════════════════════════════════
//  SHA-256 PASSWORD HASHING
// ══════════════════════════════════════════
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ══════════════════════════════════════════
//  GIST STORAGE
// ══════════════════════════════════════════
async function loadFromGist() {
  if (!CONFIG.GIST_ID || CONFIG.GIST_ID === 'YOUR_GIST_ID_HERE') {
    return loadFromLocalStorage();
  }
  try {
    showLoadingOverlay('Loading your collection…');
    const res  = await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error('Gist fetch failed');
    const gist = await res.json();
    const raw  = gist.files?.['cinevault.json']?.content || '{}';
    const data = JSON.parse(raw);
    tabs = data.tabs || [];
    if (!tabs.length) initDefaultTabs();
    hideLoadingOverlay();
    return true;
  } catch (e) {
    console.warn('Gist load failed, falling back to localStorage:', e);
    hideLoadingOverlay();
    return loadFromLocalStorage();
  }
}

async function saveToGist() {
  // Always save locally first (instant)
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs }));

  if (!CONFIG.GIST_ID    || CONFIG.GIST_ID    === 'YOUR_GIST_ID_HERE') return;
  if (!CONFIG.GITHUB_TOKEN || CONFIG.GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN_HERE') return;

  // Debounce Gist writes — only push after 1.5s of inactivity
  clearTimeout(gistSaveTimer);
  gistSaveTimer = setTimeout(async () => {
    try {
      await fetch(`https://api.github.com/gists/${CONFIG.GIST_ID}`, {
        method:  'PATCH',
        headers: {
          'Authorization': `token ${CONFIG.GITHUB_TOKEN}`,
          'Content-Type':  'application/json',
          'Accept':        'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          files: { 'cinevault.json': { content: JSON.stringify({ tabs }, null, 2) } }
        })
      });
      showSyncIndicator();
    } catch (e) {
      console.warn('Gist save failed:', e);
    }
  }, 1500);
}

function showSyncIndicator() {
  const el = document.getElementById('sync-indicator');
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function showLoadingOverlay(msg) {
  const el = document.getElementById('loading-overlay');
  if (el) { el.querySelector('.loading-text').textContent = msg; el.style.display = 'flex'; }
}

function hideLoadingOverlay() {
  const el = document.getElementById('loading-overlay');
  if (el) el.style.display = 'none';
}

// ══════════════════════════════════════════
//  LOCAL STORAGE FALLBACK
// ══════════════════════════════════════════
function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const parsed = JSON.parse(raw); tabs = parsed.tabs || []; }
  } catch (e) { tabs = []; }
  if (!tabs.length) initDefaultTabs();
  return true;
}

function initDefaultTabs() {
  const PRESET = {"tabs": [{"name": "Tab 1", "movies": [{"title": "Whiplash", "year": "", "genre": "", "rating": 0}, {"title": "The Greatest Show", "year": "", "genre": "", "rating": 0}, {"title": "Inception", "year": "", "genre": "", "rating": 0}, {"title": "Good Will Hunting", "year": "", "genre": "", "rating": 0}, {"title": "The Perks of Being a Wallflower", "year": "", "genre": "", "rating": 0}, {"title": "Forrest Gump", "year": "", "genre": "", "rating": 0}, {"title": "Interstellar", "year": "", "genre": "", "rating": 0}, {"title": "Superman (2025)", "year": "", "genre": "", "rating": 0}, {"title": "Mickey 17", "year": "", "genre": "", "rating": 0}, {"title": "GoTG Vol 1", "year": "", "genre": "", "rating": 0}, {"title": "GoTG Vol 2", "year": "", "genre": "", "rating": 0}, {"title": "GoTG Vol 3", "year": "", "genre": "", "rating": 0}, {"title": "Fantastic Four", "year": "", "genre": "", "rating": 0}, {"title": "Iron Man", "year": "", "genre": "", "rating": 0}, {"title": "Iron Man 2", "year": "", "genre": "", "rating": 0}, {"title": "Iron Man 3", "year": "", "genre": "", "rating": 0}, {"title": "Thor", "year": "", "genre": "", "rating": 0}, {"title": "Thor: The Dark World", "year": "", "genre": "", "rating": 0}, {"title": "Thor: Ragnarok", "year": "", "genre": "", "rating": 0}, {"title": "Captain America: The First Avenger", "year": "", "genre": "", "rating": 0}, {"title": "Captain America: The Winter Soldier", "year": "", "genre": "", "rating": 0}, {"title": "Captain America: The Civil War", "year": "", "genre": "", "rating": 0}, {"title": "The Incredible Hulk", "year": "", "genre": "", "rating": 0}, {"title": "X-Men", "year": "", "genre": "", "rating": 0}, {"title": "X-Men: Days of Future Past", "year": "", "genre": "", "rating": 0}, {"title": "X-Men: First Class", "year": "", "genre": "", "rating": 0}, {"title": "X-Men: Origins: Wolverine", "year": "", "genre": "", "rating": 0}, {"title": "X2 (X-Men 2)", "year": "", "genre": "", "rating": 0}, {"title": "The Upside", "year": "", "genre": "", "rating": 0}, {"title": "Kingsman: The Secret Service", "year": "", "genre": "", "rating": 0}, {"title": "Kingsman: The Golden Circle", "year": "", "genre": "", "rating": 0}, {"title": "Deadpool & Wolverine", "year": "", "genre": "", "rating": 0}, {"title": "Blue Beetle", "year": "", "genre": "", "rating": 0}, {"title": "Cars", "year": "", "genre": "", "rating": 0}, {"title": "Cars 2", "year": "", "genre": "", "rating": 0}, {"title": "Cars 3", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man 2", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man 3", "year": "", "genre": "", "rating": 0}, {"title": "The Amazing Spider-Man", "year": "", "genre": "", "rating": 0}, {"title": "The Amazing Spider-Man 2", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man: Homecoming", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man: Far From Home", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man: No Way Home", "year": "", "genre": "", "rating": 0}, {"title": "Venom", "year": "", "genre": "", "rating": 0}, {"title": "The Super Mario Movie", "year": "", "genre": "", "rating": 0}, {"title": "Despicable Me", "year": "", "genre": "", "rating": 0}, {"title": "Despicable Me 2", "year": "", "genre": "", "rating": 0}, {"title": "Despicable Me 3", "year": "", "genre": "", "rating": 0}, {"title": "Minions", "year": "", "genre": "", "rating": 0}]}, {"name": "Tab 2", "movies": [{"title": "Up", "year": "", "genre": "", "rating": 0}, {"title": "Toy Story", "year": "", "genre": "", "rating": 0}, {"title": "Soul", "year": "", "genre": "", "rating": 0}, {"title": "Coco", "year": "", "genre": "", "rating": 0}, {"title": "Luca", "year": "", "genre": "", "rating": 0}, {"title": "Inside Out", "year": "", "genre": "", "rating": 0}, {"title": "Elemental", "year": "", "genre": "", "rating": 0}, {"title": "The Incredibles", "year": "", "genre": "", "rating": 0}, {"title": "The Incredibles 2", "year": "", "genre": "", "rating": 0}, {"title": "Onward", "year": "", "genre": "", "rating": 0}, {"title": "Lightyear", "year": "", "genre": "", "rating": 0}, {"title": "Toy Story 2", "year": "", "genre": "", "rating": 0}, {"title": "Toy Story 3", "year": "", "genre": "", "rating": 0}, {"title": "Toy Story 4", "year": "", "genre": "", "rating": 0}, {"title": "Finding Nemo", "year": "", "genre": "", "rating": 0}, {"title": "Turning Red", "year": "", "genre": "", "rating": 0}, {"title": "Finding Dory", "year": "", "genre": "", "rating": 0}, {"title": "Home Alone", "year": "", "genre": "", "rating": 0}, {"title": "The Polar Express", "year": "", "genre": "", "rating": 0}, {"title": "Zootopia", "year": "", "genre": "", "rating": 0}, {"title": "Moana", "year": "", "genre": "", "rating": 0}, {"title": "Frozen", "year": "", "genre": "", "rating": 0}, {"title": "Nope", "year": "", "genre": "", "rating": 0}, {"title": "Ant-Man", "year": "", "genre": "", "rating": 0}, {"title": "Ant-Man and The Wasp", "year": "", "genre": "", "rating": 0}, {"title": "Black Panther", "year": "", "genre": "", "rating": 0}, {"title": "Captain Marvel", "year": "", "genre": "", "rating": 0}, {"title": "Doctor Strange", "year": "", "genre": "", "rating": 0}, {"title": "Deadpool", "year": "", "genre": "", "rating": 0}, {"title": "Deadpool 2", "year": "", "genre": "", "rating": 0}, {"title": "Shazam!", "year": "", "genre": "", "rating": 0}, {"title": "Avengers", "year": "", "genre": "", "rating": 0}, {"title": "Avengers Age of Ultron", "year": "", "genre": "", "rating": 0}, {"title": "Avengers Infinity War", "year": "", "genre": "", "rating": 0}, {"title": "Avengers Endgame", "year": "", "genre": "", "rating": 0}, {"title": "Sonic The Hedgehog", "year": "", "genre": "", "rating": 0}, {"title": "Sonic The Hedgehog 2", "year": "", "genre": "", "rating": 0}, {"title": "Sonic The Hedgehog 3", "year": "", "genre": "", "rating": 0}, {"title": "An Extremely Goofy Movie", "year": "", "genre": "", "rating": 0}, {"title": "Big Hero 6", "year": "", "genre": "", "rating": 0}, {"title": "Bolt", "year": "", "genre": "", "rating": 0}, {"title": "Chicken Little", "year": "", "genre": "", "rating": 0}, {"title": "Pixels", "year": "", "genre": "", "rating": 0}, {"title": "Encanto", "year": "", "genre": "", "rating": 0}, {"title": "Gnomeo & Juliet", "year": "", "genre": "", "rating": 0}, {"title": "Hercules", "year": "", "genre": "", "rating": 0}, {"title": "Hotel Transylvania", "year": "", "genre": "", "rating": 0}, {"title": "Hotel Transylvania 2", "year": "", "genre": "", "rating": 0}, {"title": "Hotel Transylvania 3", "year": "", "genre": "", "rating": 0}, {"title": "The Emperors New Groove", "year": "", "genre": "", "rating": 0}]}, {"name": "Tab 3", "movies": [{"title": "The Simpsons Movie", "year": "", "genre": "", "rating": 0}, {"title": "Nine (9)", "year": "", "genre": "", "rating": 0}, {"title": "Miraculous New York, United Heroes", "year": "", "genre": "", "rating": 0}, {"title": "Rio", "year": "", "genre": "", "rating": 0}, {"title": "Phineas and Ferb Candace Against The Universe", "year": "", "genre": "", "rating": 0}, {"title": "Phineas and Ferb Across the 2nd Dimension", "year": "", "genre": "", "rating": 0}, {"title": "Phineas and Ferb Mission Marvel", "year": "", "genre": "", "rating": 0}, {"title": "Wreck-It-Ralph", "year": "", "genre": "", "rating": 0}, {"title": "Ralph Breaks The Internet", "year": "", "genre": "", "rating": 0}, {"title": "Rio 2", "year": "", "genre": "", "rating": 0}, {"title": "Robots", "year": "", "genre": "", "rating": 0}, {"title": "Shrek", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man Into The Spider-Verse", "year": "", "genre": "", "rating": 0}, {"title": "Spider-Man Across The Spider-Verse", "year": "", "genre": "", "rating": 0}, {"title": "The Friendly Giant", "year": "", "genre": "", "rating": 0}, {"title": "Who Framed Roger Rabbit", "year": "", "genre": "", "rating": 0}, {"title": "17 Again", "year": "", "genre": "", "rating": 0}, {"title": "Air Bud", "year": "", "genre": "", "rating": 0}, {"title": "Alvin and The Chipmunks", "year": "", "genre": "", "rating": 0}, {"title": "Alvin and The Chipmunks: The Squeakquel", "year": "", "genre": "", "rating": 0}, {"title": "Alvin and The Chipmunks: Chipwrecked", "year": "", "genre": "", "rating": 0}, {"title": "Alvin and the Chipmunks: The Road Chip", "year": "", "genre": "", "rating": 0}, {"title": "Alvin and the Chipmunks Meet the Wolfman", "year": "", "genre": "", "rating": 0}, {"title": "Police Academy", "year": "", "genre": "", "rating": 0}, {"title": "Click", "year": "", "genre": "", "rating": 0}, {"title": "Happy Gilmore", "year": "", "genre": "", "rating": 0}, {"title": "Water Boy", "year": "", "genre": "", "rating": 0}, {"title": "Garfield", "year": "", "genre": "", "rating": 0}, {"title": "Zombieland", "year": "", "genre": "", "rating": 0}, {"title": "Zombieland: Double Tap", "year": "", "genre": "", "rating": 0}, {"title": "#ALIVE", "year": "", "genre": "", "rating": 0}, {"title": "Invisible Sister", "year": "", "genre": "", "rating": 0}, {"title": "Holes", "year": "", "genre": "", "rating": 0}, {"title": "Hatchet", "year": "", "genre": "", "rating": 0}, {"title": "Julie & Julia", "year": "", "genre": "", "rating": 0}, {"title": "Goosebumps", "year": "", "genre": "", "rating": 0}, {"title": "Goosebumps 2", "year": "", "genre": "", "rating": 0}, {"title": "Sky High", "year": "", "genre": "", "rating": 0}, {"title": "Spooky Buddies", "year": "", "genre": "", "rating": 0}, {"title": "Super Buddies", "year": "", "genre": "", "rating": 0}, {"title": "Santa Claus", "year": "", "genre": "", "rating": 0}, {"title": "Santa Clause 2", "year": "", "genre": "", "rating": 0}, {"title": "Tucker and Dale vs Evil", "year": "", "genre": "", "rating": 0}, {"title": "Million Dollar Baby", "year": "", "genre": "", "rating": 0}, {"title": "Zapped", "year": "", "genre": "", "rating": 0}, {"title": "Gran Turismo", "year": "", "genre": "", "rating": 0}, {"title": "Turbo", "year": "", "genre": "", "rating": 0}, {"title": "The Art of Racing in the Rain", "year": "", "genre": "", "rating": 0}, {"title": "John Wick", "year": "", "genre": "", "rating": 0}, {"title": "John Wick 2", "year": "", "genre": "", "rating": 0}]}, {"name": "Tab 4", "movies": [{"title": "John Wick 3", "year": "", "genre": "", "rating": 0}, {"title": "Meet The Robinsons", "year": "", "genre": "", "rating": 0}, {"title": "Monster House", "year": "", "genre": "", "rating": 0}, {"title": "Hacksaw Ridge", "year": "", "genre": "", "rating": 0}, {"title": "Wish Dragon", "year": "", "genre": "", "rating": 0}, {"title": "Shang-Chi", "year": "", "genre": "", "rating": 0}, {"title": "Dodgeball", "year": "", "genre": "", "rating": 0}, {"title": "Children of The Corn", "year": "", "genre": "", "rating": 0}, {"title": "Birdbox", "year": "", "genre": "", "rating": 0}, {"title": "Ice Age", "year": "", "genre": "", "rating": 0}, {"title": "Ice Age 2", "year": "", "genre": "", "rating": 0}, {"title": "Ice Age 3", "year": "", "genre": "", "rating": 0}, {"title": "Ice Age 4", "year": "", "genre": "", "rating": 0}, {"title": "The Happening", "year": "", "genre": "", "rating": 0}, {"title": "The Mist", "year": "", "genre": "", "rating": 0}, {"title": "Hubie Halloween", "year": "", "genre": "", "rating": 0}, {"title": "The Platform", "year": "", "genre": "", "rating": 0}, {"title": "Jujutsu Kaisen 0", "year": "", "genre": "", "rating": 0}, {"title": "Demon Slayer Mugen Train", "year": "", "genre": "", "rating": 0}, {"title": "MHA: Heroes: Rising", "year": "", "genre": "", "rating": 0}, {"title": "MHA: Two Heroes", "year": "", "genre": "", "rating": 0}, {"title": "Paranorman", "year": "", "genre": "", "rating": 0}, {"title": "Vampire Dog", "year": "", "genre": "", "rating": 0}, {"title": "The Little Vampire 3d", "year": "", "genre": "", "rating": 0}, {"title": "Green Lantern", "year": "", "genre": "", "rating": 0}, {"title": "Men in Black", "year": "", "genre": "", "rating": 0}, {"title": "Men in Black 2", "year": "", "genre": "", "rating": 0}, {"title": "Ghost Rider", "year": "", "genre": "", "rating": 0}, {"title": "Kick-Ass", "year": "", "genre": "", "rating": 0}, {"title": "Next Avengers: Heroes of Tomorrow", "year": "", "genre": "", "rating": 0}, {"title": "Planet Hulk", "year": "", "genre": "", "rating": 0}, {"title": "Joker", "year": "", "genre": "", "rating": 0}, {"title": "Birds of Prey", "year": "", "genre": "", "rating": 0}, {"title": "The Bee Movie", "year": "", "genre": "", "rating": 0}, {"title": "Its Game Over Man", "year": "", "genre": "", "rating": 0}, {"title": "Man of Steel", "year": "", "genre": "", "rating": 0}, {"title": "Batman v Superman: Dawn of Justice", "year": "", "genre": "", "rating": 0}, {"title": "Suicide Squad", "year": "", "genre": "", "rating": 0}, {"title": "The Lego Batman Movie", "year": "", "genre": "", "rating": 0}, {"title": "Justice League", "year": "", "genre": "", "rating": 0}, {"title": "The Flashpoint Paradox", "year": "", "genre": "", "rating": 0}, {"title": "Kill Bill: Vol. 1", "year": "", "genre": "", "rating": 0}, {"title": "The Lego Movie", "year": "", "genre": "", "rating": 0}, {"title": "Mortal Kombat", "year": "", "genre": "", "rating": 0}, {"title": "Get Out", "year": "", "genre": "", "rating": 0}, {"title": "Bruce Almighty", "year": "", "genre": "", "rating": 0}, {"title": "Evan Almighty", "year": "", "genre": "", "rating": 0}, {"title": "Ace Ventura", "year": "", "genre": "", "rating": 0}, {"title": "The Mask", "year": "", "genre": "", "rating": 0}, {"title": "Five Nights at Freddy's", "year": "", "genre": "", "rating": 0}]}, {"name": "Tab 5", "movies": [{"title": "Five Nights at Freddy's 2", "year": "", "genre": "", "rating": 0}, {"title": "Rim of The World", "year": "", "genre": "", "rating": 0}, {"title": "Hajime No Ippo: Champion Road", "year": "", "genre": "", "rating": 0}, {"title": "The Seven Deadly Sins: Prisoners of the Sky", "year": "", "genre": "", "rating": 0}, {"title": "Sing", "year": "", "genre": "", "rating": 0}, {"title": "Charlie's Angels", "year": "", "genre": "", "rating": 0}, {"title": "Angry Birds 1", "year": "", "genre": "", "rating": 0}, {"title": "Angry Birds 2", "year": "", "genre": "", "rating": 0}, {"title": "Bloodsport", "year": "", "genre": "", "rating": 0}, {"title": "JJK Execution", "year": "", "genre": "", "rating": 0}, {"title": "Taken", "year": "", "genre": "", "rating": 0}, {"title": "Taken 2", "year": "", "genre": "", "rating": 0}, {"title": "National Lampoon's Christmas Vacation", "year": "", "genre": "", "rating": 0}, {"title": "Mr. Peabody and Sherman", "year": "", "genre": "", "rating": 0}, {"title": "The Ant Bully", "year": "", "genre": "", "rating": 0}, {"title": "Venom: Let There be Carnage", "year": "", "genre": "", "rating": 0}, {"title": "Hotel Transylvania 4", "year": "", "genre": "", "rating": 0}, {"title": "Venom: The Last Dance", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}, {"title": "", "year": "", "genre": "", "rating": 0}]}]};
  tabs = PRESET.tabs;
}

function emptyMovie() {
  return { title: '', year: '', genre: '', rating: 0 };
}

// ══════════════════════════════════════════
//  AUTH  — plain-text password never stored
// ══════════════════════════════════════════
async function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;

  if (u !== CONFIG.ADMIN_USERNAME) {
    document.getElementById('login-err').textContent = 'Invalid credentials.';
    return;
  }
  const hash = await sha256(p);
  if (hash !== CONFIG.PASSWORD_HASH) {
    document.getElementById('login-err').textContent = 'Invalid credentials.';
    return;
  }

  isAdmin = true;
  document.getElementById('login-overlay').style.display = 'none';
  document.body.classList.remove('guest-mode');
  document.getElementById('user-badge').textContent = 'ADMIN';
  document.getElementById('user-badge').className   = 'user-badge admin';
  toast('Welcome back, ' + u);
  render();
}

function guestMode() {
  isAdmin = false;
  document.getElementById('login-overlay').style.display = 'none';
  document.body.classList.add('guest-mode');
  document.getElementById('user-badge').textContent = 'VIEWER';
  render();
}

function doLogout() {
  isAdmin = false;
  document.body.classList.add('guest-mode');
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('login-user').value      = '';
  document.getElementById('login-pass').value      = '';
  document.getElementById('login-err').textContent = '';
  document.getElementById('user-badge').textContent = 'GUEST';
  document.getElementById('user-badge').className   = 'user-badge';
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ══════════════════════════════════════════
//  STATS
// ══════════════════════════════════════════
function updateStats() {
  let total = 0;
  tabs.forEach(t => t.movies.forEach(m => { if (m.title.trim()) total++; }));
  document.getElementById('stats-bar').innerHTML = `<span>${total}</span> movies tracked`;
}

// ══════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════
function render() {
  renderTabsNav();
  renderTabPanel();
  updateStats();
}

function renderTabsNav() {
  const nav = document.getElementById('tabs-nav');
  nav.innerHTML = '';
  tabs.forEach((tab, i) => {
    const btn     = document.createElement('button');
    btn.className = 'tab-btn' + (i === activeTab ? ' active' : '');
    const filled  = tab.movies.filter(m => m.title.trim()).length;
    btn.innerHTML = `<span class="tab-label">${escHtml(tab.name)}</span><span class="tab-count">${filled}</span>`;
    btn.onclick   = (e) => { if (e.target.tagName === 'INPUT') return; switchTab(i); };
    if (isAdmin) btn.ondblclick = (e) => { e.stopPropagation(); startRenameTab(i, btn); };
    nav.appendChild(btn);
  });
  if (isAdmin) {
    const addBtn       = document.createElement('button');
    addBtn.id          = 'add-tab-btn';
    addBtn.title       = 'Add new tab';
    addBtn.textContent = '+';
    addBtn.onclick     = addTab;
    nav.appendChild(addBtn);
  }
}

function startRenameTab(i, btn) {
  const label    = btn.querySelector('.tab-label');
  const inp      = document.createElement('input');
  inp.className  = 'tab-rename-input';
  inp.value      = tabs[i].name;
  inp.onclick    = e => e.stopPropagation();
  inp.ondblclick = e => e.stopPropagation();
  label.replaceWith(inp);
  inp.focus(); inp.select();
  const finish = () => { tabs[i].name = inp.value.trim() || tabs[i].name; saveToGist(); renderTabsNav(); };
  inp.onblur    = finish;
  inp.onkeydown = e => {
    if (e.key === 'Enter')  inp.blur();
    if (e.key === 'Escape') { inp.value = tabs[i].name; inp.blur(); }
  };
}

function switchTab(i) { activeTab = i; renderTabsNav(); renderTabPanel(); }

function addTab() {
  const newTab = { name: `Tab ${tabs.length + 1}`, movies: [] };
  for (let i = 0; i < 50; i++) newTab.movies.push(emptyMovie());
  tabs.push(newTab);
  activeTab = tabs.length - 1;
  saveToGist();
  render();
  toast('New tab added');
}

function renderTabPanel() {
  const main  = document.getElementById('main-content');
  main.innerHTML = '';
  const tab   = tabs[activeTab];
  const panel = document.createElement('div');
  panel.className = 'tab-panel active';

  const tableWrap = document.createElement('div');
  tableWrap.className = 'table-wrap';

  const table = document.createElement('table');
  table.innerHTML = `<thead><tr>
    <th>#</th><th>Title</th><th>Year</th><th>Genre</th><th>Rating</th>
    ${isAdmin ? '<th></th>' : ''}
  </tr></thead>`;

  const tbody = document.createElement('tbody');
  tab.movies.forEach((movie, idx) => tbody.appendChild(createRow(movie, idx)));
  table.appendChild(tbody);
  tableWrap.appendChild(table);
  panel.appendChild(tableWrap);

  if (isAdmin) {
    const addBtn     = document.createElement('button');
    addBtn.className = 'add-row-btn';
    addBtn.innerHTML = `<span>+</span> Add Movie Slot`;
    addBtn.onclick   = () => {
      if (tab.movies.length >= 500) { toast('Max 500 slots per tab'); return; }
      tab.movies.push(emptyMovie());
      saveToGist();
      const newIdx = tab.movies.length - 1;
      const tr     = createRow(tab.movies[newIdx], newIdx);
      tbody.appendChild(tr);
      updateStats(); renderTabsNav();
      tr.querySelector('.title-input')?.focus();
      toast('Slot added');
    };
    panel.appendChild(addBtn);
  }
  main.appendChild(panel);
}

function createRow(movie, idx) {
  const tr = document.createElement('tr');
  const ro = !isAdmin ? ' readonly' : '';

  tr.innerHTML = `
    <td>${idx + 1}</td>
    <td class="col-title autocomplete-wrap">
      <input class="cell-input title-input" value="${escHtml(movie.title)}"
             placeholder="Movie title…" ${ro} autocomplete="off" data-idx="${idx}" />
      <div class="autocomplete-dropdown" id="ac-${activeTab}-${idx}"></div>
    </td>
    <td class="col-year">
      <input class="cell-input year-input${movie.year ? ' autofilled' : ''}"
             value="${escHtml(movie.year)}" placeholder="Year" ${ro} data-idx="${idx}" />
    </td>
    <td class="col-genre">
      <input class="cell-input genre-input${movie.genre ? ' autofilled' : ''}"
             value="${escHtml(movie.genre)}" placeholder="Genre" ${ro} data-idx="${idx}" />
    </td>
    <td class="col-rating">
      <div class="rating-wrap">
        <input class="rating-input" type="number" min="0" max="10" step="0.5"
               value="${movie.rating || ''}" placeholder="—"
               ${!isAdmin ? 'readonly' : ''} id="rating-${activeTab}-${idx}" data-idx="${idx}" />
        <span class="rating-denom">/10</span>
      </div>
    </td>
    ${isAdmin ? `<td class="col-actions"><button class="del-btn" data-idx="${idx}" title="Clear row">✕</button></td>` : ''}
  `;

  if (isAdmin) {
    const titleInput  = tr.querySelector('.title-input');
    const yearInput   = tr.querySelector('.year-input');
    const genreInput  = tr.querySelector('.genre-input');
    const acDrop      = tr.querySelector(`#ac-${activeTab}-${idx}`);
    const delBtn      = tr.querySelector('.del-btn');
    const ratingInput = tr.querySelector(`#rating-${activeTab}-${idx}`);

    titleInput.addEventListener('input', (e) => {
      const val = e.target.value;
      tabs[activeTab].movies[idx].title = val;
      saveToGist(); updateStats(); renderTabsNav();
      if (val.length >= 2) {
        clearTimeout(acTimers[idx]);
        acTimers[idx] = setTimeout(() => fetchMovieSuggestions(val, idx, acDrop, yearInput, genreInput), 400);
      } else { acDrop.innerHTML = ''; }
    });
    titleInput.addEventListener('blur', () => { setTimeout(() => { acDrop.innerHTML = ''; }, 200); });

    yearInput.addEventListener('input', (e) => {
      tabs[activeTab].movies[idx].year = e.target.value;
      e.target.classList.remove('autofilled'); saveToGist();
    });
    genreInput.addEventListener('input', (e) => {
      tabs[activeTab].movies[idx].genre = e.target.value;
      e.target.classList.remove('autofilled'); saveToGist();
    });
    ratingInput.addEventListener('change', (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 0;
      val = Math.min(10, Math.max(0, val));
      e.target.value = val || '';
      tabs[activeTab].movies[idx].rating = val;
      saveToGist();
    });
    delBtn.addEventListener('click', () => {
      tabs[activeTab].movies[idx] = emptyMovie();
      saveToGist();
      tr.replaceWith(createRow(tabs[activeTab].movies[idx], idx));
      updateStats(); renderTabsNav();
      toast('Row cleared');
    });
  }
  return tr;
}

// ══════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════
function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════
//  MOVIE AUTOFILL
// ══════════════════════════════════════════
async function fetchMovieSuggestions(query, idx, dropdown, yearInput, genreInput) {
  if (!query || query.length < 2) { dropdown.innerHTML = ''; return; }
  dropdown.innerHTML = `<div class="ac-loading">Searching…</div>`;
  try {
    const wikiSearch   = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query + ' film')}&limit=6&namespace=0&format=json&origin=*`
    );
    const wikiData     = await wikiSearch.json();
    const titles       = wikiData[1] || [];
    const descriptions = wikiData[2] || [];

    if (!titles.length) {
      const omdbResults = await fetchOmdbSearch(query);
      if (!omdbResults.length) {
        dropdown.innerHTML = `<div class="ac-loading">No results found</div>`;
        setTimeout(() => { dropdown.innerHTML = ''; }, 1500);
        return;
      }
      dropdown.innerHTML = '';
      omdbResults.forEach(item => {
        const el     = document.createElement('div');
        el.className = 'ac-item';
        el.innerHTML = `<span class="ac-title">${escHtml(item.title)}</span><span class="ac-meta">${item.year||''}</span>`;
        el.addEventListener('mousedown', async (e) => {
          e.preventDefault();
          const omdb = await fetchOmdbByTitle(item.title, item.year);
          applyMovieDetails(idx, item.title, omdb?.year||item.year, omdb?.genre||'', dropdown, yearInput, genreInput);
        });
        dropdown.appendChild(el);
      });
      return;
    }

    dropdown.innerHTML = '';
    titles.slice(0, 6).forEach((title, i) => {
      const item       = document.createElement('div');
      item.className   = 'ac-item';
      const yearMatch  = descriptions[i]?.match(/\b(19[0-9]{2}|20[0-2][0-9])\b/);
      const yearStr    = yearMatch ? yearMatch[0] : '';
      const cleanTitle = title.replace(/ \([\d]{4} film\)$/i,'').replace(/ \([^)]*film[^)]*\)$/i,'');
      item.innerHTML   = `<span class="ac-title">${escHtml(cleanTitle)}</span><span class="ac-meta">${yearStr}</span>`;
      item.addEventListener('mousedown', async (e) => {
        e.preventDefault();
        dropdown.innerHTML = `<div class="ac-loading">Loading details…</div>`;
        const wikiDetails  = await fetchWikiDetails(title);
        let year  = wikiDetails.year  || yearStr || '';
        let genre = wikiDetails.genre || '';
        if (!genre || !year) {
          dropdown.innerHTML = `<div class="ac-loading">Checking IMDB…</div>`;
          const omdb = await fetchOmdbByTitle(cleanTitle, year);
          if (omdb) { year = year||omdb.year||''; genre = genre||omdb.genre||''; }
        }
        applyMovieDetails(idx, cleanTitle, year, genre, dropdown, yearInput, genreInput);
      });
      dropdown.appendChild(item);
    });
  } catch (e) {
    dropdown.innerHTML = `<div class="ac-loading">Search unavailable</div>`;
    setTimeout(() => { dropdown.innerHTML = ''; }, 1500);
  }
}

function applyMovieDetails(idx, title, year, genre, dropdown, yearInput, genreInput) {
  const movie = tabs[activeTab].movies[idx];
  movie.title = title;
  movie.year  = year  || movie.year;
  movie.genre = genre || movie.genre;
  saveToGist();
  const titleInput = dropdown.closest('td').querySelector('.title-input');
  if (titleInput)  titleInput.value = title;
  if (yearInput)  { yearInput.value  = movie.year;  yearInput.classList.toggle('autofilled',  !!movie.year); }
  if (genreInput) { genreInput.value = movie.genre; genreInput.classList.toggle('autofilled', !!movie.genre); }
  dropdown.innerHTML = '';
  updateStats(); renderTabsNav();
  toast(`"${title}" auto-filled`);
}

async function fetchWikiDetails(pageTitle) {
  try {
    const res     = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*&formatversion=2`
    );
    const data    = await res.json();
    const pages   = data.query?.pages || [];
    if (!pages.length) return {};
    const content = pages[0]?.revisions?.[0]?.slots?.main?.content || '';

    let year = '';
    for (const pat of [
      /\|\s*release_date\s*=[^\n]*?(19[0-9]{2}|20[0-2][0-9])/i,
      /\|\s*released\s*=[^\n]*?(19[0-9]{2}|20[0-2][0-9])/i,
      /\|\s*year\s*=\s*(19[0-9]{2}|20[0-2][0-9])/i,
    ]) { const m = content.match(pat); if (m) { year = m[1]; break; } }
    if (!year) { const m = content.match(/\b(19[3-9][0-9]|20[0-2][0-9])\b/); if (m) year = m[1]; }

    let genre = '';
    const gsi = content.search(/\|\s*genre\s*=/i);
    if (gsi !== -1) {
      const afterEq = content.indexOf('=', gsi) + 1;
      let depth = 0, ci = afterEq, fieldEnd = content.length;
      while (ci < content.length) {
        if (content[ci]==='{' && content[ci+1]==='{') { depth++; ci+=2; continue; }
        if (content[ci]==='}' && content[ci+1]==='}') { depth--; ci+=2; continue; }
        if (content[ci]==='\n' && depth===0 && /[ \t]*\|/.test(content.slice(ci+1))) { fieldEnd=ci; break; }
        ci++;
      }
      let raw = content.slice(afterEq, fieldEnd);
      const fgm = raw.match(/\{\{[Ff]ilm[\s_][Gg]enre\|([^}]+)\}\}/);
      if (fgm) { const first = fgm[1].split('|')[0].trim(); if (first) genre = first.charAt(0).toUpperCase()+first.slice(1); }
      if (!genre) {
        raw = raw.replace(/\{\{(?:plain\s*list|unbulleted\s*list|flat\s*list)\s*\|/gi,'\n')
                 .replace(/\{\{[^}]*\}\}/g,'')
                 .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g,'$1')
                 .replace(/\}\}/g,'').replace(/<!--.*?-->/gs,'');
        const parts = raw.split(/[\n|,/]/).map(s=>s.replace(/^\s*[*#•]\s*/,'').trim()).filter(s=>s.length>1&&s.length<50&&!s.startsWith('{'));
        if (parts.length) genre = parts[0];
      }
    }
    return { year, genre };
  } catch (e) { return {}; }
}

async function fetchOmdbByTitle(title, year) {
  try {
    const res  = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}${year?`&y=${year}`:''}&type=movie&apikey=${OMDB_KEY}`);
    const data = await res.json();
    if (data.Response === 'True') return { title: data.Title, year: data.Year?.slice(0,4)||'', genre: data.Genre?.split(',')[0].trim()||'' };
    return null;
  } catch (e) { return null; }
}

async function fetchOmdbSearch(query) {
  try {
    const res  = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_KEY}`);
    const data = await res.json();
    if (data.Response==='True' && data.Search) return data.Search.slice(0,6).map(m=>({ title:m.Title, year:m.Year?.slice(0,4)||'', genre:'' }));
    return [];
  } catch (e) { return []; }
}

// ══════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════
document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
document.getElementById('login-user').addEventListener('keydown', e => { if (e.key==='Enter') document.getElementById('login-pass').focus(); });

loadFromGist();
