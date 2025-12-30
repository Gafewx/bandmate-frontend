'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';

interface Room {
  room_id: number;
  room_name: string;
  description: string;
  price_per_hour: string;
  location: string;
  room_img: string;
  average_rating: string;
  review_count: number;
}

export default function Rooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // โหลด User สำหรับ Navbar
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    // โหลดข้อมูลห้อง
    axios.get('/api/rooms',
      {
        headers: {
          "ngrok-skip-browser-warning": "true", // 👈 เพิ่มบรรทัดนี้เข้าไปครับ
          "Content-Type": "application/json"
        }
      })
      .then((res) => {
        setRooms(res.data);
        setIsLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  // ⭐ ฟังก์ชันดาว (ปรับให้รองรับกรณีไม่มีคะแนน)
  const renderStars = (rating: number) => {
    if (!rating || rating === 0) return <span className="text-gray-500 text-sm">New Room ✨</span>;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <span className="text-yellow-400 text-lg flex items-center gap-1">
        <span>{'★'.repeat(fullStars)}{hasHalfStar && '½'}</span>
        <span className="text-gray-400 text-xs">({rating.toFixed(1)})</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">

      {/* 1. ใส่ Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* 2. Header Section */}
      <div className="relative pt-32 pb-12 px-6 text-center overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-yellow-500/20 blur-[120px] rounded-full pointer-events-none"></div>

        <h1 className="relative text-4xl md:text-6xl font-extrabold mb-4 animate-fade-in-up">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
            Premium Rehearsal Rooms
          </span>
        </h1>
        <p className="relative text-gray-400 text-lg max-w-2xl mx-auto">
          จองห้องซ้อมดนตรีคุณภาพสูง เครื่องเสียงระดับโปร บรรยากาศส่วนตัว
          พร้อมระบบเช็คตารางว่างแบบ Real-time
        </p>
      </div>

      {/* 3. Room Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-zinc-900 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.room_id}
                className="group relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-2 flex flex-col"
              >

                {/* Image Section */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={room.room_img}
                    alt={room.room_name}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>

                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-yellow-400 border border-yellow-500/30 font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">
                    ฿{Number(room.price_per_hour).toLocaleString()} / ชม.
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition">
                      {room.room_name}
                    </h3>
                  </div>

                  {/* Rating & Location */}
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      {renderStars(Number(room.average_rating))}
                      <span className="text-gray-500 text-xs">({room.review_count} รีวิว)</span>
                    </div>
                    <div className="text-gray-400 text-xs flex items-center gap-1">
                      📍 {room.location}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
                    {room.description}
                  </p>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    {/* ปุ่มดูรายละเอียด (Link ไปหน้า Calendar) */}
                    <button
                      onClick={() => router.push(`/rooms/${room.room_id}`)}
                      className="col-span-2 w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-yellow-400 transition duration-300 flex items-center justify-center gap-2"
                    >
                      📅 ดูตารางว่าง & จองเลย
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}