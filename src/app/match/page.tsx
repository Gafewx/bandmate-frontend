'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/src/components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import SkillChart from '../../components/SkillChart';

export default function MatchPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [chatLoading, setChatLoading] = useState<number | null>(null);

    // States ใหม่สำหรับ Filter และ Modal
    const [selectedInstrument, setSelectedInstrument] = useState('All');
    const [viewingUser, setViewingUser] = useState<any>(null);

    const instruments = ['All', 'Guitar', 'Bass', 'Drums', 'Vocal', 'Keyboard', 'Other'];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const u = JSON.parse(userData);
        setUser(u);
        fetchMatches(u.user_id);
    }, [router]);

    const fetchMatches = async (userId: number) => {
        try {
            const config = { headers: { "ngrok-skip-browser-warning": "true" } };
            const res = await axios.get(`/api/users/match/${userId}`, config);
            setMatches(res.data);
        } catch (error) {
            console.error(error);
            toast.error('โหลดข้อมูล Matching ไม่ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (targetUserId: number, targetName: string) => {
        if (!user) return;
        setChatLoading(targetUserId);
        try {
            await axios.post(`/api/chats/start`, {
                myId: user.user_id,
                targetId: targetUserId
            }, {
                headers: { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" }
            });
            // toast.success(`เริ่มสนทนากับ ${targetName} แล้ว!`);
            router.push('/chat');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการเริ่มแชท');
        } finally {
            setChatLoading(null);
        }
    };

    // Logic การกรองข้อมูล
    const filteredMatches = matches.filter(m =>
        selectedInstrument === 'All' || m.instrument?.toLowerCase() === selectedInstrument.toLowerCase()
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <Toaster position="top-center" />
            <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); router.push('/login'); }} />

            <div className="max-w-7xl mx-auto px-6 pt-28">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 mb-4">
                        BandMate Match
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        ค้นหาพาร์ทเนอร์นักดนตรีที่เข้ากันได้ดีที่สุดจากรสนิยมและแนวเพลงที่คุณชอบ
                    </p>
                </div>

                {/* 🎸 Instrument Filter Bar */}
                <div className="flex gap-3 mb-12 overflow-x-auto pb-4 justify-start md:justify-center no-scrollbar">
                    {instruments.map(inst => (
                        <button
                            key={inst}
                            onClick={() => setSelectedInstrument(inst)}
                            className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedInstrument === inst
                                ? 'bg-pink-600 border-pink-600 shadow-[0_0_20px_rgba(219,39,119,0.4)] text-white scale-105'
                                : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-pink-500/50'
                                }`}
                        >
                            {inst}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-zinc-900/50 rounded-3xl animate-pulse border border-white/5"></div>
                        ))}
                    </div>
                ) : filteredMatches.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-[3rem] border border-dashed border-white/10">
                        <span className="text-5xl block mb-4">🎵</span>
                        <p className="text-xl text-zinc-300 font-bold italic">ไม่พบนักดนตรีในหมวด {selectedInstrument}</p>
                        <p className="text-zinc-500 mt-2">ลองเปลี่ยนหมวดหมู่หรือเพิ่มแนวเพลงในโปรไฟล์ดูครับ</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMatches.map((m) => (
                            <div key={m.user_id} className="group relative bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-pink-500/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl">

                                {/* Match Score Badge */}
                                <div className="absolute top-5 right-5 z-20 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-pink-500/50">
                                    <div className="flex flex-col items-center">
                                        <span className="text-pink-500 font-black text-2xl leading-none">{m.score}%</span>
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-tighter">Match</span>
                                    </div>
                                </div>

                                {/* Banner & Profile Image */}
                                <div className="h-32 bg-gradient-to-br from-zinc-800 to-black relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${m.full_name}&background=random&color=fff&size=128`}
                                        className="w-24 h-24 rounded-full border-[6px] border-[#0a0a0a] absolute -bottom-10 left-8 shadow-2xl transition-transform duration-500 group-hover:scale-110"
                                        alt="avatar"
                                    />
                                </div>

                                <div className="pt-14 pb-8 px-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-white">{m.full_name}</h3>
                                            <span className="text-pink-500 text-xs font-black uppercase tracking-widest">{m.instrument || 'Musician'}</span>
                                        </div>
                                        <button
                                            onClick={() => setViewingUser(m)}
                                            className="p-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition"
                                            title="ดูโปรไฟล์"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${m.skill_match_percent > 80 ? 'bg-green-500' : m.skill_match_percent > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${m.skill_match_percent}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                            Skill Match: <span className="text-white">{m.skill_match_percent}%</span>
                                        </span>
                                    </div>

                                    {/* Common Genres tags */}
                                    <div className="flex flex-wrap gap-2 mb-8 h-7 overflow-hidden">
                                        {m.common.map((g: string) => (
                                            <span key={g} className="text-[10px] font-bold bg-pink-500/10 text-pink-400 px-3 py-1 rounded-lg border border-pink-500/20 uppercase tracking-wider">
                                                🔥 {g}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleStartChat(m.user_id, m.full_name)}
                                        disabled={chatLoading === m.user_id}
                                        className="w-full bg-gradient-to-r from-pink-600 to-purple-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-900/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50
                                                    hover:scale-[1.03] hover:shadow-pink-500/40 hover:brightness-110 active:scale-95"
                                    >
                                        {chatLoading === m.user_id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>💬 <span className="uppercase tracking-widest text-xs">Send Message</span></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 🔎 Profile Preview Modal */}
            {viewingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 max-w-lg w-full rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">

                        {/* 1. เปลี่ยนสี Gradient หัว Modal เป็น Yellow-Orange ให้เข้าธีม */}
                        <div className="h-32 bg-gradient-to-r from-yellow-600 to-orange-600"></div>

                        <div className="px-8 pb-10 relative">
                            <img
                                src={`https://ui-avatars.com/api/?name=${viewingUser.full_name}&background=random&color=fff&size=128`}
                                className="w-24 h-24 rounded-full border-8 border-[#121212] absolute -top-12 left-8"
                            />

                            <div className="pt-16">
                                <h2 className="text-3xl font-black text-white">{viewingUser.full_name}</h2>
                                {/* 2. เปลี่ยนสีข้อความเป็น Yellow */}
                                <p className="text-yellow-500 font-bold mb-6">{viewingUser.instrument}</p>

                                <div className="space-y-8">
                                    {/* 👇 3. แทรก Radar Chart ตรงนี้ */}
                                    <div className="bg-zinc-900/50 py-4 rounded-3xl border border-white/5">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 text-center">
                                            Performance Stats
                                        </h4>
                                        <SkillChart
                                            skills={{
                                                solo: viewingUser.skill_solo || 0,
                                                rhythm: viewingUser.skill_rhythm || 0,
                                                theory: viewingUser.skill_theory || 0,
                                                performance: viewingUser.skill_live || 0,
                                                ear: viewingUser.skill_ear || 0
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">About Musician</h4>
                                        <p className="text-zinc-300 leading-relaxed text-sm">
                                            "นักดนตรีที่ต้องการหาคนซ้อมทีมไปเล่นตามคลับบาร์ ชอบแต่งเพลงเองและเปิดรับไอเดียใหม่ๆ"
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Shared Taste</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingUser.common.map((g: string) => (
                                                /* 4. เปลี่ยนสี Tag เป็น Yellow/Zinc */
                                                <span key={g} className="bg-zinc-800 text-yellow-500 px-4 py-1.5 rounded-xl text-[10px] font-bold border border-white/5 uppercase tracking-wider">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ปุ่มด้านล่าง (Action Buttons) */}
                                <div className="mt-10 flex gap-4">
                                    <button onClick={() => setViewingUser(null)} className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-4 rounded-2xl hover:bg-zinc-700 transition uppercase text-xs">Close</button>
                                    <button
                                        onClick={() => {
                                            handleStartChat(viewingUser.user_id, viewingUser.full_name);
                                            setViewingUser(null);
                                        }}
                                        className="flex-1 bg-yellow-500 text-black font-black py-4 rounded-2xl hover:brightness-110 transition-all uppercase text-xs"
                                    >
                                        Start Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}