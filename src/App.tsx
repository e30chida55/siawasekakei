import { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Record } from './components/Record';
import { Balance } from './components/Balance';
import { Dreams } from './components/Dreams';
import { Future } from './components/Future';
import { initialData } from './data';
import { AppState, Transaction } from './types';

type Tab = 'home' | 'record' | 'balance' | 'dreams' | 'future';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [state, setState] = useState<AppState>(initialData);

  const handleAddTransaction = (transaction: Transaction) => {
    setState((prev) => {
      const newState = { ...prev };
      newState.transactions = [transaction, ...prev.transactions];

      // Update debt or dream progress if applicable
      if (transaction.type === 'debt_payment') {
        newState.debts = prev.debts.map(d => ({
          ...d,
          paidAmount: d.paidAmount + d.monthlyPayment
        }));
      } else if (transaction.type === 'dream_saving' && transaction.targetId) {
        newState.dreams = prev.dreams.map(d =>
          d.id === transaction.targetId
            ? { ...d, currentAmount: d.currentAmount + transaction.amount }
            : d
        );
      }

      return newState;
    });
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} state={state} onUpdateState={setState}>
      {activeTab === 'home' && <Home state={state} />}
      {activeTab === 'record' && <Record state={state} onAddTransaction={handleAddTransaction} />}
      {activeTab === 'balance' && <Balance state={state} />}
      {activeTab === 'dreams' && <Dreams state={state} />}
      {activeTab === 'future' && <Future state={state} />}
    </Layout>
  );
}
