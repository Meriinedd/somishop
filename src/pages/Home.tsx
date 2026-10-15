import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- เพิ่มบรรทัดนี้
import ProductCard from "../components/ProductCard";
import type { Product, CartItem } from "../types";
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

// --- ส่วนที่ 1: นำเข้า Firestore ---
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // --- ส่วนที่ 2: State เก็บข้อมูลสินค้าจาก DB ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลสินค้าจาก Firebase เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Product[];
        setProducts(productsData);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // TODO: ใส่เบอร์พร้อมเพย์ของคุณที่นี่
  const promptpayId = "0643365463"; 
  const qrPayload = generatePayload(promptpayId, { amount: cartTotal });

  // ถ้ากำลังโหลดข้อมูลให้แสดงข้อความนี้
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500">กำลังโหลดรายการสินค้า...</div>;
  }

  return (
    // เปลี่ยนสีพื้นหลังให้อมครีมๆ พาสเทล
    <div className="min-h-screen bg-[#FFFDF9] p-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Header สไตล์มินิมอลน่ารักๆ */}
        <header className="flex flex-col sm:flex-row justify-between items-center py-6 mb-6 gap-4">
          {/* ส่วนของโลโก้ */}
          <div className="flex items-center justify-center">
            <img 
              src="/somi.png" 
              alt="SOMI Shop Logo" 
              className="h-14 sm:h-16 object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            />
          </div>
          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm border border-orange-100 font-bold text-gray-600 flex items-center gap-2">
            🛒 <span className="text-orange-500">{cartItemCount}</span> ชิ้น | ยอดรวม <span className="text-orange-500">฿{cartTotal}</span>
          </div>
        </header>

        {products.length === 0 ? (
           <div className="text-center text-gray-400 py-16 bg-white rounded-3xl shadow-sm border-dashed border-2 border-gray-200">
             <span className="text-4xl block mb-3">🫙</span>
             ยังไม่มีขนมในโหลเลยน้า
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* ปุ่มหน้าชำระเงินที่ลอยอยู่ด้านล่าง */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:mt-10 sm:text-center z-40">
            <button 
              onClick={() => setShowCheckout(true)} 
              className="w-full sm:w-auto bg-green-400 text-white px-10 py-3.5 rounded-full font-bold text-lg hover:bg-green-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              💸 ไปหน้าชำระเงิน
            </button>
          </div>
        )}

        {/* --- ปุ่มลัดเข้าสู่ระบบ Admin ด้านล่างสุด --- */}
        <div className="mt-16 mb-24 text-center">
          <button 
            onClick={() => navigate('/admin')}
            className="text-orange-200 hover:text-orange-400 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            ⚙️ เข้าสู่ระบบจัดการร้านค้า (Admin)
          </button>
        </div>

        {/* หน้าต่าง Pop-up ชำระเงิน (ใช้โค้ดเดิมของคุณส้มได้เลยครับ ผมปรับความโค้งมนนิดหน่อย) */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">แสกนจ่ายเงิน 📱</h2>
              
              <div className="w-full mb-5 text-sm text-gray-600 bg-orange-50 p-4 rounded-2xl">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-medium">฿{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-orange-200 mt-3 pt-3 flex justify-between font-extrabold text-black text-lg">
                  <span>ยอดสุทธิ</span>
                  <span className="text-orange-500">฿{cartTotal}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-2xl shadow-inner border border-gray-100 mb-2">
                 <QRCodeSVG value={qrPayload} size={200} />
              </div>
              <p className="text-gray-400 text-sm mb-6">พร้อมเพย์: {promptpayId}</p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    alert("แจ้งแอดมินว่าโอนเงินแล้ว ขอบคุณที่อุดหนุนน้า!");
                    setCart([]);
                    setShowCheckout(false);
                  }}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-md transition-colors"
                >
                  โอนเงินแล้ว
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
