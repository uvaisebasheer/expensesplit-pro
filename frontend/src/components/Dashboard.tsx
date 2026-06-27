import React from 'react';
import { Wallet, Users, Receipt, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
    totalExpenses: number;
    totalGroups: number;
    totalTransactions: number;
}

export default function Dashboard({ totalExpenses, totalGroups, totalTransactions }: DashboardProps) {
    const stats = [
        { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: Wallet, color: 'bg-blue-500' },
        { label: 'Active Groups', value: totalGroups, icon: Users, color: 'bg-green-500' },
        { label: 'Transactions', value: totalTransactions, icon: Receipt, color: 'bg-purple-500' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}