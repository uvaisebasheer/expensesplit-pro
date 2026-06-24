import React from 'react';
import { OptimizationResult } from '../types';

interface SettlementViewProps {
  result: OptimizationResult | null;
  loading: boolean;
}

function SettlementView(props: SettlementViewProps) {
  const { result, loading } = props;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Calculating optimal settlements...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        Click "Optimize Settlements" to see who pays whom
      </div>
    );
  }

  if (result.settlements.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-green-600 font-semibold text-lg">🎉 Everyone is settled up!</p>
        <p className="text-gray-600 mt-1">No payments needed</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Optimized Settlements</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-xl font-bold text-blue-600">₹{result.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">Efficiency Gain</p>
          <p className="text-xl font-bold text-green-600">{result.reductionPercent}%</p>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <p>Original transactions: {result.originalTransactions}</p>
        <p>Optimized transactions: {result.optimizedTransactions}</p>
      </div>

      <div className="space-y-3">
        {result.settlements.map((settlement, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-md border-l-4 border-blue-500 gap-4">
            
            {/* Payer */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-start">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-sm">
                  {settlement.fromUserName[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{settlement.fromUserName}</p>
                <p className="text-xs text-gray-500">pays</p>
              </div>
            </div>
            
            {/* Amount + Arrow */}
            <div className="text-center flex items-center gap-2 sm:flex-col">
              <p className="text-lg font-bold text-blue-600">₹{settlement.amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 hidden sm:block">→</p>
              <p className="text-xs text-gray-500 sm:hidden">↓</p>
            </div>
            
            {/* Receiver */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:justify-start">
              <div className="text-right sm:text-left">
                <p className="font-semibold text-gray-800">{settlement.toUserName}</p>
                <p className="text-xs text-gray-500">receives</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-bold text-sm">
                  {settlement.toUserName[0]}
                </span>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettlementView;