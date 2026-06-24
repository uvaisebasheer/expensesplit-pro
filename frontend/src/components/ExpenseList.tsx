import React from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
}

function ExpenseList(props: ExpenseListProps) {
  const { expenses } = props;

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        No expenses yet. Add your first expense above!
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Expenses</h2>
      
      <div className="space-y-3">
        {expenses.map(expense => (
          <div key={expense.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{expense.description}</h3>
                <p className="text-sm text-gray-600">
                  Paid by User #{expense.paidByUserId} • {new Date(expense.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">₹{expense.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{expense.splits.length} splits</p>
              </div>
            </div>
            
            <div className="mt-2 flex gap-2 flex-wrap">
              {expense.splits.map((split, idx) => (
                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                  User {split.userId}: ₹{split.amount.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-lg font-bold text-gray-800">
          Total: ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default ExpenseList;