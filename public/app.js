import { anDanhHoa, tongSoDaChe } from '/lib/anonymize.js';
import { chamDiem } from '/lib/criteria.js';
import { HOI_THOAI_MAU } from '/lib/samples.js';
import { trichChanDung, CAU_HOI_LAP_O } from '/lib/profile.js';
import * as kho from '/lib/store.js';
import { ghi } from '/lib/dolen.js';

const $ = (id) => document.getElementById(id);

/* Phân biệt "bấm thử ca mẫu" với "chấm hội thoại thật của mình".
   Hai thứ này là hai mức độ quan tâm rất khác nhau, gộp chung thì
   số liệu phân phối vô nghĩa: 100 người bấm ca mẫu không bằng
   5 người dán hội thoại thật. */
let dangDungCaMau = false;

/* Hồ sơ khách của lần chấm hiện tại, dùng chung giữa phần vẽ chân dung và
   nút Lưu. Khai báo ở đây chứ không nằm lẫn giữa các hàm — 16/09 nó từng bị
   xoá nhầm khi sửa bố cục, làm cả khối Chân dung khách biến mất mà npm test
   vẫn xanh, vì test không chạy được phần gắn vào trang. */
let chanDungHienTai = null;

/* Danh sách nguồn lead cho ô Nguồn trong form lưu hồ sơ. */
const NGUON_LEAD = ['Data sàn giao', 'Tự đăng bài', 'Khách giới thiệu', 'Quảng cáo công ty', 'Khác'];


/** Đổi tên phân loại có dấu thành slug để dùng trong CSS. Thứ tự kiểm tra có chủ ý:
 *  "LẠNH SÂU" phải được bắt trước "LẠNH". */
function slugLoai(pl) {
  const t = String(pl || '');
  if (t.includes('ẢO')) return 'ao';
  if (t.includes('SÂU')) return 'sau';
  if (t.includes('NÓNG')) return 'nong';
  if (t.includes('ẤM')) return 'am';
  return 'lanh';
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Nút hội thoại mẫu */
document.querySelectorAll('[data-mau]').forEach((b) => {
  b.addEventListener('click', () => {
    $('hoiThoai').value = HOI_THOAI_MAU[b.dataset.mau].vanBan;
    const t = HOI_THOAI_MAU[b.dataset.mau];
    $('giaCan').value = t.giaCan ?? '';
    $('nganSach').value = t.nganSach ?? '';
    $('hoiThoai').focus();
    dangDungCaMau = true;
    ghi('thu_ca_mau', { loai_mau: b.dataset.mau });
  });
});

/* Người dùng tự gõ hay tự dán thì không còn là ca mẫu nữa */
$('hoiThoai').addEventListener('input', () => { dangDungCaMau = false; });

$('chay').addEventListener('click', chay);

/* Thanh ba bước: vừa cho thấy máy đang chạy, vừa nói cho người dùng biết
   sản phẩm đang làm gì. Phản hồi "không trực quan" một phần đến từ chỗ này —
   bấm nút xong không biết bên trong xảy ra chuyện gì. */
function buoc(n) {
  const khu = $('cacBuoc');
  khu.hidden = false;
  [...khu.querySelectorAll('.buoc')].forEach((b, i) => {
    b.classList.toggle('dang', i === n - 1);
    b.classList.toggle('xong', i < n - 1);
  });
}
function xongBuoc() {
  const khu = $('cacBuoc');
  [...khu.querySelectorAll('.buoc')].forEach((b) => { b.classList.remove('dang'); b.classList.add('xong'); });
  setTimeout(() => { khu.hidden = true; }, 700);
}

async function chay() {
  const tho = $('hoiThoai').value.trim();
  if (!tho) { $('hoiThoai').focus(); return; }

  const nut = $('chay');
  nut.disabled = true;
  nut.textContent = 'Đang chấm…';

  try {
    /* Bước 1 — ẩn danh hoá NGAY TRÊN MÁY, trước khi có bất kỳ yêu cầu mạng nào */
    buoc(1);
    const { ketQua: sach, daThayThe } = anDanhHoa(tho);
    hienAnDanh(sach, daThayThe);

    /* Bước 2 — lớp luật cứng, không cần mạng */
    const coTay = {
      giaCanDangBan: $('giaCan').value,
      nganSachKhachNeu: $('nganSach').value,
      imSauBaoGia: $('imSauBaoGia').checked,
      khongNgheMay: $('khongNgheMay').checked,
      taiKhoanDangNgo: $('taiKhoanDangNgo').checked
    };
    buoc(2);
    const luat = chamDiem(sach, coTay);
    hienKetQua(luat, null);
    dungChanDung(sach, luat, null, coTay);

    /* Đo: chỉ nhãn phân loại và con số, không có một chữ nào của hội thoại.
       Xem public/lib/dolen.js và test/dolen-tests.js. */
    ghi('bam_cham', {
      du_lieu_du: luat.duLieuDu === true,
      phan_loai: luat.duLieuDu ? luat.phanLoai : undefined,
      tong_diem: luat.duLieuDu ? luat.tongDiem : undefined,
      do_tin_cay: luat.duLieuDu ? luat.doTinCay : undefined,
      co_ai: $('dungAI').checked === true,
      tu_ca_mau: dangDungCaMau
    });

    /* Bước 3 — lớp AI, chỉ khi người dùng bật */
    if ($('dungAI').checked && luat.duLieuDu) {
      buoc(3);
      let ai = null;
      try {
        const r = await fetch('/api/score', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ hoiThoai: sach })
        });
        ai = await r.json();
      } catch {
        ai = { aiTat: true, lyDo: 'Không kết nối được tới máy chủ. Kết quả đến từ lớp luật cứng.' };
      }
      hienKetQua(luat, ai);
      capNhatPhanAI(ai);
    }
  } finally {
    xongBuoc();
    nut.disabled = false;
    nut.textContent = 'Ẩn danh hoá & chấm điểm';
  }
}

function hienAnDanh(sach, daThayThe) {
  const tong = tongSoDaChe(daThayThe);
  $('tomTatChe').innerHTML = tong === 0
    ? 'Không tìm thấy dữ liệu cá nhân nào cần che trong đoạn này.'
    : `Đã che <b>${tong}</b> mục: ` + daThayThe.map((x) => `${esc(x.loai)} (${x.soLan})`).join(', ');
  $('banSach').textContent = sach;
  $('khuAnDanh').hidden = false;
}

/**
 * Một câu duy nhất nên hỏi tiếp — lấy từ tiêu chí điểm thấp nhất.
 * Sale không đọc ba câu hỏi cùng lúc. Họ đọc một câu rồi gõ luôn.
 */
function cauNenHoiNgan(luat) {
  const thap = (luat.tieuChi || [])
    .filter((x) => x.diem <= 1 && CAU_HOI_LAP_O[x.ma])
    .sort((a, b) => a.diem - b.diem)[0];
  return thap ? CAU_HOI_LAP_O[thap.ma] : null;
}

/**
 * Hiện kết quả.
 *
 * Bố cục sửa 16/09 sau hai phản hồi độc lập nói cùng một chuyện:
 * sale #1 "không trực quan lắm", sale #2 "nhiều tiêu chí quá, dài dòng".
 *
 * Sale mở công cụ lúc 8 giờ sáng với hai mươi đoạn chat. Lúc đó họ cần đúng
 * hai câu trả lời: GỌI AI TRƯỚC và GỌI THÌ NÓI GÌ. Bảng điểm bốn tiêu chí là
 * thứ họ mở ra khi nghi ngờ kết quả — không phải thứ đọc mỗi lần chấm.
 *
 * Nên: mức 1 chỉ có phân loại, việc làm ngay, một câu nên hỏi. Toàn bộ phần
 * chấm gập sau dòng "Vì sao chấm vậy".
 *
 * Hai thứ KHÔNG BAO GIỜ được gập, vì gập đi là giấu cảnh báo:
 *   - cờ Ảo (dù chỉ một cờ)
 *   - độ tin cậy thấp
 */
function hienKetQua(luat, ai) {
  const khu = $('ketQua');
  khu.hidden = false;

  if (!luat.duLieuDu) {
    khu.innerHTML = `<section class="card">
      <h2>Kết quả</h2>
      <div class="canh-bao"><b>${esc(luat.thongBao)}</b>
      <p style="margin:8px 0 0">Hỏi khách 3 câu này trước rồi chấm lại:</p>
      <ul style="margin:6px 0 0">${luat.goiY.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></div>
    </section>`;
    return;
  }

  const hangTieuChi = (tc) => tc.map((x) => `<tr>
      <td class="d">${x.diem}/3<span class="thanh"><i style="width:${(x.diem / 3) * 100}%"></i></span></td>
      <td><b>${esc(x.ten || x.ma)}</b><br><span style="color:#6b6862">${esc((x.canCu || []).join ? x.canCu.join('. ') : x.canCu)}</span></td>
    </tr>`).join('');

  const sl = slugLoai(luat.phanLoai);
  const cauHoi = cauNenHoiNgan(luat);
  const tinThap = luat.doTinCay === 'thấp';

  /* ── MỨC 1 — thứ sale nhìn thấy ngay ────────────────────────────── */
  let html = `<section class="card kq kq-${sl}">
    <div class="bang-kq">
      <div>
        <span class="nhan-lop">Kết quả</span>
        <span class="huy-to">${esc(luat.phanLoai)}</span>
      </div>
      <div class="ben-phai">
        <span class="diem-to">${luat.tongDiem}</span><span class="diem-mau">/12</span>
        <span class="diem-chu">điểm tiềm năng</span>
      </div>
    </div>

    <div class="viec v-${sl}"><b>Việc làm ngay</b>${esc(luat.hanhDong.viec)}
      <div class="tg">Nhóm này nên chiếm ${esc(luat.hanhDong.thoiGian)}.</div></div>`;

  if (cauHoi) {
    html += `<div class="hoi-ngay"><b>Câu nên hỏi tiếp</b>
      <span class="hn-cau">${esc(cauHoi)}</span>
      <button type="button" class="link hn-chep" data-chep="${esc(cauHoi)}">Chép câu này</button></div>`;
  }

  /* Cờ Ảo: không bao giờ gập — đây là cảnh báo, không phải chi tiết */
  if (luat.coAo.length) {
    html += `<div class="co-ao"><h3>Cờ Ảo — ${luat.coAo.length} cờ</h3>` +
      luat.coAo.map((c) => `<div class="co-item">
        <span class="co-ma">${esc(c.ma)} · ${esc(c.ten)}</span>${c.quyetDinh ? ' <b>(cờ quyết định)</b>' : ''}
        <br>${esc(c.canCu)}
        <br><span class="co-xu-ly">→ ${esc(c.xuLy)}</span>
      </div>`).join('') + '</div>';
  }

  /* Độ tin cậy thấp: cũng không gập */
  if (tinThap && luat.ghiChuTinCay) {
    html += `<div class="canh-bao">${esc(luat.ghiChuTinCay)}</div>`;
  }

  /* ── MỨC 2 — gập lại, ai nghi ngờ thì mở ─────────────────────────── */
  html += `<details class="cham-ct">
      <summary>Vì sao chấm vậy — bảng điểm 4 tiêu chí${tinThap ? '' : ` · độ tin cậy ${esc(luat.doTinCay)}`}</summary>
      <div class="ct-than">
        <p class="ly-do">${esc(luat.lyDoPhanLoai)} · Độ tin cậy: <b>${esc(luat.doTinCay)}</b></p>
        <table><thead><tr><th>Điểm</th><th>Tiêu chí và căn cứ</th></tr></thead>
        <tbody>${hangTieuChi(luat.tieuChi)}</tbody></table>`;

  if (!tinThap && luat.ghiChuTinCay) {
    html += `<div class="canh-bao">${esc(luat.ghiChuTinCay)}</div>`;
  }
  html += `</div></details></section>`;

  /* ── Lớp AI — cũng gập, trừ khi nó lệch nhiều với lớp luật ───────── */
  if (ai) {
    if (ai.aiTat) {
      html += `<section class="card"><h2>Lớp AI</h2>
        <div class="canh-bao">${esc(ai.lyDo)}</div></section>`;
    } else {
      const lech = Math.abs((ai.tongDiem || 0) - luat.tongDiem);
      html += '<section class="card">';

      /* Lệch nhiều là tín hiệu "đừng tin máy" — phải hiện, không được gập */
      if (lech >= 3) {
        html += `<div class="canh-bao lech"><b>Hai lớp chấm lệch nhau ${lech} điểm</b>
          (AI ${ai.tongDiem}/12, luật cứng ${luat.tongDiem}/12).
          Đây là lead bạn nên tự đọc lại, đừng tin máy hoàn toàn.</div>`;
      }
      if (ai.tinNhanGoiY) {
        html += `<div class="viec"><b>Tin nhắn gợi ý gửi tiếp</b>${esc(ai.tinNhanGoiY)}
          <button type="button" class="link hn-chep" data-chep="${esc(ai.tinNhanGoiY)}">Chép tin nhắn</button></div>`;
      }

      html += `<details class="cham-ct">
        <summary>Lớp AI đối chiếu — ${ai.tongDiem}/12${lech >= 3 ? '' : `, lệch ${lech} điểm so với luật cứng`}</summary>
        <div class="ct-than">
        <table><thead><tr><th>Điểm</th><th>Tiêu chí và căn cứ</th></tr></thead><tbody>` +
        (ai.tieuChi || []).map((x) => `<tr>
          <td class="d">${Number(x.diem) || 0}/3</td>
          <td><b>${esc(x.ma)}</b><br><span style="color:#6b6862">${esc(x.canCu)}</span></td></tr>`).join('') +
        `</tbody></table>`;
      if (ai.diemMuChinh) {
        html += `<div class="canh-bao"><b>Điểm dễ bỏ sót:</b> ${esc(ai.diemMuChinh)}</div>`;
      }
      html += `</div></details></section>`;
    }
  }

  khu.innerHTML = html;

  /* Nút chép: sale đang vội, đừng bắt họ bôi đen bằng tay */
  khu.querySelectorAll('[data-chep]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.chep);
        const cu = b.textContent;
        b.textContent = 'Đã chép';
        setTimeout(() => { b.textContent = cu; }, 1500);
      } catch {
        b.textContent = 'Trình duyệt không cho chép — bôi đen rồi copy tay';
      }
    });
  });

  khu.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function dong(nhan, giaTri) {
  if (giaTri === '' || giaTri == null || (Array.isArray(giaTri) && !giaTri.length)) {
    return `<tr><td class="nhan">${esc(nhan)}</td><td class="trong">— chưa có trong hội thoại</td></tr>`;
  }
  const v = Array.isArray(giaTri) ? giaTri.join(' · ') : giaTri;
  return `<tr><td class="nhan">${esc(nhan)}</td><td>${esc(v)}</td></tr>`;
}

function veThongTinChanDung() {
  const c = chanDungHienTai;
  if (!c) return;

  let html = `<table class="cd">
    ${dong('Nhu cầu', c.nhuCau)}
    ${dong('Loại căn', c.loaiCan)}
    ${dong('Diện tích', c.dienTich)}
    ${dong('Ngân sách khách', c.nganSach)}
    ${dong('Tài chính', c.taiChinh)}
    ${dong('Người quyết', c.nguoiQuyet)}
    ${dong('Lý do mua', c.lyDoMua)}
    ${dong('Mốc thời gian', c.mocThoiGian)}
    ${dong('Đã đi xem nơi khác', c.daDiXem ? 'Rồi' : '')}
    ${dong('Đang quan tâm', c.quanTam)}
  </table>`;

  if (c.vuongMac.length) {
    html += `<div class="canh-bao"><b>Còn thiếu / cần lưu ý</b><ul class="gon">` +
      c.vuongMac.map((v) => `<li>${esc(v)}</li>`).join('') + '</ul></div>';
  }
  if (c.cauNenHoi.length) {
    html += `<div class="viec"><b>Câu nên hỏi tiếp để lấp chỗ trống</b><ul class="gon">` +
      c.cauNenHoi.map((v) => `<li>${esc(v)}</li>`).join('') + '</ul></div>';
  }
  if (c.tinNhanGoiY) {
    html += `<div class="viec"><b>Tin nhắn AI gợi ý gửi tiếp</b>${esc(c.tinNhanGoiY)}</div>`;
  }

  $('chanDungThongTin').innerHTML = html;
}

function veFormLuu() {
  $('chanDungLuu').innerHTML = `
    <div class="cd-form">
      <div class="row">
        <label>Đặt tên để sau này tìm lại
          <input type="text" id="cdTen" maxlength="60" placeholder="VD: Anh Tuấn 2PN Vinhomes">
        </label>
        <label>Nguồn lead
          <select id="cdNguon">
            <option value="">— chọn —</option>
            ${NGUON_LEAD.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('')}
          </select>
        </label>
      </div>
      <label class="rong">Ghi chú riêng của bạn
        <input type="text" id="cdGhiChu" maxlength="200" placeholder="Điều máy không đọc được: giọng nói, thái độ, hẹn gì…">
      </label>
      <div class="hanh-dong">
        <button type="button" id="cdLuu" class="chinh">Lưu hồ sơ khách</button>
        <span class="bao" id="cdBao"></span>
      </div>
    </div>`;

  $('cdLuu').addEventListener('click', () => {
    if (!chanDungHienTai) return;
    const hoSo = {
      ...chanDungHienTai,
      ten: $('cdTen').value.trim(),
      nguon: $('cdNguon').value,
      ghiChu: $('cdGhiChu').value.trim()
    };
    const daLuu = kho.luu(hoSo);
    const bao = $('cdBao');
    if (daLuu) {
      chanDungHienTai = daLuu;   // giữ id để bấm lần nữa là cập nhật, không tạo bản trùng
      bao.innerHTML = 'Đã lưu. <button type="button" class="link" data-man="hoso">Xem hồ sơ đã lưu</button>';
      bao.className = 'bao ok';
      ghi('luu_ho_so', { phan_loai: hoSo.phanLoai, tu_ca_mau: dangDungCaMau });
      capNhatDem();
      noiCacNutChuyenMan();
    } else {
      bao.textContent = 'Trình duyệt không cho lưu (cửa sổ ẩn danh hoặc bộ nhớ đầy). Bấm Xuất JSON để giữ dữ liệu.';
      bao.className = 'bao loi';
    }
  });
}

function dungChanDung(sach, luat, ai, coTay) {
  if (!luat.duLieuDu) { $('khuChanDung').hidden = true; chanDungHienTai = null; return; }
  chanDungHienTai = trichChanDung(sach, luat, ai, coTay);
  $('khuChanDung').hidden = false;
  veThongTinChanDung();
  veFormLuu();
}

function capNhatPhanAI(ai) {
  if (!chanDungHienTai || !ai || ai.aiTat) return;
  chanDungHienTai.tinNhanGoiY = ai.tinNhanGoiY || '';
  chanDungHienTai.diemMuChinh = ai.diemMuChinh || '';
  chanDungHienTai.diemAI = ai.tongDiem ?? null;
  veThongTinChanDung();   // form giữ nguyên, không xoá chữ người dùng đang gõ
}

/* ─────────── Màn hồ sơ đã lưu ─────────── */

function capNhatDem() {
  $('demHoSo').textContent = kho.demHoSo();
}

function veDanhSach() {
  const tuKhoa = $('oTimKiem').value;
  const ds = kho.xepUuTien(kho.timKiem(kho.danhSach(), tuKhoa));
  const khu = $('dsHoSo');

  /* Dải thống kê: liếc một cái biết đang ôm bao nhiêu khách nóng */
  const toanBo = kho.danhSach();
  const dem = { nong: 0, am: 0, lanh: 0, sau: 0, ao: 0 };
  for (const x of toanBo) dem[slugLoai(x.phanLoai)]++;
  const NHAN = { nong: 'Nóng', am: 'Ấm', lanh: 'Lạnh', sau: 'Lạnh sâu', ao: 'Ảo' };
  $('thongKe').innerHTML = toanBo.length
    ? Object.entries(dem).filter(([, n]) => n > 0)
        .map(([k, n]) => `<span class="tk tk-${k}"><b>${n}</b> ${NHAN[k]}</span>`).join('')
    : '';
  $('thongKe').hidden = !toanBo.length;

  if (!ds.length) {
    khu.innerHTML = kho.demHoSo() === 0
      ? '<p class="trong-bang">Chưa có hồ sơ nào. Chấm một hội thoại ở tab <b>Chấm lead</b> rồi bấm <b>Lưu hồ sơ khách</b>.</p>'
      : '<p class="trong-bang">Không có hồ sơ nào khớp từ khoá này.</p>';
    return;
  }

  khu.innerHTML = ds.map((x) => `
    <article class="hs hs-${slugLoai(x.phanLoai)}">
      <div class="hs-dau">
        <span class="huy ${esc(x.phanLoai)}">${esc(x.phanLoai)}</span>
        <b class="hs-ten">${esc(x.ten || 'Khách chưa đặt tên')}</b>
        <span class="hs-diem">${x.diem}/12</span>
        <button type="button" class="link" data-chep="${esc(x.id)}">Chép</button>
        <button type="button" class="link do" data-xoa="${esc(x.id)}">Xoá</button>
      </div>
      <div class="hs-than">
        ${[x.nhuCau, x.loaiCan, x.nganSach, x.mocThoiGian, x.nguon]
          .filter((v) => v && v !== 'Chưa rõ').map((v) => `<span class="vien-nho">${esc(v)}</span>`).join('')}
      </div>
      ${x.ghiChu ? `<p class="hs-ghi">${esc(x.ghiChu)}</p>` : ''}
      ${x.vuongMac && x.vuongMac.length ? `<p class="hs-thieu">Còn thiếu: ${esc(x.vuongMac.join(' · '))}</p>` : ''}
      <p class="hs-ngay">Chấm lúc ${new Date(x.lanChamCuoi).toLocaleString('vi-VN')}</p>
    </article>`).join('');

  khu.querySelectorAll('[data-chep]').forEach((b) => {
    b.addEventListener('click', async () => {
      const hs = kho.danhSach().find((x) => x.id === b.dataset.chep);
      if (!hs) return;
      try {
        await navigator.clipboard.writeText(thanhVanBan(hs));
        b.textContent = 'Đã chép';
        setTimeout(() => { b.textContent = 'Chép'; }, 1600);
      } catch {
        b.textContent = 'Không chép được';
      }
    });
  });

  khu.querySelectorAll('[data-xoa]').forEach((b) => {
    b.addEventListener('click', () => {
      kho.xoa(b.dataset.xoa);
      capNhatDem();
      veDanhSach();
    });
  });
}

function chuyenMan(ten) {
  $('manCham').hidden = ten !== 'cham';
  $('manHoSo').hidden = ten !== 'hoso';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.man === ten));
  if (ten === 'hoso') veDanhSach();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function noiCacNutChuyenMan() {
  document.querySelectorAll('[data-man]').forEach((b) => {
    if (b.dataset.daNoi) return;
    b.dataset.daNoi = '1';
    b.addEventListener('click', () => chuyenMan(b.dataset.man));
  });
}

$('oTimKiem').addEventListener('input', veDanhSach);

/* Xoá tất cả — xác nhận hai bước ngay trên nút, không dùng hộp thoại trình duyệt
   vì hộp thoại hay bị bấm nhầm theo phản xạ. */
let choXacNhanXoa = null;
$('xoaTatCa').addEventListener('click', () => {
  const b = $('xoaTatCa');
  if (!kho.demHoSo()) { b.textContent = 'Chưa có hồ sơ nào'; setTimeout(() => { b.textContent = 'Xoá tất cả'; }, 1600); return; }
  if (!choXacNhanXoa) {
    b.textContent = `Bấm lần nữa để xoá ${kho.demHoSo()} hồ sơ`;
    choXacNhanXoa = setTimeout(() => { b.textContent = 'Xoá tất cả'; choXacNhanXoa = null; }, 4000);
    return;
  }
  clearTimeout(choXacNhanXoa);
  choXacNhanXoa = null;
  kho.xoaTatCa();
  b.textContent = 'Xoá tất cả';
  capNhatDem();
  veDanhSach();
});

$('xuatJSON').addEventListener('click', () => {
  const blob = new Blob([kho.xuatJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ho-so-khach-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

noiCacNutChuyenMan();
capNhatDem();

/**
 * Đổi hồ sơ thành văn bản thuần để dán sang CRM của sàn, Excel, hay sổ tay.
 * Chủ ý không đối đầu với CRM có sẵn: sản phẩm này NẠP DỮ LIỆU cho cái tủ
 * người ta đang dùng, chứ không đòi thay cái tủ đó.
 */
function thanhVanBan(x) {
  const d = [];
  const them = (nhan, v) => { if (v && v !== 'Chưa rõ') d.push(`${nhan}: ${Array.isArray(v) ? v.join(', ') : v}`); };
  them('Khách', x.ten || 'chưa đặt tên');
  them('Xếp loại', `${x.phanLoai} (${x.diem}/12)`);
  them('Nguồn', x.nguon);
  them('Nhu cầu', x.nhuCau);
  them('Loại căn', x.loaiCan);
  them('Diện tích', x.dienTich);
  them('Ngân sách', x.nganSach);
  them('Tài chính', x.taiChinh);
  them('Người quyết', x.nguoiQuyet);
  them('Lý do mua', x.lyDoMua);
  them('Mốc thời gian', x.mocThoiGian);
  them('Đã đi xem nơi khác', x.daDiXem ? 'Rồi' : '');
  them('Đang quan tâm', x.quanTam);
  them('Còn thiếu', x.vuongMac);
  them('Nên hỏi tiếp', x.cauNenHoi);
  them('Ghi chú', x.ghiChu);
  them('Chấm lúc', new Date(x.lanChamCuoi).toLocaleString('vi-VN'));
  return d.join('\n');
}
