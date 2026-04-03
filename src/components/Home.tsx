import { AppState } from '../types';
import { differenceInYears, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { formatCurrency, cn } from '../lib/utils';
import { Heart, Star, TrendingUp, Wallet, Gift, MessageCircleHeart, Download, PieChart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';

interface HomeProps {
  state: AppState;
}

export function Home({ state }: HomeProps) {
  const calculateAge = (birthDate: string) => {
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const today = new Date();
  const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const birthdayMembers = useMemo(() => {
    return state.family.filter(member => {
      if (!member.birthDate) return false;
      const [, month, day] = member.birthDate.split('-');
      return `${month}-${day}` === todayMonthDay;
    });
  }, [state.family, todayMonthDay]);

  useEffect(() => {
    if (birthdayMembers.length > 0) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [birthdayMembers.length]);

  const totalDreamTarget = state.dreams.reduce((sum, d) => sum + d.targetAmount, 0);
  const totalDreamCurrent = state.dreams.reduce((sum, d) => sum + d.currentAmount, 0);
  const dreamProgress = totalDreamTarget > 0 ? (totalDreamCurrent / totalDreamTarget) * 100 : 0;

  const totalDebt = state.debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalDebtPaid = state.debts.reduce((sum, d) => sum + d.paidAmount, 0);
  const debtProgress = totalDebt > 0 ? (totalDebtPaid / totalDebt) * 100 : 0;

  const happyTransactions = state.transactions.filter(t => t.isHappy && t.type !== 'income').slice(0, 3);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = state.transactions.filter(t => t.date.startsWith(currentMonth));
  
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  // 固定費も含める
  const totalFixedExpenses = (state.fixedExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0) + 
                             (state.debts?.reduce((sum, d) => sum + d.monthlyPayment, 0) || 0);
  
  const totalMonthlyExpenses = monthlyExpenses + totalFixedExpenses;
  const monthlyBalance = monthlyIncome - totalMonthlyExpenses;

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
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `家計簿_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Insight Message
  const insightMessage = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const thisWeekTxs = state.transactions.filter(t => {
      const txDate = new Date(t.date);
      return isWithinInterval(txDate, { start: weekStart, end: weekEnd });
    });

    const thisWeekFood = thisWeekTxs
      .filter(t => t.type === 'expense_food')
      .reduce((sum, t) => sum + t.amount, 0);

    const thisWeekHappyCount = thisWeekTxs.filter(t => t.isHappy && t.type !== 'income').length;
    const thisWeekExpenseCount = thisWeekTxs.filter(t => t.type.startsWith('expense')).length;

    const messages = [];

    // 日替わりの前向きなコメント
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const positiveComments = [
      '今日もお疲れ様です！家計と向き合っていて素晴らしいですね✨',
      '少し使いすぎたかな？と思っても大丈夫。気づけたことが第一歩です😊',
      '毎日の記録が、未来のゆとりにつながっていますよ🌱',
      'お金を使うことは、人生を楽しむこと。メリハリをつけていきましょう！🎉',
      '完璧じゃなくてOK！自分のペースで家計管理を続けていきましょう💪',
      '家族のための支出は、かけがえのない投資です。今日も笑顔で過ごせますように🌻',
      '少しの節約も、積み重なれば大きな力になります。焦らずいきましょう🐢'
    ];
    messages.push(positiveComments[dayOfYear % positiveComments.length]);

    // 今週の状況に応じた前向きなフィードバック
    if (thisWeekFood > 15000) {
      messages.push('今週は美味しいものをたくさん楽しめましたね🍔 家族の笑顔が増えたはず！');
    } else if (thisWeekFood > 0) {
      messages.push('今週の食費はいいペースです🥗 自炊がんばってますね！');
    }

    if (thisWeekHappyCount > 0 && thisWeekExpenseCount > 0) {
      if (thisWeekHappyCount / thisWeekExpenseCount >= 0.5) {
        messages.push('“満足”な使い方が多くて素敵です😊 お金が喜んでますね✨');
      } else {
        messages.push('必要なものにしっかりお金を使えていますね。素晴らしい管理です👍');
      }
    } else if (thisWeekExpenseCount === 0) {
      messages.push('まだ今週の支出はありません。素晴らしいスタートです！🌟');
    }

    // 1日1回のお金に関するためになる話
    const financialTips = [
      '【今日のお金の話】「ラテマネー」って知っていますか？毎日の何気ない少額の出費（カフェ代など）のこと。これを見直すだけで、意外と大きな節約になりますよ☕️',
      '【今日のお金の話】「先取り貯金」が貯金の鉄則！お給料が入ったら、使う前にまず貯金分を別の口座に移してしまうのが一番確実です💰',
      '【今日のお金の話】「固定費の見直し」は節約の王道。スマホ代やサブスクなど、一度見直せば毎月自動的に節約効果が続きます📱',
      '【今日のお金の話】「複利の力」はアインシュタインも絶賛した人類最大の発明。少額でも長く運用することで、雪だるま式にお金が増えていきます⛄️',
      '【今日のお金の話】買い物で迷ったら「24時間ルール」。欲しいと思っても1日待ってみると、本当に必要かどうか冷静に判断できますよ🕰️',
      '【今日のお金の話】「自己投資」は最高のリターンを生む投資。本を読んだりスキルを磨いたり、自分自身にお金を使うことも大切です📚',
      '【今日のお金の話】「予算を立てる」ことで、お金に対する不安が減ります。何にいくら使えるかが見えると、心置きなくお金を使えますよ✨',
      '【今日のお金の話】「ノーマネーデー（お金を使わない日）」を週に1日作ってみませんか？ゲーム感覚で節約を楽しめますよ🎮',
      '【今日のお金の話】「クレジットカードは一括払い」が基本。リボ払いや分割払いは手数料が高くつくので、なるべく避けましょう💳',
      '【今日のお金の話】「家計簿は完璧を目指さない」。ざっくりでも続けることが一番大切です。このアプリを開いただけで100点満点！💯'
    ];
    messages.push(financialTips[dayOfYear % financialTips.length]);

    return messages;
  }, [state.transactions]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Insight Message Bubble */}
      <div className="bg-orange-50 rounded-3xl p-5 shadow-sm border border-orange-100 flex gap-4 items-start relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <MessageCircleHeart className="w-24 h-24 text-orange-500" />
        </div>
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 z-10">
          <span className="text-2xl">🦉</span>
        </div>
        <div className="space-y-1 z-10 pt-1">
          {insightMessage.map((msg, idx) => (
            <p key={idx} className="text-sm font-bold text-stone-700 leading-relaxed">
              {msg}
            </p>
          ))}
        </div>
      </div>

      {birthdayMembers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-400 to-orange-400 rounded-3xl p-5 shadow-lg text-white animate-bounce">
          <div className="flex items-center justify-center gap-3">
            <Gift className="w-8 h-8" />
            <div>
              <p className="font-bold text-lg">
                {birthdayMembers.map(m => m.name).join('と')}、お誕生日おめでとう！🎉
              </p>
              <p className="text-sm opacity-90">素敵な1年になりますように✨</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Summary & CSV Export */}
      <section className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-orange-400" />
            今月のまとめ
          </h2>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV出力
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-stone-400 uppercase">現在の収支</p>
            <p className={cn("text-xl font-black tracking-tight", monthlyBalance >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {formatCurrency(monthlyBalance)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[10px] font-bold text-stone-400 uppercase">今月の支出合計</p>
            <p className="text-xl font-black text-stone-800 tracking-tight">
              {formatCurrency(totalMonthlyExpenses)}
            </p>
          </div>
        </div>
      </section>

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
                {member.role === 'parent' ? (member.name === 'パパ' || member.name === '大夢' ? '👨' : '👩') : '👶'}
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
                  <p className="text-sm font-bold text-stone-700">
                    {t.memo || (
                      t.type === 'expense_food' ? '食費' :
                      t.type === 'expense_daily' ? '日用品' :
                      t.type === 'dream_saving' ? '夢貯金' : 
                      t.type === 'income' ? (t.category || '収入') :
                      t.type === 'debt_payment' ? '借金返済' : 'その他'
                    )}
                  </p>
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
