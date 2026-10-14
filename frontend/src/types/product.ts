export interface Product {
  id: string;
  nombre: string;
  precio: number;
  comercioId: string;
  comercioNombre: string;
  imagenUrl?: string; // Opcional
}