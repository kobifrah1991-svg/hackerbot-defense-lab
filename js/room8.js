/* Room 8 — Defender Terminal: simulated Linux + PowerShell, defensive read-only commands only */
window.Room8 = {
  render(container, onComplete) {
    const BLOCK = /(nc\s+-e|netcat|ncat|msfconsole|msfvenom|metasploit|sqlmap|hydra|john|hashcat|mimikatz|aircrack|reverse|bind\s*shell|\/dev\/tcp|exploit|payload|chmod\s+(\+s|4[0-7]{3})|rm\s+-rf|mkfs|dd\s+if=|:\(\)\{|wget\s+http|curl\s+[^|]*\|\s*(ba)?sh|Invoke-Expression|IEX\b|DownloadString|-enc(odedcommand)?\b|Set-MpPreference|bypass|passwd\s|shadow|useradd|net\s+user\s+\S+\s+\S+\s*\/add|Add-LocalGroupMember|nmap\s+.*(-sS|--script)|crack|keylog|brute)/i;
    const LINUX = {
      'help': 'פקודות זמינות: whoami, id, hostname, pwd, ls, ls -l, ls -l /etc/passwd, cat notes.txt, ps aux, who, last, uptime, df -h, ss -tulpn, grep "Failed" /var/log/auth.log, tail /var/log/auth.log, sudo -l, clear',
      'whoami': 'analyst',
      'id': 'uid=1001(analyst) gid=1001(analyst) groups=1001(analyst),4(adm)',
      'hostname': 'ofek-web01',
      'pwd': '/home/analyst',
      'ls': 'notes.txt  reports/  incident-2026-11.md',
      'ls -l': '-rw-r--r-- 1 analyst analyst  412 Nov  4 08:12 notes.txt\ndrwxr-x--- 2 analyst analyst 4096 Nov  4 08:10 reports\n-rw------- 1 analyst analyst 1290 Nov  4 09:01 incident-2026-11.md',
      'ls -l /etc/passwd': '-rw-r--r-- 1 root root 2210 Oct 30 11:02 /etc/passwd   # תקין: קריאה לכולם, כתיבה ל-root בלבד',
      'ls -l /var/www/html/config.php': '-rw-rw-rw- 1 www-data www-data 880 Nov  2 03:14 /var/www/html/config.php   # ⚠ ממצא: ניתן לכתיבה לכולם!',
      'cat notes.txt': 'משימה: לבדוק כניסות כושלות מהלילה, תהליכים חריגים, והרשאות קבצי config באתר.',
      'ps aux': 'USER  PID %CPU COMMAND\nroot    1  0.0 /sbin/init\nroot  612  0.1 /usr/sbin/sshd -D\nwww-data 880 0.4 nginx: worker\nwww-data 1337 47.9 ./.cache/xmr-miner   # ⚠ ממצא: תהליך חשוד עם CPU גבוה\nanalyst 2201 0.0 -bash',
      'who': 'analyst  pts/0  2026-11-04 08:05 (10.0.0.23)',
      'last': 'analyst pts/0 10.0.0.23   Wed Nov 4 08:05 still logged in\nroot    pts/1 185.220.101.7 Wed Nov 4 03:12 - 03:20   # ⚠ ממצא: root מ-IP חיצוני בלילה',
      'uptime': ' 09:14:22 up 21 days,  load average: 1.92, 1.88, 1.70',
      'df -h': 'Filesystem Size Used Avail Use% Mounted on\n/dev/sda1   40G  31G  9G  78% /',
      'ss -tulpn': 'tcp LISTEN 0.0.0.0:22   sshd\ntcp LISTEN 0.0.0.0:80   nginx\ntcp LISTEN 0.0.0.0:3306 mysqld   # ⚠ ממצא: DB חשוף לכל הרשת',
      'grep "failed" /var/log/auth.log': 'Nov 4 03:02 sshd: Failed password for root from 185.220.101.7\n... (412 שורות דומות)\nNov 4 03:12 sshd: Accepted password for root from 185.220.101.7   # ⚠ ממצא: ניחוש סיסמאות שהצליח',
      'tail /var/log/auth.log': 'Nov 4 08:05 sshd: Accepted publickey for analyst from 10.0.0.23\nNov 4 08:06 sudo: analyst : TTY=pts/0 ; COMMAND=/usr/bin/less /var/log/syslog',
      'sudo -l': 'User analyst may run: (root) NOPASSWD: /usr/bin/less /var/log/*   # הרשאת קריאה ללוגים בלבד — least privilege'
    };
    const WIN = {
      'help': 'פקודות זמינות: whoami, whoami /groups, hostname, Get-LocalUser, Get-LocalGroupMember Administrators, Get-Process, Get-Service, Get-NetTCPConnection, Get-WinEvent Security, Get-Acl C:\\Finance, Get-MpComputerStatus, ipconfig, cls',
      'whoami': 'ofek\\analyst',
      'whoami /groups': 'OFEK\\SOC-Readers   Mandatory group\nBUILTIN\\Users      Mandatory group',
      'hostname': 'OFEK-WS-SALES12',
      'get-localuser': 'Name          Enabled Description\nAdministrator False   Built-in\nsales12       True    Sales user\nsupport_tmp   True    created 2026-11-04 03:15   # ⚠ ממצא: משתמש חדש שנוצר בלילה',
      'get-localgroupmember administrators': 'ObjectClass Name\nUser        OFEK\\it-admins\nUser        OFEK-WS-SALES12\\support_tmp   # ⚠ ממצא: משתמש לא מוכר בקבוצת מנהלים',
      'get-process': 'Handles  CPU(s)  Id  ProcessName\n  412   12.3  4120 chrome\n  220    0.4  1880 OUTLOOK\n   96   88.1  6602 svch0st   # ⚠ ממצא: שם מתחזה ל-svchost',
      'get-service': 'Status  Name        DisplayName\nRunning WinDefend   Microsoft Defender\nRunning Spooler     Print Spooler\nStopped wuauserv    Windows Update   # ⚠ ממצא: עדכונים כבויים',
      'get-nettcpconnection': 'LocalPort RemoteAddress   RemotePort State       OwningProcess\n49822     52.97.1.10      443        Established 1880\n50110     45.133.1.20     4444       Established 6602   # ⚠ ממצא: חיבור יוצא חשוד',
      'get-winevent security': 'TimeCreated        Id    Message\n04/11 03:14:55  4625  An account failed to log on (x37)\n04/11 03:15:10  4720  A user account was created: support_tmp\n04/11 03:15:12  4732  Member added to Administrators',
      'get-acl c:\\finance': 'Path: C:\\Finance\nAccess: OFEK\\Finance Allow Modify\n        Everyone     Allow FullControl   # ⚠ ממצא: Everyone עם שליטה מלאה',
      'get-mpcomputerstatus': 'AntivirusEnabled : True\nRealTimeProtectionEnabled : False   # ⚠ ממצא: הגנה בזמן אמת כבויה\nAntivirusSignatureAge : 19',
      'ipconfig': 'IPv4 Address. . . : 10.0.2.44\nDefault Gateway . : 10.0.2.1'
    };
    Object.assign(LINUX, {
      'uname -a': 'Linux ofek-web01 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux',
      'ls -la': 'drwxr-x--- 5 analyst analyst 4096 .\n-rw------- 1 analyst analyst  220 .bash_history\n-rw-r--r-- 1 analyst analyst  412 notes.txt\ndrwxr-x--- 2 analyst analyst 4096 reports',
      'cat /etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin\nanalyst:x:1001:1001::/home/analyst:/bin/bash\nbackup2:x:0:0::/tmp:/bin/bash   # ⚠ ממצא: משתמש נוסף עם UID 0',
      'crontab -l': '0 2 * * * /usr/local/bin/backup.sh',
      'sudo crontab -l -u www-data': '*/5 * * * * /var/www/.cache/xmr-miner   # ⚠ ממצא: התמדה דרך cron',
      'systemctl status ssh': '● ssh.service - OpenBSD Secure Shell server\n   Active: active (running) since Oct 14',
      'sudo ufw status': 'Status: inactive   # ⚠ ממצא: חומת האש כבויה',
      'journalctl -u ssh --since today': 'Nov 04 03:02 sshd: Failed password for root from 185.220.101.7 (x412)\nNov 04 03:12 sshd: Accepted password for root from 185.220.101.7',
      'grep permitrootlogin /etc/ssh/sshd_config': 'PermitRootLogin yes   # ⚠ ממצא: כניסת root ב-SSH מותרת',
      'history': '  1  whoami\n  2  ps aux\n  3  less /var/log/auth.log',
      'ip a': '2: eth0: inet 10.0.1.10/24 brd 10.0.1.255',
      'date': 'Wed Nov  4 09:15:02 IST 2026'
    });
    Object.assign(WIN, {
      'get-scheduledtask': 'TaskName         State\nOneDrive Update  Ready\nWinUpdateSvc     Ready   # ⚠ ממצא: משימה חשודה (שם מתחזה)',
      'get-netfirewallprofile': 'Name    Enabled\nDomain  True\nPrivate True\nPublic  False   # ⚠ ממצא: פרופיל Public כבוי',
      'get-hotfix': 'HotFixID  InstalledOn\nKB5031455 2026-06-12   # ⚠ ממצא: לא עודכן חודשים',
      'get-executionpolicy': 'Unrestricted   # ⚠ ממצא: מדיניות הרצה פתוחה מדי'
    });
    const CMD = {
      'help': 'פקודות cmd: whoami, whoami /priv, hostname, ver, ipconfig /all, netstat -ano, tasklist, net user, net localgroup administrators, schtasks /query /fo list, systeminfo, icacls c:\\finance, cls',
      'whoami': 'ofek\\analyst', 'hostname': 'OFEK-WS-SALES12', 'ver': 'Microsoft Windows [Version 10.0.22631.4317]',
      'whoami /priv': 'SeShutdownPrivilege      Disabled\nSeChangeNotifyPrivilege  Enabled   # אין הרשאות מסוכנות — טוב',
      'ipconfig /all': 'Host Name . . . : OFEK-WS-SALES12\nIPv4 Address. . : 10.0.2.44\nDNS Servers . . : 10.0.0.53',
      'netstat -ano': '  Proto Local            Foreign           State        PID\n  TCP   10.0.2.44:49822  52.97.1.10:443    ESTABLISHED  1880\n  TCP   10.0.2.44:50110  45.133.1.20:4444  ESTABLISHED  6602   # ⚠ ממצא: פורט חריג',
      'tasklist': 'Image Name     PID\nchrome.exe    4120\nOUTLOOK.EXE   1880\nsvch0st.exe   6602   # ⚠ ממצא',
      'net user': 'Administrator  Guest  sales12  support_tmp   # ⚠ ממצא: support_tmp',
      'net localgroup administrators': 'OFEK\\it-admins\nsupport_tmp   # ⚠ ממצא',
      'schtasks /query /fo list': 'TaskName: \\WinUpdateSvc\nTask To Run: C:\\Users\\Public\\svch0st.exe   # ⚠ ממצא: התמדה',
      'systeminfo': 'OS Name: Microsoft Windows 11 Pro\nHotfix(s): 1 Installed. KB5031455   # ⚠ חסרים עדכונים',
      'icacls c:\\finance': 'C:\\Finance Everyone:(OI)(CI)(F)   # ⚠ ממצא: Everyone Full\n           OFEK\\Finance:(OI)(CI)(M)'
    };
    const tasks = [
      { t: 'linux', k: 'whoami', d: 'Linux: גלו מי אתם (whoami / id)', m: c => /^(whoami|id)$/.test(c) },
      { t: 'linux', d: 'Linux: מצאו את ניחוש הסיסמאות ב־auth.log', m: c => /^grep .*failed.*auth\.log$/i.test(c) || c === 'last' },
      { t: 'linux', d: 'Linux: זהו תהליך חשוד (ps aux)', m: c => c === 'ps aux' },
      { t: 'linux', d: 'Linux: בדקו הרשאות config באתר (ls -l /var/www/html/config.php)', m: c => c === 'ls -l /var/www/html/config.php' },
      { t: 'win', d: 'Windows: מצאו משתמש חדש חשוד (Get-LocalUser)', m: c => c === 'get-localuser' },
      { t: 'win', d: 'Windows: קראו אירועי Security (Get-WinEvent Security)', m: c => c === 'get-winevent security' },
      { t: 'win', d: 'Windows: בדקו הרשאות C:\\Finance (Get-Acl)', m: c => c === 'get-acl c:\\finance' },
      { t: 'win', d: 'Windows: מצאו חיבור רשת חשוד (Get-NetTCPConnection)', m: c => c === 'get-nettcpconnection' },
      { t: 'linux', d: 'Linux: בדקו חומת אש (sudo ufw status)', m: c => c === 'sudo ufw status' },
      { t: 'linux', d: 'Linux: מצאו משתמש UID 0 נוסף (cat /etc/passwd)', m: c => c === 'cat /etc/passwd' },
      { t: 'cmd', d: 'cmd: מצאו התמדה (schtasks /query /fo list)', m: c => c === 'schtasks /query /fo list' },
      { t: 'cmd', d: 'cmd: קשרו PID לחיבור חשוד (netstat -ano)', m: c => c === 'netstat -ano' }
    ];
    const done = new Set();
    let os = 'linux';
    container.innerHTML = `
      <div class="sim-panel">
        <div class="term-tabs"><button class="term-tab active" data-os="linux">🐧 Linux · ofek-web01</button><button class="term-tab" data-os="win">🪟 PowerShell</button><button class="term-tab" data-os="cmd">⬛ cmd</button></div>
        <div class="term" id="term" dir="ltr"><div class="term-out" id="tout"></div>
          <div class="term-line"><span class="term-prompt" id="tprompt"></span><input id="tin" autocomplete="off" spellcheck="false" aria-label="פקודה"></div></div>
        <p class="panel-hint">סביבה מדומה לקריאה וחקירה בלבד. הקלידו <code>help</code> · ↑↓ היסטוריה · Tab השלמה. פקודות תקיפה חסומות.</p>
      </div>
      <div class="sim-panel"><h2>🎯 ממצאים לאיסוף</h2><ul class="task-list" id="t8"></ul>
        <div style="text-align:center;margin-top:1rem"><button class="btn btn-primary" id="sub8">סגירת חקירה והגשה</button></div></div>
      <div class="recap-box" id="recap8"></div>`;
    const out = container.querySelector('#tout'), inp = container.querySelector('#tin'), pr = container.querySelector('#tprompt');
    const hist = []; let hi = 0;
    const esc = s => s.replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
    const prompt = () => os === 'linux' ? 'analyst@ofek-web01:~$' : os === 'win' ? 'PS C:\\Users\\analyst>' : 'C:\\Users\\analyst>';
    const print = (txt, cls) => { const d = document.createElement('div'); d.className = cls || ''; d.innerHTML = esc(txt).replace(/(# ⚠[^\n]*)/g, '<span class="t-warn">$1</span>'); out.appendChild(d); out.parentElement.scrollTop = 1e9; };
    const renderTasks = () => container.querySelector('#t8').innerHTML = tasks.map((t, i) => `<li class="${done.has(i) ? 'done' : ''}">${done.has(i) ? '✅' : '⬜'} ${t.d}</li>`).join('');
    const switchOs = o => {
      os = o; out.innerHTML = ''; pr.textContent = prompt();
      container.querySelectorAll('.term-tab').forEach(b => b.classList.toggle('active', b.dataset.os === o));
      print({ linux: 'Ubuntu 24.04 LTS (סימולציה) — חיבור חקירה לקריאה בלבד. הקלידו help', win: 'Windows PowerShell (סימולציה) — הקלידו help', cmd: 'Microsoft Windows cmd (סימולציה) — הקלידו help' }[o], 't-dim');
      inp.focus();
    };
    container.querySelectorAll('.term-tab').forEach(b => b.onclick = () => switchOs(b.dataset.os));
    inp.addEventListener('keydown', e => {
      const DB = () => os === 'linux' ? LINUX : os === 'win' ? WIN : CMD;
      if (e.key === 'ArrowUp') { if (hi > 0) inp.value = hist[--hi]; e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, hist.length); inp.value = hist[hi] || ''; return; }
      if (e.key === 'Tab') { e.preventDefault(); const m = inp.value && Object.keys(DB()).find(k => k.startsWith(inp.value.toLowerCase())); if (m) inp.value = m; return; }
      if (e.key !== 'Enter') return;
      const raw = inp.value.trim(); inp.value = ''; if (!raw) return; hist.push(raw); hi = hist.length;
      print(prompt() + ' ' + raw, 't-cmd');
      const c = raw.toLowerCase().replace(/\s+/g, ' ').replace(/'/g, '"');
      if (c === 'clear' || c === 'cls') { out.innerHTML = ''; return; }
      if (BLOCK.test(raw)) { print('🛡️ הפקודה הזו שייכת לעולם התקיפה ולכן חסומה כאן. במעבדה הזו אנחנו מגינים: נסו לבדוק לוגים, משתמשים, תהליכים או הרשאות (הקלידו help).', 't-block'); return; }
      const db = os === 'linux' ? LINUX : os === 'win' ? WIN : CMD;
      const key = Object.keys(db).find(k => k.toLowerCase() === c);
      if (key) print(db[key]); else print(os === 'linux' ? `${raw.split(' ')[0]}: פקודה לא זמינה בסימולציה — נסו help` : `הפקודה '${raw.split(' ')[0]}' לא זמינה בסימולציה — נסו help`, 't-err');
      tasks.forEach((t, i) => { if (t.t === os && t.m(c)) done.add(i); });
      renderTasks();
    });
    renderTasks(); switchOs('linux');
    container.querySelector('#sub8').onclick = e => {
      e.target.disabled = true;
      const score = Math.round(done.size / tasks.length * 100);
      const r = container.querySelector('#recap8'); r.classList.add('visible');
      r.innerHTML = `<div class="score-display"><div class="score-circle">${score}</div><div>${done.size}/${tasks.length} ממצאים</div></div>
        <h3>✨ מה למדת</h3><ul><li>חקירה מתחילה בזהות: whoami / id.</li><li>auth.log ו־Event 4625/4720/4732 חושפים כניסות ושינויי חשבונות.</li><li>הרשאות רחבות מדי (rw-rw-rw-, Everyone FullControl) הן ממצא לתיקון מיידי.</li><li>מגן מתעד ומסלים — לא "מחזיר מכה".</li></ul><div class="cta-row" id="cta8"></div>`;
      onComplete(score);
    };
  }
};
