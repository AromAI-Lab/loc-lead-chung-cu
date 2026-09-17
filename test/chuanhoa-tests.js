/**
 * Kiểm thử lớp chuẩn hoá đầu vào hỗn hợp — không dấu, tiếng Anh, viết tắt.
 *
 * ⚠️ NGUỒN DỮ LIỆU — đọc trước khi tin vào bộ này.
 * Phần A (chống nhầm lẫn) và phần B (viết tắt) kiểm thử ĐẶC TÍNH NGÔN NGỮ:
 * "vậy" bỏ dấu ra "vay", "lại sau" bỏ dấu ra "lãi sau". Những chuyện đó đúng
 * bất kể ai gõ, nên không cần hội thoại thật.
 *
 * Phần C (tương đương có dấu / không dấu) chạy trên chính CA_KIEM_THU — hội
 * thoại do người viết mã nghĩ ra. Theo mục 6 của BAN-GIAO.md, kiểm thử xanh
 * trên hội thoại nghĩ ra KHÔNG chứng minh người viết nghĩ đúng. Khi chị Hương
 * đưa được hội thoại thật kiểu hỗn hợp, PHẢI thay phần C bằng hội thoại đó.
 * Tới lúc ấy hãy xoá đoạn ghi chú này.
 */
import { chamDiem, khop, TU_KHOA } from '../public/lib/criteria.js';
import { chuanHoa } from '../public/lib/chuanhoa.js';
import { anDanhHoa } from '../public/lib/anonymize.js';
import { trichChanDung } from '../public/lib/profile.js';
import { CA_KIEM_THU } from './fixtures.js';

const boDau = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D');

export function kiemThuChuanHoa(bao) {

  /* ───── A. Chống nhầm lẫn: những chữ KHÔNG được khớp ───── */

  /* Va chạm đắt nhất: "vậy" bỏ dấu ra đúng chữ "vay".
     "giá bao nhiêu vậy em" là câu hỏi phổ thông nhất của khách Việt. Nếu nó
     bị tính là khách nói chuyện vay ngân hàng thì mọi hội thoại không dấu đều
     được không một điểm T1 — và ca "khách thật mới tìm hiểu" bị đẩy lên bậc
     cao hơn thay vì nằm yên ở Lạnh sâu để nuôi. */
  bao(khop('gia bao nhieu vay em', TU_KHOA.VAY) === false,
    'A1 · "bao nhieu vay em" (= vậy) KHÔNG được tính là vay ngân hàng');
  bao(khop('u chi xem da, chua voi, khi nao tien chi lien he lai nhe', TU_KHOA.VAY) === false,
    'A2 · Câu khách nói cho qua chuyện không được tính là vay');

  /* Nhưng vẫn phải bắt được vay thật khi gõ không dấu. */
  bao(khop('anh co san 1,2 ty con lai vay', TU_KHOA.VAY) === true,
    'A3 · "con lai vay" không dấu VẪN phải bắt được là vay');
  bao(khop('gia nay chac phai vay ngan hang', TU_KHOA.VAY) === true,
    'A4 · "phai vay ngan hang" không dấu vẫn bắt được');
  bao(khop('ls sau uu dai la bao nhieu', TU_KHOA.VAY) === true,
    'A5 · Viết tắt "ls" mở ra lãi suất');

  /* "lãi\b" bỏ dấu ra "lai", đụng "lại" — có trong gần như mọi hội thoại. */
  bao(khop('de em goi lai cho anh nhe', TU_KHOA.VAY) === false,
    'A6 · "goi lai" KHÔNG được tính là lãi');
  /* "lãi sau" bỏ dấu ra "lai sau", đụng "lại sau" — và VAY_SAU cho thẳng 3 điểm T1. */
  bao(khop('de em nhan lai sau nhe anh', TU_KHOA.VAY_SAU) === false,
    'A7 · "nhan lai sau" KHÔNG được tính là hỏi lãi sau ưu đãi');
  bao(khop('lai sau uu dai len bao nhieu em', TU_KHOA.VAY_SAU) === true,
    'A8 · Hỏi lãi sau ưu đãi thật thì vẫn bắt được (qua "sau uu dai")');

  /* "đang có" bỏ dấu đụng "đang cố". */
  bao(khop('anh dang co gang thu xep', TU_KHOA.VON) === false,
    'A9 · "dang co gang" KHÔNG được tính là có sẵn tiền');
  bao(khop('anh đang có 3 tỷ tiền mặt', TU_KHOA.VON) === true,
    'A10 · Bản CÓ DẤU của "đang có" vẫn bắt được như cũ');

  /* "cưới" bỏ dấu đụng "cuối" — cuối năm, cuối tuần. */
  bao(khop('cuoi nam nay anh moi tinh', TU_KHOA.LY_DO) === false,
    'A11 · "cuoi nam" KHÔNG được tính là lý do cưới');

  /* Tiền: chỉ tính khi có con số đứng ngay trước. */
  bao(khop('toa nay ty le hap thu cao lam', TU_KHOA.TIEN) === false,
    'A12 · "ty le" KHÔNG được tính là số tiền');
  bao(khop('anh co 5 ty', TU_KHOA.TIEN) === true, 'A13 · "5 ty" không dấu là số tiền');
  bao(khop('tam 3,2 ty', TU_KHOA.TIEN) === true, 'A14 · "3,2 ty" không dấu là số tiền');

  /* ───── B. Viết tắt: cái nào mở, cái nào cố tình KHÔNG mở ───── */

  bao(khop('anh can can 2pn huong dong nam', TU_KHOA.HOI_CU_THE) === true,
    'B1 · "2pn" mở thành phòng ngủ');
  bao(khop('looking for a 2BR unit', TU_KHOA.HOI_CU_THE) === true,
    'B2 · "2BR" (tiếng Anh) mở thành phòng ngủ');
  bao(khop('vc em thong nhat roi', TU_KHOA.QUYET_MANH) === true,
    'B3 · "vc" mở thành vợ chồng');
  bao(khop('bg tho hay co ntt san', TU_KHOA.HOI_CU_THE) === true,
    'B4 · "bg" và "ntt" mở thành bàn giao / nội thất');

  /* Bốn chữ dưới đây CỐ TÌNH không mở. Lý do ở đầu chuanhoa.js.
     Nếu ai đó thêm chúng vào bảng viết tắt, bốn phép này phải đỏ. */
  bao(!/chiet khau/.test(chuanHoa('em ck cho anh 500k nhe')),
    'B5 · "ck" KHÔNG được mở thành chiết khấu (ck hay là chuyển khoản)');
  bao(!/khach hang/.test(chuanHoa('anh kh co nhu cau')),
    'B6 · "kh" KHÔNG được mở thành khách hàng (kh hay là "không")');
  bao(!/dien tich/.test(chuanHoa('cho anh xin dt lien he')),
    'B7 · "dt" KHÔNG được mở thành diện tích (dt hay là điện thoại)');
  bao(!/noi that/.test(chuanHoa('anh nt lai cho em sau')),
    'B8 · "nt" KHÔNG được mở thành nội thất (nt hay là nhắn tin)');

  /* Hệ quả quan trọng nhất của B5: một khách thật nhắn "ck" không được
     thành ẢO. Cờ A1 là cờ quyết định — một cờ là đủ để tool bảo sale vứt đi. */
  const khachCK = `
K: Em oi can 2pn 65m2 con khong? Anh dang tim cho vo chong anh o.
S: Da con anh a.
K: Anh co san 3 ty, con lai phai vay ngan hang. Neu chot thi anh ck coc luon duoc khong?
K: So hong lau dai chu em? Voi phi quan ly bao nhieu mot met vuong?
K: Thang 12 het hop dong thue la anh phai don vao roi.`;
  const kqCK = chamDiem(khachCK, {});
  bao(kqCK.phanLoai !== 'ẢO',
    'B9 · Khách nhắn "ck" (chuyển khoản cọc) KHÔNG được xếp ẢO',
    `${kqCK.phanLoai} · cờ ${kqCK.coAo.map((x) => x.ma).join(',') || 'không'}`);

  /* ───── C. Tương đương: cùng hội thoại, có dấu và không dấu ───── */

  for (const c of CA_KIEM_THU) {
    if (c.kyVong === 'KHONG_DU_DU_LIEU') continue;
    const a = chamDiem(c.hoiThoai, c.coTay);
    const b = chamDiem(boDau(c.hoiThoai), c.coTay);
    bao(a.phanLoai === b.phanLoai,
      `C · Bỏ dấu KHÔNG được đổi phân loại: ${c.ten.slice(0, 44)}`,
      `có dấu "${a.phanLoai}" ${a.tongDiem}/12 · không dấu "${b.phanLoai}" ${b.tongDiem}/12`);
    bao(Math.abs(a.tongDiem - b.tongDiem) <= 1,
      `C · Bỏ dấu lệch tối đa 1 điểm: ${c.ten.slice(0, 44)}`,
      `${a.tongDiem} so với ${b.tongDiem}`);
  }

  /* ───── D. Hội thoại lẫn tiếng Anh phải chấm được ───── */

  const lanTiengAnh = `
K: Hi em, I'm looking for a 2BR unit around 70 sqm for my family.
K: My wife and I already agreed, we want to move in before Tet.
K: My budget is around 5 ty, I can pay in full, no loan needed.
K: What is the management fee per sqm? And is the handover with furniture?
K: I visited two other projects last week but the balcony direction was bad.`;
  const kqAnh = chamDiem(lanTiengAnh, {});
  bao(kqAnh.duLieuDu === true, 'D1 · Hội thoại tiếng Anh vẫn chấm được');
  bao(kqAnh.phanLoai === 'NÓNG',
    'D2 · Khách nóng viết bằng tiếng Anh phải ra NÓNG',
    `${kqAnh.phanLoai} ${kqAnh.tongDiem}/12 · ` + kqAnh.tieuChi.map((x) => `${x.ma}=${x.diem}`).join(' '));
  bao(kqAnh.coAo.length === 0,
    'D3 · Khách tiếng Anh không được gắn cờ Ảo',
    kqAnh.coAo.map((x) => x.ma).join(','));

  /* ───── E. Chân dung khách cũng phải đọc được bản không dấu ─────

     Chấm đúng mà hồ sơ trống thì mới xong một nửa. Định vị của sản phẩm là
     "máy điền hồ sơ khách từ hội thoại" — hồ sơ trống là mất đúng thứ đang
     bán. Trước 17/09 profile.js có bộ so khớp riêng chỉ dò tiếng Việt có dấu. */

  const caNong = CA_KIEM_THU.find((c) => c.ten.startsWith('Khách nóng'));
  const lamHoSo = (vanBan) => {
    const sach = anDanhHoa(vanBan).ketQua;
    const luat = chamDiem(sach, caNong.coTay);
    return trichChanDung(sach, luat, null, caNong.coTay);
  };
  const hsCoDau = lamHoSo(caNong.hoiThoai);
  const hsKhongDau = lamHoSo(boDau(caNong.hoiThoai));

  bao(hsKhongDau.nhuCau === hsCoDau.nhuCau,
    'E1 · Hồ sơ: ô Nhu cầu phải giống nhau giữa hai bản',
    `có dấu "${hsCoDau.nhuCau}" · không dấu "${hsKhongDau.nhuCau}"`);
  bao(hsKhongDau.nhuCau !== 'Chưa rõ', 'E2 · Ô Nhu cầu không được trống ở bản không dấu');
  bao(hsKhongDau.taiChinh !== 'Chưa rõ',
    'E3 · Ô Tài chính không được trống ở bản không dấu', hsKhongDau.taiChinh);
  bao(hsKhongDau.nguoiQuyet !== 'Chưa rõ',
    'E4 · Ô Người quyết không được trống ở bản không dấu', hsKhongDau.nguoiQuyet);
  bao(/2\s*(pn|phong ngu)/i.test(hsKhongDau.loaiCan || ''),
    'E5 · Ô Loại căn đọc được "2pn" viết không dấu', `nhận "${hsKhongDau.loaiCan}"`);
}
