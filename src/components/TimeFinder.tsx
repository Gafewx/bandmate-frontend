'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TimeFinderProps {
  bandId: number;
  userId: number; // 👈 เพิ่ม userId เข้ามา เพื่อแยกแยะว่าอันไหนของเรา
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 10); // 10:00 - 24:00
const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

export default function TimeFinder({ bandId, userId }: TimeFinderProps) {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'mine' | 'team'>('mine');
  
  const [mySlots, setMySlots] = useState<string[]>([]);
  const [teamSlots, setTeamSlots] = useState<{ [key: string]: number }>({});

  // 🔄 โหลดข้อมูลจริงเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchSchedule();
  }, [bandId]);

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bands/${bandId}/schedule`);
      const allSchedules = res.data;

      // 1. แยกของฉัน (My Slots)
      const mine = allSchedules
        .filter((s: any) => s.user_id === userId)
        .map((s: any) => `${s.day}-${s.hour}`);
      setMySlots(mine);

      // 2. คำนวณภาพรวม (Heatmap)
      const teamCounts: { [key: string]: number } = {};
      allSchedules.forEach((s: any) => {
        const key = `${s.day}-${s.hour}`;
        teamCounts[key] = (teamCounts[key] || 0) + 1;
      });
      setTeamSlots(teamCounts);

    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const toggleSlot = (dayIndex: number, hour: number) => {
    if (viewMode === 'team') return; 

    const key = `${dayIndex}-${hour}`;
    setMySlots(prev => {
        if (prev.includes(key)) return prev.filter(k => k !== key);
        return [...prev, key];
    });
  };

  const saveSchedule = async () => {
    setLoading(true);
    try {
        // 💾 บันทึกลง Database จริง
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/bands/${bandId}/schedule`, {
            userId: userId,
            slots: mySlots
        });
        
        toast.success('บันทึกเวลาว่างแล้ว! 📅');
        fetchSchedule(); // โหลดใหม่เพื่ออัปเดต Team View ทันที
    } catch (error) {
        toast.error('บันทึกไม่สำเร็จ');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                📅 Time Finder <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-bold">Online</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
                {viewMode === 'mine' ? 'ระบุเวลาที่คุณ "ว่าง" เพื่อให้เพื่อนรู้' : 'สีเขียวเข้ม = เวลาทองที่ทุกคนว่างตรงกัน'}
            </p>
        </div>

        {/* View Toggle */}
        <div className="bg-zinc-800 p-1 rounded-xl flex">
            <button 
                onClick={() => setViewMode('mine')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'mine' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-white'}`}
            >
                ✏️ ของฉัน
            </button>
            <button 
                onClick={() => setViewMode('team')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'team' ? 'bg-green-500 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
            >
                👥 ภาพรวมวง
            </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="text-zinc-600 text-xs font-bold text-center pt-2">TIME</div>
                {DAYS.map(d => (
                    <div key={d} className="bg-zinc-800/50 py-2 rounded-lg text-zinc-400 font-bold text-sm text-center border border-white/5">
                        {d}
                    </div>
                ))}
            </div>

            {/* Time Slots */}
            {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                    <div className="text-zinc-600 text-xs font-mono text-center pt-3">
                        {hour}:00
                    </div>

                    {DAYS.map((_, dayIndex) => {
                        const key = `${dayIndex}-${hour}`;
                        let bgClass = 'bg-zinc-800/30 hover:bg-zinc-800'; 
                        
                        if (viewMode === 'mine') {
                            if (mySlots.includes(key)) {
                                bgClass = 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
                            }
                        } else {
                            // Heatmap Logic
                            const count = teamSlots[key] || 0;
                            if (count > 0) {
                                bgClass = count >= 4 ? 'bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.6)]' 
                                        : count >= 2 ? 'bg-green-600' 
                                        : 'bg-green-900';
                            }
                        }

                        return (
                            <div 
                                key={key}
                                onClick={() => toggleSlot(dayIndex, hour)}
                                className={`
                                    h-12 rounded-lg border border-white/5 cursor-pointer transition-all duration-200 
                                    flex items-center justify-center relative group
                                    ${bgClass}
                                `}
                            >
                                {viewMode === 'team' && teamSlots[key] && (
                                    <span className="text-[10px] font-black text-white/90 drop-shadow-md">
                                        {teamSlots[key]}👤
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
          </div>
      </div>

      {/* Footer Action */}
      {viewMode === 'mine' && (
          <div className="mt-6 flex justify-end border-t border-white/5 pt-6">
            <button 
                onClick={saveSchedule}
                disabled={loading}
                className="bg-yellow-500 text-black px-8 py-3 rounded-2xl font-bold text-lg hover:brightness-110 shadow-lg hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
                {loading ? 'Saving...' : 'บันทึกเวลาว่าง ✅'}
            </button>
          </div>
      )}
    </div>
  );
}