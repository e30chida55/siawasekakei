import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, onSnapshot, collection, query, orderBy, deleteField } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AppState, Transaction } from './types';
import { initialData } from './data';

interface AuthContextType {
  user: User | null;
  householdId: string | null;
  state: AppState | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  createHousehold: () => Promise<void>;
  joinHousehold: (id: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  updateState: (newState: AppState) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Check if user has a household
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setHouseholdId(userDoc.data().householdId);
          } else {
            // Create user doc
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              householdId: '',
              createdAt: new Date().toISOString()
            });
            setHouseholdId('');
          }
        } else {
          setHouseholdId(null);
          setState(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!householdId) {
      setState(null);
      return;
    }

    // Subscribe to household data
    const unsubscribeHousehold = onSnapshot(doc(db, 'households', householdId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setState(prevState => ({
          family: data.family || [],
          dreams: data.dreams || [],
          debts: data.debts || [],
          fixedExpenses: data.fixedExpenses || [],
          fixedIncomes: data.fixedIncomes || [],
          transactions: prevState?.transactions || []
        }));
      }
    });

    // Subscribe to transactions
    const q = query(collection(db, `households/${householdId}/transactions`), orderBy('date', 'desc'));
    let isFirstLoad = true;
    const unsubscribeTransactions = onSnapshot(q, async (snapshot) => {
      const transactions = snapshot.docs.map(doc => doc.data() as Transaction);
      setState(prevState => {
        if (!prevState) return null;
        return { ...prevState, transactions };
      });

      // 初回ロード時のみ自動返済処理を実行
      if (isFirstLoad) {
        isFirstLoad = false;
        
        try {
          const householdDoc = await getDoc(doc(db, 'households', householdId));
          if (householdDoc.exists()) {
            const data = householdDoc.data();
            let debts = data.debts || [];
            let debtsUpdated = false;

            // 重複した「車の返済」を削除する処理 (1回限りのクリーンアップ)
            const carLoanIndex = debts.findIndex((d: any) => d.id === 'car_loan' && d.title === '車の返済');
            if (carLoanIndex !== -1) {
              debts.splice(carLoanIndex, 1);
              debtsUpdated = true;
              
              // 自動生成された取引も削除
              const autoTxsToDelete = transactions.filter(t => t.type === 'debt_payment' && t.targetId === 'car_loan' && t.id.startsWith('auto_car_loan_'));
              for (const tx of autoTxsToDelete) {
                await deleteDoc(doc(db, `households/${householdId}/transactions`, tx.id));
              }
            }

            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentDate = today.getDate();

            // 2026年1月から現在の月までの25日をチェック
            const monthsToCheck = [];
            for (let m = 1; m <= currentMonth; m++) {
              if (m === currentMonth && currentDate < 25) continue;
              const dateStr = `${currentYear}-${m.toString().padStart(2, '0')}-25`;
              monthsToCheck.push(dateStr);
            }

            let newTransactions: any[] = [];

            for (let i = 0; i < debts.length; i++) {
              const debt = debts[i];
              if (!debt.monthlyPayment || debt.monthlyPayment <= 0) continue;

              for (const dateStr of monthsToCheck) {
                const hasTransaction = transactions.some(t => t.type === 'debt_payment' && t.targetId === debt.id && t.date === dateStr);
                if (!hasTransaction) {
                  const newTx = {
                    id: `auto_${debt.id}_${dateStr}`,
                    householdId,
                    date: dateStr,
                    amount: debt.monthlyPayment,
                    type: 'debt_payment',
                    memo: `${debt.title}の自動返済`,
                    isHappy: false,
                    targetId: debt.id,
                    createdAt: new Date().toISOString()
                  };
                  newTransactions.push(newTx);
                  
                  debts[i] = {
                    ...debts[i],
                    paidAmount: debts[i].paidAmount + debt.monthlyPayment
                  };
                  debtsUpdated = true;
                }
              }
            }

            if (newTransactions.length > 0) {
              for (const tx of newTransactions) {
                await setDoc(doc(db, `households/${householdId}/transactions`, tx.id), tx);
              }
            }
            if (debtsUpdated) {
              await updateDoc(doc(db, 'households', householdId), { debts });
            }
          }
        } catch (error) {
          console.error("Error processing auto payments:", error);
        }
      }
    });

    return () => {
      unsubscribeHousehold();
      unsubscribeTransactions();
    };
  }, [householdId]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const createHousehold = async () => {
    if (!user) return;
    const newHouseholdId = Math.random().toString(36).substring(2, 10);
    
    // Create household with initial data
    await setDoc(doc(db, 'households', newHouseholdId), {
      id: newHouseholdId,
      members: [user.uid],
      family: initialData.family,
      dreams: initialData.dreams,
      debts: initialData.debts,
      fixedExpenses: initialData.fixedExpenses,
      fixedIncomes: [],
      createdAt: new Date().toISOString()
    });

    // Update user doc
    await updateDoc(doc(db, 'users', user.uid), {
      householdId: newHouseholdId
    });

    setHouseholdId(newHouseholdId);
  };

  const joinHousehold = async (id: string) => {
    if (!user) return;
    
    try {
      // Check if household exists
      const householdDoc = await getDoc(doc(db, 'households', id));
      if (!householdDoc.exists()) {
        alert('入力されたIDの家計簿が見つかりません。');
        return;
      }

      // Add user to household members
      await updateDoc(doc(db, 'households', id), {
        members: arrayUnion(user.uid)
      });

      // Update user doc
      await updateDoc(doc(db, 'users', user.uid), {
        householdId: id
      });

      setHouseholdId(id);
    } catch (error) {
      console.error("Error joining household:", error);
      alert('参加に失敗しました。IDが正しいか確認してください。');
    }
  };

  const leaveHousehold = async () => {
    if (!user || !householdId) return;
    
    try {
      // Remove user from household members
      await updateDoc(doc(db, 'households', householdId), {
        members: arrayRemove(user.uid)
      });

      // Update user doc to remove householdId
      await updateDoc(doc(db, 'users', user.uid), {
        householdId: ''
      });

      setHouseholdId('');
      setState(null);
    } catch (error) {
      console.error("Error leaving household:", error);
      alert('家計簿からの退出に失敗しました。');
    }
  };

  const updateState = async (newState: AppState) => {
    if (!householdId) return;
    
    // Update household doc (excluding transactions)
    await updateDoc(doc(db, 'households', householdId), {
      family: newState.family,
      dreams: newState.dreams,
      debts: newState.debts,
      fixedExpenses: newState.fixedExpenses
    });
  };

  const addTransaction = async (transaction: Transaction) => {
    if (!householdId) return;
    
    try {
      const newTxData: any = {
        id: transaction.id,
        householdId,
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type,
        memo: transaction.memo || '',
        isHappy: transaction.isHappy ?? false,
        createdAt: new Date().toISOString()
      };
      if (transaction.category) newTxData.category = transaction.category;
      if (transaction.targetId) newTxData.targetId = transaction.targetId;

      // Add transaction to subcollection
      await setDoc(doc(db, `households/${householdId}/transactions`, transaction.id), newTxData);

      // Update debt or dream progress if applicable
      if (state) {
        if (transaction.type === 'debt_payment' && transaction.targetId) {
          const newDebts = state.debts.map(d => 
            d.id === transaction.targetId
              ? { ...d, paidAmount: d.paidAmount + transaction.amount }
              : d
          );
          await updateDoc(doc(db, 'households', householdId), { debts: newDebts });
        } else if (transaction.type === 'dream_saving' && transaction.targetId) {
          const newDreams = state.dreams.map(d =>
            d.id === transaction.targetId
              ? { ...d, currentAmount: d.currentAmount + transaction.amount }
              : d
          );
          await updateDoc(doc(db, 'households', householdId), { dreams: newDreams });
        }
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("記録の保存に失敗しました。");
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!householdId || !state) return;
    
    try {
      const oldTransaction = state.transactions.find(t => t.id === updatedTransaction.id);
      if (!oldTransaction) return;

      const oldTx: any = oldTransaction;
      const upTx: any = updatedTransaction;

      const updateData: any = {
        id: upTx.id,
        householdId: upTx.householdId || householdId,
        date: upTx.date,
        amount: upTx.amount,
        type: upTx.type,
        memo: upTx.memo || '',
        isHappy: upTx.isHappy ?? false,
        createdAt: upTx.createdAt || oldTx.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (upTx.type === 'income' && upTx.category) {
        updateData.category = upTx.category;
      } else if (oldTx.category) {
        updateData.category = deleteField();
      }
      
      if ((upTx.type === 'debt_payment' || upTx.type === 'dream_saving') && upTx.targetId) {
        updateData.targetId = upTx.targetId;
      } else if (oldTx.targetId) {
        updateData.targetId = deleteField();
      }

      // Update transaction in subcollection
      await updateDoc(doc(db, `households/${householdId}/transactions`, updatedTransaction.id), updateData);

      // Handle changes to debt or dream progress
      let newDebts = [...state.debts];
      let newDreams = [...state.dreams];
      let needsUpdate = false;

      // Revert old transaction
      if (oldTransaction.type === 'debt_payment' && oldTransaction.targetId) {
        newDebts = newDebts.map(d => 
          d.id === oldTransaction.targetId ? { ...d, paidAmount: d.paidAmount - oldTransaction.amount } : d
        );
        needsUpdate = true;
      } else if (oldTransaction.type === 'dream_saving' && oldTransaction.targetId) {
        newDreams = newDreams.map(d =>
          d.id === oldTransaction.targetId ? { ...d, currentAmount: d.currentAmount - oldTransaction.amount } : d
        );
        needsUpdate = true;
      }

      // Apply new transaction
      if (updatedTransaction.type === 'debt_payment' && updatedTransaction.targetId) {
        newDebts = newDebts.map(d => 
          d.id === updatedTransaction.targetId ? { ...d, paidAmount: d.paidAmount + updatedTransaction.amount } : d
        );
        needsUpdate = true;
      } else if (updatedTransaction.type === 'dream_saving' && updatedTransaction.targetId) {
        newDreams = newDreams.map(d =>
          d.id === updatedTransaction.targetId ? { ...d, currentAmount: d.currentAmount + updatedTransaction.amount } : d
        );
        needsUpdate = true;
      }

      if (needsUpdate) {
        await updateDoc(doc(db, 'households', householdId), { debts: newDebts, dreams: newDreams });
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("記録の更新に失敗しました。");
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!householdId || !state) return;
    
    try {
      const transaction = state.transactions.find(t => t.id === id);
      if (!transaction) return;

      // Delete transaction from subcollection
      await deleteDoc(doc(db, `households/${householdId}/transactions`, id));

      // Revert debt or dream progress if applicable
      if (transaction.type === 'debt_payment' && transaction.targetId) {
        const newDebts = state.debts.map(d => 
          d.id === transaction.targetId
            ? { ...d, paidAmount: d.paidAmount - transaction.amount }
            : d
        );
        await updateDoc(doc(db, 'households', householdId), { debts: newDebts });
      } else if (transaction.type === 'dream_saving' && transaction.targetId) {
        const newDreams = state.dreams.map(d =>
          d.id === transaction.targetId
            ? { ...d, currentAmount: d.currentAmount - transaction.amount }
            : d
        );
        await updateDoc(doc(db, 'households', householdId), { dreams: newDreams });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("記録の削除に失敗しました。");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, householdId, state, loading, login, logout, createHousehold, joinHousehold, leaveHousehold, updateState, addTransaction, updateTransaction, deleteTransaction }}>
      {children}
    </AuthContext.Provider>
  );
};
