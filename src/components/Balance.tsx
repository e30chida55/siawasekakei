import React, { useState } from 'react';
import { AppState, Transaction, TransactionType } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowDownRight, ArrowUpRight, Wallet, Receipt, PieChart, Trash2, X, AlertCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface BalanceProps {
  state: AppState;
}

export function Balance({ state }: BalanceProps) {
  const { deleteTransaction } = useAuth();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const currentMonthTransactions = state.transactions.filter(
    (t) => t.date.startsWith(currentMonth)
  );

  const totalIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 固定費（設定値から計算）
  const baseFixedExpenses = state.fixedExpenses || [];
  const totalFixedExpenseSetting = baseFixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDebtPaymentSetting = state.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const totalFixedExpenses = totalFixedExpenseSetting + totalDebtPaymentSetting;

  // 変動費（記録から計算）
  const expensesByCategory = {
    food: currentMonthTransactions
      .filter((t) => t.type === 'expense_food')
      .reduce((sum, t) => sum + t.amount, 0),
    daily: currentMonthTransactions
      .filter((t) => t.type === 'expense_daily')
      .reduce((sum, t) => sum + t.amount, 0),
    other: currentMonthTransactions
      .filter((t) => t.type === 'expense_other')
      .reduce((sum, t) => sum + t.amount, 0),
    dream: currentMonthTransactions
      .filter((t) => t.type === 'dream_saving')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const totalVariableExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
  
  // 総支出 ＝ 固定費 ＋ 変動費
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  const balance = totalIncome - totalExpenses;

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteTransaction(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const exportToCSV = () => {
    const headers = ['日付', '種類', 'カテゴリ/対象', '金額', 'メモ', '満足度'];
    const rows = currentMonthTransactions.map(t => {
      const typeLabel = 
        t.type === 'expense_food' ? '食費' :
        t.type === 'expense_daily' ? '日用品' :
        t.type === 'expense_other' ? 'その他（支出）' :
        t.type === 'income' ? '収入' :
        t.type === 'dream_saving' ? '夢貯金' :
        t.type === 'debt_payment' ? '借金返済' : '';
        
      const categoryOrTarget = 
        t.type === 'income' ? t.category || '' :
        t.type === 'dream_saving' ? state.dreams.find(d => d.id === t.targetId)?.title || '' :
        t.type === 'debt_payment' ? state.debts.find(d => d.id === t.targetId)?.title || '' : '';
        
      const amount = t.type === 'income' ? t.amount : -t.amount;
      const isHappy = t.isHappy ? '満足' : '';
      
      return [
        t.date,
        typeLabel,
        categoryOrTarget,
        amount,
        t.memo || '',
        isHappy
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `家計簿_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-bold text-stone-500 mb-1">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-stone-800">{currentMonth.replace('-', '年')}月</span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-stone-100 rounded-full transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </h2>
          <div className="text-3xl font-black text-stone-800 tracking-tight">
            {formatCurrency(balance)}
          </div>
        </div>
        <div className="text-right">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV出力
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <div className="bg-emerald-100 p-1.5 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">収入合計</span>
          </div>
          <div className="text-lg font-bold text-stone-800">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <div className="bg-rose-100 p-1.5 rounded-full">
              <ArrowDownRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">支出合計</span>
          </div>
          <div className="text-lg font-bold text-stone-800">{formatCurrency(totalExpenses)}</div>
        </div>
      </div>

      {/* 収入セクション */}
      {totalIncome > 0 && (
        <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              今月の収入
            </h3>
            <span className="text-sm font-bold text-stone-800">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="space-y-3">
            {currentMonthTransactions
              .filter((t) => t.type === 'income')
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((income) => (
                <div key={income.id} className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-stone-600 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      {income.category || '収入'} {income.memo && <span className="text-stone-400 text-xs ml-1">({income.memo})</span>}
                    </span>
                    <span className="text-xs text-stone-400 ml-4">{income.date}</span>
                  </div>
                  <span className="font-bold text-stone-800">{formatCurrency(income.amount)}</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 固定費セクション */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-500" />
            固定費（毎月決まった支出）
          </h3>
          <span className="text-sm font-bold text-stone-800">{formatCurrency(totalFixedExpenses)}</span>
        </div>
        <div className="space-y-3">
          {baseFixedExpenses.map((expense) => (
            <div key={expense.id} className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                {expense.title}
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(expense.amount)}</span>
            </div>
          ))}
          {state.debts.map((debt) => (
            <div key={debt.id} className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                {debt.title} (返済)
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(debt.monthlyPayment)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 変動費セクション */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-500" />
            変動費（やりくり費）
          </h3>
          <span className="text-sm font-bold text-stone-800">{formatCurrency(totalVariableExpenses)}</span>
        </div>
        
        <div className="space-y-4">
          {/* Progress Bar for Variable Expenses */}
          <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden flex">
            {totalVariableExpenses > 0 ? (
              <>
                <div 
                  className="h-full bg-orange-400" 
                  style={{ width: `${(expensesByCategory.food / totalVariableExpenses) * 100}%` }}
                />
                <div 
                  className="h-full bg-blue-400" 
                  style={{ width: `${(expensesByCategory.daily / totalVariableExpenses) * 100}%` }}
                />
                <div 
                  className="h-full bg-stone-400" 
                  style={{ width: `${(expensesByCategory.other / totalVariableExpenses) * 100}%` }}
                />
                <div 
                  className="h-full bg-yellow-400" 
                  style={{ width: `${(expensesByCategory.dream / totalVariableExpenses) * 100}%` }}
                />
              </>
            ) : (
              <div className="h-full w-full bg-stone-200" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                食費
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(expensesByCategory.food)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                日用品
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(expensesByCategory.daily)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stone-400"></div>
                その他
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(expensesByCategory.other)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                夢貯金
              </span>
              <span className="font-bold text-stone-800">{formatCurrency(expensesByCategory.dream)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* This Month's Transactions */}
      <section>
        <h3 className="text-sm font-bold text-stone-500 mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          今月の記録
        </h3>
        <div className="space-y-3">
          {currentMonthTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((transaction) => (
              <div key={transaction.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    transaction.type === 'expense_food' ? 'bg-orange-100' :
                    transaction.type === 'expense_daily' ? 'bg-blue-100' :
                    transaction.type === 'dream_saving' ? 'bg-yellow-100' :
                    transaction.type === 'income' ? 'bg-emerald-100' :
                    transaction.type === 'debt_payment' ? 'bg-rose-100' :
                    'bg-stone-100'
                  }`}>
                    {transaction.type === 'expense_food' ? '🍔' :
                     transaction.type === 'expense_daily' ? '🧴' :
                     transaction.type === 'dream_saving' ? '✨' : 
                     transaction.type === 'income' ? '💰' :
                     transaction.type === 'debt_payment' ? '💳' : '🛍️'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      {transaction.memo || (
                        transaction.type === 'expense_food' ? '食費' :
                        transaction.type === 'expense_daily' ? '日用品' :
                        transaction.type === 'dream_saving' ? '夢貯金' : 
                        transaction.type === 'income' ? (transaction.category || '収入') :
                        transaction.type === 'debt_payment' ? '借金返済' : 'その他'
                      )}
                    </div>
                    <div className="text-xs text-stone-400">{transaction.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-500' : 'text-stone-800'}`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleDeleteClick(transaction.id)} className="p-1.5 text-stone-400 hover:text-rose-500 bg-stone-50 hover:bg-rose-50 rounded-full transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
          ))}
          {currentMonthTransactions.length === 0 && (
            <div className="text-center py-8 text-stone-400 text-sm">
              今月の記録はまだありません
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">記録を削除しますか？</h3>
            <p className="text-sm text-stone-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
