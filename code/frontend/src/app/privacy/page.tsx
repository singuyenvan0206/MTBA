'use client';

export default function Privacy() {
  return (
    <main className="main-content">
      <div className="container mt-40" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', color: 'var(--text-color)', lineHeight: '1.8' }}>
        <h2 className="text-center" style={{ fontSize: '28px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Chính Sách Bảo Mật
        </h2>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          (Cập nhật mới nhất: Ngày 01/06/2026)
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            1. Mục đích thu thập thông tin
          </h3>
          <p>
            Chúng tôi thực hiện thu thập thông tin cá nhân của người dùng nhằm các mục đích sau:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
            <li>Xác thực danh tính người dùng và hỗ trợ việc đặt vé xem phim trực tuyến.</li>
            <li>Gửi mã xác thực OTP qua email và SMS phục vụ đăng ký/đăng nhập.</li>
            <li>Gửi thông báo xác nhận đơn đặt vé, hóa đơn điện tử và vé điện tử của bạn.</li>
            <li>Giải quyết khiếu nại, phản hồi ý kiến đóng góp của khách hàng.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            2. Phạm vi thu thập thông tin
          </h3>
          <p>
            Các thông tin cá nhân chúng tôi thu thập khi bạn đăng ký tài khoản và giao dịch trên hệ thống bao gồm: Họ và tên, địa chỉ Email, Số điện thoại di động và mật khẩu đã được mã hóa kết hợp Salt & Pepper.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            3. Bảo mật thông tin khách hàng
          </h3>
          <p>
            Thông tin cá nhân của bạn sẽ được bảo mật tối đa bằng các biện pháp kỹ thuật số hiện đại. Chúng tôi sử dụng các giao thức mã hóa dữ liệu truyền tải SSL, băm mật khẩu bằng thuật toán mã hóa mạnh mẽ và áp dụng các chính sách phân quyền truy cập nghiêm ngặt đối với nhân viên nội bộ.
          </p>
          <p>
            Chúng tôi cam kết tuyệt đối không bán, chia sẻ hoặc tiết lộ thông tin cá nhân của bạn cho bên thứ ba vì bất kỳ mục đích thương mại nào, ngoại trừ trường hợp có yêu cầu bằng văn bản từ cơ quan pháp luật có thẩm quyền.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#ff4d4f', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>
            4. Quyền lợi của khách hàng
          </h3>
          <p>
            Bạn có toàn quyền truy cập, kiểm tra và thay đổi thông tin cá nhân của mình bằng cách đăng nhập vào tài khoản trên hệ thống MTBA và truy cập trang cá nhân. Nếu bạn muốn yêu cầu xóa tài khoản vĩnh viễn khỏi hệ thống, vui lòng liên hệ hotline hoặc gửi email về địa chỉ bộ phận chăm sóc khách hàng của chúng tôi.
          </p>
        </section>
      </div>
    </main>
  );
}
