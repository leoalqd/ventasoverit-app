import React, { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { createOrder } from '../lib/storefront';
import { useCart } from '../lib/CartContext';

function CheckoutForm({ cart, onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', dni: '', address: '', city: '', province: '', postalCode: '', phone: '', email: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const order = await createOrder(form, cart);
      onSuccess(order);
    } catch (err) {
      setError('No pudimos registrar el pedido. Probá de nuevo en unos minutos.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-[#F2F1ED]">Finalizar compra</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
        </div>
        <p className="text-xs text-[#8A8A8F] mb-4 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2">
          No hay pago online. Al confirmar, tu pedido queda pendiente y nos comunicamos con vos para coordinar el pago (transferencia o link de pago).
        </p>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <input required placeholder="Nombre" value={form.firstName} onChange={set('firstName')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Apellido" value={form.lastName} onChange={set('lastName')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="DNI" value={form.dni} onChange={set('dni')}
            className="col-span-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Dirección" value={form.address} onChange={set('address')}
            className="col-span-2 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Ciudad" value={form.city} onChange={set('city')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Provincia" value={form.province} onChange={set('province')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Código Postal" value={form.postalCode} onChange={set('postalCode')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required placeholder="Teléfono" value={form.phone} onChange={set('phone')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required type="email" placeholder="Email" value={form.email} onChange={set('email')}
            className="col-span-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />

          {error && <p className="col-span-2 text-[#FF6B57] text-sm">{error}</p>}

          <button type="submit" disabled={saving}
            className="col-span-2 mt-2 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 hover:bg-[#f2ff85] disabled:opacity-50">
            {saving ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </form>
      </div>
    </div>
  );
}

function OrderConfirmation({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-sm text-center">
        <h3 className="font-display text-2xl text-[#E8FF4D] mb-2">¡Pedido recibido!</h3>
        <p className="text-sm text-[#F2F1ED] mb-1">Tu número de pedido es:</p>
        <p className="font-mono text-lg text-[#F2F1ED] mb-4">{order.reference_code}</p>
        <p className="text-xs text-[#8A8A8F] mb-5">
          Nos vamos a comunicar para coordinar el pago (transferencia o link de pago). Guardá este número por las dudas.
        </p>
        <button onClick={onClose} className="bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded px-5 py-2.5">
          Seguir viendo productos
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, changeQty, removeItem, clearCart, subtotal } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!cartOpen && !checkoutOpen && !confirmedOrder) return null;

  return (
    <>
      {cartOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-end z-40" onClick={() => setCartOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-[#17171A] border-l border-[#2A2A2E] w-full max-w-sm h-full p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-[#F2F1ED]">Tu carrito</h3>
              <button onClick={() => setCartOpen(false)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3">
              {cart.length === 0 && <p className="text-sm text-[#8A8A8F]">Todavía no agregaste productos.</p>}
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#F2F1ED] truncate">{i.productName}</div>
                    <div className="text-xs text-[#8A8A8F] font-mono">{i.color} · {i.size}</div>
                  </div>
                  <button onClick={() => changeQty(i.id, -1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Minus size={13} /></button>
                  <span className="font-mono text-sm text-[#F2F1ED] w-4 text-center">{i.qty}</span>
                  <button onClick={() => changeQty(i.id, 1)} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><Plus size={13} /></button>
                  <button onClick={() => removeItem(i.id)} className="text-[#8A8A8F] hover:text-[#FF6B57] ml-1"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
            <div className="border-t border-[#2A2A2E] pt-3 mt-3">
              <div className="flex justify-between text-[#F2F1ED] font-medium mb-3">
                <span>Total</span>
                <span className="font-mono">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <button disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}
                className="w-full bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 disabled:opacity-50">
                Finalizar compra
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <CheckoutForm
          cart={cart}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={(order) => {
            setCheckoutOpen(false);
            setCartOpen(false);
            clearCart();
            setConfirmedOrder(order);
          }}
        />
      )}

      {confirmedOrder && <OrderConfirmation order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />}
    </>
  );
}
