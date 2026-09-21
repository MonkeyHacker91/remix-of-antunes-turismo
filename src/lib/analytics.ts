// Lightweight WhatsApp click tracking.
// Sends events to any analytics platform present on window:
// - Google Analytics 4 / GTM (gtag + dataLayer)
// - Meta Pixel (fbq)
// Always keeps a local counter in localStorage so you can inspect
// conversions even before an external analytics tool is connected.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "antunes_wa_clicks_v1";

type ClickRecord = {
  total: number;
  byLocation: Record<string, number>;
  lastAt: string | null;
};

function readStore(): ClickRecord {
  if (typeof window === "undefined") return { total: 0, byLocation: {}, lastAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0, byLocation: {}, lastAt: null };
    return JSON.parse(raw) as ClickRecord;
  } catch {
    return { total: 0, byLocation: {}, lastAt: null };
  }
}

function writeStore(rec: ClickRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
  } catch {
    /* ignore quota errors */
  }
}

export function trackWhatsappClick(location: string) {
  if (typeof window === "undefined") return;

  const rec = readStore();
  rec.total += 1;
  rec.byLocation[location] = (rec.byLocation[location] ?? 0) + 1;
  rec.lastAt = new Date().toISOString();
  writeStore(rec);

  // Google Analytics 4 / Google Tag Manager
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "whatsapp_click",
    click_location: location,
    total_clicks: rec.total,
  });
  window.gtag?.("event", "whatsapp_click", {
    event_category: "engagement",
    event_label: location,
    value: 1,
  });

  // Meta Pixel (Facebook / Instagram Ads)
  window.fbq?.("track", "Contact", { source: "whatsapp", location });

  if (import.meta.env.DEV) {
    // Visible in the browser console during development.
     
    console.info("[analytics] whatsapp_click", { location, total: rec.total });
  }
}

export function getWhatsappStats(): ClickRecord {
  return readStore();
}

export function resetWhatsappStats() {
  writeStore({ total: 0, byLocation: {}, lastAt: null });
}

// Expose helpers on window so the site owner can inspect stats
// from the browser console: `__antunesStats()` / `__antunesStatsReset()`.
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__antunesStats = getWhatsappStats;
  (window as unknown as Record<string, unknown>).__antunesStatsReset = resetWhatsappStats;
}
