export type CatalogoItem = {
  id: string;
  kind: "transfer" | "tour";
  nome: string;
  descricaoCurta: string;
  capacidade: string;
  /** Valor total do serviço (por trajeto no caso de transfers, por reserva nos passeios). null = sob consulta */
  total: number | null;
  /**
   * Pagamento dividido: cobra antecipadamente a Taxa de Agendamento (sinal) de 30%
   * do valor total, e o saldo é pago diretamente ao motorista. Vale SOMENTE para
   * Transfers Privativos (Carro/Spin), City Tours e Pacotes/Combos.
   */
  pagamentoDividido: boolean;
  /** Se verdadeiro, total é multiplicado pela quantidade de trajetos */
  porTrajeto?: boolean;
  /** Se verdadeiro, total é multiplicado pela quantidade de passageiros */
  porPessoa?: boolean;
  /** Aviso em destaque exibido no site e enviado no WhatsApp */
  aviso?: string;
  /** Valor antigo (riscado) quando o item está em promoção */
  precoDe?: number;
  /**
   * Serviço privativo que roda em veículos com lugares limitados. Quando o número
   * de passageiros ultrapassa a capacidade, a frota é recalculada automaticamente
   * (Sedan até 4 lugares / Spin até 6 lugares) e o valor é somado por veículo.
   */
  frota?: "transfer-privativo" | "citytour";
  /** Grupos acima da capacidade do veículo exigem orçamento manual */
  grupoSobConsulta?: boolean;
};

export type TipoVeiculo = "Sedan (até 4 lugares)" | "Spin (até 6 lugares)";

/** Tabela de preços por veículo, por trajeto (transfer) ou por dia (city tour). */
export const FROTA: Record<"transfer-privativo" | "citytour", { tipo: TipoVeiculo; lugares: number; preco: number }[]> = {
  "transfer-privativo": [
    { tipo: "Sedan (até 4 lugares)", lugares: 4, preco: 300 },
    { tipo: "Spin (até 6 lugares)", lugares: 6, preco: 350 },
  ],
  citytour: [
    { tipo: "Sedan (até 4 lugares)", lugares: 4, preco: 300 },
    { tipo: "Spin (até 6 lugares)", lugares: 6, preco: 430 },
  ],
};

export type AlocacaoVeiculo = { tipo: TipoVeiculo; qtd: number; precoUnit: number };

/**
 * Escolhe a combinação de veículos mais barata que acomode todos os passageiros.
 * Ex.: 9 passageiros no transfer = 1 Spin + 1 Sedan (R$ 650 por trajeto).
 */
export function alocarFrota(
  grupo: "transfer-privativo" | "citytour",
  pax: number,
): { veiculos: AlocacaoVeiculo[]; preco: number; lugares: number } {
  const [sedan, spin] = FROTA[grupo];
  const p = Math.max(pax, 1);
  let melhor: { veiculos: AlocacaoVeiculo[]; preco: number; lugares: number } | null = null;

  const maxSpin = Math.ceil(p / spin.lugares);
  for (let nSpin = 0; nSpin <= maxSpin; nSpin++) {
    const restantes = p - nSpin * spin.lugares;
    const nSedan = restantes > 0 ? Math.ceil(restantes / sedan.lugares) : 0;
    const preco = nSpin * spin.preco + nSedan * sedan.preco;
    const lugares = nSpin * spin.lugares + nSedan * sedan.lugares;
    if (nSpin + nSedan === 0) continue;
    const cand: { veiculos: AlocacaoVeiculo[]; preco: number; lugares: number } = {
      veiculos: [
        ...(nSpin ? [{ tipo: spin.tipo, qtd: nSpin, precoUnit: spin.preco }] : []),
        ...(nSedan ? [{ tipo: sedan.tipo, qtd: nSedan, precoUnit: sedan.preco }] : []),
      ],
      preco,
      lugares,
    };
    if (
      !melhor ||
      cand.preco < melhor.preco ||
      (cand.preco === melhor.preco && cand.lugares < melhor.lugares)
    ) {
      melhor = cand;
    }
  }
  return melhor!;
}



/** Taxa de agendamento paga à agência: 30% do valor total (somente itens com pagamento dividido). */
export const SINAL_PERCENTUAL = 0.3;

/** Acréscimo de alta temporada / feriados. */
export const ACRESCIMO_ALTA_TEMPORADA = 50;

/** Feriados e datas especiais (MM-DD). */
export const FERIADOS: string[] = [
  "01-01", // Ano Novo
  "02-16", "02-17", // Carnaval
  "04-03", "04-21", // Sexta-feira Santa / Tiradentes
  "05-01", // Dia do Trabalho
  "09-07", "09-20", // Independência / Revolução Farroupilha
  "10-12", "11-02", "11-15", // N. Sra. Aparecida / Finados / Proclamação
];

/** Alta temporada: julho, dezembro ou feriado/data especial cadastrada. */
export function isAltaTemporada(iso: string): boolean {
  if (!iso) return false;
  const [, m, d] = iso.split("-");
  if (m === "07" || m === "12") return true;
  return FERIADOS.includes(`${m}-${d}`);
}

export const CATALOGO: Record<string, CatalogoItem> = {
  "transfer-privativo": {
    id: "transfer-privativo",
    kind: "transfer",
    nome: "Transfer Privativo (Carro)",
    descricaoCurta: "Aeroporto ↔ Gramado/Canela",
    capacidade: "Até 4 pessoas",
    total: 300,
    pagamentoDividido: true,
    porTrajeto: true,
    frota: "transfer-privativo",
  },
  "transfer-spin": {
    id: "transfer-spin",
    kind: "transfer",
    nome: "Transfer Privativo (Spin)",
    descricaoCurta: "Aeroporto ↔ Gramado/Canela",
    capacidade: "Até 6 lugares",
    total: 350,
    pagamentoDividido: true,
    porTrajeto: true,
    frota: "transfer-privativo",
  },
  "transfer-van": {
    id: "transfer-van",
    kind: "transfer",
    nome: "Transfer (Van Coletiva)",
    descricaoCurta: "Aeroporto ↔ Gramado/Canela",
    capacidade: "Grupos",
    total: null,
    pagamentoDividido: false,
    porTrajeto: true,
    aviso: "Consultar horários",
  },
  "citytour-gramado": {
    id: "citytour-gramado",
    kind: "tour",
    nome: "City Tour Gramado e Canela — Dia Inteiro",
    descricaoCurta: "Roteiro privativo de dia inteiro",
    capacidade: "Até 4 pessoas",
    total: 300,
    precoDe: 350,
    pagamentoDividido: true,
    frota: "citytour",
  },
  "pacote-combo-3dias": {
    id: "pacote-combo-3dias",
    kind: "transfer",
    nome: "Pacote Transfer + City Tour — Transfer ida e volta + 1 City Tour",
    descricaoCurta: "Transfer ida e volta + 1 City Tour Gramado e Canela",
    capacidade: "Até 4 pessoas",
    total: 900,
    // Sem desconto: transfer ida e volta R$ 600 + 1 city tour R$ 350
    precoDe: 950,
    pagamentoDividido: true,
    grupoSobConsulta: true,
  },
  "pacote-combo-4dias": {
    id: "pacote-combo-4dias",
    kind: "transfer",
    nome: "Pacote Serra Completa — Transfer ida e volta + 2 City Tours",
    descricaoCurta: "Transfer ida e volta + 2 City Tours Gramado e Canela",
    capacidade: "Até 4 pessoas",
    total: 1100,
    // Sem desconto: transfer ida e volta R$ 600 + 2 city tours (R$ 350 cada) = R$ 1.300
    precoDe: 1300,
    pagamentoDividido: true,
    grupoSobConsulta: true,
  },

  "citytour-spin": {
    id: "citytour-spin",
    kind: "tour",
    nome: "City Tour Gramado e Canela — Dia Inteiro (Spin)",
    descricaoCurta: "Roteiro privativo de dia inteiro",
    capacidade: "Até 6 lugares",
    total: 430,
    pagamentoDividido: true,
    frota: "citytour",
  },
  "nova-petropolis": {
    id: "nova-petropolis",
    kind: "tour",
    nome: "Passeio Nova Petrópolis",
    descricaoCurta: "Bate e volta saindo de Gramado",
    capacidade: "Até 4 pessoas",
    total: null,
    pagamentoDividido: false,
  },
  "uva-e-vinho": {
    id: "uva-e-vinho",
    kind: "tour",
    nome: "Passeio Uva e Vinho",
    descricaoCurta: "Vale dos Vinhedos e vinícolas",
    capacidade: "Coletivo",
    total: null,
    pagamentoDividido: false,
    porPessoa: true,
  },
  "maria-fumaca": {
    id: "maria-fumaca",
    kind: "tour",
    nome: "Passeio Maria Fumaça (Bento Gonçalves)",
    descricaoCurta: "Trem a vapor pela Serra Gaúcha",
    capacidade: "Coletivo",
    total: 350,
    pagamentoDividido: false,
    porPessoa: true,
  },
};

export type Quote = {
  /** Valor total já com multiplicadores e alta temporada. null = sob consulta */
  total: number | null;
  /** Valor base sem alta temporada */
  base: number | null;
  /** Acréscimo aplicado por alta temporada/feriado */
  altaTemporada: number;
  /** Taxa de agendamento paga à agência (0 quando não há pagamento dividido) */
  sinal: number;
  /** Saldo pago diretamente ao motorista (null quando não se aplica) */
  saldoMotorista: number | null;
  dividido: boolean;
  /** Veículos necessários para acomodar o grupo (serviços privativos) */
  veiculos: AlocacaoVeiculo[] | null;
  /** Total de lugares disponíveis na frota alocada */
  lugares: number | null;
  /** Mensagem quando o grupo não cabe no veículo do item escolhido */
  avisoFrota: string | null;
};

export function calcularQuote(
  item: CatalogoItem,
  opts: { trajetos: number; pax: number; data: string },
): Quote {
  const pax = Math.max(opts.pax, 1);
  const trajetos = Math.max(opts.trajetos, 1);
  const alta = isAltaTemporada(opts.data) ? ACRESCIMO_ALTA_TEMPORADA : 0;

  let base: number | null;
  let veiculos: AlocacaoVeiculo[] | null = null;
  let lugares: number | null = null;
  let avisoFrota: string | null = null;

  if (item.frota) {
    // Se o cliente escolheu explicitamente a Spin, mantemos a Spin como veículo mínimo.
    const paxEfetivo = item.id.includes("spin") ? Math.max(pax, 5) : pax;
    const f = alocarFrota(item.frota, paxEfetivo);
    veiculos = f.veiculos;
    lugares = f.lugares;
    base = f.preco * (item.porTrajeto ? trajetos : 1);
    const totalCarros = f.veiculos.reduce((s, v) => s + v.qtd, 0);
    if (totalCarros > 1) {
      avisoFrota = `Grupo de ${pax} passageiros — necessários ${totalCarros} veículos: ${f.veiculos
        .map((v) => `${v.qtd}× ${v.tipo}`)
        .join(" + ")}. Valor recalculado automaticamente.`;
    } else if (f.veiculos[0].tipo.startsWith("Spin") && item.frota === "transfer-privativo" && item.id === "transfer-privativo") {
      avisoFrota = `Grupo de ${pax} passageiros — o serviço passa a ser realizado em Spin (até 6 lugares), com valor ajustado.`;
    } else if (f.veiculos[0].tipo.startsWith("Spin") && item.id === "citytour-gramado") {
      avisoFrota = `Grupo de ${pax} passageiros — o city tour passa a ser realizado em Spin (até 6 lugares), com valor ajustado.`;
    }
  } else if (item.grupoSobConsulta && pax > 4) {
    base = null;
    avisoFrota = `Grupo de ${pax} passageiros — o pacote é para até 4 pessoas. Enviaremos um orçamento personalizado com os veículos necessários.`;
  } else {
    const mult = item.porTrajeto ? trajetos : item.porPessoa ? pax : 1;
    base = item.total !== null ? item.total * mult : null;
  }

  const total = base !== null ? base + alta : null;

  if (!item.pagamentoDividido || total === null) {
    return {
      total,
      base,
      altaTemporada: total === null ? 0 : alta,
      sinal: 0,
      saldoMotorista: null,
      dividido: false,
      veiculos,
      lugares,
      avisoFrota,
    };
  }

  // Sinal de 30% do valor total (já com alta temporada, se aplicável). Saldo vai ao motorista.
  const sinal = Math.round(total * SINAL_PERCENTUAL);
  return {
    total,
    base,
    altaTemporada: alta,
    sinal,
    saldoMotorista: total - sinal,
    dividido: true,
    veiculos,
    lugares,
    avisoFrota,
  };
}


export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
