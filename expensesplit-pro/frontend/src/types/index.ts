export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  members: User[];
}

export interface ExpenseShare {
  id: number;
  userId: number;
  userName: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidById: number;
  paidByName: string;
  groupId: number;
  groupName: string;
  date: string;
  category: string;
  shares: ExpenseShare[];
  createdAt: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  paidById: number;
  groupId: number;
  date: string;
  category: string;
  shares: { userId: number; amount: number }[];
}

export interface SettlementDto {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface SettlementSummary {
  totalOwed: number;
  totalOwes: number;
  netBalance: number;
  transactions: SettlementDto[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Utilities'
  | 'Travel'
  | 'Health'
  | 'Education'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Travel',
  'Health',
  'Education',
  'Other'
];
