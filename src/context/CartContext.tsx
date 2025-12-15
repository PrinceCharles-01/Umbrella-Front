
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartItem } from '../types';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (medicationId: number) => void;
  updateQuantity: (medicationId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'umbrella_cart';

// Create the provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      return [];
    }
  });
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      console.log('🛒 Panier sauvegardé');
    } catch (error) {
      console.error('Erreur sauvegarde panier:', error);
    }
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      // Check if the new item is from the same pharmacy as the existing items
      const isSamePharmacy = prevItems.length > 0 ? prevItems[0].pharmacyId === itemToAdd.pharmacyId : true;

      if (!isSamePharmacy) {
        // If not the same pharmacy, clear the cart and add the new item
        toast({
          title: "Panier réinitialisé",
          description: "Vous ne pouvez commander que d'une seule pharmacie à la fois.",
          variant: "default",
        });
        return [{ ...itemToAdd, quantity: 1 }];
      }

      const existingItem = prevItems.find(item => item.medicationId === itemToAdd.medicationId);

      if (existingItem) {
        // If item already exists, increment quantity
        toast({
          title: "Quantité mise à jour",
          description: `${itemToAdd.medicationName} (x${existingItem.quantity + 1})`,
          variant: "success",
        });
        return prevItems.map(item =>
          item.medicationId === itemToAdd.medicationId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If new item, add it to the cart with quantity 1
        toast({
          title: "Ajouté au panier",
          description: itemToAdd.medicationName,
          variant: "success",
        });
        return [...prevItems, { ...itemToAdd, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (medicationId: number) => {
    const itemToRemove = cartItems.find(item => item.medicationId === medicationId);
    setCartItems(prevItems => prevItems.filter(item => item.medicationId !== medicationId));

    if (itemToRemove) {
      toast({
        title: "Retiré du panier",
        description: itemToRemove.medicationName,
        variant: "default",
      });
    }
  };

  const updateQuantity = (medicationId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicationId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.medicationId === medicationId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
