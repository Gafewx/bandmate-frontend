'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '@/src/components/Navbar';
import { useRouter } from 'next/navigation';

export default function SetlistManager() {
    const router = useRouter();

    // ✅ State สำหรับเก็บข้อมูล
    const [band, setBand] = useState<any>(null); // เก็บข้อมูลวง
    const [setlists, setSetlists] = useState<any[]>([]);
    const [activeSetlist, setActiveSetlist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // ✅ Form States
    const [newSetlistTitle, setNewSetlistTitle] = useState('');
    const [newSong, setNewSong] = useState({ title: '', artist: '', key: '', youtube_link: '' });
    const [showAddSetlist, setShowAddSetlist] = useState(false);

    // 🔄 useEffect: ทำงานแค่ครั้งเดียวตอนโหลดหน้า
    useEffect(() => {
        const u = localStorage.getItem('user');
        if (!u) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(u);
        setUser(parsedUser);

        // 🚀 เริ่มต้นกระบวนการ: หา User -> หาวง -> หา Setlist
        fetchUserBand(parsedUser.user_id);
    }, []);

    // 1️⃣ ฟังก์ชันหาวงของ User
    const fetchUserBand = async (userId: number) => {
        try {
            // ยิงไปถาม Backend ว่า User คนนี้อยู่วงไหน?
            const res = await axios.get(`/api/bands/my-band?userId=${userId}`);
            
            if (res.data) {
                setBand(res.data); // เจาวงแล้ว! เก็บใส่ State
                fetchSetlists(res.data.band_id); // ดึง Setlist ต่อเลย (ส่ง ID ที่ถูกต้องไป)
            } else {
                setLoading(false); // ไม่มีวง ก็หยุดโหลด
            }
        } catch (err) {
            console.error("Error fetching band:", err);
            setLoading(false);
        }
    };

    // 2️⃣ ฟังก์ชันดึง Setlist (รับ ID มาจากฟังก์ชันข้างบน ไม่ใช้ตัวแปร Global)
    const fetchSetlists = async (bandId: number) => {
        try {
            const res = await axios.get(`/api/setlists?bandId=${bandId}`);
            setSetlists(res.data);
            if (res.data.length > 0 && !activeSetlist) {
                setActiveSetlist(res.data[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching setlists:", err);
            setLoading(false);
        }
    };

    // --- Action Handlers ---

    const handleCreateSetlist = async () => {
        if (!newSetlistTitle || !band) return;
        try {
            await axios.post(`/api/setlists`, {
                bandId: band.band_id,
                title: newSetlistTitle
            });
            setNewSetlistTitle('');
            setShowAddSetlist(false);
            fetchSetlists(band.band_id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSong.title) return;
        try {
            await axios.post(`/api/setlists/${activeSetlist.setlist_id}/songs`, newSong);
            setNewSong({ title: '', artist: '', key: '', youtube_link: '' });
            fetchSetlists(band.band_id);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (songId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'pending' ? 'learning' : currentStatus === 'learning' ? 'ready' : 'pending';
        
        // Optimistic Update
        const updatedSetlists = setlists.map(list => {
            if (list.setlist_id === activeSetlist.setlist_id) {
                return {
                    ...list,
                    songs: list.songs.map((s: any) => s.song_id === songId ? { ...s, status: nextStatus } : s)
                };
            }
            return list;
        });
        setSetlists(updatedSetlists);
        setActiveSetlist(updatedSetlists.find((l: any) => l.setlist_id === activeSetlist.setlist_id));

        await axios.patch(`/api/setlists/songs/${songId}`, { status: nextStatus });
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-20">
            <Navbar user={user} onLogout={() => router.push('/login')} />
            
            <div className="max-w-6xl mx-auto px-6 pt-28">
                
                {/* กรณี User ยังไม่มีวง */}
                {!band ? (
                    <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800">
                        <h2 className="text-3xl font-bold mb-4">คุณยังไม่มีวงดนตรี 🎸</h2>
                        <p className="text-gray-400 mb-8">ต้องมีวงก่อนถึงจะจัดการ Setlist ได้นะครับ</p>
                        <button 
                            onClick={() => router.push('/bands/create')} 
                            className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition"
                        >
                            + สร้างวงดนตรีใหม่
                        </button>
                    </div>
                ) : (
                    // กรณีมีวงแล้ว แสดงหน้า Setlist
                    <>
                         <h1 className="text-4xl font-black mb-8 flex items-center gap-3">
                            🎸 Setlist: <span className="text-yellow-500">{band.band_name}</span>
                        </h1>

                        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 no-scrollbar">
                            <button 
                                onClick={() => setShowAddSetlist(true)}
                                className="flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 border border-dashed border-zinc-600"
                            >
                                + New List
                            </button>
                            {setlists.map(list => (
                                <button
                                    key={list.setlist_id}
                                    onClick={() => setActiveSetlist(list)}
                                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition whitespace-nowrap border ${
                                        activeSetlist?.setlist_id === list.setlist_id 
                                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' 
                                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-yellow-500/50'
                                    }`}
                                >
                                    {list.title}
                                    <span className="ml-2 text-xs opacity-60">({list.songs.length})</span>
                                </button>
                            ))}
                        </div>

                        {showAddSetlist && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                                <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md border border-white/10">
                                    <h3 className="text-xl font-bold mb-4">ตั้งชื่อ Setlist ใหม่</h3>
                                    <input 
                                        autoFocus
                                        value={newSetlistTitle}
                                        onChange={e => setNewSetlistTitle(e.target.value)}
                                        placeholder="เช่น ซ้อมวันศุกร์, งานโรงเรียน..."
                                        className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white mb-6 outline-none focus:border-yellow-500"
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowAddSetlist(false)} className="flex-1 py-3 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800">ยกเลิก</button>
                                        <button onClick={handleCreateSetlist} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold hover:brightness-110">สร้างเลย</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSetlist ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {activeSetlist.songs.length === 0 ? (
                                        <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
                                            <p className="text-zinc-500 text-lg">ยังไม่มีเพลงในรายการนี้</p>
                                        </div>
                                    ) : (
                                        activeSetlist.songs.map((song: any, index: number) => (
                                            <div key={song.song_id} className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/20 transition group">
                                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-500 font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                {getYoutubeId(song.youtube_link) && (
                                                    <img 
                                                        src={`https://img.youtube.com/vi/${getYoutubeId(song.youtube_link)}/default.jpg`}
                                                        className="w-16 h-12 object-cover rounded-lg opacity-80 group-hover:opacity-100 transition"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate">{song.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                        <span>🎤 {song.artist || 'Unknown Artist'}</span>
                                                        {song.key && <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">Key: {song.key}</span>}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => updateStatus(song.song_id, song.status)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition border ${
                                                        song.status === 'ready' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                        song.status === 'learning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                    }`}
                                                >
                                                    {song.status === 'ready' ? 'พร้อมลุย' : song.status === 'learning' ? 'กำลังแกะ' : 'ยังไม่เริ่ม'}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl h-fit sticky top-24">
                                    <h3 className="text-xl font-bold mb-6">🎵 เพิ่มเพลงใหม่</h3>
                                    <form onSubmit={handleAddSong} className="space-y-4">
                                        <input value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} placeholder="ชื่อเพลง *" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500" required />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} placeholder="ศิลปิน" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500" />
                                            <input value={newSong.key} onChange={e => setNewSong({...newSong, key: e.target.value})} placeholder="Key" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500" />
                                        </div>
                                        <input value={newSong.youtube_link} onChange={e => setNewSong({...newSong, youtube_link: e.target.value})} placeholder="YouTube URL" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500 text-sm" />
                                        <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:brightness-110 transition shadow-lg">+ เพิ่มลงรายการ</button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            !loading && <div className="text-center text-zinc-500 mt-20">สร้าง Setlist แรกเพื่อเริ่มใช้งาน</div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}