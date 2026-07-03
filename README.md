# PRODUCT REQUIREMENT DOCUMENT: TREATRYTE

## 1. One-Line Idea Summary
TreatRyte is a patient-centric healthcare mobile application that empowers users to manage medication schedules, compare transparent diagnostic pricing, and securely own their personal medical records.

## 2. Problem Statement
Patients frequently struggle with healthcare fragmentation, leading to three major pain points:
- Poor Medication Adherence: Forgetting to take prescribed medications on time drastically reduces treatment efficacy and worsens health outcomes.
- Lack of Price Transparency: Patients face highly fragmented, hidden pricing when trying to find nearby labs, dental clinics, or eye specialists, leading to unpredictable out-of-pocket costs.
- Data Silos: Medical histories are trapped within individual hospitals or labs, leaving patients without a centralized, accessible, and self-owned repository of their own health data.

## 3. Core Architecture Stack
- Frontend/Mobile: Flutter for a native, cross-platform mobile experience.
- Backend: Node.js (Express) handling API routing, authentication, and partner multi-tenancy.
- Database: MongoDB for flexible storage of user profiles, medical logs, and partner clinic storefront directories.
- Storage: AWS S3 private buckets utilizing secure pre-signed URLs for medical document uploads.
- Payment Infrastructure: Nomba Subscription API (recurring subscription billing) and Nomba Checkout Gateway (one-off directory marketplace checkouts).

---

## 4. Feature Specifications & User Stories

### A. User (Patient) Features
1. Digital Record Vault: Users can upload lab results, images, or PDFs directly from their devices into a structured folder framework.
2. Smart Adherence Engine: 100% free multi-alarm medication and doctor-appointment reminder system with integrated "Doctor Feedback Logs".
3. Diagnostic Directory Marketplace: Geolocation-based searching of nearby labs, eye clinics, dentists, and specialists showing 100% transparent upfront pricing.
4. Third-Party Secure Invitations: Free invitation links enabling external hospitals or clinics to upload test records straight into a user's vault.
5. Granular Document Sharing: Secure document-sharing engine with adjustable link expiration timers and one-tap access revocation.
6. Local Outreach Logs: Aggregation feed tracking free local community medical outreach events.
7. Wallet & Billing Engine: Integrated in-app wallet displaying digital invoices sent directly from clinic partners, clearing via the Nomba Checkout Gateway.

### B. Partner (Labs & Specialist Clinics) Features
1. Official Record Dispatch: A clinical panel allowing partners to issue structured digital results directly to a patient's vault, eliminating low-quality paper photos.
2. Shareable Webfront Storefront: Generates a single public profile link (e.g., treatryte.com/labs/care-diagnostics) showcasing business hours, specialist bios, and a searchable services pricing directory.
3. Role-Based Access Control (RBAC): Multi-tenant staff management portal isolating profiles (Admin, Tech, Doctor, Billing).
4. Diagnostic AI Core (Enterprise Feature): Automated clinical translation engine reading test values, interpreting complex jargon, and automatically suggesting logical follow-up diagnostics (e.g., suggesting an HbA1c test if blood glucose is flagged high).

---

## 5. Monetization & Subscription Matrix (Nomba API Configured)

### User (Patient) Tiers
- Tier 1: Free Tier (Basic Care) [₦0/mo]
  - Unlimited Medication Alarms & Clinic Pricing Directory Search.
  - Max 5 records across up to 2 folders.
  - Active sharing limited to exactly 1 record with 1 recipient at a time (Auto-expires in 24 hours).
  - Free Third-Party Clinic upload links & Outreach notifications.
- Tier 2: Health Plus (Personal Vault) [₦1,200/mo or ₦12,000/yr]
  - All Free features included.
  - Expanded storage: Up to 100 medical records with up to 10 custom folders.
  - Advanced sharing: Securely share up to 5 records simultaneously with customizable expiration timers (up to 30 days) and manual access revocation.
  - Completely ad-free interface.
- Tier 3: Health Premium (Family Vault) [₦3,500/mo or ₦35,000/yr]
  - All Health Plus features included.
  - Unlimited storage: Infinite uploads and nested folder structures.
  - Family Profiles: Create/link up to 4 sub-profiles (e.g., kids, parents) to track medication schedules and records under one unified master dashboard.
  - Unlimited simultaneous sharing with view-only vs. download permission choices.
  - Priority access to basic AI-translated medical record summaries.

### Partner (Clinics & Labs) Tiers
- Tier 1: Starter Partner (Pay-As-You-Go) [₦0/mo base platform fee]
  - 2.5% platform transaction split fee on directory storefront checkouts.
  - Standard public pricing profile page.
  - Issue up to 30 digital invoices to patient wallets/emails per month.
  - Dispatch up to 50 digital results directly to patient vaults per month.
  - Limit of 2 staff user accounts.
- Tier 2: Growth Suite (Automated Clinic) [₦15,000/mo via Nomba Subscription API]
  - Reduced transaction platform split fee (1.5%).
  - All Starter features included.
  - Unlimited digital invoicing and unlimited digital record dispatching to user vaults.
  - Fully customizable brand storefront layout (custom banners, custom specialist profiles, direct booking widgets).
  - Up to 10 staff accounts using RBAC (Admin, Lab Tech, Billing, Doctor).
  - Access to monthly downloadable clinic performance and financial analytics.
- Tier 3: Enterprise Health Suite (AI Multi-Branch) [₦45,000/mo via Nomba Subscription API]
  - Reduced transaction platform split fee (1.0%).
  - All Growth features included.
  - Access to Diagnostic AI report interpretation and automated follow-up suggestions.
  - Multi-Branch Management: Track performance across up to 5 physical facilities under 1 corporate brand dashboard.
  - Unlimited staff accounts.
  - Webhook integration support to directly hook existing clinic Laboratory Information Management Systems (LIMS) directly to TreatRyte's API endpoints.

---

## 6. Project Status & Live Deployments
- Product Landing Page: Live at https://treatryte-landing-page.up.railway.app/
- Administrative Management Layer: Live at https://treatryte-admin.up.railway.app/login
- Ongoing/Pending Milestones:
  1. Complete the endpoint logic connecting the Nomba Subscription and Checkout sandbox APIs end-to-end.
  2. Implement the token-based record claiming sequence allowing a patient to link a record created by an off-platform clinic into their account via a unique verification pin.
  3. Formulate Nomba payment webhooks to instantly apply real-time tier restriction downgrades or upgrades on multi-tenant MongoDB records.
  4. Completion of the user and partner app
  
---

## 7. Operational Guidelines
When I ask you to write code components, UI modules, backend endpoints, or database structures:
1. Always account for the multi-tenant separation between Patients and Partner Clinics.
2. Enforce the user/partner tier limitations (e.g., folder count caps, share limits) inside database queries and route controllers.
3. Write clean, descriptive, modular code using best architectural patterns (e.g., Provider state management in Flutter, controllers/services pattern in Node.js).
