'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import BandChat from '@/src/components/BandChat';
import SetlistManager from '@/src/components/SetlistManager'; // ✅ 1. นำเข้า Component

export default function BandDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [band, setBand] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // States
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [matches, setMatches] = useState<any[]>([]); 
  const [inviteLoading, setInviteLoading] = useState<number | null>(null);
  const [nextBooking, setNextBooking] = useState<any>(null);

  // Tab Control (เพิ่ม Tab setlist กลับมา)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'setlist'>('dashboard');

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    userId: number | null;
    name: string;
    type: 'kick' | 'leave';
  }>({ show: false, userId: null, name: '', type: 'kick' });

  useEffect(() => {
    if (!id) return;
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    const u = JSON.parse(userData);
    setUser(u);
    fetchBandDetail();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    if (activeTab === 'dashboard') fetchNextBooking();
    // ⚠️ ไม่ต้องดึง Setlist ตรงนี้แล้ว เพราะ Component จัดการเอง
  }, [activeTab, id]);

  const fetchMatches = async (userId: number) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/users/match/${userId}`);
      setMatches(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchBandDetail = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bands/${id as string}`);
      setBand(res.data);
      setLoading(false);
    } catch (error) {
      toast.error('ไม่พบข้อมูลวง');
      router.push('/bands');
    }
  };

  const fetchNextBooking = async () => {
    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bookings/band/${id}/upcoming`);
        if (res.data && res.data.length > 0) {
            setNextBooking(res.data[0]);
        } else {
            setNextBooking(null);
        }
    } catch (err) {
        console.log("No upcoming booking");
    }
  };

  const initiateRemove = (userId: number, name: string, type: 'kick' | 'leave') => {
    setConfirmModal({ show: true, userId, name, type });
  };

  const executeRemove = async () => {
    if (!confirmModal.userId) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bands/${id as string}/members/${confirmModal.userId}`, {
        data: { requesterId: user.user_id }
      });

      if (confirmModal.type === 'leave') {
          toast.success('คุณออกจากวงเรียบร้อย 👋');
          router.push('/bands'); 
      } else {
          toast.success(`ลบ ${confirmModal.name} เรียบร้อย 🗑️`);
          fetchBandDetail();
      }
      setConfirmModal({ ...confirmModal, show: false });
    } catch (error) {
      toast.error('ทำรายการไม่สำเร็จ');
    }
  };

  const handleInvite = async (targetUserId: number) => {
    setInviteLoading(targetUserId);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bands/${id as string}/add-member`, { userId: targetUserId });
      toast.success('ส่งคำเชิญเรียบร้อย! รอเพื่อนตอบรับนะครับ ⏳');
      fetchBandDetail(); 
      setMatches(prev => prev.filter(m => m.user_id !== targetUserId));
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setInviteLoading(null);
    }
  };

  const openInviteModal = () => {
    if (user) fetchMatches(user.user_id);
    setShowInviteModal(true);
  }

  if (loading || !band) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      
      {/* ⚠️ เพิ่ม Class print:hidden เพื่อซ่อน Navbar เวลาปริ้นท์จาก Component ลูก */}
      <div className="print:hidden">
        <Toaster position="top-center" />
        <Navbar user={user} onLogout={() => router.push('/login')} />

        {/* Cover Image */}
        <div className="h-64 w-full bg-gradient-to-b from-zinc-800 to-black relative">
          <img src={band.band_img || 'https://via.placeholder.com/1500x500'} className="w-full h-full object-cover opacity-40 blur-sm" />
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0a0a0a] to-transparent">
              <div className="max-w-6xl mx-auto flex items-end gap-6">
                  <img src={band.band_img || 'https://via.placeholder.com/150'} className="w-32 h-32 rounded-3xl border-4 border-[#0a0a0a] shadow-2xl bg-zinc-800 object-cover" />
                  <div className="mb-2">
                      <h1 className="text-5xl font-black text-white">{band.band_name}</h1>
                      <p className="text-zinc-400 mt-1 text-lg max-w-2xl">{band.description}</p>
                  </div>
              </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mt-6 gap-2">
          <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-white text-black shadow-lg scale-105' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
          >
              📊 Dashboard
          </button>
          
          {/* ✅ 2. ปุ่ม Setlist เปลี่ยนกลับมาเป็น setActiveTab */}
          <button 
              onClick={() => setActiveTab('setlist')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === 'setlist' ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
          >
              🎵 Setlist
          </button>

          <button 
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white text-black shadow-lg scale-105' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
          >
              💬 Group Chat
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        
        {/* --- Tab: Dashboard --- */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Members */}
                <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-left-4 duration-500">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                👥 Members <span className="text-sm bg-zinc-800 px-2 py-1 rounded-lg text-zinc-500 font-black">{band.members.length}</span>
                            </h2>
                            <button onClick={openInviteModal} className="bg-white text-black px-5 py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2 active:scale-95">
                                + Invite Friend
                            </button>
                        </div>
                        <div className="space-y-3">
                            {band.members.map((m: any) => {
                                const amILeader = band.members.find((me: any) => me.user.user_id === user?.user_id)?.role === 'leader';
                                const isMe = m.user.user_id === user?.user_id;
                                return (
                                    <div key={m.id} className="flex items-center justify-between p-4 bg-zinc-800/30 border border-white/5 rounded-2xl hover:bg-zinc-800/80 transition group">
                                        <div className="flex items-center gap-4">
                                            <img src={`https://ui-avatars.com/api/?name=${m.user.full_name}&background=random`} className="w-12 h-12 rounded-full border-2 border-zinc-900" />
                                            <div>
                                                <h4 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">{m.user.full_name}</h4>
                                                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                                    <span className={`${m.role === 'leader' ? 'text-yellow-500' : 'text-zinc-500'}`}>{m.role}</span>
                                                    <span className="text-zinc-600">•</span>
                                                    <span className={`${m.status === 'active' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>{m.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {m.role === 'leader' && <span className="text-xl" title="Leader">👑</span>}
                                            {amILeader && !isMe && m.role !== 'leader' && (
                                                <button onClick={() => initiateRemove(m.user.user_id, m.user.full_name, 'kick')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            )}
                                            {isMe && m.role !== 'leader' && (
                                                <button onClick={() => initiateRemove(m.user.user_id, m.user.full_name, 'leave')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-yellow-500/20 text-zinc-600 hover:text-yellow-500 transition">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Status */}
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 delay-100">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6">
                        <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs mb-4">Band Status</h3>
                        {nextBooking ? (
                            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 group-hover:w-2 transition-all duration-300"></div>
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Upcoming Rehearsal</p>
                                        <h4 className="font-bold text-2xl text-white">{new Date(nextBooking.booking_date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                                    </div>
                                    <span className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded border border-green-500/20">CONFIRMED</span>
                                </div>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-4xl font-black text-white tracking-tighter">{nextBooking.start_time.slice(0, 5)}</span>
                                    <span className="text-zinc-500 font-medium mb-1.5 text-sm">- {nextBooking.end_time.slice(0, 5)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300 text-sm bg-black/30 p-3 rounded-xl mb-4">
                                    <span className="text-xl">🎹</span>
                                    <div>
                                        <p className="font-bold text-white">{nextBooking.room?.room_name || 'ห้องซ้อม'}</p>
                                        <p className="text-xs text-zinc-500">{nextBooking.room?.location || 'Studio'}</p>
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/rooms/${nextBooking.room?.room_id}`)} className="w-full bg-white text-black py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-400 transition flex items-center justify-center gap-2">ดูรายละเอียด</button>
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-zinc-700 rounded-2xl bg-zinc-900/20">
                                <p className="text-zinc-500 mb-4 text-sm">ยังไม่มีตารางซ้อมเร็วๆ นี้</p>
                                <button onClick={() => router.push('/rooms')} className="text-black bg-yellow-500 px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg text-sm">จองห้องซ้อมทันที 🎸</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- Tab: Setlist --- */}
        {activeTab === 'setlist' && (
            <div className="animate-in fade-in zoom-in duration-300">
                {/* ✅ 3. เรียกใช้ Component ตรงนี้ */}
                <SetlistManager bandId={band.band_id} bandName={band.band_name} />
            </div>
        )}

        {/* --- Tab: Chat --- */}
        {activeTab === 'chat' && (
            <div className="animate-in fade-in zoom-in duration-300">
                <BandChat bandId={Number(id as string)} user={user} />
            </div>
        )}

      </div>

      {/* Modals */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <div className={`bg-[#121212] border w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 text-center ${confirmModal.type === 'kick' ? 'border-red-500/30' : 'border-yellow-500/30'}`}>
                {/* Modal Content */}
                <h3 className="text-2xl font-black text-white mb-2">{confirmModal.type === 'kick' ? 'Kick Member?' : 'Leave Band?'}</h3>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    {confirmModal.type === 'kick' 
                        ? <span>คุณแน่ใจหรือไม่ที่จะลบ <b>{confirmModal.name}</b> ออกจากวง?</span>
                        : <span>คุณแน่ใจหรือไม่ที่จะออกจากวงนี้?</span>
                    }
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 bg-zinc-800 py-3 rounded-2xl font-bold text-zinc-400 hover:text-white transition">Cancel</button>
                    <button onClick={executeRemove} className={`flex-1 py-3 rounded-2xl font-bold text-black hover:brightness-110 transition shadow-lg ${confirmModal.type === 'kick' ? 'bg-red-500' : 'bg-yellow-500'}`}>{confirmModal.type === 'kick' ? 'Yes, Kick!' : 'Yes, Leave'}</button>
                </div>
            </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900">
                    <h2 className="text-xl font-black text-white">Invite Friends</h2>
                    <button onClick={() => setShowInviteModal(false)} className="text-zinc-500 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {matches.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-zinc-500">ไม่พบเพื่อนที่ Match กัน 😢</p>
                            <button onClick={() => router.push('/match')} className="text-yellow-500 text-sm font-bold mt-2 hover:underline">ไปหาเพื่อนใหม่</button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matches.map((match) => {
                                const isAlreadyMember = band.members.some((m: any) => m.user.user_id === match.user_id);
                                if (isAlreadyMember) return null;
                                return (
                                    <div key={match.user_id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://ui-avatars.com/api/?name=${match.full_name}&background=random`} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <h4 className="font-bold text-sm">{match.full_name}</h4>
                                                <p className="text-xs text-zinc-500">{match.instrument} • {match.score}% Match</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleInvite(match.user_id)} disabled={inviteLoading === match.user_id} className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50">
                                            {inviteLoading === match.user_id ? 'Sending...' : 'Invite'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}