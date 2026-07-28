import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, Receipt, Settings2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Sidebar({ screen, setScreen }) {
  const { logout } = useAuth();
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Productos', icon: Package },
    { key: 'pos', label: 'Punto de venta', icon: ShoppingCart },
    { key: 'sales', label: 'Ventas', icon: Receipt },
    { key: 'orders', label: 'Pedidos', icon: Truck },
    { key: 'settings', label: 'Configuración', icon: Settings2 },
  ];
  return (
    <aside className="w-56 shrink-0 bg-[#0B0B0C] border-r border-[#2A2A2E] flex flex-col h-screen sticky top-0">
      <div className="px-5 pt-6 pb-5">
        <div className="font-display text-xl text-[#F2F1ED] leading-none">VENTAS</div>
        <div className="font-display text-xl text-[#E8FF4D] leading-none">OVER IT</div>
      </div>
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setScreen(key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
              screen === key ? 'bg-[#1F1F23] text-[#F2F1ED] border border-[#2A2A2E]' : 'text-[#8A8A8F] hover:text-[#F2F1ED] hover:bg-[#17171A] border border-transparent'
            }`}>
            <Icon size={16} className={screen === key ? 'text-[#E8FF4D]' : ''} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 pb-5">
        <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-[#8A8A8F] hover:text-[#FF6B57] hover:bg-[#17171A]">
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
