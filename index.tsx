import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Transformaciones de Funciones · Mariano Gálvez" },
      {
        name: "description",
        content:
          "Graficador interactivo de transformaciones: traslados, reflexión en el eje x y ampliación o reducción de funciones.",
      },
      { property: "og:title", content: "Transformaciones de Funciones" },
      {
        property: "og:description",
        content: "Mueve, voltea, estira o comprime una función con y = a·f(x − h) + k.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const FUNCS = {
  x2: { label: "x²", f: (x: number) => x * x },
  x3: { label: "x³", f: (x: number) => x * x * x },
  abs: { label: "|x|", f: (x: number) => Math.abs(x) },
  sqrt: { label: "√x", f: (x: number) => (x >= 0 ? Math.sqrt(x) : NaN) },
  sin: { label: "sen x", f: (x: number) => Math.sin(x) },
  inv: { label: "1/x", f: (x: number) => (x === 0 ? NaN : 1 / x) },
} satisfies Record<string, { label: string; f: (x: number) => number }>;

const W = 600,
  R = 10;
const toPx = (v: number) => ((v + R) / (2 * R)) * W;
const toPy = (v: number) => W - ((v + R) / (2 * R)) * W;

function path(fn: (x: number) => number) {
  let d = "",
    pen = false,
    prev = NaN;
  for (let i = 0; i <= 1200; i++) {
    const x = -R + (i / 1200) * 2 * R;
    const y = fn(x);
    if (!isFinite(y) || Math.abs(y) > 60 || (isFinite(prev) && Math.abs(y - prev) > 15)) {
      pen = false;
      prev = y;
      continue;
    }
    d += `${pen ? "L" : "M"}${toPx(x).toFixed(1)},${toPy(y).toFixed(1)} `;
    pen = true;
    prev = y;
  }
  return d;
}

/* ---------------- Loading screen ---------------- */

function ProgressRing({ p }: { p: number }) {
  const C = 2 * Math.PI * 54;
  return (
    <div className="relative mx-auto size-24 sm:size-36">
      <div className="absolute inset-2 animate-glow-pulse rounded-full bg-primary/30 blur-2xl" />
      <svg viewBox="0 0 120 120" className="relative size-full -rotate-90">
        <circle cx={60} cy={60} r={54} className="fill-none stroke-muted" strokeWidth={6} />
        <circle
          cx={60}
          cy={60}
          r={54}
          className="fill-none stroke-primary"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p / 100)}
          style={{ transition: "stroke-dashoffset 120ms linear", filter: "drop-shadow(0 0 6px var(--primary))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-mono text-xl font-bold text-primary">f(x)</p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground">{p}%</p>
        </div>
      </div>
    </div>
  );
}

function Loading({ p, onStart }: { p: number; onStart: () => void }) {
  const done = p >= 100;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2"
      >
        <div className="size-[560px] animate-float rounded-full bg-primary/25 blur-[130px]" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-44 -right-28 size-[420px] rounded-full bg-pink-deep/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
      />

      <div className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95 duration-700 text-center">
        <ProgressRing p={p} />

        <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground sm:mt-9 sm:text-[11px] sm:tracking-[0.45em]">
          Universidad
        </p>
        <h1 className="mt-2 bg-gradient-to-b from-foreground via-primary to-pink-deep bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-6xl">
          Mariano Gálvez
        </h1>
        <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
          Transformaciones de funciones · graficador interactivo
        </p>

        <div className="mx-auto mt-4 max-w-sm rounded-2xl border bg-card/70 p-3.5 glow backdrop-blur sm:mt-8 sm:p-5">
          <p className="text-lg font-semibold text-card-foreground">Hillary Yohana Simaj García</p>
          <p className="mt-1 text-sm font-medium text-primary">Ingeniería en Sistemas</p>
          <p className="mt-2 font-mono text-xs tracking-wide text-muted-foreground">
            Carné 6190-26-30714
          </p>
        </div>

        <div className="mx-auto mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted sm:mt-7">
          <div
            className="gradient-primary shimmer h-full rounded-full transition-all duration-100"
            style={{ width: `${p}%` }}
          />
        </div>

        <div className="mt-4 flex min-h-11 items-center justify-center sm:mt-6 sm:min-h-12">
          {done ? (
            <button
              onClick={onStart}
              className="gradient-primary animate-in fade-in slide-in-from-bottom-3 rounded-full px-9 py-3 text-sm font-semibold text-primary-foreground glow transition hover:brightness-110 active:scale-95"
            >
              Iniciar →
            </button>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Cargando…
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------------- Intro / theory screen ---------------- */

const CARDS: [string, string, string][] = [
  ["01", "Traslado horizontal", "f(x − h): la gráfica se mueve a la derecha si h > 0 y a la izquierda si h < 0."],
  ["02", "Traslado vertical", "f(x) + k: la gráfica sube si k > 0 y baja si k < 0."],
  ["03", "Reflexión en el eje x", "−f(x): la gráfica se voltea de arriba hacia abajo, como en un espejo."],
  ["04", "Ampliación / reducción", "a·f(x): con a > 1 se estira, con 0 < a < 1 se comprime."],
];

function Intro({ onGo, onBack }: { onGo: () => void; onBack: () => void }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
      <div aria-hidden className="pointer-events-none absolute -top-32 right-0 size-[380px] rounded-full bg-pink-deep/25 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-0 size-[380px] rounded-full bg-primary/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700">
        <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-primary">
          Hillary Y. Simaj García · 6190-26-30714
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:mt-3 sm:text-5xl">
          ¿Qué es una{" "}
          <span className="bg-gradient-to-r from-primary to-pink-soft bg-clip-text text-transparent">
            transformación
          </span>{" "}
          de funciones?
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
          Partimos de una función base f(x) y la modificamos con la fórmula{" "}
          <span className="whitespace-nowrap rounded-md border bg-card px-1.5 py-0.5 font-mono text-[13px] text-primary sm:px-2 sm:py-1 sm:text-base">
            y = a·f(x − h) + k
          </span>
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mt-8">
          {CARDS.map(([n, t, d]) => (
            <div
              key={t}
              className="group rounded-2xl border bg-card/70 p-3.5 backdrop-blur transition hover:border-primary/60 hover:bg-accent/40 sm:p-5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="grid size-8 place-items-center rounded-full border bg-background font-mono text-xs text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  {n}
                </span>
                <p className="font-semibold text-card-foreground">{t}</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:text-sm">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3 sm:mt-8">
          <button
            onClick={onGo}
            className="gradient-primary rounded-full px-8 py-3 text-sm font-semibold text-primary-foreground glow transition hover:brightness-110 active:scale-95"
          >
            Ir al graficador →
          </button>
          <button
            onClick={onBack}
            className="rounded-full border px-8 py-3 text-sm font-medium text-foreground transition hover:bg-accent active:scale-95"
          >
            Volver
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- Grapher ---------------- */

function Slider({
  label,
  value,
  set,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  set: (n: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-primary">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(+e.target.value)}
        className="w-full accent-[var(--primary)]"
      />
    </label>
  );
}

function Grapher() {
  const [key, setKey] = useState<keyof typeof FUNCS>("x2");
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const [a, setA] = useState(1);
  const [refl, setRefl] = useState(false);
  const base = FUNCS[key].f;
  const A = refl ? -a : a;
  const dBase = useMemo(() => path(base), [base]);
  const dT = useMemo(() => path((x) => A * base(x - h) + k), [base, A, h, k]);

  const eq = `y = ${A === 1 ? "" : A === -1 ? "−" : A + "·"}f(x${h === 0 ? "" : h > 0 ? ` − ${h}` : ` + ${-h}`})${k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${-k}`}`;
  const grid = Array.from({ length: 2 * R + 1 }, (_, i) => i - R);
  const ticks = [-5, 5];

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-3 pr-24 sm:pr-0">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-primary">
              Mariano Gálvez · Ingeniería en Sistemas
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
              Transformaciones de Funciones
            </h1>
          </div>
          <p className="whitespace-nowrap rounded-lg border bg-card px-3 py-1.5 font-mono text-xs text-primary glow sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
            {eq}
          </p>
        </header>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[1fr_330px]">
          <div className="relative overflow-hidden rounded-2xl border bg-card/60 p-2 backdrop-blur">
            <svg viewBox={`0 0 ${W} ${W}`} className="max-h-[38vh] w-full sm:max-h-[58vh]" preserveAspectRatio="xMidYMid meet">
              {grid.map((g) => (
                <g key={g} className="stroke-border" strokeWidth={g === 0 ? 0 : 1}>
                  <line x1={toPx(g)} y1={0} x2={toPx(g)} y2={W} />
                  <line x1={0} y1={toPy(g)} x2={W} y2={toPy(g)} />
                </g>
              ))}
              <line x1={0} y1={toPy(0)} x2={W} y2={toPy(0)} className="stroke-muted-foreground" strokeWidth={1.5} />
              <line x1={toPx(0)} y1={0} x2={toPx(0)} y2={W} className="stroke-muted-foreground" strokeWidth={1.5} />
              {ticks.map((t) => (
                <text
                  key={`x${t}`}
                  x={toPx(t)}
                  y={toPy(0) + 21}
                  className="fill-muted-foreground font-mono"
                  fontSize={14}
                  textAnchor="middle"
                  style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 5, strokeLinejoin: "round" }}
                >
                  {t}
                </text>
              ))}
              {ticks.map((t) => (
                <text
                  key={`y${t}`}
                  x={toPx(0) + 11}
                  y={toPy(t) - 8}
                  className="fill-muted-foreground font-mono"
                  fontSize={14}
                  style={{ paintOrder: "stroke", stroke: "var(--background)", strokeWidth: 5, strokeLinejoin: "round" }}
                >
                  {t}
                </text>
              ))}
              <path
                d={dBase}
                fill="none"
                className="stroke-muted-foreground"
                strokeWidth={2}
                strokeDasharray="7 6"
              />
              <path
                d={dT}
                fill="none"
                className="stroke-primary"
                strokeWidth={3.5}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 8px var(--primary))" }}
              />
            </svg>
            <div className="pointer-events-none absolute bottom-4 left-4 flex gap-4 rounded-full border bg-background/80 px-4 py-1.5 text-xs backdrop-blur">
              <span className="text-muted-foreground">— — f(x) original</span>
              <span className="text-primary">— a·f(x − h) + k</span>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border bg-card/70 p-4 backdrop-blur sm:space-y-5 sm:p-5">
            <div>
              <p className="mb-2 text-sm font-medium">Función base</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(FUNCS).map(([id, v]) => (
                  <button
                    key={id}
                    onClick={() => setKey(id as keyof typeof FUNCS)}
                    className={`rounded-lg border px-2 py-2 font-mono text-sm transition ${
                      key === id
                        ? "gradient-primary border-transparent text-primary-foreground glow"
                        : "hover:bg-accent"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Slider label="Traslado horizontal (h)" value={h} set={setH} min={-8} max={8} step={0.5} />
              <Slider label="Traslado vertical (k)" value={k} set={setK} min={-8} max={8} step={0.5} />
              <Slider label="Ampliación / reducción (a)" value={a} set={setA} min={0.1} max={5} step={0.1} />
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={refl}
                  onChange={(e) => setRefl(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                Reflexión en el eje x
              </label>
            </div>

            <button
              onClick={() => {
                setH(0);
                setK(0);
                setA(1);
                setRefl(false);
              }}
              className="w-full rounded-lg border py-2.5 text-sm transition hover:bg-accent active:scale-95"
            >
              Reiniciar
            </button>

            <ul className="space-y-1.5 border-t pt-4 text-xs text-muted-foreground">
              <li>h &gt; 0 → derecha, h &lt; 0 → izquierda</li>
              <li>k &gt; 0 → arriba, k &lt; 0 → abajo</li>
              <li>a &gt; 1 → ampliación, 0 &lt; a &lt; 1 → reducción</li>
              <li>−f(x) → reflexión en el eje x</li>
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ---------------- App ---------------- */

function Index() {
  const [stage, setStage] = useState<"loading" | "intro" | "app">("loading");
  const [p, setP] = useState(0);
  useEffect(() => {
    if (stage !== "loading") return;
    const t = setInterval(() => setP((v) => (v >= 100 ? 100 : v + 2)), 60);
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  if (stage === "loading") return <Loading p={p} onStart={() => setStage("intro")} />;

  if (stage === "intro")
    return (
      <Intro
        onGo={() => setStage("app")}
        onBack={() => {
          setP(0);
          setStage("loading");
        }}
      />
    );

  return (
    <div className="animate-in fade-in duration-500">
      <button
        onClick={() => setStage("intro")}
        className="fixed right-4 top-4 z-10 rounded-full border bg-card/80 px-4 py-2 text-sm backdrop-blur transition hover:bg-accent active:scale-95"
      >
        ← Teoría
      </button>
      <Grapher />
    </div>
  );
}
