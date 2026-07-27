import React, { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Printer, X, Pencil, Trash2, ImagePlus } from 'lucide-react';
import {
  fetchProducts, createProduct, addVariant, updateProduct, updateVariantStock,
  deleteVariant, deleteProduct, uploadProductImage,
} from '../lib/products';
import ProductLabelModal from '../components/ProductLabelModal';

function NewProductModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [variants, setVariants] = useState([{ color: '', size: '', stock: 0, minStock: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateVariantField = (idx, field, value) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createProduct({
        name,
        internalCode,
        purchasePrice: Number(purchasePrice),
        salePrice: Number(salePrice),
        variants: variants.map((v) => ({ ...v, stock: Number(v.stock), minStock: Number(v.minStock) })),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo crear el producto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-[#F2F1ED]">Nuevo producto</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej: Remera Nike)"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required value={internalCode} onChange={(e) => setInternalCode(e.target.value)} placeholder="Código interno (ej: REM-NIKE-002)"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] font-mono" />
          <div className="flex gap-3">
            <input required type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Precio de compra"
              className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
            <input required type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Precio de venta"
              className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          </div>

          <div className="border-t border-[#2A2A2E] pt-3 mt-2">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8F] font-mono">Variantes</span>
            {variants.map((v, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <input value={v.color} onChange={(e) => updateVariantField(idx, 'color', e.target.value)} placeholder="Color"
                  className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
                <input value={v.size} onChange={(e) => updateVariantField(idx, 'size', e.target.value)} placeholder="Talle"
                  className="w-20 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
                <input type="number" value={v.stock} onChange={(e) => updateVariantField(idx, 'stock', e.target.value)} placeholder="Stock"
                  className="w-20 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
              </div>
            ))}
            <button type="button"
              onClick={() => setVariants((prev) => [...prev, { color: '', size: '', stock: 0, minStock: 0 }])}
              className="text-xs text-[#E8FF4D] mt-2 flex items-center gap-1">
              <Plus size={12} /> Agregar variante
            </button>
          </div>

          {error && <p className="text-[#FF6B57] text-sm">{error}</p>}

          <button type="submit" disabled={saving}
            className="mt-2 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 hover:bg-[#f2ff85] disabled:opacity-50">
            {saving ? 'Guardando...' : 'Crear producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditProductModal({ product, onClose, onSaved }) {
  const [name, setName] = useState(product.name);
  const [internalCode, setInternalCode] = useState(product.internal_code);
  const [purchasePrice, setPurchasePrice] = useState(product.purchase_price);
  const [salePrice, setSalePrice] = useState(product.sale_price);
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (err) {
      setError('No se pudo subir la foto.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProduct(product.id, {
        name,
        internalCode,
        purchasePrice: Number(purchasePrice),
        salePrice: Number(salePrice),
        imageUrl,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${product.name}"? Desaparece del catálogo y del panel.`)) return;
    await deleteProduct(product.id);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#17171A] border border-[#2A2A2E] rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl text-[#F2F1ED]">Editar producto</h3>
          <button onClick={onClose} className="text-[#8A8A8F] hover:text-[#F2F1ED]"><X size={18} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-[#0B0B0C] border border-[#2A2A2E] rounded flex items-center justify-center overflow-hidden shrink-0">
            {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <ImagePlus size={20} className="text-[#3A3A3E]" />}
          </div>
          <label className="text-xs bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 cursor-pointer text-[#F2F1ED] hover:border-[#E8FF4D]">
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploading} />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          <input required value={internalCode} onChange={(e) => setInternalCode(e.target.value)} placeholder="Código interno"
            className="bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D] font-mono" />
          <div className="flex gap-3">
            <input required type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Precio de compra"
              className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
            <input required type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Precio de venta"
              className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-3 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
          </div>

          {error && <p className="text-[#FF6B57] text-sm">{error}</p>}

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#E8FF4D] text-[#0B0B0C] font-semibold text-sm rounded py-2.5 hover:bg-[#f2ff85] disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={handleDelete}
              className="bg-[#2A1414] border border-[#FF6B57]/40 text-[#FF6B57] text-sm rounded px-4 py-2.5 flex items-center gap-1.5">
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditVariantRow({ variant, onSaved }) {
  const [stock, setStock] = useState(variant.stock);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateVariantStock(variant.id, Number(stock));
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar la variante ${variant.color} / ${variant.size}?`)) return;
    await deleteVariant(variant.id);
    onSaved();
  };

  return (
    <tr className="border-t border-[#2A2A2E]">
      <td className="py-2.5 text-[#F2F1ED]">{variant.color} · {variant.size}</td>
      <td className="py-2.5 font-mono text-xs text-[#8A8A8F]">{variant.sku}</td>
      <td className="py-2.5 text-right">
        {editing ? (
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} autoFocus
            className="w-16 bg-[#0B0B0C] border border-[#E8FF4D] rounded px-1.5 py-0.5 text-sm text-[#F2F1ED] text-right outline-none" />
        ) : (
          <span className={`font-mono text-sm font-semibold ${variant.stock <= variant.min_stock ? 'text-[#FF6B57]' : 'text-[#F2F1ED]'}`}>
            {variant.stock}
          </span>
        )}
      </td>
      <td className="py-2.5 text-right whitespace-nowrap">
        {editing ? (
          <button onClick={handleSave} disabled={saving} className="text-[#E8FF4D] text-xs font-semibold mr-2">
            {saving ? '...' : 'Guardar'}
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-[#8A8A8F] hover:text-[#E8FF4D] mr-2" title="Editar stock">
            <Pencil size={14} />
          </button>
        )}
        <button onClick={handleDelete} className="text-[#8A8A8F] hover:text-[#FF6B57] mr-2" title="Eliminar variante">
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}

function AddVariantRow({ product, onSaved }) {
  const [adding, setAdding] = useState(false);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [stock, setStock] = useState(0);

  const handleAdd = async () => {
    await addVariant(product.id, product.internal_code, { color, size, stock: Number(stock) });
    setAdding(false);
    setColor(''); setSize(''); setStock(0);
    onSaved();
  };

  if (!adding) {
    return (
      <button onClick={() => setAdding(true)} className="text-xs text-[#E8FF4D] mt-2 flex items-center gap-1">
        <Plus size={12} /> Agregar variante
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-2 items-center">
      <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Color"
        className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
      <input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Talle"
        className="w-16 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
      <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock"
        className="w-16 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1.5 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]" />
      <button onClick={handleAdd} className="text-[#E8FF4D] text-xs font-semibold">Guardar</button>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [labelFor, setLabelFor] = useState(null);

  const load = () => {
    setLoading(true);
    fetchProducts(query)
      .then(setProducts)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-end justify-between mb-6">
        <h1 className="font-display text-3xl md:text-4xl text-[#F2F1ED]">Productos</h1>
        <button onClick={() => setShowNew(true)}
          className="bg-[#E8FF4D] text-[#0B0B0C] text-sm font-semibold rounded px-4 py-2 flex items-center gap-1.5 hover:bg-[#f2ff85]">
          <Plus size={15} /> Nuevo producto
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#17171A] border border-[#2A2A2E] rounded px-3 py-2.5 mb-5 max-w-md">
        <Search size={15} className="text-[#8A8A8F]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre o código..."
          className="bg-transparent outline-none text-sm text-[#F2F1ED] w-full placeholder:text-[#4A4A4E]" />
      </div>

      {loading ? (
        <p className="text-[#8A8A8F] text-sm">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-[#8A8A8F] text-sm">Todavía no hay productos cargados.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-[#17171A] border border-[#2A2A2E] rounded-lg overflow-hidden">
              <div className="w-full flex items-center gap-4 p-4">
                <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                  {expanded === p.id ? <ChevronDown size={16} className="text-[#8A8A8F] shrink-0" /> : <ChevronRight size={16} className="text-[#8A8A8F] shrink-0" />}
                  <div className="w-10 h-10 bg-[#0B0B0C] border border-[#2A2A2E] rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <ImagePlus size={14} className="text-[#3A3A3E]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F2F1ED] font-medium truncate">{p.name}</div>
                    <div className="text-xs text-[#8A8A8F] font-mono">{p.internal_code}</div>
                  </div>
                </button>
                <div className="text-right shrink-0">
                  <div className="text-[#F2F1ED] font-mono text-sm">${Number(p.sale_price).toLocaleString('es-AR')}</div>
                  <div className="text-xs text-[#8A8A8F]">{p.variants?.length || 0} variantes</div>
                </div>
                <button onClick={() => setEditingProduct(p)} className="text-[#8A8A8F] hover:text-[#E8FF4D] shrink-0" title="Editar producto">
                  <Pencil size={16} />
                </button>
              </div>
              {expanded === p.id && (
                <div className="border-t border-[#2A2A2E] px-4 pb-4">
                  <table className="w-full text-sm mt-3">
                    <thead>
                      <tr className="text-[11px] tracking-[0.15em] uppercase text-[#8A8A8F] font-mono">
                        <th className="text-left font-normal py-2">Color / Talle</th>
                        <th className="text-left font-normal py-2">SKU</th>
                        <th className="text-right font-normal py-2">Stock</th>
                        <th className="text-right font-normal py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.variants?.map((v) => (
                        <EditVariantRow key={v.id} variant={v} onSaved={load} />
                      ))}
                    </tbody>
                  </table>
                  <AddVariantRow product={p} onSaved={load} />
                  {p.variants?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.variants.map((v) => (
                        <button key={v.id} onClick={() => setLabelFor({ variant: v, product: p })}
                          className="text-[10px] bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2 py-1 text-[#8A8A8F] hover:border-[#E8FF4D] hover:text-[#E8FF4D] flex items-center gap-1">
                          <Printer size={10} /> Etiqueta {v.color} {v.size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNew && <NewProductModal onClose={() => setShowNew(false)} onCreated={load} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={load} />}
      {labelFor && <ProductLabelModal variant={labelFor.variant} product={labelFor.product} onClose={() => setLabelFor(null)} />}
    </div>
  );
}
