import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { fetchCategoryTree, createCategory } from '../lib/categories';

export default function CategoryPicker({ categoryId, onChange }) {
  const [tree, setTree] = useState([]);
  const [rootId, setRootId] = useState('');
  const [subId, setSubId] = useState('');

  const load = () => fetchCategoryTree().then(setTree).catch(console.error);
  useEffect(() => { load(); }, []);

  // Al recibir un categoryId ya elegido (modo edición), ubicar si es raíz o subcategoría.
  useEffect(() => {
    if (!categoryId || tree.length === 0) return;
    for (const r of tree) {
      if (r.id === categoryId) { setRootId(r.id); return; }
      const sub = r.subcategories.find((s) => s.id === categoryId);
      if (sub) { setRootId(r.id); setSubId(sub.id); return; }
    }
  }, [categoryId, tree]);

  const currentRoot = tree.find((r) => r.id === Number(rootId));

  const handleRootChange = async (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      const name = prompt('Nombre de la nueva categoría:');
      if (!name) return;
      try {
        const created = await createCategory(name, null);
        await load();
        setRootId(created.id);
        setSubId('');
        onChange(created.id);
      } catch (err) {
        alert('No se pudo crear la categoría: ' + err.message);
      }
      return;
    }
    setRootId(value);
    setSubId('');
    onChange(value ? Number(value) : null);
  };

  const handleSubChange = async (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      const name = prompt('Nombre de la nueva subcategoría:');
      if (!name) return;
      try {
        const created = await createCategory(name, Number(rootId));
        await load();
        setSubId(created.id);
        onChange(created.id);
      } catch (err) {
        alert('No se pudo crear la subcategoría: ' + err.message);
      }
      return;
    }
    setSubId(value);
    onChange(value ? Number(value) : Number(rootId));
  };

  return (
    <div className="flex gap-2">
      <select value={rootId} onChange={handleRootChange}
        className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]">
        <option value="">Categoría...</option>
        {tree.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        <option value="__new__">+ Nueva categoría</option>
      </select>

      {rootId && (
        <select value={subId} onChange={handleSubChange}
          className="flex-1 bg-[#0B0B0C] border border-[#2A2A2E] rounded px-2.5 py-2 text-sm text-[#F2F1ED] outline-none focus:border-[#E8FF4D]">
          <option value="">Sin subcategoría</option>
          {currentRoot?.subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          <option value="__new__">+ Nueva subcategoría</option>
        </select>
      )}
    </div>
  );
}
