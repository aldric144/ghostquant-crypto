"use client";

/**
 * GhostQuant Contract Negotiation Component
 * Global Distributor Edition (GDE) v3.0
 *
 * Negotiation workflow UI for managing contract negotiations
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  NegotiationWorkflow,
  NegotiationStatus,
  NegotiationTerm,
  NegotiationSession,
  CounterProposalRequest,
  ApprovalRequest,
  ProposedChange,
} from "./ContractSchema";
import { contractClient, formatDateTime } from "./ContractClient";

interface ContractNegotiationProps {
  contractId: string;
  onClose?: () => void;
  onNegotiationComplete?: () => void;
}

const STATUS_LABELS: Record<NegotiationStatus, string> = {
  [NegotiationStatus.NOT_STARTED]: "Not Started",
  [NegotiationStatus.INITIAL_PROPOSAL]: "Initial Proposal",
  [NegotiationStatus.COUNTER_PROPOSAL]: "Counter Proposal",
  [NegotiationStatus.UNDER_REVIEW]: "Under Review",
  [NegotiationStatus.ACCEPTED]: "Accepted",
  [NegotiationStatus.REJECTED]: "Rejected",
  [NegotiationStatus.WITHDRAWN]: "Withdrawn",
  [NegotiationStatus.FINAL_TERMS]: "Final Terms",
};

const STATUS_COLORS: Record<NegotiationStatus, string> = {
  [NegotiationStatus.NOT_STARTED]: "bg-gray-100 text-gray-800",
  [NegotiationStatus.INITIAL_PROPOSAL]: "bg-blue-100 text-blue-800",
  [NegotiationStatus.COUNTER_PROPOSAL]: "bg-yellow-100 text-yellow-800",
  [NegotiationStatus.UNDER_REVIEW]: "bg-purple-100 text-purple-800",
  [NegotiationStatus.ACCEPTED]: "bg-green-100 text-green-800",
  [NegotiationStatus.REJECTED]: "bg-red-100 text-red-800",
  [NegotiationStatus.WITHDRAWN]: "bg-gray-100 text-gray-800",
  [NegotiationStatus.FINAL_TERMS]: "bg-emerald-100 text-emerald-800",
};

export default function ContractNegotiation({
  contractId,
  onClose,
  onNegotiationComplete,
}: ContractNegotiationProps) {
  const [workflow, setWorkflow] = useState<NegotiationWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"terms" | "sessions" | "approvals">(
    "terms"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCounterProposalForm, setShowCounterProposalForm] = useState(false);
  const [proposedChanges, setProposedChanges] = useState<ProposedChange[]>([]);
  const [justification, setJustification] = useState("");

  const loadWorkflow = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await contractClient.getNegotiationWorkflow(contractId);
      if (response.success && response.workflow) {
        setWorkflow(response.workflow);
      } else {
        setError("No negotiation workflow found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  const startNegotiation = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await contractClient.startNegotiation(contractId, {
        max_rounds: 5,
        deadline_days: 30,
      });

      if (response.success && response.workflow) {
        setWorkflow(response.workflow);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start negotiation");
    } finally {
      setIsSubmitting(false);
    }
  }, [contractId]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  const handleSubmitCounterProposal = useCallback(async () => {
    if (!workflow || proposedChanges.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CounterProposalRequest = {
        proposed_changes: proposedChanges,
        submitter: { name: "Current User", role: "Contract Manager" },
        justification,
      };

      const response = await contractClient.submitCounterProposal(
        workflow.workflow_id,
        request
      );

      if (response.success && response.workflow) {
        setWorkflow(response.workflow);
        setShowCounterProposalForm(false);
        setProposedChanges([]);
        setJustification("");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit counter-proposal"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [workflow, proposedChanges, justification]);

  const handleApproval = useCallback(
    async (approved: boolean, comments: string = "") => {
      if (!workflow) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const request: ApprovalRequest = {
          approver_role: "Contract Manager",
          approver: { name: "Current User", email: "user@example.com" },
          approved,
          comments,
        };

        const response = await contractClient.processNegotiationApproval(
          workflow.workflow_id,
          request
        );

        if (response.success && response.workflow) {
          setWorkflow(response.workflow);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process approval"
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [workflow]
  );

  const handleFinalize = useCallback(async () => {
    if (!workflow) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await contractClient.finalizeNegotiation(
        workflow.workflow_id,
        { name: "Current User", role: "Contract Manager" }
      );

      if (response.success && response.workflow) {
        setWorkflow(response.workflow);
        onNegotiationComplete?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finalize");
    } finally {
      setIsSubmitting(false);
    }
  }, [workflow, onNegotiationComplete]);

  const handleAddProposedChange = useCallback(
    (term: NegotiationTerm) => {
      if (proposedChanges.find((c) => c.term_id === term.term_id)) return;

      setProposedChanges((prev) => [
        ...prev,
        {
          term_id: term.term_id,
          proposed_value: term.proposed_value ?? term.original_value,
          justification: "",
        },
      ]);
    },
    [proposedChanges]
  );

  const handleUpdateProposedChange = useCallback(
    (termId: string, value: unknown, changeJustification: string) => {
      setProposedChanges((prev) =>
        prev.map((c) =>
          c.term_id === termId
            ? { ...c, proposed_value: value, justification: changeJustification }
            : c
        )
      );
    },
    []
  );

  const handleRemoveProposedChange = useCallback((termId: string) => {
    setProposedChanges((prev) => prev.filter((c) => c.term_id !== termId));
  }, []);

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

  if (!workflow) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No Active Negotiation
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start a negotiation workflow to begin discussing contract terms.
          </p>
          <div className="mt-6">
            <button
              onClick={startNegotiation}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Starting..." : "Start Negotiation"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
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

  const renderTermsTab = () => (
    <div className="space-y-4">
      {workflow.negotiable_terms.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No negotiable terms defined</p>
        </div>
      ) : (
        <>
          {showCounterProposalForm && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">
                Submit Counter-Proposal
              </h4>
              <div className="space-y-4">
                {proposedChanges.map((change) => {
                  const term = workflow.negotiable_terms.find(
                    (t) => t.term_id === change.term_id
                  );
                  if (!term) return null;

                  return (
                    <div
                      key={change.term_id}
                      className="p-3 bg-white rounded border border-blue-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">
                          {term.term_name}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveProposedChange(change.term_id)
                          }
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Proposed Value
                          </label>
                          <input
                            type="text"
                            value={String(change.proposed_value ?? "")}
                            onChange={(e) =>
                              handleUpdateProposedChange(
                                change.term_id,
                                e.target.value,
                                change.justification || ""
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Justification
                          </label>
                          <input
                            type="text"
                            value={change.justification || ""}
                            onChange={(e) =>
                              handleUpdateProposedChange(
                                change.term_id,
                                change.proposed_value,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Justification
                  </label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Explain the reasoning for these proposed changes..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCounterProposalForm(false);
                      setProposedChanges([]);
                      setJustification("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitCounterProposal}
                    disabled={isSubmitting || proposedChanges.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Counter-Proposal"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Term
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Original
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Proposed
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Final
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workflow.negotiable_terms.map((term) => (
                  <tr key={term.term_id}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {term.term_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {term.term_category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {String(term.original_value ?? "-")}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 text-right">
                      {String(term.proposed_value ?? "-")}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-600 text-right font-medium">
                      {String(term.final_value ?? "-")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          term.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : term.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : term.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {term.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {term.is_negotiable &&
                        !proposedChanges.find(
                          (c) => c.term_id === term.term_id
                        ) && (
                          <button
                            onClick={() => {
                              handleAddProposedChange(term);
                              setShowCounterProposalForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Propose Change
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  const renderSessionsTab = () => (
    <div className="space-y-4">
      {workflow.sessions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No negotiation sessions recorded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflow.sessions.map((session: NegotiationSession) => (
            <div
              key={session.session_id}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Session {session.session_id.slice(-8)}
                </h4>
                <span className="text-sm text-gray-500">
                  {formatDateTime(session.session_date)}
                </span>
              </div>

              {session.participants.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-gray-500 mb-1">
                    Participants
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {session.participants.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {p.name || "Unknown"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {session.agenda_items.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-xs font-medium text-gray-500 mb-1">
                    Agenda
                  </h5>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {session.agenda_items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {session.session_notes && (
                <div>
                  <h5 className="text-xs font-medium text-gray-500 mb-1">
                    Notes
                  </h5>
                  <p className="text-sm text-gray-700">{session.session_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderApprovalsTab = () => (
    <div className="space-y-4">
      {workflow.approval_chain.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No approvals required</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workflow.approval_chain.map((approval, i) => (
            <div
              key={i}
              className={`p-4 border rounded-lg ${
                approval.status === "approved"
                  ? "border-green-200 bg-green-50"
                  : approval.status === "rejected"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{approval.role}</h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    approval.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : approval.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {approval.status}
                </span>
              </div>

              {approval.reasons.length > 0 && (
                <div className="mb-2">
                  <h5 className="text-xs font-medium text-gray-500 mb-1">
                    Reasons for Approval
                  </h5>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {approval.reasons.map((reason, j) => (
                      <li key={j}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {approval.approved_by && (
                <div className="text-sm text-gray-500">
                  Approved by: {approval.approved_by.name || "Unknown"}
                  {approval.approved_at && (
                    <span> on {formatDateTime(approval.approved_at)}</span>
                  )}
                </div>
              )}

              {approval.comments && (
                <p className="mt-2 text-sm text-gray-700 italic">
                  &quot;{approval.comments}&quot;
                </p>
              )}

              {approval.status === "pending" && approval.required && (
                <div className="mt-3 flex space-x-3">
                  <button
                    onClick={() => handleApproval(true)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(false)}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Contract Negotiation
            </h2>
            <p className="text-sm text-gray-500">
              Workflow ID: {workflow.workflow_id.slice(-12)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                STATUS_COLORS[workflow.status]
              }`}
            >
              {STATUS_LABELS[workflow.status]}
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

      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <dt className="text-xs font-medium text-gray-500">Current Round</dt>
            <dd className="text-lg font-bold text-gray-900">
              {workflow.current_round} / {workflow.max_rounds}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Started</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatDateTime(workflow.started_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Last Updated</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatDateTime(workflow.last_updated)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500">Terms</dt>
            <dd className="text-lg font-bold text-gray-900">
              {workflow.negotiable_terms.length}
            </dd>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("terms")}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "terms"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Negotiable Terms
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "sessions"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sessions ({workflow.sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`py-4 px-6 border-b-2 font-medium text-sm ${
              activeTab === "approvals"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Approvals ({workflow.approval_chain.length})
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "terms" && renderTermsTab()}
        {activeTab === "sessions" && renderSessionsTab()}
        {activeTab === "approvals" && renderApprovalsTab()}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
        <div>
          {workflow.status !== NegotiationStatus.FINAL_TERMS &&
            workflow.status !== NegotiationStatus.ACCEPTED &&
            workflow.status !== NegotiationStatus.REJECTED &&
            workflow.status !== NegotiationStatus.WITHDRAWN && (
              <button
                onClick={() => setShowCounterProposalForm(true)}
                disabled={showCounterProposalForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                New Counter-Proposal
              </button>
            )}
        </div>
        <div className="flex space-x-3">
          {workflow.status === NegotiationStatus.ACCEPTED && (
            <button
              onClick={handleFinalize}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? "Finalizing..." : "Finalize Negotiation"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
