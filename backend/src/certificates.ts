import PDFDocument from 'pdfkit';
import { getDb } from './db';
import { Khatms, Users, type Khatm, type User } from './db/models';
import { formatPersonName } from './utils';

export interface Certificate {
  id: number;
  user_id: number;
  khatm_id: number | null;
  title: string;
  rank: number | null;
  awarded_at: string;
}

export const Certificates = {
  forUser(userId: number): Certificate[] {
    return getDb()
      .prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY awarded_at DESC')
      .all(userId) as Certificate[];
  },
  byId(id: number): Certificate | undefined {
    return getDb().prepare('SELECT * FROM certificates WHERE id = ?').get(id) as
      | Certificate
      | undefined;
  },
  create(input: { user_id: number; khatm_id: number | null; title: string; rank: number | null }) {
    const info = getDb()
      .prepare(
        `INSERT INTO certificates (user_id, khatm_id, title, rank) VALUES (?, ?, ?, ?)`
      )
      .run(input.user_id, input.khatm_id, input.title, input.rank);
    return Certificates.byId(Number(info.lastInsertRowid))!;
  },
  forKhatm(khatmId: number): Certificate[] {
    return getDb()
      .prepare('SELECT * FROM certificates WHERE khatm_id = ? ORDER BY rank ASC')
      .all(khatmId) as Certificate[];
  },
};

export function topReadersForKhatm(khatmId: number, limit = 10) {
  return getDb()
    .prepare(
      `SELECT u.id, u.first_name, u.last_name, u.age,
              COALESCE(SUM(dr.pages_read), 0) AS total
       FROM users u
       JOIN tasks t ON t.user_id = u.id AND t.khatm_id = ?
       LEFT JOIN daily_reports dr ON dr.task_id = t.id
       WHERE u.role = 'user'
       GROUP BY u.id
       HAVING total > 0
       ORDER BY total DESC
       LIMIT ?`
    )
    .all(khatmId, limit) as Array<{
    id: number;
    first_name: string;
    last_name: string | null;
    age: number | null;
    total: number;
  }>;
}

export function awardCertificatesForKhatm(khatmId: number, topN = 10) {
  const top = topReadersForKhatm(khatmId, topN);
  const created: Certificate[] = [];
  for (let i = 0; i < top.length; i++) {
    const u = top[i];
    const rank = i + 1;
    const existing = getDb()
      .prepare('SELECT id FROM certificates WHERE user_id = ? AND khatm_id = ?')
      .get(u.id, khatmId) as { id: number } | undefined;
    if (existing) continue;
    const title =
      rank === 1
        ? "Eng faol qori - 1-o'rin"
        : rank === 2
          ? "Faol qori - 2-o'rin"
          : rank === 3
            ? "Faol qori - 3-o'rin"
            : `Top-${topN} qatorida (${rank}-o'rin)`;
    created.push(Certificates.create({ user_id: u.id, khatm_id: khatmId, title, rank }));
  }
  return created;
}

export function renderCertificatePdf(certificate: Certificate, user: User, khatm: Khatm | null) {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margin: 40,
  });

  const W = doc.page.width;
  const H = doc.page.height;
  const green = '#047857';
  const goldDark = '#b45309';
  const cream = '#fefce8';

  doc.rect(0, 0, W, H).fill(cream);

  doc.lineWidth(8).strokeColor(green).rect(20, 20, W - 40, H - 40).stroke();
  doc.lineWidth(2).strokeColor(goldDark).rect(34, 34, W - 68, H - 68).stroke();

  doc.fillColor(green).font('Helvetica-Bold').fontSize(14).text(
    "Dehqonbobo Jome Masjidi",
    40,
    60,
    { align: 'center', width: W - 80 }
  );

  doc.fillColor(goldDark).fontSize(40).text('SERTIFIKAT', 40, 120, {
    align: 'center',
    width: W - 80,
  });

  doc.fillColor('#374151').font('Helvetica').fontSize(14).text(
    "Xatmi Qur'on dasturida ishtiroki uchun",
    40,
    180,
    { align: 'center', width: W - 80 }
  );

  doc.fillColor(green).font('Helvetica-Bold').fontSize(32).text(
    formatPersonName(user),
    40,
    220,
    { align: 'center', width: W - 80 }
  );

  const titleText = certificate.title;
  doc.fillColor(goldDark).fontSize(20).text(titleText, 40, 280, {
    align: 'center',
    width: W - 80,
  });

  if (khatm) {
    const start = new Date(khatm.starts_at).toLocaleDateString('uz-UZ');
    const end = new Date(khatm.ends_at).toLocaleDateString('uz-UZ');
    doc.fillColor('#374151').font('Helvetica').fontSize(13).text(
      `${khatm.title} (${start} — ${end})`,
      40,
      320,
      { align: 'center', width: W - 80 }
    );
  }

  doc.fillColor('#4b5563').font('Helvetica-Oblique').fontSize(12).text(
    "\"Sizlarning eng yaxshingiz Qur'onni o'rgangan va o'rgatgandir.\" (Hadis)",
    60,
    370,
    { align: 'center', width: W - 120 }
  );

  const awardedDate = new Date(certificate.awarded_at).toLocaleDateString('uz-UZ');
  doc.fillColor('#374151').font('Helvetica').fontSize(11).text(
    `Topshirilgan sana: ${awardedDate}`,
    40,
    H - 110,
    { align: 'center', width: W - 80 }
  );

  doc.font('Helvetica-Bold').fillColor(green).fontSize(12).text(
    'Imom: ____________________',
    80,
    H - 80,
    { width: 220 }
  );
  doc.text('Masjid muhri', W - 220, H - 80, { width: 140, align: 'right' });

  doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text(
    `Sertifikat #${certificate.id}  ·  Fazo Firmasi tomonidan ishlab chiqilgan tizim`,
    40,
    H - 50,
    { align: 'center', width: W - 80 }
  );

  return doc;
}

export function maybeAwardOnKhatmCompletion(khatmId: number) {
  const k = Khatms.byId(khatmId);
  if (!k) return [];
  return awardCertificatesForKhatm(khatmId, 10);
}

export { Users };
