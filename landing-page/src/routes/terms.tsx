import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Stethoscope, User, Building2, FileText, Check, ArrowRight, Menu } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "TreatRyte — Terms of Service & Agreements" },
      { name: "description", content: "TreatRyte Terms of Service for Users and Clinical Partners." },
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
          <Link to="/terms" className="text-sm font-medium text-navy font-semibold">
            Terms of Service
          </Link>
          <Link to="/privacy" className="text-sm font-medium text-muted-foreground transition hover:text-navy">
            Privacy Policy
          </Link>
          <Link to="/security" className="text-sm font-medium text-muted-foreground transition hover:text-navy">
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
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
              Home
            </Link>
            <Link to="/terms" onClick={() => setOpen(false)} className="text-sm font-medium text-navy font-semibold">
              Terms of Service
            </Link>
            <Link to="/privacy" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
              Privacy Policy
            </Link>
            <Link to="/security" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
              Security
            </Link>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-navy px-5 py-2.5 text-center text-sm font-semibold text-navy-foreground"
            >
              Get the app
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-24">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-navy">
            Treat<span className="text-primary">Ryte</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TreatRyte. Made in Nigeria for healthier tomorrows.
        </p>
        <div className="flex gap-5 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-navy">Privacy</Link>
          <Link to="/terms" className="hover:text-navy">Terms</Link>
          <Link to="/security" className="hover:text-navy">Security</Link>
          <a href="mailto:alexegbuchulamginika@gmail.com" className="hover:text-navy">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function TermsPage() {
  const [activeTab, setActiveTab] = useState<"user" | "partner">("user");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Legal & Compliance
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-5xl">
            Terms of Service Agreements
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Review the legally binding terms governing your use of the TreatRyte mobile application and clinical partner web portal.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span>Document Version 1.0</span>
            <span>•</span>
            <span>Effective Date: July 4, 2026</span>
            <span>•</span>
            <span>Governing Jurisdiction: Federal Republic of Nigeria</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-card p-1.5 shadow-soft">
            <button
              onClick={() => setActiveTab("user")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition sm:px-8 sm:py-3.5 ${
                activeTab === "user"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              <User className="h-4 w-4" />
              <span>User Agreement (Patients)</span>
            </button>
            <button
              onClick={() => setActiveTab("partner")}
              className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition sm:px-8 sm:py-3.5 ${
                activeTab === "partner"
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-navy"
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Partner Agreement (Clinics & Labs)</span>
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10 lg:p-14">
          {activeTab === "user" ? <UserTermsContent /> : <PartnerTermsContent />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function UserTermsContent() {
  return (
    <div className="prose prose-slate max-w-none text-navy/85 space-y-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">TERMS OF SERVICE — User Agreement (Patient Mobile Application)</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Document Version 1.0 • Effective Date: July 4, 2026 • Governing Jurisdiction: Federal Republic of Nigeria • treatryte.app@gmail.com
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Preamble</h3>
        <p className="text-sm leading-relaxed">
          These Terms of Service ("Agreement" or "Terms") constitute a legally binding contract between you ("User," "Patient," or "you") and TreatRyte Technologies Limited ("TreatRyte," "we," "us," or "our"), governing your access to and use of the TreatRyte mobile application and all associated services.
        </p>
        <p className="text-sm leading-relaxed">
          TreatRyte is a dual-sided, fintech-enabled digital health platform designed for the Nigerian market. The mobile application provides patients with a personal health data vault on AWS S3, offline-first medication alarm management, a geolocation-enabled transparent directory of medical diagnostic laboratories and specialist clinics, secure granular record sharing, a digital wallet powered by the Nomba API Suite, and real-time push notifications for medical outreach programmes.
        </p>
        <p className="text-sm leading-relaxed">
          By downloading, installing, registering an account on, or otherwise using the TreatRyte application, you confirm that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree, you must not create an account or use the platform.
        </p>
        <p className="text-sm leading-relaxed">
          These Terms should be read together with the TreatRyte Privacy Policy, which is incorporated herein by reference and governs the collection, storage, and processing of your personal data.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 1: Eligibility and Account Registration</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">1.1 Eligibility</h4>
          <p className="text-sm leading-relaxed">
            To register a TreatRyte account, you must be at least 18 years of age and a legal resident of the Federal Republic of Nigeria. By creating an account, you represent and warrant that you meet these eligibility requirements. TreatRyte reserves the right to suspend or terminate any account where eligibility requirements are not met.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">1.2 Account Information Accuracy</h4>
          <p className="text-sm leading-relaxed">
            You agree to provide true, accurate, current, and complete information during registration and to update that information promptly whenever it changes. You acknowledge that providing false, misleading, or fraudulent registration information, including a false name, phone number, or email address, constitutes a material breach of these Terms and may result in immediate account suspension or permanent termination.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">1.3 Account Security</h4>
          <p className="text-sm leading-relaxed">
            You are solely responsible for maintaining the confidentiality of your account credentials, including your password. You agree not to share your login credentials with any other person. You must notify TreatRyte immediately at treatryte.app@gmail.com if you suspect any unauthorised access to your account. TreatRyte shall not be liable for any loss or damage arising from your failure to safeguard your account credentials.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">1.4 One Account Per User</h4>
          <p className="text-sm leading-relaxed">
            Each individual is permitted to maintain one registered account on the TreatRyte platform. The creation of duplicate or fraudulent accounts is prohibited and will result in the suspension of all associated accounts.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 2: No Medical Advice Disclaimer</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.1 Platform as Technical Infrastructure</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte is a technology infrastructure provider, a health data vault, and a payment gateway. The platform, including all of its features, tools, displays, and interfaces, does not provide medical advice, medical diagnoses, clinical assessments, treatment plans, or prescriptions of any kind.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.2 AI Interpretation Engine Disclaimer</h4>
          <p className="text-sm leading-relaxed">
            The AI-Driven Lab Report Interpretation Engine, which uses AWS Textract to generate plain-language summaries of laboratory results and suggest follow-up diagnostics, is an automated informational tool only. Its outputs are intended to help you understand the general content of your clinical results in accessible language. These AI-generated summaries and recommendations do not constitute a medical diagnosis, a clinical opinion, or a prescription, and must not be acted upon as such.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.3 Obligation to Consult a Practitioner</h4>
          <p className="text-sm leading-relaxed">
            You must always consult a qualified and duly licensed medical practitioner registered with the relevant Nigerian regulatory authority before making any decision regarding your health, medication, or medical treatment. TreatRyte expressly disclaims all liability for any health outcome, adverse event, or loss arising from reliance on any information displayed on the platform in substitution for professional medical advice.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.4 Medication Alarm Feature</h4>
          <p className="text-sm leading-relaxed">
            The Medication and Feedback Alarm feature is a scheduling convenience tool. It operates using local device notifications and functions in an offline-first capacity. You are expressly advised not to rely solely on the TreatRyte alarm feature as the only safeguard for critical or life-sustaining medication schedules. Mobile operating system restrictions, device settings, app updates, and background task limitations can interfere with notification delivery. TreatRyte accepts no liability for missed medication events attributable to notification failure.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 3: KYC, Wallet, and AML/CFT Compliance</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.1 Know Your Customer Requirements</h4>
          <p className="text-sm leading-relaxed">
            Access to the TreatRyte Digital Wallet, including the ability to fund your wallet, hold a balance, and execute payments for diagnostic invoices or subscription fees, requires successful completion of a Know Your Customer (KYC) identity verification process. This process is mandated by the Central Bank of Nigeria (CBN) Anti-Money Laundering and Counter-Financing of Terrorism (AML/CFT) regulatory framework applicable to fintech platforms.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.2 KYC Data Submission</h4>
          <p className="text-sm leading-relaxed">
            As part of KYC verification, you will be required to submit your Bank Verification Number (BVN) and National Identification Number (NIN). By submitting these identifiers, you consent to their secure transmission to Nomba Financial Services Limited for verification purposes. These identifiers are not retained in TreatRyte's primary database. You represent and warrant that all KYC information you provide is true, accurate, and belongs to you personally.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.3 AML/CFT Compliance Obligations</h4>
          <p className="text-sm leading-relaxed">
            You agree to use the TreatRyte Digital Wallet solely for lawful purposes. You warrant that no funds deposited into your TreatRyte wallet are derived from unlawful activities. You agree not to use the wallet for money laundering, terrorist financing, fraud, or any other activity prohibited under Nigerian law, including the Money Laundering (Prevention and Prohibition) Act 2022 and the Terrorism (Prevention and Prohibition) Act 2022. TreatRyte reserves the right to report suspicious transactions to relevant Nigerian authorities, including the Nigerian Financial Intelligence Unit (NFIU), as required by law.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.4 Wallet Operations</h4>
          <p className="text-sm leading-relaxed">
            The TreatRyte Digital Wallet is powered by the Nomba Checkout Gateway. You may fund your wallet using connected bank accounts, debit cards, or USSD channels supported by Nomba. Wallet funds may be used to pay for diagnostic test invoices issued by Partner laboratories and clinics, and to settle subscription renewal payments. All wallet transactions are processed by Nomba Financial Services Limited, whose own terms and conditions apply to payment processing operations.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 4: Subscription Tiers and Billing</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.1 Freemium Model</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte operates on a freemium model. All users may access the platform at no charge under the Free Tier, which includes the Medication Alarm feature, the Transparent Directory and Specialists Search, the Third-Party Upload Invitation feature, and the Medical Outreach Push System in their entirety. The Free Tier limits vault storage to a maximum of 2 folders and 5 documents, and limits record sharing to 1 active record shared with 1 external recipient at a time.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.2 Premium Subscription</h4>
          <p className="text-sm leading-relaxed">
            Users who elect to subscribe to the Premium Tier gain access to unlimited folder creation, nested sub-directory structures, high-definition document uploads, automatic file classification, and unlimited simultaneous secure record sharing with custom auto-expiry timers. Premium Tier billing is processed on a recurring monthly basis through the Nomba Subscription API.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.3 Automatic Renewal</h4>
          <p className="text-sm leading-relaxed">
            Premium Tier subscriptions renew automatically at the end of each billing cycle. Renewal charges are applied to your TreatRyte Digital Wallet or to the payment method on file with Nomba. Subscriptions continue to renew until you explicitly cancel before the commencement of the next billing cycle. TreatRyte will provide advance notice of any change to subscription pricing no fewer than 14 days before the new rate takes effect.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.4 Cancellation</h4>
          <p className="text-sm leading-relaxed">
            You may cancel your Premium Tier subscription at any time through the account settings within the application. Cancellation takes effect at the end of the current paid billing period. TreatRyte does not issue refunds for unused portions of a billing period following cancellation, except where required by applicable Nigerian consumer protection law.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.5 Diagnostic Invoices from Partners</h4>
          <p className="text-sm leading-relaxed">
            Partner laboratories and clinics may issue itemised digital invoices to you directly through the platform for pending diagnostic tests or specialist consultations. These invoices detail the specific tests or services, the applicable pricing published on the Partner's public storefront, and a direct payment option. Payment of Partner invoices is processed through the Nomba Checkout Gateway, with the platform commission split routed automatically before funds reach the Partner's wallet.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 5: Personal Medical Vault and Data Ownership</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.1 User Ownership of Health Data</h4>
          <p className="text-sm leading-relaxed">
            You retain absolute ownership of all health records, documents, images, and data that you upload into your Personal Medical Vault. TreatRyte does not claim any intellectual property rights over the contents of your vault. Your data belongs to you.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.2 TreatRyte's Limited Technical Licence</h4>
          <p className="text-sm leading-relaxed">
            By uploading documents to your vault, you grant TreatRyte a limited, non-exclusive, royalty-free technical licence to store, encrypt, retrieve, and transmit your data solely for the purpose of delivering the services described in these Terms. This licence does not extend to any commercial use, analysis, resale, or disclosure of your data to any third party, as further detailed in the TreatRyte Privacy Policy.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.3 Third-Party Upload Invitations</h4>
          <p className="text-sm leading-relaxed">
            When you generate a Third-Party Upload Invitation link or QR code and share it with an external unregistered practitioner or laboratory, you assume full responsibility for the consequences of that sharing decision. The invitation grants the third party the ability to upload new files to a designated folder only and does not expose your existing records. You acknowledge that once you distribute an invitation link or QR code, TreatRyte cannot prevent the intended or unintended use of that credential before it expires or is used.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.4 Granular Record Sharing</h4>
          <p className="text-sm leading-relaxed">
            When you use the Granular Record Sharing feature to share specific health records with a family member, friend, or medical practitioner, you accept sole responsibility for your choice of recipient. Free Tier users may maintain one active sharing link with one external recipient at a time. Premium Tier users may maintain unlimited simultaneous sharing links with custom expiry settings. You may revoke any active sharing grant at any time through the real-time audit console with immediate effect.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.5 Record Claiming from Partners</h4>
          <p className="text-sm leading-relaxed">
            Where a Partner laboratory or clinic has created a medical record on your behalf through their portal, you may claim ownership of that record within the TreatRyte application using the unique claim code issued by the Partner. Upon successful claim, the record is transferred into your vault and you assume full ownership and control. The Partner retains no ongoing access to the record following a successful claim unless you choose to share it back with them.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 6: Acceptable Use and Prohibited Conduct</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">6.1 Permitted Use</h4>
          <p className="text-sm leading-relaxed">
            You may use TreatRyte solely for lawful personal health management purposes as intended by the platform's design and as described in these Terms.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">6.2 Prohibited Conduct</h4>
          <p className="text-sm leading-relaxed">You agree not to engage in any of the following:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Uploading any document, image, or file that you do not own or have the lawful right to upload, including the health records of other individuals without their explicit consent.</li>
            <li>Using the platform to store, share, or transmit any content that is unlawful, defamatory, fraudulent, obscene, or in violation of the rights of any third party.</li>
            <li>Attempting to reverse engineer, decompile, disassemble, or otherwise tamper with any component of the TreatRyte application or its backend infrastructure.</li>
            <li>Using automated scripts, bots, crawlers, or scraping tools to access, extract, or interact with any part of the platform.</li>
            <li>Attempting to gain unauthorised access to any other user's account, vault, or data.</li>
            <li>Interfering with the security, integrity, or performance of the platform or its underlying infrastructure.</li>
            <li>Misrepresenting your identity, credentials, or relationship to another individual when using any feature of the platform.</li>
            <li>Using the platform to facilitate or conceal any unlawful financial transaction.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">6.3 Consequences of Prohibited Conduct</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte reserves the right to suspend or permanently terminate your account without prior notice if you engage in any prohibited conduct outlined in this section, or if your use of the platform poses a risk to TreatRyte, other users, or third parties. TreatRyte also reserves the right to report unlawful conduct to the appropriate Nigerian authorities.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 7: Limitation of Liability</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.1 Platform as Infrastructure</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte provides a technology infrastructure and data management platform. To the fullest extent permitted by applicable Nigerian law, TreatRyte shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the platform, including but not limited to damages for loss of data, loss of health records, missed medication events, incorrect diagnostic interpretations, or failed payment transactions.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.2 Third-Party Services</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte's financial services operate through Nomba Financial Services Limited. TreatRyte does not guarantee the continuous availability, accuracy, or error-free operation of Nomba's payment infrastructure. Any disputes relating to payment processing, wallet operations, or financial settlements must be directed to the relevant parties in accordance with Nomba's own terms of service.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.3 Partner-Issued Content</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte does not verify, endorse, or guarantee the accuracy, completeness, or clinical correctness of any laboratory result, diagnostic report, invoice, service listing, or pricing information uploaded or published by a Partner. Users are advised to verify clinical results and pricing directly with the issuing Partner before taking any action based on that information.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.4 Force Majeure</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte shall not be liable for any failure or delay in performance arising from causes beyond its reasonable control, including acts of God, governmental actions, internet infrastructure failures, cyberattacks, or natural disasters.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.5 Maximum Liability Cap</h4>
          <p className="text-sm leading-relaxed">
            Where liability cannot be excluded by law, TreatRyte's total aggregate liability to you for any claim arising under these Terms shall not exceed the total subscription fees paid by you to TreatRyte in the three months immediately preceding the event giving rise to the claim.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 8: Intellectual Property</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">8.1 Platform Ownership</h4>
          <p className="text-sm leading-relaxed">
            All intellectual property rights in the TreatRyte application, including its design, software, code, branding, trade marks, logos, user interface elements, and documentation, are owned exclusively by TreatRyte Technologies Limited or its licensors. Nothing in these Terms grants you any right, title, or interest in TreatRyte's intellectual property.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">8.2 Feedback</h4>
          <p className="text-sm leading-relaxed">
            If you submit feedback, suggestions, or ideas regarding the platform to TreatRyte, you grant TreatRyte a perpetual, irrevocable, royalty-free licence to use, implement, and incorporate that feedback without obligation or compensation to you.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 9: Account Suspension and Termination</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.1 Termination by You</h4>
          <p className="text-sm leading-relaxed">
            You may close your TreatRyte account at any time by submitting a deletion request through the application settings or by contacting treatryte.app@gmail.com. Prior to account closure, you are advised to export any health records you wish to retain, as deletion of your account initiates the permanent removal of your vault contents from AWS S3 following the 72-hour review window described in the Privacy Policy.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.2 Suspension or Termination by TreatRyte</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte reserves the right to suspend or permanently terminate your account at its discretion where you have breached these Terms, where your account poses a risk to the security or integrity of the platform, where required by a valid legal order, or where your Partner subscription payment has failed and cannot be recovered within the permitted grace period. Where account suspension is not emergency in nature, TreatRyte will endeavour to provide advance notice via your registered email address.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.3 Effect of Termination</h4>
          <p className="text-sm leading-relaxed">
            Upon account termination, your right to access the platform ceases immediately. Provisions of these Terms that by their nature survive termination, including the No Medical Advice Disclaimer, Limitation of Liability, Intellectual Property, and Governing Law clauses, shall continue in full force and effect.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 10: Changes to These Terms</h3>
        <p className="text-sm leading-relaxed">
          TreatRyte reserves the right to update or amend these Terms at any time. Where material changes are made, TreatRyte shall provide notice to registered users via in-app notification and by email to the registered account address no fewer than 14 days before the changes take effect. Your continued use of the platform after the effective date of any revision constitutes your acceptance of the updated Terms. If you do not accept the revised Terms, you must close your account before the effective date of the changes.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 11: Governing Law and Dispute Resolution</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">11.1 Governing Law</h4>
          <p className="text-sm leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023, the National Health Act 2014, the Consumer Protection Council Act, and all applicable CBN regulations.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">11.2 Amicable Resolution</h4>
          <p className="text-sm leading-relaxed">
            In the event of any dispute arising out of or in connection with these Terms, the parties shall first attempt to resolve the dispute through direct negotiation. You may initiate this process by contacting TreatRyte at treatryte.app@gmail.com. TreatRyte shall respond within 14 business days.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">11.3 Mediation</h4>
          <p className="text-sm leading-relaxed">
            If direct negotiation does not resolve the dispute within 30 days of initiation, the parties agree to refer the dispute to formal mediation administered in Lagos or Abuja, Nigeria, before either party may initiate court proceedings.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">11.4 Jurisdiction</h4>
          <p className="text-sm leading-relaxed">
            If mediation is unsuccessful, the dispute shall be submitted to the exclusive jurisdiction of the Federal High Court of Nigeria.
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
        <h4 className="text-base font-bold text-navy">Contact Information</h4>
        <p className="text-sm text-muted-foreground">
          For all inquiries, complaints, data subject rights requests, or account concerns arising from these Terms, please contact:
        </p>
        <p className="text-sm font-semibold text-navy">TreatRyte Technologies</p>
        <p className="text-sm">Email: <a href="mailto:treatryte.app@gmail.com" className="text-primary hover:underline">treatryte.app@gmail.com</a></p>
        <p className="text-sm">Postal Address: TreatRyte Technologies Limited, Asaba, Delta State, Nigeria</p>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border/60">
          <em>These Terms of Service were prepared in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023, the National Health Act 2014, and applicable Central Bank of Nigeria regulations.</em>
        </p>
      </div>
    </div>
  );
}

function PartnerTermsContent() {
  return (
    <div className="prose prose-slate max-w-none text-navy/85 space-y-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold text-navy sm:text-3xl">TERMS OF SERVICE — Partner & Clinic Terms of Service Agreement</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Document Version 1.0 • Effective Date: July 4, 2026 • Governing Jurisdiction: Federal Republic of Nigeria • treatryte.app@gmail.com
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Preamble</h3>
        <p className="text-sm leading-relaxed">
          This Partner & Clinic Terms of Service Agreement ("Agreement" or "Terms") constitutes a legally binding contract between TreatRyte Healthcare Technologies Ltd ("TreatRyte," "we," "us," or "our") and the corporate commercial legal entity, specifically being a registered diagnostic laboratory, dental clinic, eye specialist facility, or allied clinical healthcare provider, executing this Agreement via TreatRyte's multi-tenant digital onboarding interface (the "Partner," "Clinic," or "you").
        </p>
        <p className="text-sm leading-relaxed">
          WHEREAS, TreatRyte operates a highly specialized, proprietary, dual-sided, fintech-enabled health technology infrastructure consisting of a Node.js ecosystem, MongoDB data layers, AWS S3 secure cloud storage repositories, and integrated Nomba API banking suites (collectively, the "Platform"), facilitating direct medical diagnostic discovery, structural data management, and automated patient record routing.
        </p>
        <p className="text-sm leading-relaxed">
          WHEREAS, the Partner operates a licensed, legally compliant, physical clinical facility in Nigeria providing professional diagnostic laboratory testing, imaging, dental services, or optical clinical examinations, and desires to utilize TreatRyte's SaaS business management modules and Single Web Front Link to manage institutional operations, publish transparent commercial pricing schemas, and digitalize clinical deliverables.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 1: Cornerstone Definitions</h3>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            <strong>"AI Report Interpretation Engine"</strong> means the proprietary automated clinical natural language processing architecture embedded within the Platform which utilizes structural textual extraction via Amazon Web Services (AWS) Textract to translate dense, highly complex medical nomenclature into simplified, user-friendly conceptual terminology for the secondary educational reference of Patients.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>"Highly Confidential Health Information (HHI)"</strong> means all sensitive personal data, health status parameters, diagnostic profiles, biological assay metrics, medical imaging files, genetic records, clinical prescriptions, and physiological identifiers that constitute "Sensitive Personal Data" under the Nigeria Data Protection Act (NDPA) 2023.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>"Nomba APIs"</strong> means the suite of programmatic financial technology infrastructure application programming interfaces deployed by Nomba Financial Services Limited, including the Nomba Checkout Gateway for real-time automated merchant split payment routing and the Nomba Subscription API for recursive direct debit software-as-a-service billing management.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>"Patient Secure Vault"</strong> means the highly restricted, AES-256 encrypted, patient-controlled immutable cloud data directory hosted on AWS S3 within the TreatRyte ecosystem, engineered to receive, house, and isolate digital test records and diagnostic results.
          </p>
          <p className="text-sm leading-relaxed">
            <strong>"Single Web Front Link"</strong> means the unique, public-facing, search-engine-indexed digital storefront URL dynamically provisioned by the Platform for the Partner, displaying the Partner's operational schedule, inventory of diagnostic services, and binding itemized consumer pricing schemas.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 2: Medical Regulatory Compliance and Credentialing Warranty</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.1 Statutory Representations</h4>
          <p className="text-sm leading-relaxed">
            The Partner explicitly represents, warrants, and guarantees to TreatRyte that it is a legally established corporate entity validly existing under the laws of Nigeria, and holds all requisite operational licenses, permits, certifications, and active registrations mandated by relevant Nigerian medical regulatory bodies. These include, but are not limited to, the Medical Laboratory Science Council of Nigeria (MLSCN), the Medical and Dental Council of Nigeria (MDCN), the Optometrists and Dispensing Opticians Registration Board of Nigeria (ODORBN), and provincial State Ministries of Health, such as HEFAMAA in Lagos State.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.2 Mandatory Verification and Continuous Disclosure</h4>
          <p className="text-sm leading-relaxed">
            The Partner shall upload valid, current certified true copies of its regulatory operational licenses during platform onboarding. The Partner assumes an absolute, non-delegable duty to provide proof of renewal to TreatRyte at least fourteen (14) calendar days prior to the expiration of any statutory medical license. Any change in regulatory standing, disciplinary inquiry, or temporary suspension by a medical council must be disclosed to TreatRyte in writing within twenty-four (24) hours of its occurrence.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">2.3 Immediate Audit and Suspension Rights</h4>
          <p className="text-sm leading-relaxed">
            TreatRyte retains the absolute contractual right to execute periodic administrative or compliance audits of the Partner's uploaded credentials. Upon the Partner’s failure to produce unencumbered, authentic, and current statutory medical licensing data upon demand, TreatRyte reserves the right to instantly and without notice suspend or permanently terminate all portal access, remove the Partner’s Single Web Front Link from public directories, and freeze all outstanding net merchant settlements as liquidated damages for regulatory breach.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 3: Price Transparency and the Single Web Front Link</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.1 Legally Binding Storefront Pricing</h4>
          <p className="text-sm leading-relaxed">
            The Partner assumes sole and absolute responsibility for establishing, configuring, and maintaining the itemized pricing structures for its entire diagnostic menu published on its Single Web Front Link. The Partner explicitly covenants that all published costs are fully inclusive of all clinical materials, processing expenses, administrative overheads, and applicable government taxes. The published list pricing constitutes a firm, legally binding consumer offer.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">3.2 Strict Prohibition of Hidden Surcharges</h4>
          <p className="text-sm leading-relaxed">
            The Partner is strictly prohibited from demanding, levying, or extracting any additional, localized, hidden, or supplementary out-of-pocket charges, fees, or top-ups from a Patient who arrives at the physical clinic location possessing a fully pre-paid booking processed through the Platform. A breach of this section shall be deemed a material breach of this Agreement, granting TreatRyte the right to assess a penalty fee of One Hundred Thousand Naira (₦100,000.00) per occurrence or immediately terminate the Partner's account.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 4: Automated Record Issuing and Clinical Fiduciary Duties</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.1 Direct-to-Vault Upload Mandate</h4>
          <p className="text-sm leading-relaxed">
            The Partner shall utilize the TreatRyte Web Portal interface to process and distribute diagnostic outcomes. Authorized personnel must compile and transmit structured digital test results directly to the Patient’s profile identifier. This transaction automatically routes the record into the Patient's Secure Vault hosted within TreatRyte’s secure AWS S3 instance.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">4.2 Unconditional Liability for Clinical Accuracy</h4>
          <p className="text-sm leading-relaxed">
            The Partner represents and warrants that it maintains exclusive clinical oversight over all diagnostic activities. Consequently, the Partner assumes full, absolute, and exclusive medical, administrative, civil, and criminal liability for the technical precision, validity, diagnostic integrity, and clinical accuracy of any document, data payload, structured report, or PDF pushed or uploaded into the Patient’s Secure Vault. TreatRyte functions strictly as a technological pipeline and data hosting intermediary, disclaiming all responsibility for clinical interpretation, diagnostic discrepancies, or typographical errors in medical entries.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 5: Data Privacy and NDPA 2023 Compliance</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.1 Joint-Data Controller Structural Framework</h4>
          <p className="text-sm leading-relaxed">
            For the purposes of processing Highly Confidential Health Information (HHI) and associated personal data under this Agreement, TreatRyte and the Partner acknowledge that they operate as Joint-Data Controllers under the Nigeria Data Protection Act (NDPA) 2023. The Parties agree to strictly uphold all principles of data minimization, lawful processing, purpose limitation, and storage security.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.2 Institutional Security Safeguards</h4>
          <p className="text-sm leading-relaxed">
            The Partner covenants that it shall implement rigorous, state-of-the-art institutional, physical, and digital cybersecurity protocols to prevent unauthorized access to the TreatRyte Web Portal. The Partner shall explicitly ensure that its clinical, administrative, and general personnel do not extract, scrape, copy, screenshot, download, or unauthorizedly retain Patient personal information or diagnostic data outside the encrypted, secure Application infrastructure.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">5.3 Data Breach Reporting Obligations</h4>
          <p className="text-sm leading-relaxed">
            In the event of any security incident, malicious intrusion, or unauthorized credential access resulting in the actual or suspected exposure of HHI within the Partner's provisioned workspace, the Partner shall notify TreatRyte's Data Protection Officer in writing within twelve (12) hours. The Partner shall fully indemnify TreatRyte against all statutory regulatory fines levied by the Nigeria Data Protection Commission (NDPC) arising from a breach occurring under the Partner’s operational custody.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 6: Financial Settlements, Platform Commissions, and Subscription Defaults</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">6.1 Automated Transaction Routing and Split Commissions</h4>
          <p className="text-sm leading-relaxed">
            All consumer financial transactions for one-off diagnostic bookings generated via the Single Web Front Link shall be captured, authenticated, and processed via the integrated Nomba Checkout Gateway. The Partner expressly authorizes TreatRyte to execute real-time programmatic split payment routing at the payment gateway level. Upon consumer checkout confirmation, TreatRyte's fixed platform commission shall be instantaneously deducted and routed directly to TreatRyte's primary merchant wallet. The remaining net partner balance shall be programmatically settled into the Partner's designated bank account or settlement wallet in accordance with standard settlement cycles (T+1).
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">6.2 SaaS Premium Billing and Subscription Default</h4>
          <p className="text-sm leading-relaxed">
            Access to the advanced multi-tenant SaaS operational features, automated inventory tracking, advanced role-provisioning, and the AI Report Interpretation Engine requires an active recurring monthly subscription fee, billed via the Nomba Subscription API. If a Partner's monthly recurring subscription charge fails to clear on its designated billing anniversary due to insufficient funds or card revocation, TreatRyte reserves the absolute right to instantly degrade account permissions without liability. Account degradation includes, but is not limited to: masking the Partner's Single Web Front Link from public search engines, disabling multi-user administrative privileges, and completely deactivating the AI Report Interpretation Engine pipeline until all billing arrears are resolved in full.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 7: Multi-User Role Security and Absolute Vicarious Liability</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.1 Workspace Access Provisioning</h4>
          <p className="text-sm leading-relaxed">
            The Platform provides the Partner with a granular multi-tenant access control dashboard, allowing the Partner to provision distinct operational roles such as Admins, Doctors, Radiologists, Laboratory Technicians, and Receptionists. The Partner shall enforce strict credential hygiene and ensure each user account is tied to a verified single individual.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">7.2 Absolute Vicarious Liability</h4>
          <p className="text-sm leading-relaxed">
            The Partner corporate entity assumes 100% unconditional vicarious liability for all actions, omissions, data modifications, clinical record uploads, or communication strings executed within the Platform under any user account provisioned, authorized, or maintained within its workspace. The Partner explicitly agrees to indemnify, defend, and hold harmless TreatRyte, its directors, and technical infrastructure providers from any direct or consequential damages, insider malicious data breaches, identity theft, or unauthorized medical document alterations executed via the Partner's workspace credentials.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 8: AI-Driven Lab Report Interpretation Engine Disclaimer</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">8.1 Secondary Educational Nature</h4>
          <p className="text-sm leading-relaxed">
            The Partner explicitly acknowledges and agrees that the AI Report Interpretation Engine embedded within the Platform serves strictly as a secondary educational clarification utility designed to enhance general medical literacy for Patients. The output generated by the AI engine does not constitute professional medical advice, automated diagnosis, or definitive clinical opinion.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">8.2 The Professional Oversight Clause</h4>
          <p className="text-sm leading-relaxed">
            The deployment of the AI tool does not shift the clinical burden of care. The Partner's human medical experts and registered clinical specialists retain the sole, primary, non-delegable duty of interpreting all diagnostic results, counseling patients, providing therapeutic recommendations, and issuing final definitive diagnoses. The Partner agrees that it cannot rely on, nor cite, the AI-generated textual extractions as a defense in any medical malpractice, clinical negligence, or professional liability litigation.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 9: Indemnification, Limitation of Liability, and Dispute Resolution</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.1 Mutual Indemnification</h4>
          <p className="text-sm leading-relaxed">
            Each Party agrees to indemnify, defend, and hold harmless the other Party, its affiliates, directors, officers, and employees from and against any and all third-party claims, losses, liabilities, damages, regulatory fines, and reasonable legal costs arising directly out of a material breach of this Agreement or gross negligence, willful misconduct, or violation of applicable laws by the indemnifying Party.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.2 Limitation of Liability</h4>
          <p className="text-sm leading-relaxed">
            To the maximum extent permitted under Nigerian law, in no event shall TreatRyte be liable to the Partner for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data corruption, loss of goodwill, or business interruption, arising out of or in connection with the availability or performance of the Platform. TreatRyte's maximum aggregate financial liability under this Agreement for any cause of action whatsoever shall not exceed the total platform commissions retained by TreatRyte from transaction routing under the Partner's account during the three (3) month period immediately preceding the event giving rise to the claim.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.3 Governing Law</h4>
          <p className="text-sm leading-relaxed">
            This Agreement, its construction, validity, interpretation, and performance shall be governed exclusively by, and construed in accordance with, the substantive laws of the Federal Republic of Nigeria.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.4 Multi-Tiered Dispute Resolution</h4>
          <p className="text-sm leading-relaxed">
            In the event of any commercial, technical, or operational dispute, controversy, or claim arising out of or relating to this Agreement, including its formation, breach, or termination, the Parties shall first attempt to resolve the matter amicably through good-faith executive negotiations within fourteen (14) business days of written notice of a dispute. If negotiations fail, the dispute shall be referred to structured, confidential mediation administered at the Lagos Multi-Door Courthouse (LMDC) or the Lagos Chamber of Commerce International Arbitration Centre (LACIAC).
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">9.5 Binding Arbitration</h4>
          <p className="text-sm leading-relaxed">
            If the dispute is not resolved via mediation within thirty (30) calendar days from the commencement of such proceedings, it shall be finally referred to and resolved by binding commercial arbitration conducted in Lagos, Nigeria, in accordance with the Arbitration and Mediation Act, 2023. The arbitral tribunal shall consist of a single arbitrator mutually appointed by the Parties, or failing agreement, appointed by the Chairman of LACIAC. The language of the arbitration shall be English, and the arbitral award shall be final, definitive, and enforceable in any court of competent jurisdiction in Nigeria.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-navy">Section 10: General Miscellaneous Provisions</h3>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">10.1 Severability</h4>
          <p className="text-sm leading-relaxed">
            If any provision of this Agreement is held to be invalid, illegal, or unenforceable by an arbitral tribunal or court of competent jurisdiction, such provision shall be severed, and the remaining provisions of this Agreement shall continue in full force and effect.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">10.2 Non-Assignment</h4>
          <p className="text-sm leading-relaxed">
            The Partner shall not assign, transfer, delegate, or sub-contract any of its rights, privileges, or obligations under this Agreement to any third party without the prior written consent of TreatRyte. TreatRyte may freely assign its rights and obligations under this Agreement to any corporate successor or affiliate.
          </p>
        </div>
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-navy">10.3 Electronic Assent and App-Based Digital Onboarding</h4>
          <p className="text-sm leading-relaxed">
            The Parties explicitly acknowledge that executing this Agreement electronically via platform click-wrap, digital signature verification, or explicit electronic confirmation checkboxes within the TreatRyte portal creates a valid, legally enforceable, and instantly binding contract under the provisions of the Electronic Transactions Act and Nigerian commercial law. The Partner acknowledges that completing the digital onboarding application and accessing the portal constitutes comprehensive execution of this contract, rendering physical signature blocks redundant.
          </p>
        </div>
      </section>

      <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
        <p className="text-xs text-muted-foreground">
          <em>These Terms of Service were prepared in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023, the National Health Act 2014, and applicable Central Bank of Nigeria regulations.</em>
        </p>
      </div>
    </div>
  );
}
