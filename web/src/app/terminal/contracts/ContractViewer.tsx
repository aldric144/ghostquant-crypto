"use client";

/**
 * GhostQuant Contract Viewer Component
 * Global Distributor Edition (GDE) v3.0
 *
 * Detailed contract view with tabs for different sections
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  DistributorContract,
  ContractStatus,
  ContractValidationResult,
  ContractAnalytics,
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  DISTRIBUTOR_TIER_LABELS,
  REGION_LABELS,
  StatusUpdateRequest,
} from "./ContractSchema";
import {
  contractClient,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  getDaysUntilExpiration,
  getExpirationUrgency,
  getStatusBadgeColor,
  getTierBadgeColor,
} from "./ContractClient";

interface ContractViewerProps {
  contractId: string;
  onClose?: () => void;
  onStatusChange?: (contract: DistributorContract) => void;
}

type TabId =
  | "overview"
  | "distributor"
  | "terms"
  | "territories"
  | "pricing"
  | "compliance"
  | "amendments"
  | "analytics";

const TABS: Array<{ id: TabId; name: string }> = [
  { id: "overview", name: "Overview" },
  { id: "distributor", name: "Distributor" },
  { id: "terms", name: "Terms" },
  { id: "territories", name: "Territories" },
  { id: "pricing", name: "Pricing" },
  { id: "compliance", name: "Compliance" },
  { id: "amendments", name: "Amendments" },
  { id: "analytics", name: "Analytics" },
];

export default function ContractViewer({
  contractId,
  onClose,
  onStatusChange,
}: ContractViewerProps) {
  const [contract, setContract] = useState<DistributorContract | null>(null);
  const [validation, setValidation] = useState<ContractValidationResult | null>(
    null
  );
  const [analytics, setAnalytics] = useState<ContractAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadContract = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contractClient.getContract(contractId);
      if (response.success && response.contract) {
        setContract(response.contract);
      } else {
        setError("Failed to load contract");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const loadValidation = useCallback(async () => {
    try {
      const response = await contractClient.validateContract(contractId);
      if (response.success) {
        setValidation(response.validation_result);
      }
    } catch (err) {
      console.error("Failed to load validation:", err);
    }
  }, [contractId]);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await contractClient.getContractAnalytics(contractId);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  }, [contractId]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  useEffect(() => {
    if (contract) {
      loadValidation();
      loadAnalytics();
    }
  }, [contract, loadValidation, loadAnalytics]);

  const handleStatusUpdate = useCallback(
    async (newStatus: ContractStatus, reason: string = "") => {
      if (!contract) return;

      setIsUpdatingStatus(true);
      try {
        const request: StatusUpdateRequest = { status: newStatus, reason };
        const response = await contractClient.updateContractStatus(
          contractId,
          request
        );

        if (response.success && response.contract) {
          setContract(response.contract);
          onStatusChange?.(response.contract);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update status");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [contract, contractId, onStatusChange]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "Contract not found"}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 text-emerald-600 hover:text-emerald-700"
            >
              Go back
            </button>
          )}
        </div>
      </div>
    );
  }

  const daysUntilExpiration = getDaysUntilExpiration(
    contract.terms.expiration_date
  );
  const urgency = getExpirationUrgency(daysUntilExpiration);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Contract Value
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(
              contract.terms.commitments.reduce(
                (sum, c) => sum + c.minimum_revenue_commitment,
                0
              ),
              contract.terms.currency
            )}
          </p>
          <p className="text-sm text-gray-500">Total commitment</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">
            Contract Term
          </h4>
          <p className="text-2xl font-bold text-gray-900">
            {contract.terms.initial_term_months} months
          </p>
          <p className="text-sm text-gray-500">
            {formatDate(contract.terms.effective_date)} -{" "}
            {formatDate(contract.terms.expiration_date)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Expiration</h4>
          <p
            className={`text-2xl font-bold ${
              urgency === "critical"
                ? "text-red-600"
                : urgency === "high"
                ? "text-orange-600"
                : "text-gray-900"
            }`}
          >
            {daysUntilExpiration > 0
              ? `${daysUntilExpiration} days`
              : "Expired"}
          </p>
          <p className="text-sm text-gray-500">
            {contract.terms.auto_renewal ? "Auto-renewal enabled" : "Manual renewal"}
          </p>
        </div>
      </div>

      {validation && (
        <div
          className={`rounded-lg p-4 ${
            validation.is_valid
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {validation.is_valid ? (
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span
              className={`font-medium ${
                validation.is_valid ? "text-green-800" : "text-red-800"
              }`}
            >
              {validation.is_valid
                ? "Contract validation passed"
                : `${validation.errors.length} validation errors found`}
            </span>
          </div>
          {!validation.is_valid && validation.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {validation.errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
              {validation.errors.length > 3 && (
                <li>...and {validation.errors.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Contract Details
          </h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Contract Number</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.contract_number}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Version</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.version}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Type</dt>
              <dd className="text-sm font-medium text-gray-900">
                {CONTRACT_TYPE_LABELS[contract.terms.contract_type]}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Governing Law</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.governing_law}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatDateTime(contract.created_at)}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            {contract.status === ContractStatus.DRAFT && (
              <button
                onClick={() =>
                  handleStatusUpdate(ContractStatus.PENDING_REVIEW)
                }
                disabled={isUpdatingStatus}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Submit for Review
              </button>
            )}
            {contract.status === ContractStatus.PENDING_REVIEW && (
              <button
                onClick={() => handleStatusUpdate(ContractStatus.APPROVED)}
                disabled={isUpdatingStatus}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Approve Contract
              </button>
            )}
            {contract.status === ContractStatus.APPROVED && (
              <button
                onClick={() => handleStatusUpdate(ContractStatus.ACTIVE)}
                disabled={isUpdatingStatus}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                Activate Contract
              </button>
            )}
            {contract.status === ContractStatus.ACTIVE && (
              <>
                <button
                  onClick={() => handleStatusUpdate(ContractStatus.SUSPENDED)}
                  disabled={isUpdatingStatus}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Suspend Contract
                </button>
                <button
                  onClick={() => handleStatusUpdate(ContractStatus.TERMINATED)}
                  disabled={isUpdatingStatus}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Terminate Contract
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDistributorTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Company Information
          </h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Company Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.company_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Legal Name</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.legal_name}
              </dd>
            </div>
            {contract.distributor.dba_name && (
              <div>
                <dt className="text-sm text-gray-500">DBA Name</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {contract.distributor.dba_name}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-gray-500">Registration Number</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.registration_number}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Tax ID</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.tax_id}
              </dd>
            </div>
            {contract.distributor.duns_number && (
              <div>
                <dt className="text-sm text-gray-500">DUNS Number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {contract.distributor.duns_number}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Business Profile
          </h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Year Established</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.year_established}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Employee Count</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.employee_count.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Annual Revenue</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(contract.distributor.annual_revenue)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Credit Rating</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.distributor.credit_rating || "Not rated"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Primary Region</dt>
              <dd className="text-sm font-medium text-gray-900">
                {REGION_LABELS[contract.distributor.primary_region]}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Headquarters Address
        </h4>
        <address className="text-sm text-gray-700 not-italic">
          {contract.distributor.headquarters_address.street}
          <br />
          {contract.distributor.headquarters_address.city},{" "}
          {contract.distributor.headquarters_address.state}{" "}
          {contract.distributor.headquarters_address.postal_code}
          <br />
          {contract.distributor.headquarters_address.country}
        </address>
      </div>

      {contract.distributor.industry_certifications.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Industry Certifications
          </h4>
          <div className="flex flex-wrap gap-2">
            {contract.distributor.industry_certifications.map((cert, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {contract.distributor.key_contacts.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Key Contacts
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {contract.distributor.key_contacts.map((contact, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.title}</p>
                <p className="text-sm text-gray-700 mt-2">{contact.email}</p>
                <p className="text-sm text-gray-700">{contact.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTermsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Contract Terms
          </h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Initial Term</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.initial_term_months} months
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Renewal Term</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.renewal_term_months} months
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Auto Renewal</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.auto_renewal ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Notice Period</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.notice_period_days} days
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Payment Terms</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.payment_terms}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Credit Limit</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(
                  contract.terms.credit_limit,
                  contract.terms.currency
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Legal Terms
          </h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Governing Law</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.governing_law}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Dispute Resolution</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.dispute_resolution}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Arbitration Venue</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.arbitration_venue}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Confidentiality Term</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.confidentiality_term_years} years
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Non-Compete Term</dt>
              <dd className="text-sm font-medium text-gray-900">
                {contract.terms.non_compete_term_months} months
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Liability Cap</dt>
              <dd className="text-sm font-medium text-gray-900">
                {formatCurrency(
                  contract.terms.liability_cap,
                  contract.terms.currency
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {contract.terms.commitments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Commitment Schedule
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Min Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Growth Target
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Shortfall Penalty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Overachievement Bonus
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contract.terms.commitments.map((commitment, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      Year {commitment.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(
                        commitment.minimum_revenue_commitment,
                        contract.terms.currency
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatPercentage(commitment.growth_target_percentage / 100)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatPercentage(commitment.penalty_for_shortfall / 100)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatPercentage(commitment.bonus_for_overachievement / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contract.terms.special_terms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Special Terms
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {contract.terms.special_terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderTerritoriesTab = () => (
    <div className="space-y-6">
      {contract.terms.territories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No territories defined</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contract.terms.territories.map((territory, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {territory.territory_name}
                </h4>
                {territory.is_exclusive && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    Exclusive
                  </span>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <dt className="text-xs text-gray-500">Region</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {REGION_LABELS[territory.region_code]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Countries</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {territory.countries.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Population Coverage</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {territory.population_coverage.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Market Potential</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {territory.market_potential_score}/100
                  </dd>
                </div>
              </dl>
              {territory.countries.length > 0 && (
                <div className="mt-3">
                  <dt className="text-xs text-gray-500 mb-1">Countries</dt>
                  <dd className="flex flex-wrap gap-1">
                    {territory.countries.slice(0, 10).map((country, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {country}
                      </span>
                    ))}
                    {territory.countries.length > 10 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        +{territory.countries.length - 10} more
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      {contract.terms.pricing_tiers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Pricing Tiers
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Min Volume
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Max Volume
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contract.terms.pricing_tiers.map((tier, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {tier.tier_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {tier.min_volume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {tier.max_volume
                        ? tier.max_volume.toLocaleString()
                        : "Unlimited"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatPercentage(tier.discount_percentage / 100)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatCurrency(tier.unit_price, tier.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {contract.terms.rebates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Rebate Programs
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {contract.terms.rebates.map((rebate, i) => (
              <div
                key={i}
                className="p-4 border border-gray-200 rounded-lg bg-white"
              >
                <h5 className="font-medium text-gray-900 mb-2">
                  {rebate.rebate_name}
                </h5>
                <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <dt className="text-xs text-gray-500">Type</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {rebate.rebate_type}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Period</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {rebate.calculation_period}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Max Rebate</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatPercentage(rebate.maximum_rebate_percentage / 100)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Payment</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {rebate.payment_timing}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {contract.terms.mdf && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Market Development Fund
          </h4>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <dt className="text-xs text-gray-500">Total Allocation</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatCurrency(
                    contract.terms.mdf.total_allocation,
                    contract.terms.mdf.currency
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Fiscal Year</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {contract.terms.mdf.fiscal_year}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Reimbursement Rate</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatPercentage(contract.terms.mdf.reimbursement_rate / 100)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Claim Deadline</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {contract.terms.mdf.claim_deadline_days} days
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {contract.terms.compliance_requirements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No compliance requirements defined</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contract.terms.compliance_requirements.map((req, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {req.requirement_name}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.compliance_level === "STANDARD"
                      ? "bg-gray-100 text-gray-800"
                      : req.compliance_level === "ENHANCED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {req.compliance_level}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <dt className="text-xs text-gray-500">Framework</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {req.regulatory_framework}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Certification</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {req.certification_required
                      ? req.certification_name || "Required"
                      : "Not required"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Audit Frequency</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {req.audit_frequency}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Remediation</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {req.remediation_timeline_days} days
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAmendmentsTab = () => (
    <div className="space-y-6">
      {contract.amendments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No amendments recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contract.amendments.map((amendment, i) => (
            <div
              key={i}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Amendment #{amendment.amendment_number}
                </h4>
                <span className="text-sm text-gray-500">
                  {formatDate(amendment.amendment_date)}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                {amendment.reason_for_amendment}
              </p>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-gray-500">Type</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {amendment.amendment_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Effective Date</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatDate(amendment.effective_date)}
                  </dd>
                </div>
              </dl>
              {amendment.sections_modified.length > 0 && (
                <div className="mt-3">
                  <dt className="text-xs text-gray-500 mb-1">
                    Sections Modified
                  </dt>
                  <dd className="flex flex-wrap gap-1">
                    {amendment.sections_modified.map((section, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {section}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {!analytics ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Contract Value
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Total Commitment</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      analytics.contract_value.total_commitment,
                      analytics.contract_value.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Annual Commitment</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      analytics.contract_value.annual_commitment,
                      analytics.contract_value.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Potential Rebates</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      analytics.contract_value.potential_rebates,
                      analytics.contract_value.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">MDF Allocation</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {formatCurrency(
                      analytics.contract_value.mdf_allocation,
                      analytics.contract_value.currency
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-sm font-medium text-gray-700">
                    Net Contract Value
                  </dt>
                  <dd className="text-sm font-bold text-gray-900">
                    {formatCurrency(
                      analytics.contract_value.net_contract_value,
                      analytics.contract_value.currency
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                Risk Assessment
              </h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Overall Risk</dt>
                  <dd
                    className={`text-sm font-medium ${
                      analytics.risk_assessment.overall_risk === "low"
                        ? "text-green-600"
                        : analytics.risk_assessment.overall_risk === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {analytics.risk_assessment.overall_risk.toUpperCase()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Credit Risk</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {analytics.risk_assessment.credit_risk}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Compliance Risk</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {analytics.risk_assessment.compliance_risk}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Territory Risk</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {analytics.risk_assessment.territory_risk}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              Territory Analysis
            </h4>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <dt className="text-xs text-gray-500">Total Countries</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {analytics.territory_analysis.total_countries}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Population</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {(
                    analytics.territory_analysis.total_population / 1000000
                  ).toFixed(1)}
                  M
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">GDP Coverage</dt>
                <dd className="text-lg font-bold text-gray-900">
                  $
                  {(analytics.territory_analysis.total_gdp / 1000000000).toFixed(
                    1
                  )}
                  B
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Exclusive Territories</dt>
                <dd className="text-lg font-bold text-gray-900">
                  {analytics.territory_analysis.exclusive_territories}
                </dd>
              </div>
            </dl>
          </div>

          {analytics.recommendations.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {analytics.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-blue-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {contract.contract_number}
            </h2>
            <p className="text-sm text-gray-500">
              {contract.distributor.company_name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(contract.status)}`}>
              {CONTRACT_STATUS_LABELS[contract.status]}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTierBadgeColor(contract.terms.distributor_tier)}`}>
              {DISTRIBUTOR_TIER_LABELS[contract.terms.distributor_tier]}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "distributor" && renderDistributorTab()}
        {activeTab === "terms" && renderTermsTab()}
        {activeTab === "territories" && renderTerritoriesTab()}
        {activeTab === "pricing" && renderPricingTab()}
        {activeTab === "compliance" && renderComplianceTab()}
        {activeTab === "amendments" && renderAmendmentsTab()}
        {activeTab === "analytics" && renderAnalyticsTab()}
      </div>
    </div>
  );
}
