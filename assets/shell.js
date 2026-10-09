/* Shared chrome for the concept pages: theme, header, footer, handle colors, clocks. */
(() => {
  const root = document.documentElement;
  const qs = new URLSearchParams(location.search);

  // theme: ?theme=dark|light > saved choice > system
  let theme = qs.get('theme');
  if (!theme) { try { theme = localStorage.getItem('cf-theme'); } catch { /* storage blocked */ } }
  if (theme !== 'dark' && theme !== 'light') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;

  // ?still freezes the clocks (for screenshots)
  const still = qs.has('still');

  // fictional people; ratings drive the colors
  const USERS = {
    obsidian: 3812, kaleido: 3694, mod998244353: 3640, noriko: 3591, eulertour: 3528,
    petrichor: 3477, lattice: 3410, frostbyte: 3389, shiomi: 3356, graphite: 3302,
    hikari_n: 2954, soyuz: 2903, wavelet: 2871, monotone: 2840, centroid: 2788,
    aurora_b: 2731, tetra: 2690, vertex_c: 2655, orbit: 2612,
    jupiterian: 2577, bitsetter: 2541, kotobuki: 2518, ternarysearch: 2484, nanami: 2463, pskov_r: 2431,
    kruskal_fan: 2378, yoshida_k: 2341,
    dmitri_v: 2264, caramel_tea: 2230, lexmin: 2187, ajay_r: 2156,
    segtree_beats: 2047, hexagon: 1988, umbrella: 1931,
    neon_tetra: 1854, m_ivanov: 1777, dfs_tree: 1702, fenwick: 1655,
    ricecake: 1580, two_pointers: 1512, quietstorm: 1455,
    lemonade: 1388, first_ac: 1290,
    hello_cf: 1033, tryhard_01: 912,
  };

  const RANKS = [
    [3000, 'lgm', 'Legendary Grandmaster'],
    [2600, 'igm', 'International Grandmaster'],
    [2400, 'gm', 'Grandmaster'],
    [2300, 'im', 'International Master'],
    [2100, 'master', 'Master'],
    [1900, 'cm', 'Candidate Master'],
    [1600, 'expert', 'Expert'],
    [1400, 'specialist', 'Specialist'],
    [1200, 'pupil', 'Pupil'],
    [-Infinity, 'newbie', 'Newbie'],
  ];
  const rankOf = r => RANKS.find(([min]) => r >= min);
  const colorVar = cls => `var(--r-${{ im: 'master', igm: 'gm', lgm: 'gm' }[cls] || cls})`;

  const svg = (body, cls = 'i') => `<svg class="${cls}" viewBox="0 0 16 16" aria-hidden="true">${body}</svg>`;
  const ic = {
    search: svg('<circle cx="7" cy="7" r="4.6"/><path d="m10.4 10.4 3.6 3.6"/>'),
    bell: svg('<path d="M4 11V7.2a4 4 0 0 1 8 0V11l1.2 1.6H2.8z"/><path d="M6.6 14.4a1.5 1.5 0 0 0 2.8 0"/>'),
    moon: svg('<path d="M13.4 9.9A5.7 5.7 0 0 1 6.1 2.6a5.7 5.7 0 1 0 7.3 7.3z"/>', 'i i-moon'),
    sun: svg('<circle cx="8" cy="8" r="2.9"/><path d="M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1"/>', 'i i-sun'),
    chev: svg('<path d="m4 6 4 4 4-4"/>'),
    copy: svg('<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.6V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.6"/>'),
    user: svg('<circle cx="8" cy="5.4" r="2.7"/><path d="M2.6 14c.6-2.7 2.7-4.2 5.4-4.2s4.8 1.5 5.4 4.2"/>'),
    comment: svg('<path d="M2.5 3.2h11v7.6H7.2L4.2 13.3v-2.5H2.5z"/>'),
    check: svg('<path d="m3 8.6 3.1 3L13 4.6"/>'),
    cross: svg('<path d="m4.2 4.2 7.6 7.6M11.8 4.2l-7.6 7.6"/>'),
    up: svg('<path d="m4 9.8 4-4 4 4"/>'),
    down: svg('<path d="m4 6.2 4 4 4-4"/>'),
    star: svg('<path d="m8 2.1 1.8 3.7 4 .6-2.9 2.8.7 4L8 11.3l-3.6 1.9.7-4-2.9-2.8 4-.6z"/>'),
    clock: svg('<circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.4 1.5"/>'),
    file: svg('<path d="M4 1.6h5.1L12.5 5v9.4H4z"/><path d="M9 1.6V5h3.5"/>'),
    play: svg('<path d="M5.2 3.6v8.8l6.8-4.4z"/>'),
    shuffle: svg('<path d="M1.8 4.6h2.6c3.2 0 3.9 6.8 7 6.8h2.8M12.4 9.4l1.8 2-1.8 2M1.8 11.4h2.6c1.1 0 1.9-.8 2.5-1.9M14.2 4.6h-2.8c-1.1 0-1.9.8-2.5 1.9M12.4 2.6l1.8 2-1.8 2"/>'),
    refresh: svg('<path d="M13.2 2.8v3.6H9.6"/><path d="M13 6.3A5.4 5.4 0 1 0 13.4 10"/>'),
    print: svg('<path d="M4.5 5.5V1.8h7v3.7"/><rect x="1.8" y="5.5" width="12.4" height="6" rx="1.2"/><path d="M4.5 9.5h7v4.7h-7z"/>'),
    burger: svg('<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>'),
    cal: svg('<rect x="2" y="3" width="12" height="11" rx="1.6"/><path d="M2 6.6h12M5.4 1.6v2.8M10.6 1.6v2.8"/>'),
  };

  // identicon tinted with the rank color: a stand-in for users without a photo
  function identicon(handle) {
    let h = 0x811c9dc5;
    for (const ch of handle) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
    const [, cls] = rankOf(USERS[handle] ?? 0);
    const col = colorVar(cls);
    let cells = '';
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 3; x++) {
        if ((h >>> (y * 3 + x)) & 1) {
          cells += `<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`;
          if (x < 2) cells += `<rect x="${4 - x}" y="${y}" width="1.02" height="1.02"/>`;
        }
      }
    }
    return `<svg viewBox="-.75 -.75 6.5 6.5" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="-.75" y="-.75" width="6.5" height="6.5" style="fill:color-mix(in srgb, ${col} 13%, var(--bg))"/>
      <g style="fill:${col}">${cells}</g></svg>`;
  }

  function decorate(scope = document) {
    scope.querySelectorAll('.u:not([data-done])').forEach(a => {
      const handle = a.dataset.h || a.textContent.trim();
      a.dataset.done = '1';
      const r = USERS[handle];
      if (r == null) return;
      const [, cls, title] = rankOf(r);
      a.classList.add('r-' + cls);
      a.title = `${title} ${handle}`;
      if (cls === 'lgm') a.innerHTML = `<span class="lgm1">${handle[0]}</span>${handle.slice(1)}`;
      if (a.tagName === 'A' && !a.getAttribute('href')) a.href = 'profile.html';
    });
    scope.querySelectorAll('[data-ava]').forEach(el => { el.innerHTML = identicon(el.dataset.ava); });
  }

  const pad = n => String(n).padStart(2, '0');
  const hms = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // the moment every page shows: Oct 9 2026, 18:44:47 Moscow time, Round 1130 is 69 minutes in
  const NOW = Date.UTC(2026, 9, 9, 15, 44, 47);
  const cfDate = ms => {
    const d = new Date(ms + 3 * 3600e3);
    return `${MONTHS[d.getUTCMonth()]}/${pad(d.getUTCDate())}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  };

  function startClocks() {
    const t0 = Date.now();
    const tick = () => {
      const dt = still ? 0 : Math.floor((Date.now() - t0) / 1000);
      document.querySelectorAll('[data-left]').forEach(el => { el.textContent = hms(Math.max(0, +el.dataset.left - dt)); });
      document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = cfDate(NOW + dt * 1000); });
    };
    tick();
    if (!still) setInterval(tick, 1000);
  }

  const MENU = [
    ['home', 'Home', 'index.html'], ['top', 'Top', '#'], ['catalog', 'Catalog', '#'],
    ['contests', 'Contests', 'contests.html'], ['gym', 'Gym', '#'], ['problemset', 'Problemset', 'problemset.html'],
    ['groups', 'Groups', '#'], ['rating', 'Rating', '#'], ['edu', 'Edu', '#'], ['api', 'API', '#'],
    ['calendar', 'Calendar', '#'], ['help', 'Help', '#'],
  ];

  function header(active) {
    const items = MENU.map(([id, label, href]) => `<a href="${href}"${id === active ? ' class="on" aria-current="page"' : ''}>${label.toUpperCase()}</a>`).join('');
    const live = document.body.dataset.live === 'off' ? '' : `
      <div class="menu-live"><span class="dot"></span><span>Codeforces Round 1130 is running</span>
        <b data-left="4813">01:20:13</b><a href="problem.html">Enter »</a></div>`;
    return `
    <header class="hdr">
      <div class="wrap hdr-row">
        <a class="logo" href="index.html" aria-label="Codeforces"><span class="logo-bars"><i></i><i></i><i></i></span><span class="logo-word">CODEFORCES</span></a>
        <div class="search-wrap">
          <label class="search">${ic.search}<input type="search" placeholder="Search problems, contests, people" aria-label="Search" autocomplete="off"><kbd>Ctrl</kbd><kbd>K</kbd></label>
          <div class="sx" role="listbox" hidden></div>
        </div>
        <div class="hdr-tools">
          <div class="lang"><a class="on" href="#">EN</a><a href="#">RU</a></div>
          <button class="icon-btn only-m" aria-label="Search">${ic.search}</button>
          <button class="icon-btn" data-theme-toggle aria-label="Switch theme">${ic.moon}${ic.sun}</button>
          <a class="icon-btn" href="#" aria-label="2 notifications">${ic.bell}<span class="badge">2</span></a>
          <a class="acct" href="profile.html"><span class="ava" data-ava="lexmin"></span><span class="u" data-h="lexmin">lexmin</span>${ic.chev}</a>
        </div>
      </div>
      <nav class="menu" aria-label="Main"><div class="wrap menu-row"><div class="menu-list">${items}</div>${live}</div></nav>
      ${live ? `<div class="live-m"><div class="wrap"><span class="dot"></span><span>Round 1130 is running</span><b data-left="4813">01:20:13</b><a href="problem.html">Enter »</a></div></div>` : ""}
    </header>`;
  }

  const footer = () => `
    <footer class="ftr"><div class="wrap ftr-row">
      <div>
        <div class="line">Codeforces (c) Copyright 2010–2026 Mike Mirzayanov</div>
        <div class="line">The only programming contests Web 2.0 platform</div>
        <div class="line">Unofficial redesign concept by <a href="https://suvmer.dev">suvmer.dev</a>, not affiliated with Codeforces</div>
      </div>
      <div class="ftr-r">
        <div class="line">Server time: <span class="tnum" data-clock></span> (UTC+3)</div>
        <div class="line">General sponsor: Telegram</div>
        <div class="line"><a href="#">Privacy Policy</a> · <a href="#">Terms and Conditions</a> · <a href="#">API</a></div>
      </div>
    </div></footer>`;

  // tiny C++ highlighter, prettify colors
  const KW = new Set('int long short for while do if else return auto using namespace const constexpr void bool true false char double float struct class template typename break continue nullptr unsigned signed static inline'.split(' '));
  const TY = new Set('vector set map unordered_map multiset string pair array deque queue priority_queue ios cin cout cerr std size_t'.split(' '));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function hl(src) {
    return src.replace(/\n$/, '').split('\n').map(line => {
      const pp = line.match(/^(\s*)(#\s*\w+)(.*)$/);
      if (pp) return `${pp[1]}<span class="tk-pp">${esc(pp[2])}</span><span class="tk-str">${esc(pp[3])}</span>`;
      let out = '';
      const re = /(\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d[\d']*(?:\.\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/g;
      let m;
      while ((m = re.exec(line))) {
        if (m[1]) out += `<span class="tk-com">${esc(m[1])}</span>`;
        else if (m[2]) out += `<span class="tk-str">${esc(m[2])}</span>`;
        else if (m[3]) out += `<span class="tk-lit">${m[3]}</span>`;
        else if (m[4]) out += KW.has(m[4]) ? `<span class="tk-kwd">${m[4]}</span>` : TY.has(m[4]) ? `<span class="tk-typ">${m[4]}</span>` : m[4];
        else out += esc(m[0]);
      }
      return out;
    });
  }

  // ---------- search (Ctrl+K) ----------
  const SX_PROBLEMS = [
    ['2306C', 'Paper Planes', 'Round 1130 · running'],
    ['2299E', 'Tree Coloring Queries', 'dfs and similar, trees', 2300],
    ['2281F', 'Tree Diameter After Cuts', 'dp, trees', 2500],
    ['2262C', 'Binary Tree Walk', 'implementation, trees', 1300],
    ['2240D', 'Segment Tree on a Tree', 'data structures, trees', 2400],
    ['2304E', 'Gift Wrapping', 'binary search, greedy, sortings', 2100],
    ['2304D', 'Palindromic Paths Again', 'dp, strings', 1900],
    ['2304C', 'Nearest Bus Stop', 'implementation, math', 1500],
    ['2303D', 'Robot on a Grid', 'dfs and similar, graphs', 1800],
    ['2302D', 'Fence Painting', 'binary search, data structures', 2000],
    ['2301E', 'Lamps on a Ring', 'bitmasks, dp', 2400],
    ['2300F', 'Shortest Detour', 'graphs, shortest paths', 2400],
    ['2298D', 'Equalize by Halving', 'brute force, greedy, math', 1300],
  ];
  const SX_TAGS = [['trees', 2103], ['dp', 3412], ['greedy', 4520], ['graphs', 1870], ['data structures', 2944], ['binary search', 1611],
    ['strings', 1290], ['math', 4112], ['number theory', 1140], ['bitmasks', 820], ['dfs and similar', 1365], ['shortest paths', 410],
    ['two pointers', 905], ['constructive algorithms', 2380], ['implementation', 3870], ['brute force', 2210], ['sortings', 1560],
    ['combinatorics', 905], ['games', 380], ['interactive', 340], ['divide and conquer', 260]];
  const SX_BLOGS = [
    ['Segment tree beats, explained with pictures', 'segtree_beats', '3 days ago'],
    ['Tree DP with rerooting: a template that never breaks', 'centroid', '2 weeks ago'],
    ['Iterating over submasks: why the total is O(3ⁿ)', 'dfs_tree', '5 hours ago'],
    ['Educational Codeforces Round 196 — Editorial', 'ternarysearch', '2 days ago'],
    ['Codeforces Round 1130 (Div. 1 + Div. 2)', 'kaleido', '3 days ago'],
    ['How do I stop failing system tests on B?', 'ricecake', '1 hour ago'],
    ['ICPC 2027 Northern Eurasia Finals: list of teams', 'hexagon', 'yesterday'],
  ];
  const SX_CONTESTS = [
    ['Codeforces Round 1130 (Div. 1 + Div. 2)', 'running now'], ['Educational Codeforces Round 197 (Rated for Div. 2)', 'Oct/12'],
    ['Codeforces Round 1131 (Div. 2)', 'Oct/15'], ['Codeforces Global Round 34', 'Oct/25'], ['Codeforces Round 1129 (Div. 2)', 'Oct/06'],
    ['Educational Codeforces Round 196 (Rated for Div. 2)', 'Oct/02'], ['Codeforces Global Round 33', 'Sep/24'],
  ];

  const markText = (s, q) => {
    const i = q ? s.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(s);
    return `${esc(s.slice(0, i))}<mark>${esc(s.slice(i, i + q.length))}</mark>${esc(s.slice(i + q.length))}`;
  };
  const handleHTML = (h, q) => {
    const [, cls] = rankOf(USERS[h] ?? 0);
    const i = q ? h.toLowerCase().indexOf(q) : -1;
    let out = '';
    for (let k = 0; k < h.length; k++) {
      let c = esc(h[k]);
      if (cls === 'lgm' && k === 0) c = `<span class="lgm1">${c}</span>`;
      out += i >= 0 && k >= i && k < i + q.length ? `<mark>${c}</mark>` : c;
    }
    return `<span class="u r-${cls}">${out.replace(/<\/mark><mark>/g, '')}</span>`;
  };
  const sxItem = (href, body) => `<a class="sx-item" href="${href}" role="option">${body}</a>`;
  const sxAva = h => `<span class="ava">${identicon(h)}</span>`;

  function sxGroups(raw) {
    const q = raw.trim().toLowerCase();
    if (!q) {
      return [['Recent', [
        sxItem('problem.html', '<span class="pid">2306C</span><span class="nm">Paper Planes</span><span class="meta">Round 1130 · running</span>'),
        sxItem('standings.html', '<span class="nm">Standings</span><span class="meta">Codeforces Round 1130 (Div. 1 + Div. 2)</span>'),
        sxItem('profile.html', `${sxAva('kaleido')}${handleHTML('kaleido', '')}<span class="meta">Legendary Grandmaster · ${USERS.kaleido}</span>`),
      ]]];
    }
    const groups = [];
    const P = SX_PROBLEMS.filter(([id, name]) => id.toLowerCase().includes(q) || name.toLowerCase().includes(q)).slice(0, 4);
    if (P.length) groups.push(['Problems', P.map(([id, name, meta, d]) => sxItem('problem.html',
      `<span class="pid">${markText(id, q)}</span><span class="nm">${markText(name, q)}</span><span class="meta">${esc(meta)}</span>${d ? `<span class="dv" style="color:${colorVar(rankOf(d)[1])}">${d}</span>` : ''}`))]);
    const T = SX_TAGS.filter(([t]) => t.includes(q)).slice(0, 2);
    if (T.length) groups.push(['Tags', T.map(([t, n]) => sxItem('problemset.html', `<span class="tag"><span>${markText(t, q)}</span></span><span class="meta">${n.toLocaleString('en-US')} problems</span>`))]);
    const U = Object.keys(USERS).filter(h => h.toLowerCase().includes(q)).sort((a, b) => USERS[b] - USERS[a]).slice(0, 4);
    if (U.length) groups.push(['People', U.map(h => sxItem('profile.html', `${sxAva(h)}${handleHTML(h, q)}<span class="meta">${rankOf(USERS[h])[2]} · ${USERS[h]}</span>`))]);
    const B = SX_BLOGS.filter(([title]) => title.toLowerCase().includes(q)).slice(0, 3);
    if (B.length) groups.push(['Blog', B.map(([title, by, when]) => sxItem('index.html', `<span class="nm">${markText(title, q)}</span><span class="meta">${handleHTML(by, '')} · ${when}</span>`))]);
    const C = SX_CONTESTS.filter(([n]) => n.toLowerCase().includes(q)).slice(0, 3);
    if (C.length) groups.push(['Contests', C.map(([n, when]) => sxItem('contests.html', `<span class="nm">${markText(n, q)}</span><span class="meta">${when}</span>`))]);
    return groups;
  }

  function initSearch() {
    const wrap = document.querySelector('.search-wrap');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    const box = wrap.querySelector('.sx');
    let dim = null;
    const items = () => [...box.querySelectorAll('.sx-item')];
    const select = i => items().forEach((el, k) => el.classList.toggle('on', k === i));
    const render = () => {
      const groups = sxGroups(input.value);
      const q = input.value.trim();
      box.innerHTML = (groups.length
        ? groups.map(([title, list]) => `<div class="sx-g"><div class="sx-gh">${title}</div>${list.join('')}</div>`).join('')
        : `<div class="sx-empty">Nothing found for “${esc(q)}”. Try a problem ID like 2304D or a handle.</div>`)
        + '<div class="sx-foot"><span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>Enter</kbd> to open</span><span><kbd>Esc</kbd> to close</span></div>';
      select(0);
    };
    const open = () => {
      if (wrap.classList.contains('open')) return;
      wrap.classList.add('open');
      dim = document.createElement('div');
      dim.className = 'sx-dim';
      dim.addEventListener('mousedown', close);
      document.body.appendChild(dim);
      box.hidden = false;
      render();
    };
    const close = () => {
      wrap.classList.remove('open');
      box.hidden = true;
      dim?.remove();
      dim = null;
    };
    input.addEventListener('focus', open);
    input.addEventListener('input', render);
    input.addEventListener('blur', () => setTimeout(() => { if (!wrap.contains(document.activeElement)) close(); }, 0));
    box.addEventListener('mousedown', e => e.preventDefault());
    input.addEventListener('keydown', e => {
      const list = items();
      const cur = list.findIndex(el => el.classList.contains('on'));
      if (e.key === 'Escape') { input.blur(); close(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (list.length) select((cur + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length);
      } else if (e.key === 'Enter' && cur >= 0) {
        e.preventDefault();
        location.href = list[cur].getAttribute('href');
      }
    });
  }

  window.CF = { USERS, rankOf, colorVar, ic, identicon, decorate, hl, hms, cfDate, NOW, MONTHS, pad, still };

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    const top = document.getElementById('top');
    if (top) top.outerHTML = header(page);
    const bottom = document.getElementById('bottom');
    if (bottom) bottom.outerHTML = footer();

    document.querySelectorAll('[data-icon]').forEach(el => { el.insertAdjacentHTML('afterbegin', ic[el.dataset.icon] || ''); });
    document.querySelectorAll('[data-code]').forEach(el => {
      const lines = hl(el.textContent);
      el.innerHTML = lines.join('\n');
    });

    decorate();
    startClocks();
    initSearch();

    document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('cf-theme', next); } catch { /* storage blocked */ }
      document.dispatchEvent(new CustomEvent('cf:theme'));
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      const src = document.getElementById(btn.dataset.copy);
      const text = [...src.querySelectorAll('span')].map(s => s.textContent).join('\n') + '\n';
      navigator.clipboard?.writeText(text).catch(() => {});
      const label = btn.querySelector('b');
      if (label) { label.textContent = 'Copied'; setTimeout(() => { label.textContent = 'Copy'; }, 1200); }
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector('.search input')?.focus();
      }
    });
  });
})();
