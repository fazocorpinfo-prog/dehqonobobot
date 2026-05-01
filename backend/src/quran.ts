/**
 * Qur'on tuzilishi yordamchilari (604 betlik standart Madina mushafi).
 */

// 30 juz (pora) boshlanish betlari (Madina mushafi). Oxirgi pora 582-betdan boshlanadi.
export const JUZ_START_PAGES: number[] = [
  1,    // 1
  22,   // 2
  42,   // 3
  62,   // 4
  82,   // 5
  102,  // 6
  121,  // 7
  142,  // 8
  162,  // 9
  182,  // 10
  201,  // 11
  222,  // 12
  242,  // 13
  262,  // 14
  282,  // 15
  302,  // 16
  322,  // 17
  342,  // 18
  362,  // 19
  382,  // 20
  402,  // 21
  422,  // 22
  442,  // 23
  462,  // 24
  482,  // 25
  502,  // 26
  522,  // 27
  542,  // 28
  562,  // 29
  582,  // 30
];

export const TOTAL_PAGES = 604;

export function juzForPage(page: number): number {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (page >= JUZ_START_PAGES[i]) return i + 1;
  }
  return 1;
}

/**
 * Berilgan betdan boshlab yaxlitlangan oxirgi betni topadi.
 * `desiredPages` - taxminiy bet soni. Natija pora oxirigacha yetib borishi mumkin
 * agar pora oxiri yaqin bo'lsa, yoki 5 ga yaxlitlanadi.
 */
export function roundEndPage(startPage: number, desiredPages: number, maxPage = TOTAL_PAGES): number {
  if (desiredPages <= 0) return startPage;
  const naiveEnd = Math.min(startPage + desiredPages - 1, maxPage);

  // Agar yaqin orada pora yakuni bor bo'lsa, shu yakungacha cho'ziltiramiz (yoki kesamiz)
  const tolerance = Math.max(3, Math.floor(desiredPages * 0.25)); // ±25% yoki min 3 bet
  const candidateBoundaries: number[] = [];
  for (let i = 0; i < JUZ_START_PAGES.length; i++) {
    const juzEnd = (JUZ_START_PAGES[i + 1] ?? maxPage + 1) - 1;
    if (juzEnd >= startPage && juzEnd <= maxPage) {
      candidateBoundaries.push(juzEnd);
    }
  }

  // Eng yaqin pora yakunini topamiz
  for (const b of candidateBoundaries) {
    if (Math.abs(b - naiveEnd) <= tolerance && b >= startPage) {
      return Math.min(b, maxPage);
    }
  }

  // Aks holda 5 ga yaxlitlash (yuqoriga, "sal ko'proq")
  const rounded = Math.min(maxPage, Math.ceil(naiveEnd / 5) * 5);
  return Math.max(startPage, rounded);
}

export function pageRangeLabel(startPage: number, endPage: number): string {
  const j1 = juzForPage(startPage);
  const j2 = juzForPage(endPage);
  if (j1 === j2) {
    return `${startPage}–${endPage}-betlar (${j1}-pora)`;
  }
  return `${startPage}–${endPage}-betlar (${j1}–${j2}-poralar)`;
}
