import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Settings, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import LoginModal from './LoginModal';
import CategoryMenu from './CategoryMenu';

export default function StoreHeader({ onSelectCategory }) {
  const { session, logout } = useAuth();
  const { cart, setCartOpen } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="border-b border-[#2A2A2E] sticky top-0 bg-[#0B0B0C] z-30">
      <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onSelectCategory && <CategoryMenu onSelect={onSelectCategory} />}
          <Link to="/" className="flex items-baseline gap-1.5">
            <span className="font-display text-sm text-[#F2F1ED] leading-none">VENTAS</span>
            <span className="font-display text-sm text-[#E8FF4D] leading-none">OVER IT</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/contacto" className="flex items-center gap-1 text-xs text-[#8A8A8F] hover:text-[#F2F1ED]">
            <Phone size={13} /> Contacto
          </Link>
          {session ? (
            <>
              <Link to="/panel" className="flex items-center gap-1 text-xs text-[#8A8A8F] hover:text-[#F2F1ED]">
                <Settings size={13} /> Panel
              </Link>
              <button onClick={logout} className="flex items-center gap-1 text-xs text-[#8A8A8F] hover:text-[#FF6B57]">
                <LogOut size={13} /> Salir
              </button>
            </>
          ) : (
            <button onClick={() => setLoginOpen(true)} className="flex items-center gap-1 text-xs text-[#8A8A8F] hover:text-[#F2F1ED] border border-[#2A2A2E] rounded px-2 py-1">
              <User size={12} /> Ingresar
            </button>
          )}
          <button onClick={() => setCartOpen(true)} className="relative text-[#F2F1ED]">
            <ShoppingBag size={18} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#E8FF4D] text-[#0B0B0C] text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </header>
  );
}
