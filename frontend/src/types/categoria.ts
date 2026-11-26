// Categoría oficial que devuelve GET /api/categorias (#46)
export interface Categoria {
    id: string;
    nombre: string;
    slug: string;
    activa: boolean;
}