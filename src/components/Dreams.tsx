import { AppState } from '../types';
import { formatCurrency } from '../lib/utils';
import { Star, Plus, Target, TrendingUp, Calendar } from 'lucide-react';

interface DreamsProps {
  state: AppState;
}

export function Dreams({ state }: DreamsProps) {
  const shortTermDreams = state.dreams.filter(d => d.term === 'short');
  const longTermDreams = state.dreams.filter(d => d.term === 'long');

  const renderDream = (dream: AppState['dreams'][0]) => {
    const progress = dream.targetAmount > 0 ? (dream.currentAmount / dream.targetAmount) * 100 : 0;
    return (
      <div key={dream.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">{dream.title}</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <Target className="w-3 h-3" />
              目標年: {dream.targetYear}年
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-2xl border border-yellow-100 shadow-sm">
            {dream.term === 'short' ? '🏝️' : '🏠'}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-orange-600">{formatCurrency(dream.currentAmount)}</span>
            <span className="text-stone-400">/ {formatCurrency(dream.targetAmount)}</span>
          </div>
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Short Term Dreams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            短期の目標（〜3年）
          </h2>
          <button className="bg-orange-100 text-orange-600 p-1.5 rounded-full hover:bg-orange-200 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {shortTermDreams.map(renderDream)}
          {shortTermDreams.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-4 bg-stone-50 rounded-2xl">短期の目標を追加してみましょう！</p>
          )}
        </div>
      </div>

      {/* Long Term Dreams */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            長期の目標（3年〜）
          </h2>
          <button className="bg-indigo-100 text-indigo-600 p-1.5 rounded-full hover:bg-indigo-200 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {longTermDreams.map(renderDream)}
          {longTermDreams.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-4 bg-stone-50 rounded-2xl">長期の目標を追加してみましょう！</p>
          )}
        </div>
      </div>

      {/* Debt Section */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            借金返済の道のり
          </h2>
          <button className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full hover:bg-emerald-200 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {state.debts.map((debt) => {
            const progress = debt.totalAmount > 0 ? (debt.paidAmount / debt.totalAmount) * 100 : 0;
            return (
              <div key={debt.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-1">{debt.title}</h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-stone-500 font-medium">
                        残り: <span className="text-stone-700">{formatCurrency(debt.totalAmount - debt.paidAmount)}</span>
                      </p>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        毎月の返済: {formatCurrency(debt.monthlyPayment)}
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl border border-emerald-100 shadow-sm">
                    💸
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-emerald-600">{formatCurrency(debt.paidAmount)} 返済済み</span>
                    <span className="text-stone-400">/ {formatCurrency(debt.totalAmount)}</span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                      {Math.round(progress)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
