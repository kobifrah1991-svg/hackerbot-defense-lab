/* Room 6 — Phishing triage (defense awareness) */
window.Room6 = {
  render(container, onComplete) {
    const mails = [
      { id: 1, from: 'security@bank-leumi-verify.co', subj: 'החשבון שלך ננעל! אמת תוך שעה', body: 'לחץ כאן לאימות פרטי כרטיס האשראי שלך לפני חסימה סופית.', correct: 'phish', why: 'דומיין מתחזה, דחיפות מלאכותית ובקשת פרטי כרטיס — פישינג קלאסי.' },
      { id: 2, from: 'hr@ofek-tech.co.il', subj: 'תזכורת: הרצאת בטיחות ביום חמישי', body: 'מצורף לוח זמנים. אין צורך בפעולה מלבד הגעה.', correct: 'legit', why: 'דומיין פנימי תקין, אין קישור או בקשה רגישה.' },
      { id: 3, from: 'ceo@ofek-tech.co', subj: 'דחוף ודיסקרטי — העברה בנקאית', body: 'אני בפגישה, תעביר 48,000 ₪ לספק החדש ואל תספר לאף אחד.', correct: 'report', why: 'התחזות למנכ״ל (BEC) בדומיין דומה — מדווחים ל־SOC ומאמתים בטלפון.' },
      { id: 4, from: 'no-reply@microsoft-365-support.help', subj: 'הסיסמה שלך פגה', body: 'היכנס לקישור כדי לשמור על אותה סיסמה.', correct: 'phish', why: 'דומיין לא רשמי ו"שמירה על אותה סיסמה" — פיתיון לגניבת פרטי התחברות.' },
      { id: 5, from: 'it@ofek-tech.co.il', subj: 'חלון תחזוקה מתוכנן הלילה', body: 'השירותים יושבתו 23:00–01:00. פרטים בפורטל הפנימי.', correct: 'legit', why: 'הודעה אינפורמטיבית ממקור פנימי, בלי בקשת פרטים.' }
    ];
    const picks = {};
    container.innerHTML = `
      <div class="sim-panel"><h2>📥 תיבת דואר — חשודים</h2>
        <div class="mail-list">${mails.map(m => `
          <div class="mail-card" id="m${m.id}">
            <div class="mail-from">מאת: <code>${m.from}</code></div>
            <div class="mail-subj">${m.subj}</div>
            <div class="mail-body">${m.body}</div>
            <div class="alert-actions">
              <button class="btn btn-ghost btn-sm" data-c="legit">✅ לגיטימי</button>
              <button class="btn btn-ghost btn-sm" data-c="phish">🎣 פישינג</button>
              <button class="btn btn-ghost btn-sm" data-c="report">🚨 דווח ל־SOC</button>
            </div><div class="alert-feedback"></div></div>`).join('')}
        </div></div>
      <div style="text-align:center;margin:1.5rem 0"><button class="btn btn-primary" id="sub6" disabled>הגישו</button></div>
      <div class="recap-box" id="recap6"></div>`;
    mails.forEach(m => {
      const card = container.querySelector('#m' + m.id);
      card.querySelectorAll('button').forEach(b => b.onclick = () => {
        if (picks[m.id]) return;
        picks[m.id] = b.dataset.c;
        const ok = b.dataset.c === m.correct;
        card.classList.add(ok ? 'ok' : 'bad');
        card.querySelector('.alert-feedback').innerHTML = (ok ? '✓ ' : '✗ ') + m.why;
        card.querySelector('.alert-feedback').classList.add('visible');
        container.querySelector('#sub6').disabled = Object.keys(picks).length < mails.length;
      });
    });
    container.querySelector('#sub6').onclick = e => {
      e.target.disabled = true;
      const c = mails.filter(m => picks[m.id] === m.correct).length;
      const score = Math.round(c / mails.length * 100);
      const r = container.querySelector('#recap6'); r.classList.add('visible');
      r.innerHTML = `<div class="score-display"><div class="score-circle">${score}</div><div>${c}/${mails.length} נכונים</div></div>
        <h3>✨ מה למדת</h3><ul><li>בדקו דומיין שולח תו־אחר־תו.</li><li>דחיפות + סודיות + כסף = דגל אדום.</li><li>בספק — מדווחים ומאמתים בערוץ אחר.</li></ul><div class="cta-row" id="cta6"></div>`;
      onComplete(score);
    };
  }
};
