import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BellRing,
  FolderLock,
  MapPin,
  Wallet,
  ShieldCheck,
  Activity,
  Users,
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
    { href: "#patients", label: "For Patients" },
    { href: "#partners", label: "For Partners" },
    { href: "#patient-pricing", label: "Patient Pricing" },
    { href: "#partner-pricing", label: "Partner Pricing" },
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
            <Activity className="h-3.5 w-3.5" /> Built for Nigeria's health economy
          </span>
          <h1 className="text-balance mt-4 text-4xl font-bold tracking-tight text-navy sm:text-5xl lg:mt-5 lg:text-6xl lg:leading-[1.05]">
            Your health, on time.{" "}
            <span className="text-primary">In one place.</span>
          </h1>
          <p className="text-balance mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            TreatRyte is a patient-centric healthcare mobile application that empowers users to manage medication schedules, compare transparent diagnostic pricing, and securely own their personal medical records.
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

const patientFeatures = [
  {
    icon: BellRing,
    title: "Medication Alarms & Logs",
    body: "Unlimited reminders with dosage guidance and Doctor's Feedback logs to promote 100% adherence.",
    tag: "Free forever",
  },
  {
    icon: MapPin,
    title: "Transparent Clinic Search",
    body: "Search geolocated diagnostic labs, dental practices, and eye clinics with published itemized pricing.",
    tag: "Free forever",
  },
  {
    icon: FolderLock,
    title: "Digital Medical Vault",
    body: "Structured encrypted storage with custom folders like /Cardiology and /Diagnostics. Yours for life.",
    tag: "Tiered Vault",
  },
  {
    icon: Share2,
    title: "Secure Record Sharing",
    body: "Active sharing with customized link expiration timers (up to 30 days) and one-tap manual revocation.",
    tag: "Granular Control",
  },
  {
    icon: Wallet,
    title: "Third-Party Uploads",
    body: "Receive test reports directly into your personal vault via secure invitation links for external clinics.",
    tag: "Instant Delivery",
  },
  {
    icon: Users,
    title: "Community & Outreaches",
    body: "Get real-time notifications for local medical outreaches, health campaigns, and vaccination drives.",
    tag: "Community",
  },
];

function PatientsSection() {
  return (
    <section id="patients" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <span id="features" className="sr-only" />
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          For Patients
        </span>
        <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Everything your health folder should have been.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Take full control of your clinical journey with smart adherence alarms, personal vault folders, transparent lab discovery, and secure sharing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="#patient-pricing"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
          >
            See Patient Pricing
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-6 py-3.5 text-sm font-semibold text-navy shadow-soft transition hover:shadow-lift"
          >
            Download the App
          </a>
        </div>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {patientFeatures.map((f) => (
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

function PartnersSection() {
  const partnerHighlights = [
    {
      title: "Public Storefront & Directory",
      desc: "Custom web storefront displaying your working hours, specialist bios, and published itemized pricing.",
    },
    {
      title: "Automated Digital Dispatch",
      desc: "Issue test reports and invoices directly to patient digital vaults and wallets instantly.",
    },
    {
      title: "Role-Based Staff Dashboard",
      desc: "Provision secure accounts for clinic admins, doctors, lab technicians, and receptionists.",
    },
    {
      title: "AI Clinical Interpretation",
      desc: "Automated report translation engine that interprets test values and recommends logical follow-up diagnostics.",
    },
  ];

  return (
    <section id="partners" className="bg-navy-radial text-navy-foreground">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-glow">
            For Clinical Partners
          </span>
          <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            A modern operating system for labs, dental and eye clinics.
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Automate workflows, publish transparent pricing, issue test results digitally to patient vaults, and process payments seamlessly on Nomba rails.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#partner-pricing"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              See Partner Pricing
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="#download"
              className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Apply as a Partner
            </a>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {partnerHighlights.map((it) => (
            <div
              key={it.title}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary-glow">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{it.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const patientPlans = [
  {
    badge: "Tier 1",
    name: "Free Tier (Basic Care)",
    price: "₦0",
    per: "/ month",
    subtitle: "Casual users seeking medication reminders & clinic comparisons.",
    highlight: false,
    features: [
      "Unlimited Medication Alarms with Doctor's Feedback logs",
      "Free Diagnostic Directory search with transparent pricing",
      "Digital Vault: Up to 5 medical records across 2 folders",
      "Active record sharing (1 record to 1 recipient, 24hr expiry)",
      "Free third-party clinic upload invitation links",
      "Local medical outreach notifications",
    ],
    cta: "Get Started Free",
    ctaHref: "#download",
  },
  {
    badge: "Tier 2",
    name: "Health Plus (Personal Vault)",
    price: "₦1,200",
    per: "/ month",
    subtitle: "Or ₦12,000 billed annually. For ongoing chronic & diagnostic care.",
    highlight: true,
    features: [
      "Everything in Free Tier",
      "Storage for up to 100 medical records across 10 custom folders",
      "Secure sharing of up to 5 records simultaneously",
      "Customized link expiration timers (up to 30 days) & revocation",
      "100% Ad-Free experience inside the app",
    ],
    cta: "Upgrade to Health Plus",
    ctaHref: "#download",
  },
  {
    badge: "Tier 3",
    name: "Health Premium (Family Vault)",
    price: "₦3,500",
    per: "/ month",
    subtitle: "Or ₦35,000 billed annually. For family management & heavy histories.",
    highlight: false,
    features: [
      "Everything in Health Plus",
      "Unlimited document uploads & sub-directory structures",
      "Family Account Linking: manage up to 4 sub-profiles",
      "Unlimited simultaneous sharing links & permissions",
      "Priority access to AI-translated record summaries",
    ],
    cta: "Start Family Vault",
    ctaHref: "#download",
  },
];

function PatientPricing() {
  return (
    <section id="patient-pricing" className="mx-auto max-w-[1280px] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
          Patient Subscription Tiers
        </span>
        <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          Plans designed for personal health security.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Core medication alarms and clinic search are 100% free. Scale your encrypted vault storage and family sharing as your needs evolve.
        </p>
      </div>
      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {patientPlans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col justify-between rounded-2xl border p-8 ${
              p.highlight
                ? "border-primary/40 bg-gradient-to-br from-primary/[0.06] to-emerald/[0.06] shadow-lift ring-1 ring-primary/20"
                : "border-border bg-card shadow-soft"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {p.badge}
                </span>
                {p.highlight && (
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Recommended
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-xl font-bold text-navy">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.subtitle}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-navy">{p.price}</span>
                <span className="text-sm font-medium text-muted-foreground">{p.per}</span>
              </div>
              <ul className="mt-6 space-y-3.5 border-t border-border/60 pt-6 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-navy/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href={p.ctaHref}
              className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition ${
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

const partnerPlans = [
  {
    badge: "Tier 1",
    name: "Starter Partner (Pay-As-You-Go)",
    price: "₦0",
    per: "/ month base fee",
    subtitle: "2.5% platform fee on directory storefront checkouts.",
    highlight: false,
    features: [
      "Web Storefront with working hours & transparent pricing",
      "Basic Billing: issue digital invoices (up to 30/month)",
      "Record Dispatch: manually send up to 50 results/month",
      "Staff Management: up to 2 staff accounts (Admin, Receptionist)",
      "Nomba Transaction Splits integration",
    ],
    cta: "Join Starter Partner",
    ctaHref: "#download",
  },
  {
    badge: "Tier 2",
    name: "Growth Suite (Automated Clinic)",
    price: "₦15,000",
    per: "/ month via Nomba",
    subtitle: "Reduced 1.5% platform fee. For established diagnostic labs.",
    highlight: true,
    features: [
      "Everything in Starter Partner",
      "Unlimited Billing & automated health record dispatch",
      "Custom Branding: custom banners, bios & contact widgets",
      "Up to 10 staff accounts with role-based access control",
      "Monthly downloadable clinic analytics & performance reports",
    ],
    cta: "Enroll in Growth Suite",
    ctaHref: "#download",
  },
  {
    badge: "Tier 3",
    name: "Enterprise Health Suite (AI & Multi-Branch)",
    price: "₦45,000",
    per: "/ month via Nomba",
    subtitle: "Lowest 1.0% platform fee. For hospital networks & multi-branch labs.",
    highlight: false,
    features: [
      "Everything in Growth Suite",
      "AI Clinical Translation Engine & follow-up test recommendations",
      "Multi-Branch Portal: manage up to 5 physical locations",
      "Unlimited role-based staff accounts across all branches",
      "Priority Webhook API integration for clinic LIMS systems",
    ],
    cta: "Contact Enterprise Team",
    ctaHref: "mailto:partners@treatryte.com",
  },
];

function PartnerPricing() {
  return (
    <section id="partner-pricing" className="border-t border-border/60 bg-muted/40 py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-navy/20 bg-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-navy">
            Partner Subscription Tiers
          </span>
          <h2 className="text-balance mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Predictable pricing for modern healthcare businesses.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connect directly with patients, dispatch lab results seamlessly, and reduce overhead with automated Nomba billing infrastructure.
          </p>
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {partnerPlans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col justify-between rounded-2xl border p-8 ${
                p.highlight
                  ? "border-primary/40 bg-gradient-to-br from-primary/[0.06] to-emerald/[0.06] shadow-lift ring-1 ring-primary/20 bg-card"
                  : "border-border bg-card shadow-soft"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {p.badge}
                  </span>
                  {p.highlight && (
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      Best Value
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-xl font-bold text-navy">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.subtitle}</p>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-navy">{p.price}</span>
                  <span className="text-sm font-medium text-muted-foreground">{p.per}</span>
                </div>
                <ul className="mt-6 space-y-3.5 border-t border-border/60 pt-6 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-navy/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={p.ctaHref}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition ${
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
            <a href="mailto:alexegbuchulamginika@gmail.com" className="text-primary underline-offset-4 hover:underline">
              alexegbuchulamginika@gmail.com
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
            <a
              href="#"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              For Web
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
          <Link to="/privacy" className="hover:text-navy">Privacy</Link>
          <Link to="/terms" className="hover:text-navy">Terms</Link>
          <a href="mailto:alexegbuchulamginika@gmail.com" className="hover:text-navy">Contact</a>
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
        <PatientsSection />
        <PartnersSection />
        <PatientPricing />
        <PartnerPricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
