export const SUCCESS_MESSAGES = {
  AUTH: {
    OTP_SENT: 'Đã gửi OTP qua Email',
    PASSWORD_RESET_OTP_SENT: 'Đã gửi mã khôi phục mật khẩu qua Email',
    PASSWORD_CHANGED: 'Mật khẩu của bạn đã được thay đổi thành công!',
    TEST_ADMIN: 'Chúc mừng! Bạn đã lọt qua vòng bảo vệ với tư cách là ADMIN.',
    TEST_USER: 'Thành công! Bạn đã gọi được API với tư cách là USER (Khách hàng).',
  },
  MOVIE: {
    DELETED: 'Deleted successfully',
  },
  PAYMENT: {
    WEBHOOK_SKIPPED_NOT_IN: 'Skipped: Giao dịch không phải loại nhận tiền',
    WEBHOOK_SKIPPED_NO_MATCH: 'Skipped: Nội dung chuyển khoản không khớp mã đặt vé',
    WEBHOOK_ALREADY_PAID: (bookingId: number | string) => `Booking #${bookingId} đã được thanh toán`,
    WEBHOOK_SUCCESS: (bookingId: number | string) => `Thanh toán đơn #${bookingId} thành công`,
  }
};
