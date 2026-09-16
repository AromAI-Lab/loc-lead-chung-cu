/**
 * Kiểm thử chặn hồi quy: LỜI CỦA SALE KHÔNG ĐƯỢC GẮN CỜ CHO KHÁCH.
 *
 * Lỗi thật đo được 16/09/2026: cờ Ảo quét toàn hội thoại, nên câu chào hàng
 * bình thường của chính sale — "để em gửi anh bảng hàng" — làm khách dính cờ
 * A1 "nghi môi giới đối thủ". A1 là cờ quyết định nên một cờ đủ xếp ẢO.
 * Một lead 9/12 NÓNG bị đẩy thành ẢO, và công cụ bảo sale vứt nó đi.
 *
 * Đây là kiểu sai đắt nhất của sản phẩm này: không phải chấm lệch vài điểm,
 * mà là ném đi đúng khách sắp mua.
 */
import { chamDiem } from '../public/lib/criteria.js';

const KHACH_NONG = `S: Em chào anh, bên em còn căn 2PN hướng Đông Nam ạ.
K: Anh đang tìm căn 2 phòng ngủ cho vợ chồng anh ở, tầm 70m2 trở lên.
K: Anh có tài chính 5 tỷ, không cần vay đâu em, trả thẳng một lần luôn.
K: Vợ chồng anh thống nhất rồi, trước Tết là phải nhận nhà.
K: Anh đi xem 2 dự án quanh đây rồi nhưng chưa ưng.`;

/* Đúng những câu sale nói hằng ngày, không có gì bất thường */
const CAU_SALE_BINH_THUONG = [
  'S: Dạ vâng anh, để em gửi anh bảng hàng ạ.',
  'S: Dạ bên em đang có chiết khấu 3% cho khách thanh toán sớm ạ.',
  'S: Dạ em gửi khách bảng giá và chính sách bán hàng ạ.',
  'S: Dạ quỹ căn tầng trung còn ít lắm anh ơi, để em lock giúp anh nhé.'
];

export function kiemThuLoiSale(bao) {
  /* 1. Thêm bất kỳ câu chào hàng nào của sale cũng không được đổi kết luận */
  const goc = chamDiem(KHACH_NONG, {});
  bao(goc.phanLoai === 'NÓNG', 'Khách nóng, không có câu sale nào: phải là NÓNG',
    `${goc.phanLoai} ${goc.tongDiem}/12`);

  for (const cau of CAU_SALE_BINH_THUONG) {
    const kq = chamDiem(KHACH_NONG + '\n' + cau, {});
    bao(kq.phanLoai === 'NÓNG',
      `Lời sale không được làm khách thành ẢO: ${cau.slice(3, 48)}…`,
      `nhận được ${kq.phanLoai} · cờ ${kq.coAo.map((c) => c.ma).join(',') || 'không'}`);
    bao(kq.coAo.length === 0,
      `Lời sale không được sinh cờ Ảo: ${cau.slice(3, 48)}…`,
      kq.coAo.map((c) => `${c.ma} ${c.ten}`).join(' ; ') || 'không cờ');
  }

  /* 2. Chiều ngược lại: KHÁCH dùng từ nghề thì VẪN phải bắt được */
  const moiGioiThat = `S: Dạ em chào anh ạ.
K: Anh hỏi bên em bảng hàng dự án này còn quỹ căn nào không.
K: Chiết khấu cho sàn bao nhiêu phần trăm em, hoa hồng thế nào.
K: Anh có khách gửi sang, lock giúp anh 2 căn tầng trung nhé.
S: Dạ để em kiểm tra ạ.`;
  const kqMG = chamDiem(moiGioiThat, {});
  bao(kqMG.phanLoai === 'ẢO', 'Môi giới đối thủ thật thì vẫn phải xếp ẢO',
    `${kqMG.phanLoai} · cờ ${kqMG.coAo.map((c) => c.ma).join(',') || 'không'}`);
  bao(kqMG.coAo.some((c) => c.ma === 'A1'), 'Phải đúng cờ A1');

  /* 3. Không tách được lời khách: phải NÓI RÕ cờ có thể oan */
  const khongTach = (KHACH_NONG + '\nS: Dạ vâng anh, để em gửi anh bảng hàng ạ.')
    .replace(/^[KS]: /gm, '');
  const kqKT = chamDiem(khongTach, {});
  bao(/gắn oan/.test(kqKT.ghiChuTinCay || ''),
    'Không tách được thì phải cảnh báo cờ Ảo có thể bị gắn oan',
    kqKT.ghiChuTinCay || '(không có ghi chú)');
  bao(kqKT.doTinCay === 'thấp', 'Và độ tin cậy phải là "thấp"');
}
