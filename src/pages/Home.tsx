import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product, CartItem } from "../types";
import generatePayload from 'promptpay-qr';
import { QRCodeCanvas } from 'qrcode.react'; 

import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

export default function Home() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(d => ({
        ...d.data(),
        id: d.id
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    document.body.style.overflow = (showCheckout || showSuccess) ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCheckout, showSuccess]);

  useEffect(() => {
    if (cart.length === 0 && showCheckout) {
      setShowCheckout(false);
    }
  }, [cart, showCheckout]);

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

  const handleIncreaseQuantity = (productId: string) => {
    setCart((prev) => 
      prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)
    );
  };

  const handleDecreaseQuantity = (productId: string) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem?.quantity === 1) {
        return prev.filter(item => item.id !== productId);
      }
      return prev.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // TODO: ใส่เบอร์พร้อมเพย์ของคุณที่นี่
  const promptpayId = "0643365463";
  const qrPayload = generatePayload(promptpayId, { amount: cartTotal });

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category || "อื่นๆ")))];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => (p.category || "อื่นๆ") === selectedCategory);

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "SOMI_PromptPay_QR.png"; 
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-pink-400">กำลังโหลดรายการขนมนะแพร๊บ... 🌸</div>;
  }

  return (
    // --- ปรับแต่ง 1: เปลี่ยนฟอนต์ ใส่ Cursor น่ารักๆ แบบ Sanrio (My Melody) ---
    <div 
      className="min-h-screen font-sans text-gray-700 relative overflow-x-hidden"
      style={{ 
        cursor: "url('https://cdn.custom-cursor.com/db/9763/32/sanrio-my-melody-cupcake-pointer.png'), auto" 
      }}
    >
      {/* --- ปรับแต่ง 2: เลเยอร์พื้นหลัง background.jpg ดรอปสีให้ดูซอฟต์พาสเทล --- */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={{ 
          backgroundImage: "url('/background.jpg')", 
          backgroundSize: "300px", // หรือถ้าภาพเป็นแพทเทิร์นเล็กๆ ให้เปลี่ยนเป็น "300px" และเพิ่ม backgroundRepeat: "repeat"
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.15 // ความอ่อนของพื้นหลัง (0.1 - 1.0)
        }}
      />
      {/* สีพื้นหลังเสริมเพื่อความละมุน */}
      <div className="fixed inset-0 z-[-2] bg-pink-50" />

      <div className="max-w-4xl mx-auto px-4 pt-4 pb-32">

        {/* Header สไตล์กล่องกระจกใสๆ */}
        <header className="flex flex-row justify-between items-center py-6 mb-4 gap-2">
          <div className="flex items-center justify-start -ml-2 sm:-ml-4">
            <img
              src="/somi.png"
              alt="SOMI Shop Logo"
              className="h-24 sm:h-32 object-contain drop-shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-sm border border-pink-200 font-bold text-sm sm:text-base text-gray-600 flex items-center gap-2 hover:bg-white transition-colors">
            🛍️ <span className="text-pink-500">{cartItemCount}</span> ชิ้น | <span className="hidden sm:inline">ยอดรวม </span><span className="text-pink-500">฿{cartTotal}</span>
          </div>
        </header>

        {/* แถบควบคุม: หมวดหมู่ & รูปแบบการแสดงผล */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/70 backdrop-blur-md p-3 rounded-[2rem] shadow-sm border border-pink-100">

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-pink-400 text-white shadow-lg shadow-pink-200 transform scale-105'
                    : 'bg-white text-pink-400 hover:bg-pink-50 border border-pink-100'
                }`}
              >
                {cat === 'all' ? 'ทั้งหมด 🌸' : cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2 bg-white/50 p-1.5 rounded-2xl w-full md:w-auto justify-center border border-pink-100">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-xl transition-all duration-200 ${viewMode === "grid" ? 'bg-white shadow-sm text-pink-500 transform scale-105' : 'text-pink-300 hover:text-pink-400'}`}
              title="ดูแบบเรียงตาราง"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-xl transition-all duration-200 ${viewMode === "list" ? 'bg-white shadow-sm text-pink-500 transform scale-105' : 'text-pink-300 hover:text-pink-400'}`}
              title="ดูแบบเลื่อนลง"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
            </button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center text-pink-300 py-16 bg-white/80 backdrop-blur-md rounded-[3rem] shadow-sm border-dashed border-2 border-pink-200">
            <span className="text-5xl block mb-3 opacity-80">🎀</span>
            <p className="font-medium text-lg">ยังไม่มีสินค้าในหมวดหมู่นี้เลยน้า</p>
          </div>
        ) : (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* ปุ่มหน้าชำระเงินที่ลอยอยู่ด้านล่าง ปรับเป็นสีชมพูหวานๆ */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-pink-100 shadow-[0_-10px_40px_rgba(253,164,175,0.15)] sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:mt-10 sm:text-center z-40">
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-400 to-rose-400 text-white px-10 py-4 rounded-full font-bold text-lg hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              🎀 ไปหน้าชำระเงิน
            </button>
          </div>
        )}

        {/* ปุ่มเข้าสู่ระบบ Admin ด้านล่างสุด */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-pink-300 hover:text-pink-500 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            ⚙️ เข้าสู่ระบบจัดการร้านค้า (Admin)
          </button>
        </div>

        {/* หน้าต่าง Pop-up ชำระเงิน */}
        {showCheckout && (
          <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-6 w-full max-w-sm flex flex-col items-center shadow-2xl border-4 border-pink-50 my-auto transform transition-all animate-fade-in-up">
              <h2 className="text-2xl font-extrabold mb-4 text-pink-500 flex items-center gap-2">
                แสกนจ่ายเงิน 📱
              </h2>

              {/* กล่องรายการสินค้า */}
              <div className="w-full mb-4 bg-pink-50 p-3 rounded-3xl max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden shadow-inner border border-pink-100">
                {cart.map((item, index) => (
                  <div key={index} className="flex flex-col mb-2 bg-white p-3 rounded-2xl shadow-sm border border-pink-50 hover:border-pink-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-700 leading-tight pr-2">{item.name}</span>
                      <span className="font-bold text-pink-500 whitespace-nowrap">฿{item.price * item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs text-gray-400 font-medium">ชิ้นละ ฿{item.price}</span>
                      
                      {/* ปุ่มเพิ่มลดจำนวนสินค้า */}
                      <div className="flex items-center gap-2 bg-pink-50/50 rounded-full px-1.5 py-1 border border-pink-100">
                        <button 
                          onClick={() => handleDecreaseQuantity(item.id!)} 
                          className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-pink-400 font-bold shadow-sm hover:bg-pink-100 hover:text-pink-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold w-4 text-center text-gray-700">{item.quantity}</span>
                        <button 
                          onClick={() => handleIncreaseQuantity(item.id!)} 
                          className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-pink-400 font-bold shadow-sm hover:bg-pink-100 hover:text-pink-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t-2 border-pink-100 mt-3 pt-3 flex justify-between font-extrabold text-gray-700 text-lg px-2">
                  <span>ยอดสุทธิ</span>
                  <span className="text-pink-500 text-xl">฿{cartTotal}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-pink-100 mb-2 hover:shadow-md transition-shadow">
                <QRCodeCanvas id="qr-canvas" value={qrPayload} size={200} fgColor="#ec4899" />
              </div>
              <p className="text-pink-400 font-medium text-sm mb-3 bg-pink-50 px-4 py-1.5 rounded-full">พร้อมเพย์: {promptpayId}</p>

              <button 
                onClick={handleDownloadQR}
                className="mb-6 px-6 py-2.5 bg-white text-pink-500 hover:bg-pink-50 hover:scale-105 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm border border-pink-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                บันทึกคิวอาร์โค้ด
              </button>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-3.5 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  ปิดหน้านี้
                </button>
                <button
                  onClick={async () => {
                    try {
                      await addDoc(collection(db, "orders"), {
                        items: cart,
                        totalAmount: cartTotal,
                        status: "ชำระเงินแล้ว",
                        createdAt: new Date().toISOString()
                      });

                      for (const item of cart) {
                        const productRef = doc(db, "products", item.id!);
                        await updateDoc(productRef, {
                          stock: item.stock - item.quantity
                        });
                      }

                      setShowCheckout(false);
                      setShowSuccess(true);
                    } catch (error) {
                      console.error("Error checkout:", error);
                      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาแจ้งแอดมิน");
                    }
                  }}
                  className="flex-1 py-3.5 rounded-full font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 shadow-md shadow-pink-200 transition-all transform hover:-translate-y-0.5"
                >
                  โอนเงินแล้ว ✨
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pop-up แจ้งเตือนสำเร็จ */}
        {showSuccess && (
          <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white/95 rounded-[3rem] p-8 w-full max-w-sm flex flex-col items-center shadow-2xl text-center border-4 border-pink-100 transform transition-all animate-bounce-in">
              <div className="text-7xl mb-4">🌸</div>
              <h2 className="text-3xl font-extrabold mb-2 text-pink-500">เย้! สำเร็จแล้ว!</h2>
              <p className="text-gray-500 mb-8 font-medium">ระบบบันทึกคำสั่งซื้อเรียบร้อยแล้ว<br/>ขอบคุณที่มาอุดหนุนน้าา 💕</p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCart([]);
                  fetchProducts(); 
                }}
                className="w-full py-4 rounded-full font-bold text-white bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-200 transition-all transform hover:scale-105"
              >
                ตกลงค้าบ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}