"""
Channel Partner Contract Templates
Global Distributor Edition (GDE)

Comprehensive contract templates for global distribution agreements including
master distribution, regional, exclusive, and specialized contract types.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from .contract_schema import (
    ContractType,
    DistributorTier,
    RegionCode,
    CurrencyCode,
    PaymentTerms,
    ComplianceLevel
)


class ContractTemplates:
    """
    Global Distributor Contract Templates Engine
    
    Provides production-ready contract templates for various distribution
    agreement types with region-specific customizations.
    """
    
    VERSION = "3.0.0"
    
    TIER_CONFIGURATIONS = {
        DistributorTier.AUTHORIZED: {
            'name': 'Authorized Distributor',
            'min_commitment': 100000,
            'max_discount': 0.20,
            'credit_limit': 50000,
            'payment_terms': PaymentTerms.NET_30,
            'mdf_percentage': 0.02,
            'rebate_cap': 0.05,
            'support_level': 'Standard',
            'training_hours': 16,
            'certification_required': False,
            'exclusive_eligible': False,
            'nfr_licenses': 2
        },
        DistributorTier.PREFERRED: {
            'name': 'Preferred Distributor',
            'min_commitment': 250000,
            'max_discount': 0.30,
            'credit_limit': 150000,
            'payment_terms': PaymentTerms.NET_45,
            'mdf_percentage': 0.03,
            'rebate_cap': 0.08,
            'support_level': 'Priority',
            'training_hours': 32,
            'certification_required': True,
            'exclusive_eligible': False,
            'nfr_licenses': 5
        },
        DistributorTier.PREMIER: {
            'name': 'Premier Distributor',
            'min_commitment': 500000,
            'max_discount': 0.40,
            'credit_limit': 500000,
            'payment_terms': PaymentTerms.NET_60,
            'mdf_percentage': 0.05,
            'rebate_cap': 0.12,
            'support_level': 'Dedicated',
            'training_hours': 64,
            'certification_required': True,
            'exclusive_eligible': True,
            'nfr_licenses': 10
        },
        DistributorTier.STRATEGIC: {
            'name': 'Strategic Distributor',
            'min_commitment': 1000000,
            'max_discount': 0.50,
            'credit_limit': 1000000,
            'payment_terms': PaymentTerms.NET_60,
            'mdf_percentage': 0.08,
            'rebate_cap': 0.15,
            'support_level': 'Executive',
            'training_hours': 120,
            'certification_required': True,
            'exclusive_eligible': True,
            'nfr_licenses': 25
        },
        DistributorTier.GLOBAL_ELITE: {
            'name': 'Global Elite Distributor',
            'min_commitment': 5000000,
            'max_discount': 0.60,
            'credit_limit': 5000000,
            'payment_terms': PaymentTerms.NET_90,
            'mdf_percentage': 0.12,
            'rebate_cap': 0.20,
            'support_level': 'White Glove',
            'training_hours': 200,
            'certification_required': True,
            'exclusive_eligible': True,
            'nfr_licenses': 50
        }
    }
    
    REGION_CONFIGURATIONS = {
        RegionCode.AMERICAS: {
            'name': 'Americas',
            'countries': ['United States', 'Canada', 'Mexico'],
            'primary_currency': CurrencyCode.USD,
            'governing_law': 'State of Delaware, United States',
            'arbitration_venue': 'New York, NY',
            'compliance_frameworks': ['SOC 2', 'CCPA', 'HIPAA'],
            'tax_considerations': ['Sales Tax', 'Use Tax'],
            'language': 'English'
        },
        RegionCode.EMEA: {
            'name': 'Europe, Middle East & Africa',
            'countries': ['United Kingdom', 'Germany', 'France', 'Netherlands', 'UAE'],
            'primary_currency': CurrencyCode.EUR,
            'governing_law': 'England and Wales',
            'arbitration_venue': 'London, UK',
            'compliance_frameworks': ['GDPR', 'ISO 27001', 'SOC 2'],
            'tax_considerations': ['VAT', 'Withholding Tax'],
            'language': 'English'
        },
        RegionCode.APAC: {
            'name': 'Asia Pacific',
            'countries': ['Japan', 'Singapore', 'Australia', 'South Korea', 'India'],
            'primary_currency': CurrencyCode.USD,
            'governing_law': 'Singapore',
            'arbitration_venue': 'Singapore',
            'compliance_frameworks': ['PDPA', 'APPI', 'ISO 27001'],
            'tax_considerations': ['GST', 'Withholding Tax'],
            'language': 'English'
        },
        RegionCode.LATAM: {
            'name': 'Latin America',
            'countries': ['Brazil', 'Mexico', 'Argentina', 'Colombia', 'Chile'],
            'primary_currency': CurrencyCode.USD,
            'governing_law': 'State of Florida, United States',
            'arbitration_venue': 'Miami, FL',
            'compliance_frameworks': ['LGPD', 'ISO 27001'],
            'tax_considerations': ['IVA', 'Withholding Tax'],
            'language': 'Spanish/Portuguese'
        },
        RegionCode.MENA: {
            'name': 'Middle East & North Africa',
            'countries': ['UAE', 'Saudi Arabia', 'Egypt', 'Qatar', 'Kuwait'],
            'primary_currency': CurrencyCode.AED,
            'governing_law': 'Dubai International Financial Centre',
            'arbitration_venue': 'Dubai, UAE',
            'compliance_frameworks': ['PDPL', 'ISO 27001'],
            'tax_considerations': ['VAT'],
            'language': 'English/Arabic'
        },
        RegionCode.DACH: {
            'name': 'Germany, Austria, Switzerland',
            'countries': ['Germany', 'Austria', 'Switzerland'],
            'primary_currency': CurrencyCode.EUR,
            'governing_law': 'Germany',
            'arbitration_venue': 'Frankfurt, Germany',
            'compliance_frameworks': ['GDPR', 'BDSG', 'ISO 27001'],
            'tax_considerations': ['VAT', 'Withholding Tax'],
            'language': 'German'
        },
        RegionCode.NORDICS: {
            'name': 'Nordic Countries',
            'countries': ['Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland'],
            'primary_currency': CurrencyCode.EUR,
            'governing_law': 'Sweden',
            'arbitration_venue': 'Stockholm, Sweden',
            'compliance_frameworks': ['GDPR', 'ISO 27001'],
            'tax_considerations': ['VAT'],
            'language': 'English'
        },
        RegionCode.ANZ: {
            'name': 'Australia & New Zealand',
            'countries': ['Australia', 'New Zealand'],
            'primary_currency': CurrencyCode.AUD,
            'governing_law': 'New South Wales, Australia',
            'arbitration_venue': 'Sydney, Australia',
            'compliance_frameworks': ['Privacy Act', 'ISO 27001'],
            'tax_considerations': ['GST'],
            'language': 'English'
        },
        RegionCode.GREATER_CHINA: {
            'name': 'Greater China',
            'countries': ['China', 'Hong Kong', 'Taiwan'],
            'primary_currency': CurrencyCode.CNY,
            'governing_law': 'Hong Kong SAR',
            'arbitration_venue': 'Hong Kong',
            'compliance_frameworks': ['PIPL', 'CSL', 'ISO 27001'],
            'tax_considerations': ['VAT', 'Withholding Tax'],
            'language': 'Chinese/English'
        },
        RegionCode.INDIA_SUBCONTINENT: {
            'name': 'India & Subcontinent',
            'countries': ['India', 'Bangladesh', 'Sri Lanka', 'Pakistan'],
            'primary_currency': CurrencyCode.INR,
            'governing_law': 'India',
            'arbitration_venue': 'Mumbai, India',
            'compliance_frameworks': ['DPDP', 'ISO 27001'],
            'tax_considerations': ['GST', 'TDS'],
            'language': 'English'
        },
        RegionCode.JAPAN_KOREA: {
            'name': 'Japan & Korea',
            'countries': ['Japan', 'South Korea'],
            'primary_currency': CurrencyCode.JPY,
            'governing_law': 'Japan',
            'arbitration_venue': 'Tokyo, Japan',
            'compliance_frameworks': ['APPI', 'PIPA', 'ISO 27001'],
            'tax_considerations': ['Consumption Tax'],
            'language': 'Japanese/Korean'
        },
        RegionCode.ASEAN: {
            'name': 'ASEAN',
            'countries': ['Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam'],
            'primary_currency': CurrencyCode.SGD,
            'governing_law': 'Singapore',
            'arbitration_venue': 'Singapore',
            'compliance_frameworks': ['PDPA', 'ISO 27001'],
            'tax_considerations': ['GST', 'Withholding Tax'],
            'language': 'English'
        },
        RegionCode.GLOBAL: {
            'name': 'Global (Worldwide)',
            'countries': ['All Countries'],
            'primary_currency': CurrencyCode.USD,
            'governing_law': 'State of Delaware, United States',
            'arbitration_venue': 'New York, NY',
            'compliance_frameworks': ['SOC 2', 'ISO 27001', 'GDPR'],
            'tax_considerations': ['Various'],
            'language': 'English'
        }
    }
    
    PRODUCT_CATALOG = {
        'ghostquant_enterprise': {
            'product_id': 'GQ-ENT-001',
            'product_name': 'GhostQuant Enterprise Platform',
            'product_category': 'Platform',
            'sku': 'GQ-ENT-ANNUAL',
            'list_price': 50000.00,
            'min_order_qty': 1,
            'support_tier': 'enterprise',
            'warranty_months': 12
        },
        'ghostquant_professional': {
            'product_id': 'GQ-PRO-001',
            'product_name': 'GhostQuant Professional',
            'product_category': 'Platform',
            'sku': 'GQ-PRO-ANNUAL',
            'list_price': 15000.00,
            'min_order_qty': 5,
            'support_tier': 'professional',
            'warranty_months': 12
        },
        'alphabrain_module': {
            'product_id': 'GQ-AB-001',
            'product_name': 'AlphaBrain Intelligence Module',
            'product_category': 'Module',
            'sku': 'GQ-AB-ANNUAL',
            'list_price': 25000.00,
            'min_order_qty': 1,
            'support_tier': 'enterprise',
            'warranty_months': 12
        },
        'ecoscan_module': {
            'product_id': 'GQ-ES-001',
            'product_name': 'Ecoscan Analytics Module',
            'product_category': 'Module',
            'sku': 'GQ-ES-ANNUAL',
            'list_price': 20000.00,
            'min_order_qty': 1,
            'support_tier': 'enterprise',
            'warranty_months': 12
        },
        'sentinel_module': {
            'product_id': 'GQ-SN-001',
            'product_name': 'Sentinel Security Module',
            'product_category': 'Module',
            'sku': 'GQ-SN-ANNUAL',
            'list_price': 30000.00,
            'min_order_qty': 1,
            'support_tier': 'enterprise',
            'warranty_months': 12
        },
        'constellation_module': {
            'product_id': 'GQ-CN-001',
            'product_name': 'Constellation Network Module',
            'product_category': 'Module',
            'sku': 'GQ-CN-ANNUAL',
            'list_price': 35000.00,
            'min_order_qty': 1,
            'support_tier': 'enterprise',
            'warranty_months': 12
        },
        'implementation_services': {
            'product_id': 'GQ-SVC-001',
            'product_name': 'Professional Implementation Services',
            'product_category': 'Services',
            'sku': 'GQ-SVC-IMPL',
            'list_price': 15000.00,
            'min_order_qty': 1,
            'support_tier': 'professional',
            'warranty_months': 3
        },
        'training_package': {
            'product_id': 'GQ-TRN-001',
            'product_name': 'Certified Training Package',
            'product_category': 'Training',
            'sku': 'GQ-TRN-CERT',
            'list_price': 5000.00,
            'min_order_qty': 1,
            'support_tier': 'standard',
            'warranty_months': 0
        }
    }
    
    def __init__(self):
        self._template_cache: Dict[str, str] = {}
    
    def get_master_distribution_template(
        self,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode,
        contract_type: ContractType = ContractType.MASTER_DISTRIBUTION
    ) -> str:
        """Generate master distribution agreement template"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        region_config = self.REGION_CONFIGURATIONS[region]
        effective_date = datetime.utcnow().strftime("%B %d, %Y")
        expiration_date = (datetime.utcnow() + timedelta(days=365)).strftime("%B %d, %Y")
        
        template = f"""
================================================================================
                    MASTER DISTRIBUTION AGREEMENT
                    Global Distributor Edition v{self.VERSION}
================================================================================

AGREEMENT NUMBER: GQ-MDA-{datetime.utcnow().strftime('%Y%m%d')}-{region.value.upper()[:3]}

This Master Distribution Agreement ("Agreement") is entered into as of 
{effective_date} ("Effective Date")

BETWEEN:

GhostQuant Technologies, Inc.
A Delaware Corporation
123 Innovation Drive, Suite 500
San Francisco, CA 94105
United States of America
("Vendor" or "GhostQuant")

AND:

{distributor_name}
[Legal Entity Type]
[Registered Address]
[Country of Incorporation]
("Distributor")

Collectively referred to as the "Parties" and individually as a "Party"

================================================================================
                              RECITALS
================================================================================

WHEREAS, GhostQuant is engaged in the business of developing, marketing, and 
licensing enterprise-grade quantitative intelligence software and related 
services for digital asset markets;

WHEREAS, Distributor is engaged in the business of distributing, marketing, 
and supporting enterprise software solutions within the {region_config['name']} 
region;

WHEREAS, GhostQuant desires to appoint Distributor as a {tier_config['name']} 
for the distribution of GhostQuant Products within the Territory, and 
Distributor desires to accept such appointment;

NOW, THEREFORE, in consideration of the mutual covenants and agreements 
hereinafter set forth and for other good and valuable consideration, the 
receipt and sufficiency of which are hereby acknowledged, the Parties agree 
as follows:

================================================================================
                        ARTICLE 1: DEFINITIONS
================================================================================

1.1 "Affiliate" means any entity that directly or indirectly controls, is 
controlled by, or is under common control with a Party.

1.2 "Authorized Products" means the GhostQuant software products, modules, 
and services listed in Exhibit A attached hereto.

1.3 "Confidential Information" means all non-public information disclosed by 
either Party to the other Party, whether orally or in writing.

1.4 "Customer" means any end-user who purchases or licenses Authorized 
Products through Distributor.

1.5 "Intellectual Property Rights" means all patents, copyrights, trademarks, 
trade secrets, and other intellectual property rights.

1.6 "List Price" means GhostQuant's published list prices for Authorized 
Products as updated from time to time.

1.7 "Net Revenue" means gross revenue from sales of Authorized Products less 
returns, credits, and applicable taxes.

1.8 "Territory" means the geographic region defined in Exhibit B, specifically 
the {region_config['name']} region including: {', '.join(region_config['countries'])}.

================================================================================
                      ARTICLE 2: APPOINTMENT
================================================================================

2.1 Appointment. Subject to the terms and conditions of this Agreement, 
GhostQuant hereby appoints Distributor as a {"non-exclusive" if contract_type != ContractType.EXCLUSIVE_DISTRIBUTION else "exclusive"} 
{tier_config['name']} of Authorized Products within the Territory.

2.2 Tier Status. Distributor is appointed at the {tier.value.upper()} tier 
level, which entitles Distributor to the benefits and obligations set forth 
in Exhibit C.

2.3 Acceptance. Distributor hereby accepts such appointment and agrees to 
use commercially reasonable efforts to promote, market, and distribute 
Authorized Products within the Territory.

2.4 Reservation of Rights. GhostQuant reserves the right to:
    (a) Sell directly to end-users within the Territory;
    (b) Appoint additional distributors within the Territory;
    (c) Modify the Authorized Products list upon thirty (30) days' notice.

================================================================================
                    ARTICLE 3: DISTRIBUTOR OBLIGATIONS
================================================================================

3.1 Minimum Commitments. Distributor agrees to achieve the following minimum 
performance requirements during each Contract Year:
    (a) Minimum Annual Revenue: ${tier_config['min_commitment']:,.2f}
    (b) Minimum Quarterly Growth: 5% quarter-over-quarter
    (c) Customer Satisfaction Score: 4.0 or higher (out of 5.0)

3.2 Sales and Marketing. Distributor shall:
    (a) Maintain a dedicated sales team of at least [X] personnel;
    (b) Conduct at least [X] marketing events per quarter;
    (c) Maintain an active online presence promoting Authorized Products;
    (d) Participate in GhostQuant partner programs and initiatives.

3.3 Technical Capabilities. Distributor shall:
    (a) Maintain certified technical staff as required by Exhibit D;
    (b) Provide first-line technical support to Customers;
    (c) Complete required training within ninety (90) days of execution;
    (d) Maintain {tier_config['training_hours']} hours of annual training.

3.4 Reporting. Distributor shall provide GhostQuant with:
    (a) Monthly sales reports within ten (10) business days of month-end;
    (b) Quarterly business reviews within fifteen (15) business days;
    (c) Annual forecasts by December 1st of each year;
    (d) Customer feedback and market intelligence as reasonably requested.

3.5 Compliance. Distributor shall:
    (a) Comply with all applicable laws and regulations;
    (b) Maintain required certifications: {', '.join(region_config['compliance_frameworks'])};
    (c) Adhere to GhostQuant's Partner Code of Conduct;
    (d) Cooperate with audits as specified in Article 12.

================================================================================
                    ARTICLE 4: GHOSTQUANT OBLIGATIONS
================================================================================

4.1 Product Supply. GhostQuant shall:
    (a) Provide access to Authorized Products for distribution;
    (b) Maintain product availability and service levels;
    (c) Provide reasonable notice of product changes or discontinuation.

4.2 Support. GhostQuant shall provide:
    (a) {tier_config['support_level']} level partner support;
    (b) Technical escalation path for complex issues;
    (c) Access to partner portal and resources;
    (d) {tier_config['nfr_licenses']} NFR (Not-For-Resale) licenses.

4.3 Training and Enablement. GhostQuant shall:
    (a) Provide access to partner training programs;
    (b) Conduct quarterly product update briefings;
    (c) Supply marketing materials and sales tools;
    (d) Offer certification programs for Distributor personnel.

4.4 Marketing Support. GhostQuant shall:
    (a) Allocate Market Development Funds (MDF) per Exhibit E;
    (b) Provide co-marketing opportunities;
    (c) Include Distributor in partner directory;
    (d) Support joint customer engagements as appropriate.

================================================================================
                      ARTICLE 5: PRICING AND PAYMENT
================================================================================

5.1 Pricing. Distributor shall receive the following pricing structure:
    (a) Base Discount: {tier_config['max_discount']*100:.0f}% off List Price
    (b) Volume Discounts: Per Exhibit F pricing schedule
    (c) Special Pricing: Available for approved opportunities

5.2 Payment Terms. 
    (a) Standard Terms: {tier_config['payment_terms'].value.replace('_', ' ').title()}
    (b) Currency: {region_config['primary_currency'].value}
    (c) Credit Limit: ${tier_config['credit_limit']:,.2f}

5.3 Invoicing. GhostQuant shall invoice Distributor upon:
    (a) Order acceptance for product licenses;
    (b) Service delivery milestones for professional services;
    (c) Renewal dates for subscription products.

5.4 Taxes. 
    (a) All prices are exclusive of applicable taxes;
    (b) Distributor is responsible for: {', '.join(region_config['tax_considerations'])};
    (c) Withholding taxes shall be grossed up as required.

================================================================================
                    ARTICLE 6: REBATES AND INCENTIVES
================================================================================

6.1 Performance Rebates. Distributor may earn rebates based on:
    (a) Annual Revenue Achievement: Up to {tier_config['rebate_cap']*100:.0f}% rebate
    (b) Growth Acceleration: Additional 2% for exceeding targets by 25%+
    (c) New Customer Acquisition: $500 per new enterprise customer

6.2 Market Development Funds (MDF).
    (a) Annual Allocation: {tier_config['mdf_percentage']*100:.0f}% of prior year revenue
    (b) Eligible Activities: Per Exhibit E
    (c) Claim Process: Submit within 60 days of activity completion
    (d) Reimbursement: 50% of approved expenses

6.3 Special Incentives.
    (a) Quarterly SPIFFs for strategic products;
    (b) Deal registration bonuses;
    (c) Certification achievement bonuses.

================================================================================
                          ARTICLE 7: TERM
================================================================================

7.1 Initial Term. This Agreement shall commence on the Effective Date and 
continue for a period of twelve (12) months ("Initial Term").

7.2 Renewal. This Agreement shall automatically renew for successive 
twelve (12) month periods ("Renewal Terms") unless either Party provides 
written notice of non-renewal at least ninety (90) days prior to expiration.

7.3 Tier Review. GhostQuant shall review Distributor's tier status annually 
based on performance against commitments.

================================================================================
                      ARTICLE 8: TERMINATION
================================================================================

8.1 Termination for Convenience. Either Party may terminate this Agreement 
upon ninety (90) days' prior written notice.

8.2 Termination for Cause. Either Party may terminate immediately upon:
    (a) Material breach not cured within thirty (30) days of notice;
    (b) Insolvency or bankruptcy of the other Party;
    (c) Change of control of Distributor without GhostQuant consent;
    (d) Violation of applicable laws or regulations.

8.3 Effect of Termination. Upon termination:
    (a) All outstanding invoices become immediately due;
    (b) Distributor shall cease using GhostQuant trademarks;
    (c) Confidential Information shall be returned or destroyed;
    (d) Existing customer contracts shall be honored per transition plan.

================================================================================
                    ARTICLE 9: INTELLECTUAL PROPERTY
================================================================================

9.1 Ownership. GhostQuant retains all Intellectual Property Rights in 
Authorized Products. No rights are transferred except as expressly granted.

9.2 Trademark License. GhostQuant grants Distributor a limited, non-exclusive 
license to use GhostQuant trademarks solely for distribution purposes.

9.3 Restrictions. Distributor shall not:
    (a) Modify, reverse engineer, or create derivative works;
    (b) Remove or alter proprietary notices;
    (c) Use trademarks except as authorized;
    (d) Challenge GhostQuant's Intellectual Property Rights.

================================================================================
                      ARTICLE 10: CONFIDENTIALITY
================================================================================

10.1 Obligations. Each Party shall:
    (a) Maintain confidentiality of the other Party's Confidential Information;
    (b) Use Confidential Information only for Agreement purposes;
    (c) Limit disclosure to personnel with need-to-know;
    (d) Protect Confidential Information with reasonable care.

10.2 Exclusions. Confidential Information does not include information that:
    (a) Is or becomes publicly available without breach;
    (b) Was known prior to disclosure;
    (c) Is independently developed without use of Confidential Information;
    (d) Is disclosed by a third party without restriction.

10.3 Duration. Confidentiality obligations survive termination for five (5) 
years, except for trade secrets which survive indefinitely.

================================================================================
                  ARTICLE 11: REPRESENTATIONS AND WARRANTIES
================================================================================

11.1 Mutual Representations. Each Party represents and warrants that:
    (a) It has authority to enter into this Agreement;
    (b) Execution does not violate other agreements;
    (c) It will comply with applicable laws.

11.2 GhostQuant Warranties. GhostQuant warrants that:
    (a) Authorized Products will perform substantially as documented;
    (b) It has rights to grant licenses hereunder;
    (c) Products do not infringe third-party Intellectual Property Rights.

11.3 Disclaimer. EXCEPT AS EXPRESSLY SET FORTH HEREIN, GHOSTQUANT MAKES NO 
WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY OR 
FITNESS FOR A PARTICULAR PURPOSE.

================================================================================
                    ARTICLE 12: AUDIT RIGHTS
================================================================================

12.1 Records. Distributor shall maintain accurate records of all transactions 
under this Agreement for five (5) years.

12.2 Audit. GhostQuant may audit Distributor's records upon reasonable notice, 
no more than once per year, during normal business hours.

12.3 Costs. GhostQuant shall bear audit costs unless discrepancies exceed 5%, 
in which case Distributor shall bear costs.

================================================================================
                  ARTICLE 13: LIMITATION OF LIABILITY
================================================================================

13.1 Exclusion. NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, 
SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

13.2 Cap. EACH PARTY'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF:
    (a) Fees paid or payable in the twelve (12) months preceding the claim; or
    (b) ${tier_config['credit_limit']:,.2f}.

13.3 Exceptions. The foregoing limitations do not apply to:
    (a) Breach of confidentiality obligations;
    (b) Infringement of Intellectual Property Rights;
    (c) Gross negligence or willful misconduct;
    (d) Indemnification obligations.

================================================================================
                      ARTICLE 14: INDEMNIFICATION
================================================================================

14.1 By GhostQuant. GhostQuant shall indemnify Distributor against claims 
that Authorized Products infringe third-party Intellectual Property Rights.

14.2 By Distributor. Distributor shall indemnify GhostQuant against claims 
arising from:
    (a) Distributor's breach of this Agreement;
    (b) Distributor's negligence or misconduct;
    (c) Unauthorized modifications to Products;
    (d) Violations of applicable laws.

14.3 Procedure. The indemnified Party shall:
    (a) Provide prompt notice of claims;
    (b) Allow the indemnifying Party to control defense;
    (c) Cooperate in defense efforts.

================================================================================
                    ARTICLE 15: DISPUTE RESOLUTION
================================================================================

15.1 Negotiation. The Parties shall attempt to resolve disputes through 
good-faith negotiation for thirty (30) days.

15.2 Mediation. If negotiation fails, disputes shall be submitted to 
mediation under ICC rules.

15.3 Arbitration. If mediation fails, disputes shall be resolved by binding 
arbitration in {region_config['arbitration_venue']} under ICC rules.

15.4 Governing Law. This Agreement shall be governed by the laws of 
{region_config['governing_law']}.

================================================================================
                      ARTICLE 16: GENERAL PROVISIONS
================================================================================

16.1 Entire Agreement. This Agreement constitutes the entire agreement 
between the Parties and supersedes all prior agreements.

16.2 Amendment. This Agreement may only be amended in writing signed by 
both Parties.

16.3 Waiver. Failure to enforce any provision shall not constitute waiver.

16.4 Severability. If any provision is unenforceable, remaining provisions 
shall continue in effect.

16.5 Assignment. Distributor may not assign this Agreement without 
GhostQuant's prior written consent.

16.6 Force Majeure. Neither Party shall be liable for delays caused by 
events beyond reasonable control.

16.7 Notices. All notices shall be in writing and delivered to the 
addresses set forth above.

16.8 Counterparts. This Agreement may be executed in counterparts.

================================================================================
                            SIGNATURES
================================================================================

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the 
Effective Date.

GHOSTQUANT TECHNOLOGIES, INC.          {distributor_name.upper()}


_________________________________       _________________________________
Signature                               Signature

_________________________________       _________________________________
Name:                                   Name:
Title:                                  Title:
Date:                                   Date:

================================================================================
                              EXHIBITS
================================================================================

Exhibit A: Authorized Products
Exhibit B: Territory Definition
Exhibit C: Tier Benefits and Obligations
Exhibit D: Certification Requirements
Exhibit E: Market Development Fund Guidelines
Exhibit F: Pricing Schedule
Exhibit G: Service Level Agreement
Exhibit H: Data Processing Addendum

================================================================================
                        END OF AGREEMENT
================================================================================
"""
        return template
    
    def get_regional_distribution_template(
        self,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode
    ) -> str:
        """Generate regional distribution agreement template"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        region_config = self.REGION_CONFIGURATIONS[region]
        
        template = f"""
================================================================================
              REGIONAL DISTRIBUTION AGREEMENT
              Global Distributor Edition v{self.VERSION}
================================================================================

AGREEMENT NUMBER: GQ-RDA-{datetime.utcnow().strftime('%Y%m%d')}-{region.value.upper()[:3]}

This Regional Distribution Agreement ("Agreement") supplements the Master 
Distribution Agreement between GhostQuant Technologies, Inc. and 
{distributor_name} for the {region_config['name']} region.

REGION-SPECIFIC TERMS:

1. TERRITORY
   Primary Markets: {', '.join(region_config['countries'])}
   Currency: {region_config['primary_currency'].value}
   Language: {region_config['language']}

2. COMPLIANCE REQUIREMENTS
   Required Certifications: {', '.join(region_config['compliance_frameworks'])}
   Tax Obligations: {', '.join(region_config['tax_considerations'])}

3. LEGAL FRAMEWORK
   Governing Law: {region_config['governing_law']}
   Arbitration Venue: {region_config['arbitration_venue']}

4. REGIONAL COMMITMENTS
   Minimum Annual Revenue: ${tier_config['min_commitment']:,.2f}
   Credit Limit: ${tier_config['credit_limit']:,.2f}
   Payment Terms: {tier_config['payment_terms'].value.replace('_', ' ').title()}

5. REGIONAL SUPPORT
   Support Level: {tier_config['support_level']}
   NFR Licenses: {tier_config['nfr_licenses']}
   Training Hours: {tier_config['training_hours']}

6. REGIONAL MDF ALLOCATION
   MDF Percentage: {tier_config['mdf_percentage']*100:.0f}% of regional revenue
   Eligible Activities: Trade shows, digital marketing, customer events

This Regional Addendum is incorporated into and made part of the Master 
Distribution Agreement.

================================================================================
"""
        return template
    
    def get_exclusive_distribution_template(
        self,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode,
        exclusivity_term_months: int = 24
    ) -> str:
        """Generate exclusive distribution agreement template"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        region_config = self.REGION_CONFIGURATIONS[region]
        
        template = f"""
================================================================================
              EXCLUSIVE DISTRIBUTION AGREEMENT
              Global Distributor Edition v{self.VERSION}
================================================================================

AGREEMENT NUMBER: GQ-EDA-{datetime.utcnow().strftime('%Y%m%d')}-{region.value.upper()[:3]}

EXCLUSIVE DISTRIBUTION RIGHTS

GhostQuant Technologies, Inc. hereby grants {distributor_name} EXCLUSIVE 
distribution rights for the {region_config['name']} region for a period of 
{exclusivity_term_months} months, subject to the following conditions:

1. EXCLUSIVITY CONDITIONS
   
   1.1 Performance Requirements
       - Minimum Annual Revenue: ${tier_config['min_commitment'] * 2:,.2f}
       - Minimum Quarterly Growth: 10% quarter-over-quarter
       - Market Coverage: 80% of addressable market
       - Customer Satisfaction: 4.5 or higher (out of 5.0)
   
   1.2 Investment Requirements
       - Dedicated Sales Team: Minimum 10 FTEs
       - Technical Staff: Minimum 5 certified engineers
       - Marketing Investment: 5% of revenue
       - Demo Environment: Full production capability
   
   1.3 Reporting Requirements
       - Weekly pipeline reports
       - Monthly revenue reports
       - Quarterly business reviews
       - Annual strategic planning sessions

2. EXCLUSIVITY BENEFITS
   
   2.1 Pricing
       - Enhanced Discount: {tier_config['max_discount']*100 + 10:.0f}% off List Price
       - Volume Bonuses: Additional 5% for exceeding targets
       - Deal Protection: 100% margin protection on registered deals
   
   2.2 Support
       - Dedicated Partner Manager
       - Priority Technical Support (4-hour SLA)
       - Executive Sponsorship
       - Quarterly Business Reviews with C-level
   
   2.3 Marketing
       - Enhanced MDF: {tier_config['mdf_percentage']*100 + 5:.0f}% of revenue
       - Co-branded Marketing Materials
       - Joint Press Releases
       - Featured Partner Status

3. EXCLUSIVITY TERMINATION
   
   Exclusivity may be terminated if Distributor:
   - Fails to meet minimum commitments for two consecutive quarters
   - Loses required certifications
   - Experiences material change of control
   - Breaches material terms of this Agreement

4. TERRITORY PROTECTION
   
   During the exclusivity period, GhostQuant shall not:
   - Appoint additional distributors in the Territory
   - Sell directly to end-users (except for named accounts)
   - Grant OEM rights to competitors

This Exclusive Distribution Agreement is incorporated into the Master 
Distribution Agreement.

================================================================================
"""
        return template
    
    def get_oem_distribution_template(
        self,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode
    ) -> str:
        """Generate OEM distribution agreement template"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        region_config = self.REGION_CONFIGURATIONS[region]
        
        template = f"""
================================================================================
                  OEM DISTRIBUTION AGREEMENT
              Global Distributor Edition v{self.VERSION}
================================================================================

AGREEMENT NUMBER: GQ-OEM-{datetime.utcnow().strftime('%Y%m%d')}-{region.value.upper()[:3]}

OEM PARTNERSHIP TERMS

This OEM Distribution Agreement grants {distributor_name} the right to 
embed, integrate, and redistribute GhostQuant technology within their 
own products and solutions.

1. OEM LICENSE GRANT
   
   1.1 Embedding Rights
       - Right to embed GhostQuant APIs and SDKs
       - Right to white-label user interfaces
       - Right to integrate with proprietary systems
       - Right to create derivative solutions
   
   1.2 Branding Options
       - Powered by GhostQuant (required attribution)
       - Co-branded solutions
       - White-label (with premium licensing)
   
   1.3 Technical Access
       - API documentation and SDKs
       - Integration support
       - Custom development assistance
       - Dedicated engineering liaison

2. OEM PRICING
   
   2.1 Royalty Model
       - Base Royalty: 15% of end-user license fees
       - Volume Discount: Tiered reduction based on volume
       - Minimum Annual Commitment: ${tier_config['min_commitment'] * 3:,.2f}
   
   2.2 Development Fees
       - Integration Support: Included
       - Custom Development: Time and materials
       - Certification: $10,000 per product

3. OEM OBLIGATIONS
   
   3.1 Technical Requirements
       - Maintain API compatibility
       - Implement security best practices
       - Provide end-user support
       - Report usage metrics
   
   3.2 Quality Standards
       - Product certification required
       - Annual security audits
       - Customer satisfaction monitoring
       - Incident response procedures

4. INTELLECTUAL PROPERTY
   
   4.1 GhostQuant IP
       - All GhostQuant technology remains GhostQuant property
       - No reverse engineering permitted
       - Source code access requires separate agreement
   
   4.2 Derivative Works
       - Joint ownership of integration layer
       - Distributor owns proprietary enhancements
       - Cross-licensing for improvements

This OEM Distribution Agreement is incorporated into the Master 
Distribution Agreement.

================================================================================
"""
        return template
    
    def get_government_distribution_template(
        self,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode
    ) -> str:
        """Generate government distribution agreement template"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        region_config = self.REGION_CONFIGURATIONS[region]
        
        template = f"""
================================================================================
              GOVERNMENT DISTRIBUTION AGREEMENT
              Global Distributor Edition v{self.VERSION}
================================================================================

AGREEMENT NUMBER: GQ-GOV-{datetime.utcnow().strftime('%Y%m%d')}-{region.value.upper()[:3]}

GOVERNMENT SECTOR DISTRIBUTION TERMS

This Government Distribution Agreement authorizes {distributor_name} to 
distribute GhostQuant products to government agencies and public sector 
entities within the {region_config['name']} region.

1. GOVERNMENT AUTHORIZATION
   
   1.1 Authorized Customers
       - Federal/National Government Agencies
       - State/Provincial Government Agencies
       - Local Government Entities
       - Public Sector Organizations
       - Government Contractors (with flow-down)
   
   1.2 Contract Vehicles
       - GSA Schedule (if applicable)
       - SEWP V
       - State/Local Cooperative Contracts
       - Direct Government Contracts

2. COMPLIANCE REQUIREMENTS
   
   2.1 Security Certifications
       - FedRAMP Authorization (if applicable)
       - SOC 2 Type II
       - ISO 27001
       - Regional equivalents: {', '.join(region_config['compliance_frameworks'])}
   
   2.2 Data Handling
       - Data sovereignty requirements
       - Encryption standards (AES-256, TLS 1.3)
       - Access controls and audit logging
       - Incident response procedures
   
   2.3 Personnel Requirements
       - Background checks for support staff
       - Citizenship requirements (if applicable)
       - Security clearances (if required)

3. GOVERNMENT PRICING
   
   3.1 Pricing Structure
       - Government Discount: {tier_config['max_discount']*100 + 15:.0f}% off List Price
       - Volume Pricing: Per GSA/equivalent schedule
       - Multi-year Discounts: Additional 5% per year
   
   3.2 Payment Terms
       - Net 30 (standard government terms)
       - Progress payments for large implementations
       - Milestone-based for services

4. GOVERNMENT-SPECIFIC TERMS
   
   4.1 Termination for Convenience
       - Government may terminate for convenience
       - Compensation for work performed
       - Transition assistance required
   
   4.2 Disputes
       - Contract Disputes Act (if applicable)
       - Administrative remedies
       - Regional dispute procedures
   
   4.3 Compliance
       - FAR/DFAR clauses (if applicable)
       - Anti-corruption compliance
       - Export control compliance

This Government Distribution Agreement is incorporated into the Master 
Distribution Agreement.

================================================================================
"""
        return template
    
    def get_exhibit_a_products(self, tier: DistributorTier) -> str:
        """Generate Exhibit A: Authorized Products"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        
        products_text = """
================================================================================
                    EXHIBIT A: AUTHORIZED PRODUCTS
================================================================================

The following products are authorized for distribution under this Agreement:

PLATFORM PRODUCTS
-----------------
"""
        for key, product in self.PRODUCT_CATALOG.items():
            discount = tier_config['max_discount'] * 100
            products_text += f"""
{product['product_name']}
  SKU: {product['sku']}
  List Price: ${product['list_price']:,.2f}
  Distributor Price: ${product['list_price'] * (1 - tier_config['max_discount']):,.2f}
  Discount: {discount:.0f}%
  Minimum Order: {product['min_order_qty']} units
  Support Tier: {product['support_tier'].title()}
  Warranty: {product['warranty_months']} months
"""
        
        products_text += """
================================================================================
                        END OF EXHIBIT A
================================================================================
"""
        return products_text
    
    def get_exhibit_b_territory(self, region: RegionCode) -> str:
        """Generate Exhibit B: Territory Definition"""
        
        region_config = self.REGION_CONFIGURATIONS[region]
        
        return f"""
================================================================================
                  EXHIBIT B: TERRITORY DEFINITION
================================================================================

REGION: {region_config['name']}

PRIMARY MARKETS:
{chr(10).join(f'  - {country}' for country in region_config['countries'])}

CURRENCY: {region_config['primary_currency'].value}

GOVERNING LAW: {region_config['governing_law']}

ARBITRATION VENUE: {region_config['arbitration_venue']}

COMPLIANCE FRAMEWORKS:
{chr(10).join(f'  - {framework}' for framework in region_config['compliance_frameworks'])}

TAX CONSIDERATIONS:
{chr(10).join(f'  - {tax}' for tax in region_config['tax_considerations'])}

PRIMARY LANGUAGE: {region_config['language']}

================================================================================
                        END OF EXHIBIT B
================================================================================
"""
    
    def get_exhibit_c_tier_benefits(self, tier: DistributorTier) -> str:
        """Generate Exhibit C: Tier Benefits and Obligations"""
        
        tier_config = self.TIER_CONFIGURATIONS[tier]
        
        return f"""
================================================================================
              EXHIBIT C: TIER BENEFITS AND OBLIGATIONS
================================================================================

TIER LEVEL: {tier.value.upper()}
TIER NAME: {tier_config['name']}

BENEFITS
--------

1. PRICING
   - Base Discount: {tier_config['max_discount']*100:.0f}% off List Price
   - Credit Limit: ${tier_config['credit_limit']:,.2f}
   - Payment Terms: {tier_config['payment_terms'].value.replace('_', ' ').title()}

2. SUPPORT
   - Support Level: {tier_config['support_level']}
   - NFR Licenses: {tier_config['nfr_licenses']}
   - Training Hours: {tier_config['training_hours']} hours annually

3. INCENTIVES
   - MDF Allocation: {tier_config['mdf_percentage']*100:.0f}% of revenue
   - Maximum Rebate: {tier_config['rebate_cap']*100:.0f}%
   - Exclusive Eligibility: {'Yes' if tier_config['exclusive_eligible'] else 'No'}

OBLIGATIONS
-----------

1. COMMITMENTS
   - Minimum Annual Revenue: ${tier_config['min_commitment']:,.2f}
   - Certification Required: {'Yes' if tier_config['certification_required'] else 'No'}

2. REPORTING
   - Monthly sales reports
   - Quarterly business reviews
   - Annual forecasts

3. COMPLIANCE
   - Maintain required certifications
   - Adhere to Partner Code of Conduct
   - Cooperate with audits

================================================================================
                        END OF EXHIBIT C
================================================================================
"""
    
    def get_all_exhibits(
        self,
        tier: DistributorTier,
        region: RegionCode
    ) -> Dict[str, str]:
        """Get all exhibits for a contract"""
        
        return {
            'exhibit_a': self.get_exhibit_a_products(tier),
            'exhibit_b': self.get_exhibit_b_territory(region),
            'exhibit_c': self.get_exhibit_c_tier_benefits(tier)
        }
    
    def get_template_by_type(
        self,
        contract_type: ContractType,
        distributor_name: str,
        tier: DistributorTier,
        region: RegionCode
    ) -> str:
        """Get contract template by type"""
        
        template_map = {
            ContractType.MASTER_DISTRIBUTION: self.get_master_distribution_template,
            ContractType.REGIONAL_DISTRIBUTION: self.get_regional_distribution_template,
            ContractType.EXCLUSIVE_DISTRIBUTION: self.get_exclusive_distribution_template,
            ContractType.NON_EXCLUSIVE_DISTRIBUTION: self.get_master_distribution_template,
            ContractType.VALUE_ADDED_DISTRIBUTION: self.get_master_distribution_template,
            ContractType.OEM_DISTRIBUTION: self.get_oem_distribution_template,
            ContractType.WHITE_LABEL: self.get_oem_distribution_template,
            ContractType.GOVERNMENT_DISTRIBUTION: self.get_government_distribution_template
        }
        
        template_func = template_map.get(contract_type, self.get_master_distribution_template)
        return template_func(distributor_name, tier, region)
    
    def health(self) -> Dict[str, Any]:
        """Health check"""
        return {
            'status': 'healthy',
            'version': self.VERSION,
            'templates_available': len(ContractType),
            'tiers_configured': len(self.TIER_CONFIGURATIONS),
            'regions_configured': len(self.REGION_CONFIGURATIONS),
            'products_cataloged': len(self.PRODUCT_CATALOG)
        }
