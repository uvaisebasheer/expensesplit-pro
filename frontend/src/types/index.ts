export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ExpenseSplit {
  userId: number;
  amount: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidByUserId: number;
  groupId: number;
  createdAt: string;
  receiptUrl?: string;
  splits: ExpenseSplit[];
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  paidByUserId: number;
  groupId: number;
  splits: ExpenseSplit[];
}

export interface Settlement {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface OptimizationResult {
  groupId: number;
  totalExpenses: number;
  originalTransactions: number;
  optimizedTransactions: number;
  reductionPercent: number;
  settlements: Settlement[];
}