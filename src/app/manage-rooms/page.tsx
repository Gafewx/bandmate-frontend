'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Form Data สำหรับสร้างห้องใหม่
  const [formData, setFormData] = useState({
    room_name: '',
    description: '',
    price_per_hour: '',
    location: '',
    room_img: ''
  });

  // โหลดข้อมูล
  const fetchRooms = () => {
    axios.get('/api/rooms').then(res => setRooms(res.data));
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // ถ้าไม่ใช่ owner ดีดกลับหน้าแรก (Security check)
    if (parsedUser.role !== 'owner') {
      alert('หน้านี้สำหรับเจ้าของห้องซ้อมเท่านั้นครับ');
      router.push('/');
    }

    fetchRooms();
  }, [router]);

  // ฟังก์ชันเพิ่มห้อง
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await axios.post('/api/rooms', {
        ...formData,
        owner_id: user.user_id, // ผูกกับคนล็อกอิน
        price_per_hour: Number(formData.price_per_hour)
      });
      alert('✅ เพิ่มห้องสำเร็จ!');
      setFormData({ room_name: '', description: '', price_per_hour: '', location: '', room_img: '' }); // เคลียร์ฟอร์ม
      fetchRooms(); // โหลดรายการใหม่
    } catch (error) {
      alert('❌ เพิ่มห้องไม่สำเร็จ');
    }
  };

  // ฟังก์ชันลบห้อง
  const handleDelete = async (id: number) => {
    if(!confirm('ยืนยันจะลบห้องนี้?')) return;
    try {
      await axios.delete(`/api/rooms/${id}`);
      fetchRooms();
    } catch (error) {
      alert('ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">🛠️ จัดการห้องซ้อม (Owner Mode)</h1>
            <Link href="/" className="text-blue-500 hover:underline">กลับหน้าหลัก</Link>
        </div>

        {/* ฟอร์มเพิ่มห้อง */}
        <form onSubmit={handleCreate} className="mb-10 bg-gray-50 p-6 rounded border">
            <h3 className="font-bold mb-4">เพิ่มห้องใหม่</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="ชื่อห้อง" required className="border p-2 rounded" 
                    value={formData.room_name} onChange={e => setFormData({...formData, room_name: e.target.value})} />
                
                <input placeholder="ราคาต่อชม." type="number" required className="border p-2 rounded" 
                    value={formData.price_per_hour} onChange={e => setFormData({...formData, price_per_hour: e.target.value})} />
                
                <input placeholder="สถานที่" required className="border p-2 rounded" 
                    value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                
                <input placeholder="URL รูปภาพ" required className="border p-2 rounded" 
                    value={formData.room_img} onChange={e => setFormData({...formData, room_img: e.target.value})} />
                
                <textarea placeholder="รายละเอียดห้อง" required className="border p-2 rounded col-span-2" 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                + สร้างห้องซ้อม
            </button>
        </form>

        {/* ตารางรายการห้องที่มีอยู่ */}
        <h3 className="font-bold mb-4">รายการห้องของคุณ</h3>
        <div className="space-y-4">
            {rooms.map(room => (
                <div key={room.room_id} className="flex justify-between items-center border p-4 rounded bg-white hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                        <img src={room.room_img} className="w-16 h-16 object-cover rounded" />
                        <div>
                            <p className="font-bold">{room.room_name}</p>
                            <p className="text-sm text-gray-500">{room.location} | ฿{room.price_per_hour}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleDelete(room.room_id)} 
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                        ลบ
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}