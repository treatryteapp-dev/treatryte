import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Lock, FileText, Check, ArrowRight, Menu } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "TreatRyte — Privacy Policy" },
      { name: "description", content: "TreatRyte Privacy Policy governing personal health data and platform usage." },
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
          <Link to="/privacy" className="text-sm font-medium text-navy font-semibold">
            Privacy Policy
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
            <Link to="/terms" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
              Terms of Service
            </Link>
            <Link to="/privacy" onClick={() => setOpen(false)} className="text-sm font-medium text-navy font-semibold">
              Privacy Policy
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
          <a href="mailto:alexegbuchulamginika@gmail.com" className="hover:text-navy">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6 lg:py-16">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Data Protection & Security
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-navy sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            How we protect, process, and respect your personal health data and financial records under Nigerian and international data protection standards.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span>Document Version 1.0</span>
            <span>•</span>
            <span>Effective Date: July 4, 2026</span>
            <span>•</span>
            <span>Governing Jurisdiction: Federal Republic of Nigeria</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="mt-12 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10 lg:p-14">
          <div className="prose prose-slate max-w-none text-navy/85 space-y-8">
            <div className="border-b border-border pb-6">
              <h2 className="text-2xl font-bold text-navy sm:text-3xl">PRIVACY POLICY</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Document Version 1.0 • Effective Date: July 4, 2026 • Governing Jurisdiction: Federal Republic of Nigeria • treatryte.app@gmail.com
              </p>
            </div>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Preamble</h3>
              <p className="text-sm leading-relaxed">
                TreatRyte (referred to throughout this document as "TreatRyte," "the Platform," "we," "us," or "our") is a dual-sided, fintech-enabled digital health platform developed and operated by TreatRyte Technologies Limited, a company incorporated under the laws of the Federal Republic of Nigeria. The platform bridges patient care, medical data self-sovereignty, and fintech payment efficiency for the Nigerian market.
              </p>
              <p className="text-sm leading-relaxed">
                For patients, TreatRyte provides a personal health data vault with structured folder storage on AWS S3, offline-first medication alarm management, a transparent geolocation-enabled diagnostic lab and specialist directory, secure granular record sharing, and an in-app digital wallet powered by the Nomba API Suite.
              </p>
              <p className="text-sm leading-relaxed">
                For clinical and diagnostic partners, including medical laboratories, dental practices, and specialist eye clinics, TreatRyte provides a web portal featuring automated digital record dispatch to patient vaults, a dedicated public-facing pricing storefront, role-based multi-user staff management, and an AI-driven lab report interpretation engine powered by AWS Textract.
              </p>
              <p className="text-sm leading-relaxed">
                This Privacy Policy ("Policy") is a binding legal instrument governing the collection, storage, processing, transfer, disclosure, and deletion of all personal data and sensitive health information submitted to, generated by, or transmitted through the TreatRyte platform. It applies to every individual who uses the TreatRyte mobile application ("User" or "Patient") and to every clinical or diagnostic entity registered as a business partner through the TreatRyte web portal ("Partner").
              </p>
              <p className="text-sm leading-relaxed">
                This Policy is enacted in strict compliance with the Nigeria Data Protection Act 2023 (NDPA 2023), the General Application and Implementation Directive 2025 (GAID 2025) issued by the Nigeria Data Protection Commission (NDPC), and the National Health Act 2014 (NHA 2014). Where internationally recognised best practices exceed Nigerian minimum standards, TreatRyte voluntarily applies the higher standard.
              </p>
              <p className="text-sm leading-relaxed">
                By creating an account, accessing the platform, uploading any document, processing any payment, or using any feature of TreatRyte, you acknowledge that you have read, understood, and unconditionally agreed to the terms of this Policy in full. If you do not agree, you must immediately discontinue use of the platform.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 1: Identity of the Data Controller</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">1.1 Controller Identity</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte Technologies Limited is the Data Controller of all personal data processed through the TreatRyte platform with respect to its registered users and platform visitors. TreatRyte determines the purposes for which, and the means by which, personal data is processed, and accordingly bears the primary legal obligations established under the NDPA 2023.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">1.2 Data Controller of Major Importance</h4>
                <p className="text-sm leading-relaxed">
                  By virtue of processing Sensitive Personal Data as defined under Section 30 of the NDPA 2023, including personal health information, medical imaging, laboratory results, financial records, biometric-linked wallet identity verification data, and medication consumption logs, TreatRyte qualifies as a Data Controller of Major Importance. TreatRyte registers itself as such with the NDPC and shall annually renew its registration and compliance audit obligations as required by applicable directives.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">1.3 Data Protection Officer</h4>
                <p className="text-sm leading-relaxed">
                  In accordance with its obligations as a Data Controller of Major Importance, TreatRyte designates a Data Protection Officer (DPO). The DPO oversees all data protection activities, ensures regulatory compliance, manages data subject rights requests, and serves as the primary point of contact with the NDPC.
                </p>
                <div className="rounded-xl bg-muted/40 p-4 text-sm space-y-1">
                  <p><strong>Email:</strong> <a href="mailto:treatryte.app@gmail.com" className="text-primary hover:underline">treatryte.app@gmail.com</a></p>
                  <p><strong>Postal Address:</strong> TreatRyte Technologies Limited, Asaba, Delta State, Nigeria</p>
                  <p><strong>Response Commitment:</strong> Acknowledgment within 48 hours; substantive response within 30 calendar days.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 2: Categories of Personal Data Collected</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">2.1 Patient and User Data</h4>
                <div className="space-y-2">
                  <h5 className="text-sm font-bold text-navy">2.1.1 Identity and Account Data</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Full legal name and preferred display name.</li>
                    <li>Date of birth.</li>
                    <li>Nigerian phone number and verified email address.</li>
                    <li>Bank Verification Number (BVN) and National Identification Number (NIN), collected solely for Know Your Customer (KYC) identity verification as required by the Central Bank of Nigeria (CBN) Anti-Money Laundering and Counter-Financing of Terrorism (AML/CFT) regulatory framework when operating the Nomba-powered TreatRyte Digital Wallet. These identifiers are transmitted securely to Nomba Financial Services Limited for verification and are not retained in TreatRyte's primary database.</li>
                    <li>Account credentials stored exclusively in hashed and salted form. TreatRyte does not store plaintext passwords under any circumstances.</li>
                  </ul>
                </div>
                <div className="space-y-2 pt-2">
                  <h5 className="text-sm font-bold text-navy">2.1.2 Medical and Health Records (Sensitive Personal Data)</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>All documents uploaded by the user into their Personal Medical Vault, including laboratory result reports in PDF or image format, radiology results, specialist consultation notes, prescription documents, and medical certificates.</li>
                    <li>Folder metadata associated with each document, including folder name, creation timestamp, modification timestamp, and document count. Free Tier users may maintain up to 2 folders and 5 documents. Premium Tier users benefit from unlimited folder creation, nested sub-directories, and high-definition uploads.</li>
                    <li>Medication names, dosage specifications, frequency schedules, and prescribing practitioner notes entered into the Medication Alarm feature.</li>
                    <li>Post-dose symptom feedback submitted through the interactive Doctor's Feedback log, including user-selected tags indicating wellness status, nausea, and dizziness.</li>
                    <li>AI-generated plain-language summaries and follow-up diagnostic recommendations produced by the AWS Textract-powered Lab Report Interpretation Engine when a Partner activates this feature on a document associated with the user. Users are notified when this processing occurs.</li>
                  </ul>
                </div>
                <div className="space-y-2 pt-2">
                  <h5 className="text-sm font-bold text-navy">2.1.3 Financial and Transaction Data</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>TreatRyte Digital Wallet balance and funding history, processed and held via the Nomba Checkout Gateway.</li>
                    <li>Records of all payment transactions executed through the platform, including diagnostic test invoice payments, subscription renewal payments, and wallet funding events.</li>
                    <li>Nomba-issued transaction reference numbers and receipts.</li>
                    <li>Itemised invoices received from Partner laboratories and clinics, including the lab name, test description, and amount payable.</li>
                  </ul>
                </div>
                <div className="space-y-2 pt-2">
                  <h5 className="text-sm font-bold text-navy">2.1.4 Location and Device Data</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Approximate geolocation data, collected only when the user actively uses the Transparent Directory and Specialists Search feature, for the sole purpose of returning geographically relevant results for nearby labs and clinics.</li>
                    <li>Device identifiers, operating system version, and app version, collected for the purpose of delivering offline-first local medication alarm notifications and proximity-based medical outreach push alerts.</li>
                  </ul>
                </div>
                <div className="space-y-2 pt-2">
                  <h5 className="text-sm font-bold text-navy">2.1.5 Usage and Audit Data</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Anonymised or pseudonymised in-app navigation patterns and session metrics, collected for product improvement purposes only.</li>
                    <li>Audit logs of third-party record sharing events, including recipient identifiers, token generation timestamps, access timestamps, and revocation timestamps, displayed to the user in real time through the Access Control console.</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-border/60">
                <h4 className="text-base font-semibold text-navy">2.2 Partner Data</h4>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Legal entity name, Corporate Affairs Commission (CAC) registration number, and Certificate of Incorporation.</li>
                  <li>Operational address, geolocation coordinates for directory listing, and verified business phone number and email address.</li>
                  <li>Names, professional credentials, regulatory registration numbers, and role designations of all employee accounts provisioned under the Partner's multi-user management dashboard, covering Admins, Doctors, Radiologists, and Receptionists.</li>
                  <li>Service listings, itemised pricing schedules, and operational hours published on the Partner's dedicated public storefront link.</li>
                  <li>Government-issued identification documents, CAC documentation, phone number, and email address submitted during the mandatory partner onboarding verification process.</li>
                  <li>Partner subscription tier status, billing cycle records, and Nomba wallet transaction history.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 3: Lawful Basis for Processing</h3>
              <p className="text-sm leading-relaxed">
                TreatRyte processes personal data only where it has a valid and documented lawful basis, as required by Sections 25 and 30 of the NDPA 2023.
              </p>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">3.1 Explicit Consent</h4>
                <p className="text-sm leading-relaxed">
                  For the collection, storage, processing, and disclosure of Sensitive Personal Health Data, including all contents of the Personal Medical Vault, medication logs, post-dose feedback, and AI-processed lab report interpretations, TreatRyte relies on the explicit, affirmative, freely given, and fully informed consent of the data subject. Consent is obtained through a dedicated granular consent interface at account registration and at each specific data processing activity. Users may withdraw consent at any time without detriment, and the withdrawal mechanism is as accessible as the mechanism for granting consent.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">3.2 Contractual Necessity</h4>
                <p className="text-sm leading-relaxed">
                  Processing related to financial transactions, wallet management, subscription billing, invoice generation, and diagnostic payment settlements is carried out on the basis of contractual necessity, as it is indispensable to the performance of the agreement between TreatRyte and the user or partner.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">3.3 Legal Obligation</h4>
                <p className="text-sm leading-relaxed">
                  Processing of BVN and NIN data for KYC purposes is undertaken on the basis of compliance with a legal obligation, specifically the obligations imposed on fintech platforms operating under the CBN's AML/CFT regulatory framework.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">3.4 Legitimate Interests</h4>
                <p className="text-sm leading-relaxed">
                  Anonymised usage analytics, security monitoring, fraud detection, and system integrity logging are processed on the basis of TreatRyte's legitimate interests, subject to the overriding interests and rights of the data subject. TreatRyte has conducted and documented a Legitimate Interests Assessment for each processing activity relying on this basis.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 4: Data Security Architecture and Vault Infrastructure</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.1 Encryption at Rest</h4>
                <p className="text-sm leading-relaxed">
                  All medical documents stored in TreatRyte's infrastructure on Amazon Web Services Simple Storage Service (AWS S3) are protected using AES-256 server-side encryption (SSE-S3). Every object is encrypted before being written to disk using a unique data key managed by AWS Key Management Service (KMS), and decrypted only upon authorised retrieval. Encryption keys are rotated annually.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.2 Encryption in Transit</h4>
                <p className="text-sm leading-relaxed">
                  All data transmitted between the TreatRyte mobile application, the Node.js API Gateway, AWS S3, MongoDB, and the Nomba API Suite is protected using Transport Layer Security (TLS) 1.2 or higher. Unencrypted HTTP connections are rejected at the API gateway level without exception.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.3 Pre-Signed URL Access Mechanism</h4>
                <p className="text-sm leading-relaxed">
                  Medical documents stored in AWS S3 are never served through publicly accessible URLs. The TreatRyte backend dynamically generates short-lived, cryptographically signed pre-signed URLs with a maximum lifespan of fifteen (15) minutes per authorised document retrieval request. Upon expiry, the URL becomes cryptographically invalid and cannot be replayed or reused. This ensures that an intercepted URL would rapidly become inoperable.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.4 Instant Access Revocation</h4>
                <p className="text-sm leading-relaxed">
                  When a user revokes an active record-sharing grant through the Granular Record Sharing and Access Control feature, the revocation executes immediately. The backend database schema atomically removes the authorised pairing token for the specific recipient. Once removed, the system is permanently incapable of generating further pre-signed URLs for that recipient in relation to the revoked document or folder. Revocations are logged with a timestamp in the user's real-time audit console.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.5 Third-Party Upload Invitation Security</h4>
                <p className="text-sm leading-relaxed">
                  When a user generates a Third-Party Upload Invitation link or QR code to allow an external unregistered practitioner or laboratory to deposit documents into their vault, TreatRyte issues a single-use, tokenised, time-limited credential. This credential grants the third party the exclusive ability to upload new files to a designated destination folder and confers no access to any pre-existing files within the user's vault. The token expires upon first successful use or upon a defined time boundary, whichever occurs first.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.6 Database Security</h4>
                <p className="text-sm leading-relaxed">
                  All personally identifiable information stored in the TreatRyte MongoDB database is subject to field-level encryption for the most sensitive data attributes. Database access is restricted to authenticated backend service accounts operating within a private Virtual Private Cloud (VPC). Direct public database access is not permitted under any configuration.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">4.7 Organisational Safeguards</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte implements a formal information security policy reviewed annually, mandatory security training for all staff with access to production systems, role-based access control within internal systems, and a formal vendor due diligence process for all third-party sub-processors.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 5: Data Sharing and Disclosure Limitations</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">5.1 Absolute Prohibition on Commercial Data Sharing</h4>
                <p className="text-sm leading-relaxed font-semibold text-primary">
                  TreatRyte will not, under any circumstances, sell, lease, license, trade, or otherwise commercially transfer any user health records, medication logs, diagnostic data, or metadata derived from these to any third party. This prohibition applies without exception to insurance companies, pharmaceutical manufacturers, advertising networks, employers, financial institutions conducting creditworthiness assessments, and data brokers. This commitment is categorical and cannot be altered by any consent mechanism employed by a third party.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">5.2 User-Controlled Voluntary Sharing</h4>
                <p className="text-sm leading-relaxed">
                  The only mechanism by which a user's health records may be shared with an external party is through the user's own deliberate exercise of the Granular Record Sharing and Access Control feature. Free Tier users may share one active record with one external recipient at a time. Premium Tier users benefit from unlimited simultaneous secure sharing links with custom auto-expiry timers. All sharing events are fully auditable in real time and revocable at any instant through a single-click revocation control.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">5.3 Automated Partner Record Dispatch</h4>
                <p className="text-sm leading-relaxed">
                  Registered and verified Partner entities may upload clinical records, laboratory results, and diagnostic reports directly to a patient's designated AWS S3 vault folder using the Automated Record Issuing feature, provided the patient's verified phone number or email address is used as the destination identifier. This function is subject to the Partner's independent obligations as a Data Controller and Processor under the NDPA 2023, as detailed in the TreatRyte Partner Agreement. TreatRyte functions as a secure conduit for this transaction and does not access, read, or retain the content of documents uploaded through this mechanism beyond what is technically necessary for routing and storage.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">5.4 Sub-Processors</h4>
                <p className="text-sm leading-relaxed">TreatRyte engages the following categories of third-party sub-processors to deliver its core technical services:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Amazon Web Services, Inc. (AWS):</strong> For encrypted cloud storage via AWS S3 and the AI text-extraction pipeline via AWS Textract.</li>
                  <li><strong>Nomba Financial Services Limited:</strong> For digital wallet management, KYC verification, subscription billing via the Nomba Subscription API, and payment processing via the Nomba Checkout Gateway.</li>
                  <li><strong>Push Notification Service Providers:</strong> For delivery of local offline medication alarm notifications and proximity-based medical outreach push alerts.</li>
                </ul>
                <p className="text-sm leading-relaxed">
                  TreatRyte maintains data processing agreements with all sub-processors that impose equivalent or stricter data protection obligations to those binding TreatRyte under this Policy.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">5.5 Legal Disclosure</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte may disclose personal data to a competent governmental authority, law enforcement agency, or court of competent jurisdiction where compelled to do so by a valid legal order or statutory obligation under Nigerian law. Where legally permissible, TreatRyte shall notify the affected data subject of any disclosure request prior to compliance, and shall disclose only the minimum data strictly required to satisfy the legal obligation.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 6: AI-Driven Data Processing Disclosure</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">6.1 AWS Textract Integration</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte's AI-Driven Lab Report Interpretation Engine uses Amazon Web Services Textract, a machine learning service, to perform automated text extraction from laboratory result documents uploaded by Partner entities. The extracted text is processed by TreatRyte's backend inference pipeline to generate a plain-language summary intended to help patients understand the clinical content of their results. Where appropriate, the engine also highlights potential clinical irregularities and recommends logical follow-up diagnostics, for example recommending an HbA1c test where a glucose result is abnormal.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">6.2 Nature and Limitations of AI Outputs</h4>
                <p className="text-sm leading-relaxed">
                  Users are expressly informed that AI-generated summaries and follow-up diagnostic recommendations produced by this engine are automated informational outputs only. These outputs do not constitute a medical diagnosis, clinical opinion, treatment recommendation, or prescription under any applicable law or professional standard. The AI Interpretation Engine is a supplementary informational layer. All clinical decisions remain the exclusive responsibility of a licensed medical practitioner registered with the appropriate Nigerian regulatory body.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">6.3 Human Oversight</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte mandates that Partner entities using the AI Interpretation Engine operate this feature only as a supplement to clinical review by a qualified medical professional. All AI-generated outputs are clearly labeled within the platform as supplementary and AI-generated. TreatRyte reserves the right to suspend Partner access to this feature if misrepresentation of AI outputs is detected.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">6.4 Data Minimisation</h4>
                <p className="text-sm leading-relaxed">
                  Text extracted through the AWS Textract pipeline is processed transiently for the purpose of generating the immediate interpretation summary. TreatRyte does not use extracted health record text to train its own AI or machine learning models. Data beyond what is required for the immediate summary is not retained in identifiable form beyond the duration of the processing session.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 7: Data Retention and Deletion</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">7.1 Active Account Retention</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte retains personal data for the duration that a user or partner maintains an active registered account on the platform, for the purpose of delivering contracted services and maintaining the integrity of the user's medical vault.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">7.2 Post-Closure Retention</h4>
                <p className="text-sm leading-relaxed">
                  Upon formal account closure or a verified deletion request by a data subject, TreatRyte shall initiate deletion of identifiable personal data within 30 days, subject to the following exceptions:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Financial transaction records are retained for a minimum of seven years in compliance with Nigerian financial recordkeeping obligations.</li>
                  <li>Data subject to an active legal hold, regulatory investigation, or court order shall be retained for the duration required by such obligation.</li>
                  <li>Fully anonymised and de-identified aggregate data may be retained indefinitely, as it no longer constitutes personal data under the NDPA 2023.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">7.3 AWS S3 Vault Deletion</h4>
                <p className="text-sm leading-relaxed">
                  Deletion of medical documents from the user's AWS S3 vault is permanent and irreversible upon execution. TreatRyte implements a 72-hour review window following a deletion instruction before the S3 deletion operation is finalised, to guard against accidental or unauthorised deletion. Users are notified of the pending deletion and may cancel within this window.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 8: Data Subject Rights</h3>
              <p className="text-sm leading-relaxed">
                In accordance with Chapter 4 of the NDPA 2023, every data subject whose personal data is processed by TreatRyte holds the following enforceable rights. Requests exercising these rights must be submitted to treatryte.app@gmail.com and will receive a substantive response within 30 calendar days.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.1 Right of Access</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to request a full copy of all personal data TreatRyte holds about you, including the categories of data processed, the purposes of processing, and the identities of any sub-processors or recipients to whom your data has been disclosed.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.2 Right to Rectification</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to request correction of any inaccurate personal data held about you, and the right to have incomplete data completed, including through a supplementary statement.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.3 Right to Erasure (Right to be Forgotten)</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to request deletion of your personal data where the data is no longer necessary for the purposes for which it was collected, where you have withdrawn consent and no other lawful basis for processing exists, or where you have successfully objected to the processing. This right is subject to the retention obligations set out in Section 7.2 of this Policy.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.4 Right to Data Portability</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to receive the personal data you have provided to TreatRyte in a structured, commonly used, and machine-readable format, and to transmit that data to another controller where technically feasible. TreatRyte will provide exported vault data in PDF and standard image formats, and transaction data in CSV format.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.5 Right to Restriction of Processing</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to request that TreatRyte restrict processing of your personal data where you contest the accuracy of the data, where processing is unlawful but you oppose erasure, or where TreatRyte no longer needs the data but you require it for a legal claim.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.6 Right to Object</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right to object at any time to processing of your personal data where processing relies on TreatRyte's legitimate interests. You also have the right to object to processing for direct marketing purposes, and TreatRyte shall cease such processing immediately upon receipt of a valid objection.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.7 Rights in Relation to Automated Processing</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    You have the right not to be subject to a decision based solely on automated processing that produces legal or similarly significant effects on you. TreatRyte does not make automated decisions with legal or significant effects on data subjects. The AI Interpretation Engine produces informational summaries only and does not constitute automated decision-making as contemplated by this provision.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 bg-background">
                  <h4 className="text-sm font-bold text-navy">8.8 Right to Lodge a Complaint</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    If you believe TreatRyte has violated your rights under the NDPA 2023, you have the right to lodge a complaint with the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng, without prejudice to any other legal remedy available to you.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 9: Data Breach Notification Protocol</h3>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">9.1 Incident Detection and Internal Response</h4>
                <p className="text-sm leading-relaxed">
                  TreatRyte maintains a formal Incident Response Plan reviewed and tested no less than twice annually. Upon discovery or reasonable suspicion of a personal data breach, the TreatRyte DPO and security team shall immediately initiate containment and investigation procedures to determine the nature, scope, and potential risk of the breach.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">9.2 Regulatory Notification</h4>
                <p className="text-sm leading-relaxed">
                  Where a data breach is determined to present a high risk to the rights and freedoms of affected data subjects, TreatRyte shall notify the NDPC within 72 hours of becoming aware of the breach. The notification shall include, to the extent then known: the nature of the breach; the categories and approximate number of data subjects affected; the categories and approximate volume of personal data records concerned; the likely consequences of the breach; and the measures TreatRyte has taken or proposes to take to address and mitigate the breach.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-navy">9.3 Individual Notification</h4>
                <p className="text-sm leading-relaxed">
                  Where a data breach is likely to result in a high risk to the rights and freedoms of specific data subjects, TreatRyte shall notify those individuals without undue delay in plain language, describing the nature of the breach and the protective steps they may take. Notification shall be communicated through the primary contact information registered on the affected account.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 10: Children's Data</h3>
              <p className="text-sm leading-relaxed">
                The TreatRyte platform is not directed at individuals under the age of 18 years. TreatRyte does not knowingly collect personal data from minors. If TreatRyte becomes aware that personal data has been collected from a minor without appropriate parental or guardian consent, it shall take immediate steps to delete such data. If you believe a minor has provided personal data to TreatRyte, please contact treatryte.app@gmail.com immediately.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 11: Updates to This Privacy Policy</h3>
              <p className="text-sm leading-relaxed">
                TreatRyte reserves the right to update this Privacy Policy at any time. Where material changes are made, TreatRyte shall provide notice to registered users via in-app notification and by email to the registered account address no fewer than 14 days before the changes take effect. Continued use of the platform after the effective date of any revision constitutes acceptance of the revised Policy. The current version of this Policy is always accessible within the application settings.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-navy">Section 12: Governing Law and Dispute Resolution</h3>
              <p className="text-sm leading-relaxed">
                This Privacy Policy is governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act 2023 and the National Health Act 2014. Any dispute arising from or relating to this Policy that cannot be resolved through direct engagement with the TreatRyte DPO shall be referred to mediation administered in Lagos or Abuja, Nigeria. If mediation is unsuccessful, the dispute shall be submitted to the jurisdiction of the Federal High Court of Nigeria.
              </p>
            </section>

            <div className="rounded-2xl border border-border bg-muted/40 p-6 space-y-3">
              <h4 className="text-base font-bold text-navy">Contact Information</h4>
              <p className="text-sm text-muted-foreground">
                For all privacy-related inquiries, data subject rights requests, or concerns regarding this Policy, please contact:
              </p>
              <p className="text-sm font-semibold text-navy">TreatRyte Data Protection Officer</p>
              <p className="text-sm">Email: <a href="mailto:treatryte.app@gmail.com" className="text-primary hover:underline">treatryte.app@gmail.com</a></p>
              <p className="text-sm">Postal Address: TreatRyte Technologies Limited, Asaba, Delta State, Nigeria</p>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/60">
                <em>This Privacy Policy was prepared in accordance with the Nigeria Data Protection Act 2023, the General Application and Implementation Directive 2025, and the National Health Act 2014.</em>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
