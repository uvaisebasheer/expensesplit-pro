import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Receipt, User, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Expense } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate, getInitials, generateAvatarColor } from '../utils/formatters';

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ExpenseList({ expenses, loading, onRefresh }: ExpenseListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    setDeletingId(id);
    try {
      await api.deleteExpense(id);
      toast.success('Expense deleted');
      onRefresh();
    } catch {
      // Error handled by API
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-orange-100 text-orange-700',
      'Transportation': 'bg-blue-100 text-blue-700',
      'Shopping': 'bg-pink-100 text-pink-700',
      'Entertainment': 'bg-purple-100 text-purple-700',
      'Utilities': 'bg-yellow-100 text-yellow-700',
      'Travel': 'bg-cyan-100 text-cyan-700',
      'Health': 'bg-red-100 text-red-700',
      'Education': 'bg-green-100 text-green-700',
      'Other': 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No expenses yet</h3>
        <p className="text-gray-500 text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm font-medium mb-1">Count</p>
            <p className="text-2xl font-bold">{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Expense Items */}
      <div className="space-y-2">
        {expenses.map(expense => {
          const isExpanded = expandedId === expense.id;
          const payerColor = generateAvatarColor(expense.paidByName);

          return (
            <div
              key={expense.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Main Row */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => toggleExpand(expense.id)}
              >
                {/* Category Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getCategoryColor(expense.category)}`}>
                  <Receipt className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{expense.description}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                    <span>{formatDate(expense.date)}</span>
                    <span>•</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <div className={`w-5 h-5 rounded-full ${payerColor} flex items-center justify-center`}>
                      <span className="text-[8px] text-white font-bold">
                        {getInitials(expense.paidByName)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">paid</span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  <div className="space-y-3">
                    {/* Payer Info */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className={`w-8 h-8 rounded-full ${payerColor} flex items-center justify-center`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{expense.paidByName}</p>
                        <p className="text-xs text-gray-500">Paid {formatCurrency(expense.amount)}</p>
                      </div>
                    </div>

                    {/* Shares */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        Split Details
                      </p>
                      <div className="space-y-1.5">
                        {expense.shares?.map(share => {
                          const shareColor = generateAvatarColor(share.userName);
                          return (
                            <div key={share.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${shareColor} flex items-center justify-center`}>
                                  <span className="text-[9px] text-white font-bold">
                                    {getInitials(share.userName)}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-700">{share.userName}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(share.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Group Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span>Group: {expense.groupName}</span>
                      <span>Added: {formatDate(expense.createdAt)}</span>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(expense.id);
                      }}
                      disabled={deletingId === expense.id}
                      className="w-full py-2 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      {deletingId === expense.id ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete Expense
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
