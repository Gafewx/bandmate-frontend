'use client';
import {
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, ResponsiveContainer
} from 'recharts';

interface SkillChartProps {
  skills: {
    solo: number;
    rhythm: number;
    theory: number;
    performance: number;
    ear: number;
  };
}

export default function SkillChart({ skills }: SkillChartProps) {
  // แปลงข้อมูลให้เข้ากับรูปแบบของ Recharts
  const data = [
    { subject: 'Solo', A: skills.solo, fullMark: 100 },
    { subject: 'Rhythm', A: skills.rhythm, fullMark: 100 },
    { subject: 'Theory', A: skills.theory, fullMark: 100 },
    { subject: 'Live', A: skills.performance, fullMark: 100 },
    { subject: 'Ear', A: skills.ear, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[250px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          {/* เส้นตารางใยแมงมุม */}
          <PolarGrid stroke="#3f3f46" /> 
          
          {/* ตัวอักษรหัวข้อ (Solo, Rhythm...) */}
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} 
          />
          
          {/* พื้นที่ของกราฟ */}
          <Radar
            name="Skills"
            dataKey="A"
            stroke="#eab308"       /* สีเหลือง Yellow-500 */
            fill="#eab308"         /* สีเหลือง Yellow-500 */
            fillOpacity={0.4}      /* ความโปร่งแสง */
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}