import type { Product } from '../types/product';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Imagen de respaldo
  const fallbackImage = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=500';

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={product.imagenUrl || fallbackImage} 
          alt={product.nombre} 
          className="product-image" 
        />
      </div>
      <div className="product-info">
        <span className="product-store">{product.comercioNombre || 'Comercio Local'}</span>
        <h3 className="product-name">{product.nombre}</h3>
        <p className="product-price">${product.precio.toLocaleString('es-AR')}</p>
      </div>
    </div>
  );
}