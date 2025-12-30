'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

export default function MyBandsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bands, setBands] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]); // 👈 เก็บข้อมูลคำเชิญ
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [bandName, setBandName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    const u = JSON.parse(userData);
    setUser(u);
    fetchData(u.user_id);
  }, [router]);

  const fetchData = (userId: number) => {
    fetchBands(userId);
    fetchInvitations(userId); // 👈 ดึงข้อมูลคำเชิญด้วย
  };

  const fetchBands = async (userId: number) => {
    try {
      const res = await axios.get(`/api/bands/user/${userId}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      setBands(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 👇 ฟังก์ชันดึงคำเชิญ
  const fetchInvitations = async (userId: number) => {
    try {
      const res = await axios.get(`/api/bands/invitations/user/${userId}`, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      setInvitations(res.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // 👇 ฟังก์ชันตอบรับ/ปฏิเสธ
  const handleRespond = async (memberId: number, action: 'accept' | 'reject') => {
    try {
      await axios.post(`/api/bands/invitations/${memberId}/respond`, {
        userId: user.user_id,
        action: action
      }, { headers: { "ngrok-skip-browser-warning": "true" } });

      toast.success(action === 'accept' ? 'ยินดีด้วย! คุณเข้าร่วมวงแล้ว 🎉' : 'ปฏิเสธคำเชิญแล้ว');
      fetchData(user.user_id); // Refresh ข้อมูลใหม่
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const handleCreateBand = async () => {
    if (!bandName) { toast.error('กรุณาใส่ชื่อวง'); return; }
    try {
      await axios.post(`/api/bands`, {
        name: bandName,
        description: description,
        ownerId: user.user_id
      }, { headers: { "ngrok-skip-browser-warning": "true" } });
      
      toast.success('สร้างวงเรียบร้อย! 🎸');
      setShowCreateModal(false);
      setBandName('');
      setDescription('');
      fetchBands(user.user_id);
    } catch (error) {
      toast.error('สร้างวงไม่สำเร็จ');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
      <Toaster position="top-center" />
      <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); router.push('/login'); }} />

      <div className="max-w-6xl mx-auto px-6 pt-24">
        
        {/* 👇 ส่วนแสดงคำเชิญ (Invitation Section) */}
        {invitations.length > 0 && (
          <div className="mb-12 animate-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
              📩 คำเชิญเข้าร่วมวง <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">{invitations.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {invitations.map((inv) => (
                <div key={inv.id} className="bg-zinc-900 border border-yellow-500/30 p-5 rounded-2xl flex items-center justify-between shadow-[0_0_15px_rgba(234,179,8,0.1)] relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                  <div className="flex items-center gap-4">
                    <img src={inv.band.band_img} className="w-14 h-14 rounded-xl shadow-md object-cover" />
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">{inv.band.band_name}</h3>
                      <p className="text-xs text-zinc-400">ชวนคุณเข้าร่วมวงในฐานะ <span className="text-white font-bold">{inv.role}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2 z-10">
                    <button 
                      onClick={() => handleRespond(inv.id, 'reject')}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-red-500/20 hover:text-red-500 transition"
                    >
                      ปฏิเสธ
                    </button>
                    <button 
                      onClick={() => handleRespond(inv.id, 'accept')}
                      className="px-6 py-2 rounded-xl bg-yellow-500 text-black text-xs font-black hover:scale-105 transition shadow-lg hover:shadow-yellow-500/20"
                    >
                      เข้าร่วม
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-white/5 my-10"></div>
          </div>
        )}

        {/* ส่วน Header My Bands */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              My Bands
            </h1>
            <p className="text-zinc-400 mt-2">จัดการวงดนตรีและสมาชิกทีมของคุณ</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-black px-6 py-3 rounded-2xl font-black hover:bg-yellow-500 transition-all shadow-lg flex items-center gap-2 active:scale-95"
          >
            🔥 สร้างวงใหม่
          </button>
        </div>

        {/* ส่วนรายการวง (My Bands List) */}
        {bands.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-white/10">
            <span className="text-6xl block mb-4">🥁</span>
            <p className="text-xl text-zinc-300 font-bold">คุณยังไม่มีวงดนตรี</p>
            <p className="text-zinc-500 mt-2">เริ่มสร้างตำนานของคุณวันนี้เลย!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bands.map((item) => (
              <div 
                key={item.id} 
                onClick={() => router.push(`/bands/${item.band.band_id}`)}
                className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 hover:border-yellow-500/30 transition-all duration-300 group cursor-pointer relative hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-500/5"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="overflow-hidden rounded-2xl shadow-lg w-16 h-16 shrink-0">
                    <img src={item.band.band_img} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.band.band_name} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors truncate">{item.band.band_name}</h3>
                    <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase tracking-widest border border-white/5 inline-block mt-1">
                      {item.role}
                    </span>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {item.band.description || 'ไม่มีคำอธิบายวง...'}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex -space-x-2">
                    {item.band.members?.slice(0, 4).map((m: any) => (
                       <img 
                         key={m.id} 
                         src={`https://ui-avatars.com/api/?name=${m.user.full_name}&background=random`} 
                         className="w-8 h-8 rounded-full border-2 border-zinc-900"
                         title={m.user.full_name}
                       />
                    ))}
                    {item.band.members?.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold">
                        +{item.band.members.length - 4}
                      </div>
                    )}
                  </div>
                  <button className="text-yellow-500 text-xs font-black uppercase flex items-center gap-1 group/btn hover:text-white transition-colors">
                    Manage 
                    <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal สร้างวง */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md p-8 rounded-[2rem] shadow-2xl animate-in zoom-in duration-200">
              <h2 className="text-2xl font-black text-white mb-6 text-center">Create Your Band 🤘</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Band Name</label>
                  <input 
                    type="text" 
                    value={bandName}
                    onChange={(e) => setBandName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                    placeholder="ตั้งชื่อวงเท่ๆ..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none h-24 resize-none transition-all"
                    placeholder="แนวเพลง, เป้าหมาย, หรือคำคมประจำวง..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-zinc-800 py-3 rounded-xl font-bold text-zinc-400 hover:text-white transition-colors">ยกเลิก</button>
                <button onClick={handleCreateBand} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-black hover:brightness-110 transition-all">สร้างเลย!</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}