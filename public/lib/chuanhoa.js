/**
 * Chuẩn hoá đầu vào hỗn hợp — không dấu, lẫn tiếng Anh, viết tắt.
 *
 * VÌ SAO CÓ TỆP NÀY
 * Chị Hương xác nhận 17/09/2026: sale dán hội thoại vào thì thực tế gặp cả bốn
 * kiểu trộn lẫn nhau — có dấu, không dấu, lẫn tiếng Anh, và viết tắt. Toàn bộ
 * bộ từ khoá trong criteria.js viết bằng tiếng Việt CÓ DẤU, đầy đủ chữ.
 * Đo thật 16/09: cùng một hội thoại, có dấu chấm NÓNG 9/12, bỏ dấu chấm
 * LẠNH 3/12. Lệch 6 điểm, và máy không báo gì cả.
 *
 * Bản trước chỉ CẢNH BÁO. Tệp này để CHẤM ĐÚNG.
 *
 * CÁCH LÀM
 * Bỏ dấu cả văn bản lẫn mẫu từ khoá rồi so khớp trên cả hai dạng:
 * dạng gốc (bắt được văn bản có dấu, chính xác nhất) và dạng bỏ dấu
 * (bắt được văn bản không dấu). Một trong hai khớp là tính.
 *
 * CẠM BẪY và cách chặn
 * Bỏ dấu làm nhiều chữ khác nghĩa dồn về một mặt chữ. Ba chữ nguy hiểm nhất
 * nằm ở CAM_BO_DAU bên dưới, bị loại khỏi dạng bỏ dấu. Văn bản có dấu vẫn
 * bắt được chúng như cũ — chỉ mất ở văn bản không dấu, và mất một tín hiệu
 * còn hơn gắn oan một cờ Ảo.
 */

/**
 * Bỏ dấu tiếng Việt. Tách ký tự tổ hợp rồi xoá phần dấu; đ/Đ không có dạng
 * tổ hợp nên phải thay tay.
 */
export function boDau(s) {
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Bảng viết tắt — chỉ giữ những chữ CHỈ CÓ MỘT NGHĨA trong ngữ cảnh này.
 *
 * Áp dụng SAU khi bỏ dấu, nên vế thay thế cũng viết không dấu.
 *
 * ĐÃ LOẠI BỎ, và lý do — phần này quan trọng hơn phần giữ lại:
 *   ck  → KHÔNG mở thành "chiết khấu". Trong tin nhắn người Việt "ck" hầu hết
 *         là CHUYỂN KHOẢN. Mà "chiết khấu" nằm trong cờ A1 (nghi môi giới đối
 *         thủ) — cờ quyết định, một cờ là đủ xếp ẢO. Đổi một chữ "ck" của
 *         khách thật thành lệnh vứt lead đi là cái giá đắt nhất sản phẩm này
 *         có thể trả. Người viết đủ chữ "chiết khấu" thì vẫn bắt được.
 *   kh  → KHÔNG mở thành "khách hàng". "kh" trong chat thường là "không"
 *         ("kh có", "kh cần"). Mở sai là đảo ngược nghĩa câu.
 *   dt  → KHÔNG mở thành "diện tích". "dt"/"đt" thường là ĐIỆN THOẠI.
 *   sh  → KHÔNG mở thành "sổ hồng". "SH" còn là tên một dòng xe máy rất phổ
 *         biến ở Việt Nam.
 *   nt  → KHÔNG mở thành "nội thất". "nt" trong chat là "nhắn tin".
 *   k   → KHÔNG mở thành "nghìn". "k" đứng một mình thường là "không", và
 *         "nghìn" cũng không phải đơn vị tiền của phân khúc căn hộ.
 */
export const VIET_TAT = [
  [/(\d)\s*pn\b/gi, '$1 phong ngu'],   // "2pn", "2 pn"
  [/\bpn\b/gi, 'phong ngu'],
  [/(\d)\s*br\b/gi, '$1 phong ngu'],   // "2BR" — cách viết tiếng Anh
  [/\bbg\b/gi, 'ban giao'],
  [/\bntt\b/gi, 'noi that'],
  [/\bvc\b/gi, 'vo chong'],
  [/\bls\b/gi, 'lai suat']
];

/** Mở các chữ viết tắt trong văn bản ĐÃ bỏ dấu. */
export function moRongVietTat(t) {
  let s = String(t == null ? '' : t);
  for (const [mau, thay] of VIET_TAT) s = s.replace(mau, thay);
  return s;
}

/** Dạng dùng để so khớp: bỏ dấu rồi mở viết tắt. */
export function chuanHoa(t) {
  return moRongVietTat(boDau(t));
}

/**
 * Những nhánh từ khoá KHÔNG được dùng ở dạng bỏ dấu, vì bỏ dấu xong chúng
 * đụng thẳng vào chữ khác nghĩa và rất hay gặp:
 *
 *   lãi\b  → "lai"  đụng "lại" — "gọi lại", "nhắn lại", "trả lại".
 *                   Đây là chữ nguy hiểm nhất: "lại" có mặt trong gần như
 *                   mọi hội thoại sale. Giữ lại thì hội thoại nào cũng được
 *                   tính là có nói chuyện vay.
 *                   "lãi suất" đủ chữ thì vẫn bắt được, không mất gì.
 *   cưới   → "cuoi" đụng "cuối" — "cuối năm", "cuối tuần", "cuối tháng".
 *   đang có → "dang co" đụng "đang cố" — "đang cố gắng".
 *
 * Danh sách này phải khớp NGUYÊN VĂN một nhánh trong chuỗi mẫu, vì cách loại
 * là tách chuỗi mẫu theo dấu | rồi bỏ đúng nhánh đó ra.
 */
export const CAM_BO_DAU = ['lãi\\b', 'cưới', 'đang có', 'lãi sau'];

/**
 * Nhánh cần thu hẹp khi bỏ dấu (hiện chưa dùng nhánh nào).
 *
 * Lưu ý rút ra ngày 17/09/2026: chỗ này KHÔNG chặn được những nhánh vốn đã
 * viết bằng chữ không dấu, ví dụ "vay". Lý do: khi sale gõ thẳng không dấu,
 * văn bản GỐC đã là "vay" rồi, nên mẫu gốc khớp trước khi tới lượt lớp bỏ
 * dấu. Những nhánh như vậy phải siết ngay trong criteria.js — xem chú thích
 * ở hằng VAY.
 */
export const THAY_KHI_BO_DAU = {};

/**
 * Đổi một chuỗi mẫu (regex dạng chuỗi) sang dạng bỏ dấu, sau khi đã loại các
 * nhánh nguy hiểm. Trả về null nếu loại xong không còn nhánh nào.
 *
 * Tách theo | là an toàn với các mẫu hiện có: nhánh lồng trong ngoặc khi ghép
 * lại bằng | thì ra đúng chuỗi cũ, nên mẫu không bị vỡ khi không loại gì.
 */
export function mauBoDau(mau) {
  const giu = [];
  for (const x of String(mau).split('|')) {
    if (CAM_BO_DAU.includes(x)) continue;
    giu.push(Object.prototype.hasOwnProperty.call(THAY_KHI_BO_DAU, x) ? THAY_KHI_BO_DAU[x] : x);
  }
  if (giu.length === 0) return null;
  return boDau(giu.join('|'));
}
