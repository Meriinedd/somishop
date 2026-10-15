import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import type { Product, CartItem } from "../types";
import generatePayload from 'promptpay-qr';
import { QRCodeSVG } from 'qrcode.react';

// --- ส่วนที่ 1: นำเข้า Firestore ---
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center py-4 mb-6 border-b gap-4">
          <h1 className="text-2xl font-bold text-orange-500">SOMI</h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm font-semibold text-gray-700">
            🛒 ตะกร้า: {cartItemCount} ชิ้น | ยอดรวม: ฿{cartTotal}
          </div>
        </header>

        {/* --- ส่วนที่ 3: เช็คว่ามีสินค้าหรือไม่ ถ้ามีก็ map ข้อมูลของจริงออกมา --- */}
        {products.length === 0 ? (
           <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
             ยังไม่มีสินค้าในร้านค้านี้
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:mt-8 sm:text-center z-40">
            <button 
              onClick={() => setShowCheckout(true)} 
              className="w-full sm:w-auto bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-600 shadow-md transition-colors"
            >
              ไปหน้าชำระเงิน (สแกน QR)
            </button>
          </div>
        )}

        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-gray-800">สแกนจ่ายเงิน</h2>
              
              <div className="w-full mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>฿{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold text-black text-lg">
                  <span>ยอดสุทธิ</span>
                  <span className="text-orange-500">฿{cartTotal}</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border-2 border-blue-900 mb-4 inline-block">
                 <QRCodeSVG value={qrPayload} size={200} />
              </div>
              <p className="text-gray-500 text-sm mb-6">พร้อมเพย์: {promptpayId}</p>

              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-2 rounded-md font-medium text-gray-600 bg-gray-200 hover:bg-gray-300"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={() => {
                    alert("แจ้งแอดมินว่าโอนเงินแล้ว เดี๋ยวเราจะไปต่อยอดเขียนลงฐานข้อมูลทีหลังครับ!");
                    setCart([]);
                    setShowCheckout(false);
                  }}
                  className="flex-1 py-2 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
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