'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface HeartButtonProps {
  userId: number;   // ID ของคนกด (เราเอง)
  targetId: number; // ID ของสิ่งที่จะกด (นักดนตรี/ห้อง)
  type: 'musician' | 'room';
}

export default function HeartButton({ userId, targetId, type }: HeartButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // เช็คสถานะเริ่มต้น
  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/favorites/user/${userId}`)
      .then(res => {
        const found = res.data.find((f: any) => f.target_id === targetId && f.type === type);
        if (found) setIsLiked(true);
      });
  }, [userId, targetId, type]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // กันไม่ให้คลิกทะลุไปโดนการ์ด
    if (!userId) return alert('กรุณาล็อกอินก่อนนะครับ');

    // เริ่ม Animation
    setIsAnimating(true);
    setIsLiked(!isLiked);

    try {
      await axios.post('/api/favorites/toggle', {
        user_id: userId,
        target_id: targetId,
        type
      });
    } catch (error) {
      console.error(error);
      setIsLiked(!isLiked); // Revert ถ้า error
    }

    // จบ Animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button 
      onClick={toggleLike}
      className={`relative p-2 rounded-full transition-all duration-300 hover:bg-white/10 group
        ${isAnimating ? 'scale-125' : 'scale-100'}
      `}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={isLiked ? "#ef4444" : "none"} // สีแดง (Red-500) ถ้าชอบ
        stroke={isLiked ? "#ef4444" : "currentColor"} 
        strokeWidth="2" 
        className={`w-6 h-6 transition-colors duration-300 
          ${isLiked ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-gray-400 group-hover:text-red-400'}
        `}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
      </svg>
    </button>
  );
}