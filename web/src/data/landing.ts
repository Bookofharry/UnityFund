// All landing page copy and static data in one file.
// Change words here; never hunt through JSX.

export const announcement = {
  text: '🇳🇬 Now live for Nigerian cooperatives and welfare associations — Powered by',
  highlight: 'Nomba',
  cta: 'Learn more →',
};

export const nav = {
  brand: 'UnityFund',
  links: [
    { label: 'Features', href: '#features' },
    { label: 'Fund Types', href: '#fund-types' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  ctaSecondary: 'Sign in',
  ctaPrimary: 'Get started free',
};

export const hero = {
  badge: 'Financial Operations Platform',
  headline: ['Your organization\'s', 'financial operating system.'],
  subheadline:
    "Stop chasing payments on WhatsApp and reconciling bank alerts by hand. UnityFund automates your organization's entire fund lifecycle: collections, reconciliation, approvals, and payouts, all in one dashboard.",
  ctaPrimary: 'Get started free',
  ctaSecondary: 'Watch a 2-min demo',
  stats: [
    { value: '₦2.4M', label: 'Collected this cycle' },
    { value: '96%', label: 'Collection rate' },
    { value: '0', label: 'Manual reconciliations' },
  ],
};

export const trustedBy = {
  heading: 'Built for organizations that manage real money',
  subheading: 'From 20-member cooperative societies to 500-member professional associations',
  orgs: [
    { emoji: '🏛', label: 'Cooperative Societies' },
    { emoji: '⛪', label: 'Churches & Faith Organizations' },
    { emoji: '🎓', label: 'Alumni Associations' },
    { emoji: '💼', label: 'Professional Bodies' },
    { emoji: '🏘', label: 'Community Groups' },
    { emoji: '🤝', label: 'Staff Welfare Associations' },
    { emoji: '🏫', label: 'Schools & Parent Associations' },
    { emoji: '🌱', label: 'NGOs & Non-Profits' },
  ],
  tagline: 'Trusted with member finances across Nigeria',
};

export const problem = {
  heading: "Managing organizational funds\nshouldn't feel like a second job.",
  subheading: 'But for most treasurers and administrators, it does.',
  pains: [
    {
      title: 'Manual reconciliation never ends',
      icon: 'Sheet',
      body: 'You check bank alerts one by one, cross-reference your Excel sheet, then message the WhatsApp group to ask who sent what. Every single collection cycle.',
    },
    {
      title: 'Nobody can see the full picture',
      icon: 'EyeOff',
      body: "There's no single place to see who has paid, who is outstanding, and what the fund balance actually is. Until you manually count.",
    },
    {
      title: 'Your treasurer works weekends',
      icon: 'Clock',
      body: 'Reconciliation. Reminders. Payment chasing. Report prep. Your treasurer spends hours every week on tasks that should take minutes.',
    },
  ],
  before: [
    { label: 'WhatsApp Group', sub: 'Reminders & screenshots' },
    { label: 'Excel Spreadsheet', sub: 'Manual tracking' },
    { label: 'Bank Alerts', sub: 'One-by-one confirmation' },
  ],
};

export const solution = {
  heading: 'One platform. Every fund. Complete control.',
  subheading:
    'UnityFund connects your entire fund management workflow: member onboarding, automated collection, payment reconciliation, and fund-specific payouts.',
  chain: [
    { label: 'Organization', desc: 'Your home base' },
    { label: 'Fund', desc: 'Create any fund type' },
    { label: 'Collection Cycle', desc: 'Open a collection period' },
    { label: 'Contribution', desc: 'Per-member records generated' },
    { label: 'Payment', desc: 'Members pay via Nomba' },
    { label: 'Payout', desc: 'Automated or approved disbursement' },
  ],
  comparison: [
    { before: 'WhatsApp reminders', after: 'Automated notifications' },
    { before: 'Manual bank matching', after: 'Instant reconciliation' },
    { before: 'Spreadsheet updates', after: 'Real-time dashboard' },
    { before: 'Manual payout calculation', after: 'Automated payout triggers' },
    { before: 'Monthly manual report', after: 'Always-current reports' },
  ],
};

export const features = {
  heading: 'Everything your organization needs to manage funds properly',
  subheading: 'Designed for the people who manage organizational finances, not for accountants.',
  items: [
    {
      icon: 'Layers',
      title: 'Multiple Fund Types',
      body: 'Create Annual Dues, Savings Funds, Welfare Funds, Rotational Savings, and more — each with its own contribution rules and payout workflows.',
    },
    {
      icon: 'Zap',
      title: 'Automated Collections',
      body: "Collect contributions automatically through Nomba's Direct Debit, Checkout, and Virtual Account infrastructure. Members pay; the system records it.",
    },
    {
      icon: 'CheckCircle',
      title: 'Instant Reconciliation',
      body: 'Payments are verified and reconciled the moment they clear — via Nomba webhooks. No spreadsheet. No manual matching. No phone calls.',
    },
    {
      icon: 'Shield',
      title: 'Role-Based Access',
      body: 'Admin, Treasurer, Member — every role sees and does exactly what they should. Treasurers execute; only Admins approve.',
    },
    {
      icon: 'FileText',
      title: 'Complete Audit Trail',
      body: 'Every action is permanently logged. Who approved it, when it happened, what changed. Full financial accountability for every organization.',
    },
    {
      icon: 'BarChart2',
      title: 'Dashboards & Reports',
      body: 'Real-time collection rates, fund balances, outstanding contributions, and payout history — always current, never calculated manually.',
    },
  ],
};

export const howItWorks = {
  heading: 'From setup to first collection in under 30 minutes',
  steps: [
    {
      number: '01',
      icon: 'Building',
      title: 'Create your organization',
      body: 'Register on UnityFund, complete your profile, and invite your admin team. Takes under 5 minutes.',
    },
    {
      number: '02',
      icon: 'Folder',
      title: 'Set up your funds',
      body: 'Choose your fund types, configure contribution rules, and enroll your members. Each fund gets its own settings.',
    },
    {
      number: '03',
      icon: 'RefreshCw',
      title: 'Open a collection cycle',
      body: 'Start the cycle. Members are notified, contribution records are generated, and payments begin flowing through Nomba.',
    },
    {
      number: '04',
      icon: 'CheckCircle2',
      title: 'Collections reconcile automatically',
      body: 'Payments clear. Webhooks fire. Contributions update. Dashboards refresh. Nobody sends a WhatsApp message to confirm.',
    },
  ],
};

export const fundTypes = {
  heading: 'Every fund type your organization actually uses',
  subheading: 'Different funds have different rules. UnityFund understands that.',
  items: [
    {
      color: 'blue',
      icon: 'Calendar',
      title: 'Annual Dues',
      body: 'Recurring membership fees collected on your schedule. Keeps the organization running.',
      badges: ['Fixed Amount', 'No Member Payout'],
    },
    {
      color: 'emerald',
      icon: 'PiggyBank',
      title: 'Savings Fund',
      body: 'Members build personal savings through recurring contributions. Withdrawals by request.',
      badges: ['Recurring', 'Member Withdrawal'],
    },
    {
      color: 'rose',
      icon: 'Heart',
      title: 'Welfare Fund',
      body: 'Collective support for members during illness, bereavement, or hardship.',
      badges: ['Collective', 'Approval Required'],
    },
    {
      color: 'amber',
      icon: 'AlertCircle',
      title: 'Emergency Fund',
      body: 'Financial reserves for unexpected organizational or member emergencies.',
      badges: ['Configurable', 'Approval Required'],
    },
    {
      color: 'orange',
      icon: 'Building2',
      title: 'Building Fund',
      body: 'Long-term financing for infrastructure and capital projects.',
      badges: ['Project-based', 'Org Disbursement'],
    },
    {
      color: 'indigo',
      icon: 'RotateCcw',
      title: 'Rotational Savings',
      body: 'Automated Ajo and Esusu. Each cycle, one member receives the pooled contribution.',
      badges: ['Rotating', 'Auto-scheduled'],
    },
    {
      color: 'purple',
      icon: 'TrendingUp',
      title: 'Investment Fund',
      body: 'Pooled contributions for future investment opportunities.',
      badges: ['Pooled Capital', 'Member Returns'],
      comingSoon: true,
    },
    {
      color: 'teal',
      icon: 'Banknote',
      title: 'Loan Fund',
      body: 'Provide short-term loans to members with structured repayment schedules and automatic interest tracking.',
      badges: ['Member Loans', 'Repayment Tracking'],
      comingSoon: true,
    },
  ],
};

export const security = {
  heading: "Your members' money demands serious software.",
  subheading:
    'UnityFund is built with the security standards that financial operations require — not as an afterthought, but as a foundation.',
  features: [
    {
      icon: 'Webhook',
      title: 'Webhook Signature Verification',
      body: 'Every Nomba webhook is cryptographically verified before processing begins. No unverified event updates a payment record.',
    },
    {
      icon: 'Lock',
      title: 'Organization Data Isolation',
      body: "Your organization's data is completely separated from every other organization on the platform. No cross-organization data access is possible.",
    },
    {
      icon: 'RefreshCw',
      title: 'Idempotent Payment Processing',
      body: 'Every payment operation is protected against duplicates. Retrying a webhook never creates a double credit.',
    },
    {
      icon: 'Users',
      title: 'Role-Based Authorization',
      body: 'Fine-grained permission control ensures that financial execution and approval are always held by different people.',
    },
    {
      icon: 'ClipboardList',
      title: 'Complete Audit Logging',
      body: 'Every sensitive action — payment approval, payout execution, rule change, member removal — is permanently logged with actor, timestamp, and context.',
    },
    {
      icon: 'KeyRound',
      title: 'JWT Authentication',
      body: 'Sessions are secured with signed, expiring tokens. Password resets use one-time hashed tokens with automatic expiry.',
    },
  ],
  badges: [
    { icon: 'Shield', label: 'Bank-grade security' },
    { icon: 'CheckCircle2', label: 'Nomba-verified payments' },
    { icon: 'ClipboardList', label: 'Full audit trails' },
  ],
};

export const testimonials = {
  heading: 'Organizations are replacing their spreadsheets',
  items: [
    {
      quote:
        'UnityFund replaced our WhatsApp group and three Excel files. We went from spending every Friday on reconciliation to checking a dashboard that\'s already updated. Our members actually trust the treasury now.',
      org: 'Welfare Association',
      location: 'Lagos State',
    },
    {
      quote:
        'We manage Annual Dues for 340 alumni. Before UnityFund, our treasurer was manually matching 340 bank alerts. Now the system handles it. We just review the dashboard.',
      org: 'Alumni Association',
      location: 'Abuja',
    },
    {
      quote:
        'The rotational savings feature is exactly how our Ajo works. Everyone sees who has received, who is next, and every contribution is verified. No more arguments about who paid.',
      org: 'Cooperative Society',
      location: 'Port Harcourt',
    },
  ],
};

export const pricing = {
  heading: 'Simple pricing for organizations of every size',
  subheading: 'No per-transaction fees on our end. Pay for the platform, not for every payment.',
  footnote: 'All plans include Nomba-powered payment collection. Nomba transaction fees apply separately.',
  plans: [
    {
      name: 'Starter',
      price: 'Free',
      period: 'forever',
      highlight: false,
      features: ['Up to 15 members', '1 active fund', 'Basic reports', 'Community support'],
      cta: 'Get started free',
      ctaVariant: 'outline' as const,
    },
    {
      name: 'Professional',
      price: '₦15,000',
      period: 'per month',
      highlight: true,
      badge: 'Most Popular',
      features: ['Unlimited members', 'Unlimited funds', 'All fund types', 'Priority support', 'Advanced reports'],
      cta: 'Start free trial',
      ctaVariant: 'filled' as const,
    },
    {
      name: 'Organization',
      price: 'Custom',
      period: '',
      highlight: false,
      features: ['Multi-branch support', 'Custom workflows', 'Dedicated support', 'SLA guarantee', 'White-label option'],
      cta: 'Contact sales',
      ctaVariant: 'outline' as const,
    },
  ],
};

export const faq = {
  heading: 'Questions we get asked most',
  items: [
    {
      q: 'What exactly is UnityFund?',
      a: "UnityFund is a financial operating platform for member-based organizations. It helps organizations create fund types, automate recurring collections, reconcile payments, manage member contributions, and execute fund-specific workflows, all from one dashboard. It is not a payment gateway or a digital wallet.",
    },
    {
      q: 'Who is UnityFund for?',
      a: "UnityFund is built for organizations that collect recurring money from members: cooperative societies, staff welfare associations, professional bodies, alumni associations, churches, community groups, and NGOs. If your organization has a treasurer and a WhatsApp payment group, UnityFund was built for you.",
    },
    {
      q: 'How does payment collection work?',
      a: "UnityFund collects payments through Nomba's payment infrastructure, which supports Direct Debit, Checkout, and Virtual Accounts. When a member pays, Nomba sends a verified webhook to UnityFund, which automatically reconciles the contribution. No manual intervention required.",
    },
    {
      q: "Is our members' financial data secure?",
      a: "Yes. Every organization's data is completely isolated from others. Webhook events are cryptographically verified before processing. Payments are protected against double-processing. All financial actions are permanently logged. JWT authentication with expiring tokens secures every session.",
    },
    {
      q: 'What fund types does UnityFund support?',
      a: 'The platform currently supports Annual Dues, Savings Funds, Welfare Funds, Emergency Funds, Building Funds, and Rotational Savings (Ajo/Esusu). Each type has its own contribution rules and payout workflow. Investment Fund support is coming in a future release.',
    },
    {
      q: 'Do we need technical knowledge to use UnityFund?',
      a: "No. UnityFund is designed for organizational administrators and treasurers, not developers. If you can navigate a banking app, you can use UnityFund. Setup takes under 30 minutes.",
    },
  ],
};

export const finalCta = {
  heading: 'Your organization deserves better than spreadsheets.',
  subheading:
    'Join organizations across Nigeria who are replacing manual financial administration with UnityFund\'s automated fund management platform.',
  ctaPrimary: 'Create your organization →',
  ctaSecondary: 'Talk to us first',
  trust: ['Free to start', 'No credit card', 'Setup in 30 min'],
};

export const footer = {
  brand: 'UnityFund',
  tagline: 'The financial operating platform for member-based organizations.',
  columns: [
    {
      heading: 'Product',
      links: ['Features', 'Fund Types', 'How It Works', 'Security', 'Pricing'],
    },
    {
      heading: 'Company',
      links: ['About', 'Blog', 'Contact', 'Careers'],
    },
    {
      heading: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    },
  ],
  email: 'hello@unityfund.io',
  copyright: '© 2026 UnityFund. All rights reserved.',
  credit: 'Built by Team Zero Downtime',
};
