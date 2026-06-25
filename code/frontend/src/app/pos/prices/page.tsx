'use client';
import { useEffect, useState } from 'react';

export default function Prices() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prices')
      .then(res => res.json())
      .then(resData => {
        if (Array.isArray(resData)) {
            const uniqueData: any[] = [];
            const seen = new Set();
            for (const item of resData) {
                const key = `${item.day_type}-${item.type_seat}-${item.type_movie}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueData.push(item);
                }
            }
            uniqueData.sort((a, b) => {
                if (a.type_movie !== b.type_movie) return a.type_movie.localeCompare(b.type_movie);
                return a.type_seat.localeCompare(b.type_seat);
            });
            setData(uniqueData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const weekdayPrices = data.filter(item => item.day_type === false);
  const weekendPrices = data.filter(item => item.day_type === true);

  return (
    <main className="main-content">
        <div className="container mt-40">
            <h2 className="text-center" style={{ fontSize: '28px', color: 'var(--text-color)', textTransform: 'uppercase' }}>Giá vé</h2>
            <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>(Áp dụng từ ngày 01/06/2024)</p>

            <h3 className="pricing-title">BẢNG GIÁ VÉ XEM PHIM (NGÀY THƯỜNG T2 - T6)</h3>
            <div className="table-responsive" style={{ marginBottom: '40px' }}>
                <table className="pricing-table">
                    <thead>
                        <tr>
                            <th>Loại Ghế</th>
                            <th>Loại Phim</th>
                            <th>Giá (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="text-center" style={{ padding: '20px', color: '#888' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : weekdayPrices.length > 0 ? (
                            weekdayPrices.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.type_seat === 'STANDARD' ? 'Thường' : (item.type_seat === 'VIP' ? 'VIP' : 'Sweetbox')}</td>
                                    <td>{item.type_movie === 'TYPE_2D' ? '2D' : '3D'}</td>
                                    <td style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{item.price?.toLocaleString()} đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center" style={{ padding: '20px', color: '#888' }}>Chưa có thông tin bảng giá ngày thường.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <h3 className="pricing-title">BẢNG GIÁ VÉ XEM PHIM (CUỐI TUẦN & NGÀY LỄ)</h3>
            <div className="table-responsive">
                <table className="pricing-table">
                    <thead>
                        <tr>
                            <th>Loại Ghế</th>
                            <th>Loại Phim</th>
                            <th>Giá (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="text-center" style={{ padding: '20px', color: '#888' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : weekendPrices.length > 0 ? (
                            weekendPrices.map((item, i) => (
                                <tr key={i}>
                                    <td>{item.type_seat === 'STANDARD' ? 'Thường' : (item.type_seat === 'VIP' ? 'VIP' : 'Sweetbox')}</td>
                                    <td>{item.type_movie === 'TYPE_2D' ? '2D' : '3D'}</td>
                                    <td style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{item.price?.toLocaleString()} đ</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center" style={{ padding: '20px', color: '#888' }}>Chưa có thông tin bảng giá cuối tuần / lễ.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="pricing-terms" style={{ marginTop: '40px', color: '#ccc', lineHeight: 1.6 }}>
                <p><strong>* Giá vé đối với các đối tượng khán giả ưu tiên (khi trực tiếp sử dụng dịch vụ xem phim tại rạp chiếu phim):</strong></p>
                <ul>
                    <li>Giảm 20% giá vé theo quy định đối với: Trẻ em (người dưới 16 tuổi), người cao tuổi (công dân Việt Nam từ 60 tuổi trở lên), người có công với cách mạng, người có hoàn cảnh đặc biệt khó khăn.</li>
                    <li>Giảm 50% giá vé theo quy định đối với người khuyết tật nặng.</li>
                    <li>Giảm giá vé 100% đối với: Người khuyết tật đặc biệt nặng, trẻ em dưới 0.7m đi kèm với người lớn.</li>
                </ul>
                <p><strong>Điều kiện:</strong></p>
                <ul>
                    <li>Chỉ áp dụng khi mua vé tại quầy (không áp dụng khi mua online).</li>
                    <li>Các đối tượng khán giả trên phải xuất trình giấy tờ chứng minh khi mua vé xem phim và trước khi vào phòng chiếu. Cụ thể:</li>
                    <li>Trẻ em (trường hợp trẻ em từ 14 - 16 tuổi): xuất trình "Thẻ học sinh", "CCCD"...</li>
                    <li>Người cao tuổi: xuất trình "CCCD", "CMND"...</li>
                </ul>
                <p><strong>* Ưu đãi cho học sinh, sinh viên từ 22 tuổi trở xuống: Đồng giá 55.000đ /vé 2D cho tất cả các suất chiếu phim từ Thứ 2 đến Thứ 6</strong> (chỉ áp dụng cho hình thức mua vé trực tiếp tại quầy, không áp dụng với ghế đôi. Mỗi thẻ được mua 1 vé/ngày và vui lòng xuất trình thẻ U22 kèm thẻ HSSV khi mua vé).</p>
                <p><strong>* Không bán vé cho trẻ em dưới 13 tuổi đối với các suất chiếu phim kết thúc sau 22h00 và không bán vé cho trẻ em dưới 16 tuổi đối với các suất chiếu phim kết thúc sau 23h00.</strong></p>
                <p><strong>* Áp dụng giá vé ngày Lễ, Tết cho các ngày:</strong></p>
                <ul>
                    <li>Các ngày nghỉ Lễ, Tết theo quy định của nhà nước: Tết Nguyên Đán, Tết Dương Lịch, ngày Giỗ Tổ Hùng Vương 10/3 AL, ngày 30/4, 1/5, 2/9.</li>
                    <li>Các ngày: Ngày Quốc tế Phụ nữ 8/3, Phụ nữ VN 20/10, Giáng sinh 24/12, Halloween 31/10...</li>
                </ul>
            </div>
        </div>
    </main>
  );
}
