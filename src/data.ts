import { AppState } from './types';

export const initialData: AppState = {
  family: [
    { id: '1', name: '大夢', birthDate: '1999-05-05', role: 'parent' },
    { id: '2', name: '百羽', birthDate: '2001-11-22', role: 'parent' },
    { id: '3', name: '桜乃', birthDate: '2023-10-07', role: 'child' },
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
      title: '家族で沖縄旅行',
      targetAmount: 2000000,
      currentAmount: 0,
      targetYear: 2030,
      term: 'long',
    },
  ],
  debts: [
    {
      id: '1',
      title: '借入返済',
      totalAmount: 2200000,
      paidAmount: 0,
      monthlyPayment: 51000,
    },
    {
      id: '2',
      title: '奨学金',
      totalAmount: 3000000,
      paidAmount: 0,
      monthlyPayment: 15000,
    },
  ],
  transactions: [],
};

