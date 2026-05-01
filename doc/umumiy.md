📖 "Xatmi Qur’on" Web App Bot Loyihasi (Dehqonbobo Jome Masjidi)
Ushbu bot Qur’on xatm qilish jarayonini raqamlashtirish, foydalanuvchilarni motivatsiya qilish va masjid ma’muriyati uchun boshqaruvni osonlashtirishga xizmat qiladi.

🟢 1. Dizayn va Interfeys (UI/UX)
Asosiy rang: Islomiy yashil (Emerald Green) va oq ranglar kombinatsiyasi.

Texnologiya: Telegram Web App (TWA) — foydalanuvchi bot ichida xuddi mobil ilovadek interfeysni ko'radi.

Animatsiyalar: Gamifikatsiya elementlari (o'sayotgan daraxtlar, suv quyish animatsiyasi).

Qulaylik: An'anaviy Telegram tugmalari (Keyboard) va Web interfeys uyg'unligi.

🛠 2. Botning Asosiy Funksiyalari
A. Ro'yxatdan o'tish va Vazifa taqsimoti
Profil: Ism, familiya, yosh va kunlik o'qish quvvati (betlarda).

Aqlli taqsimot: Admin xatm muddatini (masalan, 1-hafta, dushanba soat 08:00 dan yakshanba 20:00 gacha) belgilaydi.

Yaxlitlash: Bot foydalanuvchiga vazifa berganda, betlarni poralarga yoki rub'larga qarab yaxlitlab beradi (masalan, 12 bet emas, 15 bet — pora yakuniga qarab).

Kechikkanlar: Agar xatm boshlanganiga 3 kun bo'lgan bo'lsa, yangi kirgan foydalanuvchiga qolgan 4 kunga moslangan vazifa beriladi.

B. Gamifikatsiya: "Raqamli Bog'"
Har bir foydalanuvchining o'z virtual bog'i bo'ladi.

O'sish: Kunlik vazifa bajarilganda bog'dagi daraxtlar ko'karadi va meva beradi.

Nobud bo'lish: Agar 2 kun davomida hisobot berilmasa, bog' suvsizlanadi, daraxtlar sarg'ayadi.

Leaderboard: Yosh toifalari (bolalar, kattalar), haftalik va oylik reytinglar. Eng faollarga bot tomonidan avtomatik Sertifikat (PDF formatda) generatsiya qilinadi.

C. Monitoring va Admin Panel
To'liq nazorat: Admin nechta xatm ketayotgani, umumiy progress (%) va har bir foydalanuvchining holatini ko'radi.

SOS Tizimi: Agar foydalanuvchi "Qiynalyapman, 10 bet kamaytirib bering" tugmasini bossa, bot vazifani avtomatik qayta hisoblaydi va ortib qolgan betlarni "Zaxira"ga tashlaydi.

Qayta taqsimlash: 2 kun hisobot bermaganlar haqida adminga signal boradi. Admin tugma orqali vazifani bekor qilib, boshqa ko'ngillilarga (qo'shimcha vazifa oluvchilarga) yo'naltirishi mumkin.

Bloklash: Tartibni buzganlarni vaqtinchalik (muzlatish) yoki butunlay chetlatish imkoniyati.

📢 3. Ma'naviy va Ijtimoiy Bo'limlar
🕌 Masjid va Jamiyat
E'lonlar peshtaxtasi: Masjid tadbirlari, ehson ehtiyojlari va karta raqamlar (to'lov tizimisiz, faqat ma'lumot).

Challenge bo'limi: "1 haftada 1 million Istig'for". Har bir foydalanuvchi o'z hissasini qo'shadi va umumiy hisoblagich real vaqtda yangilanadi.

Maqola va Duolar: Kundalik o'qiladigan duolar, Qur’on oyatlari tafsiri (admin tomonidan yangilanadi).

Namoz vaqtlari: Haftalik kiritilgan vaqtlar asosida bot namozdan oldin eslatma yuboradi.

🚀 Hamkorlar (Reklama)
Fazo Firmasi: Botning pastki qismida yoki "Hamkorlar" bo'limida firmaning logotipi, faoliyati haqida qisqacha ma'lumot va ijtimoiy tarmoqlarga havolalari joylashtiriladi.

📋 4. Admin uchun Sozlamalar (Dashboard)
Admin quyidagilarni boshqara oladi:

Xatm sozlamalari: Boshlanish/tugash sanasi va vaqti.

Kontent: Kunlik tafsir oyatlari va maqolalarni rejalashtirish (Scheduler).

Foydalanuvchilar: Qo'ng'iroq qilish kerak bo'lganlar ro'yxatini yuklab olish.

Namoz vaqtlari: Haftalik jadvalni PDF yoki matn ko'rinishida kiritish.

🛠 5. Texnik Stack (Tavsiya)
Frontend: React.js yoki Vue.js (Telegram Web App uchun).

Backend: Python (Aiogram 3.x) yoki Node.js.

Ma'lumotlar bazasi: PostgreSQL (foydalanuvchilar va xatm rekordi uchun).

Server: Docker orqali deploy qilish.
