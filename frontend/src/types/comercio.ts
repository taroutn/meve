export interface Comercio {
  id: string;
  nombre: string;
  descripcion: string;
  horarios?: string;
  imagenUrl?: string;
  activo?: boolean;
}