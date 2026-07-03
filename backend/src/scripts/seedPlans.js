require('dotenv').config();
const { getDb, getClient } = require('../db');

const defaultPlans = [
  {
    name: "Free Tier (Basic Care)",
    price: 0,
    interval: "monthly",
    type: "Individual",
    features: [
      "Medication Alarms: Unlimited alarms with Doctor’s Feedback",
      "Diagnostic Directory: Free searching of clinics with transparent pricing",
      "Digital Vault Storage: Max 5 medical records across 2 folders",
      "Record Sharing: Share 1 record with 1 recipient (expires in 24h)",
      "Third-Party Vault Uploads: Free clinic invitation links",
      "Community Benefits: Local medical outreach notifications"
    ],
    excludedFeatures: [
      "Expanded Vault Storage: Storage for up to 100 records and 10 folders",
      "Advanced Sharing: Share 5 records with custom expiration (up to 30 days)",
      "Ad-Free Experience: No sponsored ads inside the app",
      "Unlimited Vault Storage: Unlimited document uploads",
      "Family Account Linking: Manage up to 4 sub-profiles",
      "Smart Insights: AI-translated record summaries"
    ],
    nombaPlanId: "",
    transactionSplit: 0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Health Plus (Personal Vault)",
    price: 1200,
    interval: "monthly",
    type: "Individual",
    features: [
      "Everything in Free Tier",
      "Expanded Vault Storage: Storage for up to 100 records and 10 folders",
      "Advanced Sharing: Share 5 records with custom expiration timers (up to 30 days)",
      "Ad-Free Experience: No sponsored ads inside the app"
    ],
    excludedFeatures: [
      "Unlimited Vault Storage: Unlimited document uploads",
      "Family Account Linking: Manage up to 4 sub-profiles",
      "Smart Insights: AI-translated record summaries"
    ],
    nombaPlanId: "plan_nomba_health_plus",
    transactionSplit: 0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Health Premium (Family Vault)",
    price: 3500,
    interval: "monthly",
    type: "Individual",
    features: [
      "Everything in Health Plus",
      "Unlimited Storage: Unlimited document uploads and folders",
      "Family Account Linking: Manage up to 4 sub-profiles",
      "Unlimited Sharing: Unlimited sharing links with view/download permissions",
      "Smart Insights: AI-translated record summaries"
    ],
    excludedFeatures: [],
    nombaPlanId: "plan_nomba_health_premium",
    transactionSplit: 0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Starter Partner (Pay-As-You-Go)",
    price: 0,
    interval: "monthly",
    type: "Partner",
    features: [
      "Web Storefront: Standard landing page with hours and pricing",
      "Nomba splits: 2.5% transaction platform fee",
      "Basic Billing: Issue up to 30 digital invoices/month",
      "Record Dispatch: Send up to 50 test results/month",
      "Staff Management: Up to 2 staff accounts"
    ],
    excludedFeatures: [
      "Unlimited Billing & Records: Issue unlimited invoices and results",
      "Custom Branding: Storefront banners, bios, and contact widgets",
      "Expanded Staff: Up to 10 staff accounts",
      "Clinic Analytics: Downloadable performance reports",
      "AI-Driven Report Interpretation: Automated clinical translation engine",
      "Multi-Branch Management: Track performance across up to 5 separate branches",
      "Priority API Integration: Direct Webhook support for LIMS systems"
    ],
    nombaPlanId: "",
    transactionSplit: 2.5,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Growth Suite (Automated Clinic)",
    price: 15000,
    interval: "monthly",
    type: "Partner",
    features: [
      "Everything in Starter Partner",
      "Nomba splits: Reduced 1.5% transaction platform fee",
      "Unlimited Billing & Records: Issue unlimited invoices and results",
      "Custom Branding: Banners, specialist bios, and contact widgets",
      "Expanded Staff: Up to 10 staff accounts",
      "Clinic Analytics: Downloadable performance reports"
    ],
    excludedFeatures: [
      "AI-Driven Report Interpretation: Automated clinical translation engine",
      "Multi-Branch Management: Track performance across up to 5 separate branches",
      "Priority API Integration: Direct Webhook support for LIMS systems"
    ],
    nombaPlanId: "plan_nomba_growth_suite",
    transactionSplit: 1.5,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Enterprise Health Suite (AI & Multi-Branch)",
    price: 45000,
    interval: "monthly",
    type: "Partner",
    features: [
      "Everything in Growth Suite",
      "Nomba splits: Reduced 1.0% transaction platform fee",
      "AI-Driven Report Interpretation: Automated clinical translation engine",
      "Multi-Branch Management: Track performance across up to 5 separate branches",
      "Unlimited Staff Accounts: Secure profiles for all branch workers",
      "Priority API Integration: Direct Webhook support for LIMS systems"
    ],
    excludedFeatures: [],
    nombaPlanId: "plan_nomba_enterprise_health_suite",
    transactionSplit: 1.0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function main() {
  const db = getDb();
  const collection = db.collection('plans');

  console.log('Clearing existing plans...');
  await collection.deleteMany({});

  console.log('Inserting subscription plans...');
  await collection.insertMany(defaultPlans);
  console.log('Seeded subscription matrix successfully.');
}

main()
  .catch(err => console.error(err))
  .finally(() => getClient().close());
