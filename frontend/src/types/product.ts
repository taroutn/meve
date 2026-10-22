export interface Product {
  id: string;
  nombre: string;
  precio: number;
  comercioId: string;
  comercioNombre: string;
  categoria?: string;
  imagenUrl?: string; // Opcional
}