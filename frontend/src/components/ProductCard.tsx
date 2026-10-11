import type { Product } from '../types/product';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </div>
      <div className="product-info">
        <span className="product-store">{product.storeName}</span>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toLocaleString('es-AR')}</p>
      </div>
    </div>
  );
}