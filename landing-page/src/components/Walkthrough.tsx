import { useEffect, useRef, useState } from "react";
import { BellRing, FolderLock, MapPin, Wallet, Check, Plus, Search, ArrowUpRight, Pill, FileText, Heart } from "lucide-react";

type Step = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  {
    key: "alarms",
    eyebrow: "Step 01 · Adherence",
    title: "Never miss a dose again.",
    body:
      "Set offline-first medication alarms with dosage details and a doctor's feedback log for every pill.",
    icon: BellRing,
  },
  {
    key: "vault",
    eyebrow: "Step 02 · Ownership",
    title: "Your records, finally yours.",
    body:
      "Every lab result, scan and prescription filed into encrypted folders you control — /Cardiology, /Diagnostics, /Dental.",
    icon: FolderLock,
  },
  {
    key: "search",
    eyebrow: "Step 03 · Transparency",
    title: "See lab pricing before you go.",
    body:
      "Geolocated directory of labs and clinics with itemized pricing published up-front. No surprises at the counter.",
    icon: MapPin,
  },
  {
    key: "wallet",
    eyebrow: "Step 04 · Payment",
    title: "Pay bills the moment they arrive.",
    body:
      "Receive itemized lab invoices in-app and settle instantly with your Nomba-powered TreatRyte wallet.",
    icon: Wallet,
  },
];

/* ---------- Phone screens ---------- */

function ScreenChrome({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "teal" }) {
  return (
    <div
      className={`flex h-full w-full flex-col ${
        tone === "teal" ? "bg-gradient-to-b from-primary to-primary-glow text-white" : "bg-[#f7f9fb] text-navy"
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-4 text-[10px] font-semibold opacity-70">
        <span>9:41</span>
        <span>●●●</span>
      </div>
      {children}
    </div>
  );
}

function AlarmScreen() {
  const items = [
    { t: "Metformin", d: "500mg · with food", time: "8:00 AM", done: true },
    { t: "Lisinopril", d: "10mg · morning", time: "8:30 AM", done: true },
    { t: "Vitamin D3", d: "1000 IU", time: "1:00 PM", done: false },
    { t: "Atorvastatin", d: "20mg · night", time: "9:00 PM", done: false },
  ];
  return (
    <ScreenChrome tone="teal">
      <div className="px-5 pt-4">
        <p className="text-xs opacity-80">Today · Tue</p>
        <h4 className="mt-1 text-xl font-bold">Medication schedule</h4>
      </div>
      <div className="mt-4 flex-1 rounded-t-3xl bg-white p-4 text-navy">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Next up</p>
          <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-bold text-emerald">2 of 4 done</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {items.map((it) => (
            <div key={it.t} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${it.done ? "bg-emerald/15 text-emerald" : "bg-primary/10 text-primary"}`}>
                {it.done ? <Check className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{it.t}</p>
                <p className="truncate text-[10px] text-muted-foreground">{it.d}</p>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground">{it.time}</span>
            </div>
          ))}
        </div>
      </div>
    </ScreenChrome>
  );
}

function VaultScreen() {
  const folders = [
    { n: "Cardiology", c: 12, color: "bg-primary/10 text-primary" },
    { n: "Diagnostics", c: 8, color: "bg-emerald/15 text-emerald" },
    { n: "Dental", c: 4, color: "bg-[#f0d78c]/40 text-[#8a6d0a]" },
    { n: "Prescriptions", c: 21, color: "bg-primary/10 text-primary" },
  ];
  return (
    <ScreenChrome>
      <div className="px-5 pt-4">
        <p className="text-xs text-muted-foreground">Personal vault</p>
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold">My folders</h4>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid flex-1 grid-cols-2 gap-3 px-5 pb-5">
        {folders.map((f) => (
          <div key={f.n} className="flex flex-col justify-between rounded-2xl bg-white p-3 shadow-soft">
            <div className={`grid h-9 w-9 place-items-center rounded-xl ${f.color}`}>
              <FolderLock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">{f.n}</p>
              <p className="text-[10px] text-muted-foreground">{f.c} documents</p>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-soft">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald/15 text-emerald">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">Lipid panel — Sept 12</p>
            <p className="truncate text-[10px] text-muted-foreground">Care Diagnostics · verified</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </ScreenChrome>
  );
}

function SearchScreen() {
  const labs = [
    { n: "Care Diagnostics", d: "2.1 km · Ikeja", p: "₦4,500", t: "Full blood count" },
    { n: "MediPro Labs", d: "3.4 km · Yaba", p: "₦6,200", t: "Lipid panel" },
    { n: "Vision Plus Clinic", d: "1.8 km · Surulere", p: "₦8,000", t: "Eye exam" },
  ];
  return (
    <ScreenChrome>
      <div className="px-5 pt-4">
        <p className="text-xs text-muted-foreground">Discover</p>
        <h4 className="text-xl font-bold">Labs near you</h4>
        <div className="mt-3 flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Full blood count</span>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-2.5 px-5 pb-5">
        {labs.map((l) => (
          <div key={l.n} className="rounded-2xl bg-white p-3 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{l.n}</p>
                <p className="truncate text-[10px] text-muted-foreground">{l.d}</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {l.p}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-[10px] text-muted-foreground">{l.t}</span>
              <span className="text-[10px] font-semibold text-primary">Book →</span>
            </div>
          </div>
        ))}
      </div>
    </ScreenChrome>
  );
}

function WalletScreen() {
  return (
    <ScreenChrome>
      <div className="px-5 pt-4">
        <p className="text-xs text-muted-foreground">TreatRyte wallet</p>
        <h4 className="text-xl font-bold">₦48,200.00</h4>
      </div>
      <div className="mx-5 mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy/80 p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest opacity-70">Debit</span>
          <Heart className="h-3.5 w-3.5 text-primary-glow" />
        </div>
        <p className="mt-6 font-mono text-sm tracking-widest">•••• •••• •••• 4021</p>
        <div className="mt-2 flex justify-between text-[10px] opacity-70">
          <span>Powered by Nomba</span>
          <span>12/28</span>
        </div>
      </div>
      <div className="mt-4 flex-1 px-5 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Pending invoices
        </p>
        <div className="mt-2 space-y-2">
          {[
            { n: "Care Diagnostics", d: "Full blood count", a: "₦4,500" },
            { n: "Vision Plus Clinic", d: "Consultation", a: "₦12,000" },
          ].map((i) => (
            <div key={i.n} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-soft">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{i.n}</p>
                <p className="truncate text-[10px] text-muted-foreground">{i.d}</p>
              </div>
              <button className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-primary-foreground">
                Pay {i.a}
              </button>
            </div>
          ))}
        </div>
      </div>
    </ScreenChrome>
  );
}

const screens: Record<string, React.ReactNode> = {
  alarms: <AlarmScreen />,
  vault: <VaultScreen />,
  search: <SearchScreen />,
  wallet: <WalletScreen />,
};

/* ---------- Phone shell ---------- */

function Phone({ activeKey }: { activeKey: string }) {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[320px]">
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/20 via-transparent to-emerald/15 blur-2xl" />
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.75rem] border-[10px] border-navy bg-navy shadow-deep">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-navy" />
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
          {steps.map((s) => (
            <div
              key={s.key}
              className={`absolute inset-0 transition-all duration-500 ease-out ${
                activeKey === s.key
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none opacity-0 translate-y-4"
              }`}
            >
              {screens[s.key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Section ---------- */

export function Walkthrough() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    stepRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeKey = steps[active].key;

  return (
    <section id="walkthrough" className="relative border-y border-border bg-background">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            The walkthrough
          </span>
          <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Scroll through a day with TreatRyte.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From your morning meds to the moment a lab bill lands — see how the
            whole loop plays out.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1.05fr]">
          {/* Sticky phone */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Phone activeKey={activeKey} />
              <div className="mx-auto mt-8 flex w-40 justify-between">
                {steps.map((s, i) => (
                  <span
                    key={s.key}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === active ? "w-8 bg-primary" : "w-2 bg-navy/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: single phone above steps */}
          <div className="lg:hidden">
            <div className="sticky top-20 z-10 -mx-4 flex justify-center bg-background/85 py-4 backdrop-blur">
              <div className="scale-[0.7] origin-top">
                <Phone activeKey={activeKey} />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-24 lg:space-y-40 lg:pb-[60vh]">
            {steps.map((s, i) => (
              <div
                key={s.key}
                data-idx={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={`transition-all duration-500 ${
                  i === active ? "opacity-100" : "opacity-40"
                }`}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {s.eyebrow}
                </p>
                <h3 className="text-balance mt-2 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
