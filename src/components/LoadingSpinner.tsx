export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      {/* วงกลมหมุนๆ สีเหลือง/ดำ */}
      <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-500 rounded-full animate-spin"></div>
      <p className="text-gray-400 animate-pulse text-sm">กำลังโหลดข้อมูล...</p>
    </div>
  );
}