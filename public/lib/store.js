/**
 * Kho hồ sơ khách — lưu ngay trong trình duyệt của sale.
 *
 * Vì sao lưu ở trình duyệt chứ không phải máy chủ
 * -----------------------------------------------
 * 1. Không cần đăng ký, không cần đăng nhập, không cần chờ duyệt. Sale bấm một
 *    cái là dùng được — đúng ràng buộc thiết kế "chạy chỉ với một đường link".
 * 2. Dữ liệu khách không rời khỏi máy sale, nên sản phẩm không trở thành bên
 *    xử lý dữ liệu cá nhân tập trung (Luật BVDLCN hiệu lực 01/01/2026).
 *
 * Đánh đổi đã biết và phải nói thẳng với người dùng:
 *   • Xoá dữ liệu duyệt web là mất hồ sơ → có nút Xuất JSON để tự sao lưu.
 *   • Không đồng bộ giữa máy tính và điện thoại.
 * Bản sau, khi có tài khoản, sẽ đồng bộ được. Xem HANDOFF.md.
 *
 * BẤT BIẾN: chỉ những trường trong DANH_SACH_TRUONG mới được ghi xuống.
 * Hội thoại gốc không bao giờ đi qua đây.
 */

const KHOA = 'llcc.hoso.v1';

/** Danh sách trắng — mọi trường lạ đều bị loại trước khi ghi. */
const DANH_SACH_TRUONG = [
  'id', 'ten', 'nguon', 'ghiChu',
  'nhuCau', 'loaiCan', 'dienTich', 'nganSach', 'giaCan', 'soTienNhacToi',
  'taiChinh', 'nguoiQuyet', 'lyDoMua', 'mocThoiGian', 'daDiXem', 'quanTam',
  'diem', 'phanLoai', 'lyDoPhanLoai', 'doTinCay', 'coAo',
  'vuongMac', 'cauNenHoi', 'viecTiepTheo', 'tinNhanGoiY', 'diemMuChinh', 'diemAI',
  'lanChamCuoi', 'taoLuc', 'capNhatLuc'
];

function loc(hoSo) {
  const ra = {};
  for (const k of DANH_SACH_TRUONG) {
    if (hoSo[k] !== undefined) ra[k] = hoSo[k];
  }
  return ra;
}

/** Mọi lời gọi localStorage đều có thể ném lỗi (cửa sổ ẩn danh, chặn cookie). */
function doc() {
  try {
    const s = localStorage.getItem(KHOA);
    const d = s ? JSON.parse(s) : [];
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
}

function ghi(ds) {
  try {
    localStorage.setItem(KHOA, JSON.stringify(ds));
    return true;
  } catch {
    return false;
  }
}

export function danhSach() {
  return doc();
}

export function demHoSo() {
  return doc().length;
}

/** Thêm mới, hoặc cập nhật nếu hoSo.id đã có. Trả về hồ sơ đã lưu, hoặc null. */
export function luu(hoSo) {
  const ds = doc();
  const banGhi = loc(hoSo);
  const gio = new Date().toISOString();

  if (banGhi.id) {
    const i = ds.findIndex((x) => x.id === banGhi.id);
    if (i >= 0) {
      ds[i] = { ...ds[i], ...banGhi, capNhatLuc: gio };
      return ghi(ds) ? ds[i] : null;
    }
  }

  banGhi.id = `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  banGhi.taoLuc = gio;
  banGhi.capNhatLuc = gio;
  ds.unshift(banGhi);
  return ghi(ds) ? banGhi : null;
}

export function xoa(id) {
  const ds = doc().filter((x) => x.id !== id);
  return ghi(ds);
}

/** Thứ tự ưu tiên hiển thị: Nóng trước, rồi tới điểm cao, rồi tới mới chấm. */
const THU_TU = { 'NÓNG': 0, 'ẤM': 1, 'LẠNH': 2, 'LẠNH SÂU': 3, 'ẢO': 4 };

export function xepUuTien(ds) {
  return [...ds].sort((a, b) => {
    const p = (THU_TU[a.phanLoai] ?? 9) - (THU_TU[b.phanLoai] ?? 9);
    if (p !== 0) return p;
    const d = (b.diem ?? 0) - (a.diem ?? 0);
    if (d !== 0) return d;
    return String(b.lanChamCuoi || '').localeCompare(String(a.lanChamCuoi || ''));
  });
}

/** Tìm không dấu, không phân biệt hoa thường, quét các trường người đọc được. */
const boDau = (s) => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase();

export function timKiem(ds, tuKhoa) {
  const q = boDau(tuKhoa).trim();
  if (!q) return ds;
  return ds.filter((x) => boDau([
    x.ten, x.nguon, x.ghiChu, x.nhuCau, x.loaiCan, x.nganSach,
    x.phanLoai, x.mocThoiGian, x.lyDoMua, (x.quanTam || []).join(' ')
  ].join(' ')).includes(q));
}

export function xuatJSON() {
  return JSON.stringify({ phienBan: KHOA, xuatLuc: new Date().toISOString(), hoSo: doc() }, null, 2);
}

export { KHOA, DANH_SACH_TRUONG };
