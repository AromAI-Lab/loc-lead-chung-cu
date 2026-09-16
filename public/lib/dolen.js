/**
 * Lớp đo lường — bọc PostHog.
 *
 * NGUYÊN TẮC BẤT DI BẤT DỊCH
 * Hàm ghi() chỉ được phép gửi đi nhãn phân loại, con số và giá trị đúng/sai.
 * Không bao giờ gửi nội dung hội thoại, tên khách, ghi chú riêng, hay bất kỳ
 * chuỗi nào người dùng tự gõ.
 *
 * Cách bảo đảm, ba lớp:
 *   1. Mọi thuộc tính phải có tên nằm trong DANH_SACH_CHO_PHEP. Tên lạ bị bỏ.
 *   2. Kiểu dữ liệu phải khớp. Sai kiểu thì bị bỏ.
 *   3. Chuỗi dài quá DAI_TOI_DA ký tự bị bỏ — nội dung hội thoại luôn dài hơn.
 *
 * Kiểm thử nằm ở test/dolen-tests.js và chạy trong `npm test`.
 * Sửa tệp này mà quên cập nhật kiểm thử thì `npm test` sẽ đỏ.
 */

/** Tên thuộc tính được phép gửi, kèm kiểu bắt buộc. */
export const DANH_SACH_CHO_PHEP = {
  phan_loai:   'chuoi',     // NÓNG / ẤM / LẠNH / LẠNH SÂU / ẢO
  tong_diem:   'so',        // 0–12
  do_tin_cay:  'chuoi',     // thấp / trung bình / khá
  du_lieu_du:  'dung_sai',  // hội thoại có đủ dài để chấm không
  co_ai:       'dung_sai',  // người dùng có bật lớp AI không
  tu_ca_mau:   'dung_sai',  // chấm từ ca mẫu hay từ hội thoại thật
  loai_mau:    'chuoi'      // nong / ao / som
};

/** Chuỗi dài hơn ngần này chắc chắn không phải nhãn phân loại. */
export const DAI_TOI_DA = 40;

/**
 * Lọc thuộc tính thô thành thuộc tính an toàn để gửi đi.
 * Hàm thuần, không đụng tới window — nhờ vậy kiểm thử được bằng Node.
 */
export function locThuocTinh(tho) {
  const sach = {};
  if (!tho || typeof tho !== 'object') return sach;

  for (const [khoa, giaTri] of Object.entries(tho)) {
    const kieu = DANH_SACH_CHO_PHEP[khoa];
    if (!kieu) continue;

    if (kieu === 'so' && typeof giaTri === 'number' && Number.isFinite(giaTri)) {
      sach[khoa] = giaTri;
    } else if (kieu === 'dung_sai' && typeof giaTri === 'boolean') {
      sach[khoa] = giaTri;
    } else if (kieu === 'chuoi' && typeof giaTri === 'string'
               && giaTri.length > 0 && giaTri.length <= DAI_TOI_DA) {
      sach[khoa] = giaTri;
    }
  }
  return sach;
}

/**
 * Ghi một sự kiện. Im lặng bỏ qua nếu PostHog chưa nạp hoặc bị chặn
 * — người dùng bật trình chặn quảng cáo vẫn dùng công cụ bình thường.
 * Trả về thuộc tính thực sự đã gửi, để kiểm thử và gỡ lỗi.
 */
export function ghi(ten, thuocTinh) {
  try {
    if (typeof window === 'undefined') return null;
    const ph = window.posthog;
    if (!ph || typeof ph.capture !== 'function') return null;

    const sach = locThuocTinh(thuocTinh);
    ph.capture(ten, sach);
    return sach;
  } catch {
    return null;   // đo lường hỏng thì không được làm hỏng sản phẩm
  }
}
