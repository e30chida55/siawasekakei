import { useState, useEffect } from 'react';
import { AppState, Transaction, TransactionType } from '../types';
import { cn } from '../lib/utils';
import { Heart, Star, TrendingUp, Wallet, CheckCircle2, ShoppingCart, Utensils } from 'lucide-react';

interface RecordProps {
  state: AppState;
  onAddTransaction: (t: Transaction) => void;
}

export function Record({ state, onAddTransaction }: RecordProps) {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [type, setType] = useState<TransactionType>('expense_food');
  const [isHappy, setIsHappy] = useState(true);
  const [targetId, setTargetId] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-select first dream if available
  useEffect(() => {
    if (type === 'dream_saving' && state.dreams.length > 0 && !targetId) {
      setTargetId(state.dreams[0].id);
    }
  }, [type, state.dreams, targetId]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'debt_payment') {
      const totalMonthlyPayment = state.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
      setAmount(totalMonthlyPayment.toString());
      setMemo('毎月の借金返済');
    } else {
      setAmount('');
      setMemo('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      type,
      memo,
      isHappy,
      targetId: type === 'dream_saving' ? targetId : undefined,
    };

    onAddTransaction(newTransaction);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setAmount('');
      setMemo('');
      setType('expense_food');
      setIsHappy(true);
      setTargetId('');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500 text-center space-y-4">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">記録しました！</h2>
        <p className="text-stone-500">未来へ一歩近づきましたね✨</p>
      </div>
    );
  }

  const isExpense = type.startsWith('expense');
  const isDebt = type === 'debt_payment';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
        <h2 className="text-xl font-bold text-stone-800 mb-6 text-center">
          今日のお金の使い道は？
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange('expense_food')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'expense_food'
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] font-bold">食費</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense_daily')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'expense_daily'
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-bold">日用品</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense_other')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'expense_other'
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] font-bold">その他</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('dream_saving')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'dream_saving'
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <Star className="w-5 h-5" />
              <span className="text-[10px] font-bold">夢貯金</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('debt_payment')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'debt_payment'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-bold">借金返済</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={cn(
                'p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all',
                type === 'income'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-stone-100 bg-white text-stone-500 hover:bg-stone-50'
              )}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px] font-bold">収入</span>
            </button>
          </div>

          {/* Target Dream Selection */}
          {type === 'dream_saving' && state.dreams.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-bold text-stone-500 mb-2">どの夢のための貯金？</label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-2xl py-4 px-4 text-base font-bold text-stone-800 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
                required
              >
                {state.dreams.map(dream => (
                  <option key={dream.id} value={dream.id}>{dream.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2">金額</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-stone-400">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                readOnly={isDebt}
                className={cn(
                  "w-full border-none rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold focus:ring-2 focus:ring-orange-400 outline-none transition-all",
                  isDebt ? "bg-stone-100 text-stone-500" : "bg-stone-50 text-stone-800"
                )}
                required
              />
            </div>
            {isDebt && (
              <p className="text-xs text-stone-400 mt-2 ml-1">※設定された毎月の返済額が自動で入力されます</p>
            )}
          </div>

          {/* Memo Input */}
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-2">メモ（何に使った？）</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例：家族で美味しいディナー"
              className="w-full bg-stone-50 border-none rounded-2xl py-4 px-4 text-base text-stone-800 focus:ring-2 focus:ring-orange-400 outline-none transition-all"
              required
            />
          </div>

          {/* Happy Toggle (only for expenses) */}
          {isExpense && (
            <div className="bg-stone-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className={cn('w-6 h-6', isHappy ? 'fill-rose-400 text-rose-400' : 'text-stone-300')} />
                <span className="text-sm font-bold text-stone-700">これは「良いお金の使い方」だった？</span>
              </div>
              <button
                type="button"
                onClick={() => setIsHappy(!isHappy)}
                className={cn(
                  'w-14 h-8 rounded-full transition-colors relative',
                  isHappy ? 'bg-rose-400' : 'bg-stone-300'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 bg-white rounded-full absolute top-1 transition-transform',
                    isHappy ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-md transition-all active:scale-95"
          >
            記録する
          </button>
        </form>
      </div>
    </div>
  );
}
