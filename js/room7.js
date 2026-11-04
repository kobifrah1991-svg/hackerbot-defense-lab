/* Room 7 — Least privilege (RBAC assignment) */
window.Room7 = {
  render(container, onComplete) {
    const perms = ['קריאת CRM', 'עריכת CRM', 'שכר עובדים', 'ניהול שרתים', 'Admin דומיין'];
    const users = [
      { n: 'נועה — נציגת מכירות', need: [0, 1] },
      { n: 'אבי — חשב שכר', need: [2] },
      { n: 'דנה — מהנדסת תשתיות', need: [3] },
      { n: 'יוסי — מתמחה שיווק', need: [0] }
    ];
    // start: everyone has everything (the bad state)
    const grant = users.map(() => perms.map(() => true));
    container.innerHTML = `
      <div class="sim-panel"><h2>🗝️ מטריצת הרשאות</h2>
      <p class="panel-hint">כרגע לכולם יש הכל. לחצו על תא כדי להסיר/להעניק — השאירו רק מה שהתפקיד צריך.</p>
      <div class="perm-matrix" style="--cols:${perms.length}">
        <div></div>${perms.map(p => `<div class="pm-h">${p}</div>`).join('')}
        ${users.map((u, i) => `<div class="pm-u">${u.n}</div>${perms.map((p, j) => `<button class="pm-cell on" data-i="${i}" data-j="${j}">✓</button>`).join('')}`).join('')}
      </div>
      <div class="risk-meter"><span>רמת סיכון:</span><div class="strength-bar"><div class="strength-fill" id="risk7"></div></div><b id="riskTxt"></b></div>
      </div>
      <div style="text-align:center;margin:1.5rem 0"><button class="btn btn-primary" id="sub7">הגישו לביקורת</button></div>
      <div class="recap-box" id="recap7"></div>`;
    const upd = () => {
      let extra = 0; grant.forEach((row, i) => row.forEach((g, j) => { if (g && !users[i].need.includes(j)) extra++; }));
      const pct = Math.round(extra / 16 * 100);
      const f = container.querySelector('#risk7'); f.style.width = Math.max(4, pct) + '%';
      f.style.background = pct > 50 ? 'var(--neon-red)' : pct > 15 ? 'var(--neon-yellow)' : 'var(--neon)';
      container.querySelector('#riskTxt').textContent = pct + '%';
    };
    container.querySelectorAll('.pm-cell').forEach(c => c.onclick = () => {
      const i = +c.dataset.i, j = +c.dataset.j; grant[i][j] = !grant[i][j];
      c.classList.toggle('on', grant[i][j]); c.textContent = grant[i][j] ? '✓' : '—'; upd();
    });
    upd();
    container.querySelector('#sub7').onclick = e => {
      e.target.disabled = true;
      let right = 0; grant.forEach((row, i) => row.forEach((g, j) => { if (g === users[i].need.includes(j)) right++; }));
      const score = Math.round(right / 20 * 100);
      const r = container.querySelector('#recap7'); r.classList.add('visible');
      r.innerHTML = `<div class="score-display"><div class="score-circle">${score}</div><div>${right}/20 תאים נכונים</div></div>
        <h3>✨ מה למדת</h3><ul><li>Least privilege: רק מה שהתפקיד דורש.</li><li>Admin דומיין — אף אחד מהעובדים כאן לא צריך.</li><li>מתמחים מקבלים קריאה בלבד.</li></ul><div class="cta-row" id="cta7"></div>`;
      onComplete(score);
    };
  }
};
