/* Room 9 — Network Builder (Packet-Tracer-style, educational subset, defense-only) */
window.Room9 = {
  render(container, onComplete) {
    const TYPES = {
      cloud: ['☁️', 'Internet'], router: ['📶', 'Router'], firewall: ['🧱', 'Firewall'], switch: ['🔀', 'Switch'],
      hub: ['🕸️', 'Hub'], ap: ['📡', 'Access Point'], pc: ['🖥️', 'PC'], laptop: ['💻', 'Laptop'], server: ['🗄️', 'Server']
    };
    let nodes = [{ id: 'n0', type: 'cloud', x: 40, y: 150, ctl: {} }], links = [], seq = 1, mode = 'move', pending = null, sel = null;
    container.innerHTML = `
      <div class="sim-panel">
        <h2>🧩 בונה הרשת</h2>
        <p class="panel-hint">לחצו על רכיב בסרגל כדי להוסיף · גררו למיקום · מצב "כבל" = לחצו על שני רכיבים לחיבור · לחצו על רכיב כדי להגדיר בקרות הגנה.</p>
        <div class="nb-palette">${Object.entries(TYPES).filter(([k]) => k !== 'cloud').map(([k, v]) => `<button class="nb-tool" data-add="${k}">${v[0]}<small>${v[1]}</small></button>`).join('')}
          <span class="nb-sep"></span>
          <button class="chip on" data-mode="move">✋ הזזה</button><button class="chip" data-mode="cable">🔌 כבל</button><button class="chip" data-mode="del">🗑️ מחיקה</button>
          <button class="btn btn-secondary btn-sm" id="nbPkt">📨 שלח חבילה Internet→Server</button></div>
        <div class="nb-wrap"><div class="nb-canvas" id="nbc" dir="ltr"><svg id="nbsvg"></svg></div>
          <div class="nb-inspect" id="nbi"><p class="panel-hint">בחרו רכיב כדי לראות ולהגדיר בקרות.</p></div></div>
      </div>
      <div class="sim-panel"><h2>🎯 משימות התרחיש</h2><ul class="task-list" id="nbt"></ul>
        <div style="text-align:center;margin-top:1rem"><button class="btn btn-primary" id="sub9">הגישו תכנון</button></div></div>
      <div class="recap-box" id="recap9"></div>`;
    const C = container.querySelector('#nbc'), svg = container.querySelector('#nbsvg');
    const CTL = {
      firewall: [['deny', 'Default deny inbound'], ['allow443', 'Allow 443 → Server בלבד'], ['log', 'Logging מופעל']],
      ap: [['wpa3', 'WPA3 + סיסמה חזקה'], ['guest', 'רשת אורחים מופרדת']],
      server: [['patch', 'עדכונים מותקנים'], ['edr', 'EDR / אנטי-וירוס']],
      pc: [['edr', 'EDR / אנטי-וירוס'], ['nonadmin', 'משתמש ללא Admin']], laptop: [['edr', 'EDR'], ['disk', 'הצפנת דיסק']],
      switch: [['vlan', 'VLAN הפרדה'], ['portsec', 'Port Security']], router: [['nomgmt', 'ניהול חסום מבחוץ'], ['fw', 'קושחה עדכנית']],
      hub: [], cloud: []
    };
    const adj = id => links.filter(l => l.a === id || l.b === id).map(l => l.a === id ? l.b : l.a);
    const path = (from, to) => { const prev = { [from]: null }, q = [from]; while (q.length) { const c = q.shift(); if (c === to) break; adj(c).forEach(n => { if (!(n in prev)) { prev[n] = c; q.push(n); } }); } if (!(to in prev)) return null; const p = []; for (let c = to; c; c = prev[c]) p.unshift(c); return p; };
    const N = id => nodes.find(n => n.id === id);
    function draw() {
      C.querySelectorAll('.nb-node').forEach(e => e.remove());
      svg.innerHTML = links.map(l => { const a = N(l.a), b = N(l.b); return `<line x1="${a.x + 34}" y1="${a.y + 30}" x2="${b.x + 34}" y2="${b.y + 30}"/>`; }).join('');
      nodes.forEach(n => {
        const d = document.createElement('div'); d.className = 'nb-node' + (sel === n.id ? ' sel' : '') + (pending === n.id ? ' pend' : '');
        d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
        const on = Object.values(n.ctl).filter(Boolean).length;
        d.innerHTML = `<span>${TYPES[n.type][0]}</span><small>${TYPES[n.type][1]}</small>${on ? `<i>🛡${on}</i>` : ''}`;
        d.onpointerdown = e => down(e, n); C.appendChild(d);
      });
      tasks();
    }
    function down(e, n) {
      if (mode === 'del') { if (n.type === 'cloud') return; nodes = nodes.filter(x => x !== n); links = links.filter(l => l.a !== n.id && l.b !== n.id); sel = null; inspect(); return draw(); }
      if (mode === 'cable') { if (!pending) pending = n.id; else if (pending !== n.id) { if (!links.some(l => (l.a === pending && l.b === n.id) || (l.b === pending && l.a === n.id))) links.push({ a: pending, b: n.id }); pending = null; } return draw(); }
      sel = n.id; inspect(); const r = C.getBoundingClientRect(), ox = e.clientX - n.x, oy = e.clientY - n.y;
      const mv = ev => { n.x = Math.max(0, Math.min(r.width - 70, ev.clientX - ox)); n.y = Math.max(0, Math.min(r.height - 64, ev.clientY - oy)); draw(); };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv); addEventListener('pointerup', up); draw();
    }
    function inspect() {
      const box = container.querySelector('#nbi'), n = N(sel);
      if (!n) { box.innerHTML = '<p class="panel-hint">בחרו רכיב כדי לראות ולהגדיר בקרות.</p>'; return; }
      const info = { hub: '⚠ Hub משדר כל חבילה לכל הפורטים — כל מחשב יכול "לשמוע" תעבורה של אחרים. מגינים מחליפים ב־Switch.', cloud: 'האינטרנט — מקור לא מהימן. כל תעבורה ממנו צריכה לעבור סינון.' }[n.type] || '';
      box.innerHTML = `<h3>${TYPES[n.type][0]} ${TYPES[n.type][1]}</h3><p class="panel-hint">${info}</p>` + CTL[n.type].map(([k, l]) => `<label class="nb-ctl"><input type="checkbox" data-k="${k}" ${n.ctl[k] ? 'checked' : ''}> ${l}</label>`).join('');
      box.querySelectorAll('input').forEach(i => i.onchange = () => { n.ctl[i.dataset.k] = i.checked; draw(); });
    }
    container.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const id = 'n' + seq++; nodes.push({ id, type: b.dataset.add, x: 120 + (seq * 57) % 420, y: 40 + (seq * 83) % 240, ctl: {} }); sel = id; inspect(); draw(); });
    container.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { mode = b.dataset.mode; pending = null; container.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    const checks = () => {
      const srv = nodes.find(n => n.type === 'server'), fw = nodes.find(n => n.type === 'firewall');
      const p = srv && path('n0', srv.id), ends = nodes.filter(n => n.type === 'pc' || n.type === 'laptop');
      return [
        ['חברו Internet → Router → Firewall → Switch → Server', !!p && p.length >= 4],
        ['כל מסלול מהאינטרנט לשרת ולמחשבים עובר דרך Firewall', !!p && ends.length > 0 && [srv, ...ends].every(t => { const q = path('n0', t.id); return q && q.some(id => N(id).type === 'firewall'); })],
        ['ב־Firewall: Default deny + Allow 443 בלבד', !!fw && fw.ctl.deny && fw.ctl.allow443],
        ['הוסיפו Access Point עם WPA3', nodes.some(n => n.type === 'ap' && n.ctl.wpa3 && adj(n.id).length)],
        ['אין Hub ברשת (רק Switch)', !nodes.some(n => n.type === 'hub') && nodes.some(n => n.type === 'switch')],
        ['שרת מעודכן + EDR', !!srv && srv.ctl.patch && srv.ctl.edr]
      ];
    };
    const tasks = () => { container.querySelector('#nbt').innerHTML = checks().map(([d, ok]) => `<li class="${ok ? 'done' : ''}">${ok ? '✅' : '⬜'} ${d}</li>`).join(''); };
    container.querySelector('#nbPkt').onclick = async () => {
      const srv = nodes.find(n => n.type === 'server'); const p = srv && path('n0', srv.id);
      if (!p) return alert('אין מסלול מהאינטרנט לשרת — חברו כבלים.');
      const dot = document.createElement('div'); dot.className = 'nb-pkt'; C.appendChild(dot);
      for (const id of p) {
        const n = N(id); dot.style.left = n.x + 26 + 'px'; dot.style.top = n.y + 22 + 'px';
        await new Promise(r => setTimeout(r, 550));
        if (n.type === 'firewall' && n.ctl.deny && !n.ctl.allow443) { dot.classList.add('blocked'); dot.textContent = '⛔'; break; }
        if (n.type === 'firewall' && n.ctl.deny) { dot.classList.add('ok'); }
      }
      setTimeout(() => dot.remove(), 1400);
    };
    container.querySelector('#sub9').onclick = e => {
      e.target.disabled = true; const c = checks(), ok = c.filter(x => x[1]).length, score = Math.round(ok / c.length * 100);
      const r = container.querySelector('#recap9'); r.classList.add('visible');
      r.innerHTML = `<div class="score-display"><div class="score-circle">${score}</div><div>${ok}/${c.length} דרישות</div></div>
        <h3>✨ מה למדת</h3><ul><li>Firewall בין האינטרנט לרשת הפנימית עם Default deny.</li><li>Switch במקום Hub — מצמצם האזנה לתעבורה.</li><li>Wi‑Fi עם WPA3 ורשת אורחים מופרדת.</li><li>הגנה בשכבות: רשת + נקודות קצה + עדכונים.</li></ul><div class="cta-row" id="cta9"></div>`;
      onComplete(score);
    };
    draw();
  }
};
