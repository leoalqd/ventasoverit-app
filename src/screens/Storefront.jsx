import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus, Trash2, User, Settings, LogOut, Phone, Search } from 'lucide-react';
import { fetchPublicCatalog, createOrder } from '../lib/storefront';
import { fetchCategoryTree } from '../lib/categories';
import { useAuth } from '../lib/AuthContext';
import LoginModal from '../components/LoginModal';
import BannerSection from '../components/BannerSection';
import CategoryMenu from '../components/CategoryMenu';
import ProductCard from '../components/ProductCard';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

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

export default function Storefront() {
  const { session, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    fetchPublicCatalog().then(setProducts).catch(console.error).finally(() => setLoading(false));
    fetchCategoryTree().then(setCategoryTree).catch(console.error);
  }, []);

  const matchingCategoryIds = useMemo(() => {
    if (!categoryId) return null;
    const root = categoryTree.find((r) => r.id === categoryId);
    if (root) return [root.id, ...root.subcategories.map((s) => s.id)];
    return [categoryId];
  }, [categoryId, categoryTree]);

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !matchingCategoryIds || matchingCategoryIds.includes(p.category?.id);
    const matchesPrice = !maxPrice || Number(p.sale_price) <= Number(maxPrice);
    return matchesQuery && matchesCategory && matchesPrice;
  });

  const addToCart = (product, variant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === variant.id);
      if (existing) return prev.map((i) => (i.id === variant.id ? { ...i, qty: Math.min(i.qty + 1, variant.stock) } : i));
      return [...prev, { id: variant.id, productName: product.name, color: variant.color, size: variant.size, price: Number(product.sale_price), qty: 1, stock: variant.stock }];
    });
    setCartOpen(true);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) } : i)));
  };
  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Barra de menú chica: logo, y a la derecha login (o panel/salir si ya está logueado) + carrito */}
      <header className="border-b border-[#2A2A2E] sticky top-0 bg-[#0B0B0C] z-30">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryMenu onSelect={setCategoryId} />
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-sm text-[#F2F1ED] leading-none">VENTAS</span>
              <span className="font-display text-sm text-[#E8FF4D] leading-none">OVER IT</span>
            </div>
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
      </header>

      <BannerSection section="hero_top" aspect="aspect-[21/9]" />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <h2 className="font-display text-lg text-[#F2F1ED] mb-3">Ofertas</h2>
      </div>
      <BannerSection section="carousel" aspect="aspect-[3/1]" />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 flex-1">
            <Search size={15} className="text-[#8A8A8F]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar productos..."
              className="bg-transparent outline-none text-sm text-[#F2F1ED] w-full placeholder:text-[#4A4A4E]" />
          </div>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Precio máximo"
            className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none w-full sm:w-40 placeholder:text-[#4A4A4E]" />
        </div>

        {categoryId && (
          <button onClick={() => setCategoryId(null)} className="text-xs text-[#8A8A8F] hover:text-[#F2F1ED] mb-4 flex items-center gap-1">
            <X size={12} /> Quitar filtro de categoría
          </button>
        )}

        {loading ? (
          <p className="text-[#8A8A8F] text-sm">Cargando catálogo...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#8A8A8F] text-sm">No encontramos productos con esos filtros.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

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
            setCart([]);
            setConfirmedOrder(order);
          }}
        />
      )}

      {confirmedOrder && <OrderConfirmation order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      <BannerSection section="hero_bottom" aspect="aspect-[21/9]" />
      <FloatingWhatsApp />
    </div>
  );
}
