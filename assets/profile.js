/* Profile charts: rating history on rank bands, activity heatmap, solved by difficulty. */
document.addEventListener('DOMContentLoaded', () => {
  const { rankOf, colorVar, MONTHS, pad } = CF;
  const NS = 'http://www.w3.org/2000/svg';
  const DAY = 864e5;
  const TODAY = Date.UTC(2026, 9, 9);
  const f = n => n.toLocaleString('en-US');
  const fmtDate = t => { const d = new Date(t); return `${MONTHS[d.getUTCMonth()]}/${pad(d.getUTCDate())}/${d.getUTCFullYear()}`; };
  const node = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const text = (parent, attrs, s) => { node('text', attrs, parent).textContent = s; };
  const signed = d => `<span class="delta ${d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : '−'}${Math.abs(d)}</span>`;

  // ---------- rating history ----------
  const RAW = [
    ['2020-09-12', 836], ['2020-09-20', 1103], ['2020-10-04', 1257], ['2020-10-18', 1311], ['2020-11-01', 1390], ['2020-11-22', 1422],
    ['2020-12-06', 1388], ['2020-12-20', 1469], ['2021-01-10', 1502], ['2021-01-24', 1455], ['2021-02-14', 1541], ['2021-03-07', 1597],
    ['2021-03-21', 1622], ['2021-04-11', 1580], ['2021-05-02', 1661], ['2021-05-30', 1704], ['2021-06-20', 1689], ['2021-07-18', 1752],
    ['2021-08-22', 1731], ['2021-09-26', 1798], ['2021-11-07', 1840], ['2021-12-12', 1812], ['2022-01-23', 1877], ['2022-02-20', 1902],
    ['2022-03-27', 1866], ['2022-04-24', 1931], ['2022-06-05', 1958], ['2022-07-17', 1921], ['2022-08-28', 1989], ['2022-10-09', 2014],
    ['2022-11-20', 1976], ['2022-12-18', 2033], ['2023-02-05', 2061], ['2023-03-19', 2018], ['2023-05-07', 2079], ['2023-06-25', 2047],
    ['2023-08-13', 2092], ['2023-10-01', 2067], ['2023-11-19', 2104], ['2023-12-31', 2088], ['2024-02-18', 2071], ['2024-04-07', 2116],
    ['2024-05-26', 2098], ['2024-07-14', 2139], ['2024-09-01', 2121], ['2024-10-20', 2162], ['2024-12-08', 2135], ['2025-01-26', 2178],
    ['2025-03-16', 2149], ['2025-05-04', 2190], ['2025-06-22', 2171], ['2025-08-10', 2203], ['2025-09-28', 2180], ['2025-11-16', 2196],
    ['2025-12-28', 2168], ['2026-02-08', 2213], ['2026-03-22', 2177], ['2026-05-03', 2192], ['2026-06-14', 2160], ['2026-07-26', 2154],
    ['2026-08-17', 2186, 'Codeforces Round 1115 (Div. 1 + Div. 2)', 288],
    ['2026-08-31', 2132, 'Codeforces Round 1118 (Div. 1)', 586],
    ['2026-09-12', 2159, 'Codeforces Round 1122 (Div. 1 + Div. 2)', 402],
    ['2026-09-24', 2141, 'Codeforces Global Round 33', 731],
    ['2026-10-04', 2187, 'Codeforces Round 1127 (Div. 1)', 214],
  ];
  const roundAt = t => Math.round(1000 + (t - Date.UTC(2025, 0, 22)) / (365 * DAY) * 75);
  const eduAt = t => Math.round(173 + (t - Date.UTC(2024, 11, 24)) / (365 * DAY) * 22);
  const hist = RAW.map(([d, r, name, rank], i) => {
    const t = Date.parse(d + 'T15:00:00Z');
    const prev = i ? RAW[i - 1][1] : 0;
    const delta = r - prev;
    if (!name) {
      name = prev < 1900
        ? (i % 3 === 1 ? `Educational Codeforces Round ${eduAt(t)} (Rated for Div. 2)` : `Codeforces Round ${roundAt(t)} (Div. 2)`)
        : (i % 4 === 0 ? `Codeforces Round ${roundAt(t)} (Div. 1 + Div. 2)` : `Codeforces Round ${roundAt(t)} (Div. 1)`);
      const base = i ? prev : 1000;
      rank = Math.max(12, Math.round(4200 * Math.exp(-(base - 1200) / 480) * Math.exp(-(i ? delta : 0) / 85)));
    }
    return { t, r, delta, name, rank };
  });

  const BANDS = [[-1e9, 1200, 'newbie'], [1200, 1400, 'pupil'], [1400, 1600, 'specialist'], [1600, 1900, 'expert'], [1900, 2100, 'cm'],
                 [2100, 2300, 'master'], [2300, 2400, 'im'], [2400, 2600, 'gm'], [2600, 3000, 'igm'], [3000, 1e9, 'lgm']];
  const EDGES = [1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000];

  let range = 'all';
  function drawRating() {
    const box = document.getElementById('rating');
    const tip = document.getElementById('rating-tip');
    box.querySelector('svg')?.remove();
    tip.classList.remove('on');

    const from = range === 'all' ? -Infinity : TODAY - range * 365 * DAY;
    const pts = hist.filter(p => p.t >= from);
    const W = box.clientWidth, H = W < 600 ? 240 : 330;
    const m = { l: 40, r: 52, t: 14, b: 26 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const lo = Math.min(...pts.map(p => p.r)), hi = Math.max(...pts.map(p => p.r));
    const yMin = Math.floor((lo - 120) / 100) * 100, yMax = Math.ceil((hi + 110) / 100) * 100;
    const t0 = pts[0].t - 24 * DAY, t1 = pts.at(-1).t + 24 * DAY;
    const x = t => m.l + (t - t0) / (t1 - t0) * iw;
    const y = v => m.t + (1 - (v - yMin) / (yMax - yMin)) * ih;

    const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', tabindex: 0,
      'aria-label': `Rating history, ${pts.length} contests, from ${pts[0].r} to ${pts.at(-1).r}` });
    box.prepend(svg);

    for (const [a, b, cls] of BANDS) {
      const top = Math.min(b, yMax), bot = Math.max(a, yMin);
      if (top > bot) node('rect', { x: m.l, y: y(top), width: iw, height: y(bot) - y(top), style: `fill:var(--band-${cls});fill-opacity:var(--band-alpha)` }, svg);
    }

    // time ticks: years, or every second month for short ranges
    const ticks = [];
    if (range === 1) {
      for (let k = 0; k < 14; k++) {
        const d = new Date(Date.UTC(2025, 9 + k, 1));
        if (d.getUTCMonth() % 2 === 0) ticks.push([d.getTime(), d.getUTCMonth() === 0 ? String(d.getUTCFullYear()) : MONTHS[d.getUTCMonth()]]);
      }
    } else {
      for (let yr = 2020; yr <= 2026; yr++) ticks.push([Date.UTC(yr, 0, 1), String(yr)]);
    }
    for (const [t, label] of ticks) {
      const tx = x(t);
      if (tx <= m.l + 4 || tx >= m.l + iw - 4) continue;
      node('line', { x1: tx, x2: tx, y1: m.t, y2: m.t + ih, style: 'stroke:var(--bg);stroke-opacity:.75' }, svg);
      text(svg, { x: tx, y: H - 7, 'text-anchor': 'middle', class: 'ax' }, label);
    }
    for (const v of EDGES) if (v > yMin && v < yMax) text(svg, { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'ax' }, v);
    node('line', { x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih, style: 'stroke:var(--line-strong)' }, svg);

    const cross = node('line', { y1: m.t, y2: m.t + ih, style: 'stroke:var(--ink-3)', opacity: 0 }, svg);
    node('path', {
      d: pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.r).toFixed(1)}`).join(''),
      fill: 'none', style: 'stroke:var(--ink)', 'stroke-width': 1.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    }, svg);
    const last = pts.at(-1);
    const best = pts.reduce((a, b) => (b.r > a.r ? b : a));
    const dots = pts.map((p, i) => node('circle', { 'data-i': i, cx: x(p.t), cy: y(p.r), r: 3, style: 'fill:var(--bg);stroke:var(--ink)', 'stroke-width': 1.5 }, svg));
    const end = dots.at(-1);
    end.setAttribute('r', 5);
    end.setAttribute('style', `fill:${colorVar(rankOf(last.r)[1])};stroke:var(--bg)`);
    end.setAttribute('stroke-width', 2);
    text(svg, { x: x(last.t) + 10, y: y(last.r) + 4, class: 'ax-strong' }, last.r);
    if (best !== last) text(svg, { x: x(best.t), y: y(best.r) - 11, 'text-anchor': 'middle', class: 'ax' }, `max ${best.r}`);

    const hit = node('rect', { x: m.l - 6, y: 0, width: iw + 12, height: H, fill: 'transparent' }, svg);
    let cur = -1;
    const reset = i => {
      if (i < 0 || i === pts.length - 1) return;
      dots[i].setAttribute('r', 3);
      dots[i].setAttribute('style', 'fill:var(--bg);stroke:var(--ink)');
      dots[i].setAttribute('stroke-width', 1.5);
    };
    const show = i => {
      reset(cur);
      cur = i;
      const p = pts[i], cx = x(p.t), cy = y(p.r);
      cross.setAttribute('x1', cx); cross.setAttribute('x2', cx); cross.setAttribute('opacity', 1);
      dots[i].setAttribute('r', 5);
      dots[i].setAttribute('style', `fill:${colorVar(rankOf(p.r)[1])};stroke:var(--bg)`);
      dots[i].setAttribute('stroke-width', 2);
      tip.innerHTML = `<div><span class="tv">${p.r}</span> ${signed(p.delta)}</div><div class="tl"></div><div class="tm">Rank ${f(p.rank)} · ${fmtDate(p.t)}</div>`;
      tip.querySelector('.tl').textContent = p.name;
      const left = Math.min(Math.max(cx, 118), W - 118);
      tip.style.left = left + 'px';
      if (cy < 110) { tip.style.top = cy + 16 + 'px'; tip.style.transform = 'translate(-50%, 0)'; }
      else { tip.style.top = cy - 14 + 'px'; tip.style.transform = 'translate(-50%, -100%)'; }
      tip.classList.add('on');
    };
    const hide = () => { reset(cur); cur = -1; cross.setAttribute('opacity', 0); tip.classList.remove('on'); };
    hit.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect();
      const px = (e.clientX - r.left) * (W / r.width);
      let bi = 0, bd = Infinity;
      pts.forEach((p, i) => { const d = Math.abs(x(p.t) - px); if (d < bd) { bd = d; bi = i; } });
      if (bi !== cur) show(bi);
    });
    hit.addEventListener('pointerleave', hide);
    svg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      const next = cur < 0 ? pts.length - 1 : Math.min(pts.length - 1, Math.max(0, cur + (e.key === 'ArrowRight' ? 1 : -1)));
      show(next);
    });
    svg.addEventListener('blur', hide);
  }

  document.getElementById('range').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    document.querySelectorAll('#range button').forEach(x => x.classList.toggle('on', x === b));
    range = b.dataset.r === 'all' ? 'all' : +b.dataset.r;
    drawRating();
  });

  // ---------- activity ----------
  let seed = 1130;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const dow = t => (new Date(t).getUTCDay() + 6) % 7;
  const lastDay = TODAY + (6 - dow(TODAY)) * DAY;
  const firstDay = lastDay - (53 * 7 - 1) * DAY;
  const contestDays = new Set(hist.map(p => Math.floor(p.t / DAY)));
  const days = [];
  for (let t = firstDay; t <= lastDay; t += DAY) {
    let v = 0;
    const future = t > TODAY;
    if (!future) {
      if (rand() < (dow(t) >= 5 ? 0.5 : 0.34)) v = 1 + Math.floor(rand() ** 3 * 5);
      if (contestDays.has(Math.floor(t / DAY))) v = Math.max(v, 3 + Math.floor(rand() * 3));
      if (t >= Date.UTC(2026, 6, 6) && t <= Date.UTC(2026, 6, 19)) v = 0;           // two weeks off in July
      if (t >= Date.UTC(2026, 8, 30)) v = Math.max(v, 1 + Math.floor(rand() * 3)); // current streak
    }
    days.push({ t, v, future });
  }
  const past = days.filter(d => !d.future && d.t > TODAY - 365 * DAY);
  const month = past.filter(d => d.t > TODAY - 30 * DAY);
  const sum = a => a.reduce((s, d) => s + d.v, 0);
  const longest = a => { let best = 0, run = 0; for (const d of a) { run = d.v ? run + 1 : 0; best = Math.max(best, run); } return best; };
  let current = 0;
  for (let i = past.length - 1; i >= 0 && past[i].v; i--) current++;
  const stats = [
    [sum(past), 'problems in the last year'],
    [sum(month), 'problems in the last month'],
    [past.filter(d => d.v).length, 'active days in the last year'],
    [`${Math.max(23, longest(past))} days`, 'longest streak'],
    [`${longest(past)} days`, 'longest streak this year'],
    [`${current} days`, 'current streak'],
  ];
  document.getElementById('streaks').innerHTML = stats.map(([v, l]) => `<div><b>${typeof v === 'number' ? f(v) : v}</b>${l}</div>`).join('');

  function drawHeat() {
    const box = document.getElementById('heat');
    const tip = document.getElementById('heat-tip');
    const cell = 12, gap = 3, P = cell + gap, L = 30, T = 18;
    const W = L + 53 * P - gap, H = T + 7 * P - gap;
    const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Problems solved per day, last 12 months' });
    box.prepend(svg);
    ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((d, i) => { if (d) text(svg, { x: 0, y: T + i * P + 10, class: 'ax' }, d); });
    let shownMonth = -1;
    days.forEach((d, i) => {
      const w = Math.floor(i / 7), r = i % 7;
      const mo = new Date(d.t).getUTCMonth();
      if (r === 0 && mo !== shownMonth) {
        if (w > 0 && w < 52) text(svg, { x: L + w * P, y: 11, class: 'ax' }, MONTHS[mo]);
        shownMonth = mo;
      }
      if (d.future) return;
      const lvl = d.v === 0 ? 0 : d.v === 1 ? 1 : d.v === 2 ? 2 : d.v <= 4 ? 3 : 4;
      node('rect', { x: L + w * P, y: T + r * P, width: cell, height: cell, rx: 2, style: `fill:var(--heat-${lvl})`, 'data-i': i }, svg);
    });
    svg.addEventListener('pointermove', e => {
      const i = e.target.dataset?.i;
      if (i == null) { tip.classList.remove('on'); return; }
      const d = days[+i];
      const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dow(d.t)];
      tip.innerHTML = `<span class="tv">${d.v}</span> <span class="tl">${d.v === 1 ? 'problem' : 'problems'}</span><div class="tm">${wd}, ${fmtDate(d.t)}</div>`;
      const rx = +e.target.getAttribute('x'), ry = +e.target.getAttribute('y');
      tip.style.left = Math.min(Math.max(rx + 6, 110), W - 110) + 'px';
      tip.style.top = ry - 6 + 'px';
      tip.style.transform = 'translate(-50%, -100%)';
      tip.style.minWidth = '0';
      tip.classList.add('on');
    });
    svg.addEventListener('pointerleave', () => tip.classList.remove('on'));
  }

  // ---------- solved by difficulty ----------
  const DIFF = [[800, 64], [900, 38], [1000, 61], [1100, 57], [1200, 88], [1300, 80], [1400, 86], [1500, 92], [1600, 95], [1700, 88], [1800, 84],
                [1900, 71], [2000, 66], [2100, 52], [2200, 43], [2300, 31], [2400, 22], [2500, 14], [2600, 9], [2700, 5], [2800, 3], [2900, 1], [3000, 1]];
  document.getElementById('rated-count').textContent = `${f(DIFF.reduce((s, [, n]) => s + n, 0))} rated problems`;

  function drawDiff() {
    const box = document.getElementById('diff');
    const tip = document.getElementById('diff-tip');
    box.querySelector('svg')?.remove();
    const W = box.clientWidth, H = 236;
    const m = { l: 30, r: 2, t: 20, b: 24 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const slot = iw / DIFF.length, bw = Math.min(18, slot - 4);
    const yMax = 100;
    const y = v => m.t + ih - v / yMax * ih;
    const svg = node('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': 'Solved problems by difficulty' });
    box.prepend(svg);
    for (const v of [0, 25, 50, 75, 100]) {
      node('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), style: `stroke:var(${v ? '--line' : '--line-strong'})` }, svg);
      text(svg, { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'ax' }, v);
    }
    const peak = DIFF.reduce((a, b) => (b[1] > a[1] ? b : a));
    DIFF.forEach(([d, n], i) => {
      const x0 = m.l + i * slot + (slot - bw) / 2, top = y(n), base = y(0), r = Math.min(4, (base - top) / 2, bw / 2);
      node('path', {
        d: `M${x0},${base}V${top + r}Q${x0},${top} ${x0 + r},${top}H${x0 + bw - r}Q${x0 + bw},${top} ${x0 + bw},${top + r}V${base}Z`,
        style: `fill:${colorVar(rankOf(d)[1])}`, class: 'dbar',
      }, svg);
      if (d % 400 === 0) text(svg, { x: m.l + i * slot + slot / 2, y: H - 6, 'text-anchor': 'middle', class: 'ax' }, d);
      if (d === peak[0]) text(svg, { x: m.l + i * slot + slot / 2, y: top - 6, 'text-anchor': 'middle', class: 'ax-strong' }, n);
      const hit = node('rect', { x: m.l + i * slot, y: m.t, width: slot, height: ih, fill: 'transparent' }, svg);
      hit.addEventListener('pointerenter', () => {
        tip.innerHTML = `<span class="tv">${n}</span> <span class="tl">solved</span><div class="tm">difficulty ${d}</div>`;
        tip.style.left = Math.min(Math.max(m.l + i * slot + slot / 2, 70), W - 70) + 'px';
        tip.style.top = top - 10 + 'px';
        tip.style.transform = 'translate(-50%, -100%)';
        tip.style.minWidth = '0';
        tip.classList.add('on');
      });
      hit.addEventListener('pointerleave', () => tip.classList.remove('on'));
    });
  }

  // ---------- recent contests ----------
  document.getElementById('recent').innerHTML = hist.slice(-5).reverse().map(p => `
    <tr>
      <td><a class="ink" href="standings.html">${p.name}</a><div class="muted" style="font-size:12px">${fmtDate(p.t)}</div></td>
      <td class="num">${f(p.rank)}</td>
      <td class="num">${signed(p.delta)}</td>
      <td class="num"><b class="r-${rankOf(p.r)[1]}">${p.r}</b></td>
    </tr>`).join('');

  drawRating();
  drawHeat();
  drawDiff();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { drawRating(); drawDiff(); }, 120); });
});
