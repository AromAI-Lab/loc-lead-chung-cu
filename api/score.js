/**
 * Hàm serverless chấm điểm bằng AI — lớp 2.
 *
 * ĐÂY LÀ NƠI DUY NHẤT KHOÁ API ĐƯỢC ĐỌC.
 * Khoá nằm trong biến môi trường của hosting (process.env), không nằm trong
 * mã nguồn, không lên GitHub, và không bao giờ đi xuống trình duyệt người dùng.
 * Trình duyệt chỉ gọi tới /api/score và nhận về kết quả đã xử lý.
 *
 * Hai lớp bảo vệ dữ liệu cá nhân:
 *   1. Trình duyệt ẩn danh hoá trước khi gửi (người dùng nhìn thấy được).
 *   2. Máy chủ ẩn danh hoá LẠI (không tin vào trình duyệt).
 * Không ghi log nội dung hội thoại ở bất kỳ đâu.
 */

import { anDanhHoa } from '../public/lib/anonymize.js';

const GIOI_HAN_KY_TU = 8000;

const HUONG_DAN = `Bạn là chuyên gia sàng lọc lead cho sale căn hộ chung cư tại Việt Nam.

Chấm hội thoại theo ĐÚNG bộ tiêu chí sau, không tự nghĩ thêm tiêu chí.

TRỤC 1 — bốn tiêu chí, mỗi tiêu chí 0–3 điểm:
T1 Tài chính: 3 = có con số vốn tự có VÀ nhắc tới lãi thả nổi/sau ưu đãi hoặc đã thẩm định vay. 2 = có con số vốn hoặc tỷ lệ vay. 1 = nhắc vay/tiền nhưng mơ hồ. 0 = không đả động tới tiền.
T2 Quyền quyết định: 3 = tự quyết hoặc đã thống nhất trong nhà. 2 = nêu được người cùng quyết nhưng chưa thống nhất. 1 = không rõ. 0 = hỏi hộ người khác.
T3 Nhu cầu thực: 3 = hỏi từ 2 chi tiết cụ thể trở lên (thông thuỷ/tim tường, phí quản lý, hướng, tầng, chỗ ô tô, bàn giao, sổ hồng) VÀ nêu lý do mua. 2 = hỏi chi tiết cụ thể nhưng thiếu một trong hai. 1 = mới một tín hiệu. 0 = chỉ hỏi chung chung.
T4 Thời điểm và đã đi xem: 3 = đã xem dự án khác VÀ có mốc thời gian cụ thể. 2 = một trong hai. 1 = chưa có gì rõ. 0 = nói thẳng chưa định mua trong 6–12 tháng.

TRỤC 2 — cờ Ảo, độc lập với điểm:
A1 nghi môi giới đối thủ dò giá (hỏi chiết khấu, hoa hồng, bảng hàng, rổ hàng, gửi khách) — CỜ QUYẾT ĐỊNH
A7 dấu hiệu lừa đảo hoặc spam — CỜ QUYẾT ĐỊNH
A2 ngân sách lệch quá xa mà không nhắc vay
A3 chỉ hỏi giá lặp lại, né mọi câu hỏi ngược

NGUYÊN TẮC QUAN TRỌNG NHẤT: "Ảo" KHÔNG phải là "điểm thấp".
Khách thật mới bắt đầu tìm hiểu thì điểm thấp nhưng KHÔNG phải Ảo — họ đáng nuôi.
Chỉ gắn cờ Ảo khi có bằng chứng người này không phải người mua.

Hội thoại đã được ẩn danh hoá: [TÊN], [SỐ ĐIỆN THOẠI], [EMAIL] là nhãn thay thế, không phải nội dung thật.

Chỉ trả về JSON đúng cấu trúc sau, không kèm chữ nào khác, không bọc trong dấu nháy ba:
{"tieuChi":[{"ma":"T1","diem":0,"canCu":"..."},{"ma":"T2","diem":0,"canCu":"..."},{"ma":"T3","diem":0,"canCu":"..."},{"ma":"T4","diem":0,"canCu":"..."}],"coAo":[{"ma":"A1","ten":"...","canCu":"..."}],"tinNhanGoiY":"một tin nhắn Zalo tự nhiên sale nên gửi tiếp, tối đa 2 câu","diemMuChinh":"điều quan trọng nhất sale dễ bỏ sót trong hội thoại này, 1 câu"}

"canCu" phải TRÍCH lại chi tiết có thật trong hội thoại, không được suy diễn.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ loi: 'Chỉ nhận POST' });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  const batAI = process.env.AI_ENABLED !== 'false';

  if (!key || !batAI) {
    // Không phải lỗi: sản phẩm vẫn chạy bằng lớp luật cứng ở trình duyệt.
    return res.status(200).json({
      aiTat: true,
      lyDo: !key
        ? 'Máy chủ chưa cấu hình khoá API. Kết quả hiện tại đến từ lớp luật cứng.'
        : 'Lớp AI đang được tắt chủ động. Kết quả hiện tại đến từ lớp luật cứng.'
    });
  }

  try {
    // Vercel tự phân tích thân yêu cầu JSON, nhưng không phải môi trường nào
    // cũng làm vậy — nhận cả hai dạng để không phụ thuộc vào nền tảng.
    let than = req.body;
    if (typeof than === 'string') {
      try { than = JSON.parse(than); } catch { than = {}; }
    }
    const { hoiThoai } = than || {};
    if (typeof hoiThoai !== 'string' || hoiThoai.trim().length < 30) {
      return res.status(400).json({ loi: 'Hội thoại quá ngắn hoặc không hợp lệ.' });
    }

    // Lớp ẩn danh hoá thứ hai. Không tin vào trình duyệt.
    const { ketQua: sach } = anDanhHoa(hoiThoai.slice(0, GIOI_HAN_KY_TU));

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.SCORING_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        temperature: 0,
        system: HUONG_DAN,
        messages: [{ role: 'user', content: `Hội thoại cần chấm:\n\n${sach}` }]
      })
    });

    if (!r.ok) {
      const chiTiet = await r.text();
      // Không trả nguyên văn lỗi của nhà cung cấp xuống trình duyệt.
      console.error('Lỗi gọi mô hình:', r.status, chiTiet.slice(0, 300));
      return res.status(200).json({
        aiTat: true,
        lyDo:
          r.status === 401
            ? 'Khoá API không hợp lệ hoặc đã bị thu hồi. Kết quả hiện tại đến từ lớp luật cứng.'
            : r.status === 429
            ? 'Đã chạm hạn mức gọi API. Kết quả hiện tại đến từ lớp luật cứng.'
            : 'Không gọi được mô hình AI. Kết quả hiện tại đến từ lớp luật cứng.'
      });
    }

    const data = await r.json();
    const vanBan = (data.content || []).map((c) => c.text || '').join('').trim();

    let ketQua;
    try {
      const khop = vanBan.match(/\{[\s\S]*\}/);
      ketQua = JSON.parse(khop ? khop[0] : vanBan);
    } catch {
      return res.status(200).json({
        aiTat: true,
        lyDo: 'Mô hình trả về định dạng không đọc được. Kết quả hiện tại đến từ lớp luật cứng.'
      });
    }

    const tong = (ketQua.tieuChi || []).reduce((s, x) => s + (Number(x.diem) || 0), 0);

    return res.status(200).json({
      aiTat: false,
      tieuChi: ketQua.tieuChi || [],
      coAo: ketQua.coAo || [],
      tongDiem: tong,
      tinNhanGoiY: ketQua.tinNhanGoiY || '',
      diemMuChinh: ketQua.diemMuChinh || '',
      soTokenDaDung: data.usage || null
    });
  } catch (e) {
    console.error('Lỗi máy chủ:', e && e.message);
    return res.status(200).json({
      aiTat: true,
      lyDo: 'Máy chủ gặp sự cố khi gọi AI. Kết quả hiện tại đến từ lớp luật cứng.'
    });
  }
}
