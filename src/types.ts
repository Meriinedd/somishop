export interface Product {
    id?: string;
    name: string;      // ชื่อขนม
    price: number;     // ราคา
    category: string;  // หมวดหมู่ (ขนม, มาม่า, เครื่องดื่ม)
    imageUrl: string;  // รูปภาพ
    stock: number;     // จำนวนคงเหลือ
  }
  
export interface CartItem extends Product {
    quantity: number;  // จำนวนที่หยิบใส่ตะกร้า
  }