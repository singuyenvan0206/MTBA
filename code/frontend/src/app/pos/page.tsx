'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PosStaffDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Lấy các booking mới nhất (sắp xếp giảm dần theo id hoặc created_at)
          const sorted = data.sort((a: any, b: any) => b.id - a.id);
          setBookings(sorted);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
    // Auto-refresh every 5 seconds to get new kiosk orders
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#ff4d4f] uppercase">POS - Bảng Điều Khiển Nhân Viên</h1>
          <p className="text-sm text-[color:var(--text-secondary)]">Tự động cập nhật đơn hàng mới từ Kiosk</p>
        </div>
        <div className="flex gap-4">
          <Link href="/pos2" target="_blank" className="bg-[#ff4d4f] text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Mở màn hình Kiosk Khách Hàng
          </Link>
          <Link href="/admin" className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600 transition-colors">
            Quay lại Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Danh sách vé vừa đặt tại quầy</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <p className="text-[color:var(--text-secondary)]">Đang tải dữ liệu...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[color:var(--text-secondary)]">Chưa có vé nào được đặt.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 font-semibold border-b">Mã vé</th>
                    <th className="p-3 font-semibold border-b">Thời gian đặt</th>
                    <th className="p-3 font-semibold border-b">Thông tin phim</th>
                    <th className="p-3 font-semibold border-b">Ghế</th>
                    <th className="p-3 font-semibold border-b">Tổng tiền</th>
                    <th className="p-3 font-semibold border-b text-center">Trạng thái</th>
                    <th className="p-3 font-semibold border-b text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: any) => {
                    const date = new Date(booking.created_at || new Date());
                    return (
                      <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-blue-600">#{booking.id}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {date.toLocaleDateString('vi-VN')} <br/>
                          <span className="text-xs text-[color:var(--text-secondary)]">{date.toLocaleTimeString('vi-VN')}</span>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-800">{booking.showtime?.movie?.title || 'Phim không xác định'}</div>
                          <div className="text-xs text-[color:var(--text-secondary)] mt-1">
                            {booking.showtime?.screen?.name} - {booking.showtime?.theater?.name}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="max-w-[150px] flex flex-wrap gap-1">
                            {booking.bookingseat?.map((bs: any) => (
                              <span key={bs.id} className="bg-gray-200 text-xs px-2 py-1 rounded border border-gray-300">
                                {bs.seat?.seat_row}{bs.seat?.seat_column}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-red-500">
                          {booking.total_price_movie?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium border border-green-200">Đã thanh toán</span>
                        </td>
                        <td className="p-3 text-center">
                          <button className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow hover:bg-blue-600 transition-colors mr-2">
                            In vé
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
