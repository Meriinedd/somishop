import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // หรือ .jsx ตามชื่อไฟล์จริงของคุณ
import './index.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 👇 ต้องมีส่วนนี้ครับ เว็บถึงจะไม่ขาว */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)  