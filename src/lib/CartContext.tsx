'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, CartItem } from '@/types';

interface CartState {
    items: CartItem[];
    total: number;
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: Product }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' };

interface CartContextType {
    state: CartState;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItem = state.items.find(item => item.product.id === action.payload.id);

            if (existingItem) {
                const updatedItems = state.items.map(item =>
                    item.product.id === action.payload.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                return {
                    ...state,
                    items: updatedItems,
                    total: calculateTotal(updatedItems)
                };
            } else {
                const newItems = [...state.items, { product: action.payload, quantity: 1 }];
                return {
                    ...state,
                    items: newItems,
                    total: calculateTotal(newItems)
                };
            }
        }

        case 'REMOVE_FROM_CART': {
            const newItems = state.items.filter(item => item.product.id !== action.payload);
            return {
                ...state,
                items: newItems,
                total: calculateTotal(newItems)
            };
        }

        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                const newItems = state.items.filter(item => item.product.id !== action.payload.id);
                return {
                    ...state,
                    items: newItems,
                    total: calculateTotal(newItems)
                };
            }

            const updatedItems = state.items.map(item =>
                item.product.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );
            return {
                ...state,
                items: updatedItems,
                total: calculateTotal(updatedItems)
            };
        }

        case 'CLEAR_CART':
            return {
                items: [],
                total: 0
            };

        default:
            return state;
    }
};

const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

    const addToCart = (product: Product) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const removeFromCart = (productId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getItemCount = () => {
        return state.items.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            state,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};