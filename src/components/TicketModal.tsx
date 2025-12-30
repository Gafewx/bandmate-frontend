'use client';
import QRCode from 'react-qr-code';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export default function TicketModal({ isOpen, onClose, booking }: TicketModalProps) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Ticket Card */}
      <div className="relative bg-white text-black w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-in zoom-in-95 duration-300">
        
        {/* Header ส่วนบน */}
        <div className="bg-zinc-900 p-6 text-center border-b-2 border-dashed border-gray-600 relative">
          <h3 className="text-yellow-500 font-bold text-lg tracking-widest uppercase">BandMate Ticket</h3>
          <p className="text-gray-400 text-xs mt-1">SHOW THIS AT COUNTER</p>
          
          {/* รอยเจาะวงกลมซ้ายขวา */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black rounded-full"></div>
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-black rounded-full"></div>
        </div>

        {/* Content ส่วนกลาง */}
        <div className="p-6 bg-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black uppercase mb-1">{booking.room_name}</h2>
            <p className="text-gray-500 text-sm">📍 {booking.location || 'Bangkok, Thailand'}</p>
          </div>

          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl mb-6">
            <div className="text-center w-1/2 border-r border-gray-300">
              <p className="text-xs text-gray-400 uppercase">Date</p>
              <p className="font-bold text-lg">
                {new Date(booking.start_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </p>
            </div>
            <div className="text-center w-1/2">
              <p className="text-xs text-gray-400 uppercase">Time</p>
              <p className="font-bold text-lg text-yellow-600">
                {new Date(booking.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="p-2 bg-white border-2 border-black rounded-lg">
              {/* QR Code สร้างจาก Booking ID */}
              <QRCode 
                value={JSON.stringify({ 
                    id: booking.booking_id, 
                    user: booking.user_id, 
                    status: 'confirmed' 
                })} 
                size={120} 
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono">ID: {booking.booking_id?.toString().padStart(6, '0')}</p>
          </div>
        </div>

        {/* Footer ส่วนล่าง */}
        <div className="bg-yellow-500 p-4 text-center cursor-pointer hover:bg-yellow-400 transition" onClick={onClose}>
          <p className="font-bold text-black text-sm uppercase">Tap to Close</p>
        </div>
      </div>
    </div>
  );
}