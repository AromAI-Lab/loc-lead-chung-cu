/**
 * Kiểm thử hội thoại gõ KHÔNG DẤU.
 *
 * Lịch sử tệp này, giữ lại vì nó là ví dụ về cách một lỗi được chữa hai lần:
 *
 *   16/09/2026 — đo được: cùng một hội thoại, có dấu chấm NÓNG 9/12, bỏ dấu
 *   chấm LẠNH 3/12. Lệch 6 điểm và máy im lặng.
 *   Bản vá ngày đó chỉ CẢNH BÁO, không chấm đúng. Các phép kiểm thử vì vậy
 *   chỉ đòi máy "nói ra rằng nó đang không chắc".
 *
 *   17/09/2026 — lớp chuẩn hoá (chuanhoa.js) chấm đúng cho văn bản không dấu.
 *   Nên các phép dưới đây đổi hẳn yêu cầu: không còn đòi máy thú nhận sai,
 *   mà đòi máy RA CÙNG MỘT KẾT QUẢ. Phép nào cũ mà giữ lại thì thành ra khoá
 *   chặt cái sai vào chỗ cũ.
 */
import { chamDiem } from '../public/lib/criteria.js';

const CO_DAU = `S: Em chào anh, bên em còn căn 2PN hướng Đông Nam ạ.
K: Anh đang tìm căn 2 phòng ngủ cho vợ chồng anh ở, tầm 70m2 trở lên.
K: Anh có tài chính 5 tỷ, không cần vay đâu em, trả thẳng một lần luôn.
K: Vợ chồng anh thống nhất rồi, trước Tết là phải nhận nhà.
K: Anh đi xem 2 dự án quanh đây rồi nhưng chưa ưng.`;

const boDau = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D');

export function kiemThuKhongDau(bao) {
  const coDau = chamDiem(CO_DAU, {});
  const khongDau = chamDiem(boDau(CO_DAU), {});

  /* ── Phần cốt lõi: hai bản phải ra cùng kết quả ── */

  bao(coDau.phanLoai === khongDau.phanLoai,
    'Cùng hội thoại: bỏ dấu KHÔNG được đổi phân loại',
    `có dấu "${coDau.phanLoai}" ${coDau.tongDiem}/12 · không dấu "${khongDau.phanLoai}" ${khongDau.tongDiem}/12`);

  bao(Math.abs(coDau.tongDiem - khongDau.tongDiem) <= 1,
    'Cùng hội thoại: bỏ dấu lệch tối đa 1 điểm (trước 17/09 lệch 6)',
    `${coDau.tongDiem} so với ${khongDau.tongDiem}`);

  bao(khongDau.tongDiem >= 9,
    'Ca đo ngày 16/09: bản không dấu phải quay lại mức NÓNG',
    `${khongDau.tongDiem}/12 · ` + khongDau.tieuChi.map((x) => `${x.ma}=${x.diem}`).join(' '));

  /* ── Vẫn phải NHẬN RA và NÓI RA là đoạn chat không dấu ── */

  bao(coDau.thieuDau === false, 'Hội thoại CÓ dấu: không gắn cờ thiếu dấu');
  bao(khongDau.thieuDau === true, 'Hội thoại KHÔNG dấu: vẫn phải gắn cờ thiếu dấu');

  bao(/KHÔNG DẤU/.test(khongDau.ghiChuTinCay || ''),
    'Vẫn nói thẳng trên màn hình là đoạn chat không có dấu',
    khongDau.ghiChuTinCay || '(không có ghi chú)');

  /* Câu chữ phải đi theo sự thật mới. Nói "điểm thấp hơn thực tế" trong khi
     máy đã chấm đúng là dạy người dùng nghi ngờ một kết quả đúng — lần sau họ
     sẽ bỏ qua cả cảnh báo thật. */
  bao(!/THẤP HƠN THỰC TẾ/.test(khongDau.ghiChuTinCay || ''),
    'KHÔNG được còn câu "điểm thấp hơn thực tế" — nay đã chấm đúng',
    khongDau.ghiChuTinCay || '');
  bao(/vẫn chấm được/.test(khongDau.ghiChuTinCay || ''),
    'Phải nói rõ là vẫn chấm được, kèm phần còn kém bản có dấu');

  bao(!/KHÔNG DẤU/.test(coDau.ghiChuTinCay || ''),
    'Hội thoại có dấu thì KHÔNG hiện cảnh báo này',
    coDau.ghiChuTinCay || '(không có ghi chú)');

  bao(chamDiem('K: ok em. S: da vang a.', {}).thieuDau !== true,
    'Đoạn quá ngắn thì không kết luận thiếu dấu');

  /* Không dấu nhưng tách được lời khách: chỉ hạ MỘT bậc tin cậy, không ép
     xuống "thấp". Ép xuống thấp khi đã chấm đúng là tự bôi đen kết quả đúng. */
  bao(khongDau.doTinCay !== 'khá',
    'Không dấu thì độ tin cậy phải hạ, không được giữ nguyên mức cao nhất',
    khongDau.doTinCay);

  /* Dính cả hai vấn đề thì phải báo cả hai, không nuốt mất một cái. */
  const caHai = chamDiem(boDau(CO_DAU).replace(/^[KS]: /gm, ''), {});
  bao(/KHÔNG DẤU/.test(caHai.ghiChuTinCay || '') && /tách được/.test(caHai.ghiChuTinCay || ''),
    'Dính cả hai vấn đề thì phải báo cả hai',
    caHai.ghiChuTinCay || '(không có ghi chú)');
  bao(caHai.doTinCay === 'thấp',
    'Không tách được lời khách thì vẫn là độ tin cậy "thấp"', caHai.doTinCay);
}
