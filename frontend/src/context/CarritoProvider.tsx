import { useReducer, type ReactNode } from 'react';
import { CarritoContext } from './carritoContext';
import type { ItemCarrito, ProductoCarrito } from '../types/carrito';

type Accion =
  | { tipo: 'agregar'; producto: ProductoCarrito }
  | { tipo: 'vaciarYAgregar'; producto: ProductoCarrito }
  | { tipo: 'sumar'; id: string }
  | { tipo: 'restar'; id: string }
  | { tipo: 'vaciar' };

const carritoVacio: ItemCarrito[] = [];

// Copiamos solo los campos que usa el carrito, con cantidad 1
function nuevoItem(producto: ProductoCarrito): ItemCarrito {
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    comercioId: producto.comercioId,
    cantidad: 1,
  };
}

function carritoReducer(items: ItemCarrito[], accion: Accion): ItemCarrito[] {
  switch (accion.tipo) {
    case 'agregar': {
      const yaEsta = items.some((item) => item.id === accion.producto.id);
      if (yaEsta) {
        return items.map((item) =>
          item.id === accion.producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...items, nuevoItem(accion.producto)];
    }
    case 'vaciarYAgregar':
      return [nuevoItem(accion.producto)];
    case 'sumar':
      return items.map((item) =>
        item.id === accion.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
    case 'restar':
      // Si la cantidad llega a 0, el producto sale del carrito
      return items
        .map((item) => (item.id === accion.id ? { ...item, cantidad: item.cantidad - 1 } : item))
        .filter((item) => item.cantidad > 0);
    case 'vaciar':
      return [];
    default:
      return items;
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(carritoReducer, carritoVacio);

  // El carrito admite productos de un solo comercio: el del primer ítem
  const comercioActual = items.length > 0 ? items[0].comercioId : null;

  // Devuelve false si el producto es de otro comercio (ahí el front muestra el modal)
  const agregar = (producto: ProductoCarrito): boolean => {
    if (comercioActual !== null && comercioActual !== producto.comercioId) {
      return false;
    }
    dispatch({ tipo: 'agregar', producto });
    return true;
  };

  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const cantidadItems = items.reduce((suma, item) => suma + item.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{
        items,
        total,
        cantidadItems,
        agregar,
        vaciarYAgregar: (producto) => dispatch({ tipo: 'vaciarYAgregar', producto }),
        sumar: (id) => dispatch({ tipo: 'sumar', id }),
        restar: (id) => dispatch({ tipo: 'restar', id }),
        vaciar: () => dispatch({ tipo: 'vaciar' }),
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}