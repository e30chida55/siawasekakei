import { useState } from 'react';
import { AppState, FamilyMember, Dream, Debt } from '../types';
import { Settings as SettingsIcon, Users, Star, TrendingUp, Save, Plus, Trash2 } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onUpdateState: (newState: AppState) => void;
  onClose: () => void;
}

export function Settings({ state, onUpdateState, onClose }: SettingsProps) {
  const [family, setFamily] = useState<FamilyMember[]>(state.family);
  const [dreams, setDreams] = useState<Dream[]>(state.dreams);
  const [debts, setDebts] = useState<Debt[]>(state.debts);

  const handleSave = () => {
    onUpdateState({
      ...state,
      family,
      dreams,
      debts,
    });
    onClose();
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const newFamily = [...family];
    newFamily[index] = { ...newFamily[index], [field]: value };
    setFamily(newFamily);
  };

  const handleAddChild = () => {
    setFamily([
      ...family,
      {
        id: Date.now().toString(),
        name: '新しいこども',
        birthDate: new Date().toISOString().split('T')[0],
        role: 'child',
      },
    ]);
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFamily(family.filter((m) => m.id !== id));
  };

  const updateDream = (index: number, field: keyof Dream, value: string | number) => {
    const newDreams = [...dreams];
    newDreams[index] = { ...newDreams[index], [field]: value };
    setDreams(newDreams);
  };

  const updateDebt = (index: number, field: keyof Debt, value: string | number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    setDebts(newDebts);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-md mx-auto min-h-screen bg-[#fdfbf7] pb-24 relative">
        <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-stone-500" />
            家族の設定
          </h1>
          <button
            onClick={handleSave}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </header>

        <div className="p-4 space-y-8">
          {/* Family Settings */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h2 className="text-sm font-bold text-stone-500 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              家族構成と生年月日
            </h2>
            <div className="space-y-4">
              {family.map((member, index) => (
                <div key={member.id} className="flex gap-3 items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg shrink-0">
                    {member.role === 'parent' ? (member.name === 'パパ' ? '👨' : '👩') : '👶'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm font-bold text-stone-800"
                      placeholder="名前"
                    />
                    <input
                      type="date"
                      value={member.birthDate}
                      onChange={(e) => updateFamilyMember(index, 'birthDate', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-stone-600"
                    />
                  </div>
                  {member.role === 'child' && (
                    <button
                      onClick={() => handleRemoveFamilyMember(member.id)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddChild}
                className="w-full py-3 border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-50 hover:border-stone-300 transition-all"
              >
                <Plus className="w-4 h-4" />
                こどもを追加する
              </button>
            </div>
          </section>

          {/* Dreams Settings */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h2 className="text-sm font-bold text-stone-500 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" />
              夢・目標の設定
            </h2>
            <div className="space-y-4">
              {dreams.map((dream, index) => (
                <div key={dream.id} className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">目標名</label>
                    <input
                      type="text"
                      value={dream.title}
                      onChange={(e) => updateDream(index, 'title', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold text-stone-800"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-stone-500 mb-1 block">目標金額</label>
                      <input
                        type="number"
                        value={dream.targetAmount}
                        onChange={(e) => updateDream(index, 'targetAmount', Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs font-bold text-stone-500 mb-1 block">目標年</label>
                      <input
                        type="number"
                        value={dream.targetYear}
                        onChange={(e) => updateDream(index, 'targetYear', Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">期間</label>
                    <select
                      value={dream.term}
                      onChange={(e) => updateDream(index, 'term', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800"
                    >
                      <option value="short">短期（〜3年）</option>
                      <option value="long">長期（3年〜）</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Debts Settings */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
            <h2 className="text-sm font-bold text-stone-500 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              借金返済の設定
            </h2>
            <div className="space-y-4">
              {debts.map((debt, index) => (
                <div key={debt.id} className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 mb-1 block">借金名</label>
                    <input
                      type="text"
                      value={debt.title}
                      onChange={(e) => updateDebt(index, 'title', e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm font-bold text-stone-800"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-stone-500 mb-1 block">総額</label>
                      <input
                        type="number"
                        value={debt.totalAmount}
                        onChange={(e) => updateDebt(index, 'totalAmount', Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-stone-500 mb-1 block">毎月の返済額</label>
                      <input
                        type="number"
                        value={debt.monthlyPayment}
                        onChange={(e) => updateDebt(index, 'monthlyPayment', Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
