/**
 * Kiểm thử lớp đo lường.
 *
 * Mục đích thật của mấy phép này: giữ đúng lời hứa in trên trang —
 * "công cụ đo không đọc nội dung hội thoại". Nếu sau này có ai thêm
 * một thuộc tính chứa chữ người dùng gõ, những phép dưới đây phải đỏ.
 */
import { locThuocTinh, DAI_TOI_DA } from '../public/lib/dolen.js';

const HOI_THOAI_THAT =
  'K: Chào em, anh xem căn 2PN 3,2 tỷ tầng 12 còn không. ' +
  'S: Dạ còn anh ạ, anh qua xem cuối tuần này được không ạ.';

export function kiemThuDoLen(bao) {
  /* 1. Thuộc tính hợp lệ phải đi qua nguyên vẹn */
  {
    const r = locThuocTinh({ phan_loai: 'NÓNG', tong_diem: 9, co_ai: true });
    bao(r.phan_loai === 'NÓNG', 'Giữ nhãn phân loại');
    bao(r.tong_diem === 9, 'Giữ tổng điểm');
    bao(r.co_ai === true, 'Giữ cờ bật AI');
  }

  /* 2. Tên thuộc tính không có trong danh sách cho phép thì bị bỏ */
  {
    const r = locThuocTinh({
      hoi_thoai: HOI_THOAI_THAT,
      ten_khach: 'Anh Tuấn',
      ghi_chu: 'hẹn gọi lại thứ 5',
      so_dien_thoai: '0912345678',
      phan_loai: 'ẢO'
    });
    bao(!('hoi_thoai' in r), 'BỎ nội dung hội thoại');
    bao(!('ten_khach' in r), 'BỎ tên khách');
    bao(!('ghi_chu' in r), 'BỎ ghi chú riêng');
    bao(!('so_dien_thoai' in r), 'BỎ số điện thoại');
    bao(Object.keys(r).length === 1 && r.phan_loai === 'ẢO',
      'Chỉ còn đúng thuộc tính được phép', JSON.stringify(r));
  }

  /* 3. Không một mẩu nào của hội thoại lọt qua, dù đội tên hợp lệ */
  {
    const r = locThuocTinh({ phan_loai: HOI_THOAI_THAT, do_tin_cay: HOI_THOAI_THAT });
    const chuoi = JSON.stringify(r);
    bao(!/căn 2PN/.test(chuoi), 'Chuỗi dài đội lốt phan_loai vẫn bị chặn');
    bao(!/cuối tuần/.test(chuoi), 'Chuỗi dài đội lốt do_tin_cay vẫn bị chặn');
    bao(Object.keys(r).length === 0, 'Không còn thuộc tính nào', chuoi);
  }

  /* 4. Đúng ngưỡng độ dài */
  {
    const vua = 'x'.repeat(DAI_TOI_DA);
    const qua = 'x'.repeat(DAI_TOI_DA + 1);
    bao(locThuocTinh({ phan_loai: vua }).phan_loai === vua, `Chuỗi ${DAI_TOI_DA} ký tự được qua`);
    bao(!('phan_loai' in locThuocTinh({ phan_loai: qua })), `Chuỗi ${DAI_TOI_DA + 1} ký tự bị chặn`);
  }

  /* 5. Sai kiểu thì bỏ, không tự ép kiểu */
  {
    const r = locThuocTinh({ tong_diem: '9', co_ai: 'true', phan_loai: 123 });
    bao(Object.keys(r).length === 0, 'Sai kiểu thì bỏ hết', JSON.stringify(r));
  }

  /* 6. Đầu vào rác không làm hỏng chương trình */
  {
    bao(Object.keys(locThuocTinh(null)).length === 0, 'null không làm hỏng');
    bao(Object.keys(locThuocTinh(undefined)).length === 0, 'undefined không làm hỏng');
    bao(Object.keys(locThuocTinh('chuỗi')).length === 0, 'chuỗi không làm hỏng');
  }
}
