'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// 🔑 API Key
const YOUTUBE_API_KEY = 'AIzaSyD9maCPy0ildOaxMV2TaH2exgb8qJ1IlbA';

interface SetlistManagerProps {
    bandId: number;
    bandName: string;
}

export default function SetlistManager({ bandId, bandName }: SetlistManagerProps) {
    const [setlists, setSetlists] = useState<any[]>([]);
    const [activeSetlist, setActiveSetlist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Forms
    const [newSetlistTitle, setNewSetlistTitle] = useState('');
    const [showAddSetlist, setShowAddSetlist] = useState(false);
    const [newSong, setNewSong] = useState({ title: '', artist: '', key: '', youtube_link: '' });
    
    // Auto-Fill
    const [youtubeQuery, setYoutubeQuery] = useState('');
    const [isSearchingYT, setIsSearchingYT] = useState(false);

    // Lyrics
    const [showLyricsModal, setShowLyricsModal] = useState(false);
    const [selectedSong, setSelectedSong] = useState<any>(null);
    const [lyricsText, setLyricsText] = useState('');

    useEffect(() => {
        if (bandId) fetchSetlists();
    }, [bandId]);

    const fetchSetlists = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists?bandId=${bandId}`);
            const sortedData = res.data.map((list: any) => ({
                ...list,
                // เรียงลำดับเพลงตาม sequence ก่อนโชว์
                songs: list.songs.sort((a: any, b: any) => a.sequence - b.sequence)
            }));
            setSetlists(sortedData);
            
            if (sortedData.length > 0 && !activeSetlist) {
                setActiveSetlist(sortedData[0]);
            } else if (activeSetlist) {
                // Refresh active setlist data
                const updated = sortedData.find((l: any) => l.setlist_id === activeSetlist.setlist_id);
                if (updated) setActiveSetlist(updated);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // --- Drag & Drop Logic ---
    const onDragEnd = async (result: DropResult) => {
        if (!result.destination || !activeSetlist) return;

        // 1. จัดเรียง Array ใหม่ใน Client (Optimistic UI)
        const items = Array.from(activeSetlist.songs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // อัปเดต State ทันทีเพื่อให้ลื่น
        const updatedSetlist = { ...activeSetlist, songs: items };
        setActiveSetlist(updatedSetlist);

        // 2. ส่งลำดับใหม่ไป Backend (เงียบๆ)
        try {
            const songIds = items.map((s: any) => s.song_id);
            // ⚠️ ต้องมี API Patch /api/setlists/reorder-songs ที่ Backend
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists/reorder-songs`, { songIds });
        } catch (error) {
            toast.error('จัดเรียงไม่สำเร็จ');
            fetchSetlists(); // โหลดข้อมูลเดิมกลับมาถ้าพัง
        }
    };

    // ... (AutoFill Logic) ...
    const handleAutoFill = async () => {
        if (!youtubeQuery.trim()) return toast.error('ระบุชื่อเพลง');
        setIsSearchingYT(true);
        try {
            const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: { part: 'snippet', maxResults: 1, q: youtubeQuery, type: 'video', key: YOUTUBE_API_KEY }
            });
            if (res.data.items.length > 0) {
                const video = res.data.items[0];
                let cleanTitle = video.snippet.title.replace(/(\(|\[)(Official|MV|Music Video|Lyrics|Cover|Live|Audio|Video)(\)|\])/gi, '').replace(/\|.*/, '').trim();
                let artist = video.snippet.channelTitle.replace('VEVO', '').replace('Official', '').trim();
                if (cleanTitle.includes(' - ')) {
                    const parts = cleanTitle.split(' - ');
                    artist = parts[0].trim();
                    cleanTitle = parts.slice(1).join(' - ').trim();
                }
                setNewSong({ ...newSong, title: cleanTitle, artist: artist, youtube_link: `https://www.youtube.com/watch?v=${video.id.videoId}` });
                toast.success('ดึงข้อมูลแล้ว');
            } else { toast.error('ไม่พบข้อมูล'); }
        } catch (error) { toast.error('YouTube API Error'); } finally { setIsSearchingYT(false); }
    };

    // Actions
    const handleCreateSetlist = async () => {
        if (!newSetlistTitle) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists`, { bandId: bandId, title: newSetlistTitle });
            setNewSetlistTitle('');
            setShowAddSetlist(false);
            fetchSetlists();
            toast.success('สร้าง Setlist แล้ว');
        } catch (err) { toast.error('สร้างไม่สำเร็จ'); }
    };

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSong.title) return;
        try {
            // ส่ง sequence ล่าสุดไปด้วย (ต่อท้าย)
            const currentLen = activeSetlist?.songs?.length || 0;
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists/${activeSetlist.setlist_id}/songs`, { 
                ...newSong, 
                sequence: currentLen 
            });
            setNewSong({ title: '', artist: '', key: '', youtube_link: '' });
            setYoutubeQuery('');
            fetchSetlists();
            toast.success('เพิ่มเพลงแล้ว');
        } catch (err) { toast.error('เพิ่มเพลงไม่สำเร็จ'); }
    };

    const handleDeleteSong = async (songId: number) => {
        if(!confirm('ลบเพลงนี้?')) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists/songs/${songId}`);
            fetchSetlists();
            toast.success('ลบเรียบร้อย');
        } catch (err) { toast.error('ลบไม่สำเร็จ'); }
    };

    const updateStatus = async (songId: number, currentStatus: string) => {
        const nextStatus = currentStatus === 'pending' ? 'learning' : currentStatus === 'learning' ? 'ready' : 'pending';
        const updatedList = { ...activeSetlist, songs: activeSetlist.songs.map((s:any) => s.song_id === songId ? { ...s, status: nextStatus } : s) };
        setActiveSetlist(updatedList);
        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists/songs/${songId}`, { status: nextStatus });
    };

    const openLyrics = (song: any) => {
        setSelectedSong(song);
        setLyricsText(song.lyrics || '');
        setShowLyricsModal(true);
    };

    const saveLyrics = async () => {
        if (!selectedSong) return;
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/setlists/songs/${selectedSong.song_id}`, { lyrics: lyricsText });
            toast.success('บันทึกเนื้อเพลงแล้ว');
            setShowLyricsModal(false);
            fetchSetlists();
        } catch (err) { toast.error('บันทึกไม่สำเร็จ'); }
    };

    const getYoutubeId = (url: string) => {
        const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading && setlists.length === 0) return <div className="text-zinc-500 text-center py-10 animate-pulse">Loading...</div>;

    return (
        <div>
            <div className="print:hidden animate-in fade-in zoom-in duration-300">
                <Toaster position="top-center" />
                
                {/* Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-6 no-scrollbar items-center">
                    <button onClick={() => setShowAddSetlist(true)} className="flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-6 py-3 rounded-xl font-bold transition border border-dashed border-zinc-600">+ New List</button>
                    {activeSetlist && (
                        <button onClick={() => window.print()} className="flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-3 rounded-xl font-bold transition border border-zinc-700 hover:border-white/20">🖨️ Print</button>
                    )}
                    <div className="w-[1px] h-8 bg-zinc-800 mx-2"></div>
                    {setlists.map(list => (
                        <button key={list.setlist_id} onClick={() => setActiveSetlist(list)} className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition whitespace-nowrap border ${activeSetlist?.setlist_id === list.setlist_id ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-yellow-500/50'}`}>
                            {list.title} <span className="ml-2 text-xs opacity-60">({list.songs.length})</span>
                        </button>
                    ))}
                </div>

                {activeSetlist ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Drag & Drop Area */}
                        <div className="lg:col-span-2 space-y-4">
                            {activeSetlist.songs.length === 0 ? (
                                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800"><p className="text-zinc-500">ว่างเปล่า... เพิ่มเพลงเลย!</p></div>
                            ) : (
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="song-list">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                {activeSetlist.songs.map((song: any, index: number) => (
                                                    <Draggable key={song.song_id} draggableId={String(song.song_id)} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps} // จุดที่จับลาก (จับได้ทั้งก้อน)
                                                                className={`bg-zinc-900 border p-4 rounded-2xl flex items-center gap-4 transition group relative ${snapshot.isDragging ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20 z-50 bg-zinc-800 scale-105' : 'border-white/5 hover:border-white/20'}`}
                                                                style={{ ...provided.draggableProps.style }} // จำเป็นสำหรับ animation
                                                            >
                                                                {/* Handle Icon */}
                                                                <div className="text-zinc-600 cursor-grab active:cursor-grabbing">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                                                                </div>

                                                                {/* Index */}
                                                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-full text-zinc-500 font-bold text-sm select-none">{index + 1}</div>
                                                                
                                                                {/* Image */}
                                                                {getYoutubeId(song.youtube_link) && (
                                                                    <img src={`https://img.youtube.com/vi/${getYoutubeId(song.youtube_link)}/default.jpg`} className="w-16 h-12 object-cover rounded-lg opacity-80 pointer-events-none" />
                                                                )}

                                                                {/* Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 onClick={() => openLyrics(song)} className="font-bold text-white truncate cursor-pointer hover:text-yellow-500 transition flex items-center gap-2 select-none">
                                                                        {song.title}
                                                                        {song.lyrics && <span className="text-[10px] bg-zinc-700 text-zinc-300 px-1.5 rounded">📝</span>}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 text-xs text-zinc-400 select-none">
                                                                        <span>{song.artist || 'Unknown'}</span>
                                                                        {song.key && <span className="bg-zinc-800 px-1.5 rounded">Key: {song.key}</span>}
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => updateStatus(song.song_id, song.status)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border ${song.status === 'ready' ? 'bg-green-500/10 text-green-500 border-green-500/20' : song.status === 'learning' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                                        {song.status === 'ready' ? 'พร้อม' : song.status === 'learning' ? 'แกะ' : 'ยังไม่พร้อม'}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteSong(song.song_id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition">🗑️</button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            )}
                        </div>

                        {/* Add Song Form */}
                        <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl h-fit sticky top-24">
                            <h3 className="text-xl font-bold mb-6">🎵 เพิ่มเพลงใหม่</h3>
                            <div className="mb-6 bg-zinc-800/50 p-4 rounded-xl border border-white/5">
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">🔍 ค้นหาจาก YouTube</label>
                                <div className="flex gap-2">
                                    <input value={youtubeQuery} onChange={(e) => setYoutubeQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAutoFill()} placeholder="พิมพ์ชื่อเพลง..." className="flex-1 bg-black border border-zinc-700 p-2.5 rounded-lg text-sm text-white outline-none focus:border-yellow-500" />
                                    <button onClick={handleAutoFill} disabled={isSearchingYT} className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50">{isSearchingYT ? '...' : 'Go'}</button>
                                </div>
                            </div>
                            <form onSubmit={handleAddSong} className="space-y-4">
                                <div className="relative">
                                    <input value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} placeholder="ชื่อเพลง *" className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500" required />
                                </div>
                                <div className="flex justify-center -my-5 relative z-10">
                                    <button type="button" onClick={() => setNewSong(prev => ({ ...prev, title: prev.artist, artist: prev.title }))} className="bg-zinc-800 border border-zinc-600 text-zinc-400 p-2 rounded-full hover:text-white hover:border-yellow-500 hover:bg-zinc-700 transition shadow-lg transform active:scale-90 group">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:text-yellow-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                    </button>
                                </div>
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
                    <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800"><p className="text-zinc-500">เลือก หรือ สร้าง Setlist เพื่อเริ่มใช้งาน</p></div>
                )}
            </div>

            {/* Print View */}
            <div className="hidden print:block bg-white text-black p-8 min-h-screen fixed inset-0 z-[1000]">
                {activeSetlist && (
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8 border-b-4 border-black pb-4">
                            <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">{bandName}</h1>
                            <h2 className="text-3xl font-bold text-gray-600">{activeSetlist.title}</h2>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="border-b-2 border-black text-2xl"><th className="py-2 w-16">#</th><th className="py-2">Song</th><th className="py-2 w-32 text-center">Key</th><th className="py-2 w-32 text-right">Note</th></tr></thead>
                            <tbody>
                                {activeSetlist.songs.map((song: any, index: number) => (
                                    <tr key={song.song_id} className="border-b border-gray-300 text-2xl font-bold">
                                        <td className="py-4 text-gray-500">{index + 1}</td>
                                        <td className="py-4">{song.title} <div className="text-lg font-normal text-gray-500">{song.artist}</div></td>
                                        <td className="py-4 text-center text-3xl font-black bg-gray-100 rounded">{song.key || '-'}</td>
                                        <td className="py-4 text-right"><div className="w-8 h-8 border-2 border-gray-300 rounded inline-block"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Lyrics Modal */}
            {showLyricsModal && selectedSong && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[110] p-4 print:hidden">
                    <div className="bg-zinc-900 w-full max-w-2xl h-[80vh] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-800">
                            <div><h3 className="text-xl font-bold text-white">{selectedSong.title}</h3><p className="text-zinc-400 text-sm">{selectedSong.artist} • Key: {selectedSong.key || '-'}</p></div>
                            <button onClick={() => setShowLyricsModal(false)} className="text-zinc-500 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="flex-1 p-0 relative"><textarea value={lyricsText} onChange={(e) => setLyricsText(e.target.value)} placeholder="แปะเนื้อเพลงและคอร์ดที่นี่..." className="w-full h-full bg-[#0a0a0a] text-zinc-300 p-6 text-lg font-mono outline-none resize-none leading-relaxed" /></div>
                        <div className="p-4 border-t border-white/5 bg-zinc-800 flex justify-end gap-3"><button onClick={() => setShowLyricsModal(false)} className="px-6 py-3 rounded-xl font-bold text-zinc-400 hover:bg-zinc-700">ยกเลิก</button><button onClick={saveLyrics} className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold hover:brightness-110">บันทึกเนื้อเพลง</button></div>
                    </div>
                </div>
            )}

            {/* Add Setlist Modal */}
            {showAddSetlist && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md border border-white/10">
                        <h3 className="text-xl font-bold mb-4">ตั้งชื่อ Setlist ใหม่</h3>
                        <input autoFocus value={newSetlistTitle} onChange={e => setNewSetlistTitle(e.target.value)} placeholder="เช่น ซ้อมวันศุกร์..." className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white mb-6 outline-none focus:border-yellow-500" />
                        <div className="flex gap-3"><button onClick={() => setShowAddSetlist(false)} className="flex-1 py-3 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800">ยกเลิก</button><button onClick={handleCreateSetlist} className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold hover:brightness-110">สร้างเลย</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}