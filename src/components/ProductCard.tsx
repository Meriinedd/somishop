import { useState } from "react";
import type { Product } from "../types";

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  // State สำหรับเปิด/ปิดรูปขยาย
  const [showImage, setShowImage] = useState(false);

  return (
    <>
      {/* ดีไซน์การ์ดใหม่ โค้งมน น่ารักขึ้น มีเงาและเด้งได้ตอนชี้ */}
      <div className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-50 flex flex-col items-center">
        
        {/* รูปภาพ กดแล้วให้ showImage เป็น true */}
        <div className="relative w-32 h-32 mb-3 cursor-pointer group" onClick={() => setShowImage(true)}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
          />
          {/* ไอคอนแว่นขยายเล็กๆ โผล่มาตอนเอาเมาส์ชี้ */}
          <div className="absolute inset-0 bg-white/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <span className="text-2xl">🔍</span>
          </div>
        </div>
        
        <div className="w-full text-center">
          <h3 className="font-bold text-gray-700 text-md truncate">{product.name}</h3>
          <p className="text-orange-500 font-extrabold text-lg mt-1">฿{product.price}</p>
        </div>
        
        <button 
          onClick={() => onAddToCart(product)}
          disabled={product.stock <= 0}
          className={`mt-3 w-full py-2.5 rounded-full font-bold text-white transition-colors ${
            product.stock > 0 
              ? 'bg-orange-400 hover:bg-orange-500 shadow-sm' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {product.stock > 0 ? '+ ใส่ตะกร้า' : 'หมดแล้วน้า 😢'}
        </button>
      </div>

      {/* หน้าต่าง Pop-up ขยายรูป (จะแสดงเมื่อ showImage เป็น true) */}
      {showImage && (
        <div 
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setShowImage(false)}
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl p-3 shadow-2xl">
            <button 
              className="absolute -top-3 -right-3 bg-red-400 text-white w-8 h-8 rounded-full font-bold shadow-md hover:bg-red-500"
              onClick={() => setShowImage(false)}
            >
              ✕
            </button>
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto rounded-2xl object-contain max-h-[60vh]" />
            <h3 className="text-center font-bold text-xl mt-4 mb-2 text-gray-800">{product.name}</h3>
          </div>
        </div>
      )}
    </>
  );
}