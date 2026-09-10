/**
 * Ẩn danh hoá hội thoại trước khi chấm điểm.
 *
 * Vì sao module này tồn tại:
 * Luật Bảo vệ dữ liệu cá nhân (hiệu lực 01/01/2026) xếp số điện thoại, email,
 * số tài khoản, số giấy tờ vào nhóm dữ liệu cá nhân. Gửi nguyên văn hội thoại
 * sang một mô hình AI đặt ở nước ngoài là hành vi chuyển dữ liệu xuyên biên giới.
 * Vì vậy dữ liệu định danh bị thay bằng nhãn TRƯỚC khi rời khỏi máy người dùng,
 * và bị thay lần thứ hai ở phía máy chủ (không tin vào trình duyệt).
 *
 * Nguyên tắc: chỉ xoá thứ định danh CON NGƯỜI.
 * Giá tiền, diện tích, tầng, tên dự án được GIỮ LẠI vì đó là căn cứ chấm điểm.
 *
 * THỨ TỰ CÁC LUẬT LÀ CÓ CHỦ Ý — xem ghi chú ở từng luật.
 */

// Viết cả hai dạng hoa/thường thay vì dùng cờ `i`, vì cờ `i` sẽ làm
// [A-ZĐÀ-Ỹ] ở phần tên riêng khớp cả chữ thường và bắt nhầm từ bình thường.
const XUNG_HO = '[Aa]nh|[Cc]hị|[Ee]m|[Cc]ô|[Cc]hú|[Bb]ác|[Ôô]ng|[Bb]à';

const RULES = [
  {
    // Chạy trước tiên: email và đường dẫn có chứa cả chữ lẫn số,
    // nếu để sau thì phần số bên trong bị luật khác cắt mất.
    ten: 'Email',
    re: /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g,
    nhan: '[EMAIL]'
  },
  {
    ten: 'Đường dẫn',
    re: /https?:\/\/\S+/g,
    nhan: '[ĐƯỜNG DẪN]'
  },
  {
    // Số điện thoại Việt Nam: đúng 10 chữ số, bắt đầu 0 (hoặc +84), đầu số 3/5/7/8/9.
    // Hai chốt chặn (?<!\d) và (?!\d) là bắt buộc: không có chúng thì một số
    // tài khoản 14 chữ số sẽ bị cắt nhầm thành số điện thoại ở khúc giữa.
    ten: 'Số điện thoại',
    re: /(?<!\d)(?:\+?84|0)[\s.\-]?(?:3|5|7|8|9)(?:[\s.\-]?\d){8}(?!\d)/g,
    nhan: '[SỐ ĐIỆN THOẠI]'
  },
  {
    // Gộp số giấy tờ và số tài khoản làm một: chuỗi 9–19 chữ số liền nhau.
    // Không tách riêng vì CCCD 12 số và tài khoản ngân hàng trùng độ dài,
    // mà với mục đích chấm điểm thì phân biệt hai loại này không đem lại gì.
    ten: 'Số giấy tờ / tài khoản',
    re: /(?<!\d)\d{9,19}(?!\d)/g,
    nhan: '[SỐ ĐỊNH DANH]'
  },
  {
    // Địa chỉ nhà dạng "12/3 Nguyễn Trãi". Chỉ bắt dạng có dấu gạch chéo
    // để tránh nuốt nhầm "căn 2 tầng 15" hay các con số thuộc về căn hộ.
    ten: 'Địa chỉ nhà',
    re: /(?<!\d)\d{1,4}(?:\/\d{1,4})+\s+\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+){0,3}/gu,
    nhan: '[ĐỊA CHỈ]'
  },
  {
    // Tên riêng đi sau xưng hô: "anh Tuấn", "chị Lan Anh".
    // Giữ lại từ xưng hô vì nó là tín hiệu về vai vế, không phải định danh.
    //
    // HAI CHI TIẾT DỄ SAI, ĐỪNG SỬA NGƯỢC LẠI:
    // 1. Dùng (?<!\p{L}) và (?!\p{L}) thay cho \b. Trong JavaScript, \b định
    //    nghĩa "chữ" theo bảng ASCII, nên nó coi mọi chữ có dấu tiếng Việt là
    //    ranh giới từ: "ban công" bị cắt thành "c" + "ông" và "ông" khớp xưng hô.
    // 2. Dùng \p{Lu}\p{Ll} thay cho [A-ZĐÀ-Ỹ][a-zà-ỹ]. Dải À-Ỹ trong bảng mã
    //    phủ cả chữ hoa lẫn chữ thường tiếng Việt, nên [A-ZĐÀ-Ỹ] khớp luôn cả
    //    "đang", "đẹp" và biến chúng thành tên riêng.
    ten: 'Tên riêng',
    re: new RegExp(
      `(?<!\\p{L})(${XUNG_HO})\\s+(\\p{Lu}\\p{Ll}+(?:\\s+\\p{Lu}\\p{Ll}+){0,2})(?!\\p{L})`,
      'gu'
    ),
    nhan: '$1 [TÊN]'
  }
];

/**
 * @param {string} vanBan Hội thoại thô do sale dán vào
 * @returns {{ ketQua: string, daThayThe: Array<{loai: string, soLan: number}> }}
 */
export function anDanhHoa(vanBan) {
  if (typeof vanBan !== 'string') return { ketQua: '', daThayThe: [] };

  let ketQua = vanBan;
  const daThayThe = [];

  for (const r of RULES) {
    const khop = ketQua.match(r.re);
    if (khop && khop.length) {
      daThayThe.push({ loai: r.ten, soLan: khop.length });
      ketQua = ketQua.replace(r.re, r.nhan);
    }
  }

  return { ketQua, daThayThe };
}

/** Tổng số mục đã che — hiển thị cho người dùng thấy trước khi gửi đi. */
export function tongSoDaChe(daThayThe) {
  return daThayThe.reduce((t, x) => t + x.soLan, 0);
}
