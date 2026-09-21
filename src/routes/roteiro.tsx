import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Sparkles,
  MessageCircle,
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Download,
} from "lucide-react";
import { trackWhatsappClick } from "@/lib/analytics";

const WA = "https://wa.me/5554994425445";

type Atividade = { id: string; hora: string; titulo: string; desc: string };
type DiaModelo = { titulo: string; destaque?: boolean; atividades: Atividade[] };

const DIAS_GRAMADO: Record<string, DiaModelo> = {
  CHEGADA: {
    titulo: "Chegada na Serra Gaúcha",
    atividades: [
      {
        id: "c1",
        hora: "Chegada",
        titulo: "Recepção / Transfer Antunes",
        desc: "Translado seguro até o hotel.",
      },
      { id: "c2", hora: "Noite", titulo: "Jantar no Centro", desc: "Rua Coberta de Gramado." },
    ],
  },
  CITY_TOUR: {
    titulo: "City Tour Canela & Olivas Sunset (Antunes)",
    destaque: true,
    atividades: [
      {
        id: "ct1",
        hora: "08:15",
        titulo: "Saída Hotel - Antunes Turismo",
        desc: "Saída pontual para otimizar o dia.",
      },
      {
        id: "ct2",
        hora: "09:30",
        titulo: "Skyglass Canela",
        desc: "Plataforma de vidro. (Ingressos com Antunes).",
      },
      {
        id: "ct3",
        hora: "11:00",
        titulo: "Bondinhos Aéreos",
        desc: "Vista Cascata. 1h duração. (Ingressos com Antunes).",
      },
      {
        id: "ct4",
        hora: "12:15",
        titulo: "Almoço: Garfo e Bombacha",
        desc: "Churrasco típico. (Ingressos com Antunes).",
      },
      {
        id: "ct5",
        hora: "13:45",
        titulo: "Vinícola Jolimont",
        desc: "Tour e degustação no vale (2h).",
      },
      {
        id: "ct6",
        hora: "15:45",
        titulo: "Salamaria Família Chaulet",
        desc: "Parada rápida para produtos coloniais.",
      },
      {
        id: "ct7",
        hora: "16:15",
        titulo: "Olivas de Gramado",
        desc: "Pôr do Sol. 3h duração. (Ingressos com Antunes).",
      },
    ],
  },
  AFASTADOS: {
    titulo: "Tour Parques & Aventuras - Antunes Turismo",
    destaque: true,
    atividades: [
      {
        id: "ta1",
        hora: "09:00",
        titulo: "Saída Hotel - Antunes Turismo",
        desc: "Tour pelos parques afastados.",
      },
      {
        id: "ta2",
        hora: "09:30",
        titulo: "Alpen Park (Canela)",
        desc: "Entrada Free. (Passaporte com Antunes).",
      },
      {
        id: "ta3",
        hora: "13:00",
        titulo: "Almoço Temático",
        desc: "Sugestão na estrada Canela-Gramado.",
      },
      {
        id: "ta4",
        hora: "14:30",
        titulo: "Space Adventure (NASA)",
        desc: "Museu NASA. (Ingressos com Antunes).",
      },
      {
        id: "ta5",
        hora: "16:30",
        titulo: "Terra Mágica Florybal",
        desc: "Aniversariante Free! (Ingressos com Antunes).",
      },
    ],
  },
  BENTO: {
    titulo: "Tour Uva e Vinho: Maria Fumaça & Epopeia",
    destaque: true,
    atividades: [
      {
        id: "b1",
        hora: "07:00",
        titulo: "Transfer Bento - Antunes Turismo",
        desc: "Transporte exclusivo para o passeio (Reserve com Antunes).",
      },
      {
        id: "b2",
        hora: "09:00",
        titulo: "Epopeia Italiana (Giordani)",
        desc: "Parque temático da imigração.",
      },
      {
        id: "b3",
        hora: "11:00",
        titulo: "Trem Maria Fumaça",
        desc: "Pacote Giordani: Trem + Degustações (Reserve com Antunes).",
      },
      { id: "b4", hora: "13:00", titulo: "Almoço Italiano", desc: "Rodízio de massas e galetos." },
      { id: "b5", hora: "15:00", titulo: "Compras e Vinícolas", desc: "Visita a malharias." },
    ],
  },
  LIVRE: {
    titulo: "Dia Livre no Centro de Gramado",
    atividades: [
      { id: "l1", hora: "09:00", titulo: "Mini Mundo", desc: "A pé ou Uber. (Ingressos com Antunes)." },
      { id: "l2", hora: "11:00", titulo: "Lago Negro", desc: "Caminhada e pedalinhos." },
      {
        id: "l3",
        hora: "13:00",
        titulo: "Almoço na Rua Coberta",
        desc: "Coração gastronômico de Gramado.",
      },
      {
        id: "l4",
        hora: "15:30",
        titulo: "Rua Torta & Praça das Etnias",
        desc: "Fotos clássicas (A pé).",
      },
    ],
  },
  RETORNO: {
    titulo: "Retorno",
    atividades: [
      { id: "r1", hora: "Manhã", titulo: "Últimas Compras", desc: "Artesanato e chocolates." },
      { id: "r2", hora: "Saída", titulo: "Transfer Aeroporto", desc: "Retorno com Antunes Turismo." },
    ],
  },
};

const POOL_DIAS: DiaModelo[] = [
  DIAS_GRAMADO.CHEGADA,
  DIAS_GRAMADO.CITY_TOUR,
  DIAS_GRAMADO.AFASTADOS,
  DIAS_GRAMADO.BENTO,
  DIAS_GRAMADO.LIVRE,
];

type DiaRoteiro = DiaModelo & { key: string };

let seq = 0;
const novoDia = (modelo: DiaModelo): DiaRoteiro => {
  const key = `dia-${++seq}`;
  return {
    ...modelo,
    key,
    atividades: modelo.atividades.map((a, i) => ({ ...a, id: `${key}::${a.id}-${i}` })),
  };
};

const HORA_RANK = (hora: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (!m) return Number.POSITIVE_INFINITY;
  return Number(m[1]) * 60 + Number(m[2]);
};

const hojeISO = () => {
  const d = new Date();
  const mes = `${d.getMonth() + 1}`.padStart(2, "0");
  const dia = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

const somarDias = (iso: string, dias: number) => {
  const [y, m, d] = iso.split("-").map(Number);
  const base = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  base.setUTCDate(base.getUTCDate() + dias);
  return base.toISOString().slice(0, 10);
};

const diffDias = (inicio: string, fim: string) => {
  const a = Date.parse(`${inicio}T00:00:00Z`);
  const b = Date.parse(`${fim}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
};

const formatarData = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
};

export const Route = createFileRoute("/roteiro")({
  head: () => ({
    meta: [
      { title: "Planejador de Roteiros na Serra Gaúcha | Antunes Turismo" },
      {
        name: "description",
        content:
          "Monte seu roteiro dia por dia em Gramado, Canela e Bento Gonçalves: arraste os dias e as atividades, edite os horários e envie tudo para a Antunes Turismo pelo WhatsApp.",
      },
      { property: "og:title", content: "Planejador de Roteiros Inteligente | Antunes Turismo" },
      {
        property: "og:description",
        content: "Arraste, edite horários e organize seus dias na Serra Gaúcha e receba um orçamento pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanejadorPage,
});

function PlanejadorPage() {
  const [dias, setDias] = useState<DiaRoteiro[]>(() => [
    novoDia(DIAS_GRAMADO.CHEGADA),
    novoDia(DIAS_GRAMADO.CITY_TOUR),
    novoDia(DIAS_GRAMADO.BENTO),
    novoDia(DIAS_GRAMADO.RETORNO),
  ]);

  const [dataChegada, setDataChegada] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");

  const totalDiasViagem = useMemo(() => {
    if (!dataChegada || !dataRetorno) return null;
    const d = diffDias(dataChegada, dataRetorno);
    if (d === null || d < 0) return null;
    return d + 1;
  }, [dataChegada, dataRetorno]);

  const ajustarAosDias = (total: number) =>
    setDias((atual) => {
      if (total === atual.length) return atual;
      if (total < atual.length) {
        const cortado = atual.slice(0, total);
        // mantém o dia de retorno no fim quando possível
        const ultimo = atual[atual.length - 1];
        if (total > 1 && ultimo.titulo === DIAS_GRAMADO.RETORNO.titulo) {
          cortado[cortado.length - 1] = ultimo;
        }
        return cortado;
      }
      const novos = [...atual];
      const retorno =
        novos.length && novos[novos.length - 1].titulo === DIAS_GRAMADO.RETORNO.titulo
          ? novos.pop()
          : undefined;
      while (novos.length < total - (retorno ? 1 : 0)) {
        novos.push(novoDia(DIAS_GRAMADO.LIVRE));
      }
      if (retorno) novos.push(retorno);
      while (novos.length < total) novos.push(novoDia(DIAS_GRAMADO.LIVRE));
      return novos;
    });

  const aplicarDatas = (chegada: string, retorno: string) => {
    const d = chegada && retorno ? diffDias(chegada, retorno) : null;
    if (d !== null && d >= 0) ajustarAosDias(d + 1);
  };

  const baixarRoteiro = () => {
    const blob = new Blob([mensagem], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-antunes-turismo${dataChegada ? `-${dataChegada}` : ""}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const isDiaId = (id: string) => dias.some((d) => d.key === id);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // Reordenar dias
    if (isDiaId(activeId)) {
      if (!isDiaId(overId)) return;
      setDias((atual) => {
        const from = atual.findIndex((d) => d.key === activeId);
        const to = atual.findIndex((d) => d.key === overId);
        if (from < 0 || to < 0) return atual;
        return arrayMove(atual, from, to);
      });
      return;
    }

    // Mover atividades (mesmo dia ou entre dias)
    setDias((atual) => {
      const fromDia = atual.findIndex((d) => d.atividades.some((a) => a.id === activeId));
      if (fromDia < 0) return atual;
      const toDia = isDiaId(overId)
        ? atual.findIndex((d) => d.key === overId)
        : atual.findIndex((d) => d.atividades.some((a) => a.id === overId));
      if (toDia < 0) return atual;

      const copia = atual.map((d) => ({ ...d, atividades: [...d.atividades] }));
      const fromIndex = copia[fromDia].atividades.findIndex((a) => a.id === activeId);

      if (fromDia === toDia) {
        const toIndex = copia[toDia].atividades.findIndex((a) => a.id === overId);
        if (toIndex < 0) return atual;
        copia[fromDia].atividades = arrayMove(copia[fromDia].atividades, fromIndex, toIndex);
        return copia;
      }

      const [movida] = copia[fromDia].atividades.splice(fromIndex, 1);
      const toIndex = isDiaId(overId)
        ? copia[toDia].atividades.length
        : copia[toDia].atividades.findIndex((a) => a.id === overId);
      copia[toDia].atividades.splice(toIndex < 0 ? copia[toDia].atividades.length : toIndex, 0, movida);
      return copia;
    });
  }

  const adicionar = (modelo: DiaModelo) => setDias((a) => [...a, novoDia(modelo)]);
  const remover = (key: string) => setDias((a) => a.filter((d) => d.key !== key));
  const adicionarRetorno = () => adicionar(DIAS_GRAMADO.RETORNO);

  const atualizarAtividade = (diaKey: string, id: string, campos: Partial<Atividade>) =>
    setDias((atual) =>
      atual.map((d) =>
        d.key !== diaKey
          ? d
          : { ...d, atividades: d.atividades.map((a) => (a.id === id ? { ...a, ...campos } : a)) },
      ),
    );

  const removerAtividade = (diaKey: string, id: string) =>
    setDias((atual) =>
      atual.map((d) =>
        d.key !== diaKey ? d : { ...d, atividades: d.atividades.filter((a) => a.id !== id) },
      ),
    );

  const adicionarAtividade = (diaKey: string) =>
    setDias((atual) =>
      atual.map((d) =>
        d.key !== diaKey
          ? d
          : {
              ...d,
              atividades: [
                ...d.atividades,
                {
                  id: `${diaKey}::extra-${++seq}`,
                  hora: "12:00",
                  titulo: "Nova atividade",
                  desc: "Descreva o que você quer fazer.",
                },
              ],
            },
      ),
    );

  const ordenarPorHorario = (diaKey: string) =>
    setDias((atual) =>
      atual.map((d) =>
        d.key !== diaKey
          ? d
          : {
              ...d,
              atividades: [...d.atividades].sort((a, b) => HORA_RANK(a.hora) - HORA_RANK(b.hora)),
            },
      ),
    );

  const mensagem = useMemo(() => {
    const linhas = [
      "Olá, Antunes Turismo! Montei meu roteiro no site e gostaria de um orçamento.",
      "",
      `Roteiro de ${dias.length} ${dias.length === 1 ? "dia" : "dias"} na Serra Gaúcha:`,
    ];
    if (dataChegada) linhas.push(`Chegada: ${formatarData(dataChegada)} (${dataChegada})`);
    if (dataRetorno) linhas.push(`Retorno: ${formatarData(dataRetorno)} (${dataRetorno})`);
    linhas.push("");
    dias.forEach((d, i) => {
      const dataDia = dataChegada ? ` (${formatarData(somarDias(dataChegada, i))})` : "";
      linhas.push(`DIA ${i + 1}${dataDia} - ${d.titulo}`);
      d.atividades.forEach((a) => linhas.push(`  • ${a.hora} - ${a.titulo}`));
      linhas.push("");
    });
    linhas.push("Aguardo os valores e a disponibilidade. Obrigado!");
    return linhas.join("\n");
  }, [dias, dataChegada, dataRetorno]);

  const linkWhats = `${WA}?text=${encodeURIComponent(mensagem)}`;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-cream">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-wine hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o site
          </Link>
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Sparkles className="h-4 w-4" /> Planejador inteligente
            </p>
            <h1 className="mt-3 text-3xl font-bold text-wine sm:text-4xl">
              Monte seu roteiro na Serra Gaúcha
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Informe as datas da sua viagem, arraste os dias e as atividades, mude os horários como
              quiser, baixe o roteiro no celular e envie tudo pronto para a nossa equipe pelo
              WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-background p-4">
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-forest-dark">
              Data de chegada
              <input
                type="date"
                value={dataChegada}
                min={hojeISO()}
                onChange={(e) => {
                  const valor = e.target.value;
                  setDataChegada(valor);
                  let retorno = dataRetorno;
                  if (valor && retorno && diffDias(valor, retorno)! < 0) {
                    retorno = valor;
                    setDataRetorno(retorno);
                  }
                  aplicarDatas(valor, retorno);
                }}
                className="rounded-lg border border-border bg-cream px-3 py-2 text-sm font-semibold text-wine outline-none focus:border-gold"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-forest-dark">
              Data de retorno
              <input
                type="date"
                value={dataRetorno}
                min={dataChegada || hojeISO()}
                onChange={(e) => {
                  setDataRetorno(e.target.value);
                  aplicarDatas(dataChegada, e.target.value);
                }}
                className="rounded-lg border border-border bg-cream px-3 py-2 text-sm font-semibold text-wine outline-none focus:border-gold"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              {totalDiasViagem
                ? `Sua viagem tem ${totalDiasViagem} ${totalDiasViagem === 1 ? "dia" : "dias"}. Ajustamos o roteiro e mantivemos suas alterações.`
                : "Escolha as datas para o roteiro se ajustar automaticamente."}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <h2 className="text-lg font-bold text-forest-dark">Adicionar dias</h2>
          {POOL_DIAS.map((modelo) => (
            <button
              key={modelo.titulo}
              type="button"
              onClick={() => adicionar(modelo)}
              className="group flex w-full items-start gap-3 rounded-2xl border border-border bg-cream p-4 text-left transition hover:border-gold hover:shadow-card"
            >
              <span className="mt-0.5 rounded-full bg-wine/10 p-2 text-wine">
                <Plus className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-wine">{modelo.titulo}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {modelo.atividades.length} atividades
                </span>
                {modelo.destaque && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-wine">
                    <Star className="h-3 w-3" /> Serviço Antunes
                  </span>
                )}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={adicionarRetorno}
            className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-forest/40 p-4 text-sm font-semibold text-forest-dark transition hover:bg-forest/5"
          >
            <Plus className="h-4 w-4" /> {DIAS_GRAMADO.RETORNO.titulo}
          </button>
          <p className="rounded-2xl bg-forest/5 p-4 text-xs leading-relaxed text-muted-foreground">
            Dica: cada atividade pode ser arrastada para outro horário ou até para outro dia, e você
            pode trocar o horário no campo ao lado do nome.
          </p>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-forest-dark">
              Seu roteiro · {dias.length} {dias.length === 1 ? "dia" : "dias"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={baixarRoteiro}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-cream px-5 py-2.5 text-sm font-bold text-wine transition hover:border-gold"
              >
                <Download className="h-4 w-4" /> Baixar meu roteiro
              </button>
              <a
                href={linkWhats}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsappClick("planejador-roteiro")}
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> Enviar roteiro pelo WhatsApp
              </a>
            </div>
          </div>

          {dias.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Seu roteiro está vazio. Adicione dias ao lado para começar.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={dias.map((d) => d.key)} strategy={verticalListSortingStrategy}>
                <ol className="space-y-4">
                  {dias.map((dia, index) => (
                    <CardDia
                      key={dia.key}
                      dia={dia}
                      index={index}
                      data={dataChegada ? formatarData(somarDias(dataChegada, index)) : undefined}
                      onRemove={() => remover(dia.key)}
                      onAtualizarAtividade={(id, campos) => atualizarAtividade(dia.key, id, campos)}
                      onRemoverAtividade={(id) => removerAtividade(dia.key, id)}
                      onAdicionarAtividade={() => adicionarAtividade(dia.key)}
                      onOrdenar={() => ordenarPorHorario(dia.key)}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>
    </main>
  );
}

function CardDia({
  dia,
  index,
  data,
  onRemove,
  onAtualizarAtividade,
  onRemoverAtividade,
  onAdicionarAtividade,
  onOrdenar,
}: {
  dia: DiaRoteiro;
  index: number;
  data?: string;
  onRemove: () => void;
  onAtualizarAtividade: (id: string, campos: Partial<Atividade>) => void;
  onRemoverAtividade: (id: string) => void;
  onAdicionarAtividade: () => void;
  onOrdenar: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dia.key,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border bg-cream shadow-card ${
        isDragging ? "border-gold opacity-90" : "border-border"
      }`}
    >
      <div className="flex items-start gap-3 border-b border-border p-4">
        <button
          type="button"
          aria-label={`Reordenar ${dia.titulo}`}
          className="mt-0.5 cursor-grab rounded-md p-1 text-muted-foreground hover:text-wine active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">
            Dia {index + 1}
            {data && <span className="ml-2 text-forest-dark">{data}</span>}
          </p>
          <h3 className="mt-1 text-base font-bold text-wine sm:text-lg">{dia.titulo}</h3>
          {dia.destaque && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-wine/10 px-2 py-0.5 text-[11px] font-bold text-wine">
              <MapPin className="h-3 w-3" /> Operado pela Antunes Turismo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover ${dia.titulo}`}
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-wine/10 hover:text-wine"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <SortableContext
        items={dia.atividades.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="divide-y divide-border">
          {dia.atividades.map((a) => (
            <ItemAtividade
              key={a.id}
              atividade={a}
              onAtualizar={(campos) => onAtualizarAtividade(a.id, campos)}
              onRemover={() => onRemoverAtividade(a.id)}
            />
          ))}
        </ul>
      </SortableContext>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
        <button
          type="button"
          onClick={onAdicionarAtividade}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-wine transition hover:border-gold"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar atividade
        </button>
        <button
          type="button"
          onClick={onOrdenar}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-forest-dark transition hover:border-forest"
        >
          <Clock className="h-3.5 w-3.5" /> Organizar por horário
        </button>
      </div>
    </li>
  );
}

function ItemAtividade({
  atividade,
  onAtualizar,
  onRemover,
}: {
  atividade: Atividade;
  onAtualizar: (campos: Partial<Atividade>) => void;
  onRemover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: atividade.id,
  });

  const horaValida = /^\d{1,2}:\d{2}$/.test(atividade.hora.trim());

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-3 bg-cream p-4 ${isDragging ? "opacity-80 shadow-card" : ""}`}
    >
      <button
        type="button"
        aria-label={`Mover ${atividade.titulo}`}
        className="mt-1 cursor-grab rounded-md p-1 text-muted-foreground hover:text-wine active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex w-24 shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2 py-1">
        <Clock className="h-3 w-3 shrink-0 text-forest-dark" />
        {horaValida ? (
          <input
            type="time"
            value={atividade.hora.padStart(5, "0")}
            onChange={(e) => onAtualizar({ hora: e.target.value })}
            aria-label={`Horário de ${atividade.titulo}`}
            className="w-full bg-transparent text-xs font-bold text-forest-dark outline-none"
          />
        ) : (
          <input
            type="text"
            value={atividade.hora}
            onChange={(e) => onAtualizar({ hora: e.target.value })}
            aria-label={`Horário de ${atividade.titulo}`}
            className="w-full bg-transparent text-xs font-bold text-forest-dark outline-none"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <input
          type="text"
          value={atividade.titulo}
          onChange={(e) => onAtualizar({ titulo: e.target.value })}
          aria-label="Nome da atividade"
          className="w-full rounded-md bg-transparent text-sm font-semibold text-foreground outline-none focus:bg-background focus:px-2 focus:py-1"
        />
        <input
          type="text"
          value={atividade.desc}
          onChange={(e) => onAtualizar({ desc: e.target.value })}
          aria-label="Detalhes da atividade"
          className="mt-0.5 w-full rounded-md bg-transparent text-xs text-muted-foreground outline-none focus:bg-background focus:px-2 focus:py-1"
        />
      </div>

      <button
        type="button"
        onClick={onRemover}
        aria-label={`Remover ${atividade.titulo}`}
        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-wine/10 hover:text-wine"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
