export interface Product {
  id: string;
  nombre: string;
  precio: number;
  comercioId: string;
  comercioNombre: string;
  categoria?: string;
  descripcion?: string; // Opcional (RF-08)
  imagenUrl?: string; // Opcional
}