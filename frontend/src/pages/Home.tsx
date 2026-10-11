import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import './Home.css';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Café Orgánico de Especialidad 250g',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=500',
    storeName: 'Café Central Bar',
  },
  {
    id: '2',
    name: 'Pan Savorizado de Masa Madre',
    price: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500',
    storeName: 'Panadería Don José',
  },
  {
    id: '3',
    name: 'Alfajores Artesanales de Nuez (x6)',
    price: 3800,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=500',
    storeName: 'Dulzuras Pinamar',
  },
  {
    id: '4',
    name: 'Cerveza Artesanal IPA 500ml',
    price: 2900,
    imageUrl: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=500',
    storeName: 'Cervecería Ogham',
  },
  {
    id: '5',
    name: 'Empanadas de Carne Cortada a Cuchillo (Docena)',
    price: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=500',
    storeName: 'La vieja esquina',
  },
  {
    id: '6',
    name: 'Combo Picada Regional para 2',
    price: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&q=80&w=500',
    storeName: 'Almacén de Campo',
  },
];

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Exploración Hiperlocal</h1>
        <p>Descubrí los mejores productos de los comercios cercanos en un solo lugar.</p>
      </div>

      {/* Grilla responsiva de productos */}
      <div className="product-grid">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}