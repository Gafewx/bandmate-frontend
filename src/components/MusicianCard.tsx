'use client';

import HeartButton from './HeartButton';
import { useState, useEffect } from 'react';

interface MusicianCardProps {
  data: any;
  onInvite: (id: number, name: string) => void;
}

export default function MusicianCard({ data, onInvite }: MusicianCardProps) {
  // ✅ 1. เตรียมข้อมูล Genres ให้เป็น Array และตัดช่องว่างออก
  const genres = data.genres ? data.genres.split(',').map((g: string) => g.trim()) : [];
  const [myId, setMyId] = useState<number>(0);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setMyId(JSON.parse(user).user_id);
  }, []);

  return (
    <div className="group bg-zinc-900/50 border border-white/5 rounded-3xl p-6 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-2 hover:border-yellow-500/30 shadow-lg relative overflow-hidden flex flex-col h-full">
      
      {/* Status Dot */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <HeartButton userId={myId} targetId={data.user_id} type="musician" />
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-gray-700 to-black mb-3 group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-500">
          <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800">
              {data.profile_img ? (
                  <img src={data.profile_img} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">🎸</div>
              )}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-400 transition truncate w-full">
            {data.full_name || data.username}
        </h3>
        <span className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded text-gray-300">
          {data.instrument || 'Musician'}
        </span>
      </div>

      {/* ✅ 2. แก้ไขส่วนแสดง Genres (ใหม่) */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-6 min-h-[1rem]">
          {genres.length > 0 ? (
            // โชว์แค่ 4 อันแรก
            genres.slice(0, 4).map((g: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-gray-400 border border-zinc-700 whitespace-nowrap w-fit">
                  {g}
              </span>
            ))
          ) : (
             <span className="text-xs text-gray-600">- ไม่ระบุแนว -</span>
          )}
          
          {/* ถ้ามีมากกว่า 4 อัน ให้โชว์ +X */}
          {genres.length > 4 && (
             <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800 text-gray-500 border border-zinc-700 w-fit">
               +{genres.length - 4}
             </span>
          )}
      </div>

      {/* Bio */}
      <p className="text-gray-500 text-sm text-center mb-6 line-clamp-2 h-10 px-2 flex-grow">
          "{data.bio || 'พร้อมร่วมวงครับ...'}"
      </p>

      {/* Buttons */}
      <div className="space-y-2 mt-auto">
          {data.youtube_link && (
              <a href={data.youtube_link} target="_blank" className="flex items-center justify-center gap-2 w-full bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white py-2 rounded-xl text-sm font-bold transition">
                  <span>▶</span> ดูผลงาน YouTube
              </a>
          )}
          
          <button onClick={() => onInvite(data.user_id, data.full_name || data.username)} 
              className="w-full bg-white text-black font-bold py-2 rounded-xl hover:bg-yellow-400 transition transform active:scale-95 shadow-lg">
              👋 ชวนร่วมวง
          </button>
      </div>
    </div>
  );
}