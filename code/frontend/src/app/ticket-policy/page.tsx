'use client';

export default function TicketPolicy() {
  return (
    <main className="main-content">
      <div className="container mt-40" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', color: 'var(--text-color)', lineHeight: '1.8' }}>
        <h2 className="text-center" style={{ fontSize: '28px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Quy Định Giao Dịch Vé
        </h2>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          (Cập nhật mới nhất: Ngày 01/06/2026)
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            1. Quy định đặt vé và giới hạn số lượng
          </h3>
          <p>
            Mỗi khách hàng khi thực hiện giao dịch thanh toán trên hệ thống đặt vé trực tuyến MTBA chỉ được đặt tối đa <strong>8 ghế</strong> cho mỗi giao dịch để tránh đầu cơ vé. Nếu vượt quá số lượng này, hệ thống sẽ từ chối và báo lỗi.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            2. Quy định thanh toán và thời gian giữ ghế
          </h3>
          <p>
            Khi thực hiện đặt vé, bạn sẽ có tối đa <strong>10 phút</strong> để hoàn tất thanh toán. Quá thời gian này, đơn đặt vé sẽ tự động bị hủy và ghế sẽ được giải phóng cho các khách hàng khác chọn mua.
          </p>
          <p>
            Nếu bạn thực hiện chuyển khoản thanh toán khi đơn đặt vé đã bị quá hạn (Expired):
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Trường hợp các ghế đó chưa bị ai khác chọn mua thành công: Hệ thống sẽ tự động cập nhật trạng thái và hoàn tất vé cho bạn.</li>
            <li>Trường hợp ghế đã bị khách hàng khác mua mất: Hệ thống sẽ báo lỗi trùng ghế và không hoàn tất giao dịch. Khách hàng vui lòng liên hệ bộ phận hỗ trợ khách hàng tại quầy hoặc hotline để được hoàn tiền hoặc đổi suất chiếu tương đương.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            3. Quy định đổi, trả vé
          </h3>
          <p>
            Vé xem phim trực tuyến đã mua thành công và được xác nhận thanh toán (vé đã có mã vạch/QR code) <strong>không được phép đổi hoặc trả lại</strong> dưới bất kỳ hình thức nào. Quý khách vui lòng kiểm tra kỹ thông tin suất chiếu, tên phim, thời gian chiếu và phòng chiếu trước khi thanh toán.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            4. Nhận vé tại rạp
          </h3>
          <p>
            Quý khách vui lòng mang mã QR Code hoặc mã đơn hàng nhận được qua email/màn hình xác nhận giao dịch đến quầy vé hoặc máy in vé tự động tại rạp để in vé giấy trước giờ chiếu ít nhất 10 phút. Vé giấy là điều kiện bắt buộc để được vào phòng chiếu.
          </p>
        </section>
      </div>
    </main>
  );
}
