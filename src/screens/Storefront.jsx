import React, { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { fetchPublicCatalog } from '../lib/storefront';
import { fetchCategoryTree } from '../lib/categories';
import { useCart } from '../lib/CartContext';
import StoreHeader from '../components/StoreHeader';
import CartDrawer from '../components/CartDrawer';
import BannerSection from '../components/BannerSection';
import ProductCard from '../components/ProductCard';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function Storefront() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('');

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

  // En la portada (sin categoría elegida, sin búsqueda ni filtros) solo se ven los
  // productos marcados como "destacados". Al elegir una categoría o buscar, se
  // muestran todos los que correspondan, para que nada quede inencontrable.
  const isDefaultView = !categoryId && !query && !maxPrice && !sizeFilter;

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !matchingCategoryIds || matchingCategoryIds.includes(p.category?.id);
    const matchesPrice = !maxPrice || Number(p.sale_price) <= Number(maxPrice);
    const matchesSize = !sizeFilter || (p.variants || []).some((v) => v.size === sizeFilter && v.stock > 0);
    const matchesFeatured = !isDefaultView || p.featured !== false;
    return matchesQuery && matchesCategory && matchesPrice && matchesSize && matchesFeatured;
  });

  const availableSizes = useMemo(() => {
    const base = products.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !matchingCategoryIds || matchingCategoryIds.includes(p.category?.id);
      return matchesQuery && matchesCategory;
    });
    const sizes = base.flatMap((p) => (p.variants || []).filter((v) => v.stock > 0).map((v) => v.size)).filter(Boolean);
    return [...new Set(sizes)].sort();
  }, [products, query, matchingCategoryIds]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortOrder === 'price_asc') list.sort((a, b) => Number(a.sale_price) - Number(b.sale_price));
    if (sortOrder === 'price_desc') list.sort((a, b) => Number(b.sale_price) - Number(a.sale_price));
    return list;
  }, [filtered, sortOrder]);

  // Lista plana de categorías (raíz + subcategorías con sangría) para el select de filtros.
  const flatCategories = useMemo(() => {
    return categoryTree.flatMap((r) => [
      { id: r.id, label: r.name },
      ...r.subcategories.map((s) => ({ id: s.id, label: `— ${s.name}` })),
    ]);
  }, [categoryTree]);

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <StoreHeader onSelectCategory={setCategoryId} />

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
          {flatCategories.length > 0 && (
            <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none">
              <option value="">Todas las categorías</option>
              {flatCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          )}
          {availableSizes.length > 0 && (
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}
              className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none">
              <option value="">Todos los talles</option>
              {availableSizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
            className="bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 text-sm text-[#F2F1ED] outline-none">
            <option value="">Ordenar por</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        {categoryId && (
          <button onClick={() => setCategoryId(null)} className="text-xs text-[#8A8A8F] hover:text-[#F2F1ED] mb-4 flex items-center gap-1">
            <X size={12} /> Quitar filtro de categoría
          </button>
        )}

        {loading ? (
          <p className="text-[#8A8A8F] text-sm">Cargando catálogo...</p>
        ) : sorted.length === 0 ? (
          <p className="text-[#8A8A8F] text-sm">No encontramos productos con esos filtros.</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <BannerSection section="hero_bottom" aspect="aspect-[21/9]" />
      <FloatingWhatsApp />
    </div>
  );
}
