export interface LicenseTier {
  id: string;
  name: string;
  description: string;
  scope: string;
  capabilities: string[];
  features: string[];
  deployment: string;
  accessLimits: string;
  sla: string;
  support: string;
  pricingModel: string;
  badge?: string;
}

export const enterpriseTier: LicenseTier = {
  id: 'enterprise',
  name: 'Enterprise Intelligence License (EIL)',
  description: 'Comprehensive intelligence platform for banks, hedge funds, exchanges, fintechs, and enterprise security teams requiring institutional-grade market surveillance, risk management, and threat detection capabilities.',
  scope: 'Commercial institutions, exchanges, trading firms, banks, fintechs, enterprise risk teams',
  capabilities: [
    'Full UltraFusion Meta-AI supervisor',
    'Hydra coordinated actor detection',
    'Global Constellation 3D network mapping',
    'Sentinel Command Console with automated workflows',
    'Cortex Memory Engine for institutional knowledge',
    'Genesis Archive with 10+ years historical data',
    'Threat Actor Profiler with risk scoring',
    'Oracle Eye visual pattern recognition',
    'Ring Intelligence for wash trading detection',
    'Chain Pressure Analyzer for MEV tracking',
    'Real-time manipulation detection across 100+ exchanges',
    'Multi-user SSO with role-based access control',
    'Custom alert rules and automated response',
    'API access with 500k calls/month',
    'Compliance export (JSON/CSV/PDF)',
    'Historical replay and forensic analysis',
    'Private Slack channel support',
    'Quarterly business reviews'
  ],
  features: [
    'Hydra multi-head detection',
    'UltraFusion supervisor',
    'Constellation 3D map',
    'Sentinel command console',
    'Cortex Memory Engine',
    'Genesis Archive (immutable ledger)',
    'Threat Actor Profiler',
    'Oracle Eye image intelligence',
    '24/7 alert ingestion',
    'Cloud or hybrid deployment'
  ],
  deployment: 'Cloud-hosted or hybrid (sensitive modules on-premise, non-critical in cloud)',
  accessLimits: 'Unlimited users, 500k API calls/month (expandable), unlimited data retention',
  sla: '99.9% uptime with 4-hour response time for critical issues',
  support: 'Dedicated account manager, private Slack channel, phone support, quarterly business reviews',
  pricingModel: 'Annual subscription starting at $120,000/year or custom multi-year enterprise agreement (MEA) with volume discounts',
  badge: 'SOC 2 Type II Ready'
};

export const governmentTier: LicenseTier = {
  id: 'government',
  name: 'Government Intelligence License (GIL)',
  description: 'Federal-grade intelligence platform for law enforcement, financial regulators, cyber divisions, and financial intelligence units requiring CJIS-aligned architecture, FedRAMP compliance pathway, and forensic-grade evidence trails suitable for legal proceedings.',
  scope: 'Federal agencies, state regulators, law enforcement, financial intelligence units, SEC, CFTC, FinCEN, FBI, Secret Service',
  capabilities: [
    'All Enterprise Intelligence License features',
    'CJIS Security Policy v5.9 aligned architecture',
    'FedRAMP LITE authorization pathway',
    'NIST 800-53 Rev 5 security controls',
    'Operation Hydra investigation framework',
    'Case file management with chain of custody',
    'Evidence packaging for legal proceedings',
    'Court-ready documentation and reporting',
    'Multi-agency collaboration tools',
    'Classified data handling capabilities',
    'Immutable audit trails for regulatory compliance',
    'National-scale coordination detection',
    'Cross-border entity tracking',
    'Interagency data sharing protocols',
    'Regulatory report generation (SAR, CTR, FinCEN)',
    'Government cloud deployment options',
    'Dedicated government liaison',
    'Security clearance coordination',
    'Annual compliance audits',
    'Custom training for investigators'
  ],
  features: [
    'Hydra multi-head detection',
    'UltraFusion supervisor',
    'Constellation 3D map',
    'Sentinel command console',
    'Cortex Memory Engine',
    'Genesis Archive (immutable ledger)',
    'Threat Actor Profiler',
    'Oracle Eye image intelligence',
    '24/7 alert ingestion',
    'Government cloud or hybrid deployment'
  ],
  deployment: 'Government cloud (FedRAMP authorized hosting) or hybrid with on-premise sensitive modules',
  accessLimits: 'Unlimited users, unlimited API calls, unlimited data retention with forensic-grade preservation',
  sla: '99.99% uptime with 2-hour response time for critical issues, 24/7 government liaison availability',
  support: 'Dedicated government liaison, 24/7 phone support, on-site training, annual compliance reviews, security clearance coordination',
  pricingModel: 'Custom government contract pricing based on agency size, deployment scope, and compliance requirements. Typically $250,000-$1,000,000/year',
  badge: 'CJIS & FedRAMP Ready'
};

export const nationalSecurityTier: LicenseTier = {
  id: 'nationalSecurity',
  name: 'National Security License (NSL – Air-Gapped)',
  description: 'Maximum-security air-gapped deployment for intelligence agencies, counter-threat divisions, and military cyber commands requiring zero external data flow, SCIF-compatible installation, and classified network compatibility for national security operations.',
  scope: 'National security agencies, intelligence community, DoD, military cyber commands, counter-threat divisions, classified operations',
  capabilities: [
    'All Government Intelligence License features',
    'Air-gapped deployment with zero external data flow',
    'SCIF-compatible installation and operation',
    'Classified network compatibility (SIPRNET, JWICS)',
    'Dedicated hardware delivery and installation',
    'Offline update mechanism via secure media',
    'National threat intelligence modules',
    'Adversarial nation tracking and attribution',
    'Cryptocurrency warfare detection',
    'State-sponsored manipulation identification',
    'Critical infrastructure protection modules',
    'Intelligence community integration protocols',
    'Top Secret clearance required for access',
    'Compartmented information handling (SCI)',
    'Custom security protocols and hardening',
    'On-site installation and configuration',
    'Continuous security assessment and monitoring',
    'Threat briefings for national security leadership',
    'Custom intelligence module development',
    'Zero-trust architecture implementation'
  ],
  features: [
    'Hydra multi-head detection',
    'UltraFusion supervisor',
    'Constellation 3D map',
    'Sentinel command console',
    'Cortex Memory Engine',
    'Genesis Archive (immutable ledger)',
    'Threat Actor Profiler',
    'Oracle Eye image intelligence',
    '24/7 alert ingestion',
    'Air-gapped offline mode (exclusive)'
  ],
  deployment: 'Air-gapped only – completely isolated deployment with zero external connectivity, SCIF-compatible',
  accessLimits: 'Unlimited users (cleared personnel only), unlimited processing, unlimited data retention in classified environment',
  sla: '99.99% uptime (air-gapped environment), dedicated national security liaison with Top Secret clearance, immediate response for critical threats',
  support: 'Dedicated national security liaison with TS/SCI clearance, on-site support, continuous security assessment, threat briefings, custom module development',
  pricingModel: 'Classified pricing – custom national security contract based on deployment scope, clearance requirements, and operational needs. Contact for secure briefing.',
  badge: 'Air-Gapped & SCIF-Compatible'
};

export const licenseTiers = [enterpriseTier, governmentTier, nationalSecurityTier];

export function getLicenseTier(id: string): LicenseTier | undefined {
  return licenseTiers.find(tier => tier.id === id);
}

export function getAllLicenseTiers(): LicenseTier[] {
  return licenseTiers;
}

export interface ContractOption {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
}

export const contractOptions: ContractOption[] = [
  {
    id: 'annual',
    name: 'Annual License',
    description: 'Standard one-year licensing agreement with automatic renewal option. Includes all platform updates, security patches, and standard support. Ideal for organizations evaluating long-term commitment or requiring annual budget cycles.',
    suitableFor: 'Small to mid-size institutions, trading firms, initial deployments'
  },
  {
    id: 'mea',
    name: 'Multi-Year Enterprise Agreement (MEA)',
    description: 'Three to five-year enterprise agreement with volume discounts, locked-in pricing, and priority feature development. Includes dedicated account management, custom SLA terms, and guaranteed capacity. Best value for long-term partnerships.',
    suitableFor: 'Large institutions, exchanges, banks, hedge funds with $1B+ AUM'
  },
  {
    id: 'govOffsite',
    name: 'Government Off-Site Deployment',
    description: 'Specialized deployment for government agencies requiring FedRAMP authorized hosting with data sovereignty guarantees. Includes government cloud infrastructure, compliance documentation, and regulatory audit support.',
    suitableFor: 'Federal agencies, state regulators, law enforcement requiring cloud deployment'
  },
  {
    id: 'airGapped',
    name: 'On-Prem / Air-Gapped Deployment',
    description: 'Complete on-premise or air-gapped installation with dedicated hardware, offline update mechanisms, and zero external connectivity. Includes on-site installation, configuration, training, and continuous security assessment for maximum security environments.',
    suitableFor: 'Intelligence agencies, military cyber commands, classified operations, SCIF environments'
  },
  {
    id: 'customModule',
    name: 'Custom Intelligence Module Agreement',
    description: 'Development of custom intelligence modules tailored to specific organizational needs, threat models, or operational requirements. Includes requirements analysis, development, testing, deployment, and ongoing maintenance of bespoke intelligence capabilities.',
    suitableFor: 'Organizations with unique threat models, specialized compliance needs, or proprietary detection requirements'
  },
  {
    id: 'jointOps',
    name: 'Joint Operations Intelligence Sharing Addendum',
    description: 'Multi-agency or multi-organization intelligence sharing framework enabling secure collaboration, data exchange, and coordinated threat response. Includes secure communication channels, access controls, and audit trails for joint operations.',
    suitableFor: 'Multi-agency task forces, international regulatory cooperation, consortium arrangements'
  }
];
