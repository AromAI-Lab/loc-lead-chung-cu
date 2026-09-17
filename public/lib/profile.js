/**
 * Trích CHÂN DUNG KHÁCH từ một hội thoại đã ẩn danh hoá.
 *
 * Vì sao module này tồn tại
 * -------------------------
 * Chấm điểm trả lời câu hỏi "có nên gọi người này trước không". Nó không trả lời
 * được câu hỏi ba tuần sau: "người này là ai, đã nói gì, mình đang đứng ở đâu".
 * Khảo sát của Meey Land (07/2021) cho thấy 97% môi giới vẫn lưu khách bằng sổ
 * tay hoặc Excel và 50% thường xuyên quên thông tin khách — dù CRM miễn phí đã
 * có từ lâu. Bức tường không phải chỗ lưu, mà là công đoạn GÕ TAY.
 *
 * Nên module này làm đúng một việc: biến hội thoại thành bản ghi có cấu trúc
 * mà sale không phải gõ chữ nào.
 *
 * Nguyên tắc bất di bất dịch
 * --------------------------
 * KHÔNG trả về và KHÔNG lưu hội thoại gốc. Chỉ giữ các trường đã rút gọn, lấy
 * từ bản ĐÃ ẩn danh hoá. Xem thêm lib/anonymize.js và README mục Bảo mật.
 */

import { tachLoiKhach, TU_KHOA as TK, khop as khopHaiDang } from './criteria.js';
import { chuanHoa, mauBoDau } from './chuanhoa.js';

const soViet = (n) => String(n).replace('.', ',');

/* Chân dung khách phải đọc được hội thoại gõ không dấu y như phần chấm điểm.
   Trước 17/09/2026 module này có bộ so khớp riêng, chỉ dò tiếng Việt có dấu —
   nên hội thoại không dấu chấm ra NÓNG mà hồ sơ khách thì trống trơn, và đó
   mới là nửa sản phẩm mà sale giữ lại được sau ba tuần.
   Nay dùng chung đường so khớp hai dạng với criteria.js. */

/** Lấy đoạn khớp ĐẦU TIÊN. Ưu tiên bản gốc để giữ nguyên cách khách viết. */
const khop = (t, mau) => {
  const goc = String(t || '').match(new RegExp(mau, 'iu'));
  if (goc) return goc[0].trim();
  const m = mauBoDau(mau);
  if (!m) return '';
  const bd = chuanHoa(t).match(new RegExp(m, 'iu'));
  return bd ? bd[0].trim() : '';
};

/** Lấy MỌI đoạn khớp, bỏ trùng. Tìm ở bản gốc trước, không có mới tìm bản bỏ dấu. */
const khopHet = (t, mau) => {
  const gom = (chuoi, m) => {
    const ds = String(chuoi || '').match(new RegExp(m, 'giu')) || [];
    const thay = [];
    for (const x of ds) {
      const s = x.trim().toLowerCase();
      if (!thay.includes(s)) thay.push(s);
    }
    return thay;
  };
  const a = gom(t, mau);
  if (a.length) return a;
  const m = mauBoDau(mau);
  return m ? gom(chuanHoa(t), m) : [];
};

const co = (t, mau) => khopHaiDang(String(t || ''), mau);

/* ─────────── Từ khoá riêng của chân dung ─────────── */

const O = 'để ở|nhà (anh|chị|em|mình) ở|gia đình ở|mua ở|ở thôi|hai vợ chồng ở|dọn vào|con vào lớp|ra riêng';
const DAU_TU = 'đầu tư|lướt sóng|lướt\\b|sinh lời|sang tay|mua đi bán lại|dòng tiền';
const CHO_THUE = 'cho thuê|khai thác thuê|thuê lại';

const LOAI_CAN = '\\b(studio|duplex|penthouse|shophouse|officetel)\\b|\\b[1-4]\\s*(?:pn|phòng ngủ)\\b';
const DIEN_TICH = '\\b\\d{2,3}([.,]\\d+)?\\s*m\\s*[2²]';

/* ─────────── Các trường ─────────── */

function locNhuCau(t) {
  if (co(t, O)) return 'Để ở';
  if (co(t, CHO_THUE)) return 'Cho thuê';
  if (co(t, DAU_TU)) return 'Đầu tư';
  return 'Chưa rõ';
}

function locTaiChinh(t) {
  const vay = co(t, TK.VAY);
  const von = co(t, TK.VON);
  const kyLuong = co(t, TK.VAY_SAU);
  if (kyLuong) return 'Đã tính kỹ khoản vay (hỏi lãi sau ưu đãi / thẩm định)';
  if (vay && von) return 'Có vốn tự có, phần còn lại vay';
  if (vay) return 'Có tính vay ngân hàng';
  if (von) return 'Nói là có tiền sẵn';
  return 'Chưa rõ';
}

function locNguoiQuyet(t) {
  if (co(t, TK.QUYET_HO)) return 'Hỏi hộ người khác';
  if (co(t, TK.QUYET_MANH)) return 'Tự quyết được hoặc đã thống nhất trong nhà';
  if (co(t, TK.QUYET_VUA)) return 'Còn phải bàn với người nhà';
  return 'Chưa rõ';
}

/** Lấy mọi con số tiền trong lời khách, giữ nguyên cách viết gốc. */
function locSoTien(t) {
  return khopHet(t, TK.TIEN).map((x) => x.replace(/\s+/g, ' '));
}

/**
 * Suy ra chỗ còn thiếu và CÂU NÊN HỎI TIẾP.
 *
 * Đây là phần có giá trị nhất của chân dung: nó không mô tả quá khứ mà chỉ ra
 * việc tiếp theo. Mỗi tiêu chí dưới 2 điểm là một ô trống, và mỗi ô trống có
 * đúng một câu hỏi lấp được nó.
 */
const CAU_HOI_LAP_O = {
  T1: 'Anh/chị dự tính thu xếp tiền mặt hay có tính vay ngân hàng không ạ?',
  T2: 'Ngoài anh/chị thì còn ai cùng quyết căn này nữa không ạ?',
  T3: 'Anh/chị mua để gia đình ở hay để đầu tư ạ? Cần mấy phòng ngủ ạ?',
  T4: 'Anh/chị dự tính khi nào thì cần nhận nhà ạ? Đã đi xem dự án nào quanh đây chưa ạ?'
};

const TEN_O_TRONG = {
  T1: 'Chưa rõ khả năng tài chính',
  T2: 'Chưa biết ai là người quyết',
  T3: 'Chưa rõ nhu cầu thật',
  T4: 'Chưa có mốc thời gian'
};

function locVuongMac(t, luat) {
  const v = [];
  for (const tc of luat.tieuChi || []) {
    if (tc.diem <= 1 && TEN_O_TRONG[tc.ma]) v.push(TEN_O_TRONG[tc.ma]);
  }
  for (const c of luat.coAo || []) v.push(`Cờ ${c.ma} — ${c.ten}`);
  if (co(t, TK.MO_HO) && !v.includes('Chưa có mốc thời gian')) {
    v.push('Khách tự nói là chưa vội');
  }
  return v;
}

function locCauNenHoi(luat) {
  return (luat.tieuChi || [])
    .filter((tc) => tc.diem <= 1 && CAU_HOI_LAP_O[tc.ma])
    .sort((a, b) => a.diem - b.diem)
    .slice(0, 3)
    .map((tc) => CAU_HOI_LAP_O[tc.ma]);
}

/**
 * @param {string} vanBanSach Hội thoại ĐÃ ẩn danh hoá
 * @param {object} luat       Kết quả chamDiem()
 * @param {object|null} ai    Kết quả /api/score, có thể null
 * @param {object} coTay      Giá căn / ngân sách sale nhập tay
 * @returns {object} chân dung — KHÔNG chứa hội thoại gốc
 */
export function trichChanDung(vanBanSach, luat, ai = null, coTay = {}) {
  const toanBo = String(vanBanSach || '');
  const { loiKhach } = tachLoiKhach(toanBo);
  const t = loiKhach;

  const soTien = locSoTien(t);
  const nganSachNhap = Number(coTay.nganSachKhachNeu) || 0;
  const giaCanNhap = Number(coTay.giaCanDangBan) || 0;

  const loai = khop(t, LOAI_CAN);

  return {
    /* Sale tự điền, để trống thì danh sách hiện nhãn tạm */
    ten: '',
    nguon: '',
    ghiChu: '',

    /* Máy trích */
    nhuCau: locNhuCau(t),
    loaiCan: loai ? loai.toUpperCase().replace(/\s+/g, '') : '',
    dienTich: khop(t, DIEN_TICH).replace(/\s+/g, ''),
    nganSach: nganSachNhap ? `${soViet(nganSachNhap)} tỷ` : (soTien[0] || ''),
    giaCan: giaCanNhap ? `${soViet(giaCanNhap)} tỷ` : '',
    soTienNhacToi: soTien,
    taiChinh: locTaiChinh(t),
    nguoiQuyet: locNguoiQuyet(t),
    lyDoMua: khop(t, TK.LY_DO),
    mocThoiGian: khop(t, TK.MOC_TG),
    daDiXem: co(t, TK.DA_XEM),
    quanTam: khopHet(t, TK.HOI_CU_THE),

    /* Từ lớp chấm điểm */
    diem: luat.tongDiem,
    phanLoai: luat.phanLoai,
    lyDoPhanLoai: luat.lyDoPhanLoai,
    doTinCay: luat.doTinCay,
    coAo: (luat.coAo || []).map((c) => c.ma),

    /* Việc tiếp theo */
    vuongMac: locVuongMac(t, luat),
    cauNenHoi: locCauNenHoi(luat),
    viecTiepTheo: (luat.hanhDong && luat.hanhDong.viec) || '',
    tinNhanGoiY: (ai && ai.tinNhanGoiY) || '',
    diemMuChinh: (ai && ai.diemMuChinh) || '',
    diemAI: ai && !ai.aiTat ? ai.tongDiem : null,

    /* Dấu thời gian */
    lanChamCuoi: new Date().toISOString()
  };
}

export { CAU_HOI_LAP_O, TEN_O_TRONG };
