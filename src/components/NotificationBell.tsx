'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface NotificationBellProps {
  userId: number;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // นับจำนวนที่ยังไม่อ่าน
  const unreadCount = notifs.filter(n => !n.is_read).length;

  const fetchNotifs = async () => {
    try {
      // 👇 แก้ตรงนี้: เติม /user เข้าไปให้ตรงกับ Backend Controller
      const res = await axios.get(`/api/notifications/user/${userId}`);
      setNotifs(res.data);
    } catch (err) { 
        console.error("Error fetching notifications:", err); 
    }
  };

  useEffect(() => {
    if (userId) {
        fetchNotifs();
        // Polling ทุก 5 วินาที
        const interval = setInterval(fetchNotifs, 5000);
        return () => clearInterval(interval);
    }
  }, [userId]);

  const handleRead = async (id: number) => {
    try {
        // ส่วนนี้ถูกต้องแล้ว (Patch ID ตรงๆ)
        await axios.patch(`/api/notifications/${id}/read`);
        
        // อัปเดต State ในฝั่ง Frontend ทันทีเพื่อให้รู้สึกเร็ว (Optimistic UI)
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div className="relative mr-4">
      {/* ปุ่มกระดิ่ง */}
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-300 hover:text-white transition group">
        <span className="text-2xl group-hover:scale-110 transition-transform block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-lg border border-black z-10">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10">
            
            {/* Header */}
            <div className="p-3 border-b border-zinc-700 font-bold text-gray-200 bg-zinc-900/95 backdrop-blur-sm flex justify-between items-center">
                <span>การแจ้งเตือน 📢</span>
                <button 
                    className="text-xs text-yellow-500 hover:text-yellow-400 transition flex items-center gap-1" 
                    onClick={fetchNotifs}
                >
                    ↻ รีเฟรช
                </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar bg-zinc-900">
              {notifs.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                    <span className="text-3xl mb-2 grayscale opacity-50">💤</span>
                    ไม่มีการแจ้งเตือนใหม่
                </div>
              ) : (
                notifs.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.is_read && handleRead(n.id)} 
                    className={`p-4 text-sm border-b border-zinc-800 transition flex gap-3 items-start relative
                        ${n.is_read 
                            ? 'opacity-60 hover:opacity-100 bg-zinc-900' 
                            : 'bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer'
                        }
                    `}
                  >
                    {/* Status Dot */}
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 shadow-lg
                        ${n.type === 'success' ? 'bg-green-500 shadow-green-500/50' : 
                          n.type === 'error' ? 'bg-red-500 shadow-red-500/50' : 
                          'bg-blue-500 shadow-blue-500/50'}
                    `}></div>
                    
                    <div className="flex-1">
                        <p className={`leading-snug ${n.is_read ? 'text-gray-400' : 'text-gray-100 font-medium'}`}>
                            {n.message}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
                            🕒 {new Date(n.created_at).toLocaleString('th-TH', { 
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                            })}
                        </p>
                    </div>

                    {!n.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}