/* Room catalog metadata */
window.ROOMS_META = [
  {
    id: 'password-fortress',
    num: 1,
    title: 'מבצר הסיסמאות',
    titleEn: 'Password Fortress',
    difficulty: 'easy',
    difficultyHe: 'קל',
    xp: 50,
    desc: 'בנו מדיניות סיסמאות חזקה וראו כיצד היא משפיעה על זמן ניחוש תיאורטי.',
    icon: '🔐',
    requires: [],
    learnings: [
      'סיסמה ארוכה ומגוונת קשה בהרבה לניחוש מאשר סיסמה קצרה.',
      'מדיניות ארגונית: אורך מינימלי, MFA, ואיסור סיסמאות נפוצות.',
      'מגינים מודדים חוזק — לא תוקפים. אין צורך בכלי פריצה.'
    ]
  },
  {
    id: 'network-map',
    num: 2,
    title: 'מפת הרשת',
    titleEn: 'Network Map',
    difficulty: 'easy',
    difficultyHe: 'קל',
    xp: 60,
    desc: 'מקמו בקרות הגנה על צמתי רשת וטפלו בהתראת התחברות חשודה בסדר הנכון.',
    icon: '🗺️',
    requires: ['password-fortress'],
    learnings: [
      'הפרדת רשתות וחומת אש מגבילות נזק פוטנציאלי.',
      'MFA, עדכונים והרשאות מינימום הם בקרות יסוד.',
      'בטריאז׳: אמת → בודד → חקור → תעד — לא לקפוץ למסקנות.'
    ]
  },
  {
    id: 'https-shield',
    num: 3,
    title: 'מגן HTTPS',
    titleEn: 'HTTPS Shield',
    difficulty: 'medium',
    difficultyHe: 'בינוני',
    xp: 80,
    desc: 'צפו בלחיצת יד TLS מונפשת ולמדו מה הצפנה מגנה — ומה לא.',
    icon: '🛡️',
    requires: ['network-map'],
    learnings: [
      'TLS מצפין את התעבורה בין הלקוח לשרת ומוודא זהות השרת.',
      'HTTPS לא מחליף אימות משתמש, הרשאות, או הגנה על האפליקציה.',
      'תעודה תקינה + פרוטוקול מעודכן = בסיס תקשורת מאובטחת.'
    ]
  },
  {
    id: 'alert-triage',
    num: 4,
    title: 'טריאז׳ התראות SOC',
    titleEn: 'Alert Triage SOC',
    difficulty: 'medium',
    difficultyHe: 'בינוני',
    xp: 90,
    desc: 'סווגו התראות SIEM מדומות: חיובי אמיתי, חיובי שגוי, או הסלמה.',
    icon: '📡',
    requires: ['https-shield'],
    learnings: [
      'לא כל התראה היא תקיפה — הקשר וקו בסיס חשובים.',
      'חיובי שגוי גוזל זמן; אי-זיהוי חיובי אמיתי מסוכן יותר.',
      'הסלמה כשיש חוסר ודאות או השפעה רחבה — זו חוזקה, לא חולשה.'
    ]
  },
  {
    id: 'threat-modeling',
    num: 5,
    title: 'מידול איומים',
    titleEn: 'Threat Modeling',
    difficulty: 'hard',
    difficultyHe: 'קשה',
    xp: 120,
    desc: 'גררו נכסים, איומים ובקרות ללוח — חשבו כמו מגינים.',
    icon: '🎯',
    requires: ['password-fortress', 'network-map', 'https-shield', 'alert-triage'],
    learnings: [
      'מידול איומים מתחיל בנכסים — מה שווה להגן עליו.',
      'לכל איום מתאימים בקרות מונעות/מזהות/מגיבות.',
      'זו מסגרת חשיבה הגנתית — לא תרגיל תקיפה.'
    ]
  }
];

/* THM-style extensions: paths, tags, time, extra defense rooms */
(function () {
  const ext = {
    'password-fortress': { path: 'basics', tags: ['סיסמאות', 'MFA', 'מדיניות'], time: 10, story: 'הצטרפתם כמגינים ג׳וניורים לחברת "אופק טק" בתל אביב. המשימה הראשונה: לבנות מדיניות סיסמאות שתעמוד בביקורת.' },
    'network-map': { path: 'network', tags: ['רשת', 'Firewall', 'טריאז׳'], time: 15, story: 'מפת הרשת של "אופק טק" חשופה מדי. מקמו בקרות וטפלו בהתראה הראשונה שלכם.' },
    'https-shield': { path: 'network', tags: ['TLS', 'הצפנה', 'HTTPS'], time: 12, story: 'לקוחות שואלים אם האתר "מאובטח". הבינו מה בדיוק מנעול ה־HTTPS נותן.' },
    'alert-triage': { path: 'soc', tags: ['SIEM', 'SOC', 'IR'], time: 15, story: 'משמרת לילה במרכז ה־SOC. תור ההתראות מתמלא — סווגו נכון.' },
    'threat-modeling': { path: 'appsec', tags: ['Threat Model', 'STRIDE', 'בקרות'], time: 20, story: 'מוצר חדש עולה לאוויר בעוד שבוע. הנהלת האבטחה מבקשת מידול איומים מלא.' }
  };
  window.ROOMS_META.forEach(r => Object.assign(r, ext[r.id] || {}));
  window.ROOMS_META.push(
    { id: 'phishing-triage', num: 6, title: 'טריאז׳ פישינג', titleEn: 'Phishing Triage', difficulty: 'easy', difficultyHe: 'קל', xp: 60, icon: '🎣',
      desc: 'זהו סימני אזהרה במיילים מדומים והחליטו: לגיטימי, פישינג, או לדווח ל־SOC.', requires: ['password-fortress'],
      path: 'soc', tags: ['פישינג', 'מודעות', 'דיווח'], time: 10,
      story: 'עובדים ב"אופק טק" מעבירים לכם מיילים חשודים. בדקו כל אחד כמו אנליסט.',
      learnings: ['בודקים דומיין שולח, קישורים ודחיפות מלאכותית.', 'מדווחים — לא לוחצים ולא עונים.', 'מיילים פנימיים לגיטימיים קיימים; לא כל דבר הוא תקיפה.'] },
    { id: 'least-privilege', num: 7, title: 'הרשאות מינימום', titleEn: 'Least Privilege', difficulty: 'medium', difficultyHe: 'בינוני', xp: 80, icon: '🗝️',
      desc: 'הקצו הרשאות לעובדים לפי תפקיד — לא יותר ממה שצריך.', requires: ['network-map'],
      path: 'basics', tags: ['IAM', 'RBAC', 'הרשאות'], time: 12,
      story: 'מחלקת ה־IT נתנה לכולם Admin "כדי שיהיה נוח". תקנו את זה לפני הביקורת.',
      learnings: ['כל תפקיד מקבל רק את מה שדרוש לעבודה.', 'Admin הוא נכס מסוכן — מעט מאוד אנשים.', 'סקירת הרשאות תקופתית מונעת "זחילת הרשאות".'] },
    { id: 'terminal-lab', num: 8, title: 'מסוף המגן', titleEn: 'Defender Terminal', difficulty: 'medium', difficultyHe: 'בינוני', xp: 100, icon: '💻',
      desc: 'מסוף Linux ו־PowerShell מדומים: בדקו משתמשים, תהליכים, לוגים והרשאות כמו אנליסט.', requires: ['password-fortress'],
      path: 'soc', tags: ['Linux', 'PowerShell', 'לוגים'], time: 20,
      story: 'שרת ותחנת Windows של "אופק טק" חשודים. התחברו למסופי החקירה (מדומים) ואספו ממצאים — בלי לשנות כלום.',
      learnings: ['whoami / id / Get-LocalUser — קודם מבינים מי אתה ומי קיים.', 'לוגים (auth.log, Get-WinEvent) מספרים מה קרה.', 'בדיקת הרשאות (ls -l, Get-Acl) חושפת תצורה מסוכנת.'] }
  );
  window.PATHS_META = [
    { id: 'basics', title: 'יסודות הגנה', icon: '🧱', desc: 'סיסמאות, הרשאות ועקרונות בסיס של כל מגן.' },
    { id: 'network', title: 'הגנת רשת', icon: '🌐', desc: 'מפת רשת, חומות אש ותקשורת מוצפנת.' },
    { id: 'soc', title: 'אנליסט SOC', icon: '📡', desc: 'טריאז׳ התראות, פישינג וחקירה במסוף.' },
    { id: 'appsec', title: 'אבטחת אפליקציה', icon: '🎯', desc: 'מידול איומים וחשיבת בקרות.' }
  ];
})();
window.ROOMS_META.push(
  { id: 'network-builder', num: 9, title: 'בונה הרשת', titleEn: 'Network Builder', difficulty: 'medium', difficultyHe: 'בינוני', xp: 110, icon: '🧩',
    desc: 'בנו טופולוגיה בגרירה (PC, Laptop, Server, Switch, Router, Firewall, AP, Hub, Internet), חברו כבלים, שלחו חבילה והציבו בקרות.', requires: ['network-map'],
    path: 'network', tags: ['טופולוגיה', 'Firewall', 'Wi‑Fi'], time: 20,
    story: 'הסניף החדש של "אופק טק" בחיפה צריך רשת מאפס. תכננו אותה כך שכל תעבורה מהאינטרנט תעבור סינון.',
    learnings: ['Firewall עם Default deny בין האינטרנט לפנים.', 'Switch במקום Hub מצמצם האזנה.', 'WPA3 ורשת אורחים מופרדת.'] },
  { id: 'windows-server', num: 10, title: 'שרת Windows ו־GPO', titleEn: 'Windows Server Hardening', difficulty: 'hard', difficultyHe: 'קשה', xp: 150, icon: '🏢',
    desc: 'Server Manager מדומה: Active Directory, DNS, Group Policy ו־Hyper‑V — בצעו ביקורת הקשחה ותגובה לאירוע.', requires: ['least-privilege'],
    path: 'basics', tags: ['AD', 'GPO', 'DNS', 'VM'], time: 25,
    story: 'אתם מנהלי הדומיין ofek.local. דוח ביקורת מצא ליקויים — וגם תחנה אחת מתריעה. טפלו בהכל.',
    learnings: ['צמצום Domain Admins והשבתת חשבונות ישנים.', 'מדיניות סיסמאות, נעילה ו־Audit דרך GPO.', 'שימור ראיות לפני בידוד VM.'] }
);
