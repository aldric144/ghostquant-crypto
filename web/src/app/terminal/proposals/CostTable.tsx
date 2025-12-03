'use client';

import React from 'react';

interface CostYear {
  year: number;
  labor: number;
  odc: number;
  travel: number;
  total: number;
}

interface CostTableProps {
  costId: string;
  totalCost: number;
  costRiskLevel: string;
  laborCosts: any;
  odcCosts: any;
  travelCosts: any;
  costByYear: CostYear[];
  fteBreakdown: Record<string, number>;
}

export default function CostTable({
  costId,
  totalCost,
  costRiskLevel,
  laborCosts,
  odcCosts,
  travelCosts,
  costByYear,
  fteBreakdown
}: CostTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-emerald-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const totalFTE = Object.values(fteBreakdown).reduce((sum, fte) => sum + fte, 0);

  return (
    <div className="cost-table">
      <div className="mb-6 p-6 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-lg">
        <h3 className="text-xl font-semibold text-emerald-400 mb-4">Cost Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-slate-800/50 rounded">
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {formatCurrency(totalCost)}
            </div>
            <div className="text-sm text-slate-400">Total Cost (3 Years)</div>
          </div>
          
          <div className="text-center p-4 bg-slate-800/50 rounded">
            <div className={`text-3xl font-bold mb-1 ${getRiskColor(costRiskLevel)}`}>
              {costRiskLevel.toUpperCase()}
            </div>
            <div className="text-sm text-slate-400">Cost Risk Level</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-3 bg-slate-800/50 rounded text-center">
            <div className="text-xl font-bold text-cyan-400">
              {formatCurrency(laborCosts.total_annual || 0)}
            </div>
            <div className="text-xs text-slate-400">Labor (Annual)</div>
          </div>
          
          <div className="p-3 bg-slate-800/50 rounded text-center">
            <div className="text-xl font-bold text-cyan-400">
              {formatCurrency(odcCosts.total || 0)}
            </div>
            <div className="text-xs text-slate-400">ODC (Annual)</div>
          </div>
          
          <div className="p-3 bg-slate-800/50 rounded text-center">
            <div className="text-xl font-bold text-cyan-400">
              {formatCurrency(travelCosts.total_annual || 0)}
            </div>
            <div className="text-xs text-slate-400">Travel (Annual)</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-slate-300 mb-3">Cost by Year</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-slate-400 font-medium">Year</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Labor</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">ODC</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Travel</th>
                <th className="text-right py-2 px-3 text-slate-400 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {costByYear.map((year) => (
                <tr key={year.year} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-slate-200 font-medium">Year {year.year}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(year.labor)}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(year.odc)}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(year.travel)}</td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">{formatCurrency(year.total)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-emerald-500/30 font-bold">
                <td className="py-3 px-3 text-slate-200">Total</td>
                <td className="py-3 px-3 text-right text-slate-200">
                  {formatCurrency(costByYear.reduce((sum, y) => sum + y.labor, 0))}
                </td>
                <td className="py-3 px-3 text-right text-slate-200">
                  {formatCurrency(costByYear.reduce((sum, y) => sum + y.odc, 0))}
                </td>
                <td className="py-3 px-3 text-right text-slate-200">
                  {formatCurrency(costByYear.reduce((sum, y) => sum + y.travel, 0))}
                </td>
                <td className="py-3 px-3 text-right text-emerald-400 text-lg">
                  {formatCurrency(costByYear.reduce((sum, y) => sum + y.total, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold text-slate-300 mb-3">FTE Breakdown</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(fteBreakdown).map(([role, fte]) => (
            <div key={role} className="p-3 bg-slate-800/50 border border-slate-700 rounded">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 capitalize">{role.replace(/_/g, ' ')}</span>
                <span className="text-lg font-bold text-emerald-400">{fte}</span>
              </div>
            </div>
          ))}
          <div className="col-span-2 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400 font-semibold">Total FTE</span>
              <span className="text-xl font-bold text-emerald-400">{totalFTE}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-800/30 border border-slate-700 rounded text-xs text-slate-500 text-center">
        Cost ID: {costId}
      </div>
    </div>
  );
}
