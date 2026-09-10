/**
 * Hội thoại mẫu để kiểm thử. Viết theo lối nhắn Zalo thật của sale chung cư:
 * viết tắt, không dấu câu chuẩn, xen kẽ hai bên.
 * S: = sale, K: = khách.
 */
export const CA_KIEM_THU = [
  {
    ten: 'Khách nóng — vợ chồng đã chốt, đã xem 2 dự án, hỏi lãi thả nổi',
    kyVong: 'NÓNG',
    coTay: { giaCanDangBan: 3.2, nganSachKhachNeu: 1.2 },
    hoiThoai: `
K: Chào em, anh Tuấn xem tin căn 2PN bên Vinhomes. Cho anh hỏi 3,2 tỷ là giá thông thuỷ hay tim tường vậy em?
S: Dạ giá đó tính theo thông thuỷ ạ. Anh đang tìm cho gia đình ở hay đầu tư ạ?
K: Nhà anh ở. Hai vợ chồng thống nhất rồi, tháng 12 hết hợp đồng thuê là phải dọn vào.
S: Dạ vâng ạ. Anh dự tính thu xếp tài chính thế nào ạ?
K: Anh có sẵn 1,2 tỷ, còn lại vay. Mà em cho anh hỏi sau 2 năm ưu đãi thì lãi thả nổi lên bao nhiêu?
S: Dạ khoảng 13-15% tuỳ ngân hàng ạ.
K: Ừ anh cũng đoán thế. Phí quản lý bao nhiêu một mét vuông em? Với chỗ để ô tô có cố định không?
S: Dạ phí 15k/m2, chỗ ô tô mua thêm ạ.
K: Anh đi xem bên Masteri với Sunshine rồi, thấy bên em hướng ban công đẹp hơn. Cuối tuần này anh qua xem căn mẫu được không?
`
  },
  {
    ten: 'Khách ấm — hỏi cụ thể nhưng còn phải bàn với vợ, chưa có mốc',
    kyVong: 'ẤM',
    coTay: {},
    hoiThoai: `
K: Em ơi căn 2PN 65m2 còn không?
S: Dạ còn ạ. Anh chị tìm cho gia đình ở hay đầu tư ạ?
K: Ở em. Nhà anh đang thuê, chật quá.
S: Dạ. Anh quan tâm tầng nào ạ?
K: Tầng trung thôi. Mà sổ hồng lâu dài hay 50 năm em? Với bàn giao thô hay có nội thất?
S: Dạ sổ hồng lâu dài, bàn giao cơ bản ạ.
K: Ok. Giá này chắc phải vay ngân hàng. Để anh hỏi lại vợ đã rồi báo em nhé.
`
  },
  {
    // Ca quan trọng nhất về mặt sản phẩm: khách THẬT nhưng còn rất sớm.
    // Xếp Lạnh sâu (nuôi 3–6 tháng) là đúng; xếp Ảo là ném đi lead thật —
    // đúng cái lỗi mà tool đối thủ mắc phải khi gộp "điểm thấp" với "ảo".
    ten: 'Lạnh sâu — khách thật mới tìm hiểu, TUYỆT ĐỐI không được xếp Ảo',
    kyVong: 'LẠNH SÂU',
    khongDuocCoCoAo: true,
    coTay: {},
    hoiThoai: `
K: Chào em, cho chị hỏi bên em còn căn nào không?
S: Dạ còn nhiều loại ạ, chị tìm căn mấy phòng ngủ ạ?
K: Chị cũng chưa biết nữa, đang tìm hiểu dần thôi. Giá bao nhiêu vậy em?
S: Dạ 2PN từ 3,2 tỷ ạ.
K: Ừ chị xem đã, chưa vội. Khi nào tiện chị liên hệ lại nhé.
`
  },
  {
    ten: 'Ảo — môi giới đối thủ dò giá',
    kyVong: 'ẢO',
    coTay: {},
    hoiThoai: `
K: Chào em, bên em còn hàng 2PN không? Anh có khách đang tìm.
S: Dạ còn ạ, anh cho em xin nhu cầu cụ thể của khách ạ?
K: Khách anh cần 2PN tầm 3 tỷ. Mà em gửi anh bảng hàng với chiết khấu thế nào để anh còn tính.
S: Dạ để em xin phép hỏi lại ạ.
K: Ừ gửi luôn rổ hàng nhé, phí môi giới bên em chia thế nào? Anh gửi khách sang cho.
`
  },
  {
    ten: 'Ảo — dấu hiệu lừa đảo',
    kyVong: 'ẢO',
    coTay: {},
    hoiThoai: `
K: Chào em, anh xem tin căn hộ. Em có muốn tăng thu nhập không, bên anh có kênh đầu tư sinh lời cao lắm.
S: Dạ em đang bán căn hộ thôi ạ.
K: Em kết bạn zalo riêng với anh đi, anh gửi link cho xem. Việc nhẹ lương cao, nạp tiền vào là có lãi ngay.
S: Dạ thôi ạ.
K: Bấm vào link này đi em, anh gửi rồi đó.
`
  },
  {
    ten: 'Hội thoại quá ngắn — tool phải từ chối chấm',
    kyVong: 'KHONG_DU_DU_LIEU',
    coTay: {},
    hoiThoai: 'K: giá bao nhiêu vậy em?'
  }
];
