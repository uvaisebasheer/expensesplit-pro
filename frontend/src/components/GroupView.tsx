import React from 'react';
import { Users, UserPlus, Calendar, ArrowRight } from 'lucide-react';
import type { Group, Expense } from '../types';
import { formatCurrency, formatDate, getInitials, generateAvatarColor } from '../utils/formatters';

interface GroupViewProps {
  groups: Group[];
  expenses: Expense[];
  loading: boolean;
}

export default function GroupView({ groups, expenses, loading }: GroupViewProps) {
  const getGroupExpenses = (groupId: number) => expenses.filter(e => e.groupId === groupId);
  const getGroupTotal = (groupId: number) => getGroupExpenses(groupId).reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
              <div className="h-8 w-8 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No groups yet</h3>
        <p className="text-gray-500 text-sm">Groups are managed from the backend</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">Total Groups</p>
            <p className="text-3xl font-bold">{groups.length}</p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm font-medium mb-1">Total Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
          </div>
        </div>
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(group => {
          const groupExpenses = getGroupExpenses(group.id);
          const total = getGroupTotal(group.id);
          const memberCount = group.members?.length || 0;

          return (
            <div
              key={group.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <Users className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {groupExpenses.length} expenses
                </span>
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{group.description}</p>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 py-3 border-t border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Total</p>
                  <p className="font-bold text-gray-900">{formatCurrency(total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Per person</p>
                  <p className="font-bold text-gray-900">
                    {memberCount > 0 ? formatCurrency(total / memberCount) : formatCurrency(0)}
                  </p>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members?.slice(0, 4).map(member => {
                    const color = generateAvatarColor(member.name);
                    return (
                      <div
                        key={member.id}
                        className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center`}
                        title={member.name}
                      >
                        <span className="text-[10px] text-white font-bold">
                          {getInitials(member.name)}
                        </span>
                      </div>
                    );
                  })}
                  {memberCount > 4 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-gray-600 font-bold">+{memberCount - 4}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {formatDate(group.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
