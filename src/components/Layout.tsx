import { ReactNode, useState } from 'react';
import { Home, PenLine, Star, TrendingUp, PieChart, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Settings } from './Settings';
import { AppState } from '../types';

type Tab = 'home' | 'record' | 'balance' | 'dreams' | 'future';

interface LayoutProps {
  children: ReactNode;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  state: AppState;
  onUpdateState: (newState: AppState) => void;
}

export function Layout({ children, activeTab, onTabChange, state, onUpdateState }: LayoutProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const tabs = [
    { id: 'home', label: 'ホーム', icon: Home },
    { id: 'record', label: 'きろく', icon: PenLine },
    { id: 'balance', label: '収支', icon: PieChart },
    { id: 'dreams', label: 'ゆめ', icon: Star },
    { id: 'future', label: 'みらい', icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-800 font-sans flex flex-col max-w-md mx-auto shadow-xl overflow-hidden relative">
      <header className="bg-white px-6 py-5 shadow-sm z-10 sticky top-0 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-orange-500 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 fill-orange-500" />
            幸せ家族家計アプリ
          </h1>
          <p className="text-xs text-stone-500 mt-1">未来をワクワク描こう</p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-full transition-colors"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {children}
      </main>

      <nav className="bg-white border-t border-stone-100 fixed bottom-0 w-full max-w-md pb-safe pt-2 px-2 flex justify-between items-center z-20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300',
                isActive
                  ? 'text-orange-600 bg-orange-50 scale-105'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              )}
            >
              <Icon className={cn('w-6 h-6 mb-1', isActive && 'fill-orange-100')} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {isSettingsOpen && (
        <Settings
          state={state}
          onUpdateState={onUpdateState}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
