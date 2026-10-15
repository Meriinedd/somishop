import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import type { Product } from "../types";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  
  // State สำหรับฟอร์มเพิ่มสินค้า
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("ขนม");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");

  // อ้างอิงไปยัง Collection 'products' ในฐานข้อมูล Firestore
  const productsCollectionRef = collection(db, "products");

  // ฟังก์ชันดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูล
  const fetchProducts = async () => {
    const data = await getDocs(productsCollectionRef);
    setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Product)));
  };

  // ดึงข้อมูลทันทีที่เปิดหน้านี้
  useEffect(() => {
    fetchProducts();
  }, []);

  // ฟังก์ชันเพิ่มสินค้าใหม่
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(productsCollectionRef, {
      name,
      price: Number(price),
      category,
      imageUrl: imageUrl || "https://via.placeholder.com/150", // ถ้าไม่ใส่รูปให้ใช้รูปจำลอง
      stock: Number(stock),
    });
    
    // เคลียร์ฟอร์ม
    setName(""); setPrice(""); setImageUrl(""); setStock("");
    // โหลดข้อมูลใหม่มาแสดง
    fetchProducts();
  };

  // ฟังก์ชันลบสินค้า
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("แน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      const productDoc = doc(db, "products", id);
      await deleteDoc(productDoc);
      fetchProducts();
    }
  };

  // ฟังก์ชันล็อกเอาท์
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">จัดการสินค้า (Admin)</h1>
          <div className="space-x-4">
            <button onClick={() => navigate("/")} className="text-blue-500 font-medium hover:underline">
              ดูหน้าเว็บร้านค้า
            </button>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
              ออกจากระบบ
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* ฟอร์มเพิ่มสินค้า */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">เพิ่มสินค้าใหม่</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
              <input type="text" placeholder="ชื่อสินค้า" required value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" />
              <input type="number" placeholder="ราคา (บาท)" required value={price} onChange={(e) => setPrice(e.target.value)} className="border p-2 rounded" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
                <option value="ขนม">ขนม</option>
                <option value="อาหาร">อาหาร</option>
                <option value="มาม่า">มาม่า</option>
                <option value="เครื่องดื่ม">เครื่องดื่ม</option>
                <option value="ไอติม">ไอติม</option>
              </select>
              <input type="number" placeholder="จำนวนสต๊อก" required value={stock} onChange={(e) => setStock(e.target.value)} className="border p-2 rounded" />
              <input type="text" placeholder="URL รูปภาพ (ใส่ลิงก์รูป)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="border p-2 rounded text-sm" />
              <button type="submit" className="bg-green-500 text-white py-2 rounded font-bold hover:bg-green-600 mt-2">
                บันทึกสินค้า
              </button>
            </form>
          </div>

          {/* ตารางแสดงรายการสินค้า */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">รายการสินค้าทั้งหมดในร้าน</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-4">ยังไม่มีสินค้าในระบบ ลองเพิ่มสินค้าทางซ้ายมือดูครับ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="p-2 border">รูป</th>
                      <th className="p-2 border">ชื่อสินค้า</th>
                      <th className="p-2 border">หมวดหมู่</th>
                      <th className="p-2 border">ราคา</th>
                      <th className="p-2 border">สต๊อก</th>
                      <th className="p-2 border">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="p-2 border"><img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" /></td>
                        <td className="p-2 border font-medium">{product.name}</td>
                        <td className="p-2 border">{product.category}</td>
                        <td className="p-2 border">฿{product.price}</td>
                        <td className="p-2 border">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-2 border text-center">
                          <button onClick={() => handleDeleteProduct(product.id!)} className="text-red-500 hover:text-red-700 font-bold text-sm">
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}