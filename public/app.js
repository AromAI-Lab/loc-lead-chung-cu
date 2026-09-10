import { anDanhHoa, tongSoDaChe } from '/lib/anonymize.js';
import { chamDiem } from '/lib/criteria.js';
import { HOI_THOAI_MAU } from '/lib/samples.js';

const $ = (id) => document.getElementById(id);
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
  });
});

$('chay').addEventListener('click', chay);

async function chay() {
  const tho = $('hoiThoai').value.trim();
  if (!tho) { $('hoiThoai').focus(); return; }

  const nut = $('chay');
  nut.disabled = true;
  nut.textContent = 'Đang chấm…';

  try {
    /* Bước 1 — ẩn danh hoá NGAY TRÊN MÁY, trước khi có bất kỳ yêu cầu mạng nào */
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
    const luat = chamDiem(sach, coTay);
    hienKetQua(luat, null);

    /* Bước 3 — lớp AI, chỉ khi người dùng bật */
    if ($('dungAI').checked && luat.duLieuDu) {
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
    }
  } finally {
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

  let html = `<section class="card">
    <h2>Kết quả — lớp luật cứng</h2>
    <div class="dong-diem">
      <span class="huy ${esc(luat.phanLoai)}">${esc(luat.phanLoai)}</span>
      <span class="so-diem">${luat.tongDiem}<span>/12 điểm tiềm năng</span></span>
    </div>
    <p class="ly-do">${esc(luat.lyDoPhanLoai)} · Độ tin cậy: <b>${esc(luat.doTinCay)}</b></p>
    <table><thead><tr><th>Điểm</th><th>Tiêu chí và căn cứ</th></tr></thead>
    <tbody>${hangTieuChi(luat.tieuChi)}</tbody></table>`;

  if (luat.ghiChuTinCay) {
    html += `<div class="canh-bao">${esc(luat.ghiChuTinCay)}</div>`;
  }

  if (luat.coAo.length) {
    html += `<div class="co-ao"><h3>Cờ Ảo — ${luat.coAo.length} cờ</h3>` +
      luat.coAo.map((c) => `<div class="co-item">
        <span class="co-ma">${esc(c.ma)} · ${esc(c.ten)}</span>${c.quyetDinh ? ' <b>(cờ quyết định)</b>' : ''}
        <br>${esc(c.canCu)}
        <br><span class="co-xu-ly">→ ${esc(c.xuLy)}</span>
      </div>`).join('') + '</div>';
  }

  html += `<div class="viec"><b>Việc làm ngay</b>${esc(luat.hanhDong.viec)}
    <div class="tg">Nhóm này nên chiếm ${esc(luat.hanhDong.thoiGian)}.</div></div>`;
  html += '</section>';

  /* Lớp AI */
  if (ai) {
    if (ai.aiTat) {
      html += `<section class="card"><h2>Lớp AI</h2>
        <div class="canh-bao">${esc(ai.lyDo)}</div></section>`;
    } else {
      const lech = Math.abs((ai.tongDiem || 0) - luat.tongDiem);
      html += `<section class="card">
        <h2>Lớp AI — đối chiếu</h2>
        <div class="dong-diem"><span class="so-diem">${ai.tongDiem}<span>/12 theo AI</span></span>
        <span style="color:#6b6862">luật cứng chấm ${luat.tongDiem}/12</span></div>
        <table><thead><tr><th>Điểm</th><th>Tiêu chí và căn cứ</th></tr></thead><tbody>` +
        (ai.tieuChi || []).map((x) => `<tr>
          <td class="d">${Number(x.diem) || 0}/3</td>
          <td><b>${esc(x.ma)}</b><br><span style="color:#6b6862">${esc(x.canCu)}</span></td></tr>`).join('') +
        `</tbody></table>`;

      if (lech >= 3) {
        html += `<div class="canh-bao lech"><b>Hai lớp lệch nhau ${lech} điểm.</b>
          Đây là lead bạn nên tự đọc lại, đừng tin máy hoàn toàn.</div>`;
      }
      if (ai.diemMuChinh) {
        html += `<div class="canh-bao"><b>Điểm dễ bỏ sót:</b> ${esc(ai.diemMuChinh)}</div>`;
      }
      if (ai.tinNhanGoiY) {
        html += `<div class="viec"><b>Tin nhắn gợi ý gửi tiếp</b>${esc(ai.tinNhanGoiY)}</div>`;
      }
      html += '</section>';
    }
  }

  khu.innerHTML = html;
  khu.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
