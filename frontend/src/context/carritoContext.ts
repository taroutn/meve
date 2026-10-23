import { createContext } from 'react';
import type { ItemCarrito, ProductoCarrito } from '../types/carrito';

// Todo lo que el carrito ofrece al resto de la app
export interface CarritoContextValue {
  items: ItemCarrito[];
  total: number;
  cantidadItems: number;
  agregar: (producto: ProductoCarrito) => boolean;
  vaciarYAgregar: (producto: ProductoCarrito) => void;
  sumar: (id: string) => void;
  restar: (id: string) => void;
  vaciar: () => void;
}

export const CarritoContext = createContext<CarritoContextValue | null>(null);