import { useContext } from 'react';
import { CarritoContext } from '../context/carritoContext';

// Hook para usar el carrito desde cualquier componente
export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) {
    throw new Error('useCarrito tiene que usarse dentro de <CarritoProvider>');
  }
  return contexto;
}