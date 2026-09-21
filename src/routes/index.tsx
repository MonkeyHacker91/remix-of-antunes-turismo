import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Plane, Car, Bus, Train, MapPin, Phone, MessageCircle, Ticket,
  Instagram, Youtube, Facebook, ArrowUp, Check, Sparkles, Users, Heart, Shield, Star, AlertTriangle,
} from "lucide-react";
import { trackWhatsappClick } from "@/lib/analytics";
import { getGoogleReviews } from "@/lib/reviews.functions";
import BookingModal from "@/components/BookingModal";
import { CATALOGO, brl } from "@/lib/catalogo";

const BookingCtx = createContext<(id: string) => void>(() => {});
const useBooking = () => useContext(BookingCtx);



import logo from "@/assets/logo-antunes.png.asset.json";
import heroImg from "@/assets/gramado-natal.jpg.asset.json";
import vanImg from "@/assets/van-coletiva.jpg.asset.json";
import sedanImg from "@/assets/carro-sedan.jpg.asset.json";
import spinImg from "@/assets/spin.jpg.asset.json";
import mfImg from "@/assets/maria-fumaca.jpg.asset.json";
import foundersImg from "@/assets/founders.jpg.asset.json";

export const Route = createFileRoute("/")({ component: Index });

const WA = "https://wa.me/5554994425445";
const nav = [
  { href: "#transfers", label: "Transfers" },
  { href: "#citytour", label: "City Tour" },
  { href: "#pacotes", label: "Pacotes" },
  { href: "#maria-fumaca", label: "Maria Fumaça" },

  { href: "#descontos", label: "Descontos" },
  { href: "#quem-somos", label: "Quem Somos" },
];

function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <BookingCtx.Provider value={setBookingId}>
    <div className="min-h-screen bg-background text-foreground">

      <Header scrolled={scrolled} />
      <Hero />
      <Trust />
      <Services />
      <Pacotes />
      <MariaFumaca />

      <Descontos />
      <QuemSomos />
      <Avaliacoes />

      <ContactCTA />
      <Footer />
      <WhatsAppFloat />
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          className="fixed bottom-6 left-6 z-40 rounded-full bg-wine text-cream p-3 shadow-elegant hover:bg-wine-dark transition"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <BookingModal itemId={bookingId} onClose={() => setBookingId(null)} />
    </div>
    </BookingCtx.Provider>
  );

}

function Header({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all ${
        scrolled ? "bg-background/95 backdrop-blur shadow-sm py-2" : "bg-background/70 backdrop-blur py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-3">
          <img src={logo.url} alt="Antunes Turismo" className="h-12 w-12 object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="font-display text-lg font-bold text-wine">Antunes Turismo</div>
            <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">Serra Gaúcha</div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="text-foreground/80 hover:text-wine transition">
              {n.label}
            </a>
          ))}
          <Link to="/roteiro" className="font-semibold text-wine hover:text-gold transition">
            Monte seu Roteiro
          </Link>
        </nav>
        <a
          href={WA}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsappClick("header")}
          className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[92vh] flex items-center overflow-hidden">
      <img
        src={heroImg.url}
        alt="Pórtico de Gramado iluminado no Natal Luz"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-wine-dark/80 via-wine-dark/55 to-forest-dark/85" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-20 text-cream">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/20 px-4 py-1.5 text-xs tracking-[0.25em] uppercase text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Desde 2019 · Atendimento Familiar
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
            A Melhor Experiência<br />na <span className="text-gold">Serra Gaúcha</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-cream/90 max-w-xl">
            Transfers privativos, City Tour por Gramado e o clássico passeio de Maria Fumaça —
            organizados por quem vive a Serra todos os dias.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={WA}
              target="_blank"
              rel="noopener"
              onClick={() => trackWhatsappClick("hero")}
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-7 py-4 text-base font-semibold text-white shadow-elegant hover:scale-[1.02] transition"
            >
              <MessageCircle className="h-5 w-5" /> Fale com um Especialista
            </a>
            <a
              href="#transfers"
              className="inline-flex items-center gap-2 rounded-full border border-cream/40 px-7 py-4 text-base font-semibold text-cream hover:bg-cream/10 transition"
            >
              Ver serviços
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-cream/80">
            {["Atendimento pessoal", "Motoristas locais", "Reserva em minutos"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    { icon: Shield, t: "Operação familiar", s: "Lázaro & Nadine à frente de cada reserva" },
    { icon: Star, t: "Padrão premium", s: "Veículos revisados e motoristas experientes" },
    { icon: Heart, t: "Desde 2019", s: "Milhares de viajantes atendidos na Serra" },
    { icon: MapPin, t: "100% Gramado", s: "Especialistas na região e roteiros locais" },
  ];
  return (
    <section className="border-b border-border bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, t, s }) => (
          <div key={t} className="flex items-start gap-3">
            <div className="rounded-full bg-wine/10 p-2.5 text-wine"><Icon className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold text-foreground">{t}</div>
              <div className="text-sm text-muted-foreground">{s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type SvcCard = {
  tag: string;
  title: string;
  desc: string;
  icon: any;
  image?: string;
  price: string;
  priceDe?: string;
  priceLabel: string;

  note?: string;
  alerta?: string;
  catalogId: string;
  unit?: string;
};

const transferCards: SvcCard[] = [
  {
    tag: "Privativo",
    title: "Transfer — Até 4 pessoas",
    desc: "Conforto e privacidade para famílias e casais que buscam um atendimento dedicado no aeroporto de Gramado.",
    icon: Car,
    image: sedanImg.url,
    price: brl(CATALOGO["transfer-privativo"].total!),
    priceLabel: "Transfer Aeroporto ↔ Gramado",
    note: "Taxa de agendamento de 30% do valor total para garantir a reserva — o saldo é pago diretamente ao motorista no dia. Julho, dezembro e feriados: + R$ 50.",
    catalogId: "transfer-privativo",
    unit: "por trajeto",
  },
  {
    tag: "Spin",
    title: "Transfer — Até 6 lugares",
    desc: "Ideal para grupos pequenos com bagagens — mais espaço interno mantendo o padrão privativo da Antunes.",
    icon: Car,
    image: spinImg.url,
    price: brl(CATALOGO["transfer-spin"].total!),
    priceLabel: "Transfer Aeroporto ↔ Gramado",
    note: "Taxa de agendamento de 30% do valor total para garantir a reserva — o saldo é pago diretamente ao motorista no dia. Julho, dezembro e feriados: + R$ 50.",
    catalogId: "transfer-spin",
    unit: "por trajeto",
  },
  {
    tag: "Coletivo",
    title: "Transfer — Van compartilhada",
    desc: "Opção de transfer coletivo em van, em parceria com empresas selecionadas — mantendo o padrão de qualidade da Antunes.",
    icon: Bus,
    image: vanImg.url,
    price: "Consultar",
    priceLabel: "Transfer Aeroporto ↔ Gramado",
    alerta: "Consultar horários",
    note: "Consulte disponibilidade, horários e valores pelo formulário de reserva.",
    catalogId: "transfer-van",
  },
];


const cityTourCards: SvcCard[] = [
  {
    tag: "Dia Inteiro",
    title: "City Tour — Até 4 pessoas",
    desc: "Roteiro privativo de dia inteiro por Gramado e Canela, com paradas nos principais pontos turísticos.",
    icon: MapPin,
    image: sedanImg.url,
    price: brl(CATALOGO["citytour-gramado"].total!),
    priceDe: brl(CATALOGO["citytour-gramado"].precoDe!),
    priceLabel: "City Tour Gramado e Canela · Dia Inteiro",

    note: "Taxa de agendamento de 30% do valor total para garantir a reserva — o saldo é pago diretamente ao motorista no dia. Julho, dezembro e feriados: + R$ 50.",
    catalogId: "citytour-gramado",
    unit: "valor total",
  },
  {
    tag: "Dia Inteiro · Spin",
    title: "City Tour — Até 6 lugares",
    desc: "Mais espaço para o grupo vivenciar o melhor de Gramado e Canela em um passeio privativo de dia inteiro.",
    icon: MapPin,
    image: spinImg.url,
    price: brl(CATALOGO["citytour-spin"].total!),
    priceLabel: "City Tour Gramado e Canela · Dia Inteiro",
    note: "Taxa de agendamento de 30% do valor total para garantir a reserva — o saldo é pago diretamente ao motorista no dia. Julho, dezembro e feriados: + R$ 50.",
    catalogId: "citytour-spin",
    unit: "valor total",
  },
];


function Services() {
  return (
    <section id="transfers" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead
          eyebrow="Transfers"
          title="Chegue na Serra com tranquilidade"
          subtitle="Preços transparentes por trecho, sem taxas escondidas. Reserve direto pelo WhatsApp."
        />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {transferCards.map((s) => <ServiceCard key={`transfer-${s.tag}`} s={s} />)}
        </div>
      </div>

      <div id="citytour" className="max-w-7xl mx-auto px-4 mt-24">
        <SectionHead
          eyebrow="City Tour"
          title="Conheça Gramado e Canela do seu jeito"
          subtitle="Roteiros privativos pelos principais pontos turísticos da Serra Gaúcha."
        />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {cityTourCards.map((s) => <ServiceCard key={`citytour-${s.tag}`} s={s} />)}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ s }: { s: SvcCard }) {
  const Icon = s.icon;
  const openBooking = useBooking();
  return (
    <div className="group flex flex-col rounded-2xl bg-cream border border-border overflow-hidden shadow-card hover:shadow-elegant hover:-translate-y-1 transition">
      {s.image ? (
        <div className="aspect-[16/10] overflow-hidden bg-cream-dark">
          <img src={s.image} alt={s.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition" />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center">
          <Icon className="h-20 w-20 text-gold/80" strokeWidth={1.2} />
        </div>
      )}
      <div className="p-6 flex-1 flex flex-col">
        <span className="inline-flex self-start rounded-full bg-forest/10 text-forest-dark text-xs font-semibold px-3 py-1 tracking-wide uppercase">
          {s.tag}
        </span>
        <h3 className="mt-3 font-display text-2xl font-bold text-wine">{s.title}</h3>
        {s.alerta && (
          <p className="mt-2 inline-flex self-start items-center gap-1.5 rounded-md bg-gold/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-wine ring-1 ring-gold/40">
            <AlertTriangle className="h-3.5 w-3.5 text-gold" /> {s.alerta}
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>

        <div className="mt-5 rounded-xl bg-background border border-border p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.priceLabel}</div>
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            {s.priceDe && <span className="text-base text-muted-foreground line-through">{s.priceDe}</span>}
            <span className="font-display text-3xl font-bold text-wine">{s.price}</span>
            {s.unit && <span className="text-sm text-muted-foreground">{s.unit}</span>}
            {s.priceDe && (
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-wine">Promoção</span>
            )}
          </div>
        </div>


        {s.note && (
          <p className="mt-4 text-sm italic text-muted-foreground">{s.note}</p>
        )}
        <button
          type="button"
          onClick={() => openBooking(s.catalogId)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-wine text-cream font-semibold py-3 hover:bg-wine-dark transition"
        >
          <MessageCircle className="h-4 w-4" /> Reservar Agora
        </button>
      </div>
    </div>
  );
}


function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">{eyebrow}</div>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-wine leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function MariaFumaca() {
  const openBooking = useBooking();

  return (
    <section id="maria-fumaca" className="py-24 bg-forest-dark text-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <img
            src={mfImg.url}
            alt="Passeio de Maria Fumaça na Serra Gaúcha"
            loading="lazy"
            className="rounded-2xl shadow-elegant object-cover aspect-[4/5] w-full"
          />
          <div className="absolute -bottom-6 -right-6 hidden sm:block rounded-2xl bg-gold text-wine-dark p-5 shadow-elegant">
            <div className="text-xs uppercase tracking-widest font-semibold">A partir de</div>
            <div className="font-display text-4xl font-bold leading-none">R$ 350</div>
            <div className="text-xs mt-1">por pessoa</div>
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Passeio Clássico</div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Maria Fumaça:<br /><span className="text-gold">história sobre trilhos</span>
          </h2>
          <p className="mt-5 text-cream/85 text-lg">
            Uma viagem coletiva pela Serra Gaúcha a bordo do lendário trem a vapor, com
            paisagens, música ao vivo e a tradição vinícola da região.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { icon: Train, t: "Modalidade coletiva com acomodação garantida" },
              { icon: Car, t: "Transporte de Gramado ida e volta incluso" },
              { icon: Ticket, t: "Alimentação inclusa durante o roteiro" },
              { icon: Sparkles, t: "Roteiro completo detalhado no atendimento" },
            ].map(({ icon: I, t }) => (
              <li key={t} className="flex items-start gap-3 text-cream/90">
                <I className="h-5 w-5 text-gold mt-0.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-cream/60">
            Operação realizada por parceiros homologados, com todo o suporte da Antunes Turismo.
          </p>
          <button
            type="button"
            onClick={() => openBooking("maria-fumaca")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold text-wine-dark font-bold px-7 py-4 hover:brightness-110 transition"
          >
            <Ticket className="h-5 w-5" /> Garantir meu Ingresso
          </button>

        </div>
      </div>
    </section>
  );
}

function Pacotes() {
  const openBooking = useBooking();
  const pacotes = [
    {
      id: "pacote-combo-3dias",
      selo: "Oferta",
      destaque: false,
      titulo: "Transfer ida e volta + 1 City Tour",
      desc: "Chegada e partida do aeroporto com conforto, mais um dia inteiro de city tour privativo por Gramado e Canela.",
      itens: [
        "Transfer privativo de ida (aeroporto → hotel)",
        "Transfer privativo de volta (hotel → aeroporto)",
        "1 City Tour de dia inteiro em Gramado e Canela",
        "Até 4 pessoas com motorista dedicado",
      ],
      decomposicao: "Separado sairia R$ 950 (transfer ida e volta R$ 600 + city tour R$ 350)",
    },
    {
      id: "pacote-combo-4dias",
      selo: "Oferta Especial",
      destaque: true,
      titulo: "Transfer ida e volta + 2 City Tours",
      desc: "O combo completo da Serra: ida e volta do aeroporto e dois dias completos de city tour privativo por Gramado e Canela.",
      itens: [
        "Transfer privativo de ida (aeroporto → hotel)",
        "Transfer privativo de volta (hotel → aeroporto)",
        "2 City Tours de dia inteiro em Gramado e Canela",
        "Até 4 pessoas com motorista dedicado e roteiro flexível",
      ],
      decomposicao: "Separado sairia R$ 1.300 (transfer ida e volta R$ 600 + 2 city tours de R$ 350)",
    },
  ];

  return (
    <section id="pacotes" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead
          eyebrow="Pacotes Promocionais"
          title="Combos com desconto real"
          subtitle="Contratando o pacote, você paga menos do que contrataria cada serviço separado — e garante toda a viagem com motorista dedicado."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          {pacotes.map((cfg) => {
            const p = CATALOGO[cfg.id];
            const economia = p.precoDe! - p.total!;
            return (
              <div
                key={cfg.id}
                className={`flex flex-col rounded-3xl border p-8 sm:p-10 shadow-elegant ${
                  cfg.destaque ? "border-gold/50 bg-cream ring-2 ring-gold/40" : "border-wine/15 bg-cream"
                }`}
              >
                <span className={`inline-flex self-start items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  cfg.destaque ? "bg-gold/25 text-wine ring-1 ring-gold/50" : "bg-wine/10 text-wine"
                }`}>
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> {cfg.selo}
                </span>
                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-wine">{cfg.titulo}</h3>
                <p className="mt-3 text-muted-foreground">{cfg.desc}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {cfg.itens.map((t) => (
                    <li key={t} className="flex items-start gap-2 text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" /> {t}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col justify-center rounded-2xl bg-wine p-6 sm:p-8 text-cream">
                  <div className="text-xs uppercase tracking-[0.25em] text-gold">Pacote por apenas</div>
                  <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                    <span className="text-lg text-cream/60 line-through">{brl(p.precoDe!)}</span>
                    <span className="font-display text-5xl font-bold">{brl(p.total!)}</span>
                  </div>
                  <div className="mt-1 text-sm text-cream/80">Até 4 pessoas · economia de {brl(economia)}</div>
                  <p className="mt-3 text-xs text-cream/70">{cfg.decomposicao}.</p>
                  <p className="mt-2 text-xs text-cream/70">
                    Taxa de agendamento de 30% do valor total para garantir a reserva — o saldo é pago diretamente ao motorista. Julho, dezembro e feriados: + R$ 50.
                  </p>
                  <button
                    type="button"
                    onClick={() => openBooking(p.id)}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-bold text-wine-dark hover:brightness-110 transition"
                  >
                    <MessageCircle className="h-5 w-5" /> Reservar o pacote
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Descontos() {

  return (
    <section id="descontos" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead
          eyebrow="Descontos & Cashback"
          title="Laçador de Ofertas: economize na Serra"
          subtitle="Cupons atualizados e uma comunidade que vive caçando o melhor preço em Gramado."
        />

        <div className="mt-12 dashed-box rounded-3xl bg-background p-8 sm:p-12 text-center shadow-card">
          <div className="text-xs tracking-[0.3em] uppercase text-forest font-semibold">Oferta Permanente</div>
          <div className="mt-4 font-display text-3xl sm:text-5xl font-bold text-wine leading-tight">
            Use o cupom <span className="inline-block bg-wine text-cream px-4 py-1 rounded-lg tracking-wider">LAZAROANTUNES</span><br />
            e ganhe <span className="text-forest">5% de Cashback</span>
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Aplique no Laçador de Ofertas e receba o retorno em cashback na sua reserva.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="https://www.lacadorofertas.com.br/" target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-wine text-cream font-semibold px-6 py-3 hover:bg-wine-dark transition">
              <Ticket className="h-4 w-4" /> Acessar Laçador de Ofertas
            </a>
            <a href="https://chat.whatsapp.com/IO8ZxKvSnMzEZjhrwGbUFq" target="_blank" rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white font-semibold px-6 py-3 hover:opacity-90 transition">
              <Users className="h-4 w-4" /> Entre no nosso Grupo VIP
            </a>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <CouponCard
            badge="Cupom do Dia"
            tint="wine"
            title="Reservou? Ganhou."
            desc="Cupom rotativo com desconto extra em serviços selecionados. Consulte a oferta ativa hoje pelo WhatsApp."
          />
          <CouponCard
            badge="Cupom da Semana"
            tint="forest"
            title="Combos com valor especial"
            desc="Pacotes de Transfer + City Tour + Maria Fumaça com condições exclusivas para reservas antecipadas."
          />
        </div>
      </div>
    </section>
  );
}

function CouponCard({ badge, tint, title, desc }: { badge: string; tint: "wine" | "forest"; title: string; desc: string }) {
  const t = tint === "wine" ? "bg-wine text-cream" : "bg-forest text-cream";
  return (
    <div className="rounded-2xl border border-border bg-background p-8 shadow-card flex flex-col">
      <span className={`self-start rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase ${t}`}>{badge}</span>
      <h3 className="mt-4 font-display text-2xl font-bold text-wine">{title}</h3>
      <p className="mt-2 text-muted-foreground">{desc}</p>
      <a href={WA} target="_blank" rel="noopener"
        onClick={() => trackWhatsappClick(`coupon:${badge}`)}
        className="mt-6 inline-flex items-center gap-2 self-start text-wine font-semibold hover:underline">
        Ver cupom ativo <MessageCircle className="h-4 w-4" />
      </a>
    </div>
  );
}

function QuemSomos() {
  return (
    <section id="quem-somos" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-2">
          <img
            src={foundersImg.url}
            alt="Lázaro e Nadine, fundadores da Antunes Turismo"
            loading="lazy"
            className="rounded-2xl shadow-elegant object-cover aspect-[3/2] w-full"
          />
          <div className="mt-4 inline-block bg-cream border border-border rounded-2xl px-5 py-3 shadow-card">
            <div className="font-display text-2xl font-bold text-wine">Lázaro & Nadine</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Fundadores</div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Quem Somos</div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-wine leading-tight">
            Uma agência familiar, feita para quem quer viver a Serra de verdade.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            A <strong className="text-foreground">Antunes Turismo</strong> nasceu em 2019 do sonho
            de Lázaro e Nadine em receber cada visitante como um convidado da própria casa.
            Somos operação familiar, atendimento pessoal e conhecimento profundo de Gramado
            e da Serra Gaúcha — do primeiro contato ao último transfer.
          </p>
          <p className="mt-4 text-lg text-muted-foreground">
            Trabalhamos com transparência de valores, veículos revisados e uma rede de parceiros
            homologados, para que a sua viagem seja tranquila do começo ao fim.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { n: "2019", t: "Ano de fundação" },
              { n: "3", t: "Serviços especializados" },
              { n: "100%", t: "Atendimento humano" },
            ].map((s) => (
              <div key={s.t} className="rounded-xl bg-cream border border-border p-4 text-center">
                <div className="font-display text-3xl font-bold text-wine">{s.n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.round(n) ? "fill-gold" : "opacity-30"}`} />
      ))}
    </div>
  );
}

function Avaliacoes() {
  const fetchReviews = useServerFn(getGoogleReviews);
  const { data } = useQuery({
    queryKey: ["google-reviews"],
    queryFn: () => fetchReviews(),
    staleTime: 1000 * 60 * 60,
  });

  const reviews = (data?.reviews ?? []).filter((r) => r.rating >= 4);
  if (!data?.configured || reviews.length === 0) return null;

  return (
    <section id="avaliacoes" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHead
          eyebrow="Avaliações no Google"
          title="O que nossos clientes dizem"
          subtitle="Avaliações reais publicadas no Google Meu Negócio."
        />
        {data.rating && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="font-display text-3xl font-bold text-wine">{data.rating.toFixed(1)}</span>
            <Stars n={data.rating} />
            {data.total ? (
              <span className="text-sm text-muted-foreground">({data.total} avaliações)</span>
            ) : null}
          </div>
        )}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <article key={i} className="rounded-2xl bg-background p-6 shadow-card border border-border">
              <div className="flex items-center gap-3">
                {r.profilePhoto ? (
                  <img src={r.profilePhoto} alt={r.author} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-wine text-cream grid place-items-center font-semibold">
                    {r.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold">{r.author}</div>
                  <div className="text-xs text-muted-foreground">{r.relativeTime}</div>
                </div>
              </div>
              <div className="mt-3"><Stars n={r.rating} /></div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>
            </article>
          ))}
        </div>
        {data.mapsUrl && (
          <div className="mt-10 text-center">
            <a
              href={data.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-wine px-6 py-3 text-sm font-semibold text-wine hover:bg-wine hover:text-cream transition"
            >
              <Star className="h-4 w-4" /> Ver todas as avaliações no Google
            </a>
          </div>
        )}
      </div>
    </section>
  );
}



function ContactCTA() {
  return (
    <section id="contato" className="py-24 bg-gradient-to-br from-wine to-wine-dark text-cream">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Fale conosco</div>
        <h2 className="mt-3 font-display text-4xl sm:text-6xl font-bold leading-tight">
          Vamos organizar sua viagem<br />pela <span className="text-gold">Serra Gaúcha?</span>
        </h2>
        <p className="mt-6 text-lg text-cream/85">
          Todo o atendimento é feito diretamente pelo WhatsApp, com resposta rápida e humana.
          Sem formulários, sem espera.
        </p>
        <a
          href={WA}
          target="_blank"
          rel="noopener"
          onClick={() => trackWhatsappClick("contact-cta")}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-whatsapp px-10 py-5 text-lg font-bold text-white shadow-elegant hover:scale-[1.02] transition"
        >
          <MessageCircle className="h-6 w-6" /> Falar no WhatsApp agora
        </a>
        <div className="mt-6 flex items-center justify-center gap-2 text-cream/70 text-sm">
          <Phone className="h-4 w-4" /> (54) 99442-5445
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/economizeiemgramado?igsi=OHIwNTRjN3ZobzJy" },
    { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@economizeiemgramado" },
    { icon: TikTokIcon, label: "TikTok", href: "https://www.tiktok.com/@economizeinaserragaucha?_r=1&_t=ZS-997vD4fzEzk" },
    { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/19MLcrGRZo/" },
  ];

  return (
    <footer className="bg-forest-dark text-cream/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo.url} alt="Antunes Turismo" className="h-14 w-14 object-contain bg-cream rounded-full p-1" />
            <div>
              <div className="font-display text-xl font-bold text-cream">Antunes Turismo</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Serra Gaúcha</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-cream/70 max-w-sm">
            Transfers, City Tour e Maria Fumaça em Gramado. Atendimento familiar desde 2019.
          </p>
          <div className="mt-5 text-xs text-cream/60 space-y-1">
            <div>CNPJ: 51.537.994/0001-10</div>
            <div>Gramado — Rio Grande do Sul</div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Redes sociais</div>
          <div className="mt-5 flex flex-wrap gap-3">
            {socials.map(({ icon: I, label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener"
                aria-label={label}
                title={label}
                className="rounded-full bg-cream/10 p-3 text-gold hover:bg-gold hover:text-forest-dark transition"
              >
                <I className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>


        <div>
          <div className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">Navegação</div>
          <ul className="mt-5 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}><a href={n.href} className="hover:text-gold transition">{n.label}</a></li>
            ))}
            <li><a href="#contato" className="hover:text-gold transition">Contato</a></li>
          </ul>
          <a href={WA} target="_blank" rel="noopener"
            onClick={() => trackWhatsappClick("footer")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-whatsapp text-white text-sm font-semibold px-5 py-2.5 hover:opacity-90 transition">
            <MessageCircle className="h-4 w-4" /> Reservar pelo WhatsApp
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/60">
        <div>© {new Date().getFullYear()} Antunes Turismo. Todos os direitos reservados.</div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2 hover:text-gold transition">
          Voltar ao topo <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href={WA}
      target="_blank"
      rel="noopener"
      onClick={() => trackWhatsappClick("float-button")}
      aria-label="Fale no WhatsApp"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-5 py-4 shadow-elegant hover:scale-105 transition"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-semibold">WhatsApp</span>
    </a>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.6 6.3a5.3 5.3 0 0 1-3.3-1.2 5.3 5.3 0 0 1-1.9-3H11v12.2a2.9 2.9 0 1 1-2.1-2.8V8.2a6 6 0 1 0 5.2 6V9.5a8 8 0 0 0 5.5 2.1V6.3z" />
    </svg>
  );
}
