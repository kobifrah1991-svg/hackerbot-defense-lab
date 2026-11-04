/* Room 10 — Windows Server Admin (simulated): AD, DNS, GPO, VM manager — defense-only */
window.Room10 = {
  render(container, onComplete) {
    const S = {
      users: [
        { n: 'dana.k', g: ['Domain Users', 'IT'], last: 'היום', on: true },
        { n: 'old.contractor', g: ['Domain Users'], last: 'לפני 210 ימים', on: true, stale: true },
        { n: 'svc-backup', g: ['Domain Users', 'Domain Admins'], last: 'היום', on: true, overpriv: true },
        { n: 'yossi.m', g: ['Domain Users', 'Marketing'], last: 'אתמול', on: true },
        { n: 'admin.it', g: ['Domain Admins'], last: 'היום', on: true }
      ],
      dns: [
        { n: 'www', t: 'A', v: '10.0.1.10' }, { n: 'mail', t: 'MX', v: 'mail.ofek.local' },
        { n: 'update-ofek', t: 'A', v: '45.133.1.20', bad: true }, { n: 'dc01', t: 'A', v: '10.0.0.5' }
      ],
      dnsSecure: false,
      gpo: { minLen: 7, lockout: 0, auditLogon: false, auditAcct: false, usb: false, screen: 0, smb1: true },
      vms: [
        { n: 'DC01', os: '🪟 Windows Server 2022', on: true, net: 'LAN', cp: false },
        { n: 'WEB01', os: '🐧 Ubuntu 24.04', on: true, net: 'DMZ', cp: false },
        { n: 'WS-SALES12', os: '🪟 Windows 11', on: true, net: 'LAN', cp: false, infected: true }
      ]
    };
    let tab = 'ad';
    container.innerHTML = `
      <div class="srv-window" dir="ltr">
        <div class="srv-title"><span>🖥️ Server Manager — DC01.ofek.local (סימולציה)</span><span>— ▢ ✕</span></div>
        <div class="srv-body"><nav class="srv-nav">
          <button data-t="ad">👥 AD Users & Computers</button><button data-t="dns">🌐 DNS Manager</button>
          <button data-t="gpo">📜 Group Policy</button><button data-t="vm">🧊 Hyper‑V Manager</button></nav>
          <div class="srv-main" id="srvMain" dir="rtl"></div></div></div>
      <div class="sim-panel"><h2>🎯 ביקורת אבטחה — משימות</h2><ul class="task-list" id="t10"></ul>
        <div style="text-align:center;margin-top:1rem"><button class="btn btn-primary" id="sub10">הגישו ביקורת</button></div></div>
      <div class="recap-box" id="recap10"></div>`;
    const M = container.querySelector('#srvMain');
    const checks = () => [
      ['AD: השביתו חשבון לא פעיל (old.contractor)', !S.users[1].on],
      ['AD: הוציאו את svc-backup מ־Domain Admins', !S.users[2].g.includes('Domain Admins')],
      ['DNS: מחקו רשומה חשודה שמפנה ל־IP חיצוני', !S.dns.some(d => d.bad)],
      ['DNS: הפעילו Secure dynamic updates', S.dnsSecure],
      ['GPO: אורך סיסמה ≥ 14', S.gpo.minLen >= 14],
      ['GPO: נעילת חשבון אחרי 3–10 ניסיונות', S.gpo.lockout >= 3 && S.gpo.lockout <= 10],
      ['GPO: Audit לכניסות ולניהול חשבונות', S.gpo.auditLogon && S.gpo.auditAcct],
      ['GPO: נעילה — חסימת USB, נעילת מסך ≤15 דק׳, SMBv1 כבוי', S.gpo.usb && S.gpo.screen > 0 && S.gpo.screen <= 15 && !S.gpo.smb1],
      ['VM: צרו Checkpoint ל־WS-SALES12 (שימור ראיות) ואז בודדו אותו מהרשת', S.vms[2].cp && S.vms[2].net === 'Isolated']
    ];
    const tasks = () => container.querySelector('#t10').innerHTML = checks().map(([d, ok]) => `<li class="${ok ? 'done' : ''}">${ok ? '✅' : '⬜'} ${d}</li>`).join('');
    function draw() {
      container.querySelectorAll('.srv-nav button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
      if (tab === 'ad') M.innerHTML = `<h3>👥 Users — ofek.local</h3><table class="srv-tbl"><tr><th>משתמש</th><th>קבוצות</th><th>כניסה אחרונה</th><th>מצב</th><th>פעולות</th></tr>
        ${S.users.map((u, i) => `<tr class="${u.on ? '' : 'off'}"><td>${u.n}</td><td>${u.g.map(g => `<span class="grp ${g === 'Domain Admins' ? 'da' : ''}">${g}</span>`).join(' ')}</td><td>${u.last}</td><td>${u.on ? '🟢 פעיל' : '⚫ מושבת'}</td>
        <td><button class="btn btn-ghost btn-sm" data-dis="${i}">${u.on ? 'השבת' : 'הפעל'}</button>${u.g.includes('Domain Admins') ? `<button class="btn btn-ghost btn-sm" data-rmda="${i}">הסר מ־DA</button>` : ''}</td></tr>`).join('')}</table>
        <p class="panel-hint">💡 חשבונות לא פעילים וחשבונות שירות עם Domain Admin הם יעד מועדף — מגינים מצמצמים אותם.</p>`;
      if (tab === 'dns') M.innerHTML = `<h3>🌐 Forward Lookup Zone — ofek.local</h3><table class="srv-tbl"><tr><th>שם</th><th>סוג</th><th>ערך</th><th></th></tr>
        ${S.dns.map((d, i) => `<tr><td>${d.n}</td><td>${d.t}</td><td dir="ltr">${d.v}</td><td><button class="btn btn-ghost btn-sm" data-dd="${i}">מחק</button></td></tr>`).join('')}</table>
        <label class="nb-ctl"><input type="checkbox" id="dsec" ${S.dnsSecure ? 'checked' : ''}> Dynamic updates: Secure only</label>
        <p class="panel-hint">💡 רשומת DNS פנימית שמפנה לכתובת חיצונית לא מוכרת יכולה להפנות עובדים לשרת זדוני.</p>`;
      if (tab === 'gpo') { const g = S.gpo; M.innerHTML = `<h3>📜 Default Domain Policy</h3>
        <div class="gpo-grid">
        <div class="gpo-sec"><h4>🔑 Password Policy</h4><label>Minimum password length <input type="number" min="0" max="30" data-g="minLen" value="${g.minLen}"></label></div>
        <div class="gpo-sec"><h4>🔒 Account Lockout</h4><label>Lockout threshold (0 = never) <input type="number" min="0" max="50" data-g="lockout" value="${g.lockout}"></label></div>
        <div class="gpo-sec"><h4>📋 Audit Policy</h4><label><input type="checkbox" data-g="auditLogon" ${g.auditLogon ? 'checked' : ''}> Audit logon events (Success/Failure)</label><label><input type="checkbox" data-g="auditAcct" ${g.auditAcct ? 'checked' : ''}> Audit account management</label></div>
        <div class="gpo-sec"><h4>🧱 Lockdown</h4><label><input type="checkbox" data-g="usb" ${g.usb ? 'checked' : ''}> Deny removable storage (USB)</label>
          <label>Screen lock timeout (min, 0=off) <input type="number" min="0" max="120" data-g="screen" value="${g.screen}"></label>
          <label><input type="checkbox" data-g="smb1" ${g.smb1 ? 'checked' : ''}> SMBv1 enabled</label></div></div>
        <p class="panel-hint">💡 GPO מאפשר לאכוף הגדרות הגנה על כל מחשבי הדומיין בבת אחת.</p>`; }
      if (tab === 'vm') M.innerHTML = `<h3>🧊 Virtual Machines (סימולציה)</h3><div class="vm-grid">${S.vms.map((v, i) => `
        <div class="vm-card ${v.on ? 'on' : ''} ${v.infected ? 'inf' : ''}"><div class="vm-screen">${v.on ? (v.os.startsWith('🐧') ? 'ubuntu login: _' : '🪟 Ctrl+Alt+Del') : '⏻ Off'}</div>
        <b>${v.n}</b><small>${v.os}</small><small>רשת: <b>${v.net}</b> ${v.cp ? '· 📸 Checkpoint' : ''}</small>${v.infected ? '<small class="t-warn">⚠ EDR: התראה פעילה</small>' : ''}
        <div class="vm-act"><button class="btn btn-ghost btn-sm" data-pw="${i}">${v.on ? '⏹ Stop' : '▶ Start'}</button><button class="btn btn-ghost btn-sm" data-cp="${i}">📸 Checkpoint</button>
        <select data-net="${i}">${['LAN', 'DMZ', 'Isolated'].map(n => `<option ${n === v.net ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>`).join('')}</div>
        <p class="panel-hint">💡 בתגובה לאירוע: קודם שומרים ראיות (Checkpoint), ואז מבודדים — לא מוחקים.</p>`;
      M.querySelectorAll('[data-dis]').forEach(b => b.onclick = () => { const u = S.users[b.dataset.dis]; u.on = !u.on; draw(); });
      M.querySelectorAll('[data-rmda]').forEach(b => b.onclick = () => { const u = S.users[b.dataset.rmda]; u.g = u.g.filter(x => x !== 'Domain Admins'); if (!u.g.length) u.g.push('Domain Users'); draw(); });
      M.querySelectorAll('[data-dd]').forEach(b => b.onclick = () => { S.dns.splice(+b.dataset.dd, 1); draw(); });
      const ds = M.querySelector('#dsec'); if (ds) ds.onchange = () => { S.dnsSecure = ds.checked; tasks(); };
      M.querySelectorAll('[data-g]').forEach(i => i.onchange = () => { S.gpo[i.dataset.g] = i.type === 'checkbox' ? i.checked : +i.value; tasks(); });
      M.querySelectorAll('[data-pw]').forEach(b => b.onclick = () => { const v = S.vms[b.dataset.pw]; v.on = !v.on; draw(); });
      M.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => { S.vms[b.dataset.cp].cp = true; draw(); });
      M.querySelectorAll('[data-net]').forEach(s => s.onchange = () => { S.vms[s.dataset.net].net = s.value; draw(); });
      tasks();
    }
    container.querySelectorAll('.srv-nav button').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
    container.querySelector('#sub10').onclick = e => {
      e.target.disabled = true; const c = checks(), ok = c.filter(x => x[1]).length, score = Math.round(ok / c.length * 100);
      const r = container.querySelector('#recap10'); r.classList.add('visible');
      r.innerHTML = `<div class="score-display"><div class="score-circle">${score}</div><div>${ok}/${c.length} ממצאים טופלו</div></div>
        <h3>✨ מה למדת</h3><ul><li>AD: חשבונות ישנים מושבתים, Domain Admins מצומצם למינימום.</li><li>DNS: רשומות חשודות מוסרות, עדכונים מאובטחים בלבד.</li><li>GPO: מדיניות סיסמאות, נעילה, Audit ו־Lockdown נאכפים מרכזית.</li><li>VM: Checkpoint לשימור ראיות ואז בידוד רשת.</li></ul><div class="cta-row" id="cta10"></div>`;
      onComplete(score);
    };
    draw();
  }
};
