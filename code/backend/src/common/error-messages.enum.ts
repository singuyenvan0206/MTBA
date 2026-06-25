export enum ErrorMessage {
  // Đặt vé (Bookings)
  SEAT_REQUIRED = 'Vui lòng chọn ít nhất 1 ghế',
  SEAT_LIMIT_EXCEEDED = 'Bạn chỉ được phép đặt tối đa 8 ghế cho mỗi giao dịch!',
  SHOWTIME_NOT_FOUND = 'Showtime not found',
  SHOWTIME_CLOSED = 'Suất chiếu đã bắt đầu hoặc đã đóng cổng đặt vé trực tuyến!',
  USER_BLOCKED = 'Tài khoản của bạn đã bị khóa hoặc không tồn tại, không thể đặt vé!',
  BOOKING_NOT_FOUND = 'Không tìm thấy đơn đặt vé!',
  BOOKING_PAID_CANNOT_DELETE = 'Đơn đặt vé này đã thanh toán thành công, không thể xóa trực tiếp!',
  BOOKING_PAID_CANNOT_CANCEL = 'Đơn đặt vé này đã được thanh toán thành công, không thể hủy!',
  NO_CANCEL_PERMISSION = 'Bạn không có quyền hủy đơn đặt vé này!',
  DUPLICATE_PENDING_BOOKING = 'Bạn đã có đơn đặt vé đang chờ thanh toán!',

  // Thanh toán (Payments)
  PAYMENT_BOOKING_NOT_FOUND = 'Không tìm thấy đơn đặt vé tương ứng!',
  PAYMENT_ALREADY_PAID = 'Đơn đặt vé này đã được thanh toán thành công trước đó!',
  PAYMENT_EXPIRED = 'Đơn đặt vé đã hết hạn thanh toán và đã bị hủy!',
  PAYMENT_AMOUNT_MISMATCH = 'Số tiền thanh toán không khớp với giá trị đơn hàng!',
  PAYMENT_SEATS_TAKEN = 'Ghế của đơn đặt vé đã bị mua bởi khách hàng khác!',

  // Xác thực (Auth)
  AUTH_INVALID_CREDENTIALS = 'Sai tài khoản hoặc mật khẩu',
  AUTH_NO_USER_INFO = 'Không có thông tin người dùng. Vui lòng đăng nhập.',
  AUTH_FORBIDDEN = 'Bạn không có quyền truy cập vào chức năng này!',

  // Quyền người dùng & Đặt vé (User & Booking Permissions)
  BOOKING_CREATE_FOR_OTHER = 'Bạn không thể tạo đặt vé cho người dùng khác!',
  BOOKING_VIEW_OTHER_LIST = 'Bạn không có quyền xem danh sách vé của người dùng khác!',
  BOOKING_VIEW_OTHER_DETAILS = 'Bạn không có quyền xem thông tin đặt vé này!',
  USER_VIEW_OTHER = 'Bạn không có quyền xem thông tin của người dùng khác!',
  USER_UPDATE_OTHER = 'Bạn không có quyền chỉnh sửa thông tin của người dùng khác!',
}
