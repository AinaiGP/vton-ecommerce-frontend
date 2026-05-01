import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';

const CartContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartData, setCartData] = useState(null);

  /**
   * Fetches the current cart from GET /cart and updates cartCount + cartData.
   * Called on app load and after every cart mutation.
   * Backend identifies cart via httpOnly cookie (cart_id) or JWT.
   */
  const refreshCartCount = useCallback(async () => {
    try {
      const res = await apiClient.get('/cart');
      const resolved = res.data;
      setCartCount(resolved?.totalItems ?? 0);
      setCartData(resolved);
    } catch {
      setCartCount(0);
      setCartData(null);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, cartData, setCartCount, setCartData, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
