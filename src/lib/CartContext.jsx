import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product, variant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === variant.id);
      if (existing) return prev.map((i) => (i.id === variant.id ? { ...i, qty: Math.min(i.qty + 1, variant.stock) } : i));
      return [...prev, {
        id: variant.id,
        productName: product.name,
        color: variant.color,
        size: variant.size,
        price: Number(product.sale_price),
        qty: 1,
        stock: variant.stock,
      }];
    });
    setCartOpen(true);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.stock)) } : i)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartOpen, setCartOpen, addToCart, changeQty, removeItem, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
