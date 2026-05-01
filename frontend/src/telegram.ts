// Telegram Web App SDK wrapperi
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: any;
        themeParams: any;
        colorScheme: 'light' | 'dark';
        MainButton: any;
        BackButton: any;
        HapticFeedback: { impactOccurred: (style: string) => void };
        showAlert: (msg: string) => void;
        showConfirm: (msg: string, cb: (ok: boolean) => void) => void;
        close: () => void;
      };
    };
  }
}

export const tg = () => window.Telegram?.WebApp;

export function initTelegram() {
  const t = tg();
  if (t) {
    t.ready();
    t.expand();
  }
}

export function getInitData(): string {
  return tg()?.initData ?? '';
}

export function getTelegramUser() {
  const real = tg()?.initDataUnsafe?.user;
  if (real) return real as { id: number; first_name?: string; last_name?: string; username?: string };
  // Dev rejim: brauzerdan ?tgid=... bilan kirish (faqat localhost'da test uchun)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const stored = localStorage.getItem('dev_tgid');
    const id = params.get('tgid') ?? stored;
    if (id) {
      if (params.get('tgid')) localStorage.setItem('dev_tgid', id);
      return { id: Number(id), first_name: 'Dev' };
    }
  }
  return undefined;
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  tg()?.HapticFeedback?.impactOccurred(style);
}

export {};
