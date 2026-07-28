import React, { useEffect, useState } from 'react';
import { Menu, ChevronRight, X } from 'lucide-react';
import { fetchCategoryTree } from '../lib/categories';

export default function CategoryMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (open) fetchCategoryTree().then(setTree).catch(console.error);
  }, [open]);

  const choose = (categoryId) => {
    onSelect(categoryId);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-[#F2F1ED]">
        <Menu size={18} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-64 bg-[#17171A] border border-[#2A2A2E] rounded-lg shadow-xl z-50 py-2 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] uppercase tracking-wide text-[#8A8A8F]">Categorías</span>
              <button onClick={() => setOpen(false)} className="text-[#8A8A8F]"><X size={14} /></button>
            </div>
            <button onClick={() => choose(null)} className="w-full text-left px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#1F1F23]">
              Todos los productos
            </button>
            {tree.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => (cat.subcategories.length > 0 ? setExpanded(expanded === cat.id ? null : cat.id) : choose(cat.id))}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#F2F1ED] hover:bg-[#1F1F23]"
                >
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <ChevronRight size={14} className={`text-[#8A8A8F] transition-transform ${expanded === cat.id ? 'rotate-90' : ''}`} />
                  )}
                </button>
                {expanded === cat.id && (
                  <div className="bg-[#0B0B0C]">
                    <button onClick={() => choose(cat.id)} className="w-full text-left pl-6 pr-3 py-1.5 text-xs text-[#8A8A8F] hover:bg-[#1F1F23]">
                      Ver todo en {cat.name}
                    </button>
                    {cat.subcategories.map((sub) => (
                      <button key={sub.id} onClick={() => choose(sub.id)}
                        className="w-full text-left pl-6 pr-3 py-1.5 text-xs text-[#F2F1ED] hover:bg-[#1F1F23]">
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
