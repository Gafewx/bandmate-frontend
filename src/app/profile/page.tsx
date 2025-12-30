'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        full_name: '',
        instrument: '',
        genres: '',
        bio: '',
        youtube_link: '',
        profile_img: '',
        is_looking_for_band: true
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // ดึงข้อมูลล่าสุด
        axios.get(`/api/users/${parsedUser.user_id}`)
            .then(res => {
                setFormData({
                    full_name: res.data.full_name || '',
                    instrument: res.data.instrument || '',
                    genres: res.data.genres || '',
                    bio: res.data.bio || '',
                    youtube_link: res.data.youtube_link || '',
                    profile_img: res.data.profile_img || '',
                    is_looking_for_band: res.data.is_looking_for_band
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/users/${user.user_id}`, formData);

            // อัปเดต LocalStorage
            const newUser = { ...user, ...formData };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser); // อัปเดต State ให้ Navbar เห็นการเปลี่ยนแปลงทันที

            alert('✅ บันทึกข้อมูลเรียบร้อย!');
        } catch (error) {
            console.error(error);
            alert('❌ บันทึกไม่สำเร็จ');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Profile... 🎸</div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
            
            {/* 1. ใส่ Navbar เพื่อให้เหมือนหน้าอื่น */}
            <Navbar user={user} onLogout={handleLogout} />

            <div className="max-w-5xl mx-auto py-24 px-6">
                <div className="bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row">

                    {/* 🎨 ฝั่งซ้าย: Preview Card (ปรับเป็น Dark Mode) */}
                    <div className="md:w-1/3 bg-gradient-to-b from-zinc-800 to-black p-8 flex flex-col items-center text-center relative border-r border-white/10">
                        <div className="relative z-10 w-full flex flex-col items-center">
                            {/* รูปโปรไฟล์ */}
                            <div className="w-40 h-40 rounded-full border-4 border-yellow-500 overflow-hidden mb-6 shadow-[0_0_20px_rgba(234,179,8,0.3)] bg-zinc-800">
                                {formData.profile_img ? (
                                    <img src={formData.profile_img} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-zinc-600">?</div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-white">{formData.full_name || user.username}</h2>
                            <p className="text-yellow-500 font-semibold mt-1 uppercase tracking-wider text-sm">{formData.instrument || 'Musician'}</p>

                            <div className="mt-8 w-full text-left bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                <p className="text-xs text-gray-400 uppercase mb-2">Status</p>
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${formData.is_looking_for_band ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
                                    <span className={`text-sm font-bold ${formData.is_looking_for_band ? 'text-green-400' : 'text-red-400'}`}>
                                        {formData.is_looking_for_band ? 'Looking for Band' : 'Not Available'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 📝 ฝั่งขวา: Edit Form (ปรับ Input เป็น Dark Mode) */}
                    <div className="md:w-2/3 p-8 md:p-12">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
                            🛠️ แก้ไขข้อมูลส่วนตัว
                        </h1>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">ชื่อที่ใช้แสดง</label>
                                    <input type="text" 
                                        className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                                        value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">ตำแหน่ง</label>
                                    <select 
                                        className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                                        value={formData.instrument} onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                    >
                                        <option value="">ระบุตำแหน่ง...</option>
                                        <option value="Vocal">🎤 ร้องนำ (Vocal)</option>
                                        <option value="Guitar">🎸 กีตาร์ (Guitar)</option>
                                        <option value="Bass">🎸 เบส (Bass)</option>
                                        <option value="Drums">🥁 กลอง (Drums)</option>
                                        <option value="Keyboard">🎹 คีย์บอร์ด (Keyboard)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    แนวเพลงที่ชอบ (สำคัญสำหรับ Matching ❤️)
                                </label>
                                <input type="text" placeholder="เช่น Rock, Jazz, Pop, Indie..." 
                                    className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                                    value={formData.genres} onChange={e => setFormData({ ...formData, genres: e.target.value })} 
                                />
                                <p className="text-xs text-gray-500 mt-1">*คั่นด้วยเครื่องหมายจุลภาค ( , )</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Bio แนะนำตัวสั้นๆ</label>
                                <textarea rows={3} placeholder="สไตล์การเล่น, วงที่ชอบ, ประสบการณ์..." 
                                    className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition resize-none"
                                    value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">YouTube Link</label>
                                    <input type="url" placeholder="https://youtube.com/..." 
                                        className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-blue-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                                        value={formData.youtube_link} onChange={e => setFormData({ ...formData, youtube_link: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">รูปโปรไฟล์ (URL)</label>
                                    <input type="text" placeholder="วางลิงก์รูปภาพ..." 
                                        className="w-full p-3 rounded-xl bg-black border border-zinc-700 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition"
                                        value={formData.profile_img} onChange={e => setFormData({ ...formData, profile_img: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                                <input type="checkbox" id="looking" 
                                    className="w-5 h-5 accent-yellow-500 rounded cursor-pointer"
                                    checked={formData.is_looking_for_band}
                                    onChange={e => setFormData({ ...formData, is_looking_for_band: e.target.checked })} 
                                />
                                <label htmlFor="looking" className="font-bold text-yellow-500 cursor-pointer select-none">
                                    เปิดสถานะ "หาวงดนตรี" (แสดงในหน้าค้นหา)
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg transform active:scale-[0.99]">
                                บันทึกการเปลี่ยนแปลง 💾
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}