import { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';

// Create Cart Context
const CartContext = createContext();

// Cart Provider Component
export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get cart key for localStorage based on user
  const getCartKey = () => {
    return user?.id ? `cart_${user.id}` : 'cart_guest';
  };

  // Load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const cartKey = getCartKey();
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } else {
        setCart({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 });
      }
    } catch (err) {
      console.error('Failed to load cart from storage:', err);
      setCart({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 });
    }
  };

  // Save cart to localStorage
  const saveCartToStorage = (cartData) => {
    try {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartData));
    } catch (err) {
      console.error('Failed to save cart to storage:', err);
    }
  };

  // Calculate cart totals
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  // Update cart with new totals
  const updateCart = (items) => {
    const totals = calculateTotals(items);
    const updatedCart = {
      items,
      ...totals
    };
    setCart(updatedCart);
    saveCartToStorage(updatedCart);
    return updatedCart;
  };

  // Fetch cart data (for compatibility, but loads from localStorage)
  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      loadCartFromStorage();
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1, productData = null) => {
    console.log('addToCart called:', { isAuthenticated, user: !!user, userId: user?.id });

    // For now, let's check localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    const hasStoredUser = !!storedUser;

    console.log('Stored user check:', { hasStoredUser, isAuthenticated, user: !!user });

    if (!isAuthenticated && !hasStoredUser) {
      console.error('Authentication check failed:', { isAuthenticated, user: !!user, hasStoredUser });
      throw new Error('Please login to add items to cart');
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentItems = [...cart.items];
      const existingItemIndex = currentItems.findIndex(item => item.product_id === productId);

      if (existingItemIndex > -1) {
        // Update existing item quantity
        currentItems[existingItemIndex].quantity += quantity;
        console.log('Updated existing item:', currentItems[existingItemIndex]);
      } else {
        // Add new item
        const newItem = {
          id: Date.now(), // Temporary ID for frontend
          product_id: productId,
          quantity,
          price: productData?.price || '0',
          name: productData?.name || 'Unknown Product',
          unit: productData?.unit || 'unit',
          amount_per_unit: productData?.amount_per_unit || '',
          image_url: productData?.image_url || null,
          brand: productData?.brand || null,
          farmer_id: productData?.farmer_id || null,
          farmer_name: productData?.farmer_name || null
        };
        currentItems.push(newItem);
        console.log('Added new item:', newItem);
      }

      const updatedCart = updateCart(currentItems);
      console.log('Cart updated successfully:', updatedCart);
      return updatedCart;
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    console.log('updateCartItem called:', { isAuthenticated, user: !!user, userId: user?.id });

    // Check localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    const hasStoredUser = !!storedUser;

    if (!isAuthenticated && !hasStoredUser) {
      console.error('User not authenticated for cart update');
      return;
    }

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentItems = [...cart.items];
      const itemIndex = currentItems.findIndex(item => item.id === itemId);

      if (itemIndex > -1) {
        currentItems[itemIndex].quantity = quantity;
        return updateCart(currentItems);
      }
    } catch (err) {
      console.error('Failed to update cart item:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    console.log('removeFromCart called:', { isAuthenticated, user: !!user, userId: user?.id });

    // Check localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    const hasStoredUser = !!storedUser;

    if (!isAuthenticated && !hasStoredUser) {
      console.error('User not authenticated for cart removal');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentItems = cart.items.filter(item => item.id !== itemId);
      return updateCart(currentItems);
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    console.log('clearCart called:', { isAuthenticated, user: !!user, userId: user?.id });

    // Check localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    const hasStoredUser = !!storedUser;

    if (!isAuthenticated && !hasStoredUser) {
      console.error('User not authenticated for cart clearing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clearedCart = { items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 };
      setCart(clearedCart);
      saveCartToStorage(clearedCart);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.items.some(item => item.product_id === productId);
  };

  // Get specific cart item
  const getCartItem = (productId) => {
    return cart.items.find(item => item.product_id === productId);
  };

  // Load cart when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCartFromStorage();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], total: 0, subtotal: 0, tax: 0, shipping: 0 });
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    cart,
    isLoading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartItemCount,
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
