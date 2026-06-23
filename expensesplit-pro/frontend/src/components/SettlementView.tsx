import React, { useState, useMemo } from 'react';
import { ArrowRight, TrendingUp, Users, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Group, Expense, SettlementDto } from '../types';
import { api } from '../services/api';
import { useAsyncAction } from '../hooks/useApi';
import { formatCurrency, getInitials, generateAvatarColor } from '../utils/formatters';

interface SettlementViewProps {
  groups: Group[];
  expenses: Expense[];
}

export default function SettlementView({ groups, expenses }: SettlementViewProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
  const [settlements, setSettlements] = useState<SettlementDto[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { execute: fetchSettlements, loading: optimizing } = useAsyncAction(api.getOptimizedSettlements);

  const handleOptimize = async () => {
    if (selectedGroupId === 0) {
      toast.error('Please select a group');
      return;
    }
    const result = await fetchSettlements(selectedGroupId);
    if (result) {
      setSettlements(result);
      setShowResults(true);
    }
  };

  // Calculate balances from expenses
  const balances = useMemo(() => {
    if (selectedGroupId === 0) return {};

    const groupExpenses = expenses.filter(e => e.groupId === selectedGroupId);
    const balanceMap: Record<number, { name: string; paid: number; owed: number }> = {};

    groupExpenses.forEach(expense => {
      // Payer paid
      if (!balanceMap[expense.paidById]) {
        balanceMap[expense.paidById] = { name: expense.paidByName, paid: 0, owed: 0 };
      }
      balanceMap[expense.paidById].paid += expense.amount;

      // Each share owes
      expense.shares?.forEach(share => {
        if (!balanceMap[share.userId]) {
          balanceMap[share.userId] = { name: share.userName, paid: 0, owed: 0 };
        }
        balanceMap[share.userId].owed += share.amount;
      });
    });

    return balanceMap;
  }, [expenses, selectedGroupId]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const totalGroupExpenses = expenses
    .filter(e => e.groupId === selectedGroupId)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          Settlement Optimization
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Group
            </label>
            <select
              value={selectedGroupId}
              onChange={e => {
                setSelectedGroupId(Number(e.target.value));
                setShowResults(false);
                setSettlements([]);
              }}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            >
              <option value={0}>Choose a group...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleOptimize}
              disabled={optimizing || selectedGroupId === 0}
              className={`
                px-6 py-2.5 rounded-lg text-white font-semibold text-sm
                transition-all duration-200 flex items-center gap-2
                ${optimizing || selectedGroupId === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 active:scale-[0.98] shadow-lg shadow-primary-200'
                }
              `}
            >
              {optimizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Optimize Settlements
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {selectedGroupId > 0 && (
        <>
          {/* Group Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(totalGroupExpenses)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-success-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Members</p>
                  <p className="text-xl font-bold text-gray-900">{selectedGroup?.members?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transactions</p>
                  <p className="text-xl font-bold text-gray-900">
                    {expenses.filter(e => e.groupId === selectedGroupId).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                Balance Overview
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(balances).map(([userId, data]) => {
                  const net = data.paid - data.owed;
                  const color = generateAvatarColor(data.name);
                  return (
                    <div key={userId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                          <span className="text-xs text-white font-bold">{getInitials(data.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{data.name}</p>
                          <p className="text-xs text-gray-500">
                            Paid {formatCurrency(data.paid)} • Owed {formatCurrency(data.owed)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-right ${net >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        <p className="font-bold text-lg">
                          {net >= 0 ? '+' : ''}{formatCurrency(net)}
                        </p>
                        <p className="text-xs font-medium">
                          {net > 0 ? 'gets back' : net < 0 ? 'owes' : 'settled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(balances).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>No expenses in this group yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optimized Settlements */}
          {showResults && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  Optimized Settlement Plan
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Minimum transactions needed to settle all debts
                </p>
              </div>

              <div className="p-6">
                {settlements.length > 0 ? (
                  <div className="space-y-3">
                    {settlements.map((settlement, index) => {
                      const fromColor = generateAvatarColor(settlement.fromUserName);
                      const toColor = generateAvatarColor(settlement.toUserName);

                      return (
                        <div 
                          key={index} 
                          className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors border border-gray-100"
                        >
                          {/* From User */}
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full ${fromColor} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-xs text-white font-bold">
                                {getInitials(settlement.fromUserName)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{settlement.fromUserName}</p>
                              <p className="text-xs text-danger-600 font-medium">owes</p>
                            </div>
                          </div>

                          {/* Arrow & Amount */}
                          <div className="flex flex-col items-center px-4">
                            <ArrowRight className="w-5 h-5 text-primary-500" />
                            <p className="font-bold text-primary-700 text-sm mt-1">
                              {formatCurrency(settlement.amount)}
                            </p>
                          </div>

                          {/* To User */}
                          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                            <div className="text-right min-w-0">
                              <p className="font-medium text-gray-900 truncate">{settlement.toUserName}</p>
                              <p className="text-xs text-success-600 font-medium">receives</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full ${toColor} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-xs text-white font-bold">
                                {getInitials(settlement.toUserName)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="mt-4 p-4 bg-success-50 rounded-xl border border-success-200">
                      <p className="text-sm text-success-800 font-medium text-center">
                        <CheckCircle2 className="w-4 h-4 inline mr-1.5" />
                        All debts settled with {settlements.length} transaction{settlements.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-900">All Settled!</p>
                    <p className="text-sm text-gray-500 mt-1">Everyone is square in this group</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
