// src/components/SkillSlider.tsx
interface Props {
  label: string;
  value: number;
  onChange: (val: number) => void;
  color: string;
}

export default function SkillSlider({ label, value, onChange, color }: Props) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{value}/100</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
      />
    </div>
  );
}