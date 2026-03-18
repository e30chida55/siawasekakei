import { AppState } from '../types';
import { differenceInYears } from 'date-fns';
import { Calendar, Star, TrendingUp, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface FutureProps {
  state: AppState;
}

export function Future({ state }: FutureProps) {
  const currentYear = new Date().getFullYear();
  const timelineYears = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const calculateAgeInYear = (birthDate: string, targetYear: number) => {
    const birthYear = new Date(birthDate).getFullYear();
    return targetYear - birthYear;
  };

  const totalDebt = state.debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtPaid = state.debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const remainingDebt = totalDebt - totalDebtPaid;
  
  // Calculate based on actual monthly payments set in settings
  const totalMonthlyPayment = state.debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const annualPayment = totalMonthlyPayment * 12;
  const yearsToPayOff = annualPayment > 0 ? Math.max(1, Math.ceil(remainingDebt / annualPayment)) : 0;
  const debtFreeYear = remainingDebt > 0 && annualPayment > 0 ? currentYear + yearsToPayOff : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-8">
        <Calendar className="w-6 h-6 text-indigo-500" />
        <h2 className="text-xl font-bold text-stone-800">未来のタイムライン</h2>
      </div>

      <div className="relative border-l-2 border-stone-200 ml-4 space-y-8 pb-8">
        {timelineYears.map((year, index) => {
          const isCurrentYear = year === currentYear;
          const dreamsInYear = state.dreams.filter((d) => d.targetYear === year);
          const isDebtFreeYear = year === debtFreeYear;

          return (
            <div key={year} className="relative pl-6">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm',
                  isCurrentYear ? 'bg-orange-500 w-5 h-5 -left-[11px] -top-0.5' : 'bg-stone-300'
                )}
              />

              <div className="mb-2">
                <span className={cn('text-lg font-black', isCurrentYear ? 'text-orange-600' : 'text-stone-600')}>
                  {year}年
                </span>
                {isCurrentYear && <span className="ml-2 text-xs font-bold text-orange-400 bg-orange-100 px-2 py-0.5 rounded-full">現在</span>}
              </div>

              <div className="space-y-3">
                {/* Family Ages */}
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 flex flex-wrap gap-3">
                  {state.family.map((member) => {
                    const age = calculateAgeInYear(member.birthDate, year);
                    if (age < 0) return null; // Not born yet
                    return (
                      <div key={member.id} className="flex items-center gap-1.5">
                        <span className="text-sm">{member.role === 'parent' ? (member.name === 'パパ' ? '👨' : '👩') : '👶'}</span>
                        <span className="text-xs font-bold text-stone-600">
                          {member.name} {age}歳
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Dreams */}
                {dreamsInYear.map((dream) => (
                  <div key={dream.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-3 shadow-sm border border-yellow-100 flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-xl">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-yellow-600 mb-0.5">夢の実現予定！</p>
                      <p className="text-sm font-bold text-stone-800">{dream.title}</p>
                    </div>
                  </div>
                ))}

                {/* Debt Free Milestone */}
                {isDebtFreeYear && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-3 shadow-sm border border-emerald-100 flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600 mb-0.5">マイルストーン</p>
                      <p className="text-sm font-bold text-stone-800">借金完済予定！🎉</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
