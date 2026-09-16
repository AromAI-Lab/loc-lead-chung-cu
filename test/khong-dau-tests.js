/**
 * Kiểm thử cảnh báo "gõ không dấu".
 *
 * Đo ngày 16/09/2026: cùng một hội thoại, có dấu chấm NÓNG 9/12, bỏ dấu chấm
 * LẠNH 3/12. Sai 6 điểm mà máy không báo gì — kiểu sai tệ nhất là sai âm thầm.
 *
 * Mấy phép dưới đây không đòi máy chấm ĐÚNG cho văn bản không dấu. Chúng chỉ
 * đòi máy NÓI RA rằng nó đang không chắc.
 */
import { chamDiem } from '../public/lib/criteria.js';

const CO_DAU = `S: Em chào anh, bên em còn căn 2PN hướng Đông Nam ạ.
K: Anh đang tìm căn 2 phòng ngủ cho vợ chồng anh ở, tầm 70m2 trở lên.
K: Anh có tài chính 5 tỷ, không cần vay đâu em, trả thẳng một lần luôn.
K: Vợ chồng anh thống nhất rồi, trước Tết là phải nhận nhà.
K: Anh đi xem 2 dự án quanh đây rồi nhưng chưa ưng.`;

const boDau = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D');

export function kiemThuKhongDau(bao) {
  const coDau = chamDiem(CO_DAU, {});
  const khongDau = chamDiem(boDau(CO_DAU), {});

  bao(coDau.thieuDau === false, 'Hội thoại CÓ dấu: không gắn cờ thiếu dấu');
  bao(khongDau.thieuDau === true, 'Hội thoại KHÔNG dấu: phải gắn cờ thiếu dấu');

  bao(khongDau.doTinCay === 'thấp',
    'Không dấu thì độ tin cậy phải hạ xuống "thấp"', `nhận được "${khongDau.doTinCay}"`);

  bao(/KHÔNG DẤU/.test(khongDau.ghiChuTinCay || ''),
    'Phải nói thẳng ra trên màn hình là đoạn chat không có dấu',
    khongDau.ghiChuTinCay || '(không có ghi chú)');

  bao(/THẤP HƠN THỰC TẾ/.test(khongDau.ghiChuTinCay || ''),
    'Phải nói rõ điểm bị thấp hơn thực tế, không chỉ nói chung chung');

  bao(!/KHÔNG DẤU/.test(coDau.ghiChuTinCay || ''),
    'Hội thoại có dấu thì KHÔNG được hiện cảnh báo này',
    coDau.ghiChuTinCay || '(không có ghi chú)');

  /* Không được gắn cờ nhầm cho đoạn ngắn hoặc đoạn toàn số */
  bao(chamDiem('K: ok em. S: da vang a.', {}).thieuDau !== true,
    'Đoạn quá ngắn thì không kết luận thiếu dấu');

  /* Ghép hai cảnh báo: vừa không dấu vừa không tách được lời khách */
  const caHai = chamDiem(boDau(CO_DAU).replace(/^[KS]: /gm, ''), {});
  bao(/KHÔNG DẤU/.test(caHai.ghiChuTinCay || '') && /tách được/.test(caHai.ghiChuTinCay || ''),
    'Dính cả hai vấn đề thì phải báo cả hai, không nuốt mất một cái',
    caHai.ghiChuTinCay || '(không có ghi chú)');
}
