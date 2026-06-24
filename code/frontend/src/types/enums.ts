/**
 * Enum định nghĩa các role của người dùng.
 * Giá trị phải khớp với JWT payload từ Backend.
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Enum định nghĩa loại ghế ngồi.
 * Giá trị phải khớp với Prisma enum seat_type của Backend.
 */
export enum SeatType {
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  SWEETBOX = 'SWEETBOX',
}

/**
 * Enum định nghĩa loại phim.
 * Giá trị phải khớp với Prisma enum movie_type của Backend.
 */
export enum MovieType {
  TYPE_2D = 'TYPE_2D',
  TYPE_3D = 'TYPE_3D',
  TYPE_IMAX = 'TYPE_IMAX',
}

/**
 * Enum định nghĩa phương thức thanh toán.
 * Giá trị phải khớp với Prisma enum payment_payment_method của Backend.
 */
export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  EWALLET = 'EWALLET',
}

/**
 * Enum định nghĩa trạng thái thanh toán.
 * Giá trị phải khớp với Prisma enum payment_payment_status của Backend.
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
