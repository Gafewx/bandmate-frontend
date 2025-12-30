'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // 👈 1. เพิ่ม import Link

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State สำหรับ Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<{ id: number, status: string } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert('กรุณาล็อกอินก่อนเข้าใช้งาน');
            router.push('/login');
            return;
        }
        const u = JSON.parse(userData);
        setUser(u);
        fetchDashboardData(u.user_id);
    }, [router]);

    const fetchDashboardData = async (ownerId: number) => {
        try {
            setLoading(true);
            // 👇 แก้ URL เป็น ngrok พร้อมใส่ Header
            const [statsRes, bookingsRes] = await Promise.all([
                axios.get(`/api/dashboard/stats`, { headers: { "ngrok-skip-browser-warning": "true" } }),
                axios.get(`/api/bookings/owner/${ownerId}`, { headers: { "ngrok-skip-browser-warning": "true" } })
            ]);
            setStats(statsRes.data);
            setBookings(bookingsRes.data);
        } catch (err) {
            console.error('Dashboard Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const openConfirmModal = (bookingId: number, newStatus: string) => {
        setSelectedBooking({ id: bookingId, status: newStatus });
        setIsModalOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedBooking || !user) return; // เช็ค user ด้วย

        try {
            // 👇 ส่ง owner_id: user.user_id ไปด้วย
            await axios.patch(`/api/bookings/${selectedBooking.id}/status`, {
                status: selectedBooking.status,
                owner_id: user.user_id // 👈 เพิ่มบรรทัดนี้สำคัญมาก!
            }, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });

            setIsModalOpen(false);
            setSelectedBooking(null);
            if (user) fetchDashboardData(user.user_id);

        } catch (error: any) {
            alert('❌ เกิดข้อผิดพลาดในการอัปเดตสถานะ');
            setIsModalOpen(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">กำลังโหลดข้อมูล... ⏳</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans relative pb-24">
            {/* เพิ่ม pb-24 เพื่อกันพื้นที่ให้ปุ่มลอยด้านล่าง */}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        📊 Owner Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">ยินดีต้อนรับ, คุณ {user?.full_name}</p>
                </div>
                <button onClick={() => window.location.reload()} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition">
                    🔄 รีเฟรชข้อมูล
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-lg">
                    <p className="text-gray-400 text-sm uppercase tracking-wider">รายได้รวมทั้งหมด</p>
                    <h2 className="text-4xl font-bold text-green-400 mt-2">฿ {stats?.totalRevenue?.toLocaleString()}</h2>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-lg">
                    <p className="text-gray-400 text-sm uppercase tracking-wider">การจองทั้งหมด</p>
                    <h2 className="text-4xl font-bold text-blue-400 mt-2">{stats?.totalBookings} รายการ</h2>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-lg">
                    <p className="text-gray-400 text-sm uppercase tracking-wider">รายได้เดือนนี้</p>
                    <h2 className="text-4xl font-bold text-yellow-400 mt-2">฿ {(stats?.monthlyRevenue?.[stats.monthlyRevenue.length - 1]?.total || 0).toLocaleString()}</h2>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 shadow-lg mb-10">
                <h3 className="text-xl font-bold mb-6 text-gray-200">📈 แนวโน้มรายได้ (6 เดือนล่าสุด)</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.monthlyRevenue || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="month" stroke="#888" tick={{ fill: '#9ca3af' }} />
                            <YAxis stroke="#888" tick={{ fill: '#9ca3af' }} tickFormatter={(val) => `฿${val / 1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                            <Bar name="รายได้ (บาท)" dataKey="total" fill="#facc15" radius={[4, 4, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 rounded-2xl border border-white/10 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-800"><h3 className="text-xl font-bold text-white">📝 รายการจองล่าสุด</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 text-gray-400 text-sm uppercase">
                                <th className="p-4">ห้องซ้อม</th>
                                <th className="p-4">ลูกค้า</th>
                                <th className="p-4">วันเวลา</th>
                                <th className="p-4">ยอดเงิน</th>
                                <th className="p-4 text-center">สถานะ</th>
                                <th className="p-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {bookings.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-500">ยังไม่มีรายการจอง</td></tr>
                            ) : (
                                bookings.map((b) => (
                                    <tr key={b.booking_id} className="hover:bg-white/5 transition">
                                        <td className="p-4 text-yellow-400 font-bold">{b.room_name}</td>
                                        <td className="p-4 text-gray-300">{b.customer_name}</td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {new Date(b.start_time).toLocaleDateString('th-TH')} <br />
                                            <span className="text-xs text-gray-500">{new Date(b.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-4 font-mono text-green-400 font-bold">฿{Number(b.total_price).toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border 
                        ${b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        b.status === 'completed' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                                            'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {b.status === 'confirmed' ? 'อนุมัติแล้ว' :
                                                    b.status === 'pending' ? 'รออนุมัติ' :
                                                        b.status === 'completed' ? 'ใช้บริการแล้ว' :
                                                            'ถูกปฏิเสธ'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {b.status === 'pending' ? (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openConfirmModal(b.booking_id, 'confirmed')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm shadow transition">✅ อนุมัติ</button>
                                                    <button onClick={() => openConfirmModal(b.booking_id, 'rejected')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm shadow transition">❌ ปฏิเสธ</button>
                                                </div>
                                            ) : <span className="text-gray-600 text-xs">-</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 👇 2. ปุ่ม Floating Scan (สแกนตั๋ว) */}
            <Link
                href="/admin/scan"
                className="fixed bottom-8 right-8 bg-yellow-400 text-black p-4 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)] hover:scale-110 hover:rotate-12 transition-all duration-300 z-50 group flex items-center justify-center"
            >
                <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    สแกนตั๋ว
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM16.5 19.5h.75v.75h-.75v-.75z" />
                </svg>
            </Link>

            {/* MODAL Component */}
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-8 max-w-sm w-full transform transition-all scale-100 animate-in fade-in zoom-in duration-200">

                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedBooking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            <span className="text-3xl">{selectedBooking.status === 'confirmed' ? '✅' : '❌'}</span>
                        </div>

                        <h3 className="text-xl font-bold text-center mb-2">ยืนยันการทำรายการ?</h3>
                        <p className="text-gray-400 text-center text-sm mb-6">
                            คุณต้องการที่จะ <span className={`font-bold ${selectedBooking.status === 'confirmed' ? 'text-green-400' : 'text-red-400'}`}>
                                {selectedBooking.status === 'confirmed' ? 'อนุมัติ (Approve)' : 'ปฏิเสธ (Reject)'}
                            </span> รายการจองนี้ใช่หรือไม่?
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition">ยกเลิก</button>
                            <button onClick={confirmAction} className={`flex-1 py-3 rounded-xl font-bold text-black transition shadow-lg ${selectedBooking.status === 'confirmed' ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}>ยืนยัน</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}