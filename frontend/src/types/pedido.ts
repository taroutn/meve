export interface ItemPedidoRequest {
  productoId: string;
  cantidad: number;
  precio: number;
  nombre: string;
}

export interface PedidoRequest {
  comercioId: string;
  compradorNombre: string;
  compradorTelefono: string;
  franjaHoraria: string;
  items: ItemPedidoRequest[];
  total: number;
}

export interface PedidoResponse {
  id: string;
  codigoTicket: string;
  estado: string; 
  whatsappUrl: string;
  preferenceId?: string; // Nuevo
  sandboxInitPoint?: string; // Nuevo
}