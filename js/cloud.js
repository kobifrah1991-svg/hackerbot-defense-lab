/* Optional Firebase Auth + Firestore sync. LocalStorage stays the source when offline. */
(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const ui = () => document.getElementById('authBox');
  window.CloudSync = { enabled: false, push() {}, user: null };
  if (!cfg.apiKey) { document.addEventListener('DOMContentLoaded', () => { const b = ui(); if (b) b.innerHTML = '<span class="auth-off" title="Firebase לא הוגדר — התקדמות נשמרת בדפדפן">💾 שמירה מקומית</span>'; }); return; }
  const V = '10.12.2', load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const base = `https://www.gstatic.com/firebasejs/${V}/firebase-`;
  load(base + 'app-compat.js').then(() => Promise.all([load(base + 'auth-compat.js'), load(base + 'firestore-compat.js')])).then(init).catch(e => console.warn('Firebase load failed', e));
  function init() {
    if (!window.firebase || !firebase.auth) return;
    firebase.initializeApp(cfg);
    const auth = firebase.auth(), db = firebase.firestore();
    let t;
    window.CloudSync = {
      enabled: true, user: null,
      push(state) { if (!this.user) return; clearTimeout(t); t = setTimeout(() => db.collection('progress').doc(this.user.uid).set(state).catch(console.warn), 600); }
    };
    auth.onAuthStateChanged(async user => {
      window.CloudSync.user = user; render(user);
      if (!user) return;
      try {
        const snap = await db.collection('progress').doc(user.uid).get();
        const local = DefenseStorage.loadState();
        const remote = snap.exists ? snap.data() : null;
        if (remote && (remote.xp || 0) > (local.xp || 0)) { DefenseStorage.replaceState(remote); window.dispatchEvent(new Event('progress-synced')); }
        else window.CloudSync.push(local);
      } catch (e) { console.warn(e); }
    });
    function render(user) {
      const b = ui(); if (!b) return;
      if (user) {
        b.innerHTML = `<span class="auth-user">☁️ ${user.displayName || user.email}</span><button class="btn btn-ghost btn-sm" id="aOut">יציאה</button>`;
        b.querySelector('#aOut').onclick = () => auth.signOut();
      } else {
        b.innerHTML = `<button class="btn btn-secondary btn-sm" id="aG">התחברות עם Google</button><button class="btn btn-ghost btn-sm" id="aE">אימייל</button>`;
        b.querySelector('#aG').onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(e => alert(e.message));
        b.querySelector('#aE').onclick = async () => {
          const email = prompt('אימייל:'); if (!email) return; const pw = prompt('סיסמה (6+ תווים):'); if (!pw) return;
          try { await auth.signInWithEmailAndPassword(email, pw); } catch { try { await auth.createUserWithEmailAndPassword(email, pw); } catch (e) { alert(e.message); } }
        };
      }
    }
  }
})();
