/**
 * Cấu hình ESLint — chỉ để bắt MỘT loại lỗi: dùng biến chưa khai báo.
 *
 * Vì sao có tệp này: ngày 16/09/2026, khi sửa bố cục trang, hai dòng khai báo
 * biến (`chanDungHienTai` và `NGUON_LEAD`) bị xoá nhầm cùng đoạn mã cũ.
 * Hậu quả: khối "Chân dung khách" và nút "Lưu hồ sơ" biến mất khỏi trang,
 * trong khi `npm test` vẫn báo 94 phép xanh — vì các phép đó chỉ chạy phần
 * lõi tính toán bằng Node, không chạy được phần gắn vào trang.
 *
 * Đây không phải sơ suất một lần mà là lỗ hổng trong cách kiểm thử: toàn bộ
 * public/app.js không có phép kiểm thử nào, và lỗi chỉ lộ ra khi có người
 * bấm nút thật. `no-undef` bắt đúng loại lỗi đó mà không cần trình duyệt.
 *
 * Cố ý KHÔNG bật các luật về cách viết (dấu cách, dấu chấm phẩy, độ dài dòng).
 * Thêm luật kiểu đó lúc này chỉ tạo ra hàng trăm cảnh báo vô hại rồi ai cũng
 * bỏ qua, và một công cụ bị bỏ qua thì không bảo vệ được gì.
 */
export default [
  {
    files: ['public/**/*.js', 'api/**/*.js', 'test/**/*.js', '*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        /* Trình duyệt */
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        localStorage: 'readonly', sessionStorage: 'readonly',
        fetch: 'readonly', console: 'readonly', setTimeout: 'readonly',
        clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly',
        Event: 'readonly', Blob: 'readonly', URL: 'readonly', FileReader: 'readonly',
        alert: 'readonly', location: 'readonly', addEventListener: 'readonly',
        /* Có sẵn trong Node 18+ và trong hàm serverless của Vercel */
        Response: 'readonly', Request: 'readonly', Headers: 'readonly', AbortController: 'readonly',
        /* Node, cho api/ và test/ */
        process: 'readonly', Buffer: 'readonly', crypto: 'readonly',
        __dirname: 'readonly', require: 'readonly', module: 'writable',
        globalThis: 'readonly', TextEncoder: 'readonly', TextDecoder: 'readonly'
      }
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      'no-undef': 'error',          // ← luật chính, lý do tệp này tồn tại
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-const-assign': 'error'
    }
  }
];
