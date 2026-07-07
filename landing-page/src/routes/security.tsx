import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Lock, FileText, Check, ArrowRight, Menu, Server, CreditCard, Key } from "lucide-react";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "TreatRyte — Security Architecture" },
      { name: "description", content: "TreatRyte Security Architecture and Compliance." },
    ],
  }),
});

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-navy">
            Treat<span className="text-primary">Ryte</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition hover:text-navy">
            Home
          </Link>
          <Link to="/terms" className="text-sm font-medium text-muted-foreground transition hover:text-navy">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-sm font-medium text-muted-foreground transition hover:text-navy">
            Privacy Policy
          </Link>
          <Link to="/security" className="text-sm font-medium text-navy font-semibold">
            Security
          </Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/"
            className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-navy-foreground shadow-soft transition hover:shadow-lift"
          >
            Get the app
          </Link>
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
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col space-y-4 p-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground">
              Home
            </Link>
            <Link to="/terms" className="text-sm font-medium text-muted-foreground">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm font-medium text-muted-foreground">
              Privacy Policy
            </Link>
            <Link to="/security" className="text-sm font-medium text-navy font-semibold">
              Security
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <Nav />
      <main>
        {/* Header Section */}
        <section className="relative overflow-hidden bg-navy pt-24 pb-32 text-navy-foreground">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-64 -right-64 h-96 w-96 rounded-full bg-primary/20 blur-3xl filter"></div>
          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Shield className="h-4 w-4" />
                <span>Security & Compliance</span>
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                TreatRyte Data Security & <span className="text-primary">Compliance Architecture</span>
              </h1>
              <p className="text-lg text-slate-300 sm:text-xl">
                Technical Whitepaper & Pitch Appendix
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative -mt-16 pb-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-border bg-card p-8 shadow-soft sm:p-12">
                <article className="prose prose-slate max-w-none prose-headings:text-navy prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                  <h2>Executive Summary</h2>
                  <p>
                    At TreatRyte, we recognize that health and financial data are deeply personal. Our platform is built on a foundation of <strong>bank-grade security protocols</strong>, ensuring that patient records remain entirely confidential, tamper-proof, and under the absolute control of the user. This document establishes the technical safeguards, architectural boundaries, and third-party integrations protecting user files, medical histories, and payment processing frameworks.
                  </p>

                  <h3 className="flex items-center gap-2 mt-8"><Lock className="h-5 w-5 text-primary" /> 1. Self-Sovereign Medical Record Security</h3>
                  <p>
                    Our core product philosophy centers on patient-controlled data ownership. We strictly isolate and shield personal medical histories from unauthorized third-party access through structural cryptographic boundaries.
                  </p>
                  <ul className="space-y-4 mt-4">
                    <li>
                      <strong>Encryption-at-Rest:</strong> All user health profiles, diagnostic results, and medical notes are stored using high-grade AES-256 encryption standards. Even in the unlikely event of database compromise, the underlying records remain entirely unreadable without the user's specific cryptographic access permissions.
                    </li>
                    <li>
                      <strong>Granular Sharing Controls:</strong> Through our Self-Sovereign Health Records model, users retain explicit ownership of their data. The frontend generates time-bound, secure sharing links, granting temporary view or download permissions exclusively to trusted specialists or verified clinics.
                    </li>
                    <li>
                      <strong>Data Isolation Architecture:</strong> Patient records are structurally decoupled from general application telemetry, operational logging layers, and basic identity access managers to eliminate data correlation or accidental exposure vectors.
                    </li>
                  </ul>

                  <h3 className="flex items-center gap-2 mt-12"><Server className="h-5 w-5 text-primary" /> 2. Infrastructure & Cloud Storage Security (AWS)</h3>
                  <p>
                    To store sensitive medical files, high-resolution laboratory reports, and prescription documents reliably, TreatRyte utilizes a secure, enterprise-grade cloud storage infrastructure.
                  </p>
                  <ul className="space-y-4 mt-4">
                    <li>
                      <strong>Encrypted Storage Vaults (AWS S3):</strong> All uploaded documents and personal medical files are hosted on Amazon Web Services (AWS) Simple Storage Service (S3). These buckets utilize automated Server-Side Encryption managed directly by AWS (SSE-S3/SSE-KMS).
                    </li>
                    <li>
                      <strong>Strict IAM Policies:</strong> Access to the underlying cloud storage layer is strictly regulated by the principle of least privilege. Direct public access to the S3 buckets is fundamentally blocked; only authorized backend processes can interact with the files.
                    </li>
                    <li>
                      <strong>Network Isolation & Transit:</strong> The backend framework acts as a secure proxy layer. All data transit between the Flutter mobile client and our cloud architecture occurs over securely encrypted HTTPS/TLS (TLS 1.3) communication channels.
                    </li>
                  </ul>

                  <h3 className="flex items-center gap-2 mt-12"><CreditCard className="h-5 w-5 text-primary" /> 3. Financial & Transactional Security (Nomba API Ecosystem)</h3>
                  <p>
                    Handling subscription billing plans and localized marketplace checkout operations requires robust fintech defense mechanisms. TreatRyte delegates high-risk financial processing to seasoned infrastructure providers to ensure zero exposure of user banking data.
                  </p>
                  <ul className="space-y-4 mt-4">
                    <li>
                      <strong>Tokenized Payment Gateways:</strong> By fully integrating the Nomba Checkout and Subscription APIs, TreatRyte never directly stores, transmits, or handles raw credit card numbers, CVVs, or sensitive pin/banking credentials on our application servers.
                    </li>
                    <li>
                      <strong>Secure API Handshakes:</strong> All interactions with the Nomba API ecosystem rely on strict cryptographic signatures, hidden private credentials, and server-to-server webhook verification to mitigate payload tampering during transactional loops.
                    </li>
                    <li>
                      <strong>End-to-End Encryption:</strong> Financial requests, payment confirmation states, and subscription sync logs are entirely protected using standard secure socket layers, completely shielding users against active man-in-the-middle attacks.
                    </li>
                  </ul>

                  <h3 className="flex items-center gap-2 mt-12"><Key className="h-5 w-5 text-primary" /> 4. Client-Side Integrity & Authentication</h3>
                  <p>
                    The application framework balances modern runtime performance with airtight edge-point security safeguards to guarantee a highly resilient user experience.
                  </p>
                  <ul className="space-y-4 mt-4">
                    <li>
                      <strong>Secure Authentication:</strong> User accounts, active session tokens, and administrative access privileges are guarded by highly secure hashing mechanisms on our application layer, successfully locking out automated or brute-force malicious attempts.
                    </li>
                    <li>
                      <strong>Mobile Runtime Security:</strong> Engineered with Flutter, the mobile client interfaces directly with native secure storage hardware layers found on iOS and Android devices to safely cache localized cryptographic keys and session state parameters.
                    </li>
                    <li>
                      <strong>Continuous Anomaly Detection:</strong> The backend architecture relies on rigid exception-handling frameworks to monitor, log, and instantly alert developers of operational anomalies, unauthorized access attempts, or edge vulnerabilities.
                    </li>
                  </ul>
                  
                  <div className="mt-12 bg-primary/10 rounded-xl p-6 border border-primary/20">
                    <h3 className="text-primary font-bold mt-0 flex items-center gap-2">Strategic Note</h3>
                    <ul className="mb-0 space-y-2 mt-4 text-sm font-medium text-navy/80">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span><strong>Direct User Reassurance:</strong> Transitioning from vague 'data protection' promises to an explicit, architecture-backed breakdown (AES-256, AWS S3, Node.js proxying) establishes deep technical credibility.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span><strong>Scope of Liability Reduction:</strong> Highlighting Nomba API tokenization proves that our platform minimizes PCI-DSS compliance overhead right from the MVP stage.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0" />
                        <span><strong>Production-Ready Ecosystem:</strong> Demonstrates that the interaction between Flutter (mobile client), Node.js (logic engine), AWS (secure vaulting), and Nomba (fintech ledger) is cohesive, secure, and ready for commercial scale.</span>
                      </li>
                    </ul>
                  </div>

                </article>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="mb-4 text-lg font-bold text-navy">Legal Directory</h3>
                  <div className="space-y-3">
                    <Link to="/privacy" className="flex items-center justify-between rounded-lg p-2 transition hover:bg-muted group">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-navy">Privacy Policy</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </Link>
                    <Link to="/terms" className="flex items-center justify-between rounded-lg p-2 transition hover:bg-muted group">
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-navy">Terms of Service</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                    </Link>
                    <Link to="/security" className="flex items-center justify-between rounded-lg bg-primary/10 p-2 group">
                      <span className="text-sm font-semibold text-primary">Security Architecture</span>
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl bg-navy p-6 text-navy-foreground shadow-soft">
                  <h3 className="mb-2 text-lg font-bold">Have Questions?</h3>
                  <p className="mb-4 text-sm text-slate-300">
                    If you have any questions regarding our security architecture or compliance protocols, our team is here to help.
                  </p>
                  <a
                    href="mailto:security@treatryte.com"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                  >
                    Contact Security
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-border/60 bg-muted/30 py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-navy opacity-50 grayscale">
              Treat<span className="text-primary">Ryte</span>
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm font-medium text-muted-foreground hover:text-navy">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm font-medium text-muted-foreground hover:text-navy">
              Terms
            </Link>
            <Link to="/security" className="text-sm font-medium text-navy">
              Security
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TreatRyte. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
