"use client";

/**
 * GhostQuant Contract Builder Component
 * Global Distributor Edition (GDE) v3.0
 *
 * Multi-step form for creating new distributor contracts
 */

import React, { useState, useCallback } from "react";
import {
  ContractType,
  DistributorTier,
  RegionCode,
  CurrencyCode,
  CONTRACT_TYPE_LABELS,
  DISTRIBUTOR_TIER_LABELS,
  REGION_LABELS,
  ContractGenerateRequest,
  TerritoryRequest,
  DistributorContract,
} from "./ContractSchema";
import { contractClient, formatCurrency } from "./ContractClient";

interface ContractBuilderProps {
  onContractCreated?: (contract: DistributorContract) => void;
  onCancel?: () => void;
}

interface DistributorFormData {
  company_name: string;
  legal_name: string;
  registration_number: string;
  tax_id: string;
  year_established: number;
  employee_count: number;
  annual_revenue: number;
  industry_certifications: string[];
  headquarters_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  key_contacts: Array<{
    name: string;
    title: string;
    email: string;
    phone: string;
    role: string;
  }>;
}

interface ContractFormData {
  contract_type: ContractType;
  tier: DistributorTier;
  region: RegionCode;
  currency: CurrencyCode;
  term_months: number;
  territories: TerritoryRequest[];
}

const STEPS = [
  { id: 1, name: "Distributor Info", description: "Company details" },
  { id: 2, name: "Contract Type", description: "Agreement type and tier" },
  { id: 3, name: "Territories", description: "Geographic coverage" },
  { id: 4, name: "Review", description: "Confirm and create" },
];

const CERTIFICATIONS = [
  "ISO 9001",
  "ISO 27001",
  "ISO 22301",
  "SOC 2",
  "ISO 20000",
  "CMMI",
  "PCI DSS",
];

export default function ContractBuilder({
  onContractCreated,
  onCancel,
}: ContractBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [distributorData, setDistributorData] = useState<DistributorFormData>({
    company_name: "",
    legal_name: "",
    registration_number: "",
    tax_id: "",
    year_established: new Date().getFullYear() - 5,
    employee_count: 50,
    annual_revenue: 1000000,
    industry_certifications: [],
    headquarters_address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    },
    key_contacts: [
      { name: "", title: "", email: "", phone: "", role: "primary" },
    ],
  });

  const [contractData, setContractData] = useState<ContractFormData>({
    contract_type: ContractType.MASTER_DISTRIBUTION,
    tier: DistributorTier.AUTHORIZED,
    region: RegionCode.AMERICAS,
    currency: CurrencyCode.USD,
    term_months: 36,
    territories: [],
  });

  const handleDistributorChange = useCallback(
    (field: keyof DistributorFormData, value: unknown) => {
      setDistributorData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleAddressChange = useCallback(
    (field: keyof DistributorFormData["headquarters_address"], value: string) => {
      setDistributorData((prev) => ({
        ...prev,
        headquarters_address: { ...prev.headquarters_address, [field]: value },
      }));
    },
    []
  );

  const handleContractChange = useCallback(
    (field: keyof ContractFormData, value: unknown) => {
      setContractData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCertificationToggle = useCallback((cert: string) => {
    setDistributorData((prev) => {
      const certs = prev.industry_certifications.includes(cert)
        ? prev.industry_certifications.filter((c) => c !== cert)
        : [...prev.industry_certifications, cert];
      return { ...prev, industry_certifications: certs };
    });
  }, []);

  const handleAddTerritory = useCallback(() => {
    setContractData((prev) => ({
      ...prev,
      territories: [
        ...prev.territories,
        {
          name: `Territory ${prev.territories.length + 1}`,
          region: prev.region,
          countries: [],
          is_exclusive: false,
        },
      ],
    }));
  }, []);

  const handleRemoveTerritory = useCallback((index: number) => {
    setContractData((prev) => ({
      ...prev,
      territories: prev.territories.filter((_, i) => i !== index),
    }));
  }, []);

  const handleTerritoryChange = useCallback(
    (index: number, field: keyof TerritoryRequest, value: unknown) => {
      setContractData((prev) => ({
        ...prev,
        territories: prev.territories.map((t, i) =>
          i === index ? { ...t, [field]: value } : t
        ),
      }));
    },
    []
  );

  const handleContactChange = useCallback(
    (
      index: number,
      field: keyof DistributorFormData["key_contacts"][0],
      value: string
    ) => {
      setDistributorData((prev) => ({
        ...prev,
        key_contacts: prev.key_contacts.map((c, i) =>
          i === index ? { ...c, [field]: value } : c
        ),
      }));
    },
    []
  );

  const handleAddContact = useCallback(() => {
    setDistributorData((prev) => ({
      ...prev,
      key_contacts: [
        ...prev.key_contacts,
        { name: "", title: "", email: "", phone: "", role: "secondary" },
      ],
    }));
  }, []);

  const handleRemoveContact = useCallback((index: number) => {
    setDistributorData((prev) => ({
      ...prev,
      key_contacts: prev.key_contacts.filter((_, i) => i !== index),
    }));
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return (
            distributorData.company_name.length >= 2 &&
            distributorData.legal_name.length >= 2 &&
            distributorData.registration_number.length > 0
          );
        case 2:
          return true;
        case 3:
          return true;
        case 4:
          return true;
        default:
          return false;
      }
    },
    [distributorData]
  );

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      setError(null);
    } else {
      setError("Please fill in all required fields");
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const request: ContractGenerateRequest = {
        distributor_data: distributorData,
        contract_type: contractData.contract_type,
        tier: contractData.tier,
        region: contractData.region,
        currency: contractData.currency,
        term_months: contractData.term_months,
        territories:
          contractData.territories.length > 0
            ? contractData.territories
            : undefined,
      };

      const response = await contractClient.generateContract(request);

      if (response.success && response.contract) {
        onContractCreated?.(response.contract);
      } else {
        setError("Failed to create contract");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }, [distributorData, contractData, onContractCreated]);

  const renderStepIndicator = () => (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center">
        {STEPS.map((step, index) => (
          <li
            key={step.id}
            className={`relative ${index !== STEPS.length - 1 ? "flex-1" : ""}`}
          >
            <div className="flex items-center">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                  step.id < currentStep
                    ? "bg-emerald-600"
                    : step.id === currentStep
                    ? "border-2 border-emerald-600 bg-white"
                    : "border-2 border-gray-300 bg-white"
                }`}
              >
                {step.id < currentStep ? (
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span
                    className={
                      step.id === currentStep
                        ? "text-emerald-600"
                        : "text-gray-500"
                    }
                  >
                    {step.id}
                  </span>
                )}
              </div>
              {index !== STEPS.length - 1 && (
                <div
                  className={`ml-4 h-0.5 w-full ${
                    step.id < currentStep ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-900">
                {step.name}
              </span>
              <p className="text-xs text-gray-500">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );

  const renderDistributorStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name *
          </label>
          <input
            type="text"
            value={distributorData.company_name}
            onChange={(e) =>
              handleDistributorChange("company_name", e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Acme Distribution Inc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Legal Name *
          </label>
          <input
            type="text"
            value={distributorData.legal_name}
            onChange={(e) =>
              handleDistributorChange("legal_name", e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Acme Distribution Incorporated"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Registration Number *
          </label>
          <input
            type="text"
            value={distributorData.registration_number}
            onChange={(e) =>
              handleDistributorChange("registration_number", e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="12-3456789"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tax ID
          </label>
          <input
            type="text"
            value={distributorData.tax_id}
            onChange={(e) => handleDistributorChange("tax_id", e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="XX-XXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year Established
          </label>
          <input
            type="number"
            value={distributorData.year_established}
            onChange={(e) =>
              handleDistributorChange("year_established", parseInt(e.target.value))
            }
            min={1900}
            max={new Date().getFullYear()}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee Count
          </label>
          <input
            type="number"
            value={distributorData.employee_count}
            onChange={(e) =>
              handleDistributorChange("employee_count", parseInt(e.target.value))
            }
            min={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Annual Revenue (USD)
          </label>
          <input
            type="number"
            value={distributorData.annual_revenue}
            onChange={(e) =>
              handleDistributorChange("annual_revenue", parseInt(e.target.value))
            }
            min={0}
            step={10000}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry Certifications
        </label>
        <div className="flex flex-wrap gap-2">
          {CERTIFICATIONS.map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => handleCertificationToggle(cert)}
              className={`px-3 py-1 rounded-full text-sm ${
                distributorData.industry_certifications.includes(cert)
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Headquarters Address
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <input
              type="text"
              value={distributorData.headquarters_address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              placeholder="Street Address"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={distributorData.headquarters_address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              placeholder="City"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={distributorData.headquarters_address.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              placeholder="State/Province"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={distributorData.headquarters_address.postal_code}
              onChange={(e) => handleAddressChange("postal_code", e.target.value)}
              placeholder="Postal Code"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={distributorData.headquarters_address.country}
              onChange={(e) => handleAddressChange("country", e.target.value)}
              placeholder="Country"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Key Contacts</h4>
          <button
            type="button"
            onClick={handleAddContact}
            className="text-sm text-emerald-600 hover:text-emerald-700"
          >
            + Add Contact
          </button>
        </div>
        {distributorData.key_contacts.map((contact, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">
                Contact {index + 1}
              </span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveContact(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="text"
                value={contact.name}
                onChange={(e) =>
                  handleContactChange(index, "name", e.target.value)
                }
                placeholder="Full Name"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={contact.title}
                onChange={(e) =>
                  handleContactChange(index, "title", e.target.value)
                }
                placeholder="Title"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="email"
                value={contact.email}
                onChange={(e) =>
                  handleContactChange(index, "email", e.target.value)
                }
                placeholder="Email"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) =>
                  handleContactChange(index, "phone", e.target.value)
                }
                placeholder="Phone"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContractTypeStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Contract Type
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(CONTRACT_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                handleContractChange("contract_type", type as ContractType)
              }
              className={`p-4 text-left rounded-lg border-2 transition-colors ${
                contractData.contract_type === type
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Distributor Tier
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {Object.entries(DISTRIBUTOR_TIER_LABELS).map(([tier, label]) => (
            <button
              key={tier}
              type="button"
              onClick={() =>
                handleContractChange("tier", tier as DistributorTier)
              }
              className={`p-4 text-center rounded-lg border-2 transition-colors ${
                contractData.tier === tier
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Region
          </label>
          <select
            value={contractData.region}
            onChange={(e) =>
              handleContractChange("region", e.target.value as RegionCode)
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {Object.entries(REGION_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <select
            value={contractData.currency}
            onChange={(e) =>
              handleContractChange("currency", e.target.value as CurrencyCode)
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {Object.values(CurrencyCode).map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contract Term (Months)
          </label>
          <select
            value={contractData.term_months}
            onChange={(e) =>
              handleContractChange("term_months", parseInt(e.target.value))
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={12}>12 Months</option>
            <option value={24}>24 Months</option>
            <option value={36}>36 Months</option>
            <option value={48}>48 Months</option>
            <option value={60}>60 Months</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTerritoriesStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Territories</h3>
          <p className="text-sm text-gray-500">
            Define geographic coverage for this contract. Leave empty to use
            default region coverage.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddTerritory}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          Add Territory
        </button>
      </div>

      {contractData.territories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No territories defined
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Default territory will be created based on selected region.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contractData.territories.map((territory, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">
                  Territory {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => handleRemoveTerritory(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Territory Name
                  </label>
                  <input
                    type="text"
                    value={territory.name}
                    onChange={(e) =>
                      handleTerritoryChange(index, "name", e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <select
                    value={territory.region}
                    onChange={(e) =>
                      handleTerritoryChange(
                        index,
                        "region",
                        e.target.value as RegionCode
                      )
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.entries(REGION_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={territory.is_exclusive}
                      onChange={(e) =>
                        handleTerritoryChange(
                          index,
                          "is_exclusive",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Exclusive Territory
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Distributor Information
        </h3>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="text-sm text-gray-900">
              {distributorData.company_name || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Legal Name</dt>
            <dd className="text-sm text-gray-900">
              {distributorData.legal_name || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Registration Number
            </dt>
            <dd className="text-sm text-gray-900">
              {distributorData.registration_number || "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Year Established
            </dt>
            <dd className="text-sm text-gray-900">
              {distributorData.year_established}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Employees</dt>
            <dd className="text-sm text-gray-900">
              {distributorData.employee_count.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Annual Revenue</dt>
            <dd className="text-sm text-gray-900">
              {formatCurrency(distributorData.annual_revenue)}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Certifications</dt>
            <dd className="text-sm text-gray-900">
              {distributorData.industry_certifications.length > 0
                ? distributorData.industry_certifications.join(", ")
                : "None"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contract Details
        </h3>
        <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
            <dd className="text-sm text-gray-900">
              {CONTRACT_TYPE_LABELS[contractData.contract_type]}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Distributor Tier
            </dt>
            <dd className="text-sm text-gray-900">
              {DISTRIBUTOR_TIER_LABELS[contractData.tier]}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Primary Region</dt>
            <dd className="text-sm text-gray-900">
              {REGION_LABELS[contractData.region]}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Currency</dt>
            <dd className="text-sm text-gray-900">{contractData.currency}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Contract Term</dt>
            <dd className="text-sm text-gray-900">
              {contractData.term_months} months
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Territories</dt>
            <dd className="text-sm text-gray-900">
              {contractData.territories.length > 0
                ? contractData.territories.map((t) => t.name).join(", ")
                : "Default (based on region)"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create New Contract
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
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

      {renderStepIndicator()}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="min-h-[400px]">
        {currentStep === 1 && renderDistributorStep()}
        {currentStep === 2 && renderContractTypeStep()}
        {currentStep === 3 && renderTerritoriesStep()}
        {currentStep === 4 && renderReviewStep()}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : handleBack}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>

        {currentStep < STEPS.length ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Contract"}
          </button>
        )}
      </div>
    </div>
  );
}
