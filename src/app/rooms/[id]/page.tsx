'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react'; // 👈 1. เพิ่ม useState, useEffect
import axios from 'axios'; // 👈 2. เพิ่ม axios
import RoomCalendar from '@/src/components/RoomCalendar';

export default function RoomDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [room, setRoom] = useState<any>(null); // 👈 3. สร้างตัวแปรเก็บข้อมูลห้อง

  // 👈 4. ดึงข้อมูลห้อง (ชื่อ + ราคา) จาก Backend
  useEffect(() => {
    if (id) {
      axios.get(`/api/rooms/${id}`) // (ต้องมี API เส้นนี้นะครับ ถ้ายังไม่มีบอกได้เลย)
        .then(res => setRoom(res.data))
        .catch(err => console.error(err));
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      
      {/* ปุ่มย้อนกลับ */}
      <Link href="/rooms" className="text-gray-400 hover:text-white mb-6 inline-block">
        ← ย้อนกลับไปหน้ารวม
      </Link>

      {/* 👈 5. แสดงชื่อห้องจริงๆ แทน ID เฉยๆ */}
      <h1 className="text-3xl font-bold mb-2 text-yellow-400">
        {room ? room.room_name : `กำลังโหลด... (ID: ${id})`}
      </h1>
      <p className="text-gray-400 mb-8">
        {room ? `ราคา ฿${room.price_per_hour} / ชั่วโมง` : 'กำลังโหลดราคา...'}
      </p>

      {/* 📅 ส่วนแสดงปฏิทิน */}
      <div className="bg-zinc-900 p-6 rounded-3xl border border-white/10 shadow-2xl">
         <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            📅 ตารางการจองห้อง
         </h2>
         
         <RoomCalendar roomId={id} />
      </div>

      {/* ปุ่มจองห้อง */}
      <div className="mt-8 text-center">
        {/* 👈 6. แก้ Link ให้ส่ง params ไปครบถ้วน */}
        {room ? (
            <Link 
                href={`/booking?roomId=${id}&price=${room.price_per_hour}&name=${encodeURIComponent(room.room_name)}`} 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-8 rounded-full text-lg hover:scale-105 transition shadow-lg inline-block"
            >
                จองห้องนี้ทันที 🚀
            </Link>
        ) : (
            <span className="text-gray-500">กำลังโหลดข้อมูลห้อง...</span>
        )}
      </div>

    </div>
  );
}