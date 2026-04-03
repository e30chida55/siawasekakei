export type FamilyMember = {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  role: 'parent' | 'child';
};

export type Dream = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetYear: number;
  term: 'short' | 'long';
};

export type Debt = {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  monthlyPayment: number;
};

export type FixedExpense = {
  id: string;
  title: string;
  amount: number;
};

export type FixedIncome = {
  id: string;
  title: string;
  amount: number;
};

export type TransactionType = 'income' | 'expense_food' | 'expense_daily' | 'expense_other' | 'debt_payment' | 'dream_saving';

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category?: string; // Added for income categories
  memo: string;
  isHappy: boolean; // For highlighting positive spending
  targetId?: string; // For linking to specific dream or debt
};

export type AppState = {
  family: FamilyMember[];
  dreams: Dream[];
  debts: Debt[];
  fixedExpenses: FixedExpense[];
  transactions: Transaction[];
};

