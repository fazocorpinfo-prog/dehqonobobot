import { initDatabase, getDb } from './index';
import { todayLocalDate } from '../utils';

initDatabase();
const db = getDb();

console.log('Seed boshlandi...');

// Aktiv xatm
const existingKhatm = db.prepare(`SELECT * FROM khatms WHERE status='active'`).get();
if (!existingKhatm) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  db.prepare(
    `INSERT INTO khatms (title, starts_at, ends_at, total_pages, status)
     VALUES (?, ?, ?, 604, 'active')`
  ).run('Birinchi haftalik xatm', start.toISOString(), end.toISOString());
  console.log('  + Aktiv xatm yaratildi');
}

// Oyatlar (o'zbekcha tarjima bilan)
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
      tafsir: 'Alloh bandaga uning quvvati yetadigan vazifani beradi - har kim o\'z imkoniyatiga qarab harakat qilsin.',
    },
    {
      surah: 13, name: 'Ar-Ra\'d', ayah: 28,
      uzbek: '«Ogoh bo\'lingki, dillar Allohni eslash bilangina orom topadi.»',
      tafsir: 'Qalb tinchligi - faqat Allohni zikr qilishda.',
    },
    {
      surah: 39, name: 'Az-Zumar', ayah: 53,
      uzbek: '«Allohning rahmatidan umidsiz bo\'lmang. Albatta, Alloh barcha gunohlarni kechiradi.»',
      tafsir: 'Tavbaga qaytganlar uchun rahmat eshigi har doim ochiq.',
    },
    {
      surah: 94, name: 'Ash-Sharh', ayah: 6,
      uzbek: '«Albatta, qiyinchilik bilan birga osonlik bordir.»',
      tafsir: 'Har bir qiyinchilikdan keyin osonlik keladi - sabr qilish - imonning yarmi.',
    },
  ];
  const stmt = db.prepare(
    `INSERT INTO verses (surah_number, surah_name, ayah_number, arabic, uzbek, tafsir, is_active)
     VALUES (?, ?, ?, ?, ?, ?, 1)`
  );
  for (const v of verses) {
    stmt.run(v.surah, v.name, v.ayah, (v as any).arabic ?? null, v.uzbek, v.tafsir);
  }
  console.log(`  + ${verses.length} ta oyat qo'shildi`);
}

// E'lonlar
const annCount = (db.prepare('SELECT COUNT(*) AS c FROM announcements').get() as any).c;
if (annCount === 0) {
  db.prepare(
    `INSERT INTO announcements (title, body, category, card_number, card_holder)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    'Masjid ta\'mirlash uchun ehson',
    'Aziz birodarlar! Masjidimizning ichki bezagi va minoraning ta\'mirlash ishlari uchun yordamingizni kutamiz. Har bir tiyiningiz savobning bir parchasi bo\'ladi.',
    'charity',
    '8600 1234 5678 9012',
    'Dehqonbobo Jome masjidi'
  );
  db.prepare(
    `INSERT INTO announcements (title, body, category)
     VALUES (?, ?, ?)`
  ).run(
    'Juma namozi',
    'Aziz jamoat, bu juma kuni soat 13:00 da Imom hazratlari tomonidan "Sabr-toqat fazilati" mavzusida xutba o\'qiladi.',
    'event'
  );
  console.log('  + 2 ta e\'lon qo\'shildi');
}

// Challenge
const chCount = (db.prepare('SELECT COUNT(*) AS c FROM challenges').get() as any).c;
if (chCount === 0) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 7);
  db.prepare(
    `INSERT INTO challenges (title, description, target_count, starts_at, ends_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    '1 haftada 1 million Istig\'for',
    'Birgalikda 1 million marotaba "Astag\'firullah" deyaylik. Har biringiz qanchadan o\'qiganingizni qo\'shing.',
    1_000_000,
    start.toISOString(),
    end.toISOString()
  );
  console.log('  + Challenge qo\'shildi');
}

// Namoz vaqtlari (bu hafta)
const ptCount = (db.prepare('SELECT COUNT(*) AS c FROM prayer_times').get() as any).c;
if (ptCount === 0) {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO prayer_times (date, bomdod, quyosh, peshin, asr, shom, xufton)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    stmt.run(date, '04:30', '05:55', '12:30', '17:00', '19:25', '20:55');
  }
  console.log('  + 7 kunlik namoz vaqtlari');
}

// Maqolalar va duolar
const artCount = (db.prepare('SELECT COUNT(*) AS c FROM articles').get() as any).c;
if (artCount === 0) {
  db.prepare(`INSERT INTO articles (title, body, category) VALUES (?, ?, ?)`).run(
    'Ertalabki duolar',
    'Bismillahir rahmanir rahiym. "Asbahna va asbahal-mulku lillah, val-hamdu lillah, la ilaha illallah, vahdahu la sharika lah..." \n\nMa\'nosi: Biz tongni ham, mulkni ham Alloh uchun ochdik. Hamd Allohga, Ulug\'ligida sherigi yo\'q...',
    'dua'
  );
  db.prepare(`INSERT INTO articles (title, body, category) VALUES (?, ?, ?)`).run(
    'Qur\'on tilavatining fazilati',
    'Payg\'ambarimiz (s.a.v.) marhamat qilganlar: «Sizlarning eng yaxshilaringiz Qur\'onni o\'rganib, uni o\'rgatuvchilardir» (Buxoriy). Har bir harf evaziga 10 hasanat yoziladi...',
    'article'
  );
  console.log('  + 2 ta maqola qo\'shildi');
}

console.log('Seed yakunlandi.');
process.exit(0);
