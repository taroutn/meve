export interface FranjaHoraria {
  rango: string;
  capacidadMaxima: number;
  cuposDisponibles: number;
}

export interface Comercio {
  id: string;
  nombre: string;
  descripcion: string;
  horarios?: string;
  imagenUrl?: string;
  activo?: boolean;
  franjas?: FranjaHoraria[];
}