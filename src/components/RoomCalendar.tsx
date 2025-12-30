'use client';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/th'; // 👈 1. Import ภาษาไทย
import { useState, useEffect } from 'react';
import axios from 'axios';

// ตั้งค่าให้ Moment เป็นภาษาไทย
moment.locale('th');
const localizer = momentLocalizer(moment);

interface RoomCalendarProps {
  roomId: number;
}

// 🎨 Component: แถบเครื่องมือด้านบน (Custom Toolbar)
const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY');
  };

  const label = () => {
    const date = moment(toolbar.date);
    return (
      <span className="text-xl font-bold text-gray-800 capitalize">
        {toolbar.view === 'month' ? date.format('MMMM YYYY') : date.format('DD MMMM YYYY')}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-2">
      <div className="flex gap-2">
        <button onClick={goToBack} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition text-sm">
           &lt; ก่อนหน้า
        </button>
        <button onClick={goToCurrent} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg shadow-sm transition text-sm">
           วันนี้
        </button>
        <button onClick={goToNext} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition text-sm">
           ถัดไป &gt;
        </button>
      </div>

      <div className="text-center">
        {label()}
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button 
            onClick={() => toolbar.onView('month')} 
            className={`px-3 py-1.5 rounded-md text-sm transition ${toolbar.view === 'month' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-black'}`}
        >
            เดือน
        </button>
        <button 
            onClick={() => toolbar.onView('week')} 
            className={`px-3 py-1.5 rounded-md text-sm transition ${toolbar.view === 'week' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-black'}`}
        >
            สัปดาห์
        </button>
        <button 
            onClick={() => toolbar.onView('day')} 
            className={`px-3 py-1.5 rounded-md text-sm transition ${toolbar.view === 'day' ? 'bg-white shadow text-black font-bold' : 'text-gray-500 hover:text-black'}`}
        >
            วัน
        </button>
      </div>
    </div>
  );
};

export default function RoomCalendar({ roomId }: RoomCalendarProps) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/bookings/room/${roomId}`);
        
        const calendarEvents = res.data.map((b: any) => ({
          title: b.status === 'confirmed' ? '❌ ไม่ว่าง' : '⏳ รออนุมัติ', // เปลี่ยนข้อความให้สั้นกระชับ
          start: new Date(b.start_time),
          end: new Date(b.end_time),
          status: b.status,
        }));
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    if (roomId) fetchBookings();
  }, [roomId]);

  // 🎨 ปรับแต่งสีของ Event
  const eventStyleGetter = (event: any) => {
    let style = {
        backgroundColor: '#3b82f6', // Default Blue
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };

    if (event.status === 'confirmed') {
        style.backgroundColor = '#10b981'; // Green (Emerald-500)
    }
    if (event.status === 'pending') {
        style.backgroundColor = '#f59e0b'; // Amber-500
    }

    return { style };
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl text-black font-sans border border-gray-100">
      
      {/* CSS Override เฉพาะจุด เพื่อลบความโบราณของ Library */}
      <style jsx global>{`
        .rbc-calendar { font-family: 'Prompt', sans-serif; }
        .rbc-header { padding: 10px 0; font-weight: bold; color: #4b5563; font-size: 0.9rem; }
        .rbc-today { background-color: #fef9c3; } /* ไฮไลท์วันปัจจุบันสีเหลืองอ่อน */
        .rbc-off-range-bg { background-color: #f9fafb; }
        .rbc-time-view { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .rbc-month-view { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .rbc-time-content { border-top: 1px solid #e5e7eb; }
        .rbc-timeslot-group { border-bottom: 1px solid #f3f4f6; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f3f4f6; }
        .rbc-time-header-content { border-left: 1px solid #f3f4f6; }
        .rbc-event { min-height: 25px; padding: 2px 5px; }
      `}</style>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }} // เพิ่มความสูงให้ดูโปร่ง
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView={Views.WEEK} // ใช้ Constant ของ Library เพื่อความชัวร์
        components={{
            toolbar: CustomToolbar // 👉 ใส่ Toolbar ที่เราแต่งเองเข้าไป
        }}
        // ตั้งค่าภาษาไทยในส่วน Header ของตาราง
        formats={{
            dayHeaderFormat: (date: Date) => moment(date).format('dddd DD MMM'), // เช่น "จันทร์ 23 ธ.ค."
            dayRangeHeaderFormat: ({ start, end }: any) => 
                 `${moment(start).format('DD MMM')} - ${moment(end).format('DD MMM YYYY')}`,
        }}
        min={new Date(0, 0, 0, 9, 0, 0)} // เริ่มโชว์ตอน 09:00 น. (ไม่ต้องโชว์ตี 1-ตี 5 ให้รก)
        max={new Date(0, 0, 0, 23, 0, 0)} // จบตอน 23:00 น.
      />
    </div>
  );
}