'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OwnerBookings() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);

  // โหลดรายการคำขอ
  const fetchRequests = async (userId: number) => {
    try {
      const res = await axios.get(`/api/bookings/owner/${userId}`);
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return router.push('/login');
    const user = JSON.parse(userData);

    if (user.role !== 'owner') {
      alert('สำหรับเจ้าของห้องเท่านั้น');
      return router.push('/');
    }

    fetchRequests(user.user_id);
  }, [router]);

  // ฟังก์ชันกดเปลี่ยนสถานะ
  const handleStatus = async (bookingId: number, status: 'confirmed' | 'rejected') => {
    if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${status}?`)) return;
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status });
      // โหลดข้อมูลใหม่ (Refresh)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      fetchRequests(user.user_id);
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📋 คำขอจองห้องซ้อม</h1>
          <Link href="/" className="text-blue-500 hover:underline">กลับหน้าหลัก</Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">ห้อง</th>
                <th className="p-4">ลูกค้า</th>
                <th className="p-4">เวลา</th>
                <th className="p-4">ยอดเงิน</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.booking_id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold">{req.room_name}</td>
                  <td className="p-4">{req.customer_name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {formatDate(req.start_time)} <br /> ถึง {formatDate(req.end_time)}
                  </td>
                  <td className="p-4 font-bold text-green-600">฿{req.total_price}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                      ${req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(req.booking_id, 'confirmed')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">
                          อนุมัติ
                        </button>
                        <button onClick={() => handleStatus(req.booking_id, 'rejected')}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <p className="text-center p-8 text-gray-500">ยังไม่มีคำขอเข้ามาครับ</p>}
        </div>
      </div>
    </div>
  );
}