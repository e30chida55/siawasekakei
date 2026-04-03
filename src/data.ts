import { AppState } from './types';

export const initialData: AppState = {
  family: [
    { id: '1', name: 'パパ', birthDate: '1990-01-01', role: 'parent' },
    { id: '2', name: 'ママ', birthDate: '1990-01-01', role: 'parent' },
  ],
  dreams: [
    {
      id: '1',
      title: '家族で温泉旅行！',
      targetAmount: 50000,
      currentAmount: 0,
      targetYear: 2027,
      term: 'short',
    },
    {
      id: '2',
      title: 'マイホームの頭金',
      targetAmount: 3000000,
      currentAmount: 0,
      targetYear: 2030,
      term: 'long',
    },
  ],
  debts: [
    {
      id: '1',
      title: '奨学金',
      totalAmount: 2000000,
      paidAmount: 0,
      monthlyPayment: 15000,
    },
    {
      id: '2',
      title: '車のローン',
      totalAmount: 1500000,
      paidAmount: 0,
      monthlyPayment: 30000,
    },
  ],
  fixedExpenses: [
    { id: '1', title: '家賃', amount: 80000 },
    { id: '2', title: '水道光熱費', amount: 15000 },
    { id: '3', title: '通信費', amount: 10000 },
    { id: '4', title: '保険料', amount: 12000 },
  ],
  transactions: [],
};

