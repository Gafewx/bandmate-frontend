'use client';
import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

interface BandChatProps {
    bandId: number;
    user: any;
}

// 🛠️ Helper: ตัด /api ออกจาก URL เพื่อให้ได้ Base URL จริงๆ สำหรับ Socket
const getBaseUrl = (url?: string) => {
    if (!url) return undefined;
    return url.replace(/\/api$/, ''); // ถ้าลงท้ายด้วย /api ให้ลบออก
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_BASE_URL = getBaseUrl(API_URL);

export default function BandChat({ bandId, user }: BandChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. เชื่อมต่อ Socket และดึงประวัติแชท
    useEffect(() => {
        if (!SOCKET_BASE_URL) {
            console.error("❌ Socket URL is missing!");
            return;
        }

        console.log('🔌 Connecting to Socket:', SOCKET_BASE_URL);

        // Connect Socket
        const newSocket = io(SOCKET_BASE_URL, {
            path: '/socket.io', // ค่า Default แต่อย่าลืมใส่เพื่อความชัวร์
            transports: ['websocket'], // 👈 บังคับใช้ websocket เท่านั้น (แก้ปัญหา 308)
            extraHeaders: {
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true,
            reconnectionAttempts: 5, // พยายามต่อใหม่ 5 ครั้งถ้าหลุด
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket Connected! ID:', newSocket.id);
            // Join Room หลังจากต่อติดแล้ว
            newSocket.emit('join_band', { bandId });
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket Connection Error:', err.message);
        });

        setSocket(newSocket);

        // Listen for incoming messages
        newSocket.on('new_band_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
            scrollToBottom();
        });

        // Fetch History
        fetchHistory();

        return () => {
            console.log('🔌 Disconnecting Socket...');
            newSocket.disconnect();
        };
    }, [bandId]);

    const fetchHistory = async () => {
        if (!API_URL) return;
        
        try {
            // ใช้ API_URL (ที่มีหรือไม่มี /api ก็ได้ แต่เราต้องจัดการ Path ให้ถูก)
            // สมมติว่า API_URL คือ ...onrender.com (ไม่มี /api)
            const targetUrl = API_URL.endsWith('/api') 
                ? `${API_URL}/bands/${bandId}/messages`
                : `${API_URL}/bands/${bandId}/messages`; // 👈 เช็ค Backend Route ดีๆ ว่าต้องมี /api ไหม

            // ⚠️ ถ้า Backend Route จริงๆ คือ /api/bands/... ให้ใช้บรรทัดล่างนี้แทน:
            // const targetUrl = `${SOCKET_BASE_URL}/api/bands/${bandId}/messages`;

            const res = await axios.get(targetUrl, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('send_band_message', {
            bandId,
            userId: user.user_id,
            content: newMessage
        });

        setNewMessage('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-900 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                    💬 Band Chat <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">Live</span>
                </h3>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0a0a0a]">
                {messages.map((msg, index) => {
                    const isMe = msg.user_id === user.user_id;
                    return (
                        <div key={index} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            {!isMe && (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${msg.sender?.full_name || 'User'}&background=random`}
                                    className="w-8 h-8 rounded-full mb-1"
                                    alt="avatar"
                                />
                            )}

                            {/* Message Bubble */}
                            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe
                                ? 'bg-yellow-500 text-black rounded-br-none font-medium'
                                : 'bg-zinc-800 text-zinc-300 rounded-bl-none border border-white/5'
                                }`}>
                                {!isMe && <p className="text-[10px] text-zinc-500 mb-1 font-bold">{msg.sender?.full_name}</p>}
                                {msg.content}
                                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-black/50' : 'text-zinc-500'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความคุยกับเพื่อนในวง..."
                    className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm transition"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-yellow-500 text-black px-6 rounded-xl font-bold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
}