import { useState, useEffect } from 'react';
import type { Product } from '../types/product';
import { useCarrito } from '../hooks/useCarrito';
import { obtenerFallbackProducto } from '../utils/fallbackImages';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { items, agregar, sumar, restar, vaciarYAgregar } = useCarrito();
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product.imagenUrl]);

  const cartItem = items?.find((item) => String(item.id) === String(product.id));
  const cantidad = cartItem ? cartItem.cantidad : 0;

  const imagenMostrar =
    product.imagenUrl && !imgError
      ? product.imagenUrl
      : obtenerFallbackProducto(product.categoria);

  const handleAdd = () => {
    const success = agregar(product);
    if (!success) setShowModal(true);
  };

  const handleConfirmar = () => {
    vaciarYAgregar(product);
    setShowModal(false);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={imagenMostrar}
          alt={product.nombre}
          className="product-image"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="product-info">
        <small className="product-comercio">{product.comercioNombre}</small>
        <h3 className="product-nombre">{product.nombre}</h3>
        <p className="product-descripcion" title={product.descripcion || undefined}>
          {product.descripcion}
        </p>
        <p className="product-precio">${product.precio}</p>
        
        <div className="product-actions">
          {cantidad > 0 ? (
            <div className="quantity-controls">
              <button onClick={() => restar(product.id)} className="btn-qty">-</button>
              <span className="qty-display">{cantidad}</span>
              <button onClick={() => sumar(product.id)} className="btn-qty">+</button>
            </div>
          ) : (
            <button onClick={handleAdd} className="btn-agregar">Agregar</button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Empezar un nuevo pedido?</h3>
            <p>Ya tienes productos de otro local en el carrito. ¿Quieres vaciar el carrito actual y empezar uno nuevo con este producto?</p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="btn-cancelar">Cancelar</button>
              <button onClick={handleConfirmar} className="btn-confirmar">Vaciar y Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}