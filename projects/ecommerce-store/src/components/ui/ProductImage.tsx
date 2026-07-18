import type { Product } from '../../models/types';

interface Props {
  product: Product;
  categoryName?: string;
}

export function ProductImage({ product, categoryName }: Props) {
  if (product.imageUrl) {
    return (
      <div className="product-image product-image--photo">
        <img src={product.imageUrl} alt={product.name} />
        {categoryName && <span className="product-image__label">{categoryName}</span>}
      </div>
    );
  }

  return (
    <div
      className="product-image"
      style={{
        background: `linear-gradient(145deg, hsl(${product.imageHue} 55% 72%), hsl(${(product.imageHue + 40) % 360} 45% 58%))`,
      }}
      aria-hidden
    >
      <span className="product-image__label">{categoryName ?? 'Producto'}</span>
    </div>
  );
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
