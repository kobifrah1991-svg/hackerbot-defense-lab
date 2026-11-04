/* HackerBot Defense Lab — THM-style Hebrew app shell (hash routing) */
(function () {
  const R = { 'password-fortress': 'Room1', 'network-map': 'Room2', 'https-shield': 'Room3', 'alert-triage': 'Room4', 'threat-modeling': 'Room5', 'phishing-triage': 'Room6', 'least-privilege': 'Room7', 'terminal-lab': 'Room8', 'network-builder': 'Room9', 'windows-server': 'Room10' };
  const RANKS = ['מגן מתחיל', 'שומר סף', 'אנליסט ג׳וניור', 'צייד לוגים', 'אנליסט SOC', 'ארכיטקט הגנה', 'מגן עילית'];
  const $ = (s, r) => (r || document).querySelector(s);
  const rooms = () => window.ROOMS_META;
  const P = () => DefenseStorage.getProgress();
  const done = (p, id) => !!(p.rooms[id] && p.rooms[id].completed);
  const unlocked = id => DefenseStorage.isRoomUnlocked(id, rooms());
  const rank = lvl => RANKS[Math.min(RANKS.length - 1, lvl - 1)];

  function toast(msg) {
    let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800);
  }
  const ring = (pct, label, size = 96) => `<div class="ring" style="--p:${pct};--s:${size}px"><span>${label}</span></div>`;

  function show(view, nav) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === nav));
    window.scrollTo(0, 0);
  }
  function header() {
    const p = P();
    $('#hdrLevel').textContent = p.level; $('#hdrXp').textContent = p.xp;
    $('#hdrXpBar').style.width = p.xpPercent + '%'; $('#rankTitle').textContent = rank(p.level);
    $('#rankRing').style.setProperty('--p', p.xpPercent);
  }

  function card(r, p) {
    const u = unlocked(r.id), d = done(p, r.id), sc = p.rooms[r.id]?.score;
    return `<a class="thm-card diff-${r.difficulty} ${u ? '' : 'locked'} ${d ? 'completed' : ''}" href="#/room/${r.id}">
      <div class="thm-card-top"><span class="thm-icon">${r.icon}</span>${d ? '<span class="thm-check">✓</span>' : u ? '' : '<span class="thm-lock">🔒</span>'}</div>
      <h3>${LANG==='en'?r.titleEn:r.title}</h3><div class="thm-en">${LANG==='en'?r.title:r.titleEn}</div>
      <p>${r.desc}</p>
      <div class="thm-tags">${(r.tags || []).map(t => `<span>#${t}</span>`).join('')}</div>
      <div class="thm-foot"><span class="diff-badge ${r.difficulty}">${t(r.difficulty)}</span><span>⏱ ${r.time || 10} ${t('min')}</span><span class="room-xp">${r.xp} XP</span>${sc != null ? `<span>${LANG==="en"?"Score":"ציון"} ${sc}</span>` : ''}</div>
      <div class="thm-progress"><div style="width:${d ? 100 : sc ? sc : 0}%"></div></div></a>`;
  }

  function home() {
    const p = P(), all = rooms(), c = all.filter(r => done(p, r.id)).length, st = DefenseStorage.touchStreak();
    const next = all.find(r => unlocked(r.id) && !done(p, r.id));
    $('#view-home').innerHTML = `<div class="container">
      <section class="dash-hero"><div><div class="hero-badge">🛡️ הגנה בלבד · Defense-Only</div>
        <h1>${t('hello')}</h1><p class="lead">${t('lead')}</p>${t('contentNote') !== 'contentNote' && t('contentNote') ? `<p class="lead small">${t('contentNote')}</p>` : ''}
        ${next ? `<a class="btn btn-primary" href="#/room/${next.id}">${t('continue')} ${next.icon} ${next.title}</a>` : '<span class="lead">🏆 סיימת את כל החדרים!</span>'}</div>
        <div class="dash-rings">${ring(Math.round(c / all.length * 100), `${c}/${all.length}<small>${t('roomsWord')}</small>`, 120)}${ring(p.xpPercent, `${p.level}<small>${t('level')}</small>`, 120)}</div></section>
      <section class="stat-row">
        <div class="stat"><b>🔥 ${st.count || 1}</b><span>${t('streak')} (שיא ${st.best || 1})</span></div>
        <div class="stat"><b>${p.xp}</b><span>${t('totalXp')}</span></div>
        <div class="stat"><b>${rank(p.level)}</b><span>${t('rank')}</span></div>
        <div class="stat"><b>${Math.round(all.map(r => p.rooms[r.id]?.score).filter(x => x != null).reduce((a, b, _, arr) => a + b / arr.length, 0))}</b><span>${t('avg')}</span></div></section>
      <h2 class="sec-title">${t('yourPaths')}</h2><div class="path-grid">${window.PATHS_META.map(pt => pathCard(pt, p)).join('')}</div>
      <h2 class="sec-title">${t('recommended')}</h2><div class="thm-grid">${all.filter(r => unlocked(r.id) && !done(p, r.id)).slice(0, 3).map(r => card(r, p)).join('') || '<p class="lead">אין חדרים פתוחים שלא הושלמו 🎉</p>'}</div></div>`;
    show('home', 'home');
  }
  function pathCard(pt, p) {
    const rs = rooms().filter(r => r.path === pt.id), c = rs.filter(r => done(p, r.id)).length, pct = rs.length ? Math.round(c / rs.length * 100) : 0;
    return `<a class="path-card" href="#/paths/${pt.id}"><div class="path-ic">${pt.icon}</div><div class="path-body"><h3>${pt.title}</h3><p>${pt.desc}</p>
      <div class="thm-progress"><div style="width:${pct}%"></div></div><small>${c}/${rs.length} חדרים · ${pct}%</small></div></a>`;
  }
  function paths(sel) {
    const p = P();
    $('#view-paths').innerHTML = `<div class="container"><h1 class="page-title">${t('pathsTitle')}</h1><p class="lead">מסלולים מסודרים מהקל לקשה — כמו קורס.</p>
      ${window.PATHS_META.filter(pt => !sel || pt.id === sel).map(pt => `<section class="path-section"><div class="path-head">${pathCard(pt, p)}</div>
        <div class="thm-grid">${rooms().filter(r => r.path === pt.id).map(r => card(r, p)).join('')}</div></section>`).join('')}
      ${sel ? '<a class="btn btn-ghost" href="#/paths">← כל המסלולים</a>' : ''}</div>`;
    show('paths', 'paths');
  }
  let filt = { q: '', d: 'all' };
  function roomsView() {
    const p = P();
    $('#view-rooms').innerHTML = `<div class="container"><h1 class="page-title">${t('allRooms')}</h1>
      <div class="filters"><input id="fq" placeholder="${t('search')}" value="${filt.q}">
      ${['all', 'easy', 'medium', 'hard'].map(d => `<button class="chip ${filt.d === d ? 'on' : ''}" data-d="${d}">${t(d)}</button>`).join('')}</div>
      <div class="thm-grid" id="rgrid"></div></div>`;
    const draw = () => $('#rgrid').innerHTML = rooms().filter(r => (filt.d === 'all' || r.difficulty === filt.d) && (!filt.q || (r.title + r.titleEn + (r.tags || []).join(' ')).toLowerCase().includes(filt.q.toLowerCase()))).map(r => card(r, p)).join('');
    $('#fq').oninput = e => { filt.q = e.target.value; draw(); };
    document.querySelectorAll('.chip').forEach(b => b.onclick = () => { filt.d = b.dataset.d; roomsView(); });
    draw(); show('rooms', 'rooms');
  }
  function profile() {
    const p = P(), st = DefenseStorage.touchStreak(), all = rooms();
    const badges = [
      ['🔐', 'מבצר', done(p, 'password-fortress')], ['🌐', 'שומר רשת', done(p, 'network-map') && done(p, 'https-shield')],
      ['📡', 'אנליסט SOC', done(p, 'alert-triage') && done(p, 'phishing-triage')], ['💻', 'אמן מסוף', done(p, 'terminal-lab')], ['🧩', 'מתכנן רשת', done(p, 'network-builder')], ['🏢', 'מנהל דומיין', done(p, 'windows-server')],
      ['🔥', 'רצף 3 ימים', (st.best || 0) >= 3], ['🏆', 'השלמה מלאה', all.every(r => done(p, r.id))]];
    $('#view-profile').innerHTML = `<div class="container"><h1 class="page-title">${t('myProfile')}</h1>
      <section class="dash-hero"><div>${ring(p.xpPercent, `${p.level}<small>${t('level')}</small>`, 130)}</div><div><h2>${rank(p.level)}</h2><p class="lead">${p.xp} XP · ${p.xpIntoLevel}/${p.xpNeeded} לרמה הבאה · 🔥 ${st.count} ימים</p>
      <p class="lead small">${window.CloudSync && window.CloudSync.user ? '☁️ מסונכרן לענן' : '💾 ההתקדמות נשמרת בדפדפן הזה'}</p></div></section>
      <h2 class="sec-title">${t('badges')}</h2><div class="badge-grid">${badges.map(b => `<div class="badge ${b[2] ? 'on' : ''}"><span>${b[0]}</span>${b[1]}</div>`).join('')}</div>
      <h2 class="sec-title">${t('scores')}</h2><div class="score-table">${all.map(r => `<div><span>${r.icon} ${r.title}</span><div class="thm-progress"><div style="width:${p.rooms[r.id]?.score || 0}%"></div></div><b>${p.rooms[r.id]?.score ?? '—'}</b></div>`).join('')}</div>
      <div class="reset-wrap"><button class="btn btn-ghost btn-sm" id="btnReset">${t('reset')}</button></div></div>`;
    $('#btnReset').onclick = () => { if (confirm('לאפס את כל ההתקדמות?')) { DefenseStorage.resetProgress(); toast('ההתקדמות אופסה'); profile(); header(); } };
    show('profile', 'profile');
  }

  let tasks;
  function side(room) {
    const items = [[t('t1'), tasks[0]], [t('t2'), tasks[1]], [t('t3'), tasks[2]], [t('t4'), tasks[3]]];
    const n = items.filter(i => i[1]).length;
    $('#roomSide').innerHTML = `<div class="side-card">${ring(n * 25, `${n}/4<small>${t('tasks')}</small>`, 104)}
      <ol class="task-check">${items.map((it, i) => `<li class="${it[1] ? 'done' : ''}"><span>${it[1] ? '✓' : i + 1}</span>${it[0]}</li>`).join('')}</ol>
      <div class="side-meta"><span class="diff-badge ${room.difficulty}">${t(room.difficulty)}</span><span>⏱ ${room.time} ${t('min')}</span><span class="room-xp">${room.xp} XP</span></div>
      <h4>${t('learn')}</h4><ul class="learn-list">${room.learnings.map(l => `<li>${l}</li>`).join('')}</ul></div>`;
  }
  function openRoom(id) {
    const room = rooms().find(r => r.id === id);
    if (!room) return home();
    if (!unlocked(id)) { toast('🔒 החדר נעול — השלימו קודם: ' + room.requires.map(q => rooms().find(r => r.id === q).title).join(', ')); return roomsView(); }
    const p = P(); tasks = [false, false, done(p, id), false];
    const path = window.PATHS_META.find(x => x.id === room.path);
    $('#roomHero').innerHTML = `<div class="crumbs"><a href="#/paths/${room.path}">${path ? path.icon + ' ' + path.title : ''}</a> › חדר ${room.num}</div>
      <div class="room-hero-row"><div class="thm-icon big">${room.icon}</div><div><h1>${room.title}</h1><div class="thm-en">${room.titleEn}</div>
      <div class="thm-tags">${room.tags.map(t => `<span>#${t}</span>`).join('')}</div></div></div>`;
    $('#roomStory').innerHTML = `<div class="story-label">${t('briefing')}</div><p>${room.story}</p><button class="btn btn-primary" id="startRoom">${t('start')}</button>`;
    $('#roomMount').innerHTML = ''; $('#roomMount').hidden = true; side(room); show('room', 'rooms');
    $('#startRoom').onclick = () => {
      tasks[0] = true; side(room); $('#startRoom').remove(); $('#roomMount').hidden = false;
      window[R[id]].render($('#roomMount'), score => complete(room, score));
      $('#roomMount').scrollIntoView({ behavior: 'smooth' });
    };
  }
  function complete(room, score) {
    const was = done(P(), room.id), st = DefenseStorage.saveRoomScore(room.id, score, room.xp);
    header(); tasks[1] = true; tasks[2] = score >= 50; tasks[3] = true; side(room);
    toast(!was && score >= 50 ? `🎉 +${room.xp} XP · רמה ${st.level}` : score >= 50 ? `✓ ציון נשמר: ${score}` : `ציון ${score} — עוברים מ־50, נסו שוב`);
    const cta = document.querySelector('#cta' + room.num); if (!cta) return;
    const next = rooms().find(r => unlocked(r.id) && !done(P(), r.id));
    cta.innerHTML = `<a class="btn btn-secondary" href="#/">← לוח בקרה</a>${next ? `<a class="btn btn-primary" href="#/room/${next.id}">הבא: ${next.title} →</a>` : ''}${score < 50 ? '<button class="btn btn-ghost" id="retry">↻ נסו שוב</button>' : ''}`;
    const rt = $('#retry'); if (rt) rt.onclick = () => openRoom(room.id);
  }

  function route() {
    header();
    document.querySelectorAll('[data-nav]').forEach(a => a.textContent = t(a.dataset.nav));
    $('.site-footer').textContent = t('footer');
    const h = location.hash.replace(/^#\/?/, '').split('/');
    if (h[0] === 'paths') paths(h[1]); else if (h[0] === 'rooms') roomsView(); else if (h[0] === 'profile') profile();
    else if (h[0] === 'room') openRoom(h[1]); else home();
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('progress-synced', route);
  const boot = () => window.I18N_READY.then(route);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
