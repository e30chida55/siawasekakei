import { AppState } from '../types';
import { formatCurrency } from '../lib/utils';
import { PieChart, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface BalanceProps {
  state: AppState;
}

export function Balance({ state }: BalanceProps) {
  // Calculate totals for the current month (mocked as all transactions for simplicity in this prototype)
  const totalIncome = state.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const foodExpense = state.transactions
    .filter(t => t.type === 'expense_food')
    .reduce((sum, t) => sum + t.amount, 0);

  const dailyExpense = state.transactions
    .filter(t => t.type === 'expense_daily')
    .reduce((sum, t) => sum + t.amount, 0);

  const otherExpense = state.transactions
    .filter(t => t.type === 'expense_other')
    .reduce((sum, t) => sum + t.amount, 0);

  const debtPayment = state.transactions
    .filter(t => t.type === 'debt_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const dreamSaving = state.transactions
    .filter(t => t.type === 'dream_saving')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = foodExpense + dailyExpense + otherExpense + debtPayment + dreamSaving;
  const balance = totalIncome - totalExpense;

  const getPercentage = (amount: number) => {
    if (totalExpense === 0) return 0;
    return Math.round((amount / totalExpense) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-stone-800">今月の収支</h2>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
        <p className="text-sm font-bold text-stone-500 text-center mb-2">残金（収入 - 支出）</p>
        <p className={`text-4xl font-black text-center mb-6 ${balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
          {formatCurrency(balance)}
        </p>

        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-1 mb-1 text-blue-600">
              <ArrowUpCircle className="w-4 h-4" />
              <span className="text-xs font-bold">収入</span>
            </div>
            <p className="text-lg font-bold text-stone-800">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="flex-1 bg-rose-50 rounded-2xl p-4 border border-rose-100">
            <div className="flex items-center gap-1 mb-1 text-rose-600">
              <ArrowDownCircle className="w-4 h-4" />
              <span className="text-xs font-bold">支出</span>
            </div>
            <p className="text-lg font-bold text-stone-800">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
        <h3 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-stone-400" />
          支出の内訳
        </h3>

        {/* Visual Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex mb-6">
          <div style={{ width: `${getPercentage(foodExpense)}%` }} className="bg-orange-400" />
          <div style={{ width: `${getPercentage(dailyExpense)}%` }} className="bg-amber-400" />
          <div style={{ width: `${getPercentage(otherExpense)}%` }} className="bg-stone-400" />
          <div style={{ width: `${getPercentage(debtPayment)}%` }} className="bg-emerald-400" />
          <div style={{ width: `${getPercentage(dreamSaving)}%` }} className="bg-yellow-400" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-sm font-bold text-stone-600">食費</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">{formatCurrency(foodExpense)}</p>
              <p className="text-xs text-stone-400">{getPercentage(foodExpense)}%</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm font-bold text-stone-600">日用品</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">{formatCurrency(dailyExpense)}</p>
              <p className="text-xs text-stone-400">{getPercentage(dailyExpense)}%</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-stone-400" />
              <span className="text-sm font-bold text-stone-600">その他生活費</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">{formatCurrency(otherExpense)}</p>
              <p className="text-xs text-stone-400">{getPercentage(otherExpense)}%</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-sm font-bold text-stone-600">借金返済</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">{formatCurrency(debtPayment)}</p>
              <p className="text-xs text-stone-400">{getPercentage(debtPayment)}%</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm font-bold text-stone-600">夢への貯金</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-stone-800">{formatCurrency(dreamSaving)}</p>
              <p className="text-xs text-stone-400">{getPercentage(dreamSaving)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
