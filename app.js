// ══════════════════════════════════════════
//  CineVault — app.js
// ══════════════════════════════════════════

// ── CONFIG — change these credentials! ──
const ADMIN_USER  = 'admin';
const ADMIN_PASS  = 'cinevault2024';
const STORAGE_KEY = 'cinevault_data_v2';

// Free OMDb API key (public demo key — works for personal use)
const OMDB_KEY = 'trilogy';

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let isAdmin    = false;
let activeTab  = 0;
let tabs       = [];   // [{ name, movies: [{title, year, genre, rating}] }]
let acTimers   = {};

// ══════════════════════════════════════════
//  PERSISTENCE
// ══════════════════════════════════════════
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs }));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      tabs = parsed.tabs || [];
    }
  } catch (e) { tabs = []; }

  if (!tabs.length) {
    tabs = [{ name: 'Tab 1', movies: [] }];
    for (let i = 0; i < 50; i++) tabs[0].movies.push(emptyMovie());
    saveData();
  }
}

function emptyMovie() {
  return { title: '', year: '', genre: '', rating: 0 };
}

// ══════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════
function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    isAdmin = true;
    document.getElementById('login-overlay').style.display = 'none';
    document.body.classList.remove('guest-mode');
    document.getElementById('user-badge').textContent    = 'ADMIN';
    document.getElementById('user-badge').className      = 'user-badge admin';
    toast('Welcome back, ' + u);
    render();
  } else {
    document.getElementById('login-err').textContent = 'Invalid credentials.';
  }
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
  document.getElementById('login-user').value           = '';
  document.getElementById('login-pass').value           = '';
  document.getElementById('login-err').textContent      = '';
  document.getElementById('user-badge').textContent     = 'GUEST';
  document.getElementById('user-badge').className       = 'user-badge';
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
    const btn    = document.createElement('button');
    btn.className = 'tab-btn' + (i === activeTab ? ' active' : '');
    const filled  = tab.movies.filter(m => m.title.trim()).length;
    btn.innerHTML = `<span class="tab-label">${escHtml(tab.name)}</span><span class="tab-count">${filled}</span>`;
    btn.onclick   = (e) => { if (e.target.tagName === 'INPUT') return; switchTab(i); };
    if (isAdmin) {
      btn.ondblclick = (e) => { e.stopPropagation(); startRenameTab(i, btn); };
    }
    nav.appendChild(btn);
  });

  if (isAdmin) {
    const addBtn    = document.createElement('button');
    addBtn.id       = 'add-tab-btn';
    addBtn.title    = 'Add new tab';
    addBtn.textContent = '+';
    addBtn.onclick  = addTab;
    nav.appendChild(addBtn);
  }
}

function startRenameTab(i, btn) {
  const label = btn.querySelector('.tab-label');
  const inp   = document.createElement('input');
  inp.className  = 'tab-rename-input';
  inp.value      = tabs[i].name;
  inp.onclick    = e => e.stopPropagation();
  inp.ondblclick = e => e.stopPropagation();
  label.replaceWith(inp);
  inp.focus(); inp.select();

  const finish = () => {
    tabs[i].name = inp.value.trim() || tabs[i].name;
    saveData();
    renderTabsNav();
  };
  inp.onblur   = finish;
  inp.onkeydown = e => {
    if (e.key === 'Enter')  inp.blur();
    if (e.key === 'Escape') { inp.value = tabs[i].name; inp.blur(); }
  };
}

function switchTab(i) {
  activeTab = i;
  renderTabsNav();
  renderTabPanel();
}

function addTab() {
  const newTab = { name: `Tab ${tabs.length + 1}`, movies: [] };
  for (let i = 0; i < 50; i++) newTab.movies.push(emptyMovie());
  tabs.push(newTab);
  activeTab = tabs.length - 1;
  saveData();
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
    <th>#</th>
    <th>Title</th>
    <th>Year</th>
    <th>Genre</th>
    <th>Rating</th>
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
      saveData();
      const newIdx = tab.movies.length - 1;
      const tr     = createRow(tab.movies[newIdx], newIdx);
      tbody.appendChild(tr);
      updateStats();
      renderTabsNav();
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
      <input class="cell-input title-input"
             value="${escHtml(movie.title)}"
             placeholder="Movie title…"
             ${ro}
             autocomplete="off"
             data-idx="${idx}" />
      <div class="autocomplete-dropdown" id="ac-${activeTab}-${idx}"></div>
    </td>
    <td class="col-year">
      <input class="cell-input year-input${movie.year ? ' autofilled' : ''}"
             value="${escHtml(movie.year)}"
             placeholder="Year"
             ${ro}
             data-idx="${idx}" />
    </td>
    <td class="col-genre">
      <input class="cell-input genre-input${movie.genre ? ' autofilled' : ''}"
             value="${escHtml(movie.genre)}"
             placeholder="Genre"
             ${ro}
             data-idx="${idx}" />
    </td>
    <td class="col-rating">
      <div class="stars${!isAdmin ? ' readonly' : ''}" id="stars-${activeTab}-${idx}" data-idx="${idx}">
        ${buildStars(movie.rating || 0)}
      </div>
    </td>
    ${isAdmin ? `<td class="col-actions"><button class="del-btn" data-idx="${idx}" title="Clear row">✕</button></td>` : ''}
  `;

  if (isAdmin) {
    const titleInput = tr.querySelector('.title-input');
    const yearInput  = tr.querySelector('.year-input');
    const genreInput = tr.querySelector('.genre-input');
    const acDrop     = tr.querySelector(`#ac-${activeTab}-${idx}`);
    const delBtn     = tr.querySelector('.del-btn');
    const starsEl    = tr.querySelector(`#stars-${activeTab}-${idx}`);

    titleInput.addEventListener('input', (e) => {
      const val = e.target.value;
      tabs[activeTab].movies[idx].title = val;
      saveData(); updateStats(); renderTabsNav();
      if (val.length >= 2) {
        clearTimeout(acTimers[idx]);
        acTimers[idx] = setTimeout(() => fetchMovieSuggestions(val, idx, acDrop, yearInput, genreInput), 400);
      } else { acDrop.innerHTML = ''; }
    });

    titleInput.addEventListener('blur', () => {
      setTimeout(() => { acDrop.innerHTML = ''; }, 200);
    });

    yearInput.addEventListener('input', (e) => {
      tabs[activeTab].movies[idx].year = e.target.value;
      e.target.classList.remove('autofilled');
      saveData();
    });

    genreInput.addEventListener('input', (e) => {
      tabs[activeTab].movies[idx].genre = e.target.value;
      e.target.classList.remove('autofilled');
      saveData();
    });

    bindStars(starsEl, idx);

    delBtn.addEventListener('click', () => {
      tabs[activeTab].movies[idx] = emptyMovie();
      saveData();
      const newTr = createRow(tabs[activeTab].movies[idx], idx);
      tr.replaceWith(newTr);
      updateStats(); renderTabsNav();
      toast('Row cleared');
    });
  }

  return tr;
}

// ══════════════════════════════════════════
//  STARS
// ══════════════════════════════════════════
function buildStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= rating ? ' lit' : ''}">★</span>`;
  }
  return html;
}

function bindStars(starsEl, idx) {
  starsEl.querySelectorAll('.star').forEach((star, si) => {
    star.addEventListener('mouseenter', () => {
      starsEl.querySelectorAll('.star').forEach((s, j) => s.classList.toggle('hov', j <= si));
    });
    star.addEventListener('mouseleave', () => {
      starsEl.querySelectorAll('.star').forEach(s => s.classList.remove('hov'));
    });
    star.addEventListener('click', () => {
      const newRating = si + 1;
      const current   = tabs[activeTab].movies[idx].rating;
      tabs[activeTab].movies[idx].rating = (current === newRating) ? 0 : newRating;
      saveData();
      starsEl.innerHTML = buildStars(tabs[activeTab].movies[idx].rating);
      bindStars(starsEl, idx);
    });
  });
}

// ══════════════════════════════════════════
//  UTILITY
// ══════════════════════════════════════════
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════
//  MOVIE AUTOFILL
//  1) Wikipedia opensearch → dropdown suggestions
//  2) On select: Wikipedia wikitext for year + genre
//  3) Anything still missing → OMDb (IMDB data) fallback
// ══════════════════════════════════════════
async function fetchMovieSuggestions(query, idx, dropdown, yearInput, genreInput) {
  if (!query || query.length < 2) { dropdown.innerHTML = ''; return; }
  dropdown.innerHTML = `<div class="ac-loading">Searching…</div>`;

  try {
    const wikiSearch = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query + ' film')}&limit=6&namespace=0&format=json&origin=*`
    );
    const wikiData    = await wikiSearch.json();
    const titles      = wikiData[1] || [];
    const descriptions = wikiData[2] || [];

    // If Wikipedia finds nothing fall back to OMDb search
    if (!titles.length) {
      const omdbResults = await fetchOmdbSearch(query);
      if (!omdbResults.length) {
        dropdown.innerHTML = `<div class="ac-loading">No results found</div>`;
        setTimeout(() => { dropdown.innerHTML = ''; }, 1500);
        return;
      }
      dropdown.innerHTML = '';
      omdbResults.forEach(item => {
        const el      = document.createElement('div');
        el.className  = 'ac-item';
        el.innerHTML  = `<span class="ac-title">${escHtml(item.title)}</span><span class="ac-meta">${item.year || ''}</span>`;
        el.addEventListener('mousedown', async (e) => {
          e.preventDefault();
          // OMDb search doesn't return genre — fetch it now
          const omdb = await fetchOmdbByTitle(item.title, item.year);
          applyMovieDetails(idx, item.title, omdb?.year || item.year, omdb?.genre || '', dropdown, yearInput, genreInput);
        });
        dropdown.appendChild(el);
      });
      return;
    }

    // Build dropdown from Wikipedia results
    dropdown.innerHTML = '';
    titles.slice(0, 6).forEach((title, i) => {
      const item       = document.createElement('div');
      item.className   = 'ac-item';
      const yearMatch  = descriptions[i]?.match(/\b(19[0-9]{2}|20[0-2][0-9])\b/);
      const yearStr    = yearMatch ? yearMatch[0] : '';
      const cleanTitle = title
        .replace(/ \([\d]{4} film\)$/i, '')
        .replace(/ \([^)]*film[^)]*\)$/i, '');
      item.innerHTML = `<span class="ac-title">${escHtml(cleanTitle)}</span><span class="ac-meta">${yearStr}</span>`;

      item.addEventListener('mousedown', async (e) => {
        e.preventDefault();
        dropdown.innerHTML = `<div class="ac-loading">Loading details…</div>`;

        // Try Wikipedia wikitext first
        const wikiDetails = await fetchWikiDetails(title);
        let year  = wikiDetails.year  || yearStr || '';
        let genre = wikiDetails.genre || '';

        // Fall back to OMDb if anything is still missing
        if (!genre || !year) {
          dropdown.innerHTML = `<div class="ac-loading">Checking IMDB…</div>`;
          const omdb = await fetchOmdbByTitle(cleanTitle, year);
          if (omdb) {
            year  = year  || omdb.year  || '';
            genre = genre || omdb.genre || '';
          }
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
  const movie   = tabs[activeTab].movies[idx];
  movie.title   = title;
  movie.year    = year  || movie.year;
  movie.genre   = genre || movie.genre;
  saveData();

  const titleInput = dropdown.closest('td').querySelector('.title-input');
  if (titleInput)  titleInput.value = title;
  if (yearInput)  { yearInput.value  = movie.year;  yearInput.classList.toggle('autofilled',  !!movie.year); }
  if (genreInput) { genreInput.value = movie.genre; genreInput.classList.toggle('autofilled', !!movie.genre); }
  dropdown.innerHTML = '';
  updateStats(); renderTabsNav();
  toast(`"${title}" auto-filled`);
}

// ── Wikipedia wikitext parser ──
async function fetchWikiDetails(pageTitle) {
  try {
    const res     = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=revisions&rvprop=content&rvslots=main&format=json&origin=*&formatversion=2`
    );
    const data    = await res.json();
    const pages   = data.query?.pages || [];
    if (!pages.length) return {};
    const content = pages[0]?.revisions?.[0]?.slots?.main?.content || '';

    // Extract year
    let year = '';
    const yearPatterns = [
      /\|\s*release_date\s*=[^\n]*?(19[0-9]{2}|20[0-2][0-9])/i,
      /\|\s*released\s*=[^\n]*?(19[0-9]{2}|20[0-2][0-9])/i,
      /\|\s*year\s*=\s*(19[0-9]{2}|20[0-2][0-9])/i,
    ];
    for (const pat of yearPatterns) {
      const m = content.match(pat);
      if (m) { year = m[1]; break; }
    }
    if (!year) {
      const m = content.match(/\b(19[3-9][0-9]|20[0-2][0-9])\b/);
      if (m) year = m[1];
    }

    // Extract genre — brace-depth aware scanner so | inside {{templates}}
    // is never mistaken for a field boundary
    let genre = '';
    const genreStartIdx = content.search(/\|\s*genre\s*=/i);
    if (genreStartIdx !== -1) {
      const afterEq = content.indexOf('=', genreStartIdx) + 1;
      let depth = 0, ci = afterEq, fieldEnd = content.length;
      while (ci < content.length) {
        if (content[ci] === '{' && content[ci + 1] === '{') { depth++; ci += 2; continue; }
        if (content[ci] === '}' && content[ci + 1] === '}') { depth--; ci += 2; continue; }
        if (content[ci] === '\n' && depth === 0 && /[ \t]*\|/.test(content.slice(ci + 1))) { fieldEnd = ci; break; }
        ci++;
      }
      let raw = content.slice(afterEq, fieldEnd);

      // Pull first value from {{Film genre|drama|romance|...}}
      const fgm = raw.match(/\{\{[Ff]ilm[\s_][Gg]enre\|([^}]+)\}\}/);
      if (fgm) {
        const first = fgm[1].split('|')[0].trim();
        if (first) genre = first.charAt(0).toUpperCase() + first.slice(1);
      }

      if (!genre) {
        raw = raw.replace(/\{\{(?:plain\s*list|unbulleted\s*list|flat\s*list)\s*\|/gi, '\n');
        raw = raw.replace(/\{\{[^}]*\}\}/g, '');
        raw = raw.replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1');
        raw = raw.replace(/\}\}/g, '');
        raw = raw.replace(/<!--.*?-->/gs, '');
        const parts = raw.split(/[\n|,/]/)
          .map(s => s.replace(/^\s*[*#•]\s*/, '').trim())
          .filter(s => s.length > 1 && s.length < 50 && !s.startsWith('{'));
        if (parts.length > 0) genre = parts[0];
      }
    }

    return { year, genre };
  } catch (e) { return {}; }
}

// ── OMDb (IMDB data) — fetch by exact title ──
async function fetchOmdbByTitle(title, year) {
  try {
    const yearParam = year ? `&y=${year}` : '';
    const url  = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}${yearParam}&type=movie&apikey=${OMDB_KEY}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.Response === 'True') {
      return {
        title: data.Title,
        year:  data.Year  ? data.Year.slice(0, 4)          : '',
        genre: data.Genre ? data.Genre.split(',')[0].trim() : ''
      };
    }
    return null;
  } catch (e) { return null; }
}

// ── OMDb search — used when Wikipedia returns no results ──
async function fetchOmdbSearch(query) {
  try {
    const url  = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${OMDB_KEY}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.Response === 'True' && data.Search) {
      return data.Search.slice(0, 6).map(m => ({
        title: m.Title,
        year:  m.Year ? m.Year.slice(0, 4) : '',
        genre: ''
      }));
    }
    return [];
  } catch (e) { return []; }
}

// ══════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════
loadData();

document.getElementById('login-pass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('login-user').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-pass').focus();
});