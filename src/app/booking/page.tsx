'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import PaymentQR from '@/src/components/PaymentQR';
import Navbar from '@/src/components/Navbar';
import Link from 'next/link';

export default function BookingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const roomId = searchParams.get('roomId');
    const roomName = searchParams.get('name');
    const price = Number(searchParams.get('price'));

    // 🟢 เปลี่ยนวิธีเก็บข้อมูล: แยกวันที่, เวลาเริ่ม, และจำนวนชั่วโมง
    const [bookingDate, setBookingDate] = useState('');     // วันที่ (เช่น 2023-12-25)
    const [startTime, setStartTime] = useState('12:00');    // เวลาเริ่ม (ค่า Default)
    const [duration, setDuration] = useState(1);            // จำนวนชั่วโมง (Default 1 ชม.)

    const [user, setUser] = useState<any>(null);
    const [totalPrice, setTotalPrice] = useState(0);

    // สร้างรายการเวลาให้เลือก (09:00 - 23:00)
    const timeSlots = Array.from({ length: 15 }, (_, i) => {
        const hour = 9 + i;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert('กรุณาล็อกอินก่อนจองห้องครับ');
            router.push('/login');
        } else {
            setUser(JSON.parse(userData));
        }
    }, [router]);

    // 🧮 คำนวณราคาทันทีเมื่อมีการเปลี่ยนค่า
    useEffect(() => {
        if (price && duration > 0) {
            setTotalPrice(price * duration);
        }
    }, [duration, price]);

    const handleBooking = async () => {
        if (!bookingDate || !startTime) return alert('กรุณาเลือกวันและเวลาให้ครบ');

        // 🧠 Logic คำนวณเวลาเริ่ม-จบ ส่งให้ Backend
        const startDateTimeString = `${bookingDate}T${startTime}:00`;
        const start = new Date(startDateTimeString);

        // คำนวณเวลาจบ (เอาเวลาเริ่ม + จำนวนชั่วโมง)
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

        try {
            await axios.post(
                'api/bookings',
                {
                    user_id: user.user_id,
                    room_id: roomId,
                    price_per_hour: price,
                    start_time: start.toISOString(),
                    end_time: end.toISOString()
                },
                { // 👇 ส่วนที่เพิ่มเข้ามา (Argument ที่ 3)
                    headers: {
                        "ngrok-skip-browser-warning": "true",
                        "Content-Type": "application/json"
                    }
                }
            );

            alert('✅ จองเรียบร้อย! เตรียมตัวไปซ้อมได้เลย');
            router.push('/my-bookings');

        } catch (error: any) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                alert(`❌ จองไม่ได้: ${error.response.data.message || 'เวลานี้มีคนจองแล้ว'}`);
            } else {
                alert('❌ เกิดข้อผิดพลาดในการจอง');
            }
        }
    };

    // คำนวณเวลาจบเพื่อโชว์ให้ user เห็น
    const getEndTimeDisplay = () => {
        if (!bookingDate || !startTime) return '-';
        const start = new Date(`${bookingDate}T${startTime}:00`);
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
        return end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">

            <Navbar user={user} onLogout={handleLogout} />

            <div className="pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 👈 ฝั่งซ้าย: ฟอร์มเลือกแบบง่าย */}
                    <div className="bg-zinc-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
                        <Link href="/rooms" className="text-gray-400 text-sm hover:text-white mb-6 inline-block">
                            ← เปลี่ยนห้อง
                        </Link>

                        <h1 className="text-3xl font-bold mb-2 text-white">
                            จองห้องซ้อม 🎸
                        </h1>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-yellow-500 font-bold text-lg">{roomName}</span>
                            <span className="bg-zinc-800 text-xs px-2 py-1 rounded text-gray-400">฿{price}/ชม.</span>
                        </div>

                        <div className="space-y-6">
                            {/* 1. เลือกวันที่ */}
                            <div>
                                <label className="block text-gray-300 font-bold mb-2">1. เลือกวันที่จะมาซ้อม</label>
                                <input
                                    type="date"
                                    className="w-full bg-black border border-zinc-700 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white text-lg"
                                    style={{ colorScheme: 'dark' }}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]} // ห้ามเลือกย้อนหลัง
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* 2. เลือกเวลาเริ่ม (Dropdown) */}
                                <div>
                                    <label className="block text-gray-300 font-bold mb-2">2. เริ่มกี่โมง?</label>
                                    <select
                                        className="w-full bg-black border border-zinc-700 p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none text-white text-lg appearance-none cursor-pointer"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time} น.</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3. เลือกจำนวนชั่วโมง */}
                                <div>
                                    <label className="block text-gray-300 font-bold mb-2">3. ซ้อมกี่ชั่วโมง?</label>
                                    <div className="flex items-center bg-black border border-zinc-700 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setDuration(prev => Math.max(1, prev - 1))}
                                            className="px-4 py-4 hover:bg-zinc-800 text-yellow-500 font-bold text-xl transition"
                                        >-</button>
                                        <div className="flex-1 text-center font-bold text-lg">{duration} ชม.</div>
                                        <button
                                            onClick={() => setDuration(prev => Math.min(8, prev + 1))} // ลิมิตไม่เกิน 8 ชม.
                                            className="px-4 py-4 hover:bg-zinc-800 text-green-500 font-bold text-xl transition"
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box: บอกเวลาสรุป */}
                            {bookingDate && (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">i</div>
                                    <p className="text-blue-200 text-sm">
                                        คุณจะซ้อมตั้งแต่ <span className="font-bold text-white">{startTime}</span> ถึง <span className="font-bold text-white">{getEndTimeDisplay()}</span> น.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 👉 ฝั่งขวา: สรุปยอด & QR Code */}
                    <div className="flex flex-col gap-6">
                        {/* Card สรุปยอด */}
                        <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-6 text-gray-200">🧾 สรุปยอดชำระ</h2>

                            <div className="space-y-3 mb-6 border-b border-zinc-800 pb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>ราคาต่อชั่วโมง</span>
                                    <span>฿{price}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>จำนวนเวลา</span>
                                    <span>{duration} ชั่วโมง</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <span className="text-lg font-bold text-gray-300">รวมทั้งหมด</span>
                                <span className="text-5xl font-extrabold text-green-400 tracking-tight">
                                    ฿{totalPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Card QR Code */}
                        {bookingDate && totalPrice > 0 ? (
                            <div className="bg-white text-black p-6 rounded-3xl shadow-2xl animate-fade-in-up border-4 border-yellow-400 relative text-center">
                                <div className="bg-yellow-100 text-yellow-800 font-bold px-4 py-2 rounded-lg mb-4 inline-block text-sm">
                                    📲 สแกน QR เพื่อจ่ายเงิน
                                </div>

                                <div className="flex justify-center mb-4">
                                    <PaymentQR
                                        amount={totalPrice}
                                        phoneNumber="0863795323" // 👈 แก้เบอร์ตรงนี้
                                    />
                                </div>

                                <button
                                    onClick={handleBooking}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 hover:scale-[1.02] transition shadow-lg flex items-center justify-center gap-2"
                                >
                                    <span>โอนแล้ว! ยืนยันการจอง</span>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-zinc-900/50 border border-dashed border-zinc-700 p-8 rounded-3xl text-center text-gray-500">
                                กรุณาเลือกวันที่และเวลา<br />เพื่อแสดง QR Code
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}