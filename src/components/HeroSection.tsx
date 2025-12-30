'use client';

interface HeroSectionProps {
  search: string;
  setSearch: (val: string) => void;
  onSearch: () => void;
}

export default function HeroSection({ search, setSearch, onSearch }: HeroSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <header className="relative pt-40 pb-20 px-4 text-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
        หาเพื่อนร่วมวง <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
          ในจังหวะที่ใช่
        </span>
      </h1>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
        คอมมูนิตี้นักดนตรีที่ใหญ่ที่สุด ค้นหามือกลอง กีตาร์ เบส หรือนักร้อง <br/> 
        แล้วนัดซ้อมดนตรีได้ทันทีในที่เดียว
      </p>

      <div className="relative max-w-xl mx-auto group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
        <div className="relative flex items-center bg-zinc-900 rounded-full p-2 border border-white/10 shadow-2xl">
          <span className="pl-4 text-2xl">🔍</span>
          <input 
            type="text"
            placeholder="ค้นหาตำแหน่ง (Guitar), แนวเพลง (Rock)..."
            className="w-full bg-transparent text-white px-4 py-3 outline-none placeholder-gray-500 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onSearch} className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition">
            ค้นหา
          </button>
        </div>
      </div>
    </header>
  );
}