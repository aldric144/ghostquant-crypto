"use client";

/**
 * GhostQuant Contract Dashboard Component
 * Global Distributor Edition (GDE) v3.0
 *
 * Dashboard overview with statistics, charts, and quick actions
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  ContractStatus,
  DistributorTier,
  ContractSummary,
  ContractStatistics,
  CONTRACT_STATUS_LABELS,
  DISTRIBUTOR_TIER_LABELS,
} from "./ContractSchema";
import {
  contractClient,
  formatCurrency,
  formatDate,
  getDaysUntilExpiration,
  getExpirationUrgency,
  getStatusBadgeColor,
  getTierBadgeColor,
} from "./ContractClient";

interface ContractDashboardProps {
  onSelectContract?: (contractId: string) => void;
  onCreateContract?: () => void;
}

export default function ContractDashboard({
  onSelectContract,
  onCreateContract,
}: ContractDashboardProps) {
  const [statistics, setStatistics] = useState<ContractStatistics | null>(null);
  const [summaries, setSummaries] = useState<ContractSummary[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ContractSummary[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | "all">(
    "all"
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, summariesResponse, expiringResponse] =
        await Promise.all([
          contractClient.getStatistics(),
          contractClient.getContractSummaries({ limit: 10 }),
          contractClient.getExpiringContracts(90),
        ]);

      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
      }

      if (summariesResponse.success && summariesResponse.summaries) {
        setSummaries(summariesResponse.summaries);
      }

      if (expiringResponse.success && expiringResponse.expiring_contracts) {
        const expiringSummaries: ContractSummary[] =
          expiringResponse.expiring_contracts.map((c) => ({
            contract_id: c.contract_id,
            contract_number: c.contract_number,
            distributor_name: c.distributor.company_name,
            contract_type: c.terms.contract_type,
            distributor_tier: c.terms.distributor_tier,
            status: c.status,
            territories: c.terms.territories.map((t) => t.territory_name),
            total_commitment: c.terms.commitments.reduce(
              (sum, cm) => sum + cm.minimum_revenue_commitment,
              0
            ),
            currency: c.terms.currency,
            effective_date: c.terms.effective_date,
            expiration_date: c.terms.expiration_date,
            days_until_expiration: getDaysUntilExpiration(
              c.terms.expiration_date
            ),
          }));
        setExpiringContracts(expiringSummaries.slice(0, 5));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const filteredSummaries =
    statusFilter === "all"
      ? summaries
      : summaries.filter((s) => s.status === statusFilter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <button
            onClick={loadDashboardData}
            className="mt-4 text-emerald-600 hover:text-emerald-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Contract Dashboard</h2>
        {onCreateContract && (
          <button
            onClick={onCreateContract}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            New Contract
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Contracts
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics?.total_contracts || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Contracts
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {statistics?.by_status?.[ContractStatus.ACTIVE] || 0}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Distributors
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics?.total_distributors || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Commitment
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(statistics?.total_commitment_value || 0)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Contracts by Status
            </h3>
          </div>
          <div className="p-6">
            {statistics?.by_status ? (
              <div className="space-y-4">
                {Object.entries(statistics.by_status).map(([status, count]) => {
                  const total = statistics.total_contracts || 1;
                  const percentage = ((count as number) / total) * 100;
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {CONTRACT_STATUS_LABELS[status as ContractStatus] ||
                            status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count as number}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === ContractStatus.ACTIVE
                              ? "bg-emerald-500"
                              : status === ContractStatus.DRAFT
                              ? "bg-gray-400"
                              : status === ContractStatus.PENDING_REVIEW
                              ? "bg-yellow-500"
                              : status === ContractStatus.EXPIRED
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Contracts by Tier
            </h3>
          </div>
          <div className="p-6">
            {statistics?.by_tier ? (
              <div className="space-y-4">
                {Object.entries(statistics.by_tier).map(([tier, count]) => {
                  const total = statistics.total_contracts || 1;
                  const percentage = ((count as number) / total) * 100;
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {DISTRIBUTOR_TIER_LABELS[tier as DistributorTier] ||
                            tier}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count as number}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            tier === DistributorTier.GLOBAL_ELITE
                              ? "bg-emerald-500"
                              : tier === DistributorTier.STRATEGIC
                              ? "bg-amber-500"
                              : tier === DistributorTier.PREMIER
                              ? "bg-purple-500"
                              : tier === DistributorTier.PREFERRED
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {expiringContracts.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Expiring Soon
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                {expiringContracts.length} contracts
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Days Left
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expiringContracts.map((contract) => {
                  const urgency = getExpirationUrgency(
                    contract.days_until_expiration
                  );
                  return (
                    <tr
                      key={contract.contract_id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onSelectContract?.(contract.contract_id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-emerald-600">
                          {contract.contract_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {contract.distributor_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(
                            contract.distributor_tier
                          )}`}
                        >
                          {DISTRIBUTOR_TIER_LABELS[contract.distributor_tier]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-500">
                          {formatDate(contract.expiration_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            urgency === "critical"
                              ? "bg-red-100 text-red-800"
                              : urgency === "high"
                              ? "bg-orange-100 text-orange-800"
                              : urgency === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {contract.days_until_expiration} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Contracts
            </h3>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ContractStatus | "all")
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Statuses</option>
              {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filteredSummaries.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No contracts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Distributor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Commitment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Effective
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSummaries.map((summary) => (
                  <tr
                    key={summary.contract_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectContract?.(summary.contract_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-emerald-600">
                        {summary.contract_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {summary.distributor_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(
                          summary.distributor_tier
                        )}`}
                      >
                        {DISTRIBUTOR_TIER_LABELS[summary.distributor_tier]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          summary.status
                        )}`}
                      >
                        {CONTRACT_STATUS_LABELS[summary.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">
                        {formatCurrency(
                          summary.total_commitment,
                          summary.currency
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(summary.effective_date)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
