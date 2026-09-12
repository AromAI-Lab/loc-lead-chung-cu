/**
 * Hàm serverless nhận webhook thanh toán từ Polar.
 *
 * VÌ SAO CẦN FILE NÀY
 * Không có nó, mỗi lần có người trả tiền là Mai Hương phải tự vào Polar xem ai
 * đã mua rồi mở khoá tay cho họ. Có nó, Polar tự gọi về đây ngay khi tiền vào,
 * và phần còn lại chạy không cần người ngồi trực.
 *
 * BẢO MẬT
 * Địa chỉ này ai cũng gọi được, nên không được tin bất kỳ gói tin nào chưa
 * kiểm chữ ký. POLAR_WEBHOOK_SECRET nằm trong biến môi trường của hosting,
 * không nằm trong mã nguồn, không lên GitHub.
 *
 * Polar dùng hai cơ chế ký tuỳ theo thời điểm cấp secret:
 *   - Từ 08/09/2026 00:00 UTC trở đi: chuẩn Standard Webhooks (secret là chuỗi base64).
 *   - Trước đó: Polar HMAC (phải base64-encode chuỗi secret rồi mới dùng làm khoá).
 * File này thử cả hai nên không phụ thuộc vào việc secret được cấp lúc nào.
 *
 * DỮ LIỆU CÁ NHÂN
 * Chỉ ghi log những gì cần để đối soát: mã đơn, tên gói, số tiền, email đã che.
 * Không ghi toàn bộ gói tin.
 */

import crypto from 'node:crypto';

// Gói tin cũ hơn ngần này thì từ chối, để kẻ xấu không thu lại gói tin cũ gửi lặp.
const HAN_GOI_TIN_GIAY = 5 * 60;

// Những sự kiện thật sự có nghĩa "tiền đã vào" hoặc "quyền dùng thay đổi".
const SU_KIEN_QUAN_TAM = new Set([
  'order.paid',
  'subscription.active',
  'subscription.canceled',
  'subscription.revoked',
]);

/**
 * Sinh các khoá HMAC ứng viên từ chuỗi secret.
 * Trả về nhiều khoá vì Polar có hai cơ chế ký, và ta không đoán trước được
 * secret của chị thuộc cơ chế nào.
 */
function khoaUngVien(secret) {
  const s = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  return [
    Buffer.from(s, 'base64'),                                    // Standard Webhooks
    Buffer.from(s, 'utf8'),                                      // dùng nguyên chuỗi
    Buffer.from(Buffer.from(s, 'utf8').toString('base64'), 'utf8'), // Polar HMAC cũ
  ].filter((k) => k.length > 0);
}

/**
 * Kiểm chữ ký theo chuẩn Standard Webhooks.
 * Nội dung được ký là ba phần nối bằng dấu chấm: mã gói tin, mốc thời gian, và
 * THÂN GÓI TIN NGUYÊN VĂN — nên bắt buộc phải đọc thân dạng chuỗi thô, không
 * được parse JSON rồi stringify lại (khác một dấu cách là chữ ký sai).
 */
export function chuKyHopLe({ id, timestamp, chuKyHeader, thanThô, secret }) {
  if (!id || !timestamp || !chuKyHeader) return false;

  const noiDungDuocKy = `${id}.${timestamp}.${thanThô}`;

  // Header có thể chứa nhiều chữ ký, cách nhau bằng dấu cách, dạng "v1,<base64>".
  const chuKyNhan = chuKyHeader
    .split(' ')
    .map((phan) => (phan.includes(',') ? phan.slice(phan.indexOf(',') + 1) : phan))
    .filter(Boolean)
    .map((b64) => Buffer.from(b64, 'base64'));

  for (const khoa of khoaUngVien(secret)) {
    const mongDoi = crypto.createHmac('sha256', khoa).update(noiDungDuocKy, 'utf8').digest();
    for (const nhan of chuKyNhan) {
      // So sánh kiểu timing-safe: không để lộ thông tin qua thời gian so sánh.
      if (nhan.length === mongDoi.length && crypto.timingSafeEqual(nhan, mongDoi)) {
        return true;
      }
    }
  }
  return false;
}

/** Che email trước khi ghi log: nguyenvana@gmail.com -> ng*******@gmail.com */
function cheEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) return '(không có)';
  const [ten, mien] = email.split('@');
  return `${ten.slice(0, 2)}${'*'.repeat(Math.max(1, ten.length - 2))}@${mien}`;
}

function traLoi(doiTuong, ma = 200) {
  return new Response(JSON.stringify(doiTuong), {
    status: ma,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * Mở bằng trình duyệt để kiểm tra endpoint còn sống.
 * Không trả về thông tin nhạy cảm nào.
 */
export async function GET() {
  return traLoi({
    endpoint: 'polar-webhook',
    trangThai: 'san sang',
    daCauHinhSecret: Boolean(process.env.POLAR_WEBHOOK_SECRET),
  });
}

export async function POST(request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] Chua cau hinh POLAR_WEBHOOK_SECRET');
    return traLoi({ loi: 'Máy chủ chưa cấu hình secret' }, 500);
  }

  // Đọc thân gói tin dạng chuỗi thô — bắt buộc, xem giải thích ở chuKyHopLe.
  const thanThô = await request.text();

  const id = request.headers.get('webhook-id');
  const timestamp = request.headers.get('webhook-timestamp');
  const chuKyHeader = request.headers.get('webhook-signature');

  // Chặn gói tin cũ bị gửi lặp lại.
  const lech = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(lech) || lech > HAN_GOI_TIN_GIAY) {
    console.warn('[webhook] Tu choi: moc thoi gian ngoai khoang cho phep');
    return traLoi({ loi: 'Mốc thời gian không hợp lệ' }, 400);
  }

  if (!chuKyHopLe({ id, timestamp, chuKyHeader, thanThô, secret })) {
    console.warn('[webhook] Tu choi: chu ky khong hop le');
    return traLoi({ loi: 'Chữ ký không hợp lệ' }, 401);
  }

  let suKien;
  try {
    suKien = JSON.parse(thanThô);
  } catch {
    return traLoi({ loi: 'Thân gói tin không phải JSON' }, 400);
  }

  const loai = suKien?.type ?? '(không rõ)';

  if (!SU_KIEN_QUAN_TAM.has(loai)) {
    // Vẫn trả 200: Polar coi mã khác 200 là thất bại và sẽ gửi lại tới 10 lần.
    console.log(`[webhook] Bo qua su kien khong quan tam: ${loai}`);
    return traLoi({ daNhan: true, xuLy: false, loai });
  }

  const dl = suKien?.data ?? {};
  console.log(
    `[webhook] ${loai} | don=${dl.id ?? '-'} | khach=${cheEmail(dl.customer?.email)} ` +
      `| goi=${dl.product?.name ?? '-'} | tien=${dl.amount ?? '-'} ${dl.currency ?? ''}`
  );

  // CHỖ CẮM BƯỚC TỰ ĐỘNG HOÁ TIẾP THEO
  // Ví dụ: bắn tin Telegram cho Mai Hương, gửi email kèm hướng dẫn dùng,
  // hoặc ghi một dòng vào bảng khách đã trả tiền.
  // Giữ phần này nhanh: Polar chờ tối đa 10 giây, nên việc nào chậm thì đẩy
  // sang hàng đợi chứ đừng làm ngay tại đây.

  return traLoi({ daNhan: true, xuLy: true, loai });
}
