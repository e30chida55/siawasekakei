import { AppState } from '../types';
import { differenceInYears } from 'date-fns';
import { formatCurrency } from '../lib/utils';
import { Heart, Star, TrendingUp, Wallet } from 'lucide-react';

interface HomeProps {
  state: AppState;
}

export function Home({ state }: HomeProps) {
  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const totalDreamTarget = state.dreams.reduce((sum, d) => sum + d.targetAmount, 0);
  const totalDreamCurrent = state.dreams.reduce((sum, d) => sum + d.currentAmount, 0);
  const dreamProgress = totalDreamTarget > 0 ? (totalDreamCurrent / totalDreamTarget) * 100 : 0;

  const totalDebt = state.debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtPaid = state.debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const debtProgress = totalDebt > 0 ? (totalDebtPaid / totalDebt) * 100 : 0;

  const happyTransactions = state.transactions.filter(t => t.isHappy).slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Family Section */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
        <h2 className="text-sm font-bold text-stone-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          わたしたちの家族
        </h2>
        <div className="flex justify-around items-end">
          {state.family.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                {member.role === 'parent' ? (member.name === 'パパ' ? '👨' : '👩') : '👶'}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-stone-700">{member.name}</p>
                <p className="text-xs text-stone-500">{calculateAge(member.birthDate)}歳</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Progress Section */}
      <section className="grid grid-cols-1 gap-4">
        {/* Dream Progress */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-5 shadow-sm border border-orange-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="w-24 h-24 text-orange-500" />
          </div>
          <h2 className="text-sm font-bold text-orange-600 mb-1 flex items-center gap-2">
            <Star className="w-4 h-4" />
            夢への道のり
          </h2>
          <p className="text-2xl font-black text-stone-800 mb-4">
            {Math.round(dreamProgress)}<span className="text-lg font-medium text-stone-500">%</span>
          </p>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${dreamProgress}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 mt-2 text-right">
            {formatCurrency(totalDreamCurrent)} / {formatCurrency(totalDreamTarget)}
          </p>
        </div>

        {/* Debt Freedom Progress */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-5 shadow-sm border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-emerald-500" />
          </div>
          <h2 className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            借金からの解放度
          </h2>
          <p className="text-2xl font-black text-stone-800 mb-4">
            {Math.round(debtProgress)}<span className="text-lg font-medium text-stone-500">%</span>
          </p>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${debtProgress}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 mt-2 text-right">
            残り {formatCurrency(totalDebt - totalDebtPaid)}
          </p>
        </div>
      </section>

      {/* Happy Spending */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
        <h2 className="text-sm font-bold text-stone-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-400" />
          最近の「よかった」お金の使い方
        </h2>
        <div className="space-y-3">
          {happyTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                  ✨
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-700">{t.memo}</p>
                  <p className="text-xs text-stone-400">{t.date}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-stone-600">{formatCurrency(t.amount)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
