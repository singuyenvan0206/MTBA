/**
 * Enum tập trung toàn bộ thông báo hiển thị cho người dùng phía Frontend.
 * Mọi alert(), thông báo lỗi, hoặc UI text nên được lấy từ đây.
 */
export enum AppMessage {
  // --- Booking ---
  BOOKING_SELECT_SEAT = 'Vui lòng chọn ít nhất 1 ghế!',
  BOOKING_CONNECTION_ERROR = 'Lỗi kết nối server',
  BOOKING_SESSION_EXPIRED = 'Thời gian giữ ghế đã hết. Vui lòng chọn lại!',

  // --- Payment ---
  PAYMENT_SUCCESS = 'Thanh toán thành công!',
  PAYMENT_FAILED = 'Lỗi khi thanh toán',
  PAYMENT_CONNECTION_ERROR = 'Lỗi kết nối server',
  PAYMENT_SESSION_EXPIRED = 'Thời gian giữ ghế đã hết hạn. Đơn đặt vé của bạn đã bị hủy.',
  PAYMENT_TRANSFER_SUCCESS = 'Thanh toán chuyển khoản thành công!',

  // --- Booking Cancellation ---
  CANCEL_CONFIRM = 'Bạn có chắc chắn muốn hủy đơn đặt vé này và giải phóng các ghế đã chọn?',
  CANCEL_SUCCESS = 'Đã hủy đơn đặt vé thành công và giải phóng các ghế!',
  CANCEL_FAILED = 'Lỗi khi hủy đơn đặt vé',
  CANCEL_CONNECTION_ERROR = 'Lỗi kết nối server khi hủy đặt vé',

  // --- Auth / Login ---
  LOGIN_FAILED = 'Đăng nhập thất bại',
  LOGIN_ADMIN_REDIRECT = 'Tài khoản Quản trị vui lòng đăng nhập tại trang Admin.',
  LOGIN_CONNECTION_ERROR = 'Lỗi kết nối server',
  LOGIN_ADMIN_ONLY = 'Tài khoản này không có quyền quản trị viên.',

  // --- POS2 Payment ---
  POS_PAYMENT_SUCCESS = 'Thanh toán thành công! In vé...',
  POS_PAYMENT_FAILED = 'Thanh toán thất bại.',
  POS_PAYMENT_CONNECTION_ERROR = 'Lỗi kết nối server khi thanh toán.',
  POS_CUSTOMER_NOT_FOUND = 'Không tìm thấy khách hàng với số điện thoại này!',
  POS_CUSTOMER_SEARCH_ERROR = 'Không tìm thấy khách hàng hoặc lỗi kết nối.',

  // --- POS2 Booking (movies/[id]) ---
  POS_BOOKING_SELECT_SEAT = 'Vui lòng chọn ít nhất 1 ghế!',
  POS_BOOKING_ERROR = 'Có lỗi xảy ra khi đặt vé.',
  POS_BOOKING_CONNECTION_ERROR = 'Lỗi kết nối server',
}
