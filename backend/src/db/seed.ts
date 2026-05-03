import { initDatabase, getDb } from './index';

// Standalone yoki runtime'da chaqirish mumkin. CLI orqali ishga tushganda process.exit ishlaydi.
const isCli = require.main === module;
if (isCli) initDatabase();
const db = getDb();

console.log("Demo ma'lumotlar yuklanmoqda...");

// =============================================================
// Helpers
// =============================================================

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function isoDaysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function dateOnly(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// =============================================================
// 1) Aktiv xatm
// =============================================================

let khatmId: number;
const existingKhatm = db.prepare(`SELECT id FROM khatms WHERE status='active'`).get() as any;
if (!existingKhatm) {
  const r = db.prepare(
    `INSERT INTO khatms (title, starts_at, ends_at, total_pages, status)
     VALUES (?, ?, ?, 604, 'active')`
  ).run("Ramazon xatmi · 1-hafta", isoDaysAgo(5), isoDaysFromNow(9));
  khatmId = Number(r.lastInsertRowid);
  console.log(`  + Aktiv xatm yaratildi (#${khatmId})`);
} else {
  khatmId = existingKhatm.id;
  console.log(`  · Mavjud xatm ishlatiladi (#${khatmId})`);
}

// Tugagan xatm (sertifikat tarixi uchun)
const oldKhatm = db.prepare(`SELECT id FROM khatms WHERE status='completed' LIMIT 1`).get() as any;
let oldKhatmId: number | null = null;
if (!oldKhatm) {
  const r = db.prepare(
    `INSERT INTO khatms (title, starts_at, ends_at, total_pages, status)
     VALUES (?, ?, ?, 604, 'completed')`
  ).run("Sha'bon xatmi · 4-hafta", isoDaysAgo(35), isoDaysAgo(28));
  oldKhatmId = Number(r.lastInsertRowid);
  console.log(`  + Tugagan xatm tarixi qo'shildi (#${oldKhatmId})`);
} else {
  oldKhatmId = oldKhatm.id;
}

// =============================================================
// 2) Demo foydalanuvchilar (32 ta)
// =============================================================

const demoNames: { first: string; last: string; age: number; cap: number; phone: string }[] = [
  { first: "Abdulloh",  last: "Karimov",      age: 28, cap: 8,  phone: "+998 90 111 11 11" },
  { first: "Muhammad",  last: "Yusupov",      age: 34, cap: 6,  phone: "+998 90 222 22 22" },
  { first: "Ibrohim",   last: "Solihov",      age: 19, cap: 10, phone: "+998 91 333 33 33" },
  { first: "Yusuf",     last: "Rahimov",      age: 42, cap: 4,  phone: "+998 93 444 44 44" },
  { first: "Ali",       last: "Tursunov",     age: 16, cap: 3,  phone: "+998 94 555 55 55" },
  { first: "Hasan",     last: "Ahmedov",      age: 22, cap: 7,  phone: "+998 97 666 66 66" },
  { first: "Husayn",    last: "Saidov",       age: 38, cap: 5,  phone: "+998 99 777 77 77" },
  { first: "Bilol",     last: "Olimov",       age: 14, cap: 2,  phone: "+998 88 888 88 88" },
  { first: "Salohiddin", last: "Mirzayev",    age: 51, cap: 6,  phone: "+998 90 121 21 21" },
  { first: "Umar",      last: "Tojiboyev",    age: 27, cap: 9,  phone: "+998 90 232 32 32" },
  { first: "Usmon",     last: "Hamroqulov",   age: 45, cap: 5,  phone: "+998 90 343 43 43" },
  { first: "Anvar",     last: "Sodiqov",      age: 33, cap: 7,  phone: "+998 91 454 54 54" },
  { first: "Ravshan",   last: "Mahmudov",     age: 29, cap: 6,  phone: "+998 93 565 65 65" },
  { first: "Sirojiddin", last: "Nazarov",     age: 36, cap: 4,  phone: "+998 94 676 76 76" },
  { first: "Zafar",     last: "Komilov",      age: 23, cap: 8,  phone: "+998 97 787 87 87" },
  { first: "Sherzod",   last: "Egamberdiyev", age: 31, cap: 6,  phone: "+998 99 898 98 98" },
  // Ayollar
  { first: "Oysha",     last: "Karimova",     age: 26, cap: 7,  phone: "+998 90 100 11 22" },
  { first: "Maryam",    last: "Yusupova",     age: 19, cap: 5,  phone: "+998 90 200 22 33" },
  { first: "Fotima",    last: "Solihova",     age: 35, cap: 4,  phone: "+998 91 300 33 44" },
  { first: "Xadicha",   last: "Rahimova",     age: 41, cap: 5,  phone: "+998 93 400 44 55" },
  { first: "Zaynab",    last: "Tursunova",    age: 24, cap: 6,  phone: "+998 94 500 55 66" },
  { first: "Hadiya",    last: "Ahmedova",     age: 17, cap: 3,  phone: "+998 97 600 66 77" },
  { first: "Sumayya",   last: "Saidova",      age: 22, cap: 8,  phone: "+998 99 700 77 88" },
  { first: "Asma",      last: "Olimova",      age: 38, cap: 4,  phone: "+998 88 800 88 99" },
  // Bolalar
  { first: "Sa'd",      last: "Hamroqulov",   age: 12, cap: 2,  phone: "+998 90 900 00 11" },
  { first: "Ammor",     last: "Sodiqov",      age: 11, cap: 1,  phone: "+998 90 911 00 22" },
  { first: "Tolha",     last: "Mahmudov",     age: 13, cap: 2,  phone: "+998 91 922 00 33" },
  { first: "Mus'ab",    last: "Nazarov",      age: 15, cap: 3,  phone: "+998 93 933 00 44" },
  // Yoshi kattalar
  { first: "Otabek",    last: "Komilov",      age: 62, cap: 3,  phone: "+998 94 944 00 55" },
  { first: "Saidakbar", last: "Egamberdiyev", age: 58, cap: 4,  phone: "+998 97 955 00 66" },
  { first: "Bahodir",   last: "Karimov",      age: 49, cap: 5,  phone: "+998 99 966 00 77" },
  { first: "Furqat",    last: "Yusupov",      age: 37, cap: 6,  phone: "+998 88 977 00 88" },
];

const insertUser = db.prepare(
  `INSERT OR IGNORE INTO users (telegram_id, first_name, last_name, age, daily_capacity, phone, role, status, created_at)
   VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?)`
);
const tgBase = 700_000_000;
const userIds: number[] = [];

let usersAdded = 0;
demoNames.forEach((u, i) => {
  const tg = tgBase + i + 1;
  const status = i === 8 ? 'frozen' : i === 9 ? 'blocked' : 'active';
  insertUser.run(tg, u.first, u.last, u.age, u.cap, u.phone, status, isoDaysAgo(20 - (i % 15)));
  const row = db.prepare(`SELECT id FROM users WHERE telegram_id=?`).get(tg) as any;
  if (row) userIds.push(row.id);
  usersAdded++;
});
console.log(`  + ${usersAdded} ta demo foydalanuvchi`);

// =============================================================
// 3) Vazifalar (xatm sahifalarini foydalanuvchilarga taqsimlash)
// =============================================================

const totalPages = 604;
const totalCap = demoNames.reduce((s, u) => s + u.cap, 0);
let cursor = 1;
const insertTask = db.prepare(
  `INSERT OR IGNORE INTO tasks (khatm_id, user_id, start_page, end_page, pages_done, status, created_at)
   VALUES (?, ?, ?, ?, ?, 'active', ?)`
);
const taskIds: { taskId: number; userId: number; total: number; done: number }[] = [];

userIds.forEach((uid, i) => {
  const u = demoNames[i];
  if (!u) return;
  const share = Math.round((u.cap / totalCap) * totalPages);
  const start = cursor;
  const end = Math.min(totalPages, cursor + share - 1);
  cursor = end + 1;

  // 5 kun davom etadi - har xil progress (0-100%)
  const progressPct = Math.min(100, Math.max(0, Math.round((i * 7 + 13) % 105)));
  const done = Math.round(((end - start + 1) * progressPct) / 100);
  const r = insertTask.run(khatmId, uid, start, end, done, isoDaysAgo(5));
  if (r.changes > 0) {
    taskIds.push({ taskId: Number(r.lastInsertRowid), userId: uid, total: end - start + 1, done });
  }
});
console.log(`  + ${taskIds.length} ta vazifa taqsimlandi`);

// =============================================================
// 4) Kunlik hisobotlar (oxirgi 14 kun)
// =============================================================

const insertReport = db.prepare(
  `INSERT OR IGNORE INTO daily_reports (task_id, user_id, report_date, pages_read, created_at)
   VALUES (?, ?, ?, ?, ?)`
);
let reportsAdded = 0;
taskIds.forEach((t, idx) => {
  // Foydalanuvchi turli aktivlik darajasiga ega
  const activity = (idx % 4) + 1; // 1..4 (1 - kam, 4 - juda faol)
  for (let day = 14; day >= 0; day--) {
    // ba'zi kunlar tashlab ketish
    const skip = (day + idx) % (5 - activity) === 0 && activity < 4;
    if (skip) continue;
    const pages = Math.max(1, Math.round((demoNames[idx]?.cap ?? 5) * (0.5 + Math.random() * 0.7)));
    insertReport.run(t.taskId, t.userId, dateOnly(-day), pages, isoDaysAgo(day));
    reportsAdded++;
  }
});
console.log(`  + ${reportsAdded} ta kunlik hisobot`);

// =============================================================
// 5) Garden state — har bir foydalanuvchi uchun
// =============================================================

const insertGarden = db.prepare(
  `INSERT OR IGNORE INTO garden_state (user_id, trees, fruits, health, last_watered, withered)
   VALUES (?, ?, ?, ?, ?, ?)`
);
userIds.forEach((uid, i) => {
  const trees = Math.min(12, Math.max(1, Math.floor(i / 3) + 1));
  const fruits = Math.max(0, (i * 7) % 25);
  const health = Math.max(20, 100 - (i * 11) % 80);
  insertGarden.run(uid, trees, fruits, health, isoDaysAgo(i % 4), health < 30 ? 1 : 0);
});
console.log(`  + ${userIds.length} ta bog' yaratildi`);

// =============================================================
// 6) Oyatlar (10 ta)
// =============================================================

const versesCount = (db.prepare('SELECT COUNT(*) AS c FROM verses').get() as any).c;
if (versesCount === 0) {
  const verses = [
    {
      surah: 1, name: 'Al-Fotiha', ayah: 1,
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      uzbek: '«Mehribon va rahmli Alloh nomi bilan boshlayman.»',
      tafsir: 'Har bir ezgu ishni Allohning nomi bilan boshlash sunnatdir.',
    },
    {
      surah: 2, name: 'Al-Baqara', ayah: 286,
      arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
      uzbek: '«Alloh hech bir jonga toqatidan tashqari yuk yuklamaydi.»',
      tafsir: "Alloh bandaga uning quvvati yetadigan vazifani beradi - har kim o'z imkoniyatiga qarab harakat qilsin.",
    },
    {
      surah: 13, name: "Ar-Ra'd", ayah: 28,
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      uzbek: "«Ogoh bo'lingki, dillar Allohni eslash bilangina orom topadi.»",
      tafsir: "Qalb tinchligi - faqat Allohni zikr qilishda.",
    },
    {
      surah: 39, name: 'Az-Zumar', ayah: 53,
      arabic: 'لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ',
      uzbek: "«Allohning rahmatidan umidsiz bo'lmang. Albatta, Alloh barcha gunohlarni kechiradi.»",
      tafsir: 'Tavbaga qaytganlar uchun rahmat eshigi har doim ochiq.',
    },
    {
      surah: 94, name: 'Ash-Sharh', ayah: 6,
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      uzbek: "«Albatta, qiyinchilik bilan birga osonlik bordir.»",
      tafsir: "Har bir qiyinchilikdan keyin osonlik keladi - sabr - imonning yarmi.",
    },
    {
      surah: 65, name: 'At-Talaq', ayah: 3,
      arabic: 'وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      uzbek: "«Kim Allohga tavakkul qilsa, U unga yetarlidir.»",
      tafsir: "Tavakkul - bu izlanishni qoldirib qo'yish emas, balki natijani Allohga topshirish.",
    },
    {
      surah: 17, name: 'Al-Isra', ayah: 9,
      arabic: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      uzbek: "«Haqiqatan, bu Qur'on eng to'g'ri yo'lga hidoyat qiladi.»",
      tafsir: "Qur'on - har qanday vaziyatda eng adolatli yo'lni ko'rsatuvchi nurdir.",
    },
    {
      surah: 20, name: 'Toha', ayah: 124,
      uzbek: "«Kim Mening zikrimdan yuz o'girsa, uning hayoti tang bo'ladi.»",
      tafsir: "Allohni unutgan inson moddiy farovonlikda ham ichki tinchlikni topa olmaydi.",
    },
    {
      surah: 2, name: 'Al-Baqara', ayah: 153,
      arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
      uzbek: "«Sabr va namoz bilan yordam so'rang.»",
      tafsir: "Hayotning har bir sinovida ikki kuchli quroli - sabr va namoz.",
    },
    {
      surah: 49, name: 'Al-Hujurat', ayah: 10,
      uzbek: "«Mo'minlar bir-biriga birodardirlar.»",
      tafsir: "Imon birodarligi - qondan ham, millatdan ham yuqori bog'lanishdir.",
    },
  ];
  const stmt = db.prepare(
    `INSERT INTO verses (surah_number, surah_name, ayah_number, arabic, uzbek, tafsir, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  );
  for (const v of verses) {
    stmt.run(v.surah, v.name, v.ayah, (v as any).arabic ?? null, v.uzbek, v.tafsir);
  }
  console.log(`  + ${verses.length} ta oyat`);
}

// =============================================================
// 7) E'lonlar (5 ta)
// =============================================================

const annCount = (db.prepare('SELECT COUNT(*) AS c FROM announcements').get() as any).c;
if (annCount === 0) {
  const items = [
    {
      title: "Masjid ta'mirlash uchun ehson",
      body: "Aziz birodarlar! Masjidimizning ichki bezagi va minoraning ta'mirlash ishlari uchun yordamingizni kutamiz.\n\nHar bir tiyin — savob, har bir do'st — ne'matdir. Allohdan ajringizni qabul qilishni so'raymiz.",
      category: 'charity',
      card_number: '8600 1234 5678 9012',
      card_holder: 'Dehqonbobo Jome masjidi',
    },
    {
      title: "Imom hazratlariga ehson",
      body: "Imom Sayyid Akbar hazratlariga oilaviy nikoh tadbirlariga yordam tariqasida har bir mo'minning hissasi qadrlanadi.",
      category: 'imam',
      card_number: '9860 0011 2233 4455',
      card_holder: 'Sayyid Akbar Yusupov',
    },
    {
      title: "Juma namozi · Sabr fazilati",
      body: "Aziz jamoat! Bu juma kuni soat 13:00 da Imom hazratlari tomonidan «Sabr-toqat va shukrning ulug'ligi» mavzusida xutba o'qiladi. Barchani da'vat etamiz.",
      category: 'event',
    },
    {
      title: "Yetimlar uchun iftor dasturxoni",
      body: "Shanba kuni masjid hovlisida 50 nafar yetim bola uchun iftor uyushtirilmoqda. Yordam berish uchun aloqa: +998 90 111 11 11.",
      category: 'charity',
      card_number: '8600 5544 3322 1100',
      card_holder: 'Yetimlar fondi',
    },
    {
      title: "Tilovat darslari boshlandi",
      body: "Har dushanba va payshanba kuni asr namozidan keyin yangi qoriylar uchun tajvid darslari ochildi. Ro'yxatdan o'tish — masjid kotibida.",
      category: 'event',
    },
  ];
  const stmt = db.prepare(
    `INSERT INTO announcements (title, body, category, card_number, card_holder, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  items.forEach((a, i) => stmt.run(a.title, a.body, a.category, a.card_number ?? null, a.card_holder ?? null, isoDaysAgo(i)));
  console.log(`  + ${items.length} ta e'lon`);
}

// =============================================================
// 8) Challenge'lar (3 ta)
// =============================================================

const chCount = (db.prepare('SELECT COUNT(*) AS c FROM challenges').get() as any).c;
if (chCount === 0) {
  const challenges = [
    { title: "1 haftada 1 million Istig'for", desc: "Birgalikda 1 mln marta «Astag'firullah» deyaylik. Har biringiz qancha o'qigan bo'lsa kiritsin.", target: 1_000_000, days: 7 },
    { title: "1 oyda 100 000 salavot", desc: "Payg'ambarimizga (s.a.v.) salavot aytish yuksak fazilatlardandir.", target: 100_000, days: 30 },
    { title: "Ramazonda 30 ta yaxshilik", desc: "Har kun bitta yaxshilik (sadaqa, salom, yordam, do'stga xayrli xabar).", target: 30, days: 30 },
  ];
  const stmt = db.prepare(
    `INSERT INTO challenges (title, description, target_count, starts_at, ends_at)
     VALUES (?, ?, ?, ?, ?)`
  );
  challenges.forEach((c) => {
    stmt.run(c.title, c.desc, c.target, isoDaysAgo(2), isoDaysFromNow(c.days));
  });

  // Challenge entries
  const chRows = db.prepare(`SELECT id, target_count FROM challenges`).all() as any[];
  const insertEntry = db.prepare(
    `INSERT OR IGNORE INTO challenge_entries (challenge_id, user_id, count) VALUES (?, ?, ?)`
  );
  chRows.forEach((c, ci) => {
    userIds.forEach((uid, ui) => {
      const portion = Math.round((c.target_count * (0.05 + ((ui + ci) % 7) / 100)) / userIds.length);
      insertEntry.run(c.id, uid, portion);
    });
  });
  console.log(`  + ${challenges.length} ta challenge va ishtirokchilar`);
}

// =============================================================
// 9) Namoz vaqtlari (30 kun)
// =============================================================

const ptCount = (db.prepare('SELECT COUNT(*) AS c FROM prayer_times').get() as any).c;
if (ptCount === 0) {
  // Toshkent atroflarida realistik vaqtlar
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO prayer_times (date, bomdod, quyosh, peshin, asr, shom, xufton)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (let i = 0; i < 30; i++) {
    const minOffset = Math.floor(i / 3); // har 3 kunda 1 daqiqa siljiydi
    const t = (h: number, m: number) =>
      `${String(h).padStart(2, '0')}:${String((m + minOffset) % 60).padStart(2, '0')}`;
    stmt.run(dateOnly(i), t(4, 30), t(5, 55), t(12, 30), t(17, 0), t(19, 25), t(20, 55));
  }
  console.log("  + 30 kunlik namoz vaqtlari");
}

// =============================================================
// 10) Maqolalar va duolar (6 ta)
// =============================================================

const artCount = (db.prepare('SELECT COUNT(*) AS c FROM articles').get() as any).c;
if (artCount === 0) {
  const arts = [
    {
      title: "Ertalabki duolar",
      body:
        "Bismillahir rahmaanir rahiym.\n\n«Asbahnaa va asbaha-l-mulku lillaah, val-hamdu lillaah, laa ilaaha illallooh, vahdahu laa shariyka lah...»\n\nMa'nosi: Biz tongni ham, mulkni ham Alloh uchun ochdik. Hamd Allohga, Ulug'lik tegishlidir, U birdir, Unga sherik yo'q.\n\nFazilati: Ertalab uch marta o'qigan kishini Alloh shaytondan saqlaydi.",
      category: 'dua',
    },
    {
      title: "Yotishdan oldingi duolar",
      body:
        "«Bismika Allohumma amuutu va ahyaa.»\n\nMa'nosi: Yo Robbiy, Sening noming bilan o'lib, Sening noming bilan tirilaman.\n\nFazilati: Yotishdan avval o'qigan kishi tunda halok bo'lsa, shahidlar qatorida bo'ladi.",
      category: 'dua',
    },
    {
      title: "Salovat",
      body:
        "«Allohumma solli alaa Muhammad va alaa aali Muhammad...»\n\nFazilati: Bir marta salovat keltirgan kishiga 10 ta salom yetib boradi va 10 ta gunohi kechiriladi.",
      category: 'dua',
    },
    {
      title: "Qur'on tilovatining fazilati",
      body:
        "Payg'ambarimiz (s.a.v.) marhamat qilganlar:\n«Sizlarning eng yaxshilaringiz — Qur'onni o'rganib, uni o'rgatuvchilardir.» (Buxoriy)\n\nHar bir harf evaziga 10 hasanat yoziladi. «Alif-Lom-Mim» o'qigan inson 30 ta hasanat oladi.\n\nQur'on qiyomat kuni o'qiganiga shafoatchi bo'ladi.",
      category: 'article',
    },
    {
      title: "Sabr — imonning yarmi",
      body:
        "Sabr uch turlidir: 1) Itoatga sabr; 2) Gunohdan saqlanishga sabr; 3) Musibatga sabr.\n\nAlloh Qur'onda 90 dan ortiq joyda sabrni zikr qilgan. «Sabr qiluvchilarga ajr-savob hisobsiz beriladi.» (Az-Zumar 10).\n\nSabrning belgisi — birinchi zarbada bardosh.",
      category: 'article',
    },
    {
      title: "Sadaqaning ulug'ligi",
      body:
        "Sadaqa baloni qaytaradi, umrni uzaytiradi, mol-mulkni barakali qiladi.\n\nKichik bo'lsa ham qaytarmang — bir xurmoning yarmi bilan bo'lsa ham o'zingizni do'zaxdan saqlang. (Hadis)\n\nEng yaxshi sadaqa — yashirin va doimo qilinadigani.",
      category: 'article',
    },
  ];
  const stmt = db.prepare(`INSERT INTO articles (title, body, category) VALUES (?, ?, ?)`);
  arts.forEach((a) => stmt.run(a.title, a.body, a.category));
  console.log(`  + ${arts.length} ta maqola/duo`);
}

// =============================================================
// 11) Tugagan xatm uchun sertifikatlar
// =============================================================

if (oldKhatmId) {
  const certCount = (db.prepare(`SELECT COUNT(*) AS c FROM certificates WHERE khatm_id=?`).get(oldKhatmId) as any).c;
  if (certCount === 0 && userIds.length >= 10) {
    const stmt = db.prepare(
      `INSERT INTO certificates (user_id, khatm_id, title, rank, awarded_at) VALUES (?, ?, ?, ?, ?)`
    );
    for (let i = 0; i < 10; i++) {
      stmt.run(
        userIds[i],
        oldKhatmId,
        "Sha'bon xatmi · Top-10 qori",
        i + 1,
        isoDaysAgo(28 - i)
      );
    }
    console.log(`  + 10 ta sertifikat (tugagan xatm uchun)`);
  }
}

// =============================================================
// 12) Zaxira betlar (SOS dan qolgan)
// =============================================================

const reserveCount = (db.prepare(`SELECT COUNT(*) AS c FROM reserve_pages WHERE khatm_id=?`).get(khatmId) as any).c;
if (reserveCount === 0) {
  const stmt = db.prepare(
    `INSERT INTO reserve_pages (khatm_id, start_page, end_page, reason, created_at) VALUES (?, ?, ?, ?, ?)`
  );
  stmt.run(khatmId, 250, 259, 'sos', isoDaysAgo(2));
  stmt.run(khatmId, 412, 416, 'sos', isoDaysAgo(1));
  stmt.run(khatmId, 540, 545, 'reassigned', isoDaysAgo(1));
  console.log(`  + 3 ta zaxira diapazoni`);
}

console.log("\n✅ Demo ma'lumotlar to'liq yuklandi.");
if (isCli) process.exit(0);
