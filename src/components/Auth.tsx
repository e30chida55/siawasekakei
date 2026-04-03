import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { LogIn, Users, Plus } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">家族の家計簿</h1>
        <p className="text-gray-500 mb-8">夫婦で一緒に管理して、夢を叶えよう</p>
        
        <button
          onClick={login}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Googleでログイン
        </button>
      </div>
    </div>
  );
};

export const HouseholdSetup: React.FC = () => {
  const { createHousehold, joinHousehold, logout } = useAuth();
  const [joinId, setJoinId] = useState('');

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">家族の設定</h2>
        
        <div className="space-y-6">
          <div className="bg-rose-50 p-6 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-500" />
              新しく始める
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              新しく家計簿を作成し、パートナーを招待します。
            </p>
            <button
              onClick={createHousehold}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              新しい家計簿を作成
            </button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">または</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              パートナーの家計簿に参加
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              パートナーから共有されたIDを入力してください。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="招待ID"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={() => joinHousehold(joinId)}
                disabled={!joinId}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                参加
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={logout} className="text-gray-500 hover:text-gray-700 text-sm underline">
            ログアウト
          </button>
        </div>
      </div>
    </div>
  );
};
