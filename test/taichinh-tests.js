/**
 * Kiểm thử chặn hồi quy cho lỗi T1 — Tài chính.
 *
 * Nguồn gốc: một sale đang dùng thật báo ngày 15/09/2026:
 *   "khách ghi có tài chính mà dữ liệu hiện ra báo còn thiếu"
 *
 * Nguyên nhân gốc: danh sách từ khoá VON không có hai cách nói phổ biến nhất
 * của người Việt — "tài chính" và "ngân sách" — và thang điểm thưởng cho
 * TỪ NGỮ thay vì thưởng cho THÔNG TIN, nên một con số cụ thể chỉ được 1 điểm
 * rồi bị xếp vào "chưa rõ".
 *
 * Mấy phép dưới đây tồn tại để lỗi đó không quay lại lần thứ hai.
 */
import { chamDiem } from '../public/lib/criteria.js';
import { trichChanDung } from '../public/lib/profile.js';

/* Hội thoại có tách được lời khách, khách nói rõ tài chính bằng con số. */
const CA_SALE_BAO = `
S: Dạ em chào anh, bên em còn căn 2PN hướng Đông Nam ạ.
K: Anh đang tìm căn 2 phòng ngủ cho vợ chồng anh ở, tầm 70m2 trở lên.
K: Anh có tài chính 5 tỷ, không cần vay đâu em, trả thẳng một lần luôn.
K: Vợ chồng anh thống nhất rồi, trước Tết là phải nhận nhà.
S: Dạ vâng anh, để em gửi anh bảng hàng ạ.
`;

/* Cùng nội dung tài chính nhưng KHÔNG có tiền tố K:/S: — không tách được. */
const CA_KHONG_TACH_DUOC = `
Chào em bên em còn căn 2 phòng ngủ nào không, căn này giá 3,2 tỷ em nhé,
sổ hồng lâu dài, bàn giao đầy đủ nội thất, anh xem cho gia đình ở thôi,
diện tích tầm 70m2, anh muốn xem thêm vài căn nữa rồi mới quyết định.
`;

/* Khách không đả động gì tới tiền. */
const CA_KHONG_NOI_TIEN = `
K: Bên em còn căn 2 phòng ngủ nào không em, anh xem cho gia đình ở.
K: Anh muốn hướng Đông Nam, tầng cao một chút cho thoáng.
K: Anh cũng chưa vội lắm, xem dần thôi em ạ.
S: Dạ vâng anh, để em gửi anh vài căn ạ.
`;

const timT1 = (kq) => (kq.tieuChi || []).find((x) => x.ma === 'T1');

export function kiemThuTaiChinh(bao) {
  /* 1. Đúng ca sale báo: khách nói "có tài chính 5 tỷ" */
  {
    const kq = chamDiem(CA_SALE_BAO, {});
    const t1 = timT1(kq);
    bao(kq.duLieuDu === true, 'Ca sale báo: chấm được');
    bao(t1.diem >= 2, 'Khách nói "có tài chính 5 tỷ" phải được ÍT NHẤT 2 điểm T1',
      `nhận được ${t1.diem} điểm · ${t1.canCu.join(' | ')}`);

    const cd = trichChanDung(CA_SALE_BAO, kq, null, {});
    bao(!cd.vuongMac.includes('Chưa rõ khả năng tài chính'),
      'KHÔNG được báo "Chưa rõ khả năng tài chính" khi khách đã nói con số',
      `vướng mắc: ${cd.vuongMac.join(' | ') || 'không có'}`);
    bao(!cd.cauNenHoi.some((c) => /thu xếp tiền mặt|vay ngân hàng/.test(c)),
      'KHÔNG được hỏi lại về tài chính khi khách đã trả lời rồi',
      `câu nên hỏi: ${cd.cauNenHoi.join(' | ') || 'không có'}`);
    bao(cd.taiChinh !== 'Chưa rõ', 'Hồ sơ khách phải điền được ô Tài chính',
      `ô tài chính = "${cd.taiChinh}"`);
  }

  /* 2. Sale tự gõ ngân sách vào ô — cũng phải tính */
  {
    const kq = chamDiem(CA_KHONG_NOI_TIEN, { nganSachKhachNeu: '5' });
    const t1 = timT1(kq);
    bao(t1.diem >= 2, 'Sale gõ ngân sách vào ô thì T1 phải được ít nhất 2 điểm',
      `nhận được ${t1.diem} điểm · ${t1.canCu.join(' | ')}`);

    const cd = trichChanDung(CA_KHONG_NOI_TIEN, kq, null, { nganSachKhachNeu: '5' });
    bao(!cd.vuongMac.includes('Chưa rõ khả năng tài chính'),
      'Sale đã gõ ngân sách thì không được báo "Chưa rõ khả năng tài chính"',
      `vướng mắc: ${cd.vuongMac.join(' | ') || 'không có'}`);
  }

  /* 3. Cái bẫy ngược: con số có thể là GIÁ SALE BÁO, không được thổi điểm */
  {
    const kq = chamDiem(CA_KHONG_TACH_DUOC, {});
    const t1 = timT1(kq);
    bao(t1.diem <= 1,
      'Không tách được lời khách thì con số tiền KHÔNG được tính đủ điểm',
      `nhận được ${t1.diem} điểm · ${t1.canCu.join(' | ')}`);
    bao(t1.canCu.some((c) => /không tách được|KHÔNG tách được/i.test(c)),
      'Phải nói rõ lý do hạ điểm, không im lặng',
      t1.canCu.join(' | '));
    bao(kq.doTinCay === 'thấp', 'Độ tin cậy phải là "thấp"', `nhận được "${kq.doTinCay}"`);
  }

  /* 4. Không nói gì về tiền thì vẫn phải là 0 điểm — không được nới tay quá */
  {
    const kq = chamDiem(CA_KHONG_NOI_TIEN, {});
    const t1 = timT1(kq);
    bao(t1.diem === 0, 'Khách không đả động tới tiền thì T1 = 0',
      `nhận được ${t1.diem} điểm · ${t1.canCu.join(' | ')}`);

    const cd = trichChanDung(CA_KHONG_NOI_TIEN, kq, null, {});
    bao(cd.vuongMac.includes('Chưa rõ khả năng tài chính'),
      'Lúc này MỚI được báo "Chưa rõ khả năng tài chính"',
      `vướng mắc: ${cd.vuongMac.join(' | ') || 'không có'}`);
  }

  /* 5. Các cách nói khác của cùng một ý — đều phải bắt được */
  {
    const cachNoi = [
      'ngân sách của anh khoảng 4 tỷ',
      'khả năng chi của anh tầm 3 tỷ',
      'anh lo được 5 tỷ',
      'anh xoay được khoảng 4,5 tỷ',
      'anh trả thẳng luôn không vay',
      'anh thanh toán một lần 6 tỷ'
    ];
    for (const c of cachNoi) {
      const vb = `K: Anh tìm căn 2PN cho gia đình ở, tầm 70m2, ${c}.
K: Vợ chồng anh quyết rồi, trước Tết nhận nhà.
S: Dạ vâng anh.`;
      const t1 = timT1(chamDiem(vb, {}));
      bao(t1.diem >= 2, `Bắt được cách nói: "${c}"`, `${t1.diem} điểm · ${t1.canCu.join(' | ')}`);
    }
  }
}
