'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '@/src/components/Navbar';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(userData);
    setUser(u);
    fetchConversations(u.user_id);
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeChat) {
        fetchMessages(activeChat.conversation_id);
        interval = setInterval(() => {
            fetchMessages(activeChat.conversation_id);
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async (userId: number) => {
    try {
        const res = await axios.get(`/api/chats/my/${userId}`, { headers: {"ngrok-skip-browser-warning": "true"} });
        setConversations(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchMessages = async (chatId: number) => {
    try {
        const res = await axios.get(`/api/chats/messages/${chatId}`, { headers: {"ngrok-skip-browser-warning": "true"} });
        setMessages(res.data);
    } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !user) return;
    const text = inputText;
    setInputText('');
    try {
        await axios.post(`/api/chats/send`, {
            conversationId: activeChat.conversation_id,
            senderId: user.user_id,
            text: text
        });
        fetchMessages(activeChat.conversation_id);
        fetchConversations(user.user_id);
    } catch (error) {
        console.error('Send failed', error);
        setInputText(text);
    }
  };

  const selectChat = (chat: any) => {
      setActiveChat(chat);
      setIsMobileListVisible(false);
  };

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden font-sans">
      <Navbar user={user} onLogout={() => router.push('/login')} />
      
      {/* แก้ไขตรงนี้: ลบ max-w-7xl และ mx-auto ออกเพื่อให้เต็มจอ 100% */}
      <div className="flex-1 flex pt-16 w-full h-full relative overflow-hidden">
        
        {/* 👈 LEFT SIDEBAR: รายชื่อคนคุย (ปรับ Width ให้ดูสมดุลขึ้น) */}
        <div className={`w-full md:w-80 lg:w-96 bg-[#121212] border-r border-white/5 flex flex-col 
            ${isMobileListVisible ? 'block' : 'hidden md:flex'} absolute md:relative inset-0 z-30`}>
            
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">แชท</h2>
                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {conversations.length}
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 opacity-50">
                        <p className="text-gray-400 text-sm">ยังไม่มีข้อความ</p>
                    </div>
                ) : (
                    conversations.map((c) => (
                        <div 
                            key={c.conversation_id}
                            onClick={() => selectChat(c)}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 hover:bg-white/5
                                ${activeChat?.conversation_id === c.conversation_id ? 'bg-white/10' : ''}`}
                        >
                            <div className="relative">
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${c.partner_name}&background=random&color=fff`} 
                                    className="w-14 h-14 rounded-full object-cover border border-white/10"
                                    alt="avatar"
                                />
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-white truncate">{c.partner_name}</h3>
                                    <span className="text-[10px] text-gray-500">2 นาทีที่แล้ว</span>
                                </div>
                                <p className={`text-sm truncate ${activeChat?.conversation_id === c.conversation_id ? 'text-yellow-400' : 'text-gray-400'}`}>
                                    {c.last_message || 'เริ่มบทสนทนา...'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* 👉 RIGHT AREA: ห้องแชท (ขยายเต็มพื้นที่ที่เหลือ) */}
        <div className={`flex-1 bg-black flex flex-col relative
             ${!isMobileListVisible ? 'block' : 'hidden md:flex'}`}>
            
            {activeChat ? (
                <>
                    {/* Header Chat (แบบพรีเมียม) */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/60 backdrop-blur-xl absolute top-0 left-0 right-0 z-20">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMobileListVisible(true)} className="md:hidden text-gray-400 hover:text-white mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                            </button>
                            
                            <img src={`https://ui-avatars.com/api/?name=${activeChat.partner_name}&background=random&color=fff`} className="w-10 h-10 rounded-full border border-white/10" alt="partner" />
                            <div>
                                <h3 className="font-bold text-white leading-none">{activeChat.partner_name}</h3>
                                <span className="text-[10px] text-green-500 font-medium">กำลังออนไลน์</span>
                            </div>
                        </div>
                        <div className="flex gap-4 text-gray-400">
                             <button className="hover:text-white transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg></button>
                             <button className="hover:text-white transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                        </div>
                    </div>

                    {/* Chat Area (Scrollable) */}
                    <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                                <span className="text-6xl mb-4">🎵</span>
                                <p className="text-white text-lg font-medium">เริ่มบทสนทนาทางดนตรีกับ {activeChat.partner_name}</p>
                            </div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user?.user_id;
                            return (
                                <div key={msg.message_id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] md:max-w-[60%] lg:max-w-[50%] px-4 py-3 rounded-2xl shadow-lg text-[15px] leading-relaxed break-words
                                        ${isMe 
                                            ? 'bg-gradient-to-tr from-yellow-500 to-orange-500 text-black font-semibold rounded-br-none shadow-yellow-500/10' 
                                            : 'bg-zinc-800/80 text-white rounded-bl-none border border-white/5'}`}>
                                        {msg.message_text}
                                        <div className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                            10:30 PM
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area (Full width & Floating style) */}
                    <div className="p-4 bg-black border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-3 max-w-5xl mx-auto items-center">
                            <button type="button" className="text-gray-400 hover:text-white transition">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            </button>
                            <input 
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="พิมพ์ข้อความ..."
                                className="flex-1 bg-zinc-900 border border-white/5 text-white rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputText.trim()}
                                className="bg-yellow-500 text-black p-3.5 rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-yellow-500/20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a]">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full"></div>
                        <div className="relative w-28 h-28 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                            <span className="text-5xl animate-pulse">💬</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">ยินดีต้อนรับสู่ BandMate Chat</h2>
                    <p className="text-gray-500 text-center max-w-xs">เลือกนักดนตรีที่คุณต้องการคุยด้วยจากแถบด้านข้าง เพื่อเริ่มวางแผนการซ้อม</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}