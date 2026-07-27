import React, { useState } from 'react';
import { X, Lock, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const EMAIL_DOMAIN = 'ventasoverit.com';

export default function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = username.includes('@') ? username : `${username}@${EMAIL_DOMAIN}`;
      await login(email, password);
      onClose();
    } catch {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-[#F2F1ED]">Ingresar</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 focus-within:border-[#E8FF4D]">
            <User size={14} className="text-[#8A8A8F] shrink-0" />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario"
              className="bg-transparent outline-none text-sm text-[#F2F1ED] w-full placeholder:text-[#4A4A4E]" />
          </div>
          <div className="flex items-center gap-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 focus-within:border-[#E8FF4D]">
            <Lock size={14} className="text-[#8A8A8F] shrink-0" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
              className="bg-transparent outline-none text-sm text-[#F2F1ED] w-full placeholder:text-[#4A4A4E]" />
          </div>
          {error && <p className="text-[#FF6B57] text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2 hover:bg-[#f2ff85] disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
