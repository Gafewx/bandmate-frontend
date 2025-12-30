'use client';
import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminScanner() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [bookingData, setBookingData] = useState<any>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. ดึง User จาก LocalStorage
        const userData = localStorage.getItem('user');

        if (!userData) {
            // ถ้าไม่มี User -> ดีดไป Login
            router.push('/login');
            return;
        }

        const user = JSON.parse(userData);

        // 2. เช็ค Role (สมมติว่าใน User Object มี field role)
        // อนุญาตเฉพาะ 'admin' และ 'owner'
        if (user.role !== 'admin' && user.role !== 'owner') {
            alert('⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            router.push('/'); // ดีดกลับหน้าบ้าน
            return;
        }

        // 3. ถ้าผ่าน -> อนุญาตให้โชว์หน้า Scan
        setIsAuthorized(true);

    }, [router]);

    // ถ้ายังตรวจสอบไม่เสร็จ หรือไม่มีสิทธิ์ ห้ามโชว์เนื้อหา
    if (!isAuthorized) return null;

    const handleScan = async (text: string) => {
        if (text && status === 'idle') {
            try {
                setStatus('loading');
                setScanResult(text);

                const data = JSON.parse(text);

                const res = await axios.post('/api/bookings/checkin', {
                    booking_id: data.id
                });

                setStatus('success');
                setMessage(res.data.message);
                setBookingData(res.data.data);

            } catch (error: any) {
                console.error(error);
                setStatus('error');
                const errMsg = error.response?.data?.message || 'รูปแบบ QR Code ไม่ถูกต้อง';
                setMessage(errMsg);
            }
        }
    };

    const resetScan = () => {
        setScanResult(null);
        setStatus('idle');
        setMessage('');
        setBookingData(null);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-6 text-yellow-500">📷 จุดตรวจตั๋ว (Admin)</h1>

            <div className="w-full max-w-sm aspect-square bg-zinc-900 rounded-2xl overflow-hidden border-2 border-yellow-500 relative shadow-2xl">
                {status === 'idle' ? (
                    /* 👇 แก้ไขตรงนี้ครับ */
                    <Scanner
                        onScan={(result) => {
                            // Library v2 ส่งค่ากลับมาเป็น Array ต้องเช็คก่อน
                            if (result && result.length > 0) {
                                handleScan(result[0].rawValue);
                            }
                        }}
                        onError={(error) => console.log(error)}
                    // options ถูกเปลี่ยนรูปแบบใน v2 แต่ถ้าไม่ใส่ก็ทำงานได้ครับ (ค่า default ดีอยู่แล้ว)
                    />
                ) : (
                    <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center transition-colors duration-300
        ${status === 'success' ? 'bg-green-600' :
                            status === 'loading' ? 'bg-blue-600' : // 👈 เพิ่มสีฟ้าตอนโหลด
                                'bg-red-600'} // สีแดงเฉพาะตอน Error จริงๆ
    `}>
                        <div className="text-6xl mb-4 animate-bounce">
                            {status === 'success' ? '✅' :
                                status === 'loading' ? '⏳' : // 👈 ไอคอนนาฬิกาทราย
                                    '❌'}
                        </div>

                        <h2 className="text-2xl font-bold mb-2">
                            {status === 'success' ? 'ผ่าน!' :
                                status === 'loading' ? 'กำลังตรวจสอบ...' : // 👈 ข้อความตอนโหลด
                                    'ไม่ผ่าน'}
                        </h2>

                        <p className="text-white/90">
                            {status === 'loading' ? 'กรุณารอสักครู่...' : message}
                        </p>

                        {/* โชว์ข้อมูลเฉพาะตอนสำเร็จ */}
                        {status === 'success' && bookingData && (
                            <div className="mt-4 bg-black/20 p-3 rounded-lg text-sm">
                                <p>Booking ID: #{bookingData.booking_id}</p>
                                <p>User: {bookingData.user_id}</p>
                            </div>
                        )}

                        {/* ปุ่มสแกนต่อ (ซ่อนตอนกำลังโหลด) */}
                        {status !== 'loading' && (
                            <button
                                onClick={resetScan}
                                className="mt-6 bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition"
                            >
                                สแกนคนต่อไป ⏭️
                            </button>
                        )}
                    </div>
                )}

                {status === 'idle' && (
                    <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                        <p className="text-white/50 text-xs mt-32 animate-pulse">วาง QR ในกรอบเพื่อสแกน</p>
                    </div>
                )}
            </div>

            <Link href="/" className="mt-8 text-gray-500 text-sm underline">
                กลับหน้าหลัก
            </Link>
        </div>
    );
}