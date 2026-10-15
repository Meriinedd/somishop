import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (

      <Routes>
        {/* หน้าสำหรับให้พนักงานเข้ามาดูและสั่งขนม */}
        <Route path="/" element={<Home />} />
        
        {/* หน้าสำหรับแอดมิน */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

  );
}

export default App;