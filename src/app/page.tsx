'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Components
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import MusicianCard from '../components/MusicianCard';

export default function Home() {
  const router = useRouter();
  const [musicians, setMusicians] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]); // 👈 เพิ่ม State สำหรับห้องซ้อม
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. โหลดข้อมูลทั้งหมด (นักดนตรี + ห้องซ้อม)
  const fetchData = async (keyword = '') => {
    setLoading(true);
    try {
      const [musiciansRes, roomsRes] = await Promise.all([
        axios.get(`/api/users/musicians?search=${keyword}`),
        axios.get('/api/rooms')
      ]);

      // กรองเฉพาะคนที่หาวง
      setMusicians(musiciansRes.data.filter((m: any) => m.is_looking_for_band));
      
      // เอาห้องซ้อมแค่ 3 ห้องแรกมาโชว์เป็นตัวอย่าง
      setRooms(roomsRes.data.slice(0, 3)); 

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const handleInvite = async (targetUserId: number, targetName: string) => {
    if (!user) return alert('กรุณาล็อกอินก่อนชวนเพื่อนครับ');
    if (user.user_id === targetUserId) return alert('ชวนตัวเองไม่ได้นะครับ 😅');
    
    try {
        await axios.post('/api/notifications', {
            user_id: targetUserId,
            message: `👋 ${user.full_name || user.username} สนใจชวนคุณเข้าร่วมวง!`,
            type: 'info'
        });
        alert(`✅ ส่งคำชวนหา ${targetName} เรียบร้อย!`);
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการส่งคำชวน');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* 1. Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* 2. Hero Section (ส่วนค้นหา) */}
      <HeroSection 
        search={search} 
        setSearch={setSearch} 
        onSearch={() => fetchData(search)} 
      />

      {/* 🆕 3. Stats Bar (แถบสถิติเท่ๆ) */}
      <div className="bg-zinc-900 border-y border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
                <h3 className="text-3xl font-bold text-white">500+</h3>
                <p className="text-gray-500 text-sm">นักดนตรีในระบบ</p>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-yellow-500">50+</h3>
                <p className="text-gray-500 text-sm">ห้องซ้อมคุณภาพ</p>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-white">100%</h3>
                <p className="text-gray-500 text-sm">ปลอดภัย & เชื่อถือได้</p>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-green-500">24/7</h3>
                <p className="text-gray-500 text-sm">จองได้ตลอดเวลา</p>
            </div>
        </div>
      </div>

      {/* 🆕 4. How It Works (ขั้นตอนการใช้งาน) */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            เริ่มสร้างวงดนตรีในฝัน <span className="text-yellow-500">ใน 3 ขั้นตอน</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition hover:-translate-y-2">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto text-yellow-500">🎸</div>
                  <h3 className="text-xl font-bold mb-2">1. ค้นหาสมาชิก</h3>
                  <p className="text-gray-400">ค้นหานักดนตรีตามตำแหน่ง แนวเพลง หรือความสนใจที่ตรงกัน ผ่านระบบ Search และ Matching</p>
              </div>
              {/* Step 2 */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition hover:-translate-y-2">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto text-blue-500">🥁</div>
                  <h3 className="text-xl font-bold mb-2">2. จองห้องซ้อม</h3>
                  <p className="text-gray-400">เลือกร้านห้องซ้อมที่ถูกใจ เช็คตารางว่างแบบ Real-time และจองผ่านระบบออนไลน์ได้ทันที</p>
              </div>
              {/* Step 3 */}
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition hover:-translate-y-2">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto text-green-500">🤘</div>
                  <h3 className="text-xl font-bold mb-2">3. ลุยเลย!</h3>
                  <p className="text-gray-400">นัดเจอกันที่ร้าน สแกน QR Code เพื่อยืนยัน แล้วระเบิดความมันส์ให้เต็มที่</p>
              </div>
          </div>
      </section>

      {/* 🆕 5. Featured Rooms (ห้องซ้อมแนะนำ) */}
      <section className="py-16 bg-gradient-to-b from-zinc-900 to-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-bold">🥁 ห้องซ้อมยอดฮิต</h2>
                    <p className="text-gray-400 mt-2">สถานที่ซ้อมดนตรีที่ได้รับคะแนนสูงสุด</p>
                </div>
                <Link href="/rooms" className="text-yellow-500 hover:text-white transition underline decoration-yellow-500/30">
                    ดูทั้งหมด →
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <Link key={room.room_id} href={`/rooms/${room.room_id}`} className="group block bg-black border border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-yellow-500/50 transition">
                        <div className="h-48 overflow-hidden relative">
                            <img src={room.room_img} alt={room.room_name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                            <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                                ฿{room.price_per_hour}/ชม.
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition">{room.room_name}</h3>
                            <p className="text-gray-500 text-sm mt-1">📍 {room.location}</p>
                            <div className="flex items-center gap-1 mt-3">
                                <span className="text-yellow-400">★</span>
                                <span className="text-white font-bold">{Number(room.average_rating) > 0 ? Number(room.average_rating).toFixed(1) : 'New'}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* 6. Musician Grid (นักดนตรีมาแรง) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            🔥 นักดนตรีมาแรง
            <span className="text-sm bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 hidden sm:inline-block">
              {musicians.length} คน
            </span>
          </h2>
          <Link href="/match" className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition">
             ค้นหาแบบละเอียด 🔍
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">กำลังจูนเครื่องดนตรี... 🎸</div>
        ) : musicians.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-3xl bg-zinc-900/30">
            <p className="text-2xl text-gray-600 mb-2">🎸 ไม่พบนักดนตรีที่ค้นหา</p>
            <p className="text-gray-500">ลองใช้คำค้นหาอื่น หรือกดค้นหาทั้งหมดดูครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {musicians.map((m) => (
              <MusicianCard 
                key={m.user_id} 
                data={m} 
                onInvite={handleInvite} 
              />
            ))}
          </div>
        )}
      </section>

      {/* 7. Footer */}
      <footer className="bg-zinc-900 pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Band<span className="text-yellow-500">Mate</span></h2>
                <p className="text-gray-400 max-w-xs">
                    แพลตฟอร์มสำหรับนักดนตรีรุ่นใหม่ หาเพื่อนร่วมวง จองห้องซ้อม และสร้างสรรค์ผลงานดนตรีไปด้วยกัน
                </p>
            </div>
            <div>
                <h4 className="font-bold text-white mb-4">เมนูหลัก</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link href="/" className="hover:text-yellow-500">หน้าแรก</Link></li>
                    <li><Link href="/rooms" className="hover:text-yellow-500">จองห้องซ้อม</Link></li>
                    <li><Link href="/match" className="hover:text-yellow-500">ระบบ Matching</Link></li>
                    <li><Link href="/login" className="hover:text-yellow-500">เข้าสู่ระบบ</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-white mb-4">ติดต่อเรา</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li>📧 contact@bandmate.com</li>
                    <li>📞 02-123-4567</li>
                    <li>📍 Bangkok, Thailand</li>
                </ul>
            </div>
        </div>
        <div className="text-center pt-8 border-t border-white/5 text-gray-600 text-sm">
            <p>© 2025 BandMate Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}