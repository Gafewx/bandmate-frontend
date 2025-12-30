'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast'; // 👈 ใช้แจ้งเตือนสวยๆ

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // 👈 เช็คสถานะโหลด
  const [showPassword, setShowPassword] = useState(false); // 👈 เปิด/ปิดดูรหัสผ่าน

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // เริ่มโหลด

    try {
      // ใช้ /api/... ตามที่เราตั้ง Proxy ไว้
      const res = await axios.post(
        '/api/users/login',
        formData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
          }
        }
      );

      // เก็บข้อมูล User
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // แจ้งเตือนสวยๆ
      toast.success(`ยินดีต้อนรับ, ${res.data.user.full_name}! 🎸`);
      
      // ดีดไปหน้า Home
      router.push('/'); 

    } catch (error: any) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      toast.error(errMsg);
      setLoading(false); // หยุดโหลดถ้า Error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* 🖼️ Background Effect (ตกแต่งพื้นหลังให้ดูมีมิติ) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]" />

      {/* 📦 Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            <span className="text-white">Band</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Mate</span>
          </h1>
          <p className="text-gray-400 text-sm">เข้าสู่ระบบเพื่อเริ่มหาเพื่อนและจองห้องซ้อม</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">ชื่อผู้ใช้ (Username)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                name="username"
                type="text"
                placeholder="กรอกชื่อผู้ใช้ของคุณ"
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition"
                required
              />
            </div>
          </div>

          {/* Password Input + Toggle Eye */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">รหัสผ่าน (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"} // สลับ type ตาม state
                placeholder="••••••••"
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition"
                required
              />
              {/* ปุ่มลูกตา เปิด/ปิด รหัสผ่าน */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                     <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                     <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 5.31c-.12.362-.12.752 0 1.114 1.489 4.471 5.704 7.697 10.677 7.697.605 0 1.197-.047 1.77-.138l-2.909-2.909A5.23 5.23 0 016.75 12z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // ห้ามกดซ้ำตอนโหลด
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-600 text-black font-bold py-3 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                {/* Spinner */}
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ (Log In)'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          ยังไม่มีบัญชีใช่ไหม?{' '}
          <Link href="/register" className="text-yellow-500 hover:text-yellow-400 font-bold hover:underline transition">
            สมัครสมาชิกฟรี
          </Link>
        </div>
      </div>
    </div>
  );
}