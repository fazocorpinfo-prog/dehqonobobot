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
  return tg()?.initDataUnsafe?.user as
    | { id: number; first_name?: string; last_name?: string; username?: string }
    | undefined;
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  tg()?.HapticFeedback?.impactOccurred(style);
}

export {};
