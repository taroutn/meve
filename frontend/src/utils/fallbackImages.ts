const FALLBACK_POR_CATEGORIA: Record<string, string> = {
  panaderia: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500',
  cafeteria: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=500',
  verduleria: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500',
  carniceria: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&q=80&w=500',
  bebidas: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=500',
  kiosco: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&q=80&w=500',
  comida: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
};

const FALLBACK_PRODUCTO_GENERAL =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500';

export const FALLBACK_COMERCIO =
  'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=600';

export function obtenerFallbackProducto(categoria?: string): string {
  if (!categoria) return FALLBACK_PRODUCTO_GENERAL;

  const normalizada = categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  for (const [clave, url] of Object.entries(FALLBACK_POR_CATEGORIA)) {
    if (normalizada.includes(clave)) {
      return url;
    }
  }

  return FALLBACK_PRODUCTO_GENERAL;
}