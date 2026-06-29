export const CONFIG_DEFAULTS = {
  JWT_SECRET: 'your_jwt_secret_key',
  JWT_REFRESH_SECRET: 'your_jwt_refresh_secret_key',
  PASSWORD_PEPPER: '',
  OTP_EXPIRES_MINUTES: '5',
  POS_DEFAULT_SESSION_ID: 'default',
  MOVIE_AGE_LIMIT: {
    P: 'PHIM DÀNH CHO MỌI LỨA TUỔI',
    K: 'DƯỚI 13 TUỔI XEM CÙNG CHA MẸ',
    DEFAULT_18: 'PHIM DÀNH CHO KHÁN GIẢ TỪ 18 TUỔI TRỞ LÊN',
    DYNAMIC: (age: string) => `PHIM DÀNH CHO KHÁN GIẢ TỪ ${age} TUỔI TRỞ LÊN`
  },
  BOOKING: {
    MAX_SEATS_PER_ORDER: 8,
    CLOSE_MINUTES_BEFORE_SHOW: 10,
  },
  PAYMENT: {
    EXPIRE_MINUTES: 5,
    EXPIRE_GRACE_SECONDS: 30, // Thời gian trễ mạng cho phép
    POLLING_CACHE_DURATION_SECONDS: 10, // Lưu cache bao nhiêu giây trước khi gọi API webhook thực
  }
};
