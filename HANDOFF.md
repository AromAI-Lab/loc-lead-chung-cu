# Bàn giao dự án — Lọc lead chung cư

*Cập nhật 14/09/2026 · Đọc file này khi mở phiên Claude mới, đừng hỏi lại từ đầu*

> Quy trình làm bài tập Campus nằm ở skill `build-to-own-campus`, không nhắc lại ở đây.
> File này chỉ giữ **trạng thái, quyết định và việc còn lại**.

## 1. Một phút bối cảnh

Sản phẩm: **tool AI chấm điểm và lọc lead ảo** cho **sale căn hộ chung cư** HN/HCM, bán trực tiếp cho sale cá nhân (không qua sàn). Làm trong khuôn khổ cohort **Build to Own**, Demo Day **20/09/2026**.

| | |
|---|---|
| Chạy thật | https://loc-lead-chung-cu.vercel.app |
| Mã nguồn | https://github.com/AromAI-Lab/loc-lead-chung-cu (công khai) |
| Trên máy | `~/Downloads/loc-lead-chung-cu` |
| Hosting | Vercel, team AROMAI, gói Hobby |
| Thanh toán | Polar — tổ chức "AromAI Lab", **đã được duyệt** 10/09 |
| Tên miền | `huongai.com` — đã mua, **chưa trỏ được**, đang 401, chờ nhà cung cấp |

## 2. Trạng thái Campus

**75/105 điểm (71%)** tính tới 14/09/2026. Bài Buổi 0 tới Buổi 6 đã nộp đủ, đủ điểm cả 9 bài.

| Bài còn trống | Hạn | Điểm |
|---|---|---|
| **Demo Day · video 90–120 giây** | **23:59 ngày 15/09** | 0/10 |
| Buổi 7 · Đưa ra cho người lạ dùng thật | 20:00 ngày 17/09 | 0/10 |
| Buổi 8 · Một agent làm thay một việc lặp lại | 20:00 ngày 20/09 | 0/10 |

Video Pre-Demo Day là **vòng loại**: chỉ 10 người được thuyết trình live ngày 20/09.
Ba phần bắt buộc: (1) vấn đề 15–20 giây, (2) demo share màn hình — phần dài nhất,
(3) thực chứng: đã có ai dùng thật chưa, phản hồi ra sao.

Buổi 7 và Buổi 8 đã **đổi chỗ** cho nhau từ 06/09: Buổi 7 là Ra mắt và phân phối,
Buổi 8 là Đội agent tự vận hành. Bản ghi Buổi 7 (13/09) tới 14/09 vẫn chưa lên Campus.

Ô "$10 credit Kyma" trên trang Tiến độ vẫn không có nút lấy mã — lỗi phía Campus,
không chặn việc gì vì đã có khoá Anthropic riêng.

## 3. Sản phẩm — quyết định thiết kế cốt lõi

### Hai trục, không phải một thang điểm

"Ảo" **không phải** là "điểm thấp". Môi giới đối thủ giả làm khách có thể trả lời trơn tru và đạt điểm cao; khách thật mới tìm hiểu thì điểm thấp nhưng đáng nuôi 3–6 tháng. Gộp hai thứ vào một thang là ném đi lead thật và giữ lại lead ảo.

- **Trục 1** — tiềm năng, 0–12 điểm, 4 tiêu chí (tài chính, quyền quyết định, nhu cầu thực, thời điểm)
- **Trục 2** — cờ Ảo, đếm độc lập

Cờ **A1** (môi giới dò giá) và **A7** (lừa đảo) là *cờ quyết định*: một cờ đủ kết luận Ảo bất kể điểm. A2–A6 là tình huống, cần hai cờ.

Bộ tiêu chí đầy đủ: `docs/scoring-criteria.md`

### Hai lớp chấm, lớp dưới không phụ thuộc lớp trên

- **Lớp luật cứng** chạy trong trình duyệt, không mạng, không khoá. Lưới an toàn khi mất mạng hoặc hết hạn mức.
- **Lớp AI** chấm lại độc lập, gợi ý tin nhắn gửi tiếp.
- Lệch từ 3 điểm trở lên thì sản phẩm **nói thẳng là nên tự đọc lại**.

### Ba nguyên tắc đã cài vào sản phẩm

1. **Tách lời khách khỏi lời sale** trước khi chấm (tiền tố `K:` / `S:`). Không tách được thì tự hạ độ tin cậy và nói rõ.
2. **Hội thoại dưới 25 từ → từ chối chấm**, trả về 3 câu nên hỏi trước. Thà nói "chưa đủ dữ liệu" còn hơn chấm bừa.
3. **Ẩn danh hoá hai lần** — lần một trong trình duyệt (người dùng xem được), lần hai ở máy chủ. Không lưu hội thoại gốc.

### Minh bạch dữ liệu (thêm 15/09)

Sản phẩm có **hai luồng dữ liệu**, và phải nói tách bạch, đừng gộp:

| Luồng | Có rời khỏi máy sale không |
|---|---|
| **Hồ sơ đã lưu** (localStorage) | ❌ Không bao giờ. Lớp AI chỉ nhận hội thoại đã che, không nhận hồ sơ |
| **Lớp AI** (`/api/score`) | ✅ Có — hội thoại **đã ẩn danh hoá** đi tới API Anthropic |

Toàn bộ front-end chỉ có **đúng một lời gọi mạng**: `POST /api/score`.
Không analytics, không pixel, không script bên thứ ba. Kiểm chứng lại bằng
`grep -rn "fetch(" public/` trước mỗi lần đổi lớn.

Giao diện nói thẳng: dữ liệu đã che đi tới đâu, không dùng huấn luyện mô hình, tự xoá trong
30 ngày, và bỏ tick *Chấm thêm bằng AI* thì không gì rời khỏi máy.

**Câu được phép nói với khách:** *"Hồ sơ khách nằm trong trình duyệt trên máy anh/chị."*
**Câu KHÔNG được nói:** *"Dữ liệu không đi đâu cả."* — sai, và dễ vỡ trận khi có người hỏi kỹ.

#### Vì sao giao diện KHÔNG nhắc thời hạn lưu 30 ngày

Bản 15/09 có ghi "tự xoá trong vòng 30 ngày". Đã **bỏ khỏi giao diện** vì nó phản tác dụng:
đọc lên thành "vậy là có lưu 30 ngày", trong khi mối lo thật của sale là *"danh sách khách
của tôi có bị lấy mất không"* — mà với dữ liệu đã che thì câu trả lời là không.

Thay bằng **ví dụ trước/sau** cho thấy đúng thứ rời khỏi máy: một đoạn chat nói về căn hộ,
không có số điện thoại, không có tên, không có gì để liên lạc lại với khách.

**Đây là chuyện trình bày, KHÔNG phải chuyện giấu.** Không trang bán hàng nào có nghĩa vụ
liệt kê mọi điều khoản lưu trữ của bên thứ ba; nhưng nói sai thì không được.

**Sự thật để trả lời khi có người hỏi thẳng** (giữ ở đây để luôn sẵn câu):
API Anthropic không dùng dữ liệu để huấn luyện mô hình (mặc định), và **tự xoá đầu vào lẫn
đầu ra trong vòng 30 ngày** kể từ khi nhận, theo chính sách lưu trữ dành cho khách hàng
thương mại. Nguồn: privacy.claude.com, mục "How long do you store my organization's data".

**Câu trả lời mẫu:** *"Bên xử lý giữ tối đa 30 ngày rồi tự xoá, và không dùng để huấn luyện
mô hình. Nhưng điều đáng nói hơn là thứ gửi sang đó đã bị bỏ mất số điện thoại, tên và email
rồi — kể cả có ai đọc được thì cũng không liên lạc được với khách của anh/chị. Không yên tâm
thì bỏ tick Chấm thêm bằng AI, công cụ vẫn chạy đủ."*

Nếu sau này cần nói "không lưu lại gì cả" cho đúng, phải xin **Zero Data Retention** với
Anthropic — là điều khoản hợp đồng riêng, phải liên hệ họ, chưa làm.

### Chân dung khách và kho hồ sơ (thêm 14/09)

`public/lib/profile.js` biến hội thoại đã ẩn danh hoá thành bản ghi có cấu trúc:
nhu cầu, loại căn, diện tích, ngân sách, tài chính, người quyết, lý do mua, mốc thời gian,
đã đi xem chưa, đang quan tâm gì — cộng **chỗ còn thiếu** và **câu nên hỏi tiếp**.

Phần "câu nên hỏi tiếp" suy thẳng từ tiêu chí dưới 2 điểm: mỗi ô trống có đúng một câu
lấp được nó. Đây là phần biến bản ghi quá khứ thành việc làm tiếp.

`public/lib/store.js` lưu trong `localStorage` của trình duyệt sale.
Chọn trình duyệt thay vì máy chủ vì hai lý do: không cần đăng ký (đúng ràng buộc
"chạy chỉ với một đường link"), và dữ liệu khách không rời máy sale nên sản phẩm không
trở thành bên xử lý dữ liệu cá nhân tập trung.

Đánh đổi đã biết, có nói thẳng trên giao diện: xoá dữ liệu duyệt web là mất hồ sơ
(có nút Xuất JSON để sao lưu), và không đồng bộ giữa máy tính với điện thoại.

**Hai bất biến được kiểm thử tự động:**
1. Chân dung không bao giờ chứa lại câu nào của hội thoại gốc.
2. Danh sách trắng `DANH_SACH_TRUONG` của kho phủ hết mọi trường chân dung sinh ra —
   thiếu một trường là mất dữ liệu âm thầm lúc lưu.

### Kiểm thử

`npm test` — 59 phép, 6 ca thật (Nóng, Ấm, mới tìm hiểu, môi giới dò giá, lừa đảo, quá ngắn), cộng phần chân dung và kho hồ sơ. Chạy trước mỗi lần push.

## 4. Định vị và giá — đã sửa lại ngày 14/09, ĐỌC KỸ TRƯỚC KHI RESEARCH LẠI

### ICP cũ đã SAI ở một chỗ quan trọng

Bản 11/09 ghi *"sale tự chạy ads 10–20 triệu/tháng"*. **Con số này không thực tế.**
Thực tế: sale chủ yếu ăn theo quảng cáo và marketing của công ty hoặc chủ đầu tư;
tự chạy bài trên trang cá nhân cùng lắm 2–3 triệu/tháng theo ngân sách Facebook đề xuất.

Hệ quả dây chuyền:
- Sale **không sở hữu Fanpage, không sở hữu tài khoản ads** → đóng vĩnh viễn mọi đường
  lấy hội thoại qua API (Meta Page Conversations API cần Page access token).
- Lead là của công ty rót xuống, không phải tài sản của sale.
- Sale cạnh tranh nhau bằng **chất lượng chăm sóc**, không phải số lượng lead.

### Vì sao KHÔNG có đường tự động hoá nào cho Zalo cá nhân

| Kênh | API đọc hội thoại | Đọc được lịch sử | Chi phí |
|---|---|---|---|
| Zalo OA | Có, chính thức | Có | **Chỉ mở từ gói Tăng trưởng 2,5tr/năm ≈ 208k/tháng** — đắt gần bằng giá bán |
| Zalo cá nhân | Không có | **Không** (zca-js chỉ nghe tin nhắn mới) | 0đ nhưng **nguy cơ khoá tài khoản khách** |
| FB Page | Có, miễn phí | Có | Vô dụng ở đây vì sale không có Page |

**Quyết định: không nhúng thư viện Zalo không chính thức vào sản phẩm.** Được ít, mất nhiều:
không lấy được tồn đọng mà vẫn gánh rủi ro khoá tài khoản cho chính người trả tiền.
Đường còn lại cho bản sau: **tiện ích Chrome đọc Zalo Web** (chỉ đọc, không gửi) — ZChat,
Zalo CRM, ZaX đang sống bằng đúng cơ chế đó, và **không cái nào chấm điểm lead**.

### Công cụ nằm ở phút thứ 10, không phải phút 0 (phát hiện 15/09)

Data sàn phát xuống cho sale **nhiều khi chỉ là số điện thoại trần**. Nghĩa là phễu thật:

```
Sàn phát N số điện thoại
  → sale gọi hoặc nhắn TRƯỚC
    → chỉ một phần chịu trả lời      ← hội thoại mới bắt đầu ở đây
      → lúc này mới dán vào tool được
```

Ba hệ quả:

1. **Khối lượng dán nhỏ hơn khối lượng lead rất nhiều.** 200 số nhưng chỉ vài chục hội thoại.
   Nỗi lo "dán 200 lần thì ai làm" nhẹ hơn nhiều so với hình dung ban đầu.
2. **Tool không giúp được khâu đau nhất của sale mới**: 200 số, gọi ai trước.
   Và **đừng cố chấm số điện thoại trần** — một dãy số không mang tín hiệu ý định nào.
   Bán "AI chấm điểm từ danh sách SĐT" là bán thuốc giả. Chỉ chấm được khi data có thêm cột
   (nguồn, dự án đã đăng ký, câu hỏi để lại) — phải hỏi sale mới biết.
3. **Phải tách hai luồng lead, USP "lead Ảo" chỉ đúng với một luồng:**

| | Outbound — data sàn phát | Inbound — khách tự nhắn |
|---|---|---|
| Ai mở lời trước | Sale | Khách, từ bài đăng hoặc ads |
| "Ảo" nghĩa là gì | Số sai, không nghe máy | **Môi giới dò giá, spam, lừa đảo** |
| Chấm được khi nào | Chỉ sau khi khách chịu trả lời | Ngay từ tin nhắn đầu |
| Ai ở luồng này | Sale mới, ăn data sàn | **Sale tự chủ 2–5 năm, tự đăng bài** |

→ **Sản phẩm mạnh ở luồng INBOUND.** Chốt ICP về tệp sale tự chủ, không phải sale mới ăn data sàn.

### Luật đang bẻ luồng outbound — và nó đứng về phía sản phẩm này

- **Nghị định 91/2020:** gọi hoặc nhắn quảng cáo khi chưa được người nhận đồng ý → phạt 5–10 triệu;
  gọi vào số trong Danh sách không quảng cáo → 80–100 triệu. Cá nhân bằng một nửa.
- **Luật Bảo vệ dữ liệu cá nhân (91/2025/QH15), hiệu lực 01/01/2026:** mua bán dữ liệu cá nhân
  phạt tới **10 lần khoản thu**, khung tối thiểu 3 tỷ; vi phạm khác tới 3 tỷ; cá nhân giảm 50%.

Sale được phỏng vấn 14/09 tự nói: *"hạn chế gọi data vì hiện tại luật quy định khá khắt khe
đối với các cuộc gọi spam"*. Đây không phải cảm giác của một người — đây là khung phạt.

**Luồng outbound đang teo dần vì luật, luồng inbound sẽ chiếm tỷ trọng ngày càng lớn.**
Đó đúng là luồng sản phẩm này phục vụ. Không phải may mắn — là xu hướng cấu trúc.

### Bản đồ ba tầng người dùng

| Tầng | Nỗi đau | Tiền | Cần |
|---|---|---|---|
| Sale mới 0–12 tháng | Được phát data lạnh, chạy đua trước khi hết lương cứng 4 tháng | Ít, **đau nhất** | Lọc lead |
| Sale tự chủ 2–5 năm | Vừa tự chạy nguồn vừa chăm khách, không giữ nổi ngữ cảnh | Có | **Lọc + chân dung khách** |
| TPKD / GĐKD / chủ sàn | Trí nhớ khách hàng đi theo sale nghỉ việc, vì nó nằm trong Zalo cá nhân của họ | Nhiều nhất | Chân dung + báo cáo đội |

Bằng chứng thị trường: một tin tuyển của MICC Group tuyển 20 GĐKD + 30 TPKD + **200 CVKD**
một đợt, lương cứng 8,5tr **chỉ 4 tháng**, "hỗ trợ marketing tới 100%", "cung cấp data khách hàng net".

### Định vị mới — KHÔNG bán "chỗ lưu", bán "khỏi phải gõ"

Phỏng vấn một sale lâu năm (đang làm chủ sàn) ngày 14/09: việc duy nhất bạn ấy tự nêu ra
là cần tối ưu hơn — **"lưu thông tin data khách hàng đã từng chăm sóc/giao dịch"**.
Việc tốn thời gian nhất là chăm sóc và xử lý tình huống, không phải tìm khách.

Nhưng **Meey CRM** (ra mắt 07/2021) đã làm đúng việc lưu hồ sơ khách cho môi giới, và
**hoàn toàn miễn phí**. Khảo sát của chính Meey Land: 97% môi giới vẫn dùng sổ tay hoặc
Excel, 50% thường xuyên quên thông tin khách, 40% lỡ hẹn.

> **Một CRM miễn phí có thương hiệu mà 97% vẫn dùng sổ tay — nghĩa là bức tường không
> phải chỗ lưu, mà là công đoạn GÕ TAY.**

Nên câu khẳng định của sản phẩm là: **"máy điền hồ sơ khách — từ hội thoại Zalo, trong 5 giây"**,
không phải "nơi lưu hồ sơ khách". Meey là cái tủ; sản phẩm này là người bỏ hồ sơ vào tủ.
Vì thế mỗi hồ sơ có nút **Chép** ra văn bản thuần để dán sang CRM sàn đang dùng —
cố ý không đối đầu với CRM có sẵn.

**NEXME** (nexme.com.vn, hệ thống MICC trang bị cho sale) là trợ lý AI tra **quỹ căn,
tài liệu, chính sách** — dữ liệu SẢN PHẨM. Bổ trợ, không cạnh tranh: nó không biết gì về
người đang nhắn tin với sale.

### Hàng rào cạnh tranh — mỏng, phải biết

Chỉ gồm ba thứ: (1) tốc độ ra trước, (2) chuyên sâu chung cư + phát hiện lead Ảo,
(3) đọc được Zalo tiếng Việt viết tắt. Meey có vốn và có thể thêm trích xuất AI bất cứ lúc nào.
Đủ cho 6–12 tháng, không phải lâu đài.

**Giá:** niêm yết **249k/tháng**, gói 3 tháng 599k, free 30 lead đầu. Trên Polar đang đặt
243.000đ (quy từ $9). Giữ nguyên, **và đừng chốt giá trước khi phỏng vấn thêm sale**.
Neo giá trị bằng **phút gõ tiết kiệm được** (3–5 phút/khách × 40 khách), không bằng "chỗ lưu".

**USP giữ lại:** máy tự điền hồ sơ từ hội thoại · phát hiện lead Ảo · tiêu chí riêng chung cư VN · không cần OA/CRM/cài đặt
**USP bị loại:** "chấm Nóng/Ấm/Lạnh" (trùng ~80% Roof AI) · "nơi lưu hồ sơ khách" (Meey CRM làm miễn phí rồi)

## 5. Hai đường thu tiền — phân vai rõ

| | Dùng cho | Trạng thái |
|---|---|---|
| **VietQR + SePay** | Khách Việt Nam, sale trả 249k/tháng | Đã dựng, webhook SePay chưa chạy thử |
| **Polar** | Khách quốc tế, sản phẩm số bán ra nước ngoài | Đã duyệt, đã nối Stripe Express về BIDV |

Polar tính USD qua thẻ quốc tế — sale Việt Nam quét VietQR thuận tiện hơn nhiều. **Đừng chuyển khách Việt sang Polar.**

Trên Polar đã có: sản phẩm subscription theo tháng ($9) + một checkout link no-code.

## 6. Việc còn lại, theo thứ tự đòn bẩy

1. **Nộp video Pre-Demo Day trước 23:59 ngày 15/09** — vòng loại, không nộp là tự loại.
   Kịch bản 120 giây nằm ở `docs/kich-ban-video-demo-day.md`.
2. **Phỏng vấn thêm 3–4 sale, chia theo thâm niên** — *vẫn là việc quan trọng nhất*.
   Mới có 1 mẫu, và người đó là **chủ sàn**, không đại diện cho sale tuyến đầu.
   Cần ít nhất 1 sale mới vào nghề (<1 năm) và 1 sale 2–3 năm để đối chứng.
   Bộ câu hỏi hiện tại còn thiếu hai câu quyết định:
   *"Kể lần gần nhất việc đó làm anh/chị mất một khách"* (đo cường độ đau) và
   *"Anh/chị đã bỏ tiền cho công cụ nào chưa, bao nhiêu"* (đo khả năng chi trả).
3. **Bài Buổi 7 — "Đưa ra cho người lạ dùng thật", hạn 20:00 ngày 17/09.**
   Dùng lại chính dữ liệu 3–5 sale đã cho dùng thử. Một việc, hai bài.
4. **Chế độ "Chưa nhắn gì cả"** — lấp lỗ hổng phút 0 mà không bịa.
   Tool không chấm được số điện thoại trần, nhưng giúp được ở chỗ khác: **nhắn gì để khách
   trả lời, và trả lời ra đúng thứ cần chấm**. Sản phẩm đã có sẵn 80%: hội thoại dưới 25 từ
   đã trả về 3 câu nên hỏi, và chân dung đã sinh `cauNenHoi` từ tiêu chí dưới 2 điểm.
   Chỉ thiếu một cửa vào: nhập tên/dự án/nguồn → trả ra tin nhắn mở đầu + 3 câu cần cài.
   Khép kín vòng: mở đầu → khách trả lời → dán → chấm + hồ sơ → câu hỏi tiếp.
5. **Hiệu chuẩn ngưỡng 9/6/3** bằng 30 lead đã biết kết quả. Ngưỡng hiện tại là suy luận.
6. **Bài Buổi 8 — một agent làm thay một việc lặp lại, hạn 20:00 ngày 20/09.**
7. **Ghép thanh toán vào sản phẩm.** Hàng rào = free 30 lead.
8. **Trỏ tên miền `huongai.com`** về Vercel. Đang vướng 401.

## 7. Hạn chế đã biết của sản phẩm

| Hạn chế | Hướng xử lý |
|---|---|
| Ngưỡng 9/6/3 chưa hiệu chuẩn | Chấm thử 30 lead đã biết kết quả |
| Cờ A4, A5, A6 phải sale tự tick | Bản sau đọc từ lịch sử cuộc gọi |
| Chưa phân biệt phân khúc (2 tỷ vs 15 tỷ) | Bản sau: chọn phân khúc trước khi chấm |
| Chỉ nhận văn bản dán, chưa nhận ảnh chụp | Bản sau |
| Cảnh báo "hai lớp lệch nhau" hiện cả khi hai lớp cùng kết luận Ảo | Chỉ nên hiện khi *phân loại* khác nhau |
| `ANTHROPIC_API_KEY` trên Vercel chỉ có ở Production | Thêm Preview trước Buổi 7 |
| Hồ sơ chỉ nằm trên một máy, xoá dữ liệu duyệt web là mất | Có nút Xuất JSON; bản sau làm tài khoản để đồng bộ |
| Bộ ẩn danh hoá chạy theo mẫu chữ: tên riêng không đi kèm xưng hô ("Tuấn nói…") còn sót | Đã nói thẳng trên giao diện + nhắc người dùng soát bản sạch. Bản sau cân nhắc lớp nhận diện tên tốt hơn, nhưng không được nuốt tên dự án vì đó là căn cứ chấm |
| Ô Đặt tên và Ghi chú riêng không đi qua bộ che | Đã ghi rõ trên màn Hồ sơ. Dữ liệu vẫn nằm trên máy người dùng, không gửi đi |
| Vẫn phải dán tay từng hội thoại | Bản sau: tiện ích Chrome đọc Zalo Web (chỉ đọc), hoặc nhận ảnh chụp màn hình |
| Chân dung chưa đọc được tên dự án và khu vực | Cần danh mục dự án để đối chiếu, chưa có |
