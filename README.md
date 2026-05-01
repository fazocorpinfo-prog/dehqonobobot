# Dehqonbobo Jome masjidi - Xatmi Qur'on Web Bot

Telegram Web App orqali xatmi Qur'on jarayonini raqamlashtirish, motivatsiya va admin boshqaruvi uchun bot.

## Stack

- **Backend:** Node.js + TypeScript + Telegraf (bot) + Express (API) + better-sqlite3 + node-cron
- **Frontend:** React + Vite + TypeScript + Tailwind (emerald yashil tema) + Telegram WebApp SDK
- **DB:** SQLite (data/khatm.db)

## Funksiyalar

- Ro'yxatdan o'tish (ism, yosh, kunlik o'qish quvvati)
- Aqlli vazifa taqsimoti (yaxlitlash + kech qo'shilganlar uchun moslashish)
- Kunlik eslatma + Qur'ondan oyat va tafsir
- SOS - vazifani kamaytirish (qolganlar zaxiraga)
- Raqamli bog' (gamification - daraxt o'sishi/qurib qolishi)
- Leaderboard (haftalik / oylik / yosh bo'yicha)
- Sertifikat (PDF) — xatm tugaganda top-10 qoriga avtomatik beriladi, foydalanuvchi profilidan yuklab oladi
- E'lonlar peshtaxtasi + xayriya kartalari
- Challenge (1 haftada 1 mln Istig'for kabi)
- Namoz vaqtlari + eslatma
- Maqolalar va duolar
- To'liq admin panel (Web App ichida): xatm sozlamalari, foydalanuvchilar, kontent, namoz vaqtlari
- Foydalanuvchilarni muzlatish/bloklash + qo'ng'iroq ro'yxatini CSV yuklab olish
- Hisobot bermaganlarga ogohlantirish, 2+ kun jim bo'lganlar uchun adminga signal

## O'rnatish

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# .env ichida BOT_TOKEN, ADMIN_IDS, WEBAPP_URL ni to'ldiring
npm run db:init
npm run db:seed
npm run dev
```

API: `http://localhost:3001`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Web App: `http://localhost:5173`

### 3. Telegram bot sozlash

1. [@BotFather](https://t.me/BotFather) dan token oling.
2. `/setdomain` orqali Web App domeningizni belgilang (yoki `/newapp` orqali Mini App yarating).
3. `.env` ichida `WEBAPP_URL` ni ommaviy URL'ga o'rnating (deploy qilingandan so'ng).
4. `ADMIN_IDS` ga o'z Telegram raqamingizni yozing.

### 4. Test rejimi (Telegram'siz)

Frontendni brauzerda ochsangiz, Telegram WebApp SDK ishlamaydi. Bu holda dev rejimida `X-Telegram-Id` header orqali kirish ochiq qoldirilgan (`backend/src/auth.ts`). Brauzerda `localhost:5173` ochsangiz, avtomatik `null` user qaytadi - ro'yxatdan o'tish formasi ko'rinadi.

Production'da bu yo'nalish faqat haqiqiy Telegram initData orqali ishlaydi.

## Tuzilma

```
backend/
  src/
    bot/index.ts        # Telegraf handlerlar
    db/                 # schema + models
    api.ts              # REST API
    distribution.ts     # vazifa taqsimoti algoritmi
    quran.ts            # 30 pora bilan yaxlitlash
    scheduler.ts        # cron - kunlik eslatmalar, namoz, bog' decay
    auth.ts             # Telegram initData verify
    config.ts
    index.ts
frontend/
  src/
    pages/              # Home, Garden, Leaderboard, Announcements, Challenges, Articles, Profile, PrayerTimes, Register
    admin/              # AdminLayout, Dashboard, Khatms, Users, Content, AdminPrayerTimes
    components/Layout.tsx
    api.ts, telegram.ts, App.tsx, main.tsx
doc/
  raw detail.md, umumiy.md
```

## Production deploy (qisqa)

1. Backend: VPS yoki shunga o'xshash server, PM2/systemd bilan `npm run build && npm start`. Reverse proxy (nginx) orqali HTTPS.
2. Frontend: `npm run build` -> `dist/` ni statik hosting (nginx, Cloudflare Pages, Vercel) orqali ulang.
3. `WEBAPP_URL` ni shu domenga belgilang.
4. BotFather'da Web App URL'ni shu domenga ulang.

## Ishlab chiquvchi

**Fazo Firmasi** - botning pastida va e'lonlar bo'limida reklama ko'rsatiladi.

## Litsenziya

Masjid ichidagi loyiha sifatida ishlatish uchun.
