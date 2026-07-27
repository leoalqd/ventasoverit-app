import React, { useState } from 'react';
import { useAuth } from './lib/AuthContext';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Products from './screens/Products';
import Pos from './screens/Pos';
import Orders from './screens/Orders';
import SalesLog from './screens/SalesLog';
import Sidebar from './components/Sidebar';

export default function App() {
  const { session } = useAuth();
  const [screen, setScreen] = useState('dashboard');

  // session === undefined mientras Supabase todavía está chequeando si hay sesión activa.
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <p className="text-[#8A8A8F] text-sm font-mono">Cargando...</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="flex bg-[#0B0B0C] min-h-screen">
      <Sidebar screen={screen} setScreen={setScreen} />
      <main className="flex-1">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'products' && <Products />}
        {screen === 'pos' && <Pos />}
        {screen === 'orders' && <Orders />}
        {screen === 'sales' && <SalesLog />}
      </main>
    </div>
  );
}
