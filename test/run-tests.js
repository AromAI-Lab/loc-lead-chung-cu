/**
 * Kiểm thử động cơ chấm điểm và bộ ẩn danh hoá.
 * Chạy: npm test
 */
import { chamDiem } from '../public/lib/criteria.js';
import { anDanhHoa } from '../public/lib/anonymize.js';
import { CA_KIEM_THU } from './fixtures.js';
import { kiemThuWebhook } from './webhook-tests.js';
import { kiemThuChanDung, kiemThuXoaTatCa } from './profile-tests.js';
import { kiemThuDoLen } from './dolen-tests.js';

let dat = 0;
let truot = 0;

const bao = (ok, ten, chiTiet = '') => {
  if (ok) { dat++; console.log(`  ✓ ${ten}`); }
  else { truot++; console.log(`  ✗ ${ten}${chiTiet ? '\n      → ' + chiTiet : ''}`); }
};

console.log('\n=== 1. Ẩn danh hoá ===\n');
{
  const t = 'Anh Tuấn 0912345678 tuan@gmail.com CK 19036012345678, căn 3,2 tỷ 65m2 tầng 12';
  const r = anDanhHoa(t);
  bao(!/0912345678/.test(r.ketQua), 'Xoá số điện thoại');
  bao(!/tuan@gmail\.com/.test(r.ketQua), 'Xoá email');
  bao(!/19036012345678/.test(r.ketQua), 'Xoá số tài khoản');
  bao(!/Tuấn/.test(r.ketQua), 'Xoá tên riêng sau xưng hô');
  bao(/3,2 tỷ/.test(r.ketQua), 'GIỮ giá tiền (là căn cứ chấm điểm)');
  bao(/65m2/.test(r.ketQua), 'GIỮ diện tích');
  bao(/tầng 12/.test(r.ketQua), 'GIỮ số tầng');
}

console.log('\n=== 2. Chấm điểm ===\n');
for (const c of CA_KIEM_THU) {
  console.log(`\n[${c.ten}]`);
  const sach = anDanhHoa(c.hoiThoai).ketQua;
  const kq = chamDiem(sach, c.coTay);

  if (c.kyVong === 'KHONG_DU_DU_LIEU') {
    bao(kq.duLieuDu === false, 'Từ chối chấm khi hội thoại quá ngắn', JSON.stringify(kq).slice(0, 120));
    continue;
  }

  bao(kq.duLieuDu === true, 'Chấm được');
  bao(kq.phanLoai === c.kyVong, `Phân loại = ${c.kyVong}`, `nhận được "${kq.phanLoai}" · ${kq.lyDoPhanLoai}`);
  if (c.khongDuocCoCoAo) {
    bao(kq.coAo.length === 0 && kq.phanLoai !== 'ẢO',
      'Khách thật còn sớm KHÔNG bị gắn cờ Ảo',
      `cờ: ${kq.coAo.map(x => x.ma).join(',') || 'không'}`);
  }
  if (kq.duLieuDu) {
    console.log(`      điểm ${kq.tongDiem}/12 · cờ Ảo: ${kq.coAo.map(x => x.ma).join(',') || 'không'} · ${kq.lyDoPhanLoai}`);
    console.log('      ' + kq.tieuChi.map(x => `${x.ma}=${x.diem}`).join(' '));
  }
}

console.log('\n=== 3. Bất biến ===\n');
{
  const kq = chamDiem('x '.repeat(40));
  bao(kq.tongDiem >= 0 && kq.tongDiem <= 12, 'Điểm luôn nằm trong 0–12');
  bao(typeof kq.phanLoai === 'string', 'Luôn trả về một phân loại');
  const kq2 = chamDiem(null);
  bao(kq2.duLieuDu === false, 'Đầu vào rỗng không làm hỏng chương trình');
}

console.log('\n=== 4. Chân dung khách và kho hồ sơ ===\n');
kiemThuChanDung(bao);
kiemThuXoaTatCa(bao);

console.log('\n=== 5. Chữ ký webhook Polar ===\n');
kiemThuWebhook(bao);

console.log('\n=== 6. Lớp đo lường không rò nội dung ===\n');
kiemThuDoLen(bao);

console.log(`\n──────────────\nĐạt: ${dat} · Trượt: ${truot}\n`);
process.exit(truot > 0 ? 1 : 0);
