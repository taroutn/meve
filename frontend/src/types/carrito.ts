// Datos mínimos que el carrito necesita de un producto
export interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  comercioId: string;
}

// Un producto dentro del carrito, con su cantidad
export interface ItemCarrito extends ProductoCarrito {
  cantidad: number;
}