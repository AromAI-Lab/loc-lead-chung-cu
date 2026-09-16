/**
 * Động cơ chấm điểm lead bất động sản — lớp luật cứng.
 * Bộ tiêu chí hiện hiệu chuẩn cho CĂN HỘ CHUNG CƯ. Xem mục "Mở rộng phân khúc"
 * trong docs/scoring-criteria.md trước khi dùng cho đất nền hay nhà phố.
 *
 * Chạy hoàn toàn trong trình duyệt, không gọi mạng, không cần API key.
 * Đây là lưới an toàn: kể cả khi lớp AI hỏng, mất mạng hay hết hạn mức,
 * sản phẩm vẫn trả được kết quả.
 *
 * Thiết kế 2 trục — đây là điểm khác biệt so với các tool chấm lead sẵn có:
 *   Trục 1 (0–12 điểm): nếu là khách thật thì gần chốt đến đâu.
 *   Trục 2 (cờ Ảo):     có thật sự là khách mua hay không.
 * "Ảo" KHÔNG phải là "điểm thấp". Một môi giới đối thủ giả làm khách có thể
 * trả lời trơn tru và đạt điểm cao; một khách thật mới tìm hiểu thì điểm thấp
 * nhưng vẫn đáng nuôi. Gộp hai thứ vào một thang điểm là sai về bản chất.
 *
 * Chi tiết bộ tiêu chí: xem docs/scoring-criteria.md
 */

const co = (t, ...tu) => tu.some((x) => new RegExp(x, 'iu').test(t));

/**
 * Tách riêng lời của KHÁCH ra khỏi lời của sale.
 *
 * Vì sao cần: nếu chấm trên cả khối văn bản thì chính lời chào hàng của sale
 * ("dạ căn này 3,2 tỷ, sổ hồng lâu dài") sẽ bị đếm thành tín hiệu của khách,
 * làm điểm phồng lên. Đây là nguồn sai số lớn nhất của bản chấm theo khối.
 *
 * Nhận diện tiền tố đầu dòng: K:, KH:, Khách:, C:, Client:
 * Không tách được thì trả về nguyên văn và báo độ tin cậy thấp hơn.
 */
export function tachLoiKhach(vanBan) {
  const dong = String(vanBan || '').split(/\r?\n/);
  const reKhach = /^\s*(K|KH|Kh[áa]ch|C)\s*[:：]\s*/i;
  const reSale = /^\s*(S|Sale|M[îi]nh|Em|MG)\s*[:：]\s*/i;

  const loiKhach = [];
  let thayTienTo = 0;
  for (const d of dong) {
    if (reKhach.test(d)) { loiKhach.push(d.replace(reKhach, '')); thayTienTo++; }
    else if (reSale.test(d)) { thayTienTo++; }
  }

  if (thayTienTo >= 3 && loiKhach.length >= 2) {
    return { loiKhach: loiKhach.join('\n'), tachDuoc: true };
  }
  return { loiKhach: String(vanBan || ''), tachDuoc: false };
}
const dem = (t, mau) => (t.match(new RegExp(mau, 'giu')) || []).length;

/* ─────────── Từ khoá tín hiệu ─────────── */

const TIEN = '\\d+([.,]\\d+)?\\s*(tỷ|tỉ|triệu|tr\\b|củ\\b)';
const VAY = 'vay|trả góp|ngân hàng|lãi suất|lãi\\b|gói vay|giải ngân';
const VAY_SAU = 'thả nổi|sau ưu đãi|hết ưu đãi|lãi sau|duyệt vay|thẩm định|pre-?approve|chứng minh thu nhập';
/* Sale phản hồi 15/09: khách nói "có tài chính 5 tỷ" mà tool vẫn báo "chưa rõ tài chính".
   Nguyên nhân: hai cách nói phổ biến nhất của người Việt — "tài chính" và "ngân sách" —
   không có trong danh sách. Bổ sung cả các cách nói trả thẳng không vay. */
const VON = 'có sẵn|tự có|vốn|sẵn tiền|tiền mặt|đang có|tài chính|ngân sách|khả năng chi|lo được|xoay được|chuẩn bị được|trả thẳng|trả một lần|thanh toán thẳng|thanh toán một lần|full tiền|cash\\b|tầm giá|trong khoảng';

const QUYET_MANH = 'hai vợ chồng|vợ chồng (em|anh|mình)|chốt rồi|thống nhất rồi|(em|anh|tôi) (tự )?quyết|quyết định rồi|hai đứa';
const QUYET_VUA = 'hỏi lại (vợ|chồng)|bàn với|hỏi ý|bố mẹ|gia đình|người nhà|về bàn';
const QUYET_HO = 'hỏi hộ|hỏi giùm|hỏi giúp|người quen nhờ|bạn (em|anh) nhờ';

const HOI_CU_THE =
  'thông thuỷ|thông thủy|tim tường|phí quản lý|hướng ban công|hướng nào|ban công|' +
  'chỗ để ô tô|hầm xe|chỗ đỗ|bàn giao|nội thất|thô hay|sổ hồng|sổ đỏ|pháp lý|' +
  'tiến độ|mật độ|tiện ích|block|toà nào|tầng bao nhiêu|tầng mấy|m2 bao nhiêu|' +
  'giá.{0,6}m2|một mét vuông|/m2|diện tích';
const HOI_CHUNG =
  'còn căn nào|giá bao nhiêu|bao nhiêu tiền|nhiêu vậy|gửi bảng giá|có gì gửi|' +
  'gửi em xem|cho xin giá|giá thế nào|bao nhiêu ạ';
const LY_DO =
  'sinh con|có em bé|chuyển việc|chuyển công tác|hết hợp đồng thuê|hết hạn thuê|' +
  'gần trường|con vào lớp|ở riêng|cưới|kết hôn|bố mẹ lên|ra riêng|đang thuê';

const DA_XEM = 'đã xem|xem rồi|đi xem|đang xem|so sánh|bên .{0,15} (cũng|thì)|dự án .{0,20} (thì|cũng)';
const MOC_TG =
  'tháng (1[0-2]|[1-9])\\b|cuối năm|đầu năm|quý [1-4]|trước tết|sau tết|' +
  'hết hợp đồng|trong (tháng|tuần) này|tuần sau|cuối tuần này|dọn vào';
const MO_HO = 'đang tìm hiểu|tham khảo|xem dần|khi nào tiện|chưa vội|từ từ|để tính';

/* Cờ Ảo */
const A1_MOI_GIOI =
  'chiết khấu|hoa hồng|bảng hàng|rổ hàng|giỏ hàng|gửi khách|có căn nào giá tốt|' +
  'hàng ngộp|cắt lỗ|bên em có khách|anh có khách|share khách|phí môi giới|' +
  'ck bao nhiêu|hợp tác bán';
const A7_LUA_DAO =
  'việc nhẹ lương cao|đầu tư sinh lời|nạp tiền|kết bạn zalo riêng|' +
  'cho (anh|chị) xin (cccd|căn cước|số tài khoản)|click vào|bấm vào link|' +
  'nhận quà|trúng thưởng|vay nhanh|hỗ trợ tài chính';

/* ─────────── Trục 1: 4 tiêu chí ─────────── */

/**
 * T1 — Tài chính.
 *
 * Sửa 16/09 sau phản hồi của một sale đang dùng thật: trước đây khách nêu hẳn
 * một CON SỐ ngân sách mà chỉ được 1 điểm, rồi bị xếp vào "chưa rõ tài chính".
 * Đó là thang điểm thưởng cho TỪ NGỮ thay vì thưởng cho THÔNG TIN — sai.
 * Một con số cụ thể là bằng chứng mạnh hơn hẳn một chữ "vốn tự có" nói suông.
 *
 * Nhưng có một cái bẫy: chính lời chào hàng của sale ("căn này 3,2 tỷ") cũng là
 * con số. Nên con số chỉ được 2 điểm khi nó đến từ nguồn đáng tin:
 *   - tách được lời khách, tức con số đó là khách nói; hoặc
 *   - sale tự gõ vào ô "ngân sách khách nêu".
 * Không tách được thì giữ 1 điểm và nói rõ lý do, thay vì âm thầm thổi điểm.
 *
 * @param {string} t       Lời khách (đã tách nếu tách được)
 * @param {object} boiCanh { nganSachTay: boolean, tachDuoc: boolean }
 */
/**
 * Đoạn chat này có gõ dấu tiếng Việt không?
 *
 * Vì sao cần: toàn bộ bộ từ khoá viết CÓ DẤU ("tài chính", "vợ chồng", "tỷ").
 * Người gõ không dấu thì gần như không khớp từ nào. Đo thật ngày 16/09/2026:
 * cùng một hội thoại, có dấu chấm NÓNG 9/12, bỏ dấu chấm LẠNH 3/12 — lệch
 * 6 điểm, và máy không báo gì cả. Xếp một khách nóng vào nhóm "chạm 2 tuần
 * một lần" là kiểu sai tệ nhất: sai âm thầm.
 *
 * Bản vá này KHÔNG cố chấm đúng cho văn bản không dấu — bỏ dấu rồi so khớp
 * đẻ ra nhầm lẫn mới ("vốn" và "vơn", "tỷ" và "ti"), phải làm cẩn thận và có
 * bộ kiểm thử riêng. Ở đây chỉ làm một việc: KHÔNG GIẤU chuyện đó nữa.
 *
 * Ngưỡng: tiếng Việt có dấu thường có 15–25% ký tự mang dấu. Dưới 4% thì
 * gần như chắc chắn là gõ không dấu.
 */
function thieuDauTiengViet(t) {
  const chu = String(t || '').match(/[a-zà-ỹA-ZÀ-ỸđĐ]/g) || [];
  if (chu.length < 40) return false;            // quá ngắn để kết luận
  const coDau = String(t).match(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/g) || [];
  return (coDau.length / chu.length) < 0.04;
}

function chamTaiChinh(t, boiCanh = {}) {
  const canCu = [];
  let diem = 0;
  const { nganSachTay = false, tachDuoc = false } = boiCanh;

  const coTien = co(t, TIEN) || nganSachTay;
  const coVay = co(t, VAY);
  const coVaySau = co(t, VAY_SAU);
  const coVon = co(t, VON) || nganSachTay;

  /* Con số có đáng tin không, hay có thể là giá sale tự báo? */
  const conSoDangTin = nganSachTay || (co(t, TIEN) && tachDuoc);

  if (coVaySau && (coTien || coVon)) {
    diem = 3;
    canCu.push('Nhắc tới lãi sau ưu đãi / thẩm định vay — dấu hiệu đã tính toán thật');
  } else if (conSoDangTin && (coVon || coVay)) {
    diem = 3;
    canCu.push(nganSachTay
      ? 'Sale đã ghi nhận ngân sách khách nêu, và khách có nói về nguồn tiền'
      : 'Khách nêu con số cụ thể VÀ nói được nguồn tiền (vốn tự có hoặc vay)');
  } else if (conSoDangTin) {
    diem = 2;
    canCu.push(nganSachTay
      ? 'Sale đã ghi nhận ngân sách khách nêu — coi như khách đã nói được khả năng chi'
      : 'Khách tự nêu một con số ngân sách cụ thể');
  } else if (coVon || (coTien && coVay)) {
    diem = 2;
    canCu.push('Nói được về nguồn tiền (vốn tự có / vay), chưa có con số chắc');
  } else if (coVay || coTien) {
    diem = 1;
    canCu.push(co(t, TIEN) && !tachDuoc
      ? 'Có con số tiền trong hội thoại nhưng KHÔNG tách được lời khách khỏi lời sale — có thể là giá sale báo, nên chưa tính đủ điểm'
      : 'Có nhắc tới tiền hoặc vay nhưng chưa có con số rõ');
  } else {
    canCu.push('Không đả động gì tới tài chính');
  }
  return { diem, canCu };
}

function chamQuyetDinh(t) {
  const canCu = [];
  let diem = 1;
  if (co(t, QUYET_HO)) {
    diem = 0;
    canCu.push('Hỏi hộ người khác — không nắm nhu cầu thật');
  } else if (co(t, QUYET_MANH)) {
    diem = 3;
    canCu.push('Đã thống nhất trong nhà hoặc tự quyết được');
  } else if (co(t, QUYET_VUA)) {
    diem = 2;
    canCu.push('Có nêu người cùng quyết nhưng chưa thống nhất');
  } else {
    canCu.push('Chưa xác định được ai là người quyết');
  }
  return { diem, canCu };
}

function chamNhuCau(t) {
  const canCu = [];
  const soCuThe = dem(t, HOI_CU_THE);
  const coLyDo = co(t, LY_DO);
  const chiHoiChung = co(t, HOI_CHUNG) && soCuThe === 0;
  let diem;

  if (soCuThe >= 2 && coLyDo) {
    diem = 3;
    canCu.push(`Hỏi ${soCuThe} chi tiết cụ thể về căn hộ VÀ nêu lý do mua`);
  } else if (soCuThe >= 2 || (soCuThe >= 1 && coLyDo)) {
    diem = 2;
    canCu.push(`Hỏi ${soCuThe} chi tiết cụ thể${coLyDo ? ', có nêu lý do mua' : ', chưa nêu lý do mua'}`);
  } else if (soCuThe === 1 || coLyDo) {
    diem = 1;
    canCu.push(coLyDo ? 'Có lý do mua nhưng chưa hỏi gì cụ thể' : 'Mới hỏi 1 chi tiết cụ thể');
  } else {
    diem = 0;
    canCu.push(chiHoiChung ? 'Chỉ hỏi chung chung, không hỏi chi tiết nào về căn hộ' : 'Không hỏi gì về căn hộ');
  }
  return { diem, canCu };
}

function chamThoiDiem(t) {
  const canCu = [];
  const daXem = co(t, DA_XEM);
  const moc = co(t, MOC_TG);
  const moHo = co(t, MO_HO);
  let diem;

  if (daXem && moc) {
    diem = 3;
    canCu.push('Đã đi xem dự án khác VÀ có mốc thời gian cụ thể');
  } else if (daXem || moc) {
    diem = 2;
    canCu.push(daXem ? 'Đã đi xem dự án khác' : 'Có mốc thời gian cụ thể');
  } else if (moHo) {
    diem = 1;
    canCu.push('Ngôn ngữ đầu phễu: đang tìm hiểu, chưa có mốc');
  } else {
    diem = 1;
    canCu.push('Chưa có thông tin về thời điểm hay việc đã đi xem');
  }
  return { diem, canCu };
}

/* ─────────── Trục 2: cờ Ảo ─────────── */

function timCoAo(t, coTay = {}) {
  const co_ = [];

  if (co(t, A1_MOI_GIOI)) {
    co_.push({
      ma: 'A1',
      ten: 'Nghi môi giới đối thủ dò giá',
      quyetDinh: true,
      canCu: 'Dùng thuật ngữ nghề (chiết khấu, hoa hồng, bảng hàng, gửi khách) nhưng xưng là khách mua',
      xuLy: 'Trả lời bằng khoảng giá, KHÔNG gửi bảng hàng chi tiết.'
    });
  }
  if (co(t, A7_LUA_DAO)) {
    co_.push({
      ma: 'A7',
      ten: 'Dấu hiệu lừa đảo hoặc spam',
      quyetDinh: true,
      canCu: 'Chuyển hướng sang link lạ, xin giấy tờ, mời chào ngược',
      xuLy: 'Dừng hội thoại. Chặn và báo cáo.'
    });
  }

  const gia = Number(coTay.giaCanDangBan) || 0;
  const ns = Number(coTay.nganSachKhachNeu) || 0;
  if (gia > 0 && ns > 0 && ns < gia * 0.6 && !co(t, VAY)) {
    co_.push({
      ma: 'A2',
      ten: 'Ngân sách lệch quá xa',
      canCu: `Ngân sách ${ns} tỷ so với căn ${gia} tỷ (thiếu hơn 40%) mà không nhắc tới vay`,
      xuLy: 'Chuyển hướng sang căn nhỏ hơn hoặc dự án khác phân khúc, đừng theo tiếp căn này.'
    });
  }

  if (coTay.imSauBaoGia) {
    co_.push({ ma: 'A4', ten: 'Im sau khi nhận báo giá quá 48h', canCu: 'Sale tự đánh dấu', xuLy: 'Chạm lại 1 lần bằng thông tin mới, không gọi dồn.' });
  }
  if (coTay.khongNgheMay) {
    co_.push({ ma: 'A5', ten: 'Không nghe máy từ 3 lần trở lên', canCu: 'Sale tự đánh dấu', xuLy: 'Nhắn 1 tin cuối rồi dừng.' });
  }
  if (coTay.taiKhoanDangNgo) {
    co_.push({ ma: 'A6', ten: 'Tài khoản Zalo/Facebook đáng ngờ', canCu: 'Sale tự đánh dấu', xuLy: 'Xác minh bằng 1 câu hỏi về nhu cầu trước khi đầu tư thời gian.' });
  }

  // A3 siết chặt: chỉ bật khi khách hỏi giá lặp lại mà TUYỆT NHIÊN không để lộ
  // bất kỳ tín hiệu nào khác. Nếu có nhắc tiền, lý do mua, hay người cùng quyết
  // thì đó là khách thật còn sớm, không phải khách né — bật cờ ở đây là oan.
  const soCauHoiGia = dem(t, HOI_CHUNG);
  const soCuThe = dem(t, HOI_CU_THE);
  const coTinHieuKhac = co(t, TIEN, VAY, LY_DO, QUYET_MANH, QUYET_VUA, DA_XEM, MOC_TG);

  /* Thêm 16/09/2026. Trước đây A3 được chặn một cách TÌNH CỜ: cờ Ảo quét toàn
     hội thoại, nên câu báo giá của chính sale ("dạ 2PN từ 3,2 tỷ ạ") bị đếm
     thành tín hiệu tiền của khách và làm tắt A3. Khi sửa để quét đúng lời
     khách, chỗ chặn tình cờ đó mất, và ca "khách thật mới tìm hiểu" bị gắn A3.

     Nên phải chặn có chủ đích: khách TỰ NHẬN mình đang tìm hiểu, chưa vội,
     xem dần — thì đó là khách thật còn sớm, không phải người né câu hỏi.
     Môi giới đối thủ đi dò giá không nói "chị cũng chưa biết nữa"; họ hỏi rất
     trúng và rất nhanh. Tự nhận mơ hồ là bằng chứng thành thật, không phải
     bằng chứng đáng ngờ.

     Đây đúng ca mà đề bài sản phẩm đặt lên hàng đầu: điểm thấp KHÔNG phải là
     ảo. Xếp nhầm ở đây là ném đi lead thật — lỗi mà tool đối thủ đang mắc. */
  const tuNhanMoiTimHieu = co(t, MO_HO);

  if (soCauHoiGia >= 2 && soCuThe === 0 && !coTinHieuKhac && !tuNhanMoiTimHieu) {
    co_.push({
      ma: 'A3',
      ten: 'Chỉ hỏi giá, né mọi câu hỏi ngược',
      canCu: `Hỏi giá ${soCauHoiGia} lần mà không hỏi bất kỳ chi tiết nào về căn hộ`,
      xuLy: 'Hỏi 1 câu chốt về nhu cầu. Không trả lời thì dừng.'
    });
  }

  return co_;
}

/* ─────────── Phân loại ─────────── */

const HANH_DONG = {
  'NÓNG': { thoiGian: '60% thời gian trong ngày', viec: 'Gọi lại trong 1 giờ. Chốt lịch xem nhà có NGÀY GIỜ CỤ THỂ, không hỏi "khi nào anh rảnh". Mời cả người cùng quyết đi cùng.' },
  'ẤM': { thoiGian: '30% thời gian trong ngày', viec: 'Nhắn trong 24h. Gửi đúng thứ họ đã hỏi, không gửi bảng hàng đại trà. Đặt 1 câu hỏi lấp ô điểm còn thiếu.' },
  'LẠNH': { thoiGian: '10% thời gian trong ngày', viec: 'Đưa vào chuỗi nuôi Zalo, chạm 2 tuần/lần bằng nội dung hữu ích (tiến độ dự án, thay đổi lãi suất). Không gọi dồn.' },
  'LẠNH SÂU': { thoiGian: '0% chủ động', viec: 'Khách thật nhưng còn quá sớm. Nuôi tự động 3–6 tháng, đặt lịch nhắc quay lại. ĐỪNG xoá — đây không phải lead ảo.' },
  'ẢO': { thoiGian: '0%', viec: 'Dừng đầu tư thời gian. Ghi lại để không nhận lại lần sau.' }
};

function xepLoai(tongDiem) {
  if (tongDiem >= 9) return 'NÓNG';
  if (tongDiem >= 6) return 'ẤM';
  if (tongDiem >= 3) return 'LẠNH';
  return 'LẠNH SÂU';
}

const HA_BAC = ['NÓNG', 'ẤM', 'LẠNH', 'LẠNH SÂU'];

/**
 * @param {string} vanBan Hội thoại (nên đã ẩn danh hoá)
 * @param {object} coTay  Các cờ sale tự đánh dấu + giá căn / ngân sách (đơn vị tỷ)
 */
export function chamDiem(vanBan, coTay = {}) {
  const tOanBo = String(vanBan || '');
  const { loiKhach, tachDuoc } = tachLoiKhach(tOanBo);
  // Chấm 4 tiêu chí trên LỜI KHÁCH; tìm cờ Ảo trên toàn hội thoại.
  const t = loiKhach;

  // Chặn chấm bừa: hội thoại quá ngắn thì mọi tiêu chí đều 0–1,
  // trả về "Lạnh" là sai và làm sale mất niềm tin vào tool.
  const soTu = tOanBo.trim().split(/\s+/).filter(Boolean).length;
  if (soTu < 25) {
    return {
      duLieuDu: false,
      thongBao: 'Hội thoại quá ngắn để chấm (dưới 25 từ). Chấm bừa lúc này sẽ sai.',
      goiY: [
        'Anh/chị đang tìm cho gia đình ở hay để đầu tư ạ?',
        'Anh/chị dự tính thu xếp tiền mặt hay có tính vay ngân hàng không ạ?',
        'Anh/chị đã đi xem dự án nào quanh khu này chưa ạ?'
      ]
    };
  }

  const tc = [
    { ma: 'T1', ten: 'Tài chính', ...chamTaiChinh(t, {
        nganSachTay: Number(coTay.nganSachKhachNeu) > 0,
        tachDuoc
      }) },
    { ma: 'T2', ten: 'Quyền quyết định', ...chamQuyetDinh(t) },
    { ma: 'T3', ten: 'Nhu cầu thực', ...chamNhuCau(t) },
    { ma: 'T4', ten: 'Thời điểm & đã đi xem', ...chamThoiDiem(t) }
  ];

  const tongDiem = tc.reduce((s, x) => s + x.diem, 0);
  /* Cờ Ảo nói người KIA là ai, nên phải quét trên LỜI KHÁCH, không phải toàn
     hội thoại. Sửa 16/09/2026 sau khi đo được lỗi thật: câu chào hàng bình
     thường của chính sale — "để em gửi anh bảng hàng" — làm khách của họ dính
     cờ A1 "nghi môi giới đối thủ", mà A1 là cờ quyết định nên một cờ là đủ xếp
     ẢO. Một lead 9/12 NÓNG bị đẩy thành ẢO, và công cụ bảo sale vứt nó đi.

     Không tách được lời khách thì đành quét toàn bộ — nhưng lúc đó độ tin cậy
     đã là "thấp" và ghi chú bên dưới nói rõ cờ có thể oan.

     Cờ A4/A5/A6 đến từ ô sale tự đánh dấu nên không chịu ảnh hưởng. */
  const coAo = timCoAo(tachDuoc ? t : tOanBo, coTay);
  const khongDau = thieuDauTiengViet(tOanBo);

  // Cờ quyết định (A1 môi giới dò giá, A7 lừa đảo) nói lên người này LÀ AI,
  // nên một cờ là đủ kết luận. Các cờ còn lại chỉ là tình huống, cần 2 cờ.
  const coQuyetDinh = coAo.find((c) => c.quyetDinh);

  let phanLoai;
  let lyDoPhanLoai;

  if (coQuyetDinh) {
    phanLoai = 'ẢO';
    lyDoPhanLoai = `Có cờ quyết định ${coQuyetDinh.ma} (${coQuyetDinh.ten}) — xếp Ảo ngay bất kể điểm tiềm năng (${tongDiem}/12).`;
  } else if (coAo.length >= 2) {
    phanLoai = 'ẢO';
    lyDoPhanLoai = `Có ${coAo.length} cờ Ảo — xếp Ảo bất kể điểm tiềm năng (${tongDiem}/12).`;
  } else {
    phanLoai = xepLoai(tongDiem);
    if (coAo.length === 1) {
      const i = HA_BAC.indexOf(phanLoai);
      const moi = HA_BAC[Math.min(i + 1, HA_BAC.length - 1)];
      lyDoPhanLoai = `${tongDiem}/12 điểm → ${phanLoai}, hạ 1 bậc xuống ${moi} vì có 1 cờ Ảo (${coAo[0].ma}).`;
      phanLoai = moi;
    } else {
      lyDoPhanLoai = `${tongDiem}/12 điểm, không có cờ Ảo nào.`;
    }
  }

  return {
    duLieuDu: true,
    tieuChi: tc,
    tongDiem,
    coAo,
    phanLoai,
    lyDoPhanLoai,
    hanhDong: HANH_DONG[phanLoai],
    tachDuocLoiKhach: tachDuoc,
    doTinCay: (khongDau || !tachDuoc) ? 'thấp' : soTu < 60 ? 'thấp' : soTu < 150 ? 'trung bình' : 'khá',
    thieuDau: khongDau,
    ghiChuTinCay: [
      khongDau
        ? 'Đoạn chat này gõ KHÔNG DẤU. Bộ tiêu chí dò theo tiếng Việt có dấu, nên điểm gần như chắc chắn THẤP HƠN THỰC TẾ — một khách nóng có thể bị xếp nhầm xuống Lạnh. Nếu bản gốc có dấu, dán lại bản có dấu rồi chấm lại.'
        : null,
      tachDuoc
        ? null
        : 'Không tách được lời khách khỏi lời sale, nên điểm có thể cao hơn thực tế VÀ cờ Ảo có thể bị gắn oan vì chính lời chào hàng của bạn ("bảng hàng", "chiết khấu") bị tính nhầm sang khách. Dán hội thoại có tiền tố "K:" cho khách và "S:" cho sale để chấm chính xác hơn.'
    ].filter(Boolean).join(' ') || null
  };
}

/**
 * Xuất bộ từ khoá để module chân dung khách (profile.js) dùng lại.
 * Cố ý không sao chép sang file khác: một chỗ sửa, cả hai nơi đổi theo.
 */
export const TU_KHOA = Object.freeze({
  TIEN, VAY, VAY_SAU, VON,
  QUYET_MANH, QUYET_VUA, QUYET_HO,
  HOI_CU_THE, HOI_CHUNG, LY_DO,
  DA_XEM, MOC_TG, MO_HO
});

export { HANH_DONG };
