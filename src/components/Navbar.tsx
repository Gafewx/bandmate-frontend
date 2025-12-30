'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'text-yellow-400 font-bold' : 'text-gray-300 hover:text-white';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 1. LOGO & HAMBURGER (Mobile) */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <Link href="/" className="text-2xl font-bold tracking-tighter hover:scale-105 transition">
            <span className="text-white">Band</span>
            <span className="text-yellow-500">Mate</span>
          </Link>
        </div>

        {/* 2. CENTER MENU (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/rooms" className={`flex items-center gap-1 ${isActive('/rooms')}`}>
              🥁 จองห้องซ้อม <span className="text-[10px] bg-red-600 text-white px-1.5 rounded-full">New</span>
          </Link>
          <Link href="/match" className={isActive('/match')}>❤️ Matching</Link>
          
          {/* ส่วนของ Admin และ Owner */}
          {user && (
            <>
                {(user.role === 'admin' || user.role === 'owner') && (
                     <Link href="/admin/scan" className={`flex items-center gap-1 hover:text-yellow-400 ${isActive('/admin/scan')}`}>
                        📷 ตรวจตั๋ว
                     </Link>
                )}

                {user.role === 'owner' && (
                    <Link href="/dashboard" className="text-yellow-500 hover:text-yellow-300 transition border border-yellow-500/30 px-3 py-1 rounded-full bg-yellow-500/10 flex items-center gap-1">
                       📊 จัดการร้าน
                    </Link>
                )}
            </>
          )}
        </div>

        {/* 3. RIGHT MENU */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="hidden md:block text-gray-300 hover:text-white text-sm">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition">สมัครสมาชิก</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              
              {/* Notification Bell */}
              <div className="relative pt-1"> 
                 <NotificationBell userId={user.user_id} />
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-white/10 p-1 pr-3 rounded-full transition border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-600 flex items-center justify-center text-black font-bold text-xs overflow-hidden">
                    {user.profile_img ? (
                      <img src={user.profile_img} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm text-gray-200 hidden sm:block truncate max-w-[100px]">
                    {user.full_name?.split(' ')[0] || user.username}
                  </span>
                  <span className="text-gray-500 text-xs">▼</span>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in duration-200 overflow-hidden">
                      
                      {/* Header Dropdown */}
                      <div className="px-4 py-3 border-b border-gray-800 mb-1 bg-white/5">
                        <p className="text-xs text-gray-500 uppercase font-bold">Signed in as</p>
                        <p className="text-sm font-bold text-white truncate">{user.username}</p>
                      </div>
                      
                      {/* Common Links */}
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                            👤 โปรไฟล์
                        </Link>

                        {/* 👇 เมนูใหม่ที่เพิ่มเข้ามา */}
                        <Link href="/bands" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-yellow-400 flex items-center gap-2">
                            🎸 วงดนตรีของฉัน 
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">Setlist</span>
                        </Link>

                        <Link href="/rooms" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-blue-400 flex items-center gap-2">
                            🎹 จองห้องซ้อม
                        </Link>

                        <Link href="/match" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-green-400 flex items-center gap-2">
                            🔥 หาเพื่อนร่วมวง
                        </Link>

                        <Link href="/my-bookings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2">
                            📅 ประวัติการจอง
                        </Link>
                      </div>
                      
                      {/* Admin/Owner Menu */}
                      {(user.role === 'admin' || user.role === 'owner') && (
                        <>
                           <div className="border-t border-gray-800 my-1"></div>
                           <p className="px-4 py-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Management</p>
                           
                           <Link href="/admin/scan" className="block px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                               📷 สแกน QR Code
                           </Link>

                           {user.role === 'owner' && (
                                <Link href="/dashboard" className="block px-4 py-2 text-sm text-yellow-500 hover:bg-white/10 flex items-center gap-2">
                                    📊 แดชบอร์ดร้านค้า
                                </Link>
                           )}
                        </>
                      )}

                      <div className="border-t border-gray-800 mt-1 pt-1">
                        <button onClick={onLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 font-bold flex items-center gap-2">
                            🚪 ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-white/10 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/10">🏠 หน้าแรก</Link>
            <Link href="/rooms" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10">🥁 จองห้องซ้อม</Link>
            <Link href="/match" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10">❤️ Matching</Link>
            
            {user && (
               <>
                 <div className="border-t border-gray-700 my-2 pt-2"></div>
                 <p className="px-3 text-xs text-gray-500 uppercase font-bold mb-1">เมนูส่วนตัว</p>
                 
                 <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10">👤 โปรไฟล์</Link>
                 {/* 👇 เพิ่มเมนู My Bands ในมือถือด้วย */}
                 <Link href="/bands" className="block px-3 py-2 rounded-md text-base font-medium text-yellow-500 hover:text-white hover:bg-white/10">🎸 วงดนตรีของฉัน</Link>
                 <Link href="/my-bookings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10">📅 การจองของฉัน</Link>
                 
                 {(user.role === 'admin' || user.role === 'owner') && (
                    <div className="pt-2 mt-2 border-t border-gray-700">
                        <p className="px-3 text-xs text-gray-500 uppercase font-bold mb-1">ส่วนจัดการ</p>
                        <Link href="/admin/scan" className="block px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-white/10">
                            📷 สแกนตั๋ว (Scan)
                        </Link>
                        {user.role === 'owner' && (
                            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-yellow-400 hover:bg-white/10">
                                📊 แดชบอร์ด (Dashboard)
                            </Link>
                        )}
                    </div>
                 )}
                 <button onClick={onLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 mt-2">
                    🚪 ออกจากระบบ
                 </button>
               </>
            )}

            {!user && <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10">🔐 เข้าสู่ระบบ</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}