/**
 * Kiểm thử phần Chân dung khách và kho hồ sơ.
 *
 * Hai phép quan trọng nhất ở cuối file:
 *   • Chân dung KHÔNG được chứa lại hội thoại gốc.
 *   • Danh sách trắng của kho phải phủ hết mọi trường chân dung sinh ra,
 *     nếu không thì thêm trường mới là mất dữ liệu âm thầm lúc lưu.
 */
import { chamDiem } from '../public/lib/criteria.js';
import { anDanhHoa } from '../public/lib/anonymize.js';
import { trichChanDung } from '../public/lib/profile.js';
import { DANH_SACH_TRUONG, xepUuTien, timKiem } from '../public/lib/store.js';
import { CA_KIEM_THU } from './fixtures.js';

const dung = (ten) => CA_KIEM_THU.find((c) => c.ten.startsWith(ten));

function lamChanDung(ca) {
  const sach = anDanhHoa(ca.hoiThoai).ketQua;
  const luat = chamDiem(sach, ca.coTay || {});
  return { sach, luat, cd: trichChanDung(sach, luat, null, ca.coTay || {}) };
}

export function kiemThuChanDung(bao) {
  /* ── Ca Nóng: máy phải rút ra đủ các trường chính ── */
  {
    const ca = dung('Khách nóng');
    const { cd } = lamChanDung(ca);
    bao(cd.nhuCau === 'Để ở', 'Ca Nóng — đọc ra nhu cầu "Để ở"', `nhận "${cd.nhuCau}"`);
    bao(/2\s*PN/i.test(cd.loaiCan), 'Ca Nóng — đọc ra loại căn 2PN', `nhận "${cd.loaiCan}"`);
    bao(cd.nganSach !== '', 'Ca Nóng — có ngân sách', `nhận "${cd.nganSach}"`);
    bao(/vay/i.test(cd.taiChinh), 'Ca Nóng — nhận ra có vay', cd.taiChinh);
    bao(/thống nhất|Tự quyết/i.test(cd.nguoiQuyet), 'Ca Nóng — nhận ra đã thống nhất', cd.nguoiQuyet);
    bao(cd.mocThoiGian !== '', 'Ca Nóng — có mốc thời gian', `nhận "${cd.mocThoiGian}"`);
    bao(cd.daDiXem === true, 'Ca Nóng — nhận ra đã đi xem nơi khác');
    bao(cd.quanTam.length >= 2, `Ca Nóng — gom được ${cd.quanTam.length} mối quan tâm`);
    bao(cd.vuongMac.length === 0, 'Ca Nóng — không còn ô trống nào', cd.vuongMac.join(' · '));
    bao(cd.cauNenHoi.length === 0, 'Ca Nóng — không cần hỏi thêm câu nào');
  }

  /* ── Ca Ảo: cờ phải theo sang chân dung ── */
  {
    const ca = CA_KIEM_THU.find((c) => c.kyVong === 'ẢO');
    const { cd } = lamChanDung(ca);
    bao(cd.phanLoai === 'ẢO', 'Ca Ảo — chân dung giữ đúng phân loại');
    bao(cd.coAo.length >= 1, 'Ca Ảo — chân dung mang theo mã cờ', cd.coAo.join(','));
    bao(cd.vuongMac.some((v) => /^Cờ /.test(v)), 'Ca Ảo — cờ hiện trong mục Còn thiếu', cd.vuongMac.join(' · '));
  }

  /* ── Ca còn sớm: phải gợi ý được câu hỏi lấp chỗ trống ── */
  {
    const ca = CA_KIEM_THU.find((c) => c.khongDuocCoCoAo) || dung('Khách ấm');
    const { cd } = lamChanDung(ca);
    bao(cd.cauNenHoi.length >= 1 || cd.vuongMac.length >= 1,
      'Ca chưa đủ điểm — có nêu chỗ trống hoặc câu nên hỏi',
      `vướng ${cd.vuongMac.length}, hỏi ${cd.cauNenHoi.length}`);
    bao(cd.cauNenHoi.length <= 3, 'Không bao giờ đổ quá 3 câu hỏi lên đầu sale');
  }

  /* ── Hội thoại quá ngắn thì không dựng chân dung ── */
  {
    const luat = chamDiem('còn căn nào không em');
    bao(luat.duLieuDu === false, 'Hội thoại quá ngắn — vẫn từ chối chấm, nên không có chân dung');
  }

  /* ── BẤT BIẾN 1: không rò rỉ hội thoại gốc ── */
  {
    const ca = dung('Khách nóng');
    const { cd } = lamChanDung(ca);
    const chuoi = JSON.stringify(cd);
    const cauDai = ca.hoiThoai.split('\n')
      .map((d) => d.replace(/^\s*[KS]:\s*/, '').trim())
      .filter((d) => d.split(/\s+/).length >= 8);
    const roRi = cauDai.filter((c) => chuoi.includes(c));
    bao(roRi.length === 0, 'BẤT BIẾN — chân dung không chứa lại câu nào của hội thoại gốc',
      roRi.slice(0, 1).join(''));
  }

  /* ── BẤT BIẾN 2: kho lưu phải phủ hết trường chân dung ── */
  {
    const ca = dung('Khách nóng');
    const { cd } = lamChanDung(ca);
    const thieu = Object.keys(cd).filter((k) => !DANH_SACH_TRUONG.includes(k));
    bao(thieu.length === 0,
      'BẤT BIẾN — danh sách trắng của kho phủ hết trường chân dung',
      `thiếu: ${thieu.join(', ')}`);
  }

  /* ── Xếp ưu tiên và tìm kiếm ── */
  {
    const ds = [
      { id: '1', ten: 'Chị Lan', phanLoai: 'LẠNH', diem: 4, lanChamCuoi: '2026-09-01' },
      { id: '2', ten: 'Anh Tuấn', phanLoai: 'NÓNG', diem: 12, nhuCau: 'Để ở', lanChamCuoi: '2026-09-02' },
      { id: '3', ten: 'Môi giới dò giá', phanLoai: 'ẢO', diem: 9, lanChamCuoi: '2026-09-03' },
      { id: '4', ten: 'Anh Hùng', phanLoai: 'NÓNG', diem: 9, lanChamCuoi: '2026-09-04' }
    ];
    const xep = xepUuTien(ds).map((x) => x.id).join('');
    bao(xep === '2413', 'Xếp Nóng trước, điểm cao trước, Ảo xuống cuối', `nhận "${xep}"`);
    bao(timKiem(ds, 'tuan').length === 1, 'Tìm không dấu khớp tên có dấu');
    bao(timKiem(ds, 'de o').length === 1, 'Tìm không dấu khớp cả trường nhu cầu');
    bao(timKiem(ds, '').length === 4, 'Từ khoá rỗng trả về tất cả');
    bao(timKiem(ds, 'xyzkhongco').length === 0, 'Từ khoá không khớp trả về rỗng');
  }
}
