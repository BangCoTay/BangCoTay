# Hướng dẫn Thiết lập: Stripe & OpenAI

Tài liệu này hướng dẫn cách cấu hình các biến môi trường cho Stripe và OpenAI trong tệp `backend/.env` của bạn.

## 💳 Cấu hình Stripe

### 1. Cách lấy `STRIPE_WEBHOOK_SECRET`

`STRIPE_WEBHOOK_SECRET` (bắt đầu bằng `whsec_`) được sử dụng để xác minh rằng các sự kiện gửi đến webhook endpoint của bạn thực sự đến từ Stripe.

#### Cho Môi trường Phát triển (Local):
1.  **Cài đặt Stripe CLI**: [Theo hướng dẫn chính thức](https://stripe.com/docs/stripe-cli).
2.  **Đăng nhập vào tài khoản Stripe**:
    ```bash
    stripe login
    ```
3.  **Lắng nghe các sự kiện**:
    ```bash
    stripe listen --forward-to localhost:3000/api/v1/payments/webhook
    ```
4.  CLI sẽ hiển thị **webhook signing secret** của bạn (ví dụ: `whsec_...`). Sao chép giá trị này và dán vào tệp `.env` cho biến `STRIPE_WEBHOOK_SECRET`.

#### Cho Môi trường Produk (Production):
1.  Truy cập [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).
2.  Thêm một endpoint (ví dụ: `https://yourdomain.com/api/v1/payments/webhook`).
3.  Sau khi tạo, nhấn **"Reveal"** trong phần **Signing secret** để lấy khóa `whsec_...`.

---

### 2. Cách sử dụng Stripe Sandbox (Test Mode)

Stripe cung cấp **Test Mode** cho phép bạn giả lập thanh toán mà không dùng tiền thật.

1.  **Bật Test Mode**: Trong [Stripe Dashboard](https://dashboard.stripe.com/), gạt công tắc **"Test mode"** ở góc trên bên phải.
2.  **Lấy Test API Keys**:
    - Vào **Developers > API keys**.
    - Sử dụng **Secret key** (bắt đầu bằng `sk_test_...`) cho biến `STRIPE_SECRET_KEY` trong `.env`.
3.  **Số Thẻ Thử Nghiệm**:
    - Sử dụng thẻ thử nghiệm tiêu chuẩn: `4242 4242 4242 4242` với bất kỳ ngày hết hạn nào trong tương lai và mã CVC gồm 3 chữ số bất kỳ.
    - Bạn có thể tìm thêm nhiều loại thẻ thử nghiệm khác [tại đây](https://stripe.com/docs/testing).

---

## 🤖 Cấu hình OpenAI

### 1. Cách lấy `OPENAI_API_KEY`

1.  **Tạo tài khoản**: Truy cập [platform.openai.com](https://platform.openai.com/).
2.  **Tạo Khóa (Key)**:
    - Điều hướng đến **Dashboard > API Keys**.
    - Nhấn **"+ Create new secret key"**.
    - Sao chép khóa ngay lập tức (khóa bắt đầu bằng `sk-...`). Dán nó vào tệp `.env` cho biến `OPENAI_API_KEY`.
3.  **Cấu hình Model**:
    - Trong code của bạn, bây giờ bạn có thể chỉ định model muốn sử dụng (ví dụ: `gpt-4o`, `gpt-4-turbo`, v.v.).
    - *Lưu ý: Hiện tại, `gpt-5-nano` chưa phải là tên model được phát hành công khai. Nếu bạn đã được cấp quyền truy cập sớm, hãy kiểm tra tài liệu của tổ chức bạn để biết chính xác ID.*

---

## 🧪 Kiểm thử Luồng Thanh toán

1.  Khởi động backend: `npm run dev` (trong thư mục `backend`).
2.  Khởi động frontend: `npm run dev` (trong thư mục `frontend`).
3.  Nhấn nút "Upgrade" trong giao diện ứng dụng.
4.  Bạn sẽ được chuyển hướng đến trang Stripe Checkout.
5.  Nhập một email thử nghiệm và sử dụng thẻ `4242`.
6.  Sau khi thành công, bạn sẽ được chuyển hướng quay lại dashboard.
7.  Kiểm tra terminal của backend và Stripe CLI để xác nhận sự kiện `checkout.session.completed` đã được xử lý.
