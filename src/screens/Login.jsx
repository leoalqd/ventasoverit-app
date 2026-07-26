import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

// El panel usa "usuario" simple (ej: leoalqd), que se traduce a un email
// interno para Supabase Auth (ej: leoalqd@ventasoverit.com).
const EMAIL_DOMAIN = 'ventasoverit.com';

export default function Login() {
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
    } catch (err) {
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-display text-4xl text-[#F2F1ED] tracking-tight leading-none">VENTAS</div>
          <div className="font-display text-4xl text-[#E8FF4D] tracking-tight leading-none -mt-1">OVER IT</div>
          <p className="text-[#8A8A8F] text-sm mt-3 font-mono">Panel interno · stock &amp; ventas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Usuario</span>
            <div className="flex items-center gap-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2.5 focus-within:border-[#E8FF4D]">
              <User size={15} className="text-[#8A8A8F] shrink-0" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="leoalqd"
                className="bg-transparent outline-none text-[#F2F1ED] text-sm w-full placeholder:text-[#4A4A4E]"
              />
            </div>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Contraseña</span>
            <div className="flex items-center gap-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2.5 focus-within:border-[#E8FF4D]">
              <Lock size={15} className="text-[#8A8A8F] shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="bg-transparent outline-none text-[#F2F1ED] text-sm w-full placeholder:text-[#4A4A4E]"
              />
            </div>
          </label>

          {error && <p className="text-[#FF6B57] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 hover:bg-[#f2ff85] transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
