import type { Product } from "../types";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-md mb-2" />
      <h3 className="font-bold text-lg">{product.name}</h3>
      <p className="text-gray-500">฿{product.price}</p>
      
      {/* ถ้าสต๊อกหมดให้ปุ่มกดไม่ได้ */}
      <button 
        onClick={() => onAddToCart(product)}
        disabled={product.stock <= 0}
        className={`mt-3 w-full py-2 rounded-md font-medium text-white ${
          product.stock > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {product.stock > 0 ? 'ใส่ตะกร้า' : 'สินค้าหมด'}
      </button>
    </div>
  );
}