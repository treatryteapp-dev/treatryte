import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  FolderLock,
  MapPin,
  Wallet,
  ShieldCheck,
  Sparkles,
  Share2,
  Stethoscope,
  ArrowRight,
  Check,
  Menu,
} from "lucide-react";
import { useState } from "react";
import heroPhone from "@/assets/hero-phone.jpg";
import { Walkthrough } from "@/components/Walkthrough";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "TreatRyte — Your health, on time. In one place." },
      {
        name: "description",
        content:
          "TreatRyte is Nigeria's fintech-enabled digital health companion — medication alarms, a personal medical vault, transparent lab pricing, and secure record sharing.",
      },
      { property: "og:title", content: "TreatRyte — Your health, on time. In one place." },
      {
        property: "og:description",
        content:
          "Medication alarms, a personal medical vault, transparent lab pricing, and secure record sharing. Built for patients and clinical partners.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg font-bold tracking-tight text-navy">
        Treat<span className="text-primary">Ryte</span>
      </span>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#features", label: "Features" },
    { href: "#partners", label: "For Partners" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#download"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-navy-foreground shadow-soft transition hover:shadow-lift"
          >
            Get the app
          </a>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-navy md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#download"
              className="mt-2 rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-navy-foreground"
            >
              Get the app
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-hero-radial relative overflow-hidden">
      <div className="mx-auto grid max-w-[1280px] items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:min-h-[calc(100svh-73px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-8 xl:py-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Built for Nigeria's health economy
          </span>
          <h1 className="text-balance mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:mt-5 lg:text-6xl lg:leading-[1.05]">
            Your health, on time.{" "}
            <span className="text-primary">In one place.</span>
          </h1>
          <p className="text-balance mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            TreatRyte is the fintech-enabled health companion that keeps your
            meds on schedule, your records in your pocket, and lab pricing
            finally transparent.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#download"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              Download TreatRyte
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#partners"
              className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-6 py-3.5 text-sm font-semibold text-navy shadow-soft transition hover:shadow-lift"
            >
              I run a clinic
            </a>
          </div>
          <dl className="mt-6 grid max-w-lg grid-cols-3 gap-4 sm:gap-6">
            {[
              { k: "Free", v: "Med alarms forever" },
              { k: "Encrypted", v: "Personal vault" },
              { k: "Nomba", v: "Secure payments" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-2xl font-bold text-navy">{s.k}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/15 via-transparent to-emerald/15 blur-2xl" />
          <div className="animate-float mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-deep lg:aspect-[4/5] lg:h-[min(58svh,540px)] lg:w-auto lg:max-w-full xl:h-[min(62svh,580px)]">
            <img
              src={heroPhone}
              alt="TreatRyte mobile app preview"
              width={1280}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>

          <FloatingCard
            className="absolute -left-4 top-10 hidden sm:block"
            icon={<BellRing className="h-4 w-4 text-primary" />}
            title="Metformin • 8:00 AM"
            subtitle="Taken • logged with Dr. Ade"
          />
          <FloatingCard
            className="absolute -right-4 bottom-8 hidden sm:block"
            icon={<ShieldCheck className="h-4 w-4 text-emerald" />}
            title="Lab result received"
            subtitle="Filed to /Cardiology"
          />
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  className = "",
  icon,
  title,
  subtitle,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-border bg-white/95 p-3 pr-4 shadow-lift backdrop-blur ${className}`}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-navy">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: BellRing,
    title: "Medication alarms",
    body: "Offline-first reminders with dosage guidance and a running doctor's feedback log for every dose.",
    tag: "Free forever",
  },
  {
    icon: FolderLock,
    title: "Personal medical vault",
    body: "Structured folders like /Cardiology and /Diagnostics. Encrypted at rest. Yours to keep.",
    tag: "Freemium",
  },
  {
    icon: MapPin,
    title: "Transparent lab search",
    body: "Geolocated directory of diagnostic labs, dental and eye clinics — with published, itemized pricing.",
    tag: "Free forever",
  },
  {
    icon: Share2,
    title: "Granular record sharing",
    body: "Share a single report with a doctor, family member or specialist. Revoke access in one tap.",
    tag: "Freemium",
  },
  {
    icon: Wallet,
    title: "In-app wallet & billing",
    body: "Fund a wallet, receive itemized lab invoices, and pay instantly through Nomba's checkout.",
    tag: "Powered by Nomba",
  },
  {
    icon: Sparkles,
    title: "Outreach alerts",
    body: "Real-time push for free medical outreaches, vaccinations and health campaigns near you.",
    tag: "Free forever",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          For patients
        </span>
        <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Everything your health folder should have been.
        </h2>
        <p className="mt-4 text-muted-foreground">
          One app for medication adherence, medical records, transparent lab
          pricing, and payments — designed for how care actually works in
          Nigeria.
        </p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-navy">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
            <span className="mt-5 inline-flex items-center rounded-full bg-emerald/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald">
              {f.tag}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function Partners() {
  const items = [
    "Automated record issuing straight to patient vaults",
    "Your own transparent pricing page: treatryte.com/labs/your-clinic",
    "Role-based dashboard for admins, doctors, radiologists, receptionists",
    "AI lab-report interpretation with follow-up test recommendations",
  ];
  return (
    <section id="partners" className="bg-navy-radial text-navy-foreground">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary-glow">
            For clinical partners
          </span>
          <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A modern operating system for labs, dental and eye clinics.
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Publish transparent pricing, issue results digitally, and get paid
            faster — with an AI layer that reads reports the way clinicians do.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#download"
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              Apply as a partner
            </a>
            <a
              href="#pricing"
              className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See partner pricing
            </a>
          </div>
        </div>
        <ul className="grid gap-4">
          {items.map((it) => (
            <li
              key={it}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-glow">
                <Stethoscope className="h-4 w-4" />
              </div>
              <p className="min-w-0 text-sm leading-relaxed text-white/85">{it}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Patient — Free",
    price: "₦0",
    per: "forever",
    highlight: false,
    features: [
      "Unlimited medication alarms",
      "Up to 2 vault folders • 5 documents",
      "Transparent lab & clinic search",
      "1 active shared record",
    ],
    cta: "Download the app",
  },
  {
    name: "Patient — Premium",
    price: "₦2,500",
    per: "per month",
    highlight: true,
    features: [
      "Unlimited folders & nested subdirectories",
      "HD uploads & auto-classification",
      "Unlimited secure sharing with auto-expiry",
      "Priority support",
    ],
    cta: "Start premium",
  },
  {
    name: "Partner Portal",
    price: "Custom",
    per: "for clinics & labs",
    highlight: false,
    features: [
      "Public transparent pricing page",
      "Automated digital record issuing",
      "Multi-user roles & analytics",
      "AI clinical interpretation engine",
    ],
    cta: "Talk to sales",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Pricing
        </span>
        <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Free where it matters. Premium where it counts.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Adherence tools and clinic discovery are free forever. Upgrade only
          when your vault or workflow needs more.
        </p>
      </div>
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              p.highlight
                ? "border-primary/40 bg-gradient-to-br from-primary/[0.06] to-emerald/[0.06] shadow-lift"
                : "border-border bg-card shadow-soft"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                Most loved
              </span>
            )}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {p.name}
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-navy">{p.price}</span>
              <span className="text-sm text-muted-foreground">{p.per}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-navy/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#download"
              className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                p.highlight
                  ? "bg-primary text-primary-foreground shadow-glow hover:brightness-110"
                  : "border border-navy/15 bg-white text-navy hover:shadow-lift"
              }`}
            >
              {p.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Is TreatRyte free to use?",
    a: "Yes. Medication alarms, lab search, third-party upload invitations and outreach alerts are free forever. Premium unlocks unlimited vault storage and sharing.",
  },
  {
    q: "How are my records secured?",
    a: "Documents are encrypted and stored in your personal AWS S3 folder structure. You control who sees what, and you can revoke access instantly.",
  },
  {
    q: "How do payments work?",
    a: "Wallet funding, lab bills and subscriptions run on Nomba's Checkout and Subscription APIs — the same rails Nigerian businesses trust.",
  },
  {
    q: "Can my clinic join?",
    a: "Absolutely. Labs, dental practices and eye clinics can apply for a partner account to get a public pricing page, digital record issuing and AI report tools.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            FAQ
          </span>
          <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Answers before you ask.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Still curious? Reach us at{" "}
            <a href="mailto:hello@treatryte.com" className="text-primary underline-offset-4 hover:underline">
              hello@treatryte.com
            </a>
            .
          </p>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-soft">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-navy">
                <span className="text-base font-semibold">{f.q}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-navy transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="download" className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-navy px-8 py-16 text-center shadow-deep sm:px-16">
        <div className="bg-navy-radial absolute inset-0 opacity-90" />
        <div className="relative">
          <h2 className="text-balance mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Take your health with you — everywhere.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            Join thousands of Nigerians using TreatRyte to stay on top of
            medications, records and clinical bills.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#"
              className="rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              Download for iOS
            </a>
            <a
              href="#"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Download for Android
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <Logo />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TreatRyte. Made in Nigeria for healthier
          tomorrows.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <a href="#" className="hover:text-navy">Privacy</a>
          <a href="#" className="hover:text-navy">Terms</a>
          <a href="#" className="hover:text-navy">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Walkthrough />
        <Features />
        <Partners />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
