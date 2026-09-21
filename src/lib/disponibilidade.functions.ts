import { createServerFn } from "@tanstack/react-start";

export type Disponibilidade = {
  /** true quando a agenda do Google está conectada e respondeu */
  conectado: boolean;
  /** Datas (YYYY-MM-DD) sem disponibilidade de motorista */
  bloqueados: string[];
};

const VAZIO: Disponibilidade = { conectado: false, bloqueados: [] };

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Lê a agenda principal do Google (via Lovable Connector Gateway) e devolve os dias
 * marcados como indisponíveis. Regra: qualquer evento de DIA INTEIRO cujo título
 * contenha "bloqueado", "indisponível", "sem motorista", "lotado" ou "folga"
 * bloqueia aquele dia no formulário do site.
 */
export const getDisponibilidade = createServerFn({ method: "GET" }).handler(
  async (): Promise<Disponibilidade> => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["GOOGLE_CALENDAR_API_KEY"];
    if (!lovableKey || !connKey) return VAZIO;

    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 6, hoje.getDate() + 1);

    const params = new URLSearchParams({
      timeMin: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString(),
      timeMax: fim.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
    });

    const url = `https://connector-gateway.lovable.dev/google_calendar/calendar/v3/calendars/primary/events?${params}`;

    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connKey,
        },
      });
      if (!res.ok) {
        console.error(`Google Calendar falhou [${res.status}]: ${await res.text()}`);
        return VAZIO;
      }
      const json = (await res.json()) as {
        items?: { summary?: string; status?: string; start?: { date?: string }; end?: { date?: string } }[];
      };

      const palavras = ["bloquead", "indispon", "sem motorista", "lotad", "folga"];
      const dias = new Set<string>();

      for (const ev of json.items ?? []) {
        if (ev.status === "cancelled") continue;
        const inicio = ev.start?.date;
        const fimEv = ev.end?.date;
        if (!inicio || !fimEv) continue; // só eventos de dia inteiro
        const titulo = (ev.summary ?? "").toLowerCase();
        if (!palavras.some((p) => titulo.includes(p))) continue;
        // end.date é exclusivo no Google Calendar
        for (let d = new Date(`${inicio}T12:00:00`); iso(d) < fimEv; d.setDate(d.getDate() + 1)) {
          dias.add(iso(d));
        }
      }

      return { conectado: true, bloqueados: [...dias].sort() };
    } catch (e) {
      console.error("Erro ao consultar a agenda do Google:", e);
      return VAZIO;
    }
  },
);
