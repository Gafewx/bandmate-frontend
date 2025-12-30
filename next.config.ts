/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Backend Port (เช็คให้ชัวร์ว่า 3000)
      },
      // 👇 เพิ่มก้อนนี้เข้าไปครับ
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3000/socket.io/:path*', // ส่งต่อ Socket ไปหา Backend
      },
    ]
  },
};
export default nextConfig;