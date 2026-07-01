# 🤖 Quy Tắc Phát Triển Dự Án MTBA (Movie Ticket Booking App) Dành Cho Gemini

Tài liệu này định nghĩa các quy tắc thiết kế, phát triển và chuẩn hóa mã nguồn mà Trợ lý AI (Gemini) bắt buộc phải tuân thủ khi làm việc trên kho mã nguồn (repository) MTBA.

---

## 📌 1. Nguyên Tắc Hoạt Động & Quy Trình Chung

1.  **Hiểu rõ kiến trúc Monorepo:**
    *   Dự án sử dụng npm workspaces với hai phân vùng chính: `code/frontend` (Next.js 16+) và `code/backend` (NestJS 11+).
    *   Mọi lệnh cài đặt hoặc chạy môi trường phải được đề xuất chạy từ thư mục gốc của monorepo.
2.  **Đọc kỹ Schema trước khi chỉnh sửa Database:**
    *   Trước khi thay đổi bất kỳ API hoặc logic liên quan đến dữ liệu nào, hãy đọc và phân tích cấu trúc trong [schema.prisma](file:///c:/Users/Simsimi/OneDrive/M%C3%A1y%20t%C3%ADnh/MTBA/code/backend/prisma/schema.prisma) để đảm bảo tính nhất quán của các bảng và các mối quan hệ.
3.  **Tương tác tệp tin:**
    *   Khi phản hồi hoặc viết hướng dẫn, luôn liên kết đến các file mã nguồn liên quan bằng đường dẫn tuyệt đối dạng Markdown (ví dụ: `[schema.prisma](file:///c:/Users/Simsimi/OneDrive/M%C3%A1y%20t%C3%ADnh/MTBA/code/backend/prisma/schema.prisma)`).
    *   **QUAN TRỌNG:** Tuyệt đối không bao quanh thẻ liên kết bằng dấu nháy ngược (sử dụng `[tên](đường_dẫn)` thay vì `[`tên`](đường_dẫn)`).
4.  **Tuyệt đối không viết Magic Strings:**
    *   Không viết các chuỗi thô (magic strings) trực tiếp trong mã nguồn cho các thông báo giao diện, đường dẫn API, trạng thái, hoặc thông báo lỗi.
    *   **Frontend**: Bắt buộc sử dụng hằng số/enum định nghĩa tập trung (như `UI_MESSAGES`, `APP_ROUTES`, `API_ENDPOINTS`).
    *   **Backend**: Bắt buộc sử dụng hệ thống cấu hình tập trung (như `ERROR_MESSAGES`, `SUCCESS_MESSAGES`, các enum từ Prisma/DB).

---

## ⚙️ 2. Quy Chuẩn Phát Triển Backend (NestJS & Prisma)

1.  **Phân tầng kiến trúc logic:**
    *   **Controller:** Chỉ xử lý routing, nhận request, kiểm tra dữ liệu đầu vào (Validation DTO) và phân quyền.
    *   **Service:** Chứa toàn bộ business logic và các truy vấn cơ sở dữ liệu thông qua Prisma Client. Không thực hiện các truy vấn database trực tiếp trong Controller.
2.  **Xác thực và Phân quyền (Authentication & Authorization):**
    *   Các API yêu cầu bảo mật bắt buộc phải sử dụng bộ đôi guard `JwtAuthGuard` và `RolesGuard` cùng với decorator `@Roles` từ `src/auth`.
    *   Quyền hạn phải dựa trên enum `role_role_name` trong Prisma (`ROLE_ADMIN`, `ROLE_USER`, `ROLE_STAFF`).
    *   Ví dụ phân quyền chuẩn:
        ```typescript
        @Roles(role_role_name.ROLE_ADMIN)
        @UseGuards(JwtAuthGuard, RolesGuard)
        @Post()
        create(@Body() dto: CreateMovieDto) { ... }
        ```
3.  **Quản lý lỗi tập trung (Centralized Error Handling):**
    *   Tuyệt đối không hardcode chuỗi thông báo lỗi. Mọi thông báo lỗi nghiệp vụ phải sử dụng các trường trong hằng số `ERROR_MESSAGES` định nghĩa tại [error-messages.constant.ts](file:///c:/Users/Simsimi/OneDrive/M%C3%A1y%20t%C3%ADnh/MTBA/code/backend/src/common/constants/error-messages.constant.ts).
    *   Ví dụ quăng lỗi:
        ```typescript
        throw new BadRequestException(ERROR_MESSAGES.BOOKING.SEAT_LIMIT_EXCEEDED);
        ```
4.  **Thay đổi Database Schema:**
    *   Mọi thay đổi cấu trúc bảng phải được cập nhật trong [schema.prisma](file:///c:/Users/Simsimi/OneDrive/M%C3%A1y%20t%C3%ADnh/MTBA/code/backend/prisma/schema.prisma).
    *   Sau khi sửa schema, luôn hướng dẫn người dùng chạy:
        1.  `npx prisma migrate dev --name <ten_migration>` để đồng bộ cơ sở dữ liệu.
        2.  `npx prisma generate` để cập nhật Prisma Client.
5.  **Chuẩn hóa API Cập Nhật (API Update Method):**
    *   Bắt buộc sử dụng phương thức HTTP `@Put(':id')` thay vì `@Patch(':id')` cho các API chỉnh sửa thông tin tài nguyên để thống nhất toàn bộ cấu trúc API của backend.
6.  **Kiểm Tra Trùng Lặp Lịch Chiếu (Showtimes Overlap Check):**
    *   Khi tạo hoặc sửa đổi lịch chiếu, bắt buộc kiểm tra sự chồng chéo khoảng thời gian (`start_time`, `end_time`) tại phòng chiếu (`screen_id`) tương ứng trong database.
    *   Khoảng thời gian bị coi là trùng nếu: `new_start_time < existing_end_time` và `new_end_time > existing_start_time`. Ném lỗi `BadRequestException(ERROR_MESSAGES.SHOWTIME.OVERLAP)` nếu trùng.

---

## 🎨 3. Quy Chuẩn Phát Triển Frontend (Next.js & Tailwind CSS)

1.  **Next.js App Router (React 19 & Next.js 16+):**
    *   Hiểu rõ sự khác biệt giữa Server Components (mặc định) và Client Components.
    *   Chỉ khai báo chỉ thị `'use client'` ở đầu file đối với các component cần quản lý state (`useState`, `useEffect`), sử dụng hook, hoặc có tương tác trực tiếp của người dùng.
2.  **Tailwind CSS v4:**
    *   Sử dụng hệ thống utility classes của Tailwind CSS v4 để styling giao diện.
    *   Hạn chế tối đa việc viết CSS thuần hoặc inline styles tùy tiện để giữ tính thống nhất về mặt thẩm mỹ.
3.  **Tích hợp & Xử lý lỗi API:**
    *   Khi gọi API lên backend bằng `fetch`, bắt buộc kiểm tra trạng thái phản hồi `res.ok`. Nếu không thành công, phải phân tích phản hồi (trích xuất thông báo lỗi từ server) và thông báo rõ ràng cho người dùng thay vì mặc định giả định thành công.
    *   Để tránh lỗi `SyntaxError: Unexpected end of JSON input` khi server phản hồi trống, hãy đọc chuỗi text (`res.text()`) và parse thủ công hoặc xử lý lỗi ngoại lệ an toàn trước khi gọi `.json()`.
4.  **Hộp thoại Custom thay thế Dialog trình duyệt:**
    *   Nghiêm cấm sử dụng các hộp thoại mặc định của trình duyệt như `alert()` và `confirm()`. Bắt buộc thiết kế và sử dụng các Custom Modal/Dialog Component đồng bộ với ngôn ngữ thiết kế của ứng dụng.
5.  **Đồng bộ hóa đường dẫn POS (Path Synchronization):**
    *   Hệ thống đồng bộ hiển thị màn hình phụ của POS2 chỉ được phép đồng bộ một chiều: thiết bị Staff đẩy đường dẫn lên server, và thiết bị Khách hàng (Passive Display) lấy đường dẫn về.
    *   Thiết bị Khách hàng tuyệt đối không được tự động đồng bộ ngược pathname lên server, tránh gây ra vòng lặp điều hướng vô hạn (endless routing ping-pong). Khi gọi `pushState` để đổi đường dẫn, phải truyền tham số `currentPath` tường minh để loại bỏ race condition. 
---

## 🔑 4. Nghiệp Vụ Đặc Thù & Bảo Mật (Core Domain Rules)

1.  **Mã Hóa Mật Khẩu (Password Hashing & Pepper):**
    *   Hệ thống sử dụng cơ chế bảo mật kết hợp `bcryptjs` với mã hóa bổ sung Salt & Pepper.
    *   Chuỗi `PASSWORD_PEPPER` phải được lấy từ biến môi trường `process.env.PASSWORD_PEPPER` và ghép vào mật khẩu gốc trước khi thực hiện băm (hash) hoặc đối chiếu (compare).
2.  **Xử Lý Thanh Toán SePay (VietQR Payment Verification):**
    *   Hệ thống tích hợp cổng thanh toán VietQR của SePay bằng hai phương án hoạt động song song:
        1.  **Active Polling:** Tự động gọi API của SePay để đối soát giao dịch mới nhất (có lưu cache tạm thời).
        2.  **Webhook callback:** Lắng nghe POST request tại `/payments-webhook` và kiểm tra Token thông qua header Authorization khớp với `SEPAY_API_TOKEN` / `SEPAY_API_KEY`.
    *   **Logic khớp giao dịch:** Webhook/Polling trích xuất mã đơn vé `bookingId` từ nội dung chuyển khoản, kiểm tra trùng lặp giao dịch, so khớp số tiền thanh toán (`amount`) với giá trị đơn hàng (`booking.total_price_movie`).
    *   **Xử lý đơn đặt vé quá hạn (Expired Bookings):** Trong trường hợp giao dịch chuyển khoản khớp với đơn đặt vé đã bị quá hạn thanh toán trong DB, hệ thống bắt buộc kiểm tra xem các ghế thuộc đơn vé đó đã bị đơn đặt vé thành công nào khác mua mất chưa. Nếu chưa bị trùng, cập nhật lại trạng thái và hoàn tất đơn vé; nếu bị trùng, báo lỗi trùng ghế và không hoàn tất giao dịch.
3.  **Giới Hạn Vé Đặt:**
    *   Khách hàng chỉ được phép đặt tối đa **8 ghế** cho mỗi giao dịch thanh toán để tránh đầu cơ vé. Nếu vượt quá, ném lỗi `SEAT_LIMIT_EXCEEDED`.

---

## 🧪 5. Kiểm Thử & Đảm Bảo Chất Lượng Code

1.  **Bảo toàn chú thích (Comments):**
    *   Giữ nguyên tất cả các chú thích (comments), docstrings hiện tại trong mã nguồn trừ khi chúng liên quan trực tiếp đến đoạn mã cần được sửa đổi.
2.  **Viết và chạy Unit Test:**
    *   Khi phát triển tính năng mới cho backend, luôn viết các unit test tương ứng trong file `*.spec.ts`.
    *   Sử dụng lệnh `npm run test -w code/backend` để chạy và kiểm tra xem các thay đổi có làm hỏng các test case cũ hay không.
3.  **Xử lý xung đột cổng khi khởi chạy Local (Windows Port Collision):**
    *   Khi gặp lỗi `EADDRINUSE: address already in use` cho cổng 3000 hoặc 3001 trên Windows, bắt buộc chạy lệnh `npx kill-port <port>` hoặc tìm PID và tắt qua `taskkill /PID <PID> /F` để giải phóng cổng trước khi chạy lại `npm run dev`.

---

*Trợ lý AI (Gemini) phải ghi nhớ và tuân thủ các quy tắc này trong suốt quá trình đồng hành và phát triển dự án cùng lập trình viên.*
