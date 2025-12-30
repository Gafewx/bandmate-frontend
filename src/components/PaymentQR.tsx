'use client';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';

interface PaymentQRProps {
  amount: number;
  phoneNumber: string; // เบอร์พร้อมเพย์เจ้าของร้าน
}

export default function PaymentQR({ amount, phoneNumber }: PaymentQRProps) {
  // สร้าง Payload พร้อมเพย์ (ระบุเบอร์ และ ยอดเงิน)
  const payload = generatePayload(phoneNumber, { amount });

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-lg max-w-xs mx-auto">
      <h3 className="text-black font-bold text-lg mb-2">สแกนจ่ายเงิน</h3>
      <div className="border-4 border-black p-2 rounded-xl">
         {/* สร้าง QR Code */}
         <QRCodeCanvas value={payload} size={200} />
      </div>
      <p className="text-gray-600 mt-4 text-sm">ยอดชำระเงิน</p>
      <p className="text-blue-600 text-3xl font-bold">
        ฿{amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-xs text-gray-400 mt-2">โอนเข้าบัญชีพร้อมเพย์: {phoneNumber}</p>
    </div>
  );
}