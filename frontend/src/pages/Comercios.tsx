import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';

const mockProduct: Product = {
  id: '1',
  name: 'Café Orgánico de Especialidad 250g',
  price: 4500,
  imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=500',
  storeName: 'Café Central Bar',
};

export default function Comercios() {
  return (
    <section>
      <h1>Gestión de Comercios</h1>
      <p>Sección para explorar y administrar los comercios registrados y sus productos.</p>
      
      {/* Contenedor de prueba para la tarjeta */}
      <div style={{ marginTop: '2rem' }}>
        <ProductCard product={mockProduct} />
      </div>
    </section>
  );
}