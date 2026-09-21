import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, MessageCircle, Loader2, AlertTriangle, CalendarX } from "lucide-react";
import { CATALOGO, brl, calcularQuote, isAltaTemporada, type CatalogoItem } from "@/lib/catalogo";
import { trackWhatsappClick } from "@/lib/analytics";
import { getDisponibilidade } from "@/lib/disponibilidade.functions";

const WA_NUMBER = "5554994425445";

type Props = { itemId: string | null; onClose: () => void };

type Form = {
  nome: string;
  adultos: number;
  criancas: number;
  trajeto: "ida" | "volta" | "ida-volta";
  aeroporto: string;
  dataChegada: string;
  horaChegada: string;
  vooChegada: string;
  ciaChegada: string;
  dataRetorno: string;
  horaRetorno: string;
  vooRetorno: string;
  hotel: string;
  dataPasseio: string;
  horaPasseio: string;
  tour1Data: string;
  tour1Hora: string;
  tour2Data: string;
  tour2Hora: string;
  obs: string;
};

const initial: Form = {
  nome: "", adultos: 2, criancas: 0, trajeto: "ida-volta", aeroporto: "Salgado Filho (POA)",
  dataChegada: "", horaChegada: "", vooChegada: "", ciaChegada: "",
  dataRetorno: "", horaRetorno: "", vooRetorno: "",
  hotel: "", dataPasseio: "", horaPasseio: "",
  tour1Data: "", tour1Hora: "", tour2Data: "", tour2Hora: "",
  obs: "",
};

/** Pacotes promocionais: quantos city tours estão inclusos */
export const cityToursDoPacote = (id: string) =>
  id === "pacote-combo-3dias" ? 1 : id === "pacote-combo-4dias" ? 2 : 0;

const dataBR = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate());

function dataDoServico(item: CatalogoItem, f: Form) {
  return item.kind === "transfer" ? f.dataChegada || f.dataRetorno : f.dataPasseio;
}

export function buildMessage(item: CatalogoItem, f: Form) {
  const pax = f.adultos + f.criancas;
  const trajetos = item.kind === "transfer" ? (f.trajeto === "ida-volta" ? 2 : 1) : 1;
  const data = dataDoServico(item, f);
  const q = calcularQuote(item, { trajetos, pax, data });

  const L: string[] = [];
  L.push("*NOVA RESERVA — ANTUNES TURISMO*");
  L.push("");
  L.push(`*Serviço:* ${item.nome}`);
  if (item.aviso) L.push(`⚠️ *${item.aviso}*`);
  L.push(`*Capacidade:* ${item.capacidade}`);
  if (q.veiculos && q.veiculos.length) {
    L.push(`*Veículos:* ${q.veiculos.map((v) => `${v.qtd}× ${v.tipo}`).join(" + ")}`);
  }
  if (q.avisoFrota) L.push(`ℹ️ ${q.avisoFrota}`);
  L.push(`*Responsável pela reserva:* ${f.nome}`);
  L.push(`*Passageiros:* ${f.adultos} adulto(s)${f.criancas ? ` e ${f.criancas} criança(s)` : ""}`);

  if (item.kind === "transfer") {
    L.push("");
    L.push("*DADOS DO TRANSFER*");
    L.push(
      `• Trajeto: ${f.trajeto === "ida-volta" ? "Ida e volta (2 trajetos)" : f.trajeto === "ida" ? "Somente ida (chegada)" : "Somente volta (retorno)"}`,
    );
    L.push(`• Aeroporto: ${f.aeroporto}`);
    if (f.trajeto !== "volta") {
      L.push(`• Chegada: ${dataBR(f.dataChegada)} às ${f.horaChegada}`);
      L.push(`• Voo de ida: ${f.vooChegada} — ${f.ciaChegada}`);
    }
    if (f.trajeto !== "ida") {
      L.push(`• Retorno: ${dataBR(f.dataRetorno)} às ${f.horaRetorno}`);
      if (f.vooRetorno) L.push(`• Voo de retorno: ${f.vooRetorno}`);
    }
    L.push(`• Hotel/Endereço em Gramado/Canela: ${f.hotel}`);
  } else {
    L.push("");
    L.push("*DADOS DO PASSEIO*");
    L.push(`• Data desejada: ${dataBR(f.dataPasseio)}${f.horaPasseio ? ` às ${f.horaPasseio}` : ""}`);
    L.push(`• Hotel de embarque: ${f.hotel}`);
  }

  const nTours = cityToursDoPacote(item.id);
  if (nTours > 0) {
    L.push("");
    L.push("*DADOS DO(S) CITY TOUR(S)*");
    L.push(`• City Tour 1: ${dataBR(f.tour1Data)}${f.tour1Hora ? ` — início às ${f.tour1Hora}` : ""}`);
    if (nTours > 1) {
      L.push(`• City Tour 2: ${dataBR(f.tour2Data)}${f.tour2Hora ? ` — início às ${f.tour2Hora}` : ""}`);
    }
  }

  if (f.obs) {
    L.push("");
    L.push(`*Observações:* ${f.obs}`);
  }

  L.push("");
  L.push("*RESUMO FINANCEIRO*");
  if (q.total === null) {
    L.push("• Valores sob consulta — aguardo o orçamento.");
  } else if (q.dividido) {
    L.push(`• *Valor Total do serviço:* ${brl(q.total)}${item.porTrajeto && trajetos > 1 && q.veiculos ? ` (${brl(q.base! / trajetos)} por trajeto × ${trajetos})` : ""}`);
    if (q.altaTemporada > 0) {
      L.push(`• Acréscimo de alta temporada/feriado: ${brl(q.altaTemporada)} (já incluso no total)`);
    }
    L.push(`• *Taxa de Agendamento (30% do valor total):* ${brl(q.sinal)} — pago à agência para garantir a reserva.`);
    L.push(`• *Pagamento direto ao motorista:* ${brl(q.saldoMotorista!)} — pago no dia do serviço.`);
  } else {
    L.push(`• *Valor Total:* ${brl(q.total)}${item.porPessoa && pax > 1 ? ` (${brl(item.total!)} por pessoa × ${pax})` : ""}`);
    if (q.altaTemporada > 0) {
      L.push(`• Acréscimo de alta temporada/feriado: ${brl(q.altaTemporada)} (já incluso no total)`);
    }
    L.push("• Pagamento integral à agência — este serviço não possui pagamento ao motorista.");
  }
  L.push("");
  L.push("Aguardo a confirmação da disponibilidade e as instruções para pagamento. Obrigado!");

  return L.join("\n");
}


export default function BookingModal({ itemId, onClose }: Props) {
  const item = itemId ? CATALOGO[itemId] : null;
  const [f, setF] = useState<Form>(initial);
  const [sending, setSending] = useState(false);

  const { data: disp } = useQuery({
    queryKey: ["disponibilidade"],
    queryFn: () => getDisponibilidade(),
    staleTime: 5 * 60_000,
  });
  const diasBloqueados = disp?.bloqueados ?? [];

  useEffect(() => {
    if (itemId) setF(initial);
  }, [itemId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const pax = f.adultos + f.criancas;
  const trajetos = item.kind === "transfer" ? (f.trajeto === "ida-volta" ? 2 : 1) : 1;
  const dataServico = item.kind === "transfer" ? f.dataChegada || f.dataRetorno : f.dataPasseio;
  const q = calcularQuote(item, { trajetos, pax, data: dataServico });
  const alta = isAltaTemporada(dataServico);

  // Limites do calendário: mínimo amanhã (1 dia de antecedência), máximo 6 meses.
  const hojeISO = toISO(new Date());
  const minISO = toISO(addDays(new Date(), 1));
  const maxISO = toISO(addMonths(new Date(), 6));
  const nTours = cityToursDoPacote(item.id);
  const datasTours = [f.tour1Data, nTours > 1 ? f.tour2Data : ""].filter(Boolean);
  const datasEscolhidas = [f.dataChegada, f.dataRetorno, f.dataPasseio, ...datasTours].filter(Boolean);
  const temHoje = datasEscolhidas.some((d) => d === hojeISO);
  const foraDoPrazo = datasEscolhidas.some((d) => d < hojeISO || d > maxISO);
  const datasIndisponiveis = datasEscolhidas.filter((d) => diasBloqueados.includes(d));
  // City tour precisa acontecer entre a chegada e o retorno (período da estadia)
  const foraDaEstadia =
    nTours > 0 &&
    datasTours.some(
      (d) => (f.dataChegada && d < f.dataChegada) || (f.dataRetorno && d > f.dataRetorno),
    );
  const bloqueado = temHoje || foraDoPrazo || datasIndisponiveis.length > 0 || foraDaEstadia;

  const proximosBloqueios = diasBloqueados.filter((d) => d >= minISO && d <= maxISO).slice(0, 8);

  const urlWhatsappUrgente = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    `Olá! Preciso de ${item.nome} para HOJE (${dataBR(hojeISO)}). Passageiros: ${pax}. Podem verificar a disponibilidade imediata de motorista?`,
  )}`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;
    setSending(true);
    trackWhatsappClick(`reserva:${item.id}`);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage(item, f))}`;
    window.open(url, "_blank", "noopener");
    setSending(false);
    onClose();
  };

  const label = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
  const input =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-wine focus:ring-1 focus:ring-wine";

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Formulário de reserva — ${item.nome}`}
        className="relative my-8 w-full max-w-2xl rounded-2xl bg-cream shadow-elegant"
      >
        <div className="flex items-start justify-between gap-4 rounded-t-2xl bg-wine px-6 py-5 text-cream">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Formulário de Reserva</div>
            <h3 className="font-display text-2xl font-bold">{item.nome}</h3>
            <p className="text-sm text-cream/75">{item.descricaoCurta} · {item.capacidade}</p>
            {item.aviso && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                <AlertTriangle className="h-3.5 w-3.5" /> {item.aviso}
              </p>
            )}
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hover:bg-cream/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label className={label} htmlFor="nome">Nome do responsável pela reserva *</label>
            <input id="nome" required value={f.nome} onChange={(e) => set("nome", e.target.value)} className={input} placeholder="Nome completo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label} htmlFor="adultos">Adultos *</label>
              <input id="adultos" type="number" min={1} required value={f.adultos}
                onChange={(e) => set("adultos", Number(e.target.value))} className={input} />
            </div>
            <div>
              <label className={label} htmlFor="criancas">Crianças</label>
              <input id="criancas" type="number" min={0} value={f.criancas}
                onChange={(e) => set("criancas", Number(e.target.value))} className={input} />
            </div>
          </div>

          {item.kind === "transfer" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="trajeto">Trajeto *</label>
                  <select id="trajeto" value={f.trajeto} onChange={(e) => set("trajeto", e.target.value as Form["trajeto"])} className={input}>
                    <option value="ida-volta">Ida e volta (2 trajetos)</option>
                    <option value="ida">Somente ida (chegada)</option>
                    <option value="volta">Somente volta (retorno)</option>
                  </select>
                </div>
                <div>
                  <label className={label} htmlFor="aeroporto">Aeroporto de chegada/partida *</label>
                  <select id="aeroporto" value={f.aeroporto} onChange={(e) => set("aeroporto", e.target.value)} className={input}>
                    <option>Salgado Filho (POA)</option>
                    <option>Aeroporto de Caxias do Sul (CXJ)</option>
                    <option>Aeroporto Regional de Gramado/Canela</option>
                    <option>Outro (informar no WhatsApp)</option>
                  </select>
                </div>
              </div>

              {f.trajeto !== "volta" && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold text-wine">Voo de chegada (ida)</div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="dataChegada">Data do voo *</label>
                      <input id="dataChegada" type="date" min={minISO} max={maxISO} required value={f.dataChegada} onChange={(e) => set("dataChegada", e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label} htmlFor="horaChegada">Horário exato *</label>
                      <input id="horaChegada" type="time" required value={f.horaChegada} onChange={(e) => set("horaChegada", e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label} htmlFor="vooChegada">Número do voo *</label>
                      <input id="vooChegada" required value={f.vooChegada} onChange={(e) => set("vooChegada", e.target.value)} className={input} placeholder="Ex.: LA3456" />
                    </div>
                    <div>
                      <label className={label} htmlFor="ciaChegada">Companhia aérea *</label>
                      <input id="ciaChegada" required value={f.ciaChegada} onChange={(e) => set("ciaChegada", e.target.value)} className={input} placeholder="Ex.: LATAM" />
                    </div>
                  </div>
                </div>
              )}

              {f.trajeto !== "ida" && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold text-wine">Voo de retorno</div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className={label} htmlFor="dataRetorno">Data *</label>
                      <input id="dataRetorno" type="date" min={minISO} max={maxISO} required value={f.dataRetorno} onChange={(e) => set("dataRetorno", e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label} htmlFor="horaRetorno">Horário *</label>
                      <input id="horaRetorno" type="time" required value={f.horaRetorno} onChange={(e) => set("horaRetorno", e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label} htmlFor="vooRetorno">Número do voo</label>
                      <input id="vooRetorno" value={f.vooRetorno} onChange={(e) => set("vooRetorno", e.target.value)} className={input} placeholder="Ex.: G31234" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className={label} htmlFor="hotel">Hotel ou endereço em Gramado/Canela *</label>
                <input id="hotel" required value={f.hotel} onChange={(e) => set("hotel", e.target.value)} className={input} placeholder="Nome do hotel, rua e número" />
              </div>

              {nTours > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold text-wine">
                    {nTours > 1 ? "City Tours inclusos no pacote" : "City Tour incluso no pacote"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Escolha datas e horários dentro do período da sua estadia (entre a chegada e o retorno).
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label} htmlFor="tour1Data">Data do City Tour {nTours > 1 ? "1" : ""} *</label>
                      <input id="tour1Data" type="date" min={f.dataChegada || minISO} max={f.dataRetorno || maxISO} required
                        value={f.tour1Data} onChange={(e) => set("tour1Data", e.target.value)} className={input} />
                    </div>
                    <div>
                      <label className={label} htmlFor="tour1Hora">Horário de início *</label>
                      <input id="tour1Hora" type="time" required value={f.tour1Hora} onChange={(e) => set("tour1Hora", e.target.value)} className={input} />
                    </div>
                    {nTours > 1 && (
                      <>
                        <div>
                          <label className={label} htmlFor="tour2Data">Data do City Tour 2 *</label>
                          <input id="tour2Data" type="date" min={f.dataChegada || minISO} max={f.dataRetorno || maxISO} required
                            value={f.tour2Data} onChange={(e) => set("tour2Data", e.target.value)} className={input} />
                        </div>
                        <div>
                          <label className={label} htmlFor="tour2Hora">Horário de início *</label>
                          <input id="tour2Hora" type="time" required value={f.tour2Hora} onChange={(e) => set("tour2Hora", e.target.value)} className={input} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor="dataPasseio">Data desejada *</label>
                  <input id="dataPasseio" type="date" min={minISO} max={maxISO} required value={f.dataPasseio} onChange={(e) => set("dataPasseio", e.target.value)} className={input} />
                </div>
                <div>
                  <label className={label} htmlFor="horaPasseio">Horário de preferência</label>
                  <input id="horaPasseio" type="time" value={f.horaPasseio} onChange={(e) => set("horaPasseio", e.target.value)} className={input} />
                </div>
              </div>
              <div>
                <label className={label} htmlFor="hotelTour">Hotel de embarque *</label>
                <input id="hotelTour" required value={f.hotel} onChange={(e) => set("hotel", e.target.value)} className={input} placeholder="Nome do hotel em Gramado/Canela" />
              </div>
            </>
          )}

          <div>
            <label className={label} htmlFor="obs">Observações (opcional)</label>
            <textarea id="obs" rows={2} value={f.obs} onChange={(e) => set("obs", e.target.value)} className={input} placeholder="Bagagens, cadeirinha, necessidades especiais..." />
          </div>

          <div className="rounded-xl border border-wine/20 bg-wine/5 p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-wine">Resumo financeiro</div>
            {q.avisoFrota && (
              <p className="mt-2 flex items-start gap-2 rounded-lg bg-gold/15 p-2.5 text-xs font-medium text-wine">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {q.avisoFrota}
              </p>
            )}
            {q.total === null ? (
              <p className="mt-2 text-sm text-muted-foreground">Valores sob consulta — enviaremos o orçamento pelo WhatsApp.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {q.veiculos && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Veículos</span>
                    <span>{q.veiculos.map((v) => `${v.qtd}× ${v.tipo}`).join(" + ")}</span>
                  </li>
                )}
                <li className="flex justify-between"><span>Valor total do serviço</span><strong className="text-wine">{brl(q.total)}</strong></li>
                {alta && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Alta temporada / feriado (já incluso)</span><span>+ {brl(q.altaTemporada)}</span>
                  </li>
                )}
                {q.dividido ? (
                  <>
                    <li className="flex justify-between">
                      <span>Taxa de agendamento (30% do valor total)</span>
                      <strong className="text-forest">{brl(q.sinal)}</strong>
                    </li>
                    <li className="flex justify-between border-t border-border pt-2">
                      <span>Pagamento direto ao motorista no dia</span><strong>{brl(q.saldoMotorista!)}</strong>
                    </li>
                  </>
                ) : (
                  <li className="border-t border-border pt-2 text-muted-foreground">
                    Pagamento integral à agência — sem taxa de agendamento e sem pagamento ao motorista.
                  </li>
                )}
              </ul>
            )}
          </div>


          {disp?.conectado && proximosBloqueios.length > 0 && (
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <CalendarX className="h-3.5 w-3.5" /> Datas sem motorista disponível
              </p>
              <p className="mt-1.5 text-sm text-foreground">{proximosBloqueios.map(dataBR).join(" · ")}</p>
            </div>
          )}

          {bloqueado && (
            <div className="rounded-xl border-2 border-gold bg-gold/15 p-4">
              <p className="flex items-start gap-2 text-sm font-semibold text-wine">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {temHoje
                  ? "Para transfers no mesmo dia, por favor, entre em contato diretamente pelo WhatsApp para verificarmos a disponibilidade imediata de motoristas."
                  : datasIndisponiveis.length > 0
                    ? `Sem motorista disponível em ${datasIndisponiveis.map(dataBR).join(" e ")}. Escolha outra data ou fale conosco pelo WhatsApp.`
                    : foraDaEstadia
                      ? "As datas do City Tour precisam ficar entre a data de chegada e a data de retorno."
                      : "Escolha uma data a partir de amanhã e dentro dos próximos 6 meses."}
              </p>
              {(temHoje || datasIndisponiveis.length > 0) && (
                <a
                  href={urlWhatsappUrgente}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsappClick(`urgente:${item.id}`)}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Falar agora pelo WhatsApp
                </a>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-background transition">
              Cancelar
            </button>
            {!bloqueado && (
              <button type="submit" disabled={sending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                Enviar reserva pelo WhatsApp
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
