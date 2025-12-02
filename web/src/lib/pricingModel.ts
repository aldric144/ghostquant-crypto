export interface Tier {
  id: string;
  name: string;
  price: string;
  priceMonthly?: string;
  priceYearly?: string;
  description: string;
  subtitle: string;
  features: string[];
  apiRateLimit: string;
  engines: string[];
  retention: string;
  support: string;
  sla: string;
  deployment: string;
  userType: string;
  ctaText: string;
  ctaLink: string;
  highlighted?: boolean;
  governmentOnly?: boolean;
}

export const pricingTiers: Record<string, Tier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceMonthly: '$0',
    priceYearly: '$0',
    description: 'Essential intelligence for retail traders and individual analysts',
    subtitle: 'Get started with basic market intelligence',
    features: [
      'Real-time predictions (10/day)',
      'Basic entity lookup',
      'Volatility detection',
      'Manipulation alerts (limited)',
      'Basic behavioral DNA scans',
      'Community support',
      'Public API access (100 calls/day)',
      '7-day data retention',
      'Web dashboard access',
      'Email alerts'
    ],
    apiRateLimit: '100 calls/day',
    engines: [
      'Prediction Engine (limited)',
      'Basic Manipulation Detector',
      'Volatility Scanner'
    ],
    retention: '7 days',
    support: 'Community forum',
    sla: 'Best effort',
    deployment: 'Cloud only',
    userType: 'Individual traders, students, researchers',
    ctaText: 'Start Free',
    ctaLink: '/signup?tier=free'
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    price: '$99/mo',
    priceMonthly: '$99',
    priceYearly: '$990',
    description: 'Advanced intelligence for professional traders and analysts',
    subtitle: 'Full prediction suite with advanced analytics',
    features: [
      'Unlimited predictions',
      'Full entity intelligence',
      'Token Intelligence Explorer',
      'Advanced manipulation detection',
      'Behavioral DNA™ profiling',
      'UltraFusion Meta-AI (limited)',
      'Threat Actor Profiler™',
      'Global Radar Heatmap',
      'Real-time alerts (unlimited)',
      'API access (5,000 calls/mo)',
      '30-day data retention',
      'Priority email support',
      'Slack/webhook integration',
      'Custom alert rules',
      'Export to CSV/JSON'
    ],
    apiRateLimit: '5,000 calls/month',
    engines: [
      'Prediction Engine',
      'UltraFusion Meta-AI (limited)',
      'Manipulation Detector',
      'Behavioral DNA Engine',
      'Threat Actor Profiler',
      'Global Radar',
      'Volatility Scanner'
    ],
    retention: '30 days',
    support: 'Priority email (24h response)',
    sla: '99.5% uptime',
    deployment: 'Cloud only',
    userType: 'Professional traders, quantitative analysts, small funds',
    ctaText: 'Start Pro',
    ctaLink: '/signup?tier=pro',
    highlighted: true
  },

  elite: {
    id: 'elite',
    name: 'Elite',
    price: '$499/mo',
    priceMonthly: '$499',
    priceYearly: '$4,990',
    description: 'Complete intelligence suite for trading firms and hedge funds',
    subtitle: 'Full UltraFusion, Hydra, and Constellation access',
    features: [
      'Everything in Pro',
      'Full UltraFusion Meta-AI',
      'Hydra Coordinated Actor Detection',
      'Global Constellation 3D Map',
      'Sentinel Command Console',
      'Cortex Memory Engine',
      'Oracle Eye™ visual analysis',
      'Ring Intelligence Engine',
      'Chain Pressure Analyzer',
      'Genesis Archive (1 year)',
      'API access (50,000 calls/mo)',
      '1-year data retention',
      'Multi-user accounts (5 seats)',
      'Private Slack channel',
      'Phone support',
      'Custom integrations',
      'Compliance export (JSON/CSV)',
      'Historical replay',
      'Advanced forensics'
    ],
    apiRateLimit: '50,000 calls/month',
    engines: [
      'Full UltraFusion Meta-AI',
      'Hydra Coordinated Network',
      'Constellation 3D Map',
      'Sentinel Console',
      'Cortex Memory',
      'Genesis Archive',
      'Threat Actor Profiler',
      'Oracle Eye',
      'Ring Intelligence',
      'Chain Pressure Analyzer',
      'Global Radar',
      'Manipulation Detector',
      'Behavioral DNA Engine',
      'Prediction Engine'
    ],
    retention: '1 year',
    support: 'Private Slack + phone (4h response)',
    sla: '99.9% uptime',
    deployment: 'Cloud or hybrid',
    userType: 'Hedge funds, trading firms, exchanges, market makers',
    ctaText: 'Start Elite',
    ctaLink: '/signup?tier=elite'
  },

  institutional: {
    id: 'institutional',
    name: 'Institutional',
    price: 'Custom',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    description: 'Enterprise-grade intelligence for large institutions and exchanges',
    subtitle: 'Dedicated infrastructure with unlimited access',
    features: [
      'Everything in Elite',
      'Unlimited API calls',
      'Unlimited data retention',
      'Unlimited user seats',
      'Dedicated infrastructure',
      'Custom intelligence modules',
      'SOC 2 Type II compliance',
      'SSO / SAML integration',
      'Advanced IAM controls',
      'Custom SLA (up to 99.99%)',
      'White-glove onboarding',
      'Dedicated account manager',
      'Custom training sessions',
      'On-premise deployment option',
      'Air-gapped deployment option',
      'Custom compliance reporting',
      'Regulatory audit support',
      'Legal evidence packaging',
      '24/7 phone support',
      'Custom feature development'
    ],
    apiRateLimit: 'Unlimited',
    engines: [
      'All intelligence engines',
      'Custom modules available',
      'Full UltraFusion Meta-AI',
      'Hydra Coordinated Network',
      'Constellation 3D Map',
      'Sentinel Console',
      'Cortex Memory',
      'Genesis Archive (unlimited)',
      'Threat Actor Profiler',
      'Oracle Eye',
      'Ring Intelligence',
      'Chain Pressure Analyzer',
      'Operation Hydra',
      'Global Radar',
      'Manipulation Detector',
      'Behavioral DNA Engine',
      'Prediction Engine'
    ],
    retention: 'Unlimited',
    support: 'Dedicated account manager + 24/7 phone',
    sla: 'Custom (up to 99.99%)',
    deployment: 'Cloud, hybrid, or on-premise',
    userType: 'Large exchanges, institutional investors, banks, regulators',
    ctaText: 'Contact Sales',
    ctaLink: '/contact?type=institutional'
  },

  government: {
    id: 'government',
    name: 'Government Intelligence Tier',
    price: 'Custom',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    description: 'Federal-grade intelligence for regulatory agencies and law enforcement',
    subtitle: 'CJIS-aligned with FedRAMP pathway',
    features: [
      'Everything in Institutional',
      'CJIS Security Policy v5.9 aligned',
      'FedRAMP LITE pathway',
      'NIST 800-53 Rev 5 controls',
      'Operation Hydra investigation framework',
      'Case file management',
      'Evidence chain of custody',
      'Regulatory report generation',
      'Multi-agency collaboration',
      'Classified data handling',
      'Audit trail (immutable)',
      'Legal evidence packaging',
      'Court-ready documentation',
      'National-scale coordination detection',
      'Cross-border tracking',
      'Interagency data sharing',
      'Government cloud deployment',
      'FedRAMP authorized hosting',
      'Dedicated government support',
      'Security clearance coordination'
    ],
    apiRateLimit: 'Unlimited',
    engines: [
      'All intelligence engines',
      'Operation Hydra',
      'Government-specific modules',
      'Full UltraFusion Meta-AI',
      'Hydra Coordinated Network',
      'Constellation 3D Map',
      'Sentinel Console',
      'Cortex Memory',
      'Genesis Archive (unlimited)',
      'Threat Actor Profiler',
      'Oracle Eye',
      'Ring Intelligence',
      'Chain Pressure Analyzer',
      'Global Radar',
      'Manipulation Detector',
      'Behavioral DNA Engine',
      'Prediction Engine'
    ],
    retention: 'Unlimited (forensic-grade)',
    support: 'Dedicated government liaison + 24/7',
    sla: '99.99% uptime',
    deployment: 'Government cloud or hybrid',
    userType: 'Federal agencies, state regulators, law enforcement, SEC, CFTC, FinCEN',
    ctaText: 'Request Briefing',
    ctaLink: '/contact?type=government',
    governmentOnly: true
  },

  nationalSecurity: {
    id: 'nationalSecurity',
    name: 'National Security Tier',
    price: 'Classified',
    priceMonthly: 'Classified',
    priceYearly: 'Classified',
    description: 'Air-gapped deployment for classified national security operations',
    subtitle: 'Maximum security with zero external data flow',
    features: [
      'Everything in Government tier',
      'Air-gapped deployment only',
      'Zero external data flow',
      'Classified network compatibility',
      'SCIF-compatible deployment',
      'Dedicated hardware delivery',
      'Offline update mechanism',
      'Secure media updates only',
      'National threat intelligence',
      'Adversarial nation tracking',
      'Cryptocurrency warfare detection',
      'State-sponsored manipulation',
      'Critical infrastructure protection',
      'National security briefings',
      'Intelligence community integration',
      'Top Secret clearance required',
      'Compartmented information handling',
      'Custom security protocols',
      'On-site installation support',
      'Continuous security assessment'
    ],
    apiRateLimit: 'Unlimited (air-gapped)',
    engines: [
      'All intelligence engines (air-gapped)',
      'National security modules',
      'Adversarial nation tracking',
      'State-sponsored detection',
      'Full UltraFusion Meta-AI',
      'Hydra Coordinated Network',
      'Constellation 3D Map',
      'Sentinel Console',
      'Cortex Memory',
      'Genesis Archive (unlimited)',
      'Threat Actor Profiler',
      'Oracle Eye',
      'Ring Intelligence',
      'Chain Pressure Analyzer',
      'Operation Hydra',
      'Global Radar',
      'Manipulation Detector',
      'Behavioral DNA Engine',
      'Prediction Engine'
    ],
    retention: 'Unlimited (classified)',
    support: 'Dedicated national security liaison',
    sla: '99.99% uptime (air-gapped)',
    deployment: 'Air-gapped only',
    userType: 'National security agencies, intelligence community, DoD, classified operations',
    ctaText: 'Request Secure Briefing',
    ctaLink: '/contact?type=national-security',
    governmentOnly: true
  }
};

export const tierOrder = ['free', 'pro', 'elite', 'institutional', 'government', 'nationalSecurity'];

export function getTier(id: string): Tier | undefined {
  return pricingTiers[id];
}

export function getAllTiers(): Tier[] {
  return tierOrder.map(id => pricingTiers[id]);
}

export function getPublicTiers(): Tier[] {
  return tierOrder
    .filter(id => !pricingTiers[id].governmentOnly)
    .map(id => pricingTiers[id]);
}

export function getGovernmentTiers(): Tier[] {
  return tierOrder
    .filter(id => pricingTiers[id].governmentOnly)
    .map(id => pricingTiers[id]);
}
