import { useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Record } from './components/Record';
import { Balance } from './components/Balance';
import { Dreams } from './components/Dreams';
import { Future } from './components/Future';
import { AppState, Transaction } from './types';
import { useAuth } from './AuthContext';
import { Login, HouseholdSetup } from './components/Auth';
import { Loader2 } from 'lucide-react';

type Tab = 'home' | 'record' | 'balance' | 'dreams' | 'future';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { user, householdId, state, loading, updateState, addTransaction } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!householdId || !state) {
    return <HouseholdSetup />;
  }

  const handleAddTransaction = async (transaction: Transaction) => {
    await addTransaction(transaction);
  };

  const handleUpdateState = async (newState: AppState) => {
    await updateState(newState);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} state={state} onUpdateState={handleUpdateState}>
      {activeTab === 'home' && <Home state={state} />}
      {activeTab === 'record' && <Record state={state} onAddTransaction={handleAddTransaction} />}
      {activeTab === 'balance' && <Balance state={state} />}
      {activeTab === 'dreams' && <Dreams state={state} />}
      {activeTab === 'future' && <Future state={state} />}
    </Layout>
  );
}
