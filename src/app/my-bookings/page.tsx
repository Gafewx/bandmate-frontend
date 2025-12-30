'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TicketModal from '../../components/TicketModal';
import Navbar from '@/src/components/Navbar';
import ConfirmModal from '../../components/ConfirmModal'; // 👈 นำเข้า ConfirmModal
import toast, { Toaster } from 'react-hot-toast';

export default function MyBookings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // --- States สำหรับ Modals ---
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ticketBooking, setTicketBooking] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(userData);
    setUser(u);
    fetchBookings(u.user_id);
  }, [router]);

  const fetchBookings = (userId: number) => {
    axios.get(`/api/bookings/user/${userId}`, {
      headers: { "ngrok-skip-browser-warning": "true" }
    })
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error('ไม่สามารถโหลดข้อมูลการจองได้');
      });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // 1. ฟังก์ชันเปิด Confirm Modal
  const openCancelModal = (id: number) => {
    setBookingToCancel(id);
    setIsCancelModalOpen(true);
  };

  // 2. ฟังก์ชันยกเลิกการจอง (เรียกใช้หลังกดยืนยันใน Modal)
  const handleCancelBooking = async (bookingId: number) => {
    const cancelPromise = axios.patch(`/api/bookings/${bookingId}/user-cancel`,
      { userId: user.user_id },
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );

    toast.promise(cancelPromise, {
      loading: 'กำลังยกเลิกการจอง...',
      success: () => {
        fetchBookings(user.user_id);
        return '🚫 ยกเลิกการจองสำเร็จ';
      },
      error: (err) => err.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิก',
    }, {
      style: { minWidth: '250px', background: '#333', color: '#fff' },
    });
  };

  const filteredBookings = bookings.filter(b => {
    const status = b.status?.toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'waiting') return status === 'pending';
    if (activeTab === 'active') return status === 'confirmed';
    if (activeTab === 'cancelled') return status === 'cancelled';
    if (activeTab === 'complete') return status === 'completed';
    return true;
  });

  const openReviewModal = (booking: any) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedBooking) return;

    const reviewPromise = axios.post(`/api/reviews`, {
      user_id: user.user_id,
      room_id: selectedBooking.room_id,
      rating: rating,
      comment: comment
    }, { headers: { "ngrok-skip-browser-warning": "true" } });

    toast.promise(reviewPromise, {
      loading: 'กำลังส่งรีวิว...',
      success: '✅ ขอบคุณสำหรับรีวิวครับ!',
      error: 'เกิดข้อผิดพลาดในการส่งรีวิว',
    }, {
      style: { minWidth: '250px', background: '#333', color: '#fff' },
    });

    setShowReviewModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar user={user} onLogout={() => router.push('/login')} />

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">จัดการตารางซ้อมและประวัติการเข้าใช้บริการของคุณ</p>
          </div>
          <Link href="/rooms" className="group flex items-center gap-2 bg-zinc-900 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white hover:text-black transition-all duration-300">
            <span className="text-sm font-bold">➕ จองห้องเพิ่ม</span>
          </Link>
        </header>

        <div className="flex gap-4 md:gap-6 border-b border-white/5 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {['all', 'waiting', 'active', 'complete', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs md:text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === tab ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab === 'all' ? 'ทั้งหมด' :
                tab === 'waiting' ? 'รออนุมัติ' :
                  tab === 'active' ? 'อนุมัติแล้ว' :
                    tab === 'cancelled' ? 'ยกเลิกแล้ว' :
                      tab === 'complete' ? 'สำเร็จ' : ""}

              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_#eab308]"></div>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm">กำลังค้นหาตารางซ้อม...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-white/10">
            <span className="text-6xl block mb-4">🎸</span>
            <p className="text-gray-400 mb-6 text-lg">ไม่พบรายการในหมวดหมู่นี้</p>
            <Link href="/rooms" className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform inline-block">เริ่มจองตอนนี้</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((item) => (
              <div key={item.booking_id} className="group bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-yellow-500/30 rounded-3xl p-5 flex flex-col md:flex-row gap-6 transition-all duration-500">
                <div className="relative w-full md:w-48 h-32 overflow-hidden rounded-2xl shrink-0">
                  <img src={item.room_img} alt={item.room_name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-xl font-bold group-hover:text-yellow-500 transition-colors truncate">{item.room_name}</h3>
                    <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black shadow-sm shrink-0
                      ${item.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          item.status === 'completed' ? 'bg-zinc-800 text-zinc-400' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {item.status === 'confirmed' ? 'Approved' :
                        item.status === 'pending' ? 'Waiting' :
                          item.status === 'completed' ? 'Finished' :
                            item.status === 'cancelled' ? 'Cancelled' : 'Rejected'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm flex items-center gap-2"><span className="text-yellow-500">📍</span> {item.location}</p>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-[10px] text-zinc-500 font-bold">FROM</span>
                      <span className="font-medium">{formatDate(item.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-[10px] text-zinc-500 font-bold">UNTIL</span>
                      <span className="font-medium">{formatDate(item.end_time)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    {item.status === 'confirmed' && (
                      <button
                        onClick={() => setTicketBooking(item)}
                        className="bg-white text-black px-6 py-2 rounded-xl text-xs font-black hover:bg-yellow-500 transition-all flex items-center gap-2 shadow-lg"
                      >
                        🎫 VIEW TICKET
                      </button>
                    )}

                    {/* 3. ปุ่มยกเลิก เรียกใช้ openCancelModal */}
                    {(item.status === 'pending' || item.status === 'confirmed') && (
                      <button
                        onClick={() => openCancelModal(item.booking_id)}
                        className="px-6 py-2 rounded-xl text-xs font-bold border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        🚫 CANCEL
                      </button>
                    )}

                    {(item.status === 'confirmed' || item.status === 'completed') && (
                      <button
                        onClick={() => openReviewModal(item)}
                        className="bg-zinc-800 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-zinc-700 transition-all border border-white/5"
                      >
                        ⭐ REVIEW
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Total</span>
                  <span className="text-2xl md:text-3xl font-black text-white">฿{item.total_price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- Section รวม Modals --- */}

        {/* Modal ยืนยันการยกเลิก */}
        <ConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={() => bookingToCancel && handleCancelBooking(bookingToCancel)}
          title="ยืนยันการยกเลิกการจอง?"
          description="คุณแน่ใจหรือไม่ที่จะยกเลิกตารางซ้อมนี้? เจ้าของห้องจะได้รับแจ้งเตือนทันที และการกระทำนี้ไม่สามารถย้อนกลับได้"
          confirmText="ใช่, ยกเลิกเลย"
          cancelText="ไม่ยกเลิก"
          type="danger"
        />

        {/* Modal รีวิว */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#121212] border border-white/10 p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
              <h2 className="text-3xl font-black mb-2 text-center text-white">Rate the Vibe 🎸</h2>
              <p className="text-zinc-500 text-center mb-8 text-sm">{selectedBooking?.room_name}</p>

              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all duration-300 transform hover:scale-125 ${star <= rating ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-zinc-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                className="w-full bg-zinc-900 border border-white/5 p-4 rounded-2xl mb-6 focus:ring-2 focus:ring-yellow-500 outline-none text-white text-sm transition-all"
                rows={3}
                placeholder="How was the sound? The gear?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="flex gap-4">
                <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-zinc-800 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition text-sm">CLOSE</button>
                <button onClick={submitReview} className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-3 rounded-2xl font-black hover:brightness-110 transition text-sm">SUBMIT</button>
              </div>
            </div>
          </div>
        )}

        <TicketModal
          isOpen={!!ticketBooking}
          onClose={() => setTicketBooking(null)}
          booking={ticketBooking}
        />
      </div>
    </div>
  );
}